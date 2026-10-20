import { supabase } from '../lib/supabase'
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://brand2influence-backend.onrender.com/api'
  }
  return 'http://localhost:3001/api'
}

export const baseUrl = getApiBaseUrl()

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
