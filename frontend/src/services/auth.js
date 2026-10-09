import { requireSupabase } from '../lib/supabase'
import { api } from './api'

export const authService = {
  signUp: async ({ email, password, name }) => {
    const { data, error } = await requireSupabase().auth.signUp({ email, password, options: { data: { name } } })
    if (error) throw error
    return data
  },
  register: async (payload) => {
    return api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  checkUsername: (username) => api(`/auth/check-username?username=${encodeURIComponent(username)}`),
  signIn: async ({ email, password }) => {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },
  resolveIdentifier: (identifier) => api('/auth/resolve-identifier', {
    method: 'POST',
    body: JSON.stringify({ identifier })
  }),
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
  getProfile: () => api('/auth/profile'),
  updateProfile: (data) => api('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  chooseRole: role => api('/auth/role', { method: 'POST', body: JSON.stringify({ role }) }),
  sendOtp: ({ email, phone }) => api('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, phone })
  }),
  verifyOtp: ({ email, phone, otp }) => api('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, phone, otp })
  }),
  forgotPasswordOtp: ({ identifier }) => api('/auth/forgot-password-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier })
  }),
  resetPasswordOtp: ({ email, otp, newPassword }) => api('/auth/reset-password-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword })
  }),
  logoutBackend: () => api('/auth/logout', { method: 'POST' }),
  signInWithGoogle: (role = '') => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    window.location.href = `${backendUrl}/auth/google${role ? `?role=${encodeURIComponent(role)}` : ''}`
  },
  verifyOtpToken: async ({ email, token }) => {
    const { data, error } = await requireSupabase().auth.verifyOtp({
      email,
      token,
      type: 'magiclink'
    })
    if (error) throw error
    return data
  },
}


