import { api } from './api'
export const conversationsService = { list: () => api('/conversations'), create: participantId => api('/conversations', { method: 'POST', body: JSON.stringify({ participantId }) }) }
