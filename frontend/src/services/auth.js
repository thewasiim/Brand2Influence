import { requireSupabase } from '../lib/supabase'
import { api } from './api'

export const authService = {
  signUp: async ({ email, password, name }) => {
    const { data, error } = await requireSupabase().auth.signUp({ email, password, options: { data: { name } } })
    if (error) throw error
    return data
  },
  signIn: async ({ email, password }) => {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },
  signOut: () => requireSupabase().auth.signOut(),
  forgotPassword: async email => {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` })
    if (error) throw error
  },
  resetPassword: async password => {
    const { error } = await requireSupabase().auth.updateUser({ password })
    if (error) throw error
  },
  me: () => api('/auth/me'),
  chooseRole: role => api('/auth/role', { method: 'POST', body: JSON.stringify({ role }) }),
}
