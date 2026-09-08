import { api } from './api'
export const messagesService = { list: id => api(`/messages/${id}`), send: payload => api('/messages', { method: 'POST', body: JSON.stringify(payload) }) }
