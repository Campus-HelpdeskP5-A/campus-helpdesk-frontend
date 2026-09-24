import { useEffect, useState } from 'react'
import { getAllUsers, updateUserRole, deleteUser } from '../../api/users'
import { LoadingState, Tag } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const ROLES = ['reporter', 'agent', 'technician', 'manager', 'auditor']
const ROLE_LABEL = {
  reporter: 'Reporter',
  agent: 'Agent',
  technician: 'Technician',
  manager: 'Manager',
  auditor: 'Auditor',
}

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    getAllUsers().then(setUsers)
  }, [])

  async function handleRoleChange(id, newRole) {
    setSavingId(id)
    try {
      await updateUserRole(id, newRole)
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
    } catch (err) {
      showToast(err.message || 'حصلت مشكلة وهو بيغيّر الدور.')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(u) {
    if (!window.confirm(`متأكد إنك عايز تحذف المستخدم "${u.name}" (${u.email})؟\nالإجراء ده مش ممكن يتراجع عنه.`)) return

    setDeletingId(u.id)
    try {
      await deleteUser(u.id)
      setUsers((list) => list.filter((x) => x.id !== u.id))
      showToast(`تم حذف المستخدم ${u.name}.`)
    } catch (err) {
      showToast(err.message || 'حصلت مشكلة وهو بيحذف المستخدم.')
    } finally {
      setDeletingId(null)
    }
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            // المدير مينفعش يحذف حسابه هو (عشان ميقفلش على نفسه)
            const isSelf = !!currentUser && (u.id === currentUser.id || u.email === currentUser.email)
            return (
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
              <td>
                <button
                  className="btn sm ghost"
                  style={isSelf ? undefined : { color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  disabled={isSelf || deletingId === u.id}
                  title={isSelf ? 'مينفعش تحذف حسابك الحالي' : 'حذف المستخدم'}
                  onClick={() => handleDelete(u)}
                >
                  {deletingId === u.id ? '...' : 'Delete'}
                </button>
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}