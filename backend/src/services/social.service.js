import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText } from '../utils/api-error.js'
import { CURATED_CREATORS } from './influencer.service.js'
import { CURATED_BRANDS } from './brand.service.js'

// ─── FOLLOW ───────────────────────────────────────────────────────────────────

export async function followUser(followerId, followingId) {
  if (followerId === followingId) throw new ApiError(400, 'Cannot follow yourself')
  const { error } = await adminDb()
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
  if (error && error.code !== '23505') throw new ApiError(500, error.message)
  return { success: true }
}

export async function unfollowUser(followerId, followingId) {
  const { error } = await adminDb()
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  if (error) throw new ApiError(500, error.message)
  return { success: true }
}

export async function getFollowers(userId) {
  const { data, error } = await adminDb()
    .from('follows')
    .select('follower_id, created_at, users!follows_follower_id_fkey(id, name, role)')
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new ApiError(500, error.message)
  return (data || []).map(r => ({ ...r.users, followedAt: r.created_at }))
}

export async function getFollowing(userId) {
  const { data, error } = await adminDb()
    .from('follows')
    .select('following_id, created_at, users!follows_following_id_fkey(id, name, role)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new ApiError(500, error.message)
  return (data || []).map(r => ({ ...r.users, followedAt: r.created_at }))
}

export async function getFollowStatus(viewerId, targetId) {
  if (!viewerId || !targetId) return { isFollowing: false, followersCount: 0, followingCount: 0 }
  const [followRow, followersCount, followingCount] = await Promise.all([
    adminDb().from('follows').select('follower_id').eq('follower_id', viewerId).eq('following_id', targetId).maybeSingle(),
    adminDb().from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', targetId),
    adminDb().from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', targetId),
  ])
  return {
    isFollowing: !!followRow.data,
    followersCount: followersCount.count || 0,
    followingCount: followingCount.count || 0,
  }
}

// ─── CURATED POSTS HELPER ─────────────────────────────────────────────────────

function buildCuratedPosts() {
  const posts = []
  for (const creator of CURATED_CREATORS) {
    for (const p of creator.posts || []) {
      posts.push({
        id: p.id,
        user_id: creator.userId,
        media_url: p.mediaUrl,
        media_type: p.type,
        thumbnail_url: p.thumbnailUrl || null,
        caption: p.caption,
        likes_count: p.likesCount || 0,
        created_at: p.createdAt,
        isLikedByViewer: false,
        author: {
          id: creator.userId,
          name: creator.name,
          role: 'influencer',
          avatarUrl: creator.profileImageUrl,
        },
      })
    }
  }
  return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

// ─── POSTS ────────────────────────────────────────────────────────────────────

const POST_SELECT = 'id, user_id, media_url, media_type, thumbnail_url, caption, likes_count, created_at, users(id, name, role, influencer_profiles(profile_image_url))'

function enrichPost(post) {
  return {
    ...post,
    isLikedByViewer: false,
    author: post.users
      ? {
          id: post.users.id,
          name: post.users.name,
          role: post.users.role,
          avatarUrl: post.users.influencer_profiles?.profile_image_url || null,
        }
      : null,
  }
}

export async function getFeed(userId, page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    // Get IDs of users the current user follows
    const { data: followRows } = await adminDb()
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    const followingIds = (followRows || []).map(r => r.following_id)
    const authorIds = [userId, ...followingIds]

    // select first, then filter/order/range
    const { data, error } = await adminDb()
      .from('posts')
      .select(POST_SELECT)
      .in('user_id', authorIds)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const posts = (data || []).map(enrichPost)

    // Enrich liked-by-viewer
    if (userId && posts.length) {
      const { data: likedRows } = await adminDb()
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', posts.map(p => p.id))
      const likedSet = new Set((likedRows || []).map(r => r.post_id))
      posts.forEach(p => { p.isLikedByViewer = likedSet.has(p.id) })
    }

    const suggested = posts.length === 0 ? await getSuggestedUsers(userId) : []
    return { items: posts, hasMore: posts.length === limit, suggested }
  } catch {
    // Tables not created yet — return curated data as fallback
    const curatedPosts = buildCuratedPosts().slice(from, to + 1)
    const suggested = await getSuggestedUsers(userId).catch(() => [])
    return { items: curatedPosts, hasMore: false, suggested }
  }
}

export async function getExplore(page = 1, limit = 30) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Always include curated posts
  const curatedPosts = buildCuratedPosts()

  try {
    // select first, then order/range
    const { data, error } = await adminDb()
      .from('posts')
      .select(POST_SELECT)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const dbPosts = (data || []).map(enrichPost)

    // Merge DB posts with curated, deduplicate by id
    const seen = new Set(dbPosts.map(p => p.id))
    const merged = [...dbPosts, ...curatedPosts.filter(p => !seen.has(p.id))]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)

    return { items: merged, hasMore: merged.length === limit }
  } catch {
    // Tables not created yet — return curated only
    const slice = curatedPosts.slice(from, to + 1)
    return { items: slice, hasMore: false }
  }
}

export async function createPost(userId, { mediaUrl, mediaType, caption, thumbnailUrl }) {
  const cleanCaption = boundedText(caption || '', 'caption', 2200)
  if (!mediaUrl) throw new ApiError(400, 'mediaUrl is required')

  const { data, error } = await adminDb()
    .from('posts')
    .insert({
      user_id: userId,
      media_url: mediaUrl,
      media_type: mediaType || 'image',
      thumbnail_url: thumbnailUrl || null,
      caption: cleanCaption,
    })
    .select('id, user_id, media_url, media_type, thumbnail_url, caption, likes_count, created_at')
    .single()

  if (error) throw new ApiError(500, error.message)
  return data
}

export async function getUserPosts(userId, page = 1, limit = 12) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    const { data, error } = await adminDb()
      .from('posts')
      .select('id, user_id, media_url, media_type, thumbnail_url, caption, likes_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { items: data || [], hasMore: (data || []).length === limit }
  } catch {
    return { items: [], hasMore: false }
  }
}

// ─── LIKES ────────────────────────────────────────────────────────────────────

export async function likePost(userId, postId) {
  try {
    await adminDb().from('post_likes').insert({ post_id: postId, user_id: userId })

    // Increment count
    const { data } = await adminDb().from('posts').select('likes_count').eq('id', postId).single()
    if (data) {
      await adminDb().from('posts').update({ likes_count: (data.likes_count || 0) + 1 }).eq('id', postId)
    }

    // Insert notification for post owner
    const { data: post } = await adminDb().from('posts').select('user_id').eq('id', postId).single()
    if (post && post.user_id !== userId) {
      await adminDb().from('notifications').insert({ user_id: post.user_id, actor_id: userId, type: 'like', post_id: postId }).catch(() => {})
    }
  } catch {/* ignore if tables not ready */}

  return { success: true }
}

export async function unlikePost(userId, postId) {
  try {
    await adminDb().from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)

    const { data } = await adminDb().from('posts').select('likes_count').eq('id', postId).single()
    if (data) {
      await adminDb().from('posts').update({ likes_count: Math.max(0, (data.likes_count || 0) - 1) }).eq('id', postId)
    }
  } catch {/* ignore if tables not ready */}

  return { success: true }
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export async function getNotifications(userId, page = 1, limit = 30) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    const { data, error } = await adminDb()
      .from('notifications')
      .select('id, type, read, created_at, post_id, users!notifications_actor_id_fkey(id, name, role)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      items: (data || []).map(n => ({
        id: n.id,
        type: n.type,
        read: n.read,
        postId: n.post_id,
        createdAt: n.created_at,
        actor: n.users ? { id: n.users.id, name: n.users.name, role: n.users.role } : null,
      })),
    }
  } catch {
    // Tables not created yet — return empty
    return { items: [] }
  }
}

export async function markNotificationsRead(userId) {
  try {
    await adminDb().from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  } catch {/* ignore */}
  return { success: true }
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

export async function search(query, page = 1, limit = 20) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return { influencers: [], brands: [] }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const curatedInfluencers = CURATED_CREATORS
    .filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.niche.toLowerCase().includes(q) ||
      (c.username || '').toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    )
    .map(c => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      username: c.username,
      niche: c.niche,
      location: c.location,
      followersCount: c.followersCount,
      engagementRate: c.engagementRate,
      profileImageUrl: c.profileImageUrl,
      bio: c.bio,
      role: 'influencer',
    }))

  const curatedBrands = CURATED_BRANDS
    .filter(b =>
      b.businessName.toLowerCase().includes(q) ||
      b.businessType.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    )
    .map(b => ({
      id: b.id,
      userId: b.userId,
      name: b.businessName,
      businessType: b.businessType,
      location: b.location,
      profileImageUrl: b.profileImageUrl || null,
      bio: b.description || '',
      role: 'brand',
    }))

  // Also search DB users (best effort)
  let dbInfluencers = []
  let dbBrands = []
  try {
    const { data: dbUsers } = await adminDb()
      .from('users')
      .select('id, name, role, influencer_profiles(profile_image_url, niche, location), brand_profiles(business_name, business_type, location)')
      .ilike('name', `%${q}%`)
      .range(from, to)

    dbInfluencers = (dbUsers || [])
      .filter(u => u.role === 'influencer')
      .map(u => ({
        id: u.id, userId: u.id, name: u.name,
        niche: u.influencer_profiles?.niche || '',
        location: u.influencer_profiles?.location || '',
        profileImageUrl: u.influencer_profiles?.profile_image_url || null,
        bio: '', role: 'influencer',
      }))

    dbBrands = (dbUsers || [])
      .filter(u => u.role === 'brand')
      .map(u => ({
        id: u.id, userId: u.id,
        name: u.brand_profiles?.business_name || u.name,
        businessType: u.brand_profiles?.business_type || '',
        location: u.brand_profiles?.location || '',
        profileImageUrl: null, bio: '', role: 'brand',
      }))
  } catch {/* DB search unavailable */}

  return {
    influencers: [...curatedInfluencers, ...dbInfluencers],
    brands: [...curatedBrands, ...dbBrands],
  }
}

// ─── SUGGESTED ───────────────────────────────────────────────────────────────

export async function getSuggestedUsers(userId) {
  let followingIds = new Set()
  try {
    const { data: followRows } = await adminDb()
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    followingIds = new Set((followRows || []).map(r => r.following_id))
  } catch {/* ignore */}

  return CURATED_CREATORS
    .filter(c => !followingIds.has(c.userId))
    .slice(0, 6)
    .map(c => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      niche: c.niche,
      followersCount: c.followersCount,
      profileImageUrl: c.profileImageUrl,
      role: 'influencer',
    }))
}
