import { useEffect, useState } from 'react'
import { getAuditLog } from '../../api/audit'
import { LoadingState } from '../../components/UI'

export default function RecentChanges() {
  const [log, setLog] = useState(null)

  useEffect(() => {
    getAuditLog().then(setLog)
  }, [])

  if (!log) return <LoadingState />

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Recent changes</h2>
      <div className="btn-row" style={{ marginBottom: 14 }}>
        <button className="btn ghost sm">User {'\u25BE'}</button>
        <button className="btn ghost sm">Action {'\u25BE'}</button>
        <button className="btn ghost sm">Entity {'\u25BE'}</button>
        <button className="btn ghost sm">Date {'\u25BE'}</button>
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
          {log.map((entry) => (
            <tr key={entry.audit_log_id}>
              <td>{entry.actor_name || 'System'}</td>
              <td>{entry.action}</td>
              <td>{entry.entity_type}</td>
              <td>
                {entry.created_at
                  ? new Date(entry.created_at).toLocaleString()
                  : '\\u2014'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

