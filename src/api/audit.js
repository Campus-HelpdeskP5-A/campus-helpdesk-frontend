import { api, USE_MOCKS, mockDelay, asList } from './client'
import { auditLogMock } from '../mock/notifications'

/** GET /audit-logs?user=&action=&entity=&date= -> AuditEntry[] */
export async function getAuditLog(filters = {}) {
  if (USE_MOCKS) return mockDelay(auditLogMock)
  const params = new URLSearchParams(filters).toString()
  return asList(await api.get(`/audit-logs${params ? `?${params}` : ''}`))
}
