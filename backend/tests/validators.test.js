import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  validateFullName,
  validateEmail,
  validateIndianPhone,
  validatePassword,
  validateUsername,
  validatePincode,
  validateUrl,
  validateBoundedText,
  validateInteger,
  validateEnum,
  validateDate,
  validateOtp
} from '../src/utils/validators.js'

describe('1. Full Name Validation', () => {
  test('accepts valid person names with letters, spaces, hyphens, and apostrophes', () => {
    assert.strictEqual(validateFullName('Aarav Sharma'), 'Aarav Sharma')
    assert.strictEqual(validateFullName("Mary-Jane O'Connor"), "Mary-Jane O'Connor")
    assert.strictEqual(validateFullName('Renée Dupont'), 'Renée Dupont')
    assert.strictEqual(validateFullName('Dr. Kabir Sen'), 'Dr. Kabir Sen')
    assert.strictEqual(validateFullName('पूजा पटेल'), 'पूजा पटेल')
  })

  test('trims leading and trailing whitespace', () => {
    assert.strictEqual(validateFullName('   Rohan Roy   '), 'Rohan Roy')
  })

  test('rejects names with numbers', () => {
    assert.throws(() => validateFullName('John2'), /cannot contain numbers/)
    assert.throws(() => validateFullName('Alex 123'), /cannot contain numbers/)
  })

  test('rejects names with emojis', () => {
    assert.throws(() => validateFullName('Aarav 😊'), /cannot contain emojis/)
    assert.throws(() => validateFullName('🔥 Star'), /cannot contain emojis/)
  })

  test('rejects names with HTML/script injection or symbols', () => {
    assert.throws(() => validateFullName('<script>alert(1)</script>'), /contains invalid characters/)
    assert.throws(() => validateFullName('John @ Doe'), /can only contain letters/)
    assert.throws(() => validateFullName('Pooja #1'), /cannot contain numbers/)
  })

  test('enforces boundary lengths (2 to 60 chars)', () => {
    assert.throws(() => validateFullName('A'), /at least 2 characters/)
    assert.throws(() => validateFullName(''), /is required/)
    assert.throws(() => validateFullName('   '), /is required/)
    assert.throws(() => validateFullName('a'.repeat(61)), /cannot exceed 60 characters/)
    assert.strictEqual(validateFullName('Al'), 'Al')
    assert.strictEqual(validateFullName('a'.repeat(60)), 'a'.repeat(60))
  })

  test('validates brand names properly when isBrand is true', () => {
    assert.strictEqual(validateFullName('Blue Tokai Coffee Roasters', 'Brand Name', { isBrand: true }), 'Blue Tokai Coffee Roasters')
    assert.strictEqual(validateFullName("Ben & Jerry's", 'Brand Name', { isBrand: true }), "Ben & Jerry's")
    assert.strictEqual(validateFullName('Studio 360', 'Brand Name', { isBrand: true }), 'Studio 360')
    assert.throws(() => validateFullName('Studio 🚀', 'Brand Name', { isBrand: true }), /cannot contain emojis/)
  })
})

describe('2. Email Validation', () => {
  test('accepts valid email addresses and normalizes to lowercase', () => {
    assert.strictEqual(validateEmail('User@Example.COM'), 'user@example.com')
    assert.strictEqual(validateEmail('first.last@brand2influence.com'), 'first.last@brand2influence.com')
    assert.strictEqual(validateEmail('alex+tag@sub.domain.org'), 'alex+tag@sub.domain.org')
  })

  test('rejects malformed email formats', () => {
    assert.throws(() => validateEmail('plainaddress'), /valid email address/)
    assert.throws(() => validateEmail('@missingusername.com'), /valid email address/)
    assert.throws(() => validateEmail('missingdomain@'), /valid email address/)
    assert.throws(() => validateEmail('missing.tld@domain'), /valid.*email|top-level domain/)
    assert.throws(() => validateEmail('user..name@domain.com'), /valid email address/)
    assert.throws(() => validateEmail('user@domain..com'), /valid email address/)
    assert.throws(() => validateEmail('user name@domain.com'), /valid email address/)
  })

  test('rejects empty or whitespace email', () => {
    assert.throws(() => validateEmail(''), /Email is required/)
    assert.throws(() => validateEmail('   '), /Email is required/)
  })

  test('enforces email length limits', () => {
    assert.throws(() => validateEmail('a'.repeat(250) + '@example.com'), /cannot exceed 254 characters/)
  })
})

describe('3. Indian Phone Number Validation', () => {
  test('accepts genuine 10-digit Indian numbers starting with 6, 7, 8, 9', () => {
    assert.strictEqual(validateIndianPhone('9876543211'), '9876543211')
    assert.strictEqual(validateIndianPhone('8123456789'), '8123456789')
    assert.strictEqual(validateIndianPhone('7001234567'), '7001234567')
    assert.strictEqual(validateIndianPhone('6201234567'), '6201234567')
  })

  test('normalizes numbers with country code prefix +91 or 91 or leading 0', () => {
    assert.strictEqual(validateIndianPhone('+91 98765 43211'), '9876543211')
    assert.strictEqual(validateIndianPhone('919876543211'), '9876543211')
    assert.strictEqual(validateIndianPhone('09876543211'), '9876543211')
  })

  test('rejects invalid numbers starting with 0-5', () => {
    assert.throws(() => validateIndianPhone('5876543210'), /must start with 6, 7, 8, or 9/)
    assert.throws(() => validateIndianPhone('1876543210'), /must start with 6, 7, 8, or 9/)
  })

  test('rejects numbers with length other than 10 digits', () => {
    assert.throws(() => validateIndianPhone('987654321'), /must be exactly 10 digits/)
    assert.throws(() => validateIndianPhone('987654321000'), /must be exactly 10 digits/)
  })

  test('rejects obvious dummy/repeated numbers', () => {
    assert.throws(() => validateIndianPhone('9999999999'), /genuine, valid 10-digit/)
    assert.throws(() => validateIndianPhone('1234567890'), /must start with 6, 7, 8, or 9/)
  })
})

describe('4. Password & Confirm Password Validation', () => {
  test('accepts strong passwords (>= 8 chars with letters and numbers/special chars)', () => {
    assert.strictEqual(validatePassword('SuperPass123'), 'SuperPass123')
    assert.strictEqual(validatePassword('Strong#P@ss2026'), 'Strong#P@ss2026')
  })

  test('verifies confirmPassword matches password strictly', () => {
    assert.strictEqual(validatePassword('SuperPass123', 'SuperPass123'), 'SuperPass123')
    assert.throws(() => validatePassword('SuperPass123', 'Different123'), /Passwords do not match/)
    assert.throws(() => validatePassword('SuperPass123', ''), /confirm your password/)
  })

  test('rejects passwords shorter than 8 characters', () => {
    assert.throws(() => validatePassword('Short1'), /at least 8 characters long/)
  })

  test('rejects passwords without letters or numbers', () => {
    assert.throws(() => validatePassword('1234567890'), /must contain at least one letter/)
    assert.throws(() => validatePassword('abcdefghijk'), /must contain at least one number or special character/)
  })
})

describe('5. Username Validation', () => {
  test('accepts valid usernames', () => {
    assert.strictEqual(validateUsername('alex_morgan'), 'alex_morgan')
    assert.strictEqual(validateUsername('@aurastudio'), 'aurastudio')
    assert.strictEqual(validateUsername('creator_99'), 'creator_99')
  })

  test('rejects reserved, purely numeric, or invalid formatted usernames', () => {
    assert.throws(() => validateUsername('admin'), /reserved/)
    assert.throws(() => validateUsername('123456'), /cannot be purely numeric/)
    assert.throws(() => validateUsername('ab'), /at least 3 characters/)
    assert.throws(() => validateUsername('_user'), /cannot start or end with an underscore/)
    assert.throws(() => validateUsername('user__name'), /cannot contain consecutive underscores/)
    assert.throws(() => validateUsername('user-name'), /can only contain lowercase letters, numbers, and underscores/)
  })
})

describe('6. Pincode Validation', () => {
  test('accepts valid 6-digit Indian PIN codes', () => {
    assert.strictEqual(validatePincode('110001'), '110001')
    assert.strictEqual(validatePincode('400050'), '400050')
  })

  test('rejects invalid PIN codes', () => {
    assert.throws(() => validatePincode('012345'), /valid 6-digit Indian postal PIN code/)
    assert.throws(() => validatePincode('12345'), /valid 6-digit Indian postal PIN code/)
    assert.throws(() => validatePincode('1234567'), /valid 6-digit Indian postal PIN code/)
  })
})

describe('7. URL Validation', () => {
  test('accepts valid URLs and normalizes missing protocol to https', () => {
    assert.strictEqual(validateUrl('https://instagram.com/alex'), 'https://instagram.com/alex')
    assert.strictEqual(validateUrl('bluetokaicoffee.com'), 'https://bluetokaicoffee.com')
  })

  test('rejects invalid or unsafe URLs', () => {
    assert.throws(() => validateUrl('javascript:alert(1)'), /valid url/)
    assert.throws(() => validateUrl('not a valid url'), /valid url/)
  })
})

describe('8. OTP Validation', () => {
  test('accepts 6 numeric digits', () => {
    assert.strictEqual(validateOtp('123456'), '123456')
  })

  test('rejects non-6-digit or non-numeric OTP', () => {
    assert.throws(() => validateOtp('12345'), /exactly 6 numeric digits/)
    assert.throws(() => validateOtp('1234567'), /exactly 6 numeric digits/)
    assert.throws(() => validateOtp('12a456'), /exactly 6 numeric digits/)
  })
})
