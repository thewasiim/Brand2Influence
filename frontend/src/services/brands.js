import { api } from './api'
export const brandsService = { saveProfile: payload => api('/brands/profile', { method: 'POST', body: JSON.stringify(payload) }) }
