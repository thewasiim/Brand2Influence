import { adminDb } from '../config/supabase.js'
import { ApiError } from '../utils/api-error.js'
import { env } from '../config/env.js'


export async function getMe(auth) {
  const { data, error } = await adminDb().from('users').select('id,name,email,role,phone,is_disabled,profile_status,created_at').eq('id', auth.id).maybeSingle()
  if (error) throw error
  if (data?.is_disabled) throw new ApiError(403, 'This account is disabled', 'ACCOUNT_DISABLED')
  return data || { id: auth.id, name: auth.name || auth.email?.split('@')[0] || '', email: auth.email, role: null }
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

export async function register(payload) {
  const { email, password, name, phone, pincode, location, role, roleData } = payload || {}

  if (!email || !password || !name || !role) {
    throw new ApiError(400, 'Name, email, password, and role are required', 'VALIDATION_ERROR')
  }
  if (!['influencer', 'brand'].includes(role)) {
    throw new ApiError(400, 'Role must be influencer or brand', 'VALIDATION_ERROR')
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters', 'VALIDATION_ERROR')
  }

  const db = adminDb()

  // Create user in Supabase Auth with auto-confirmation
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      phone: phone || '',
      role
    }
  })

  if (authError) {
    throw new ApiError(400, authError.message, 'REGISTRATION_FAILED')
  }

  const userId = authData.user.id

  // Upsert user into public.users
  const { error: userError } = await db.from('users').upsert({
    id: userId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone ? phone.trim() : null,
    role,
    profile_status: 'active'
  }, { onConflict: 'id' })

  if (userError) {
    console.error('Error inserting public.users on register:', userError)
  }

  const locStr = [location?.trim(), pincode?.trim()].filter(Boolean).join(' - ') || 'India'

  if (role === 'influencer') {
    const igFollowers = Number(roleData?.instagram_followers || 0)
    const ytSubscribers = Number(roleData?.youtube_subscribers || 0)
    const snapSubscribers = Number(roleData?.snapchat_subscribers || 0)
    const fbFollowers = Number(roleData?.facebook_followers || 0)

    const totalFollowers = igFollowers || ytSubscribers || snapSubscribers || Number(roleData?.followers_count) || 1000

    const portfolioLinks = [
      roleData?.instagram_url,
      roleData?.youtube_url,
      roleData?.snapchat_url,
      ...(Array.isArray(roleData?.portfolio_links) ? roleData.portfolio_links : [])
    ].filter(Boolean)

    const rateCard = {
      reel: Number(roleData?.reel_price || roleData?.rate_card?.reel || 0),
      story: Number(roleData?.story_price || roleData?.rate_card?.story || 0),
      post: Number(roleData?.post_price || roleData?.rate_card?.post || 0),
      instagram_handle: roleData?.instagram_handle || '',
      instagram_url: roleData?.instagram_url || (roleData?.instagram_handle ? `https://instagram.com/${roleData.instagram_handle.replace('@', '')}` : ''),
      instagram_followers: igFollowers,
      youtube_url: roleData?.youtube_url || '',
      youtube_subscribers: ytSubscribers,
      snapchat_url: roleData?.snapchat_url || '',
      snapchat_subscribers: snapSubscribers,
      facebook_followers: fbFollowers,
      facebook_url: roleData?.facebook_url || '',
      other_platform: roleData?.other_platform || '',
      other_followers: Number(roleData?.other_followers || 0),
      city: location?.trim() || '',
      pincode: pincode?.trim() || '',
      social_links: {
        instagram: { handle: roleData?.instagram_handle || '', url: roleData?.instagram_url || '', followers: igFollowers },
        youtube: { url: roleData?.youtube_url || '', subscribers: ytSubscribers },
        snapchat: { url: roleData?.snapchat_url || '', subscribers: snapSubscribers }
      }
    }

    const { error: infError } = await db.from('influencer_profiles').upsert({
      user_id: userId,
      niche: roleData?.niche || 'Lifestyle',
      followers_count: totalFollowers,
      engagement_rate: Number(roleData?.engagement_rate) || 4.5,
      rate_card: rateCard,
      portfolio_links: portfolioLinks,
      location: locStr,
      bio: roleData?.bio || `Content creator specializing in ${roleData?.niche || 'Lifestyle'}.`,
      status: 'published'
    }, { onConflict: 'user_id' })

    if (infError) {
      console.error('Error inserting influencer profile:', infError)
    }
  } else if (role === 'brand') {
    const { error: brandError } = await db.from('brand_profiles').upsert({
      user_id: userId,
      business_name: roleData?.business_name || name,
      business_type: roleData?.business_type || roleData?.category || 'E-commerce & Retail',
      budget_range: roleData?.budget_range || '₹25,000 - ₹1,00,000',
      location: locStr
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
      followers_count: Number(infData.followers_count || infData.followersCount || updatedRateCard.instagram_followers || existingInf?.followers_count || 1000),
      engagement_rate: Number(infData.engagement_rate || infData.engagementRate || existingInf?.engagement_rate || 4.5),
      rate_card: updatedRateCard,
      portfolio_links: Array.isArray(infData.portfolio_links) ? infData.portfolio_links : (existingInf?.portfolio_links || []),
      location: loc,
      bio: infData.bio !== undefined ? infData.bio : (existingInf?.bio || ''),
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

  // 5. Generate magic link login token from Supabase
  const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email
  })

  const hashedToken = linkData?.properties?.hashed_token || ''
  const emailOtp = linkData?.properties?.email_otp || ''
  const redirectTo = linkData?.properties?.redirect_to || ''

  return {
    userId,
    email,
    name,
    role: assignedRole,
    picture,
    hashedToken,
    emailOtp,
    frontendRedirectUrl: `${env.frontendOrigin}/auth/callback?email=${encodeURIComponent(email)}&token=${encodeURIComponent(hashedToken || emailOtp)}&role=${encodeURIComponent(assignedRole || '')}`
  }
}

