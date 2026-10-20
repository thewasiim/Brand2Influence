import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText, required } from '../utils/api-error.js'
import { CURATED_BRANDS } from './brand.service.js'
import { getMemoryPostsForUser } from './social.service.js'

export const CURATED_CREATORS = []

const dto = (p, user = {}) => {
  const posts = p.posts || p.rate_card?.posts || []
  return {
    id: p.user_id,
    userId: p.user_id,
    name: user.name || p.name || 'Creator',
    username: p.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'creator'),
    niche: p.niche || 'Digital Creator',
    followersCount: (p.followers_count !== undefined && p.followers_count !== null) ? Number(p.followers_count) : 0,
    engagementRate: (p.engagement_rate !== undefined && p.engagement_rate !== null) ? Number(p.engagement_rate) : 0,
    rateCard: p.rate_card || {},
    portfolioLinks: p.portfolio_links || [],
    location: p.location || 'India',
    bio: p.bio || '',
    profileImageUrl: p.profile_image_url || null,
    status: p.status || 'published',
    posts: posts
  }
}

export async function list(filters = {}) {
  const db = adminDb()
  let q = db.from('influencer_profiles').select('*').eq('status', 'published')

  if (filters.niche && filters.niche !== 'All' && filters.niche !== 'All Niches') {
    q = q.ilike('niche', `%${filters.niche}%`)
  }

  if (filters.location && filters.location !== 'All' && filters.location !== 'All locations') {
    q = q.ilike('location', `%${filters.location}%`)
  }

  if (filters.followersMin) {
    q = q.gte('followers_count', Number(filters.followersMin))
  }

  if (filters.followersMax) {
    q = q.lte('followers_count', Number(filters.followersMax))
  }

  const { data, error } = await q.order('followers_count', { ascending: false }).limit(60)
  if (error) throw error

  const ids = (data || []).map(x => x.user_id)
  const { data: users, error: userError } = ids.length
    ? await db.from('users').select('id,name').in('id', ids)
    : { data: [] }
  if (userError) throw userError

  const lookup = Object.fromEntries((users || []).map(x => [x.id, x]))
  let dbItems = (data || []).map(x => dto(x, lookup[x.user_id]))

  // Merge with curated creators if db items are fewer than curated list
  let items = [...dbItems]

  if (filters.niche && filters.niche !== 'All' && filters.niche !== 'All Niches') {
    const n = filters.niche.toLowerCase()
    items = items.filter(x => x.niche?.toLowerCase().includes(n))
  }

  if (filters.location && filters.location !== 'All' && filters.location !== 'All locations') {
    const loc = filters.location.toLowerCase()
    items = items.filter(x => x.location?.toLowerCase().includes(loc))
  }

  if (filters.followersMin) {
    const min = Number(filters.followersMin)
    items = items.filter(x => Number(x.followersCount || 0) >= min)
  }

  if (filters.followersMax) {
    const max = Number(filters.followersMax)
    items = items.filter(x => Number(x.followersCount || 0) <= max)
  }

  if (filters.budget) {
    const maxBudget = Number(filters.budget)
    if (!Number.isNaN(maxBudget) && maxBudget > 0) {
      items = items.filter(x => (x.rateCard?.reel || 0) <= maxBudget)
    }
  }

  if (filters.search) {
    const s = filters.search.toLowerCase().trim()
    items = items.filter(x =>
      x.name?.toLowerCase().includes(s) ||
      x.niche?.toLowerCase().includes(s) ||
      x.location?.toLowerCase().includes(s) ||
      x.bio?.toLowerCase().includes(s) ||
      x.username?.toLowerCase().includes(s)
    )
  }

  return { items }
}

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getById(id) {
  if (!id) throw new ApiError(404, 'Creator profile not found', 'NOT_FOUND')
  const cleanId = String(id).replace(/^@/, '').trim()

  
  // 2. Check curated brands if opened from creator route
  const curatedBrand = CURATED_BRANDS.find(
    b => b.id === cleanId ||
         b.userId === cleanId ||
         b.businessName?.toLowerCase() === cleanId.toLowerCase() ||
         b.businessName?.toLowerCase().replace(/\s+/g, '') === cleanId.toLowerCase().replace(/\s+/g, '')
  )
  if (curatedBrand) {
    return {
      id: curatedBrand.id,
      userId: curatedBrand.userId,
      name: curatedBrand.businessName,
      username: curatedBrand.businessName.toLowerCase().replace(/\s+/g, ''),
      niche: curatedBrand.businessType || 'Brand',
      role: 'brand',
      followersCount: 0,
      engagementRate: 0,
      rateCard: {},
      portfolioLinks: [],
      location: curatedBrand.location || 'India',
      bio: curatedBrand.description || '',
      profileImageUrl: null,
      status: 'published',
      posts: []
    }
  }

  const db = adminDb()

  // 3. If cleanId is not a valid UUID, attempt looking up by name, email, or handle
  if (!IS_UUID.test(cleanId)) {
    try {
      const { data: userByName } = await db.from('users').select('id, name, email').ilike('name', cleanId).maybeSingle()
      if (userByName) return getById(userByName.id)

      const { data: userByEmail } = await db.from('users').select('id').ilike('email', cleanId).maybeSingle()
      if (userByEmail) return getById(userByEmail.id)

      const { data: infProfiles } = await db.from('influencer_profiles').select('user_id, rate_card')
      const matched = (infProfiles || []).find(inf => {
        const handle = inf.rate_card?.instagram_handle?.replace(/^@/, '')?.toLowerCase()
        const u = inf.rate_card?.username?.toLowerCase()
        return handle === cleanId.toLowerCase() || u === cleanId.toLowerCase()
      })
      if (matched) return getById(matched.user_id)
    } catch {
      // ignore
    }
    throw new ApiError(404, 'Creator profile not found', 'NOT_FOUND')
  }

  // 4. Fetch posts for this user (both DB and in-memory posts)
  let userPosts = []
  try {
    const { data: pData } = await db.from('posts').select('id, media_url, media_type, thumbnail_url, caption, likes_count, created_at').eq('user_id', cleanId).order('created_at', { ascending: false })
    if (pData && pData.length > 0) {
      userPosts = pData.map(p => ({
        id: p.id,
        type: p.media_type || (p.media_url?.includes('.mp4') ? 'video' : 'image'),
        mediaUrl: p.media_url,
        thumbnailUrl: p.thumbnail_url || p.media_url,
        caption: p.caption || '',
        likesCount: p.likes_count || 0,
        createdAt: p.created_at
      }))
    }
  } catch (err) {
    console.warn('Posts lookup warning in getById:', err.message)
  }

  // Merge in-memory posts
  const memPosts = getMemoryPostsForUser(cleanId).map(p => ({
    id: p.id,
    type: p.media_type || (p.media_url?.includes('.mp4') ? 'video' : 'image'),
    mediaUrl: p.media_url,
    thumbnailUrl: p.thumbnail_url || p.media_url,
    caption: p.caption || '',
    likesCount: p.likes_count || 0,
    createdAt: p.created_at
  }))
  const seenPostIds = new Set(userPosts.map(p => p.id))
  userPosts = [...memPosts.filter(p => !seenPostIds.has(p.id)), ...userPosts]

  // 5. Query influencer_profiles table
  const { data, error } = await db.from('influencer_profiles').select('*').eq('user_id', cleanId).maybeSingle()
  if (error) throw error

  if (data) {
    const { data: user } = await db.from('users').select('id,name').eq('id', cleanId).maybeSingle()
    const result = dto(data, user)
    result.posts = userPosts.length > 0 ? userPosts : (result.posts || [])
    return result
  }

  // 6. Check if user exists in users table with role 'influencer' or 'brand'
  const { data: user } = await db.from('users').select('id, name, email, role').eq('id', cleanId).maybeSingle()
  if (user) {
    const { data: brandProfile } = await db.from('brand_profiles').select('*').eq('user_id', cleanId).maybeSingle()
    if (brandProfile || user.role === 'brand') {
      return {
        id: user.id,
        userId: user.id,
        name: brandProfile?.business_name || user.name || 'Brand Partner',
        username: (brandProfile?.business_name || user.name || 'brand').toLowerCase().replace(/\s+/g, ''),
        niche: brandProfile?.business_type || 'Brand',
        role: 'brand',
        followersCount: 0,
        engagementRate: 0,
        rateCard: {},
        portfolioLinks: [],
        location: brandProfile?.location || 'India',
        bio: brandProfile?.description || '',
        profileImageUrl: null,
        status: 'published',
        posts: userPosts
      }
    }

    return {
      id: user.id,
      userId: user.id,
      name: user.name || 'Creator',
      username: user.name?.toLowerCase().replace(/\s+/g, '') || 'creator',
      niche: 'Digital Creator',
      followersCount: 0,
      engagementRate: 0,
      rateCard: {},
      portfolioLinks: [],
      location: 'India',
      bio: '',
      profileImageUrl: null,
      status: 'published',
      posts: userPosts
    }
  }

  throw new ApiError(404, 'Creator profile not found', 'NOT_FOUND')
}

export async function save(user, payload) {
  if (user.role !== 'influencer' && user.role !== 'admin') {
    throw new ApiError(403, 'Influencer role required', 'FORBIDDEN')
  }

  const existingRateCard = payload.rateCard || {}
  if (payload.posts) {
    existingRateCard.posts = payload.posts
  }

  const nicheClean = validateBoundedText(payload.niche || 'Digital Creator', 'Niche', { max: 100, required: false })
  const followersClean = validateInteger(payload.followersCount, 'Followers count', { min: 0, defaultValue: 0 })
  const bioClean = validateBoundedText(payload.bio || '', 'Bio', { max: 1500, required: false })
  const locClean = validateBoundedText(payload.location || 'India', 'Location', { max: 100, required: false })

  const record = {
    user_id: user.id,
    niche: nicheClean,
    followers_count: followersClean,
    engagement_rate: payload.engagementRate !== undefined && payload.engagementRate !== null ? Number(payload.engagementRate) : 0,
    rate_card: existingRateCard,
    portfolio_links: Array.isArray(payload.portfolioLinks) ? payload.portfolioLinks : [],
    location: locClean,
    bio: bioClean,
    profile_image_url: payload.profileImageUrl || null,
    status: payload.status === 'draft' ? 'draft' : 'published'
  }

  const { data, error } = await adminDb().from('influencer_profiles').upsert(record, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  if (payload.name) {
    await adminDb().from('users').update({ name: payload.name }).eq('id', user.id)
  }
  return dto(data, { name: payload.name || user.name })
}

export async function addPost(user, postData) {
  if (user.role !== 'influencer' && user.role !== 'admin') {
    throw new ApiError(403, 'Influencer role required', 'FORBIDDEN')
  }
  const db = adminDb()
  const { data: profile } = await db.from('influencer_profiles').select('*').eq('user_id', user.id).maybeSingle()

  const newPost = {
    id: 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    type: postData.type === 'video' ? 'video' : 'image',
    mediaUrl: postData.mediaUrl || postData.url || '',
    thumbnailUrl: postData.thumbnailUrl || postData.mediaUrl || '',
    caption: boundedText(postData.caption || '', 'caption', 1000),
    likesCount: Math.floor(Math.random() * 50) + 10,
    viewsCount: postData.type === 'video' ? Math.floor(Math.random() * 500) + 100 : undefined,
    createdAt: new Date().toISOString()
  }

  const existingRateCard = profile?.rate_card || {}
  const existingPosts = existingRateCard.posts || []
  const updatedPosts = [newPost, ...existingPosts]

  const updatedRateCard = {
    ...existingRateCard,
    posts: updatedPosts
  }

  const { data: updated, error: updateError } = await db
    .from('influencer_profiles')
    .upsert({
      user_id: user.id,
      niche: profile?.niche || 'Digital Creator',
      followers_count: Number(profile?.followers_count || 0),
      engagement_rate: Number(profile?.engagement_rate || 0),
      location: profile?.location || 'India',
      rate_card: updatedRateCard,
      status: 'published'
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (updateError) throw updateError
  return newPost
}
