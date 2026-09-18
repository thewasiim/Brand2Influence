import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText } from '../utils/api-error.js'
import { CURATED_BRANDS } from './brand.service.js'

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function create(user, payload) {
  if (user.role !== 'brand' && user.role !== 'admin') {
    throw new ApiError(403, 'Only brands can create campaign advertisements', 'FORBIDDEN')
  }

  const title = boundedText(payload.title, 'title', 200)
  const description = boundedText(payload.description, 'description', 5000)
  const niche = boundedText(payload.niche, 'niche', 100)
  const platform = boundedText(payload.platform || 'Instagram', 'platform', 50)
  const budgetRange = boundedText(payload.budgetRange, 'budget range', 100)
  const location = boundedText(payload.location || 'Remote / All India', 'location', 100)
  const targetFollowersMin = Number.isInteger(payload.targetFollowersMin) && payload.targetFollowersMin >= 0
    ? payload.targetFollowersMin
    : 0

  const deliverables = Array.isArray(payload.deliverables)
    ? payload.deliverables.map(d => String(d).trim()).filter(Boolean)
    : []

  const deadline = payload.deadline ? new Date(payload.deadline).toISOString() : null

  const record = {
    brand_id: user.id,
    title,
    description,
    niche,
    platform,
    deliverables,
    budget_range: budgetRange,
    location,
    target_followers_min: targetFollowersMin,
    status: payload.status && ['active', 'paused', 'closed', 'draft'].includes(payload.status) ? payload.status : 'active',
    deadline,
    updated_at: new Date().toISOString()
  }

  const { data, error } = await adminDb().from('campaigns').insert(record).select().single()
  if (error) throw error
  return data
}

export async function update(user, id, payload) {
  const db = adminDb()
  const { data: existing, error: findError } = await db.from('campaigns').select('*').eq('id', id).maybeSingle()
  if (findError) throw findError
  if (!existing) throw new ApiError(404, 'Campaign advertisement not found', 'NOT_FOUND')

  if (existing.brand_id !== user.id && user.role !== 'admin') {
    throw new ApiError(403, 'You do not own this campaign advertisement', 'FORBIDDEN')
  }

  const patch = { updated_at: new Date().toISOString() }

  if (payload.title !== undefined) patch.title = boundedText(payload.title, 'title', 200)
  if (payload.description !== undefined) patch.description = boundedText(payload.description, 'description', 5000)
  if (payload.niche !== undefined) patch.niche = boundedText(payload.niche, 'niche', 100)
  if (payload.platform !== undefined) patch.platform = boundedText(payload.platform, 'platform', 50)
  if (payload.budgetRange !== undefined) patch.budget_range = boundedText(payload.budgetRange, 'budget range', 100)
  if (payload.location !== undefined) patch.location = boundedText(payload.location, 'location', 100)
  if (payload.targetFollowersMin !== undefined) {
    patch.target_followers_min = Math.max(0, parseInt(payload.targetFollowersMin, 10) || 0)
  }
  if (payload.deliverables !== undefined && Array.isArray(payload.deliverables)) {
    patch.deliverables = payload.deliverables.map(d => String(d).trim()).filter(Boolean)
  }
  if (payload.status !== undefined && ['active', 'paused', 'closed', 'draft'].includes(payload.status)) {
    patch.status = payload.status
  }
  if (payload.deadline !== undefined) {
    patch.deadline = payload.deadline ? new Date(payload.deadline).toISOString() : null
  }

  const { data, error } = await db.from('campaigns').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function remove(user, id) {
  const db = adminDb()
  const { data: existing, error: findError } = await db.from('campaigns').select('*').eq('id', id).maybeSingle()
  if (findError) throw findError
  if (!existing) throw new ApiError(404, 'Campaign advertisement not found', 'NOT_FOUND')

  if (existing.brand_id !== user.id && user.role !== 'admin') {
    throw new ApiError(403, 'You do not own this campaign advertisement', 'FORBIDDEN')
  }

  const { error } = await db.from('campaigns').delete().eq('id', id)
  if (error) throw error
  return { success: true }
}

export const CURATED_CAMPAIGNS = [
  {
    id: 'camp-1',
    title: 'Summer Organic Linen & Cotton Capsule',
    brand_id: 'b-loom',
    brand: {
      id: 'b-loom',
      name: 'The Loom Co.',
      businessName: 'The Loom Co.',
      businessType: 'Sustainable Fashion',
      budgetRange: '₹25,000–₹45,000',
      location: 'Mumbai / Delhi NCR',
      website: 'https://theloom.in',
      deckLink: 'https://theloom.in/lookbook'
    },
    niche: 'Fashion',
    platform: 'Instagram',
    budget_range: '₹25,000 – ₹45,000',
    deliverables: ['2x Reels', '3x Stories'],
    target_followers_min: 20000,
    location: 'Mumbai / Delhi NCR',
    description: 'Looking for sustainable fashion stylists for styling reels featuring our handcrafted summer linen collection. Creators will highlight organic fabrics, breathability, and versatile daytime styling tips.',
    status: 'active',
    slots: 6,
    created_at: '2026-03-14T09:00:00Z'
  },
  {
    id: 'camp-2',
    title: 'Cold Brew Starter Kit Unboxing & Recipe',
    brand_id: 'b-1',
    brand: {
      id: 'b-1',
      name: 'Blue Tokai Coffee Roasters',
      businessName: 'Blue Tokai Coffee Roasters',
      businessType: 'Food & Beverage',
      budgetRange: '₹15,000–₹50,000',
      location: 'Delhi NCR',
      website: 'https://bluetokaicoffee.com'
    },
    niche: 'Food & Beverage',
    platform: 'Instagram / YouTube',
    budget_range: '₹15,000 – ₹35,000',
    deliverables: ['1x Reel', '1x Carousel'],
    target_followers_min: 15000,
    location: 'Pan-India',
    description: 'Seeking food & coffee creators to craft creative iced coffee recipes using our specialty cold brew blends and showcase brewing tutorials.',
    status: 'active',
    slots: 8,
    created_at: '2026-03-10T10:00:00Z'
  },
  {
    id: 'camp-3',
    title: 'Clean Barrier Repair Serum Campaign',
    brand_id: 'b-2',
    brand: {
      id: 'b-2',
      name: 'Kiro Clean Beauty',
      businessName: 'Kiro Clean Beauty',
      businessType: 'Beauty & Skincare',
      budgetRange: '₹20,000–₹60,000',
      location: 'Mumbai',
      website: 'https://kirobeauty.com'
    },
    niche: 'Beauty & Skincare',
    platform: 'Instagram',
    budget_range: '₹20,000 – ₹50,000',
    deliverables: ['1x Reel', '2x Story Highlights'],
    target_followers_min: 25000,
    location: 'Bengaluru / Mumbai',
    description: 'Ingredient-first skincare review educating followers on ceramides, hydration, and skin barrier health in direct sunlight and humidity.',
    status: 'active',
    slots: 10,
    created_at: '2026-03-12T09:00:00Z'
  },
  {
    id: 'camp-4',
    title: 'Minimalist Travel Backpack Durability Showcase',
    brand_id: 'b-3',
    brand: {
      id: 'b-3',
      name: 'Mokobara Luggage',
      businessName: 'Mokobara Luggage',
      businessType: 'Travel & Lifestyle',
      budgetRange: '₹30,000–₹1,00,000',
      location: 'Bengaluru',
      website: 'https://mokobara.com'
    },
    niche: 'Travel & Lifestyle',
    platform: 'YouTube / Instagram',
    budget_range: '₹35,000 – ₹80,000',
    deliverables: ['1x Vlog Integration', '1x Reel'],
    target_followers_min: 40000,
    location: 'Pan-India',
    description: 'Calling travel and lifestyle creators to test and showcase transit durability, packing capacity, and airport aesthetics on upcoming weekend trips.',
    status: 'active',
    slots: 5,
    created_at: '2026-03-08T14:30:00Z'
  },
  {
    id: 'camp-5',
    title: 'Plant-Based Protein Daily Smoothie Routine',
    brand_id: 'b-cosmix',
    brand: {
      id: 'b-cosmix',
      name: 'Cosmix Wellness',
      businessName: 'Cosmix Wellness',
      businessType: 'Health & Wellness',
      budgetRange: '₹18,000–₹40,000',
      location: 'Pan-India',
      website: 'https://cosmix.in'
    },
    niche: 'Fitness & Health',
    platform: 'Instagram',
    budget_range: '₹18,000 – ₹40,000',
    deliverables: ['1x Reel', '2x Stories with Link'],
    target_followers_min: 15000,
    location: 'Pan-India',
    description: 'Partnering with fitness enthusiasts and nutritionists to showcase clean gut-friendly daily protein routines and quick breakfast ideas.',
    status: 'active',
    slots: 8,
    created_at: '2026-03-06T11:00:00Z'
  },
  {
    id: 'camp-6',
    title: 'Workstation Aesthetic & Ergonomic Desk Setup',
    brand_id: 'b-sleepyowl',
    brand: {
      id: 'b-sleepyowl',
      name: 'Sleepy Owl Goods',
      businessName: 'Sleepy Owl Goods',
      businessType: 'Tech & Lifestyle',
      budgetRange: '₹20,000–₹45,000',
      location: 'Delhi NCR / Bengaluru',
      website: 'https://sleepyowl.co'
    },
    niche: 'Tech & Lifestyle',
    platform: 'Instagram / YouTube',
    budget_range: '₹20,000 – ₹45,000',
    deliverables: ['1x Reel', '1x Community Post'],
    target_followers_min: 30000,
    location: 'Delhi NCR / Bengaluru',
    description: 'Showcase productivity rituals, desk aesthetics, ergonomic equipment, and slow coffee routines with tech & lifestyle creators.',
    status: 'active',
    slots: 6,
    created_at: '2026-03-04T15:00:00Z'
  }
]

export async function list(filters = {}) {
  const db = adminDb()
  let query = db.from('campaigns').select('*').order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'active')
  }

  if (filters.niche) {
    query = query.ilike('niche', `%${filters.niche}%`)
  }

  if (filters.platform) {
    query = query.ilike('platform', `%${filters.platform}%`)
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,niche.ilike.%${filters.search}%`)
  }

  let dbCampaigns = []
  try {
    const { data, error } = await query.limit(50)
    if (!error && data) dbCampaigns = data
  } catch (e) {
    // fallback to curated
  }

  // Hydrate brand information for DB items
  const brandIds = [...new Set(dbCampaigns.map(c => c.brand_id))]
  let userMap = {}
  let profileMap = {}
  if (brandIds.length) {
    try {
      const { data: users } = await db.from('users').select('id, name, email').in('id', brandIds)
      const { data: brandProfiles } = await db.from('brand_profiles').select('user_id, business_name, business_type, location').in('user_id', brandIds)
      userMap = Object.fromEntries((users || []).map(u => [u.id, u]))
      profileMap = Object.fromEntries((brandProfiles || []).map(bp => [bp.user_id, bp]))
    } catch (e) {}
  }

  let items = dbCampaigns.map(c => ({
    ...c,
    brand: {
      id: c.brand_id,
      name: userMap[c.brand_id]?.name || 'Brand',
      businessName: profileMap[c.brand_id]?.business_name || userMap[c.brand_id]?.name || 'Brand',
      businessType: profileMap[c.brand_id]?.business_type || 'Brand',
      location: profileMap[c.brand_id]?.location || c.location
    }
  }))

  // Merge with CURATED_CAMPAIGNS
  const existingIds = new Set(items.map(x => x.id))
  let curated = CURATED_CAMPAIGNS.filter(c => !existingIds.has(c.id))

  if (filters.niche && filters.niche !== 'All' && filters.niche !== 'All Niches') {
    const n = filters.niche.toLowerCase()
    curated = curated.filter(c => c.niche?.toLowerCase().includes(n))
  }
  if (filters.platform && filters.platform !== 'All' && filters.platform !== 'All Platforms') {
    const p = filters.platform.toLowerCase()
    curated = curated.filter(c => c.platform?.toLowerCase().includes(p))
  }
  if (filters.search) {
    const s = filters.search.toLowerCase()
    curated = curated.filter(c =>
      c.title?.toLowerCase().includes(s) ||
      c.description?.toLowerCase().includes(s) ||
      c.niche?.toLowerCase().includes(s) ||
      c.brand?.businessName?.toLowerCase().includes(s)
    )
  }

  items = [...items, ...curated]

  return { items }
}

export async function listMine(user) {
  const db = adminDb()
  const { data, error } = await db.from('campaigns').select('*').eq('brand_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return { items: data || [] }
}

export async function getById(id) {
  // Check curated demo campaigns first
  const curatedDirect = CURATED_CAMPAIGNS.find(c => c.id === id)
  if (curatedDirect) return curatedDirect

  for (const b of CURATED_BRANDS) {
    const c = b.campaigns?.find(x => x.id === id)
    if (c) {
      return {
        ...c,
        brand_id: b.id,
        brand: {
          id: b.id,
          name: b.businessName,
          businessName: b.businessName,
          businessType: b.businessType,
          budgetRange: b.budgetRange,
          location: b.location
        }
      }
    }
  }

  if (!IS_UUID.test(id)) {
    throw new ApiError(404, 'Campaign advertisement not found', 'NOT_FOUND')
  }

  const db = adminDb()
  const { data: campaign, error } = await db.from('campaigns').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!campaign) throw new ApiError(404, 'Campaign advertisement not found', 'NOT_FOUND')

  const { data: user } = await db.from('users').select('id, name, email').eq('id', campaign.brand_id).maybeSingle()
  const { data: brandProfile } = await db.from('brand_profiles').select('*').eq('user_id', campaign.brand_id).maybeSingle()

  return {
    ...campaign,
    brand: {
      id: campaign.brand_id,
      name: user?.name || 'Brand',
      businessName: brandProfile?.business_name || user?.name || 'Brand',
      businessType: brandProfile?.business_type || 'Brand',
      budgetRange: brandProfile?.budget_range || '',
      location: brandProfile?.location || campaign.location
    }
  }
}

export async function apply(user, campaignId, payload) {
  if (user.role !== 'influencer') {
    throw new ApiError(403, 'Only creators/influencers can apply to campaign advertisements', 'FORBIDDEN')
  }

  const db = adminDb()
  const { data: campaign, error: campaignError } = await db.from('campaigns').select('*').eq('id', campaignId).maybeSingle()
  if (campaignError) throw campaignError
  if (!campaign) throw new ApiError(404, 'Campaign advertisement not found', 'NOT_FOUND')
  if (campaign.status !== 'active') throw new ApiError(400, 'This campaign is no longer accepting proposals', 'VALIDATION_ERROR')

  const brandId = campaign.brand_id
  const influencerId = user.id

  if (brandId === influencerId) {
    throw new ApiError(400, 'Cannot apply to your own campaign', 'VALIDATION_ERROR')
  }

  // Find or create conversation between brand and influencer
  const { data: existingConv } = await db
    .from('conversations')
    .select('*')
    .eq('brand_id', brandId)
    .eq('influencer_id', influencerId)
    .maybeSingle()

  let conversationId = existingConv?.id

  if (!conversationId) {
    const { data: newConv, error: createConvError } = await db
      .from('conversations')
      .insert({
        brand_id: brandId,
        influencer_id: influencerId,
        campaign_id: campaign.id
      })
      .select()
      .single()

    if (createConvError) throw createConvError
    conversationId = newConv.id
  } else if (!existingConv.campaign_id) {
    // Update conversation with latest campaign context
    await db.from('conversations').update({ campaign_id: campaign.id }).eq('id', conversationId)
  }

  // Format initial proposal message
  const pitch = payload.proposal || payload.message || 'Hello! I am interested in collaborating on this campaign advertisement.'
  const proposedRate = payload.proposedRate ? `\nProposed Rate: ${payload.proposedRate}` : ''
  const content = `📢 Application for [${campaign.title}]:\n${pitch}${proposedRate}`

  const { data: message, error: messageError } = await db
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: influencerId,
      content
    })
    .select()
    .single()

  if (messageError) throw messageError

  return {
    conversationId,
    message,
    campaign
  }
}
