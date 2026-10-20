import { ApiError } from './api-error.js'

/**
 * Brand2Influence Comprehensive Production-Grade Validation Utilities
 */

// 1. FULL NAME VALIDATION
// Allowed: Letters (Unicode supported), spaces, hyphens, apostrophes, optional periods for titles/initials.
// Disallowed: Numbers, emojis, HTML/script tags, symbols (@, #, $, %, etc.).
// Length: 2 to 60 characters.
const UNICODE_PERSON_NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} .,'\-–—]*[\p{L}\p{M}.]$/u
const BRAND_NAME_REGEX = /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9 .,&'\-–—/()_@+]*[\p{L}\p{M}0-9.]$/u
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u

export function validateFullName(name, fieldName = 'Full Name', { minLength = 2, maxLength = 60, isBrand = false } = {}) {
  if (name === undefined || name === null || String(name).trim() === '') {
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  const trimmed = String(name).trim().replace(/\s+/g, ' ')

  if (trimmed.length < minLength) {
    throw new ApiError(400, `${fieldName} must be at least ${minLength} characters`, 'VALIDATION_ERROR')
  }
  if (trimmed.length > maxLength) {
    throw new ApiError(400, `${fieldName} cannot exceed ${maxLength} characters`, 'VALIDATION_ERROR')
  }

  // Reject emojis in names and company names
  if (EMOJI_REGEX.test(trimmed)) {
    throw new ApiError(400, `${fieldName} cannot contain emojis`, 'VALIDATION_ERROR')
  }

  // Reject HTML / script injection characters
  if (/[<>{}\[\]\\]/.test(trimmed)) {
    throw new ApiError(400, `${fieldName} contains invalid characters`, 'VALIDATION_ERROR')
  }

  if (isBrand) {
    // Brand / Business Name: allows letters, numbers, spaces, &, ., -, ', @, +, etc.
    if (!BRAND_NAME_REGEX.test(trimmed)) {
      throw new ApiError(400, `${fieldName} contains invalid special characters`, 'VALIDATION_ERROR')
    }
  } else {
    // Person Name: strictly letters, spaces, hyphens, apostrophes, periods (no numbers, no symbols)
    if (/\d/.test(trimmed)) {
      throw new ApiError(400, `${fieldName} cannot contain numbers`, 'VALIDATION_ERROR')
    }
    if (!UNICODE_PERSON_NAME_REGEX.test(trimmed)) {
      throw new ApiError(400, `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`, 'VALIDATION_ERROR')
    }
  }

  return trimmed
}

// 2. EMAIL VALIDATION
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export function validateEmail(email, fieldName = 'Email') {
  if (email === undefined || email === null || String(email).trim() === '') {
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  const trimmed = String(email).trim().toLowerCase()

  if (trimmed.length > 254) {
    throw new ApiError(400, `${fieldName} cannot exceed 254 characters`, 'VALIDATION_ERROR')
  }

  const atParts = trimmed.split('@')
  if (atParts.length !== 2) {
    throw new ApiError(400, `Please provide a valid ${fieldName.toLowerCase()} address`, 'VALIDATION_ERROR')
  }

  const [localPart, domainPart] = atParts
  if (!localPart || !domainPart) {
    throw new ApiError(400, `Please provide a valid ${fieldName.toLowerCase()} address`, 'VALIDATION_ERROR')
  }
  if (localPart.length > 64) {
    throw new ApiError(400, `${fieldName} local part cannot exceed 64 characters`, 'VALIDATION_ERROR')
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    throw new ApiError(400, `Please provide a valid ${fieldName.toLowerCase()} address`, 'VALIDATION_ERROR')
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.includes('..')) {
    throw new ApiError(400, `Please provide a valid ${fieldName.toLowerCase()} address`, 'VALIDATION_ERROR')
  }

  const domainParts = domainPart.split('.')
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    throw new ApiError(400, `${fieldName} domain must have a valid top-level domain extension`, 'VALIDATION_ERROR')
  }

  if (!RFC_EMAIL_REGEX.test(trimmed)) {
    throw new ApiError(400, `Please provide a valid ${fieldName.toLowerCase()} address (e.g. name@domain.com)`, 'VALIDATION_ERROR')
  }

  return trimmed
}

// 3. INDIAN PHONE NUMBER VALIDATION
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/
const DUMMY_PHONES = new Set([
  '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
  '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
  '9876543210', '1234567890'
])

export function validateIndianPhone(phone, fieldName = 'Mobile phone number', { required = true } = {}) {
  if (phone === undefined || phone === null || String(phone).trim() === '') {
    if (!required) return null
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  let cleanDigits = String(phone).trim().replace(/\D/g, '')
  if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    cleanDigits = cleanDigits.slice(2)
  } else if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) {
    cleanDigits = cleanDigits.slice(1)
  }

  if (cleanDigits.length !== 10) {
    throw new ApiError(400, `${fieldName} must be exactly 10 digits for Indian mobile numbers`, 'VALIDATION_ERROR')
  }

  if (!INDIAN_PHONE_REGEX.test(cleanDigits)) {
    throw new ApiError(400, `${fieldName} must start with 6, 7, 8, or 9`, 'VALIDATION_ERROR')
  }

  if (DUMMY_PHONES.has(cleanDigits)) {
    throw new ApiError(400, `Please provide a genuine, valid 10-digit ${fieldName.toLowerCase()}`, 'VALIDATION_ERROR')
  }

  return cleanDigits
}

// 4. PASSWORD VALIDATION
export function validatePassword(password, confirmPassword = null, fieldName = 'Password') {
  if (password === undefined || password === null || typeof password !== 'string') {
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  if (password.length < 8) {
    throw new ApiError(400, `${fieldName} must be at least 8 characters long`, 'VALIDATION_ERROR')
  }
  if (password.length > 128) {
    throw new ApiError(400, `${fieldName} cannot exceed 128 characters`, 'VALIDATION_ERROR')
  }

  const hasLetter = /[a-zA-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  if (!hasLetter) {
    throw new ApiError(400, `${fieldName} must contain at least one letter`, 'VALIDATION_ERROR')
  }

  if (!hasDigit && !hasSpecial) {
    throw new ApiError(400, `${fieldName} must contain at least one number or special character`, 'VALIDATION_ERROR')
  }

  if (confirmPassword !== null) {
    if (confirmPassword === undefined || confirmPassword === null || typeof confirmPassword !== 'string' || confirmPassword.trim() === '') {
      throw new ApiError(400, 'Please confirm your password', 'VALIDATION_ERROR')
    }
    if (password !== confirmPassword) {
      throw new ApiError(400, 'Passwords do not match', 'VALIDATION_ERROR')
    }
  }

  return password
}

// 5. USERNAME VALIDATION
const USERNAME_REGEX = /^[a-z0-9_]+$/
const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'root', 'support', 'help', 'brandhub', 'brand2influence',
  'system', 'null', 'undefined', 'anonymous', 'moderator', 'official', 'api', 'auth',
  'login', 'signup', 'dashboard', 'settings', 'profile', 'explore', 'feed'
])

export function validateUsername(username, fieldName = 'Username') {
  if (username === undefined || username === null || String(username).trim() === '') {
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  const clean = String(username)
    .replace(/^@/, '')
    .toLowerCase()
    .trim()

  if (clean.length < 3) {
    throw new ApiError(400, `${fieldName} must be at least 3 characters`, 'VALIDATION_ERROR')
  }
  if (clean.length > 30) {
    throw new ApiError(400, `${fieldName} cannot exceed 30 characters`, 'VALIDATION_ERROR')
  }

  if (/^\d+$/.test(clean)) {
    throw new ApiError(400, `${fieldName} cannot be purely numeric`, 'VALIDATION_ERROR')
  }

  if (!USERNAME_REGEX.test(clean)) {
    throw new ApiError(400, `${fieldName} can only contain lowercase letters, numbers, and underscores`, 'VALIDATION_ERROR')
  }

  if (clean.startsWith('_') || clean.endsWith('_')) {
    throw new ApiError(400, `${fieldName} cannot start or end with an underscore`, 'VALIDATION_ERROR')
  }
  if (clean.includes('__')) {
    throw new ApiError(400, `${fieldName} cannot contain consecutive underscores`, 'VALIDATION_ERROR')
  }

  if (RESERVED_USERNAMES.has(clean)) {
    throw new ApiError(400, `${fieldName} "@${clean}" is reserved. Please choose another username.`, 'VALIDATION_ERROR')
  }

  return clean
}

// 6. PINCODE VALIDATION (Indian 6-digit postal code)
const PINCODE_REGEX = /^[1-9]\d{5}$/

export function validatePincode(pincode, fieldName = 'Pincode', { required = false } = {}) {
  if (pincode === undefined || pincode === null || String(pincode).trim() === '') {
    if (!required) return null
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  const clean = String(pincode).trim().replace(/\D/g, '')

  if (!PINCODE_REGEX.test(clean)) {
    throw new ApiError(400, `${fieldName} must be a valid 6-digit Indian postal PIN code (cannot start with 0)`, 'VALIDATION_ERROR')
  }

  return clean
}

// 7. URL VALIDATION
export function validateUrl(url, fieldName = 'URL', { required = false, maxLength = 500 } = {}) {
  if (url === undefined || url === null || String(url).trim() === '') {
    if (!required) return null
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  const trimmed = String(url).trim()

  if (trimmed.length > maxLength) {
    throw new ApiError(400, `${fieldName} cannot exceed ${maxLength} characters`, 'VALIDATION_ERROR')
  }

  let urlToParse = trimmed
  if (!/^https?:\/\//i.test(trimmed)) {
    urlToParse = `https://${trimmed}`
  }

  try {
    const parsed = new URL(urlToParse)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol')
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      throw new Error('Invalid host')
    }
    return urlToParse
  } catch (err) {
    throw new ApiError(400, `Please provide a valid ${fieldName.toLowerCase()} (e.g. https://example.com)`, 'VALIDATION_ERROR')
  }
}

// 8. BOUNDED TEXT VALIDATION
export function validateBoundedText(text, fieldName, { min = 0, max = 5000, required = false } = {}) {
  if (text === undefined || text === null || String(text).trim() === '') {
    if (!required) return ''
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  const trimmed = String(text).trim()

  if (trimmed.length < min) {
    throw new ApiError(400, `${fieldName} must be at least ${min} characters`, 'VALIDATION_ERROR')
  }
  if (trimmed.length > max) {
    throw new ApiError(400, `${fieldName} cannot exceed ${max} characters`, 'VALIDATION_ERROR')
  }

  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(trimmed)) {
    throw new ApiError(400, `${fieldName} contains disallowed script tags`, 'VALIDATION_ERROR')
  }

  return trimmed
}

// 9. INTEGER BOUNDS VALIDATION
export function validateInteger(val, fieldName, { min = 0, max = 1000000000, required = false, defaultValue = 0 } = {}) {
  if (val === undefined || val === null || val === '') {
    if (!required) return defaultValue
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  const parsed = Number(val)
  if (isNaN(parsed) || !Number.isFinite(parsed) || Math.floor(parsed) !== parsed) {
    throw new ApiError(400, `${fieldName} must be an integer`, 'VALIDATION_ERROR')
  }
  if (parsed < min) {
    throw new ApiError(400, `${fieldName} cannot be less than ${min}`, 'VALIDATION_ERROR')
  }
  if (parsed > max) {
    throw new ApiError(400, `${fieldName} cannot exceed ${max}`, 'VALIDATION_ERROR')
  }

  return parsed
}

// 10. ENUM SELECTION VALIDATION
export function validateEnum(val, fieldName, allowedValues, { required = true, defaultValue = null } = {}) {
  if (val === undefined || val === null || val === '') {
    if (!required) return defaultValue
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  if (!allowedValues.includes(val)) {
    throw new ApiError(400, `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`, 'VALIDATION_ERROR')
  }

  return val
}

// 11. DATE VALIDATION
export function validateDate(val, fieldName, { required = false, minDate = null, maxDate = null } = {}) {
  if (val === undefined || val === null || String(val).trim() === '') {
    if (!required) return null
    throw new ApiError(400, `${fieldName} is required`, 'VALIDATION_ERROR')
  }

  const date = new Date(val)
  if (isNaN(date.getTime())) {
    throw new ApiError(400, `Please provide a valid date for ${fieldName}`, 'VALIDATION_ERROR')
  }

  if (minDate && date < new Date(minDate)) {
    throw new ApiError(400, `${fieldName} cannot be before ${new Date(minDate).toLocaleDateString()}`, 'VALIDATION_ERROR')
  }
  if (maxDate && date > new Date(maxDate)) {
    throw new ApiError(400, `${fieldName} cannot be after ${new Date(maxDate).toLocaleDateString()}`, 'VALIDATION_ERROR')
  }

  return date.toISOString()
}

// 12. 6-DIGIT OTP VALIDATION
export function validateOtp(otp, fieldName = 'OTP code') {
  if (!otp || typeof otp !== 'string' || !otp.trim()) {
    throw new ApiError(400, `Please enter the 6-digit ${fieldName.toLowerCase()}`, 'VALIDATION_ERROR')
  }

  const clean = otp.trim()
  if (!/^\d{6}$/.test(clean)) {
    throw new ApiError(400, `${fieldName} must be exactly 6 numeric digits`, 'VALIDATION_ERROR')
  }

  return clean
}
