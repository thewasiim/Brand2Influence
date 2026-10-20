/**
 * Brand2Influence Frontend Form Validation Utilities
 */

const UNICODE_PERSON_NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} .,'\-–—]*[\p{L}\p{M}.]$/u
const BRAND_NAME_REGEX = /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9 .,&'\-–—/()_@+]*[\p{L}\p{M}0-9.]$/u
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/
const PINCODE_REGEX = /^[1-9]\d{5}$/
const USERNAME_REGEX = /^[a-z0-9_]+$/

const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'root', 'support', 'help', 'brandhub', 'brand2influence',
  'system', 'null', 'undefined', 'anonymous', 'moderator', 'official', 'api', 'auth',
  'login', 'signup', 'dashboard', 'settings', 'profile', 'explore', 'feed'
])

const DUMMY_PHONES = new Set([
  '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
  '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
  '9876543210', '1234567890'
])

// 1. Full Name / Brand Name Validation
export function validateFullName(name, isBrand = false, fieldLabel = '') {
  const label = fieldLabel || (isBrand ? 'Brand name' : 'Full name')
  if (!name || !String(name).trim()) {
    return { isValid: false, error: `${label} is required` }
  }

  const trimmed = String(name).trim().replace(/\s+/g, ' ')

  if (trimmed.length < 2) {
    return { isValid: false, error: `${label} must be at least 2 characters` }
  }
  if (trimmed.length > 60) {
    return { isValid: false, error: `${label} cannot exceed 60 characters` }
  }

  if (EMOJI_REGEX.test(trimmed)) {
    return { isValid: false, error: `${label} cannot contain emojis` }
  }

  if (/[<>{}\[\]\\]/.test(trimmed)) {
    return { isValid: false, error: `${label} contains invalid characters` }
  }

  if (isBrand) {
    if (!BRAND_NAME_REGEX.test(trimmed)) {
      return { isValid: false, error: `${label} contains invalid special characters` }
    }
  } else {
    if (/\d/.test(trimmed)) {
      return { isValid: false, error: `${label} cannot contain numbers` }
    }
    if (!UNICODE_PERSON_NAME_REGEX.test(trimmed)) {
      return { isValid: false, error: `${label} can only contain letters, spaces, hyphens, and apostrophes` }
    }
  }

  return { isValid: true, error: '', value: trimmed }
}

// 2. Email Validation
export function validateEmail(email, fieldLabel = 'Email address') {
  if (!email || !String(email).trim()) {
    return { isValid: false, error: `${fieldLabel} is required` }
  }

  const trimmed = String(email).trim().toLowerCase()

  if (trimmed.length > 254) {
    return { isValid: false, error: `${fieldLabel} cannot exceed 254 characters` }
  }

  const atParts = trimmed.split('@')
  if (atParts.length !== 2 || !atParts[0] || !atParts[1]) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com)' }
  }

  const [localPart, domainPart] = atParts
  if (localPart.length > 64) {
    return { isValid: false, error: 'Email username cannot exceed 64 characters' }
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.includes('..')) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  const domainParts = domainPart.split('.')
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { isValid: false, error: 'Email domain must have a valid extension (e.g. .com, .in)' }
  }

  if (!RFC_EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com)' }
  }

  return { isValid: true, error: '', value: trimmed }
}

// 3. Indian Phone Formatting & Validation
export function formatPhoneInput(rawVal) {
  // Strip non-digits and cap at 10 digits
  return String(rawVal || '').replace(/\D/g, '').slice(0, 10)
}

export function validatePhone(phone, fieldLabel = 'Mobile number', required = true) {
  if (!phone || !String(phone).trim()) {
    if (!required) return { isValid: true, error: '', value: '' }
    return { isValid: false, error: `${fieldLabel} is required` }
  }

  let cleanDigits = String(phone).trim().replace(/\D/g, '')
  if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    cleanDigits = cleanDigits.slice(2)
  } else if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) {
    cleanDigits = cleanDigits.slice(1)
  }

  if (cleanDigits.length !== 10) {
    return { isValid: false, error: 'Mobile number must be exactly 10 digits' }
  }

  if (!INDIAN_PHONE_REGEX.test(cleanDigits)) {
    return { isValid: false, error: 'Indian mobile numbers must start with 6, 7, 8, or 9' }
  }

  if (DUMMY_PHONES.has(cleanDigits)) {
    return { isValid: false, error: 'Please enter a genuine, active mobile phone number' }
  }

  return { isValid: true, error: '', value: cleanDigits }
}

// 4. Password Validation & Strength
export function validatePassword(password, fieldLabel = 'Password') {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: `${fieldLabel} is required`, score: 0, label: 'Empty', color: 'transparent' }
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  let label = 'Weak'
  let color = '#EF4444'
  if (score >= 4) {
    label = 'Strong'
    color = '#10B981'
  } else if (score >= 2) {
    label = 'Medium'
    color = '#F59E0B'
  }

  if (password.length < 8) {
    return { isValid: false, error: `${fieldLabel} must be at least 8 characters`, score, label, color }
  }
  if (password.length > 128) {
    return { isValid: false, error: `${fieldLabel} cannot exceed 128 characters`, score, label, color }
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, error: `${fieldLabel} must contain at least one letter`, score, label, color }
  }

  if (!/\d/.test(password) && !/[^a-zA-Z0-9]/.test(password)) {
    return { isValid: false, error: `${fieldLabel} must contain at least one number or symbol`, score, label, color }
  }

  return { isValid: true, error: '', score, label, color, value: password }
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' }
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' }
  }
  return { isValid: true, error: '' }
}

// 5. Username Formatting & Validation
export function formatUsernameInput(rawVal) {
  return String(rawVal || '')
    .replace(/^@/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30)
}

export function validateUsername(username, fieldLabel = 'Username') {
  if (!username || !String(username).trim()) {
    return { isValid: false, error: `${fieldLabel} is required` }
  }

  const clean = formatUsernameInput(username)

  if (clean.length < 3) {
    return { isValid: false, error: `${fieldLabel} must be at least 3 characters` }
  }
  if (clean.length > 30) {
    return { isValid: false, error: `${fieldLabel} cannot exceed 30 characters` }
  }

  if (/^\d+$/.test(clean)) {
    return { isValid: false, error: `${fieldLabel} cannot be purely numeric` }
  }

  if (!USERNAME_REGEX.test(clean)) {
    return { isValid: false, error: `${fieldLabel} can only contain lowercase letters, numbers, and underscores` }
  }

  if (clean.startsWith('_') || clean.endsWith('_')) {
    return { isValid: false, error: `${fieldLabel} cannot start or end with an underscore` }
  }
  if (clean.includes('__')) {
    return { isValid: false, error: `${fieldLabel} cannot contain consecutive underscores` }
  }

  if (RESERVED_USERNAMES.has(clean)) {
    return { isValid: false, error: `Username "@${clean}" is reserved. Please pick another.` }
  }

  return { isValid: true, error: '', value: clean }
}

// 6. Pincode Formatting & Validation
export function formatPincodeInput(rawVal) {
  return String(rawVal || '').replace(/\D/g, '').slice(0, 6)
}

export function validatePincode(pincode, fieldLabel = 'Pincode', required = false) {
  if (!pincode || !String(pincode).trim()) {
    if (!required) return { isValid: true, error: '', value: '' }
    return { isValid: false, error: `${fieldLabel} is required` }
  }

  const clean = formatPincodeInput(pincode)

  if (!PINCODE_REGEX.test(clean)) {
    return { isValid: false, error: 'Please enter a valid 6-digit Indian postal PIN code' }
  }

  return { isValid: true, error: '', value: clean }
}

// 7. URL Validation
export function validateUrl(url, fieldLabel = 'URL', required = false) {
  if (!url || !String(url).trim()) {
    if (!required) return { isValid: true, error: '', value: '' }
    return { isValid: false, error: `${fieldLabel} is required` }
  }

  const trimmed = String(url).trim()
  let toTest = trimmed
  if (!/^https?:\/\//i.test(trimmed)) {
    toTest = `https://${trimmed}`
  }

  try {
    const parsed = new URL(toTest)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, error: 'URL must start with http:// or https://' }
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { isValid: false, error: `Please enter a valid ${fieldLabel.toLowerCase()} (e.g. https://example.com)` }
    }
    return { isValid: true, error: '', value: toTest }
  } catch {
    return { isValid: false, error: `Please enter a valid ${fieldLabel.toLowerCase()} (e.g. https://example.com)` }
  }
}
