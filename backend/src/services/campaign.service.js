import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText } from '../utils/api-error.js'

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

  const { data: campaigns, error } = await query.limit(50)
  if (error) throw error

  if (!campaigns || campaigns.length === 0) {
    return { items: [] }
  }

  // Hydrate brand information
  const brandIds = [...new Set(campaigns.map(c => c.brand_id))]
  const { data: users } = await db.from('users').select('id, name, email').in('id', brandIds)
  const { data: brandProfiles } = await db.from('brand_profiles').select('user_id, business_name, business_type, location').in('user_id', brandIds)

  const userMap = Object.fromEntries((users || []).map(u => [u.id, u]))
  const profileMap = Object.fromEntries((brandProfiles || []).map(bp => [bp.user_id, bp]))

  const items = campaigns.map(c => ({
    ...c,
    brand: {
      id: c.brand_id,
      name: userMap[c.brand_id]?.name || 'Brand',
      businessName: profileMap[c.brand_id]?.business_name || userMap[c.brand_id]?.name || 'Brand',
      businessType: profileMap[c.brand_id]?.business_type || 'Brand',
      location: profileMap[c.brand_id]?.location || c.location
    }
  }))

  return { items }
}

export async function listMine(user) {
  const db = adminDb()
  const { data, error } = await db.from('campaigns').select('*').eq('brand_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return { items: data || [] }
}

export async function getById(id) {
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
