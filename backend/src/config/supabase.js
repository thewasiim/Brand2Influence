import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'
function assertConfig() {
  if (!env.supabaseUrl || !env.supabaseAnonKey || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase is not configured on the API server. Check backend/.env.')
  }
  if (env.supabaseUrl.includes('your-project.supabase.co')) {
    throw new Error('SUPABASE_URL in backend/.env is still set to the placeholder "your-project.supabase.co".')
  }
}
export function adminDb() {
  assertConfig()
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { persistSession: false } })
}
export function authClient() {
  assertConfig()
  return createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } })
}

