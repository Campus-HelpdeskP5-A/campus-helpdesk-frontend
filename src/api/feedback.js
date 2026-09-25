import { api, USE_MOCKS, mockDelay, asList } from './client'

export async function getTicketFeedback(ticketId) {
  if (USE_MOCKS) return mockDelay([])
  return asList(await api.get(`/feedback/ticket/${ticketId}`))
}

export async function createFeedback(payload) {
  if (USE_MOCKS) return mockDelay(payload)
  return api.post('/feedback', payload)
}
