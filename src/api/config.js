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