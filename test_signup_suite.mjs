// Automated Registration & Signup Form QA Test Suite
import { adminDb } from './backend/src/config/supabase.js'

const BASE_URL = 'http://localhost:3001/api'

async function runTests() {
  console.log('====================================================')
  console.log('🧪 Starting Registration & Signup QA Test Suite')
  console.log('====================================================\n')

  let passed = 0
  let failed = 0
  const results = []

  const test = async (id, title, fn) => {
    try {
      await fn()
      console.log(`✅ [PASS] ${id}: ${title}`)
      results.push({ id, title, status: 'PASS' })
      passed++
    } catch (err) {
      console.error(`❌ [FAIL] ${id}: ${title} -> ${err.message}`)
      results.push({ id, title, status: 'FAIL', error: err.message })
      failed++
    }
  }

  const timestamp = Date.now()
  const uniqueCreatorUsername = `qa_creator_${timestamp % 1000000}`
  const uniqueCreatorEmail = `qa_creator_${timestamp}@testdomain.com`

  const uniqueBrandUsername = `qa_brand_${timestamp % 1000000}`
  const uniqueBrandEmail = `qa_brand_${timestamp}@testdomain.com`

  // TC-SIGNUP-01: Username Uniqueness Test (Existing Username Rejection)
  await test('TC-SIGNUP-01', 'Reject signup with existing username (@sahilkhan)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Sahil',
        username: 'sahilkhan',
        email: `random_${timestamp}@domain.com`,
        password: 'password123',
        phone: '9876543210',
        pincode: '400001',
        role: 'influencer'
      })
    })
    const data = await res.json()
    const msg = data.error?.message || data.message || ''
    if (res.status !== 409 || (!msg.includes('already registered') && !msg.includes('already taken'))) {
      throw new Error(`Expected 409 Conflict with username taken message, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-02: Username Uniqueness Test (Reserved Username Rejection)
  await test('TC-SIGNUP-02', 'Reject signup with reserved username (@admin)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin Impersonator',
        username: 'admin',
        email: `imposter_${timestamp}@domain.com`,
        password: 'password123',
        phone: '9876543210',
        pincode: '400001',
        role: 'influencer'
      })
    })
    const data = await res.json()
    const msg = data.error?.message || data.message || ''
    if (res.status !== 409 || !msg.includes('reserved')) {
      throw new Error(`Expected 409 with reserved message, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-03: Realtime Username Check API (Positive & Negative)
  await test('TC-SIGNUP-03', 'Check username availability API (/check-username)', async () => {
    const takenRes = await fetch(`${BASE_URL}/auth/check-username?username=sahilkhan`)
    const takenData = await takenRes.json()
    if (takenData.available !== false) {
      throw new Error(`Expected available: false for sahilkhan, got: ${JSON.stringify(takenData)}`)
    }

    const availRes = await fetch(`${BASE_URL}/auth/check-username?username=${uniqueCreatorUsername}`)
    const availData = await availRes.json()
    if (availData.available !== true) {
      throw new Error(`Expected available: true for ${uniqueCreatorUsername}, got: ${JSON.stringify(availData)}`)
    }
  })

  // TC-SIGNUP-04: Username Format & Boundary (Length < 3 chars)
  await test('TC-SIGNUP-04', 'Reject username shorter than 3 characters', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short User',
        username: 'ab',
        email: `short_${timestamp}@domain.com`,
        password: 'password123',
        phone: '9876543210',
        pincode: '400001',
        role: 'influencer'
      })
    })
    const data = await res.json()
    const msg = data.error?.message || data.message || ''
    if (res.status !== 400 || !msg.includes('at least 3 characters')) {
      throw new Error(`Expected 400 with min length error, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-05: Email Format Validation (Invalid string)
  await test('TC-SIGNUP-05', 'Reject invalid email format (missing domain/at symbol)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email User',
        username: `user_${timestamp % 10000}`,
        email: 'invalid-email-address',
        password: 'password123',
        phone: '9876543210',
        pincode: '400001',
        role: 'influencer'
      })
    })
    const data = await res.json()
    const msg = data.error?.message || data.message || ''
    if (res.status !== 400 || !msg.includes('valid email')) {
      throw new Error(`Expected 400 with invalid email message, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-06: Duplicate Email Rejection
  await test('TC-SIGNUP-06', 'Reject signup with already registered email (sahilkhan@gmail.com)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Email Sahil',
        username: `unique_name_${timestamp % 10000}`,
        email: 'sahilkhan@gmail.com',
        password: 'password123',
        phone: '9876543210',
        pincode: '400001',
        role: 'influencer'
      })
    })
    const data = await res.json()
    const msg = data.error?.message || data.message || ''
    if (res.status !== 409 || !msg.includes('already registered')) {
      throw new Error(`Expected 409 email exists, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-07: Password Boundary (< 6 chars)
  await test('TC-SIGNUP-07', 'Reject password shorter than 6 characters', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pwd User',
        username: `pwd_user_${timestamp % 10000}`,
        email: `pwd_${timestamp}@domain.com`,
        password: '123',
        phone: '9876543210',
        pincode: '400001',
        role: 'influencer'
      })
    })
    const data = await res.json()
    const msg = data.error?.message || data.message || ''
    if (res.status !== 400 || !msg.includes('at least 6 characters')) {
      throw new Error(`Expected 400 password min length, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-08: Phone Number Numeric Digits & Length Check
  await test('TC-SIGNUP-08', 'Reject non-numeric / short phone number', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Phone User',
        username: `badphone_${timestamp % 10000}`,
        email: `badphone_${timestamp}@domain.com`,
        password: 'password123',
        phone: '12345', // < 10 digits
        pincode: '400001',
        role: 'influencer'
      })
    })
    const data = await res.json()
    const msg = data.error?.message || data.message || ''
    if (res.status !== 400 || !msg.includes('10 to 15 numeric digits')) {
      throw new Error(`Expected 400 phone digits error, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-09: Pincode Numeric Digits & Length Check
  await test('TC-SIGNUP-09', 'Reject invalid pincode (< 5 digits or letters)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Pin User',
        username: `badpin_${timestamp % 10000}`,
        email: `badpin_${timestamp}@domain.com`,
        password: 'password123',
        phone: '9876543210',
        pincode: '123', // < 5 digits
        role: 'influencer'
      })
    })
    const data = await res.json()
    const msg = data.error?.message || data.message || ''
    if (res.status !== 400 || !msg.includes('5 or 6 digit numeric code')) {
      throw new Error(`Expected 400 pincode digits error, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-10: End-to-End Creator Registration with Sanitized Integer Numbers
  await test('TC-SIGNUP-10', 'End-to-End Influencer/Creator Registration with Valid Types', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rohan Sharma',
        username: uniqueCreatorUsername,
        email: uniqueCreatorEmail,
        password: 'SecurePassword123!',
        phone: '9876543210',
        pincode: '400050',
        location: 'Mumbai',
        role: 'influencer',
        roleData: {
          niche: 'Fashion & Lifestyle',
          instagram_handle: uniqueCreatorUsername,
          instagram_url: `https://instagram.com/${uniqueCreatorUsername}`,
          instagram_followers: 35000,
          youtube_skipped: true,
          snapchat_skipped: true,
          facebook_skipped: true,
          reel_price: 5000,
          story_price: 2000,
          post_price: 3500,
          bio: 'Top fashion content creator in Mumbai.'
        }
      })
    })
    const data = await res.json()
    if (res.status !== 201 || !data.success) {
      throw new Error(`Expected 201 Created, got status ${res.status}: ${JSON.stringify(data)}`)
    }

    // Verify in database that rates and followers are numeric integers
    const db = adminDb()
    const { data: infProfile, error } = await db.from('influencer_profiles').select('*').eq('user_id', data.user.id).single()
    if (error || !infProfile) {
      throw new Error(`Failed to find created influencer profile: ${error?.message}`)
    }
    if (typeof infProfile.followers_count !== 'number' || infProfile.followers_count !== 35000) {
      throw new Error(`Expected followers_count to be integer 35000, got: ${infProfile.followers_count}`)
    }
    if (infProfile.rate_card?.reel !== 5000 || infProfile.rate_card?.story !== 2000) {
      throw new Error(`Expected integer rate_card values, got: ${JSON.stringify(infProfile.rate_card)}`)
    }
  })

  // TC-SIGNUP-11: Attempt to register with newly registered creator username (Immediate Collision Check)
  await test('TC-SIGNUP-11', 'Verify freshly registered username cannot be registered again', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Imposter Rohan',
        username: uniqueCreatorUsername,
        email: `imposter_${timestamp}@domain.com`,
        password: 'SecurePassword123!',
        phone: '9876543210',
        pincode: '400050',
        role: 'influencer'
      })
    })
    const data = await res.json()
    if (res.status !== 409) {
      throw new Error(`Expected 409 Conflict, got status ${res.status}: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-12: End-to-End Brand Registration
  await test('TC-SIGNUP-12', 'End-to-End Brand Account Registration', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aman Verma',
        username: uniqueBrandUsername,
        email: uniqueBrandEmail,
        password: 'BrandSecurePassword123!',
        phone: '9123456789',
        pincode: '110001',
        location: 'New Delhi',
        role: 'brand',
        roleData: {
          business_name: 'Verma Apparel Co',
          category: 'E-commerce & Retail',
          budget_range: '₹50,000 – ₹2,00,000',
          website: 'https://verma-apparel.example.com',
          goals: ['🎥 Instagram Reels & Reach', '🌟 Brand Awareness & PR'],
          preferred_niches: ['Fashion & Lifestyle']
        }
      })
    })
    const data = await res.json()
    if (res.status !== 201 || !data.success) {
      throw new Error(`Expected 201 Created for brand, got status ${res.status}: ${JSON.stringify(data)}`)
    }

    const db = adminDb()
    const { data: brandProfile, error } = await db.from('brand_profiles').select('*').eq('user_id', data.user.id).single()
    if (error || !brandProfile) {
      throw new Error(`Failed to find created brand profile: ${error?.message}`)
    }
    if (brandProfile.business_name !== 'Verma Apparel Co') {
      throw new Error(`Expected business_name 'Verma Apparel Co', got: ${brandProfile.business_name}`)
    }
  })

  // TC-SIGNUP-13: Immediate Username Login Resolution for Newly Created Accounts
  await test('TC-SIGNUP-13', 'Resolve newly created @username in login identifier resolver', async () => {
    const res = await fetch(`${BASE_URL}/auth/resolve-identifier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: `@${uniqueCreatorUsername}` })
    })
    const data = await res.json()
    if (data.email !== uniqueCreatorEmail.toLowerCase()) {
      throw new Error(`Expected resolve to ${uniqueCreatorEmail}, got: ${JSON.stringify(data)}`)
    }
  })

  // TC-SIGNUP-14: Role Isolation Verification (Newly Created User Role Lock)
  await test('TC-SIGNUP-14', 'Confirm newly created user has persistent role assigned in public.users', async () => {
    const db = adminDb()
    const { data: userRecord } = await db.from('users').select('*').eq('email', uniqueCreatorEmail.toLowerCase()).single()
    if (!userRecord || userRecord.role !== 'influencer') {
      throw new Error(`Expected role 'influencer' in public.users, got: ${userRecord?.role}`)
    }
    if (userRecord.phone !== '9876543210' || userRecord.pincode !== '400050') {
      throw new Error(`Expected numeric string phone and pincode, got: phone=${userRecord?.phone}, pin=${userRecord?.pincode}`)
    }
  })

  console.log('\n====================================================')
  console.log(`📊 Test Summary: ${passed} PASSED | ${failed} FAILED | Total: ${results.length}`)
  console.log('====================================================')
  
  if (failed > 0) process.exit(1)
  process.exit(0)
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err)
  process.exit(1)
})
