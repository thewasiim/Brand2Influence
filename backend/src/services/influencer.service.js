import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText, required } from '../utils/api-error.js'

const CURATED_CREATORS = [
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
    status: 'published'
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
    status: 'published'
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
    status: 'published'
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
    status: 'published'
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
    status: 'published'
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
    status: 'published'
  }
]

const dto = (p, user = {}) => ({
  id: p.user_id,
  userId: p.user_id,
  name: user.name || p.name || 'Creator',
  username: p.username || null,
  niche: p.niche,
  followersCount: p.followers_count,
  engagementRate: p.engagement_rate,
  rateCard: p.rate_card || {},
  portfolioLinks: p.portfolio_links || [],
  location: p.location,
  bio: p.bio,
  profileImageUrl: p.profile_image_url,
  status: p.status
})

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

export async function getById(id) {
  const db = adminDb()
  const { data, error } = await db.from('influencer_profiles').select('*').eq('user_id', id).maybeSingle()
  if (error) throw error

  if (data) {
    const { data: user } = await db.from('users').select('id,name').eq('id', id).maybeSingle()
    return dto(data, user)
  }

  // Check curated creators fallback by id or userId
  const curated = CURATED_CREATORS.find(c => c.id === id || c.userId === id)
  if (curated) return curated

  // Check if user exists in users table with role 'influencer'
  const { data: user } = await db.from('users').select('id, name, email').eq('id', id).maybeSingle()
  if (user) {
    return {
      id: user.id,
      userId: user.id,
      name: user.name || 'Creator',
      username: user.name?.toLowerCase().replace(/\s+/g, '') || 'creator',
      niche: 'Digital Creator',
      followersCount: 15000,
      engagementRate: 4.5,
      rateCard: { reel: 3000 },
      portfolioLinks: [],
      location: 'Pan-India',
      bio: 'Independent content creator collaborating on brand sponsorships and creative campaigns.',
      profileImageUrl: null,
      status: 'published'
    }
  }

  throw new ApiError(404, 'Influencer profile not found', 'NOT_FOUND')
}

export async function save(user, payload) {
  if (user.role !== 'influencer' && user.role !== 'admin') {
    throw new ApiError(403, 'Influencer role required', 'FORBIDDEN')
  }
  const record = {
    user_id: user.id,
    niche: boundedText(payload.niche, 'niche', 100),
    followers_count: Number(required(payload.followersCount, 'followers count')),
    engagement_rate: Number(required(payload.engagementRate, 'engagement rate')),
    rate_card: payload.rateCard || {},
    portfolio_links: Array.isArray(payload.portfolioLinks) ? payload.portfolioLinks : [],
    location: boundedText(payload.location, 'location', 100),
    bio: boundedText(payload.bio, 'bio', 1500),
    profile_image_url: payload.profileImageUrl || null,
    status: payload.status === 'draft' ? 'draft' : 'published'
  }
  if (!Number.isInteger(record.followers_count) || record.followers_count < 0 || record.engagement_rate < 0 || record.engagement_rate > 100) {
    throw new ApiError(400, 'Invalid audience metrics', 'VALIDATION_ERROR')
  }
  const { data, error } = await adminDb().from('influencer_profiles').upsert(record, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  if (payload.name) {
    await adminDb().from('users').update({ name: payload.name }).eq('id', user.id)
  }
  return dto(data, { name: payload.name || user.name })
}
