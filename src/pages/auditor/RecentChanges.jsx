import { useEffect, useMemo, useState } from 'react'
import { getAuditLog } from '../../api/audit'
import { LoadingState } from '../../components/UI'

export default function RecentChanges() {
  const [log, setLog] = useState(null)
  const [userFilter, setUserFilter] = useState('ALL')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [entityFilter, setEntityFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')

  useEffect(() => {
    getAuditLog().then(setLog)
  }, [])

  const users = useMemo(() => {
    if (!log) return []
    return [...new Set(log.map((entry) => entry.actor_name || 'System'))].sort()
  }, [log])

  const actions = useMemo(() => {
    if (!log) return []
    return [...new Set(log.map((entry) => entry.action).filter(Boolean))].sort()
  }, [log])

  const entities = useMemo(() => {
    if (!log) return []
    return [...new Set(log.map((entry) => entry.entity_type).filter(Boolean))].sort()
  }, [log])

  const filteredLog = useMemo(() => {
    if (!log) return []

    const now = new Date()

    return log.filter((entry) => {
      const user = entry.actor_name || 'System'

      if (userFilter !== 'ALL' && user !== userFilter) {
        return false
      }

      if (actionFilter !== 'ALL' && entry.action !== actionFilter) {
        return false
      }

      if (entityFilter !== 'ALL' && entry.entity_type !== entityFilter) {
        return false
      }

      if (dateFilter !== 'ALL' && entry.created_at) {
        const createdAt = new Date(entry.created_at)
        const diffMs = now.getTime() - createdAt.getTime()
        const dayMs = 24 * 60 * 60 * 1000

        if (dateFilter === 'TODAY' && createdAt.toDateString() !== now.toDateString()) {
          return false
        }

        if (dateFilter === '7_DAYS' && diffMs > 7 * dayMs) {
          return false
        }

        if (dateFilter === '30_DAYS' && diffMs > 30 * dayMs) {
          return false
        }
      }

      return true
    })
  }, [log, userFilter, actionFilter, entityFilter, dateFilter])

  if (!log) return <LoadingState />

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Recent changes</h2>

      <div className="btn-row" style={{ marginBottom: 14 }}>
        <select
          className="btn ghost sm"
          value={userFilter}
          onChange={(event) => setUserFilter(event.target.value)}
          aria-label="Filter by user"
        >
          <option value="ALL">User ▾</option>
          {users.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>

        <select
          className="btn ghost sm"
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
          aria-label="Filter by action"
        >
          <option value="ALL">Action ▾</option>
          {actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>

        <select
          className="btn ghost sm"
          value={entityFilter}
          onChange={(event) => setEntityFilter(event.target.value)}
          aria-label="Filter by entity"
        >
          <option value="ALL">Entity ▾</option>
          {entities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>

        <select
          className="btn ghost sm"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          aria-label="Filter by date"
        >
          <option value="ALL">Date ▾</option>
          <option value="TODAY">Today</option>
          <option value="7_DAYS">Last 7 days</option>
          <option value="30_DAYS">Last 30 days</option>
        </select>
      </div>

      <table className="mini">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {filteredLog.map((entry) => (
            <tr key={entry.audit_log_id}>
              <td>{entry.actor_name || 'System'}</td>
              <td>{entry.action}</td>
              <td>{entry.entity_type}</td>
              <td>
                {entry.created_at
                  ? new Date(entry.created_at).toLocaleString()
                  : '\u2014'}
              </td>
            </tr>
          ))}

          {filteredLog.length === 0 && (
            <tr>
              <td colSpan="4">No audit entries match the selected filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
