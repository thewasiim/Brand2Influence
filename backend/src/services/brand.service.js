import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText } from '../utils/api-error.js'
import { CURATED_CREATORS } from './influencer.service.js'

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
    activeCampaignsCount: 3,
    campaigns: [
      {
        id: 'camp-2',
        title: 'Cold Brew Starter Kit Unboxing & Recipe',
        productName: 'Cold Brew Specialty Starter Kit & Tumbler',
        description: 'Seeking food & coffee creators to craft creative iced coffee recipes using our specialty cold brew blends and showcase slow brewing rituals.',
        budget: 25000,
        budget_range: '₹15,000 – ₹35,000',
        currency: 'INR',
        platform: 'Instagram / YouTube',
        niche: 'Food & Beverage',
        deliverables: ['1 Dedicated Reel', '1 Carousel Post', '2 Story Highlights'],
        reelsCount: 1,
        postsCount: 1,
        storiesCount: 2,
        deadline: '28 Apr 2026',
        target_followers_min: 15000,
        slots: 8,
        status: 'active',
        created_at: '2026-03-10T10:00:00Z'
      },
      {
        id: 'camp-101',
        title: 'Monsoon Special Single-Estate Pour-Over Campaign',
        productName: 'Estate Reserve Arabica Coffee Beans',
        description: 'Looking for aesthetic food, lifestyle, and coffee creators to showcase our new single-estate blend and daily morning brew routine.',
        budget: 25000,
        budget_range: '₹20,000 – ₹40,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Food & Beverage',
        deliverables: ['1 Dedicated Reel', '2 Story Highlights'],
        reelsCount: 1,
        postsCount: 0,
        storiesCount: 2,
        deadline: '05 May 2026',
        target_followers_min: 5000,
        slots: 8,
        status: 'active',
        created_at: '2026-03-10T10:00:00Z'
      },
      {
        id: 'camp-102',
        title: 'Café Tasting & Aesthetic Ambience Vlogs',
        productName: 'Blue Tokai Flagship Café Experience',
        description: 'Inviting Mumbai & Bengaluru creators to experience our new flagship cafés and introduce signature sourdough bakes.',
        budget: 18000,
        budget_range: '₹18,000 – ₹30,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Food & Travel',
        deliverables: ['1 In-store Experience Reel', '3 Stories'],
        reelsCount: 1,
        postsCount: 0,
        storiesCount: 3,
        deadline: '12 May 2026',
        target_followers_min: 10000,
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
    activeCampaignsCount: 2,
    campaigns: [
      {
        id: 'camp-3',
        title: 'Clean Barrier Repair Serum Campaign',
        productName: 'Botanical Ceramide Skin Barrier Repair Serum',
        description: 'Ingredient-first skincare review educating followers on ceramides, hydration, and skin barrier health in direct sunlight and humidity.',
        budget: 35000,
        budget_range: '₹20,000 – ₹50,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Beauty & Skincare',
        deliverables: ['1 Dedicated Reel', '1 Carousel Infographic', '2 Story Highlights'],
        reelsCount: 1,
        postsCount: 1,
        storiesCount: 2,
        deadline: '25 Apr 2026',
        target_followers_min: 25000,
        slots: 10,
        status: 'active',
        created_at: '2026-03-12T09:00:00Z'
      },
      {
        id: 'camp-103',
        title: 'Everyday Glow & Clean Makeup Routine Challenge',
        productName: '24H Serum Foundation & Tinted Botanical Lip Oils',
        description: 'Creators will test our 24H serum foundation and botanical lip oils in direct sunlight and humid conditions.',
        budget: 40000,
        budget_range: '₹25,000 – ₹60,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Beauty & Skincare',
        deliverables: ['1 GRWM Reel', '2 High-res Posts', '3 Stories'],
        reelsCount: 1,
        postsCount: 2,
        storiesCount: 3,
        deadline: '10 May 2026',
        target_followers_min: 8000,
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
    activeCampaignsCount: 2,
    campaigns: [
      {
        id: 'camp-4',
        title: 'Minimalist Travel Backpack Durability Showcase',
        productName: 'Cabin Pro Minimalist Travel Backpack',
        description: 'Calling travel and lifestyle creators to test and showcase transit durability, packing capacity, and airport aesthetics on upcoming weekend trips.',
        budget: 55000,
        budget_range: '₹35,000 – ₹80,000',
        currency: 'INR',
        platform: 'YouTube / Instagram',
        niche: 'Travel & Lifestyle',
        deliverables: ['1 Vlog Integration Reel', '1 Feed Post', '3 Stories'],
        reelsCount: 1,
        postsCount: 1,
        storiesCount: 3,
        deadline: '05 May 2026',
        target_followers_min: 40000,
        slots: 5,
        status: 'active',
        created_at: '2026-03-08T14:30:00Z'
      },
      {
        id: 'camp-104',
        title: 'Summer Getaway Cabin Carry-On Showcase',
        productName: 'Mokobara German Polycarbonate Carry-On Suitcase',
        description: 'Pack-with-me travel vlogs highlighting Mokobara Cabin Pro luggage durability and silent spinner wheels.',
        budget: 65000,
        budget_range: '₹40,000 – ₹90,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Travel & Lifestyle',
        deliverables: ['1 Travel Packing Reel', '2 Story Link Sets'],
        reelsCount: 1,
        postsCount: 0,
        storiesCount: 2,
        deadline: '14 May 2026',
        target_followers_min: 15000,
        slots: 6,
        status: 'active',
        created_at: '2026-03-08T14:30:00Z'
      }
    ]
  },
  {
    id: 'b-loom',
    userId: 'b-loom',
    businessName: 'The Loom Co.',
    businessType: 'Sustainable Fashion',
    budgetRange: '₹25,000–₹45,000',
    location: 'Mumbai / Delhi NCR',
    website: 'https://theloom.in',
    deckLink: 'https://theloom.in/lookbook',
    description: 'Artisanal Indian handloom & sustainable organic cotton label bringing heritage craftsmanship into modern everyday aesthetics.',
    activeCampaignsCount: 2,
    campaigns: [
      {
        id: 'camp-1',
        title: 'Summer Organic Linen & Cotton Capsule',
        productName: 'Handcrafted Summer Linen & Cotton Apparel',
        description: 'Looking for sustainable fashion stylists for styling reels featuring our handcrafted summer linen collection. Creators will highlight organic fabrics, breathability, and versatile daytime styling tips.',
        budget: 35000,
        budget_range: '₹25,000 – ₹45,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Fashion',
        deliverables: ['2 Dedicated Reels', '1 Carousel Post', '3 Stories with Link'],
        reelsCount: 2,
        postsCount: 1,
        storiesCount: 3,
        deadline: '30 Apr 2026',
        target_followers_min: 20000,
        slots: 6,
        status: 'active',
        created_at: '2026-03-14T09:00:00Z'
      },
      {
        id: 'camp-105',
        title: 'Artisanal Handloom Festive Capsule',
        productName: 'Pure Chanderi & Mulberry Silk Festive Edit',
        description: 'Calling heritage fashion and slow-living creators to capture the elegance of traditional weave patterns for our upcoming festive drop.',
        budget: 42000,
        budget_range: '₹30,000 – ₹55,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Fashion & Handloom',
        deliverables: ['1 Styling Reel', '2 High-res Posts', '4 Stories'],
        reelsCount: 1,
        postsCount: 2,
        storiesCount: 4,
        deadline: '15 May 2026',
        target_followers_min: 15000,
        slots: 4,
        status: 'active',
        created_at: '2026-03-16T11:00:00Z'
      }
    ]
  },
  {
    id: 'b-cosmix',
    userId: 'b-cosmix',
    businessName: 'Cosmix Wellness',
    businessType: 'Health & Wellness',
    budgetRange: '₹18,000–₹40,000',
    location: 'Pan-India',
    website: 'https://cosmix.in',
    deckLink: 'https://cosmix.in/media',
    description: 'Herbal superfood formulations, adaptogens, and clean plant protein crafted by nutritionists to nourish gut and mental wellness.',
    activeCampaignsCount: 2,
    campaigns: [
      {
        id: 'camp-5',
        title: 'Plant-Based Protein Daily Smoothie Routine',
        productName: 'Clean Plant Protein & Gut Superfood Blend',
        description: 'Partnering with fitness enthusiasts and nutritionists to showcase clean gut-friendly daily protein routines and quick breakfast ideas.',
        budget: 28000,
        budget_range: '₹18,000 – ₹40,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Fitness & Health',
        deliverables: ['1 Dedicated Reel', '1 Recipe Post', '2 Stories with Link'],
        reelsCount: 1,
        postsCount: 1,
        storiesCount: 2,
        deadline: '02 May 2026',
        target_followers_min: 15000,
        slots: 8,
        status: 'active',
        created_at: '2026-03-06T11:00:00Z'
      },
      {
        id: 'camp-106',
        title: '30-Day Gut Glow & Hormonal Balance Challenge',
        productName: 'Herbal Adaptogenic Balance Formula',
        description: 'Educate women on herbal adaptogens, cycle syncing, and everyday stress relief with certified nutritionists.',
        budget: 34000,
        budget_range: '₹22,000 – ₹45,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Wellness',
        deliverables: ['2 Dedicated Reels', '3 Stories'],
        reelsCount: 2,
        postsCount: 0,
        storiesCount: 3,
        deadline: '12 May 2026',
        target_followers_min: 10000,
        slots: 5,
        status: 'active',
        created_at: '2026-03-09T14:00:00Z'
      }
    ]
  },
  {
    id: 'b-sleepyowl',
    userId: 'b-sleepyowl',
    businessName: 'Sleepy Owl Goods',
    businessType: 'Tech & Lifestyle',
    budgetRange: '₹20,000–₹45,000',
    location: 'Delhi NCR / Bengaluru',
    website: 'https://sleepyowl.co',
    deckLink: 'https://sleepyowl.co/creators',
    description: 'Smart ergonomic workspace products and lifestyle essentials designed for creators, remote builders, and modern desks.',
    activeCampaignsCount: 2,
    campaigns: [
      {
        id: 'camp-6',
        title: 'Workstation Aesthetic & Ergonomic Desk Setup',
        productName: 'Minimalist Aluminum Laptop Riser & Desk Mat',
        description: 'Showcase productivity rituals, desk aesthetics, ergonomic equipment, and slow coffee routines with tech & lifestyle creators.',
        budget: 32000,
        budget_range: '₹20,000 – ₹45,000',
        currency: 'INR',
        platform: 'Instagram / YouTube',
        niche: 'Tech & Lifestyle',
        deliverables: ['1 Desk Setup Reel', '1 Community Post', '2 Stories'],
        reelsCount: 1,
        postsCount: 1,
        storiesCount: 2,
        deadline: '08 May 2026',
        target_followers_min: 30000,
        slots: 6,
        status: 'active',
        created_at: '2026-03-04T15:00:00Z'
      },
      {
        id: 'camp-107',
        title: 'Night-Owl Deep Work Lighting Showcase',
        productName: 'Smart Ambient Monitor ScreenBar',
        description: 'Nighttime coding and designing workspace tours highlighting minimal cable management and warm ambient monitor backlighting.',
        budget: 38000,
        budget_range: '₹25,000 – ₹50,000',
        currency: 'INR',
        platform: 'Instagram',
        niche: 'Tech & Productivity',
        deliverables: ['1 Night Setup Reel', '2 Story Highlights'],
        reelsCount: 1,
        postsCount: 0,
        storiesCount: 2,
        deadline: '18 May 2026',
        target_followers_min: 20000,
        slots: 5,
        status: 'active',
        created_at: '2026-03-07T16:00:00Z'
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

function extractDeckLink(desc) {
  if (!desc) return ''
  const match = desc.match(/\[Deck Link:\s*([^\s\]]+)\]/)
  return match ? match[1] : ''
}

function cleanDescriptionText(desc) {
  if (!desc) return ''
  return desc.replace(/\[Deck Link:\s*[^\s\]]+\]/g, '').trim()
}

export async function getById(id) {
  if (!id) throw new ApiError(404, 'Brand profile not found', 'NOT_FOUND')
  const cleanId = String(id).replace(/^@/, '').trim()

  const curated = CURATED_BRANDS.find(
    b => b.id === cleanId ||
         b.userId === cleanId ||
         b.businessName?.toLowerCase() === cleanId.toLowerCase() ||
         b.businessName?.toLowerCase().replace(/\s+/g, '') === cleanId.toLowerCase().replace(/\s+/g, '')
  )
  if (curated) return curated

  const curatedCreator = CURATED_CREATORS.find(
    c => c.id === cleanId ||
         c.userId === cleanId ||
         c.username === cleanId ||
         c.name?.toLowerCase() === cleanId.toLowerCase()
  )
  if (curatedCreator) {
    return {
      id: curatedCreator.id,
      userId: curatedCreator.userId,
      businessName: curatedCreator.name,
      businessType: curatedCreator.niche,
      budgetRange: 'Creator Profile',
      location: curatedCreator.location || 'India',
      description: curatedCreator.bio || '',
      website: '',
      deckLink: '',
      logoUrl: curatedCreator.profileImageUrl,
      user: { id: curatedCreator.userId, name: curatedCreator.name },
      campaigns: []
    }
  }

  const db = adminDb()

  // If cleanId is not a valid UUID, search by business_name or user name
  if (!IS_UUID.test(cleanId)) {
    try {
      const { data: bp } = await db.from('brand_profiles').select('user_id').ilike('business_name', cleanId).maybeSingle()
      if (bp) return getById(bp.user_id)
      const { data: u } = await db.from('users').select('id').ilike('name', cleanId).maybeSingle()
      if (u) return getById(u.id)
    } catch {
      // ignore
    }
    throw new ApiError(404, 'Brand profile not found', 'NOT_FOUND')
  }

  const { data: brandProfile } = await db.from('brand_profiles').select('*').eq('user_id', cleanId).maybeSingle()
  const { data: user } = await db.from('users').select('id, name, email, created_at, phone').eq('id', cleanId).maybeSingle()

  if (!brandProfile && !user) {
    throw new ApiError(404, 'Brand profile not found', 'NOT_FOUND')
  }

  // Fetch all campaigns created by this brand
  let campaigns = []
  try {
    const { data: campData } = await db
      .from('campaigns')
      .select('*')
      .eq('brand_id', cleanId)
      .order('created_at', { ascending: false })
    if (campData) campaigns = campData
  } catch (campErr) {
    console.warn('Campaigns query warning in brand getById:', campErr.message)
  }

  const desc = brandProfile?.description || ''
  const deckLink = extractDeckLink(desc) || brandProfile?.deck_link || brandProfile?.upload_link || ''
  const cleanDesc = cleanDescriptionText(desc) || desc

  const brandInfo = {
    id: id,
    userId: id,
    businessName: brandProfile?.business_name || user?.name || 'Brand Partner',
    businessType: brandProfile?.business_type || 'Consumer & Lifestyle Brand',
    budgetRange: brandProfile?.budget_range || 'Flexible',
    location: brandProfile?.location || 'Pan-India',
    description: cleanDesc,
    website: brandProfile?.website || '',
    deckLink: deckLink,
    logoUrl: null,
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
  if (payload.pincode) record.pincode = String(payload.pincode).trim()

  // Safely encode deckLink into description to avoid missing column error in Postgres
  let cleanDesc = payload.description ? String(payload.description).trim() : ''
  const cleanDeck = (payload.deckLink || payload.uploadLink) ? String(payload.deckLink || payload.uploadLink).trim() : ''
  if (cleanDeck) {
    cleanDesc = cleanDesc ? `${cleanDesc}\n\n[Deck Link: ${cleanDeck}]` : `[Deck Link: ${cleanDeck}]`
  }
  if (cleanDesc) record.description = cleanDesc

  const { data, error } = await adminDb().from('brand_profiles').upsert(record, { onConflict: 'user_id' }).select().single()
  if (error) {
    console.error('Error saving brand profile:', error)
    throw new ApiError(400, error.message || 'Failed to save brand profile', 'SAVE_FAILED')
  }
  if (payload.businessName) {
    await adminDb().from('users').update({ name: payload.businessName }).eq('id', user.id)
  }
  return {
    ...data,
    deckLink: cleanDeck,
    deck_link: cleanDeck
  }
}
