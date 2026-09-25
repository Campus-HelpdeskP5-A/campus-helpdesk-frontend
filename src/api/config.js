import { api, USE_MOCKS, mockDelay, asList } from './client'
import { categoriesMock } from '../mock/notifications'

let categoriesStore = [...categoriesMock]

/** GET /categories -> Category[] */
export async function getLocations() {
  if (USE_MOCKS) return mockDelay([])
  return asList(await api.get('/locations')).map((l) => ({
    ...l,
    id: l.id ?? l.location_id,
    label: l.label ?? [l.building, l.floor, l.room_code].filter(Boolean).join(' — '),
  }))
}

/** GET /support-teams -> SupportTeam[] */
export async function getSupportTeams() {
  if (USE_MOCKS) return mockDelay([])
  return asList(await api.get('/support-teams')).map((t) => ({
    ...t,
    id: t.id ?? t.support_team_id,
    name: t.name ?? t.team_name,
  }))
}

/** GET /users/technicians -> Technician[] */
export async function getTechnicians() {
  if (USE_MOCKS) return mockDelay([])
  return asList(await api.get('/users/technicians')).map((u) => ({
    ...u,
    id: u.id ?? u.user_id,
    name: u.name ?? u.full_name,
  }))
}

export async function getCategories() {
  if (USE_MOCKS) return mockDelay(categoriesStore)
  return asList(await api.get('/categories')).map((c) => ({
    ...c,
    id: c.id ?? c.category_id,
    name: c.name ?? c.category_name,
  }))
}

/** POST /config/categories { name, team } -> Category */
export async function addCategory(payload) {
  if (USE_MOCKS) {
    const newCat = { id: Date.now(), active: true, ...payload }
    categoriesStore = [...categoriesStore, newCat]
    return mockDelay(newCat)
  }
  return api.post('/config/categories', payload)
}

/** PATCH /config/categories/:id { active } */
export async function toggleCategory(id, active) {
  if (USE_MOCKS) {
    categoriesStore = categoriesStore.map((c) => (c.id === id ? { ...c, active } : c))
    return mockDelay({ success: true })
  }
  return api.patch(`/config/categories/${id}`, { active })
}

// Other configuration endpoints your backend will likely also expose:
//   GET/POST /config/teams          — support teams
//   GET/POST /config/sla-profiles   — SLA response/resolution targets
//   GET/POST /config/business-hours — working hours per team
//   GET/POST /config/priority-matrix — urgency+impact -> priority rules

export async function createSupportTeam(payload) { return api.post('/support-teams', payload) }
export async function updateSupportTeam(id, payload) { return api.put(`/support-teams/${id}`, payload) }

export async function getBusinessHours() { return asList(await api.get('/sla/business-hours')) }
export async function createBusinessHours(payload) { return api.post('/sla/business-hours', payload) }
export async function updateBusinessHours(id, payload) { return api.put(`/sla/business-hours/${id}`, payload) }

export async function getSlaProfiles() { return asList(await api.get('/sla/profiles')) }
export async function createSlaProfile(payload) { return api.post('/sla/profiles', payload) }
export async function updateSlaProfile(id, payload) { return api.put(`/sla/profiles/${id}`, payload) }

export async function getPriorityMatrix() { return asList(await api.get('/sla/priority-matrix')) }
export async function createPriorityMatrix(payload) { return api.post('/sla/priority-matrix', payload) }
export async function updatePriorityMatrix(id, payload) { return api.put(`/sla/priority-matrix/${id}`, payload) }
