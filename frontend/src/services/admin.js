import { api } from './api'

export const adminService = {
  metrics: () => api('/admin/metrics'),
  users: (filters = {}) => api(`/admin/users?${new URLSearchParams(filters)}`),
  updateUser: (id, payload) => api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  campaigns: (filters = {}) => api(`/admin/campaigns?${new URLSearchParams(filters)}`),
  updateCampaign: (id, payload) => api(`/admin/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCampaign: (id) => api(`/admin/campaigns/${id}`, { method: 'DELETE' }),
}

