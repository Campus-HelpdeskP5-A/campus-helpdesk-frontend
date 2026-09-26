import { api, USE_MOCKS, mockDelay, asList } from './client'
import { categoriesMock } from '../mock/notifications'

let categoriesStore = [...categoriesMock]
let locationsStore = null

/** GET /categories -> Category[] */

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
    active: c.active ?? c.is_active ?? true,
  }))
}

/** POST /categories { category_name, description?, default_team_id? } */
export async function addCategory(payload) {
  if (USE_MOCKS) {
    const newCat = { id: Date.now(), active: true, ...payload }
    categoriesStore = [...categoriesStore, newCat]
    return mockDelay(newCat)
  }
  return api.post('/categories', {
    category_name: payload.name ?? payload.category_name,
    ...(payload.description ? { description: payload.description } : {}),
    ...(payload.default_team_id ? { default_team_id: payload.default_team_id } : {}),
  })
}

/** PUT /categories/:id { is_active } */
export async function toggleCategory(id, active) {
  if (USE_MOCKS) {
    categoriesStore = categoriesStore.map((c) => (c.id === id ? { ...c, active } : c))
    return mockDelay({ success: true })
  }
  return api.put(`/categories/${id}`, { is_active: !!active })
}

/** GET /locations -> Location[] */
export async function getLocations() {
  if (USE_MOCKS) {
    if (!locationsStore) {
      locationsStore = [
        { id: 'loc-1', name: 'Engineering Building — LAB-101' },
        { id: 'loc-2', name: 'Engineering Building — LAB-202' },
        { id: 'loc-3', name: 'Administration Building — OFF-105' },
        { id: 'loc-4', name: 'Library — LIB-201' },
        { id: 'loc-5', name: 'Science Building — SCI-110' },
        { id: 'loc-6', name: 'Student Center — STU-301' },
      ]
    }
    return mockDelay(locationsStore)
  }
  return asList(await api.get('/locations')).map((l) => {
    const name = l.name ?? l.label ?? [l.building, l.room_code].filter(Boolean).join(' — ')
    return {
      ...l,
      id: l.id ?? l.location_id,
      name,
      label: l.label ?? name,
    }
  })
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
