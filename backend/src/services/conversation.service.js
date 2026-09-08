import { adminDb } from '../config/supabase.js'
import { ApiError } from '../utils/api-error.js'

async function participants(id) {
  const { data, error } = await adminDb().from('conversations').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new ApiError(404, 'Conversation not found', 'NOT_FOUND')
  return data
}

export async function create(user, participantId, campaignId = null) {
  if (!participantId || participantId === user.id) {
    throw new ApiError(400, 'Choose a valid participant', 'VALIDATION_ERROR')
  }
  const db = adminDb()
  const { data: other, error: otherError } = await db.from('users').select('id,role').eq('id', participantId).maybeSingle()
  if (otherError) throw otherError
  if (!other || other.role === user.role || !['brand', 'influencer'].includes(other.role)) {
    throw new ApiError(400, 'Conversation requires a brand and an influencer', 'VALIDATION_ERROR')
  }

  const brandId = user.role === 'brand' ? user.id : other.id
  const influencerId = user.role === 'influencer' ? user.id : other.id

  const { data: existing, error: existingError } = await db
    .from('conversations')
    .select('*')
    .eq('brand_id', brandId)
    .eq('influencer_id', influencerId)
    .maybeSingle()

  if (existingError) throw existingError
  if (existing) {
    if (campaignId && existing.campaign_id !== campaignId) {
      await db.from('conversations').update({ campaign_id: campaignId }).eq('id', existing.id)
      existing.campaign_id = campaignId
    }
    return existing
  }

  const payload = { brand_id: brandId, influencer_id: influencerId }
  if (campaignId) payload.campaign_id = campaignId

  const { data, error } = await db.from('conversations').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function list(user) {
  const db = adminDb()
  const { data, error } = await db
    .from('conversations')
    .select('*')
    .or(`brand_id.eq.${user.id},influencer_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
  if (error) throw error

  const ids = data.map((x) => (x.brand_id === user.id ? x.influencer_id : x.brand_id))
  const { data: others } = ids.length ? await db.from('users').select('id,name').in('id', ids) : { data: [] }
  const names = Object.fromEntries((others || []).map((x) => [x.id, x]))

  const campaignIds = data.map((x) => x.campaign_id).filter(Boolean)
  const { data: campaigns } = campaignIds.length ? await db.from('campaigns').select('id,title,budget_range,platform,niche').in('id', campaignIds) : { data: [] }
  const campaignMap = Object.fromEntries((campaigns || []).map((c) => [c.id, c]))

  const conversationIds = data.map((x) => x.id)
  const { data: messages, error: messageError } = conversationIds.length
    ? await db.from('messages').select('id,conversation_id,content,sent_at').in('conversation_id', conversationIds).order('sent_at', { ascending: false })
    : { data: [] }
  if (messageError) throw messageError

  const latest = {}
  for (const message of messages || []) {
    if (!latest[message.conversation_id]) latest[message.conversation_id] = message
  }

  return {
    items: data.map((x) => ({
      ...x,
      otherParticipant: names[x.brand_id === user.id ? x.influencer_id : x.brand_id] || null,
      campaign: x.campaign_id ? campaignMap[x.campaign_id] || null : null,
      lastMessage: latest[x.id] || null,
    })),
  }
}

export async function assertMember(userId, conversationId) {
  const row = await participants(conversationId)
  if (row.brand_id !== userId && row.influencer_id !== userId) {
    throw new ApiError(403, 'You are not a conversation participant', 'FORBIDDEN')
  }
  return row
}

