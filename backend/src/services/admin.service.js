import { adminDb } from '../config/supabase.js'
import { ApiError } from '../utils/api-error.js'

export async function metrics() {
  const db = adminDb()
  const count = async (query) => {
    const { count, error } = await query
    if (error) return 0
    return count || 0
  }

  return {
    total_users: await count(db.from('users').select('*', { count: 'exact', head: true })),
    total_influencers: await count(db.from('users').select('*', { count: 'exact', head: true }).eq('role', 'influencer')),
    total_brands: await count(db.from('users').select('*', { count: 'exact', head: true }).eq('role', 'brand')),
    total_campaigns: await count(db.from('campaigns').select('*', { count: 'exact', head: true })),
    active_campaigns: await count(db.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active')),
    conversations: await count(db.from('conversations').select('*', { count: 'exact', head: true })),
    messages_sent: await count(db.from('messages').select('*', { count: 'exact', head: true })),
    active_users: await count(db.from('users').select('*', { count: 'exact', head: true }).eq('is_disabled', false)),
    new_registrations: await count(db.from('users').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 864e5).toISOString()))
  }
}

export async function users({ role, query }) {
  let q = adminDb().from('users').select('id,name,email,role,is_disabled,created_at').order('created_at', { ascending: false }).limit(100)
  if (role) q = q.eq('role', role)
  if (query) q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
  const { data, error } = await q
  if (error) throw error
  return { items: data }
}

export async function updateUser(id, payload) {
  const update = {}
  if (typeof payload.isDisabled === 'boolean') update.is_disabled = payload.isDisabled
  if (typeof payload.profileStatus === 'string') update.profile_status = payload.profileStatus
  const { data, error } = await adminDb().from('users').update(update).eq('id', id).select('id,name,email,role,is_disabled').single()
  if (error) throw error
  return data
}

export async function campaigns({ status, query }) {
  const db = adminDb()
  let q = db.from('campaigns').select('*').order('created_at', { ascending: false }).limit(100)
  if (status) q = q.eq('status', status)
  if (query) q = q.or(`title.ilike.%${query}%,niche.ilike.%${query}%,platform.ilike.%${query}%`)
  const { data, error } = await q
  if (error) throw error

  if (!data || data.length === 0) return { items: [] }

  const brandIds = [...new Set(data.map(c => c.brand_id))]
  const { data: users } = await db.from('users').select('id, name, email').in('id', brandIds)
  const userMap = Object.fromEntries((users || []).map(u => [u.id, u]))

  return {
    items: data.map(c => ({
      ...c,
      brandName: userMap[c.brand_id]?.name || 'Unknown Brand',
      brandEmail: userMap[c.brand_id]?.email || ''
    }))
  }
}

export async function updateCampaign(id, payload) {
  const update = { updated_at: new Date().toISOString() }
  if (payload.status) update.status = payload.status
  const { data, error } = await adminDb().from('campaigns').update(update).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCampaign(id) {
  const { error } = await adminDb().from('campaigns').delete().eq('id', id)
  if (error) throw error
  return { success: true }
}

