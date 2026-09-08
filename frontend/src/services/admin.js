import { api } from './api'
export const adminService = { metrics: () => api('/admin/metrics'), users: filters => api(`/admin/users?${new URLSearchParams(filters)}`), updateUser: (id, payload) => api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) }
