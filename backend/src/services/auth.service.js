import { adminDb } from '../config/supabase.js'
import { ApiError } from '../utils/api-error.js'

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
    const igFollowers = Number(roleData?.instagram_followers || roleData?.followers_count || 1000)
    const rateCard = {
      reel: Number(roleData?.reel_price || roleData?.rate_card?.reel || 0),
      story: Number(roleData?.story_price || roleData?.rate_card?.story || 0),
      post: Number(roleData?.post_price || roleData?.rate_card?.post || 0),
      instagram_handle: roleData?.instagram_handle || '',
      instagram_followers: igFollowers,
      facebook_followers: Number(roleData?.facebook_followers || 0),
      youtube_subscribers: Number(roleData?.youtube_subscribers || 0),
      other_platform: roleData?.other_platform || '',
      other_followers: Number(roleData?.other_followers || 0),
      city: location?.trim() || '',
      pincode: pincode?.trim() || ''
    }

    const { error: infError } = await db.from('influencer_profiles').upsert({
      user_id: userId,
      niche: roleData?.niche || 'Lifestyle',
      followers_count: igFollowers,
      engagement_rate: Number(roleData?.engagement_rate) || 4.5,
      rate_card: rateCard,
      portfolio_links: Array.isArray(roleData?.portfolio_links) ? roleData.portfolio_links : [],
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
      ...(infData.instagram_followers !== undefined ? { instagram_followers: Number(infData.instagram_followers) } : {}),
      ...(infData.facebook_followers !== undefined ? { facebook_followers: Number(infData.facebook_followers) } : {}),
      ...(infData.youtube_subscribers !== undefined ? { youtube_subscribers: Number(infData.youtube_subscribers) } : {}),
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
