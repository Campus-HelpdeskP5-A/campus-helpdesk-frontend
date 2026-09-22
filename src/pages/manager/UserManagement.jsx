import { useEffect, useState } from 'react'
import { getAllUsers, updateUserRole } from '../../api/users'
import { LoadingState, Tag } from '../../components/UI'

const ROLES = ['reporter', 'agent', 'technician', 'manager', 'auditor']
const ROLE_LABEL = {
  reporter: 'Reporter',
  agent: 'Agent',
  technician: 'Technician',
  manager: 'Manager',
  auditor: 'Auditor',
}

export default function UserManagement() {
  const [users, setUsers] = useState(null)
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    getAllUsers().then(setUsers)
  }, [])

  async function handleRoleChange(id, newRole) {
    setSavingId(id)
    await updateUserRole(id, newRole)
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
    setSavingId(null)
  }

  if (!users) return <LoadingState />

  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>User management</h2>
      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 18 }}>
        كل حساب جديد بيتسجل كـ Reporter تلقائي. من هنا تقدر تخلي أي حساب Technician أو Manager أو Agent أو Auditor.
      </p>
      <table className="mini">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Current role</th>
            <th>Change role to</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><Tag variant="active">{ROLE_LABEL[u.role] || u.role}</Tag></td>
              <td>
                <select
                  className="btn ghost sm"
                  value={u.role}
                  disabled={savingId === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}