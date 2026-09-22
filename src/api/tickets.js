import { api, USE_MOCKS, mockDelay } from './client'
import { ticketsMock, kpiSummaryMock } from '../mock/tickets'

let mockStore = [...ticketsMock]

/** GET /tickets?status=&category=&priority=&q=  -> Ticket[] */
export async function getTickets(filters = {}) {
  if (USE_MOCKS) {
    let list = [...mockStore]
    if (filters.status) list = list.filter((t) => t.status === filters.status)
    if (filters.category) list = list.filter((t) => t.category === filters.category)
    if (filters.priority) list = list.filter((t) => t.priority === filters.priority)
    if (filters.q) list = list.filter((t) => t.title.includes(filters.q) || t.id.includes(filters.q))
    return mockDelay(list)
  }
  const params = new URLSearchParams(filters).toString()
  return api.get(`/tickets${params ? `?${params}` : ''}`)
}

/** GET /tickets/:id -> Ticket */
export async function getTicketById(id) {
  if (USE_MOCKS) {
    const found = mockStore.find((t) => t.id === id)
    return mockDelay(found || null)
  }
  return api.get(`/tickets/${id}`)
}

/** POST /tickets { title, description, category, location, asset, urgency } -> Ticket */
export async function createTicket(payload) {
  if (USE_MOCKS) {
    const newTicket = {
      id: `HLP-${String(100000 + mockStore.length + 1).slice(1)}`,
      status: 'open',
      priority: payload.urgency === 'Emergency' ? 'high' : 'medium',
      createdAt: new Date().toISOString(),
      timeline: [{ label: 'Ticket created', at: 'now' }],
      comments: [],
      ...payload,
    }
    mockStore = [newTicket, ...mockStore]
    return mockDelay(newTicket)
  }
  return api.post('/tickets', payload)
}

/** PATCH /tickets/:id { status } -> Ticket */
export async function updateTicketStatus(id, status) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) => (t.id === id ? { ...t, status } : t))
    return mockDelay(mockStore.find((t) => t.id === id))
  }
  return api.patch(`/tickets/${id}`, { status })
}

/** POST /tickets/:id/triage { category, priority, teamId, technicianId } -> Ticket */
export async function triageTicket(id, payload) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) => (t.id === id ? { ...t, ...payload } : t))
    return mockDelay(mockStore.find((t) => t.id === id))
  }
  return api.post(`/tickets/${id}/triage`, payload)
}

/** POST /tickets/:id/comments { text } -> Comment */
export async function addComment(id, text) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) =>
      t.id === id ? { ...t, comments: [...t.comments, { author: 'أنت', text }] } : t
    )
    return mockDelay(mockStore.find((t) => t.id === id))
  }
  return api.post(`/tickets/${id}/comments`, { text })
}

/** POST /tickets/:id/work-log { diagnosis, actions, parts, timeSpent, resolutionCode, internalNote, reporterComment } */
export async function submitWorkLog(id, payload) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) => (t.id === id ? { ...t, status: 'done', workLog: payload } : t))
    return mockDelay(mockStore.find((t) => t.id === id))
  }
  return api.post(`/tickets/${id}/work-log`, payload)
}

/** GET /tickets/kpis?role= -> KPI summary object for dashboards */
export async function getKpiSummary(role) {
  if (USE_MOCKS) return mockDelay(kpiSummaryMock[role] || {})
  return api.get(`/tickets/kpis?role=${role}`)
}
