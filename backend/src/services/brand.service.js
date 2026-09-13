import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText } from '../utils/api-error.js'

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

  if (allBrandUserIds.length === 0) {
    return { items: [] }
  }

  // Fetch campaign counts for each brand
  const { data: campaigns } = await db.from('campaigns').select('id, brand_id, status').in('brand_id', allBrandUserIds)
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

    return {
      id: uid,
      userId: uid,
      businessName,
      businessType,
      budgetRange,
      location,
      description,
      website,
      activeCampaignsCount: campaignCountMap[uid] || 0,
      user: u || { id: uid, name: businessName }
    }
  })

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
    business_name: boundedText(payload.businessName, 'business name', 150),
    business_type: boundedText(payload.businessType, 'business type', 100),
    budget_range: boundedText(payload.budgetRange, 'budget range', 100),
    location: boundedText(payload.location, 'location', 100),
    updated_at: new Date().toISOString()
  }
  if (payload.website) record.website = String(payload.website).trim()
  if (payload.description) record.description = String(payload.description).trim()

  const { data, error } = await adminDb().from('brand_profiles').upsert(record, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}
