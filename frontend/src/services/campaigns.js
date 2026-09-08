import { api } from './api'

export const campaignsService = {
  list: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.niche) params.append('niche', filters.niche)
    if (filters.platform) params.append('platform', filters.platform)
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    const qs = params.toString()
    return api(`/campaigns${qs ? `?${qs}` : ''}`)
  },
  listMine: () => api('/campaigns/mine'),
  getById: (id) => api(`/campaigns/item/${id}`),
  create: (payload) =>
    api('/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    api(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (id) =>
    api(`/campaigns/${id}`, {
      method: 'DELETE',
    }),
  apply: (id, payload) =>
    api(`/campaigns/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
