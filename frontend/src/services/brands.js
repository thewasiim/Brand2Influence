import { api } from './api'

export const brandsService = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        q.append(k, v)
      }
    })
    const qs = q.toString()
    return api(`/brands${qs ? `?${qs}` : ''}`)
  },
  getById: (id) => api(`/brands/${id}`),
  saveProfile: (payload) => api('/brands/profile', { method: 'POST', body: JSON.stringify(payload) })
}
