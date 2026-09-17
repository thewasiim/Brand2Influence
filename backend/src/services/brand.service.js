import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText } from '../utils/api-error.js'

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const CURATED_BRANDS = [
  {
    id: 'b-1',
    userId: 'b-1',
    businessName: 'Blue Tokai Coffee Roasters',
    businessType: 'Food & Beverage',
    budgetRange: '₹15,000–₹50,000',
    location: 'Delhi NCR',
    website: 'https://bluetokaicoffee.com',
    deckLink: 'https://bluetokaicoffee.com/pages/media-kit',
    description: 'India’s premier specialty coffee roaster dedicated to sourcing and brewing single-estate Arabica coffee directly from sustainable Indian farms.',
    activeCampaignsCount: 2,
    campaigns: [
      {
        id: 'camp-101',
        title: 'Monsoon Special Cold Brew & Pour-Over Campaign',
        description: 'Looking for aesthetic food, lifestyle, and coffee creators to showcase our new cold brew blend and daily morning brew routine.',
        budget: 25000,
        currency: 'INR',
        deliverables: '1 Dedicated Reel + 2 Story Highlights',
        slots: 8,
        status: 'active',
        created_at: '2026-03-10T10:00:00Z'
      },
      {
        id: 'camp-102',
        title: 'Café Tasting & Aesthetic Ambience Vlogs',
        description: 'Inviting Mumbai & Bengaluru creators to experience our new flagship cafés and introduce signature sourdough bakes.',
        budget: 18000,
        currency: 'INR',
        deliverables: '1 In-store Experience Reel',
        slots: 5,
        status: 'active',
        created_at: '2026-03-05T12:00:00Z'
      }
    ]
  },
  {
    id: 'b-2',
    userId: 'b-2',
    businessName: 'Kiro Clean Beauty',
    businessType: 'Beauty & Skincare',
    budgetRange: '₹20,000–₹60,000',
    location: 'Mumbai',
    website: 'https://kirobeauty.com',
    deckLink: 'https://kirobeauty.com/brand-brief',
    description: '100% vegan, cruelty-free, high-performance skincare-infused makeup crafted with pure botanical extracts.',
    activeCampaignsCount: 1,
    campaigns: [
      {
        id: 'camp-103',
        title: 'Everyday Glow & Clean Makeup Routine Challenge',
        description: 'Creators will test our 24H serum foundation and botanical lip oils in direct sunlight and humid conditions.',
        budget: 35000,
        currency: 'INR',
        deliverables: '1 Get Ready With Me (GRWM) Reel + 3 High-res product images',
        slots: 10,
        status: 'active',
        created_at: '2026-03-12T09:00:00Z'
      }
    ]
  },
  {
    id: 'b-3',
    userId: 'b-3',
    businessName: 'Mokobara Luggage',
    businessType: 'Travel & Lifestyle',
    budgetRange: '₹30,000–₹1,00,000',
    location: 'Bengaluru',
    website: 'https://mokobara.com',
    deckLink: 'https://mokobara.com/influencer-brief',
    description: 'Design-led premium travel gear and luggage thoughtfully engineered to make mindful travel effortless and joyful.',
    activeCampaignsCount: 1,
    campaigns: [
      {
        id: 'camp-104',
        title: 'Summer Getaway Cabin Carry-On Showcase',
        description: 'Pack-with-me travel vlogs highlighting Mokobara Cabin Pro luggage durability and silent spinner wheels.',
        budget: 45000,
        currency: 'INR',
        deliverables: '1 Travel Packing Reel + 1 Story link set',
        slots: 6,
        status: 'active',
        created_at: '2026-03-08T14:30:00Z'
      }
    ]
  }
]

export async function list(filters = {}) {
  const db = adminDb()
  let query = db.from('brand_profiles').select('*')

  if (filters.businessType && filters.businessType !== 'All' && filters.businessType !== 'All Categories') {
    query = query.ilike('business_type', `%${filters.businessType}%`)
  }

  if (filters.location && filters.location !== 'All' && filters.location !== 'All locations') {
    query = query.ilike('location', `%${filters.location}%`)
  }

  if (filters.search) {
    const s = filters.search.trim()
    query = query.or(`business_name.ilike.%${s}%,business_type.ilike.%${s}%,location.ilike.%${s}%`)
  }

  const { data: brandProfiles, error } = await query.order('updated_at', { ascending: false }).limit(60)
  if (error) throw error

  // Also query users with role 'brand' in case profile hasn't been saved yet or as fallback
  const { data: brandUsers } = await db.from('users').select('id, name, email, created_at').eq('role', 'brand').limit(60)
  const brandUsersMap = Object.fromEntries((brandUsers || []).map(u => [u.id, u]))

  // Merge brandProfiles with any other brand users
  const profilesMap = Object.fromEntries((brandProfiles || []).map(bp => [bp.user_id, bp]))
  const allBrandUserIds = [...new Set([...(brandProfiles || []).map(bp => bp.user_id), ...(brandUsers || []).map(u => u.id)])]

  // Fetch campaign counts for each brand
  const { data: campaigns } = allBrandUserIds.length
    ? await db.from('campaigns').select('id, brand_id, status').in('brand_id', allBrandUserIds)
    : { data: [] }
  const campaignCountMap = {}
  ;(campaigns || []).forEach(c => {
    campaignCountMap[c.brand_id] = (campaignCountMap[c.brand_id] || 0) + 1
  })

  let items = allBrandUserIds.map(uid => {
    const bp = profilesMap[uid]
    const u = brandUsersMap[uid]
    const businessName = bp?.business_name || u?.name || 'Brand'
    const businessType = bp?.business_type || 'Consumer Brand'
    const location = bp?.location || 'India'
    const budgetRange = bp?.budget_range || 'Flexible'
    const description = bp?.description || ''
    const website = bp?.website || ''
    const deckLink = bp?.deck_link || bp?.upload_link || ''
    const logoUrl = bp?.logo_url || null

    return {
      id: uid,
      userId: uid,
      businessName,
      businessType,
      budgetRange,
      location,
      description,
      website,
      deckLink,
      logoUrl,
      activeCampaignsCount: campaignCountMap[uid] || 0,
      user: u || { id: uid, name: businessName }
    }
  })

  // Merge with curated demo brands if db items are fewer than curated list
  const existingUserIds = new Set(items.map(x => x.userId))
  const supplementary = CURATED_BRANDS.filter(b => !existingUserIds.has(b.userId))
  items = [...items, ...supplementary]

  // In-memory text filter fallback if search was provided
  if (filters.search) {
    const s = filters.search.toLowerCase()
    items = items.filter(
      item =>
        item.businessName.toLowerCase().includes(s) ||
        item.businessType.toLowerCase().includes(s) ||
        item.location.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s)
    )
  }

  if (filters.businessType && filters.businessType !== 'All' && filters.businessType !== 'All Categories') {
    const bt = filters.businessType.toLowerCase()
    items = items.filter(item => item.businessType.toLowerCase().includes(bt))
  }

  if (filters.location && filters.location !== 'All' && filters.location !== 'All locations') {
    const loc = filters.location.toLowerCase()
    items = items.filter(item => item.location.toLowerCase().includes(loc))
  }

  return { items }
}

export async function getById(id) {
  // Check curated demo brands first
  const curated = CURATED_BRANDS.find(b => b.id === id || b.userId === id)
  if (curated) return curated

  // If id is not a valid UUID, return 404 instead of querying Postgres UUID columns
  if (!IS_UUID.test(id)) {
    throw new ApiError(404, 'Brand profile not found', 'NOT_FOUND')
  }

  const db = adminDb()
  const { data: brandProfile } = await db.from('brand_profiles').select('*').eq('user_id', id).maybeSingle()
  const { data: user } = await db.from('users').select('id, name, email, created_at, phone').eq('id', id).maybeSingle()

  if (!brandProfile && !user) {
    throw new ApiError(404, 'Brand profile not found', 'NOT_FOUND')
  }

  // Fetch all campaigns created by this brand
  const { data: campaigns, error: campError } = await db
    .from('campaigns')
    .select('*')
    .eq('brand_id', id)
    .order('created_at', { ascending: false })

  if (campError) throw campError

  const brandInfo = {
    id: id,
    userId: id,
    businessName: brandProfile?.business_name || user?.name || 'Brand Partner',
    businessType: brandProfile?.business_type || 'Consumer & Lifestyle Brand',
    budgetRange: brandProfile?.budget_range || 'Flexible',
    location: brandProfile?.location || 'Pan-India',
    description: brandProfile?.description || '',
    website: brandProfile?.website || '',
    deckLink: brandProfile?.deck_link || brandProfile?.upload_link || '',
    logoUrl: brandProfile?.logo_url || null,
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
    campaigns: campaigns || []
  }

  return brandInfo
}

export async function save(user, payload) {
  if (user.role !== 'brand' && user.role !== 'admin') {
    throw new ApiError(403, 'Brand role required', 'FORBIDDEN')
  }
  const record = {
    user_id: user.id,
    business_name: boundedText(payload.businessName || user.name || 'Brand Partner', 'business name', 150),
    business_type: boundedText(payload.businessType || 'Consumer Brand', 'business type', 100),
    budget_range: boundedText(payload.budgetRange || 'Flexible', 'budget range', 100),
    location: boundedText(payload.location || 'Pan-India', 'location', 100),
    updated_at: new Date().toISOString()
  }
  if (payload.website) record.website = String(payload.website).trim()
  if (payload.deckLink || payload.uploadLink) record.deck_link = String(payload.deckLink || payload.uploadLink).trim()
  if (payload.description) record.description = String(payload.description).trim()
  if (payload.logoUrl) record.logo_url = String(payload.logoUrl).trim()

  const { data, error } = await adminDb().from('brand_profiles').upsert(record, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  if (payload.businessName) {
    await adminDb().from('users').update({ name: payload.businessName }).eq('id', user.id)
  }
  return data
}
