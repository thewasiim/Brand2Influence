import { supabase } from '../lib/supabase'
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function api(path, options = {}) {
  const token = (await supabase?.auth.getSession())?.data?.session?.access_token
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.error?.message || 'Request failed')
  return payload
}
