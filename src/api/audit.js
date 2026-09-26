import { api, USE_MOCKS, mockDelay, asList } from './client'
import { auditLogMock } from '../mock/notifications'

/** GET /audit-logs -> AuditEntry[] (backend v2: entity_type, entity_id, action, limit, offset) */
export async function getAuditLog(filters = {}) {
  if (USE_MOCKS) return mockDelay(auditLogMock)
  const params = new URLSearchParams()
  // map UI filter names to backend query params
  if (filters.entity_type || filters.entity) params.set('entity_type', filters.entity_type ?? filters.entity)
  if (filters.entity_id) params.set('entity_id', filters.entity_id)
  if (filters.action) params.set('action', filters.action)
  if (filters.limit) params.set('limit', filters.limit)
  if (filters.offset) params.set('offset', filters.offset)
  const query = params.toString()
  return asList(await api.get(`/audit-logs${query ? `?${query}` : ''}`))
}
