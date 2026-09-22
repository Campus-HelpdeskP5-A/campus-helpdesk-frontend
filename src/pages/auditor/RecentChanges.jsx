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
        <button className="btn ghost sm">User ▾</button>
        <button className="btn ghost sm">Action ▾</button>
        <button className="btn ghost sm">Entity ▾</button>
        <button className="btn ghost sm">Date ▾</button>
      </div>
      <table className="mini">
        <thead><tr><th>User</th><th>Action</th><th>Entity</th><th>Date</th></tr></thead>
        <tbody>
          {log.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.user}</td>
              <td>{entry.action}</td>
              <td>{entry.entity}</td>
              <td>{entry.at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
