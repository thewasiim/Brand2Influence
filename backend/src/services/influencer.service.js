import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText, required } from '../utils/api-error.js'
import { CURATED_BRANDS } from './brand.service.js'
import { getMemoryPostsForUser } from './social.service.js'

export const CURATED_CREATORS = [
  {
    id: 'c-1',
    userId: '806f7e5d-754c-4c74-8bba-e03f34164a70',
    name: 'Aanya Kapoor',
    username: 'aanyakapoor',
    niche: 'Fashion & Style',
    location: 'Mumbai',
    followersCount: 185000,
    engagementRate: 4.8,
    rateCard: { reel: 4500 },
    portfolioLinks: ['https://instagram.com/reel/example1', 'https://youtube.com/watch?v=example2'],
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    bio: 'Sustainable fashion stylist and editorial creator based in Mumbai. Helping homegrown labels build cult followings.',
    status: 'published',
    posts: [
      {
        id: 'p-1-1',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
        caption: 'Monochrome editorial aesthetics. Styled in sustainable linen for the summer capsule 🌿',
        likesCount: 2420,
        createdAt: '2026-03-12T12:00:00Z'
      },
      {
        id: 'p-1-2',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
        caption: 'Minimalist street silhouettes across South Bombay.',
        likesCount: 1890,
        createdAt: '2026-03-10T14:30:00Z'
      },
      {
        id: 'p-1-3',
        type: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
        caption: '3 Ways to style oversized neutral blazers this season 🎥👗',
        likesCount: 4320,
        viewsCount: 38200,
        createdAt: '2026-03-08T09:15:00Z'
      },
      {
        id: 'p-1-4',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=800',
        caption: 'Warm tones & clean tailoring. Outfit breakdown in bio ✨',
        likesCount: 3100,
        createdAt: '2026-03-05T16:00:00Z'
      },
      {
        id: 'p-1-5',
        type: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
        caption: 'Behind the scenes at Lakmé Fashion Week showcase 🎬',
        likesCount: 5210,
        viewsCount: 49100,
        createdAt: '2026-03-01T11:45:00Z'
      }
    ]
  },
  {
    id: 'c-2',
    userId: 'c-2',
    name: 'Kabir Varma',
    username: 'kabir.eats',
    niche: 'Food & Beverage',
    location: 'Delhi NCR',
    followersCount: 320000,
    engagementRate: 5.4,
    rateCard: { reel: 3800 },
    portfolioLinks: ['https://instagram.com/reel/food_reel1', 'https://youtube.com/foodvlog'],
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    bio: 'Regional street food archivist & micro-brewery storyteller across Delhi, Lucknow, and Jaipur.',
    status: 'published',
    posts: [
      {
        id: 'p-2-1',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
        caption: 'Heritage slow-cooked dum biryani recipe passed down for 3 generations 🍲',
        likesCount: 4520,
        createdAt: '2026-03-14T13:00:00Z'
      },
      {
        id: 'p-2-2',
        type: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
        caption: 'Old Delhi night food trail: Finding the crispiest jalebis at 2 AM 🌙✨',
        likesCount: 7800,
        viewsCount: 82000,
        createdAt: '2026-03-11T18:00:00Z'
      },
      {
        id: 'p-2-3',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',
        caption: 'Artisanal wood-fired pizza review at Gurgaon’s newest sourdough kitchen 🍕',
        likesCount: 3200,
        createdAt: '2026-03-07T15:20:00Z'
      },
      {
        id: 'p-2-4',
        type: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
        caption: 'Farm-to-table culinary workshop with organic growers in Himachal 🥗🌿',
        likesCount: 4900,
        viewsCount: 41000,
        createdAt: '2026-03-03T10:10:00Z'
      }
    ]
  },
  {
    id: 'c-3',
    userId: 'c-3',
    name: 'Dr. Rhea Sen',
    username: 'dr.rheasen',
    niche: 'Beauty & Skincare',
    location: 'Bengaluru',
    followersCount: 95000,
    engagementRate: 6.2,
    rateCard: { reel: 2800 },
    portfolioLinks: ['https://instagram.com/reel/skincare_review'],
    profileImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    bio: 'Dermatologist & science-backed skincare advocate. Zero fluff, ingredient-first reviews.',
    status: 'published',
    posts: [
      {
        id: 'p-3-1',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
        caption: 'Niacinamide vs Salicylic Acid: When and how to layer them safely 🔬✨',
        likesCount: 2900,
        createdAt: '2026-03-13T11:00:00Z'
      },
      {
        id: 'p-3-2',
        type: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512290900672-1f486a24eb5c?auto=format&fit=crop&q=80&w=800',
        caption: 'Derm reacts to viral skincare hacks that are ruining your skin barrier 🧴🚫',
        likesCount: 6100,
        viewsCount: 65400,
        createdAt: '2026-03-09T17:00:00Z'
      },
      {
        id: 'p-3-3',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
        caption: 'Morning sun protection routine for humid Indian summers ☀️🧴',
        likesCount: 3450,
        createdAt: '2026-03-04T08:30:00Z'
      }
    ]
  },
  {
    id: 'c-4',
    userId: 'c-4',
    name: 'Vikramaditya Rao',
    username: 'vikram_fitness',
    niche: 'Fitness & Health',
    location: 'Hyderabad',
    followersCount: 210000,
    engagementRate: 4.2,
    rateCard: { reel: 3500 },
    portfolioLinks: ['https://instagram.com/reel/calisthenics_routine'],
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    bio: 'Calisthenics athlete and high-performance nutrition coach. Championing natural athleticism.',
    status: 'published',
    posts: [
      {
        id: 'p-4-1',
        type: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
        caption: 'Full body calisthenics progression: Master the strict muscle-up 💪🔥',
        likesCount: 5400,
        viewsCount: 58000,
        createdAt: '2026-03-12T07:00:00Z'
      },
      {
        id: 'p-4-2',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
        caption: 'Post-workout recovery protocol & high-protein meal planning 🥑🍗',
        likesCount: 2800,
        createdAt: '2026-03-08T12:15:00Z'
      }
    ]
  },
  {
    id: 'c-5',
    userId: 'c-5',
    name: 'Tara Mukherjee',
    username: 'tara_wanderlust',
    niche: 'Travel & Lifestyle',
    location: 'Goa',
    followersCount: 142000,
    engagementRate: 5.1,
    rateCard: { reel: 4200 },
    portfolioLinks: ['https://instagram.com/reel/goa_homestays'],
    profileImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
    bio: 'Slow-travel photographer and boutique homestay reviewer across South Asia.',
    status: 'published',
    posts: [
      {
        id: 'p-5-1',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
        caption: 'Hidden cliffside sunset spots in South Goa without the crowds 🌊🌅',
        likesCount: 4200,
        createdAt: '2026-03-13T18:30:00Z'
      },
      {
        id: 'p-5-2',
        type: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800',
        caption: '300-year-old Portuguese villa restored into a boutique stay 🏡✨',
        likesCount: 6700,
        viewsCount: 71000,
        createdAt: '2026-03-09T14:00:00Z'
      }
    ]
  },
  {
    id: 'c-6',
    userId: 'c-6',
    name: 'Arjun Mehta',
    username: 'arjun.tech',
    niche: 'Tech & Gadgets',
    location: 'Pune',
    followersCount: 68000,
    engagementRate: 6.8,
    rateCard: { reel: 2200 },
    portfolioLinks: ['https://youtube.com/watch?v=tech_desk_setup'],
    profileImageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    bio: 'Minimalist desk setups, tech reviews, and consumer electronics teardowns.',
    status: 'published',
    posts: [
      {
        id: 'p-6-1',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
        caption: 'Minimal mechanical keyboard build with custom tactile switches ⌨️💡',
        likesCount: 3100,
        createdAt: '2026-03-12T16:00:00Z'
      },
      {
        id: 'p-6-2',
        type: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800',
        caption: 'Ultimate 2026 ergonomic desk setup tour with ambient backlighting 🖥️✨',
        likesCount: 5900,
        viewsCount: 62000,
        createdAt: '2026-03-06T10:00:00Z'
      }
    ]
  }
]

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
  const existingUserIds = new Set(dbItems.map(x => x.userId))
  const supplementary = CURATED_CREATORS.filter(c => !existingUserIds.has(c.userId))
  let items = [...dbItems, ...supplementary]

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

  // 1. Check curated creators first by id, userId, username, or name
  const curated = CURATED_CREATORS.find(
    c => c.id === cleanId ||
         c.userId === cleanId ||
         c.username === cleanId ||
         c.name?.toLowerCase() === cleanId.toLowerCase() ||
         c.name?.toLowerCase().replace(/\s+/g, '') === cleanId.toLowerCase().replace(/\s+/g, '') ||
         (cleanId === '806f7e5d-754c-4c74-8bba-e03f34164a70' && c.id === 'c-1')
  )
  if (curated) return curated

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

  const record = {
    user_id: user.id,
    niche: boundedText(payload.niche || 'Digital Creator', 'niche', 100),
    followers_count: payload.followersCount !== undefined && payload.followersCount !== null ? Number(payload.followersCount) : 0,
    engagement_rate: payload.engagementRate !== undefined && payload.engagementRate !== null ? Number(payload.engagementRate) : 0,
    rate_card: existingRateCard,
    portfolio_links: Array.isArray(payload.portfolioLinks) ? payload.portfolioLinks : [],
    location: boundedText(payload.location || 'India', 'location', 100),
    bio: boundedText(payload.bio || '', 'bio', 1500),
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
