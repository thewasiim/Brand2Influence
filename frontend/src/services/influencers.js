import { api } from './api'
import { supabase } from '../lib/supabase'

export const influencersService = {
  uploadProfileImage: async (file, userId) => {
    if (!supabase) throw new Error('Supabase is not configured.')
    const path = `${userId}/${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from('profile-images').upload(path, file, { upsert: false })
    if (error) throw error
    return supabase.storage.from('profile-images').getPublicUrl(path).data.publicUrl
  },
  list: filters => api(`/influencers?${new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '' && value != null))}`),
  get: id => api(`/influencers/${id}`),
  saveProfile: payload => api('/influencers/profile', { method: 'POST', body: JSON.stringify(payload) }),
}
