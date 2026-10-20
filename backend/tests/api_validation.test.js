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

describe('Backend Request Payload Validation (Bypassing Frontend)', () => {
  test('rejects registration with invalid email or missing name', () => {
    const invalidPayload = {
      name: '',
      email: 'not-an-email',
      password: 'short',
      role: 'influencer'
    }

    assert.throws(() => validateFullName(invalidPayload.name, 'Full name'), /is required/)
    assert.throws(() => validateEmail(invalidPayload.email), /valid email address/)
    assert.throws(() => validatePassword(invalidPayload.password), /at least 8 characters long/)
  })

  test('rejects registration with invalid Indian phone number', () => {
    const payloads = [
      { phone: '12345' },
      { phone: '5987654321' },
      { phone: '9876543210123' },
      { phone: '0000000000' }
    ]

    for (const p of payloads) {
      assert.throws(() => validateIndianPhone(p.phone), (err) => err.code === 'VALIDATION_ERROR')
    }
  })

  test('rejects registration with inappropriate characters or emojis in name', () => {
    assert.throws(() => validateFullName('John 🚀 Doe'), /cannot contain emojis/)
    assert.throws(() => validateFullName('User <script>'), /contains invalid characters/)
    assert.throws(() => validateFullName('User1234'), /cannot contain numbers/)
  })

  test('validates influencer profile payload fields safely', () => {
    // Valid influencer profile
    const validProfile = {
      niche: 'Fashion & Apparel',
      bio: 'Fashion creator from Mumbai',
      followersCount: 25000,
      engagementRate: 4.5,
      reelPrice: 15000,
      instagramUrl: 'https://instagram.com/fashionista'
    }

    assert.strictEqual(validateBoundedText(validProfile.niche, 'Niche', { max: 100 }), 'Fashion & Apparel')
    assert.strictEqual(validateBoundedText(validProfile.bio, 'Bio', { max: 1000 }), 'Fashion creator from Mumbai')
    assert.strictEqual(validateInteger(validProfile.followersCount, 'Followers count', { min: 0 }), 25000)
    assert.strictEqual(validateUrl(validProfile.instagramUrl, 'Instagram URL'), 'https://instagram.com/fashionista')

    // Invalid follower count (negative)
    assert.throws(() => validateInteger(-50, 'Followers count', { min: 0 }), /cannot be less than 0/)

    // Bio exceeding limit
    assert.throws(() => validateBoundedText('x'.repeat(1001), 'Bio', { max: 1000 }), /cannot exceed 1000 characters/)
  })

  test('validates campaign advertisement payload fields safely', () => {
    const validCampaign = {
      title: 'Summer Fashion Ambassador Campaign',
      description: 'Looking for 5 fashion creators to showcase our summer collection in aesthetic reels.',
      platform: 'Instagram',
      budgetRange: '₹20,000–₹40,000',
      targetFollowersMin: 5000,
      status: 'active'
    }

    assert.strictEqual(validateBoundedText(validCampaign.title, 'Title', { min: 3, max: 200, required: true }), 'Summer Fashion Ambassador Campaign')
    assert.strictEqual(validateBoundedText(validCampaign.description, 'Description', { min: 10, max: 5000, required: true }), validCampaign.description)
    assert.strictEqual(validateEnum(validCampaign.status, 'Status', ['active', 'paused', 'closed', 'draft']), 'active')
    assert.strictEqual(validateInteger(validCampaign.targetFollowersMin, 'Target followers', { min: 0 }), 5000)

    // Campaign with title too short
    assert.throws(() => validateBoundedText('Hi', 'Title', { min: 3, max: 200, required: true }), /at least 3 characters/)

    // Invalid status enum
    assert.throws(() => validateEnum('unknown_status', 'Status', ['active', 'paused', 'closed', 'draft']), /Invalid Status/)
  })

  test('validates pincode boundaries strictly', () => {
    assert.strictEqual(validatePincode('560001'), '560001')
    assert.throws(() => validatePincode('060001'), /cannot start with 0/)
    assert.throws(() => validatePincode('abc123'), /valid 6-digit Indian postal PIN code/)
  })
})
