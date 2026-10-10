import { adminDb, authClient } from '../config/supabase.js'
import { ApiError } from '../utils/api-error.js'
import { env } from '../config/env.js'

export async function login({ email, password }) {
  if (!email || !password) throw new ApiError(400, 'Email and password are required', 'VALIDATION_ERROR')
  const { data, error } = await authClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  })
  if (error || !data.user) {
    throw new ApiError(401, error?.message || 'Invalid login credentials', 'UNAUTHENTICATED')
  }
  const db = adminDb()
  const { data: userProfile } = await db.from('users').select('*').eq('id', data.user.id).maybeSingle()
  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: userProfile?.name || data.user.user_metadata?.name || '',
      role: userProfile?.role || 'influencer'
    },
    session: data.session
  }
}


export async function getMe(auth) {
  const db = adminDb()
  const { data, error } = await db.from('users').select('id,name,email,role,phone,is_disabled,profile_status,created_at').eq('id', auth.id).maybeSingle()
  if (error) throw error
  if (data?.is_disabled) throw new ApiError(403, 'This account is disabled', 'ACCOUNT_DISABLED')
  if (!data) return { id: auth.id, name: auth.name || auth.email?.split('@')[0] || '', email: auth.email, role: null, onboarding_completed: false }

  let onboarding_completed = false
  let profile_image_url = null
  let profileData = null

  if (data.role === 'influencer') {
    const { data: infProfile } = await db.from('influencer_profiles').select('user_id, niche, followers_count, profile_image_url, rate_card, status').eq('user_id', auth.id).maybeSingle()
    if (infProfile && (infProfile.niche || infProfile.profile_image_url || (infProfile.followers_count && infProfile.followers_count > 0))) {
      onboarding_completed = true
      profile_image_url = infProfile.profile_image_url
      profileData = infProfile
    }
  } else if (data.role === 'brand') {
    const { data: brandProfile } = await db.from('brand_profiles').select('user_id, business_name, budget_range').eq('user_id', auth.id).maybeSingle()
    if (brandProfile && brandProfile.business_name) {
      onboarding_completed = true
      profile_image_url = null
      profileData = brandProfile
    }
  } else if (data.role === 'admin') {
    onboarding_completed = true
  }

  return {
    ...data,
    onboarding_completed,
    profile_image_url,
    profile_data: profileData
  }
}

export async function setRole(auth, role) {
  if (!['brand', 'influencer'].includes(role)) {
    throw new ApiError(400, 'Role must be brand or influencer', 'VALIDATION_ERROR')
  }
  const db = adminDb()
  const { data: existing, error: existingError } = await db.from('users').select('role,name').eq('id', auth.id).maybeSingle()
  if (existingError) throw existingError
  if (existing?.role === 'admin') throw new ApiError(403, 'Admin roles are assigned securely', 'FORBIDDEN')
  const { data, error } = await db.from('users').upsert({
    id: auth.id,
    email: auth.email,
    name: existing?.name || auth.name || auth.email?.split('@')[0] || 'New user',
    role
  }, { onConflict: 'id' }).select('id,name,email,role').single()
  if (error) throw error
  return data
}

/**
 * Check if a username is valid and available (unique across all users)
 */
export async function checkUsernameAvailability(rawUsername) {
  if (!rawUsername || typeof rawUsername !== 'string' || !rawUsername.trim()) {
    return { available: false, message: 'Username cannot be blank' }
  }
  const clean = rawUsername.replace(/^@/, '').toLowerCase().trim()
  if (clean.length < 3) {
    return { available: false, username: clean, message: 'Username must be at least 3 characters' }
  }
  if (clean.length > 30) {
    return { available: false, username: clean, message: 'Username cannot exceed 30 characters' }
  }
  if (!/^[a-z0-9_]+$/.test(clean)) {
    return { available: false, username: clean, message: 'Username can only contain letters, numbers, and underscores' }
  }

  // System reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'support', 'help', 'brandhub', 'brand2influence',
    'system', 'null', 'undefined', 'anonymous', 'moderator', 'official',
    'aanyakapoor', 'kabir_eats', 'dr_rheasen', 'vikram_fitness', 'tara_wanderlust', 'arjun_tech'
  ]
  if (reservedUsernames.includes(clean)) {
    return { available: false, username: clean, message: `Username "@${clean}" is reserved. Please choose another.` }
  }

  const db = adminDb()

  // 1. Check Supabase Auth listUsers (user_metadata and email prefix)
  try {
    const { data: usersData, error: listErr } = await db.auth.admin.listUsers({ perPage: 1000 })
    if (!listErr && usersData?.users) {
      const match = usersData.users.find(u => {
        const uMetaName = u.user_metadata?.username ? String(u.user_metadata.username).replace(/^@/, '').toLowerCase().trim() : ''
        const emailPrefix = u.email ? u.email.split('@')[0].toLowerCase().trim() : ''
        return uMetaName === clean || emailPrefix === clean
      })
      if (match) {
        return { available: false, username: clean, message: `Username "@${clean}" is already registered. Please choose another.` }
      }
    }
  } catch (err) {
    console.warn('checkUsername listUsers error:', err.message)
  }

  // 2. Check influencer profiles rate_card for username or instagram_handle
  try {
    const { data: infs } = await db.from('influencer_profiles').select('rate_card, instagram_handle')
    if (infs && infs.length > 0) {
      const match = infs.find(inf => {
        const handle = (inf.rate_card?.instagram_handle || inf.instagram_handle || '').replace(/^@/, '').toLowerCase().trim()
        const uName = (inf.rate_card?.username || '').replace(/^@/, '').toLowerCase().trim()
        return handle === clean || uName === clean
      })
      if (match) {
        return { available: false, username: clean, message: `Username "@${clean}" is already taken.` }
      }
    }
  } catch (err) {
    console.warn('checkUsername inf check error:', err.message)
  }

  // 3. Check brand_profiles business_name
  try {
    const { data: brands } = await db.from('brand_profiles').select('business_name')
    if (brands && brands.length > 0) {
      const match = brands.find(b => {
        const bName = (b.business_name || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').trim()
        return bName === clean
      })
      if (match) {
        return { available: false, username: clean, message: `Username "@${clean}" is already taken by an existing brand.` }
      }
    }
  } catch (err) {
    console.warn('checkUsername brand check error:', err.message)
  }

  return { available: true, username: clean, message: `Username "@${clean}" is available!` }
}

export async function register(payload) {
  const { email, password, name, username, phone, dob, pincode, location, role, roleData } = payload || {}

  // 1. Mandatory Core Validations
  if (!email || !password || !name || !role) {
    throw new ApiError(400, 'Name, email, password, and role are required', 'VALIDATION_ERROR')
  }
  if (!['influencer', 'brand'].includes(role)) {
    throw new ApiError(400, 'Role must be either influencer or brand', 'VALIDATION_ERROR')
  }

  // 2. Email Validation (String, Regex)
  const cleanEmail = String(email).trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(cleanEmail)) {
    throw new ApiError(400, 'Please provide a valid email address (e.g. name@domain.com)', 'VALIDATION_ERROR')
  }

  // 3. Password Validation (String, Min 6 Chars)
  if (typeof password !== 'string' || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long', 'VALIDATION_ERROR')
  }

  // 4. Username Validation & Uniqueness Enforcement
  const rawUser = username || roleData?.username || roleData?.instagram_handle || name
  const cleanUsername = String(rawUser)
    .replace(/^@/, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '')

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new ApiError(400, 'Username must be at least 3 characters (alphanumeric and underscores)', 'VALIDATION_ERROR')
  }
  if (cleanUsername.length > 30) {
    throw new ApiError(400, 'Username cannot exceed 30 characters', 'VALIDATION_ERROR')
  }

  // Check username uniqueness
  const usernameCheck = await checkUsernameAvailability(cleanUsername)
  if (!usernameCheck.available) {
    throw new ApiError(409, usernameCheck.message || `Username "@${cleanUsername}" is already taken. Please choose another username.`, 'USERNAME_TAKEN')
  }

  // 5. Phone Validation (Numeric digits, 10-15 digits)
  let cleanPhone = null
  if (phone) {
    const digitsOnly = String(phone).replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      throw new ApiError(400, 'Mobile phone number must contain 10 to 15 numeric digits', 'VALIDATION_ERROR')
    }
    cleanPhone = digitsOnly
  }

  // 6. Pincode Validation (Numeric digits, 5-6 digits)
  let cleanPincode = null
  if (pincode) {
    const pinDigits = String(pincode).replace(/\D/g, '')
    if (pinDigits.length < 5 || pinDigits.length > 6) {
      throw new ApiError(400, 'Pincode must be a 5 or 6 digit numeric code', 'VALIDATION_ERROR')
    }
    cleanPincode = pinDigits
  }

  const db = adminDb()

  // Helper to safely parse non-negative integers
  const toNonNegativeInt = (val) => {
    if (val === undefined || val === null || val === '') return 0
    const n = parseInt(val, 10)
    return isNaN(n) || n < 0 ? 0 : n
  }

  // 7. Create user in Supabase Auth with auto-confirmation
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name: name.trim(),
      username: cleanUsername,
      phone: cleanPhone || '',
      dob: dob ? String(dob).trim() : '',
      role
    }
  })

  if (authError) {
    if (authError.message?.toLowerCase().includes('already been registered') || authError.status === 422) {
      throw new ApiError(409, 'An account with this email address is already registered. Please log in instead.', 'EMAIL_EXISTS')
    }
    throw new ApiError(400, authError.message, 'REGISTRATION_FAILED')
  }

  const userId = authData.user.id

  // 8. Upsert user into public.users
  const { error: userError } = await db.from('users').upsert({
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    pincode: cleanPincode,
    city: location?.trim() || null,
    role,
    profile_status: 'active'
  }, { onConflict: 'id' })

  if (userError) {
    console.error('Error inserting public.users on register:', userError)
  }

  const locStr = [location?.trim(), cleanPincode].filter(Boolean).join(' - ') || 'India'

  if (role === 'influencer') {
    const igFollowers = toNonNegativeInt(roleData?.instagram_followers)
    const ytSubscribers = Boolean(roleData?.youtube_skipped) ? 0 : toNonNegativeInt(roleData?.youtube_subscribers)
    const snapSubscribers = Boolean(roleData?.snapchat_skipped) ? 0 : toNonNegativeInt(roleData?.snapchat_subscribers)
    const fbFollowers = Boolean(roleData?.facebook_skipped) ? 0 : toNonNegativeInt(roleData?.facebook_followers)

    const totalFollowers = (igFollowers + ytSubscribers + snapSubscribers + fbFollowers) || toNonNegativeInt(roleData?.followers_count) || 0

    const portfolioLinks = [
      roleData?.instagram_url,
      roleData?.youtube_url,
      roleData?.snapchat_url,
      ...(Array.isArray(roleData?.portfolio_links) ? roleData.portfolio_links : [])
    ].filter(Boolean)

    const rateCard = {
      username: cleanUsername,
      reel: toNonNegativeInt(roleData?.reel_price || roleData?.rate_card?.reel),
      story: toNonNegativeInt(roleData?.story_price || roleData?.rate_card?.story),
      post: toNonNegativeInt(roleData?.post_price || roleData?.rate_card?.post),
      instagram_handle: roleData?.instagram_handle || '',
      instagram_url: roleData?.instagram_url || (roleData?.instagram_handle ? `https://instagram.com/${roleData.instagram_handle.replace('@', '')}` : ''),
      instagram_followers: igFollowers,
      youtube_url: roleData?.youtube_url || '',
      youtube_subscribers: ytSubscribers,
      youtube_skipped: Boolean(roleData?.youtube_skipped),
      snapchat_url: roleData?.snapchat_url || '',
      snapchat_subscribers: snapSubscribers,
      snapchat_skipped: Boolean(roleData?.snapchat_skipped),
      facebook_followers: fbFollowers,
      facebook_url: roleData?.facebook_url || '',
      facebook_skipped: Boolean(roleData?.facebook_skipped),
      other_platform: roleData?.other_platform || '',
      other_followers: toNonNegativeInt(roleData?.other_followers),
      city: location?.trim() || '',
      pincode: cleanPincode || '',
      social_links: {
        instagram: { handle: roleData?.instagram_handle || '', url: roleData?.instagram_url || '', followers: igFollowers },
        youtube: { url: roleData?.youtube_url || '', subscribers: ytSubscribers, skipped: Boolean(roleData?.youtube_skipped) },
        snapchat: { url: roleData?.snapchat_url || '', subscribers: snapSubscribers, skipped: Boolean(roleData?.snapchat_skipped) }
      }
    }

    const { error: infError } = await db.from('influencer_profiles').upsert({
      user_id: userId,
      niche: roleData?.niche || 'Lifestyle',
      followers_count: totalFollowers,
      engagement_rate: Number(roleData?.engagement_rate) || 0,
      rate_card: rateCard,
      portfolio_links: portfolioLinks,
      location: locStr,
      bio: roleData?.bio || '',
      profile_image_url: roleData?.profile_image_url || roleData?.profileImageUrl || payload?.profile_image_url || payload?.profileImageUrl || null,
      status: 'published'
    }, { onConflict: 'user_id' })

    if (infError) {
      console.error('Error inserting influencer profile:', infError)
    }
  } else if (role === 'brand') {
    const brandDesc = typeof roleData?.description === 'string' && roleData.description.trim()
      ? roleData.description.trim()
      : Array.isArray(roleData?.goals)
      ? roleData.goals.join(', ')
      : 'Brand partner on Brand2Influence'

    const { error: brandError } = await db.from('brand_profiles').upsert({
      user_id: userId,
      business_name: roleData?.business_name || name,
      business_type: roleData?.business_type || roleData?.category || 'E-commerce & Retail',
      budget_range: roleData?.budget_range || '₹25,000 - ₹1,00,000',
      location: locStr,
      website: roleData?.website || '',
      description: brandDesc,
      pincode: cleanPincode || null
    }, { onConflict: 'user_id' })

    if (brandError) {
      console.error('Error inserting brand profile:', brandError)
    }
  }

  return {
    success: true,
    message: 'Account created successfully. You can now log in immediately!',
    user: {
      id: userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role
    }
  }
}

export async function getProfile(auth) {
  const db = adminDb()
  const { data: user, error: userError } = await db.from('users').select('*').eq('id', auth.id).maybeSingle()
  if (userError) throw userError
  if (!user) throw new ApiError(404, 'User profile not found', 'NOT_FOUND')

  let roleProfile = null
  if (user.role === 'influencer') {
    const { data: infProfile, error: infError } = await db.from('influencer_profiles').select('*').eq('user_id', auth.id).maybeSingle()
    if (!infError) roleProfile = infProfile
    return { ...user, influencer_profile: roleProfile }
  } else if (user.role === 'brand') {
    const { data: brandProfile, error: brandError } = await db.from('brand_profiles').select('*').eq('user_id', auth.id).maybeSingle()
    if (!brandError) roleProfile = brandProfile
    return { ...user, brand_profile: roleProfile }
  }

  return { ...user }
}

export async function updateProfile(auth, payload) {
  const db = adminDb()
  const { data: user, error: userError } = await db.from('users').select('*').eq('id', auth.id).maybeSingle()
  if (userError) throw userError
  if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND')

  // Update base users table fields
  const userUpdates = {}
  if (payload.name && typeof payload.name === 'string') userUpdates.name = payload.name.trim()
  if (payload.phone !== undefined) userUpdates.phone = payload.phone ? payload.phone.trim() : null

  if (Object.keys(userUpdates).length > 0) {
    const { error: updErr } = await db.from('users').update(userUpdates).eq('id', auth.id)
    if (updErr) throw updErr
  }

  const role = user.role || payload.role

  if (role === 'influencer') {
    const infData = payload.influencer_profile || payload
    const { data: existingInf } = await db.from('influencer_profiles').select('*').eq('user_id', auth.id).maybeSingle()
    const currentRateCard = existingInf?.rate_card || {}

    const updatedRateCard = {
      ...currentRateCard,
      ...(infData.rate_card || {}),
      ...(infData.reel_price !== undefined ? { reel: Number(infData.reel_price) } : {}),
      ...(infData.story_price !== undefined ? { story: Number(infData.story_price) } : {}),
      ...(infData.post_price !== undefined ? { post: Number(infData.post_price) } : {}),
      ...(infData.instagram_handle ? { instagram_handle: infData.instagram_handle } : {}),
      ...(infData.instagram_url ? { instagram_url: infData.instagram_url } : {}),
      ...(infData.instagram_followers !== undefined ? { instagram_followers: Number(infData.instagram_followers) } : {}),
      ...(infData.facebook_followers !== undefined ? { facebook_followers: Number(infData.facebook_followers) } : {}),
      ...(infData.youtube_url ? { youtube_url: infData.youtube_url } : {}),
      ...(infData.youtube_subscribers !== undefined ? { youtube_subscribers: Number(infData.youtube_subscribers) } : {}),
      ...(infData.snapchat_url ? { snapchat_url: infData.snapchat_url } : {}),
      ...(infData.snapchat_subscribers !== undefined ? { snapchat_subscribers: Number(infData.snapchat_subscribers) } : {}),
      ...(infData.other_platform ? { other_platform: infData.other_platform } : {}),
      ...(infData.other_followers !== undefined ? { other_followers: Number(infData.other_followers) } : {}),
      ...(payload.pincode ? { pincode: payload.pincode } : {}),
      ...(payload.city ? { city: payload.city } : {})
    }

    const loc = payload.location || infData.location || (payload.city ? [payload.city, payload.pincode].filter(Boolean).join(' - ') : existingInf?.location || 'India')

    const infUpdate = {
      user_id: auth.id,
      niche: infData.niche || existingInf?.niche || 'Lifestyle',
      followers_count: Number(infData.followers_count || infData.followersCount || updatedRateCard.instagram_followers || existingInf?.followers_count || 0),
      engagement_rate: Number(infData.engagement_rate || infData.engagementRate || existingInf?.engagement_rate || 0),
      rate_card: updatedRateCard,
      portfolio_links: Array.isArray(infData.portfolio_links) ? infData.portfolio_links : (existingInf?.portfolio_links || []),
      location: loc,
      bio: infData.bio !== undefined ? infData.bio : (existingInf?.bio || ''),
      profile_image_url: infData.profile_image_url || infData.profileImageUrl || payload.profile_image_url || payload.profileImageUrl || existingInf?.profile_image_url || null,
      status: infData.status || existingInf?.status || 'published',
      updated_at: new Date().toISOString()
    }

    const { error: saveInfErr } = await db.from('influencer_profiles').upsert(infUpdate, { onConflict: 'user_id' })
    if (saveInfErr) throw saveInfErr
  } else if (role === 'brand') {
    const brandData = payload.brand_profile || payload
    const { data: existingBrand } = await db.from('brand_profiles').select('*').eq('user_id', auth.id).maybeSingle()

    const loc = payload.location || brandData.location || (payload.city ? [payload.city, payload.pincode].filter(Boolean).join(' - ') : existingBrand?.location || 'India')

    const brandUpdate = {
      user_id: auth.id,
      business_name: brandData.business_name || brandData.businessName || existingBrand?.business_name || payload.name || user.name,
      business_type: brandData.business_type || brandData.businessType || brandData.category || existingBrand?.business_type || 'Brand',
      budget_range: brandData.budget_range || brandData.budgetRange || existingBrand?.budget_range || '₹25,000 - ₹1,00,000',
      location: loc,
      website: brandData.website !== undefined ? brandData.website : (existingBrand?.website || null),
      description: brandData.description !== undefined ? brandData.description : (existingBrand?.description || null),
      pincode: payload.pincode || brandData.pincode || existingBrand?.pincode || null,
      updated_at: new Date().toISOString()
    }

    const { error: saveBrandErr } = await db.from('brand_profiles').upsert(brandUpdate, { onConflict: 'user_id' })
    if (saveBrandErr) throw saveBrandErr
  }

  return await getProfile(auth)
}

export function getGoogleAuthUrl(role = '') {
  if (!env.google.clientId) {
    throw new ApiError(500, 'Google OAuth is not configured on the server. Please check GOOGLE_CLIENT_ID.', 'CONFIG_ERROR')
  }

  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: JSON.stringify({ role: role || '' })
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function handleGoogleCallback(code, stateStr) {
  if (!code) {
    throw new ApiError(400, 'Authorization code missing from Google callback', 'VALIDATION_ERROR')
  }

  let role = ''
  try {
    if (stateStr) {
      const parsed = JSON.parse(stateStr)
      role = parsed.role || ''
    }
  } catch (e) {
    // ignore state parse errors
  }

  // 1. Exchange code for tokens with Google
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      redirect_uri: env.google.callbackUrl,
      grant_type: 'authorization_code',
    })
  })

  const tokenData = await tokenRes.json()
  if (!tokenRes.ok || !tokenData.access_token) {
    console.error('Google token error:', tokenData)
    throw new ApiError(400, tokenData.error_description || 'Failed to exchange token with Google', 'OAUTH_ERROR')
  }

  // 2. Fetch User Profile from Google
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  })
  const googleUser = await userRes.json()
  if (!userRes.ok || !googleUser.email) {
    throw new ApiError(400, 'Failed to fetch user details from Google', 'OAUTH_ERROR')
  }

  const email = googleUser.email.toLowerCase().trim()
  const name = googleUser.name || googleUser.given_name || email.split('@')[0]
  const picture = googleUser.picture || null

  const db = adminDb()

  // 3. Find existing user in public.users or auth.users
  const { data: existingUser } = await db.from('users').select('*').eq('email', email).maybeSingle()

  let userId = existingUser?.id

  if (!userId) {
    // Generate secure password for Supabase auth user
    const randomPassword = `G_${Math.random().toString(36).slice(2)}_${Date.now()}!Aa`

    const { data: authCreated, error: createError } = await db.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: {
        name,
        picture,
        provider: 'google'
      }
    })

    if (createError) {
      // If user already exists in auth.users, fetch by email
      const { data: usersList } = await db.auth.admin.listUsers()
      const match = (usersList?.users || []).find(u => u.email?.toLowerCase() === email)
      if (match) {
        userId = match.id
      } else {
        throw new ApiError(400, createError.message, 'AUTH_PROVISION_FAILED')
      }
    } else {
      userId = authCreated.user.id
    }
  }

  const assignedRole = existingUser?.role || (['influencer', 'brand'].includes(role) ? role : null)

  // 4. Upsert into public.users
  await db.from('users').upsert({
    id: userId,
    email,
    name: existingUser?.name || name,
    role: assignedRole,
    profile_status: 'active'
  }, { onConflict: 'id' })

  // 5. Generate magic link login session from Supabase
  const callbackUrl = `${env.frontendOrigin}/auth/callback?role=${encodeURIComponent(assignedRole || '')}`
  let actionLink = ''
  let hashedToken = ''
  let emailOtp = ''

  try {
    const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: callbackUrl
      }
    })
    if (linkError) {
      console.warn('generateLink error:', linkError)
    } else {
      actionLink = linkData?.properties?.action_link || ''
      hashedToken = linkData?.properties?.hashed_token || ''
      emailOtp = linkData?.properties?.email_otp || ''
    }
  } catch (linkEx) {
    console.warn('generateLink exception:', linkEx)
  }

  const fallbackUrl = `${env.frontendOrigin}/auth/callback?email=${encodeURIComponent(email)}&token=${encodeURIComponent(hashedToken || emailOtp)}&role=${encodeURIComponent(assignedRole || '')}`

  return {
    userId,
    email,
    name,
    role: assignedRole,
    picture,
    frontendRedirectUrl: actionLink || fallbackUrl
  }
}

/**
 * Resolve login identifier (email or username) to user's registered email and role
 */
export async function resolveIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw new ApiError(400, 'Please enter a valid email or username', 'VALIDATION_ERROR')
  }

  const raw = identifier.trim()
  // Only treat as direct email if it includes '@' and a domain dot and does not start with '@'
  if (raw.includes('@') && raw.includes('.') && !raw.startsWith('@')) {
    return { email: raw.toLowerCase() }
  }

  const cleanUsername = raw.replace(/^@/, '').toLowerCase().trim()
  const db = adminDb()

  try {
    const { data: usersData, error: listErr } = await db.auth.admin.listUsers({ perPage: 200 })
    if (!listErr && usersData?.users) {
      const matched = usersData.users.find(u => {
        const uMetaName = u.user_metadata?.username ? String(u.user_metadata.username).replace(/^@/, '').toLowerCase() : ''
        const emailPrefix = u.email ? u.email.split('@')[0].toLowerCase() : ''
        return uMetaName === cleanUsername || emailPrefix === cleanUsername
      })

      if (matched && matched.email) {
        return {
          email: matched.email.toLowerCase(),
          username: cleanUsername,
          role: matched.user_metadata?.role || null
        }
      }
    }
  } catch (authListErr) {
    console.warn('listUsers lookup warning:', authListErr.message)
  }

  // Also check influencer_profiles rate_card for instagram_handle or username
  try {
    const { data: infs } = await db.from('influencer_profiles').select('user_id, rate_card')
    if (infs && infs.length > 0) {
      const matchedInf = infs.find(inf => {
        const handle = (inf.rate_card?.instagram_handle || '').replace(/^@/, '').toLowerCase()
        const uName = (inf.rate_card?.username || '').replace(/^@/, '').toLowerCase()
        return handle === cleanUsername || uName === cleanUsername
      })

      if (matchedInf) {
        const { data: u } = await db.from('users').select('email, role').eq('id', matchedInf.user_id).maybeSingle()
        if (u?.email) {
          return { email: u.email.toLowerCase(), username: cleanUsername, role: u.role }
        }
      }
    }
  } catch (infErr) {
    console.warn('influencer_profiles lookup warning:', infErr.message)
  }

  // Also check brand_profiles for business_name
  try {
    const { data: brands } = await db.from('brand_profiles').select('user_id, business_name')
    if (brands && brands.length > 0) {
      const matchedBrand = brands.find(b => {
        const bName = (b.business_name || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        return bName === cleanUsername
      })
      if (matchedBrand) {
        const { data: u } = await db.from('users').select('email, role').eq('id', matchedBrand.user_id).maybeSingle()
        if (u?.email) {
          return { email: u.email.toLowerCase(), username: cleanUsername, role: u.role }
        }
      }
    }
  } catch (brandErr) {
    console.warn('brand_profiles lookup warning:', brandErr.message)
  }

  throw new ApiError(404, `No account found with username "@${cleanUsername}". Please check or sign in with your email address.`, 'USER_NOT_FOUND')
}

const registrationOtpStore = new Map()
const forgotPasswordOtpStore = new Map()

/**
 * Generate and send a 6-digit OTP for signup contact verification
 */
export async function sendRegistrationOtp({ email, phone }) {
  if ((!email || !String(email).trim()) && (!phone || !String(phone).trim())) {
    throw new ApiError(400, 'Please provide your mobile phone number or email address', 'VALIDATION_ERROR')
  }

  let cleanEmail = ''
  if (email && String(email).trim()) {
    cleanEmail = String(email).trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      throw new ApiError(400, 'Please provide a valid email address (e.g. name@domain.com)', 'VALIDATION_ERROR')
    }
  }

  let cleanPhone = ''
  if (phone && String(phone).trim()) {
    cleanPhone = String(phone).replace(/\D/g, '')
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new ApiError(400, 'Please provide a valid 10-15 digit mobile phone number', 'VALIDATION_ERROR')
    }
  }

  const primaryKey = cleanEmail || cleanPhone

  // Check if email already registered in public.users
  const db = adminDb()
  try {
    if (cleanEmail) {
      const { data: existingUser } = await db.from('users').select('id, email').eq('email', cleanEmail).maybeSingle()
      if (existingUser) {
        throw new ApiError(409, 'An account with this email address already exists. Please sign in instead.', 'EMAIL_EXISTS')
      }
    }
    if (cleanPhone) {
      const { data: existingPhoneUser } = await db.from('users').select('id, phone').eq('phone', cleanPhone).maybeSingle()
      if (existingPhoneUser) {
        throw new ApiError(409, 'An account with this mobile phone number already exists. Please sign in instead.', 'PHONE_EXISTS')
      }
    }
  } catch (err) {
    if (err.statusCode === 409) throw err
  }

  // Check cooldown if OTP was sent recently
  const existingOtp = registrationOtpStore.get(primaryKey) || (cleanPhone ? registrationOtpStore.get(cleanPhone) : null)
  if (existingOtp && existingOtp.cooldownUntil > Date.now()) {
    const remainingSecs = Math.ceil((existingOtp.cooldownUntil - Date.now()) / 1000)
    throw new ApiError(429, `Please wait ${remainingSecs} seconds before requesting a new OTP code.`, 'RATE_LIMITED')
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const now = Date.now()

  const otpRecord = {
    otp,
    email: cleanEmail,
    phone: cleanPhone,
    attempts: 0,
    verified: false,
    createdAt: now,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes TTL
    cooldownUntil: now + 60 * 1000   // 60 seconds cooldown
  }

  if (cleanEmail) registrationOtpStore.set(cleanEmail, otpRecord)
  if (cleanPhone) registrationOtpStore.set(cleanPhone, otpRecord)

  // Format masked email & phone for safe UI display
  let maskedEmail = ''
  if (cleanEmail) {
    const [userPart, domainPart] = cleanEmail.split('@')
    maskedEmail = userPart.length > 2 
      ? `${userPart[0]}***${userPart[userPart.length - 1]}@${domainPart}`
      : `${userPart[0]}***@${domainPart}`
  }

  const maskedPhone = cleanPhone.length >= 10 
    ? `+91 •••••• ${cleanPhone.slice(-4)}` 
    : ''

  console.log(`[REGISTRATION OTP] Generated code ${otp} for ${cleanEmail || cleanPhone}`)

  return {
    success: true,
    message: `A 6-digit verification code has been generated for ${[maskedPhone, maskedEmail].filter(Boolean).join(' & ')}`,
    email: cleanEmail,
    phone: cleanPhone,
    maskedEmail,
    maskedPhone,
    testOtp: otp, // Provided for instant development/testing
    expiresInSeconds: 300,
    cooldownSeconds: 60
  }
}

/**
 * Verify 6-digit OTP for signup contact verification
 */
export async function verifyRegistrationOtp({ email, phone, otp }) {
  const cleanEmail = email ? String(email).trim().toLowerCase() : ''
  const cleanPhone = phone ? String(phone).replace(/\D/g, '') : ''

  if (!cleanEmail && !cleanPhone) {
    throw new ApiError(400, 'Email address or mobile phone number is required for verification', 'VALIDATION_ERROR')
  }

  const cleanOtp = String(otp || '').trim()

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new ApiError(400, 'Please enter a valid 6-digit OTP code', 'VALIDATION_ERROR')
  }

  const record = (cleanEmail && registrationOtpStore.get(cleanEmail)) || 
                 (cleanPhone && registrationOtpStore.get(cleanPhone))

  if (!record || record.expiresAt < Date.now()) {
    throw new ApiError(400, 'Verification code has expired or was not requested. Please request a new code.', 'OTP_EXPIRED')
  }

  record.attempts = (record.attempts || 0) + 1
  if (record.attempts > 5) {
    if (cleanEmail) registrationOtpStore.delete(cleanEmail)
    if (cleanPhone) registrationOtpStore.delete(cleanPhone)
    throw new ApiError(429, 'Too many invalid attempts. This OTP has been invalidated. Please request a new code.', 'MAX_ATTEMPTS_EXCEEDED')
  }

  if (record.otp !== cleanOtp) {
    const remaining = 5 - record.attempts
    throw new ApiError(400, `Incorrect verification code. ${remaining} attempts remaining.`, 'INVALID_OTP')
  }

  record.verified = true
  if (cleanEmail) registrationOtpStore.set(cleanEmail, record)
  if (cleanPhone) registrationOtpStore.set(cleanPhone, record)

  return {
    success: true,
    verified: true,
    message: 'Contact verified successfully! You may now complete your registration.',
    email: cleanEmail || record.email,
    phone: cleanPhone || record.phone
  }
}

/**
 * Send password reset OTP
 */
export async function sendForgotPasswordOtp({ identifier }) {
  const resolved = await resolveIdentifier(identifier)
  const cleanEmail = resolved.email.toLowerCase()

  const existingOtp = forgotPasswordOtpStore.get(cleanEmail)
  if (existingOtp && existingOtp.cooldownUntil > Date.now()) {
    const remainingSecs = Math.ceil((existingOtp.cooldownUntil - Date.now()) / 1000)
    throw new ApiError(429, `Please wait ${remainingSecs} seconds before requesting another reset code.`, 'RATE_LIMITED')
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const now = Date.now()

  forgotPasswordOtpStore.set(cleanEmail, {
    otp,
    email: cleanEmail,
    attempts: 0,
    verified: false,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000,
    cooldownUntil: now + 60 * 1000
  })

  const [uPart, dPart] = cleanEmail.split('@')
  const maskedEmail = `${uPart[0]}***${uPart[uPart.length - 1]}@${dPart}`

  console.log(`[FORGOT PASSWORD OTP] Sent reset code ${otp} to ${cleanEmail}`)

  return {
    success: true,
    message: `Password reset code sent to ${maskedEmail}`,
    email: cleanEmail,
    maskedEmail,
    testOtp: otp,
    cooldownSeconds: 60,
    expiresInSeconds: 600
  }
}

/**
 * Reset password using verified OTP
 */
export async function verifyAndResetPasswordOtp({ email, otp, newPassword }) {
  if (!email || !String(email).trim()) {
    throw new ApiError(400, 'Email is required', 'VALIDATION_ERROR')
  }
  const cleanEmail = String(email).trim().toLowerCase()
  const cleanOtp = String(otp || '').trim()

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new ApiError(400, 'Please enter a valid 6-digit OTP code', 'VALIDATION_ERROR')
  }
  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long', 'VALIDATION_ERROR')
  }

  const record = forgotPasswordOtpStore.get(cleanEmail)
  if (!record || record.expiresAt < Date.now()) {
    throw new ApiError(400, 'Reset code has expired. Please request a new one.', 'OTP_EXPIRED')
  }

  record.attempts = (record.attempts || 0) + 1
  if (record.attempts > 5) {
    forgotPasswordOtpStore.delete(cleanEmail)
    throw new ApiError(429, 'Too many invalid attempts. Please request a fresh reset code.', 'MAX_ATTEMPTS_EXCEEDED')
  }

  if (record.otp !== cleanOtp) {
    throw new ApiError(400, 'Incorrect reset code.', 'INVALID_OTP')
  }

  // Update password in Supabase Auth
  const db = adminDb()
  const { data: usersData, error: listErr } = await db.auth.admin.listUsers({ perPage: 500 })
  if (listErr) throw listErr

  const targetUser = usersData?.users?.find(u => u.email?.toLowerCase() === cleanEmail)
  if (!targetUser) {
    throw new ApiError(404, 'User account not found', 'USER_NOT_FOUND')
  }

  const { error: updateErr } = await db.auth.admin.updateUserById(targetUser.id, {
    password: newPassword
  })
  if (updateErr) throw updateErr

  forgotPasswordOtpStore.delete(cleanEmail)

  return {
    success: true,
    message: 'Your password has been successfully reset! You can now log in.'
  }
}




