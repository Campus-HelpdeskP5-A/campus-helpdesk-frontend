import { useEffect, useState } from 'react'
import { getPendingAccounts, approveAccount, rejectAccount } from '../../api/users'
import { LoadingState, EmptyState, Tag } from '../../components/UI'

export default function AccountRequests() {
  const [list, setList] = useState(null)

  useEffect(() => {
    getPendingAccounts().then(setList)
  }, [])

  async function handleApprove(id) {
    await approveAccount(id)
    setList((l) => l.filter((u) => u.id !== id))
  }
  async function handleReject(id) {
    await rejectAccount(id)
    setList((l) => l.filter((u) => u.id !== id))
  }

  if (!list) return <LoadingState />

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Account requests</h2>
      {list.length === 0 ? (
        <EmptyState>مفيش طلبات حسابات جديدة.</EmptyState>
      ) : (
        <table className="mini">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Requested role</th><th>Requested at</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><Tag variant="pending">{u.requestedRole}</Tag></td>
                <td>{u.requestedAt}</td>
                <td className="btn-row">
                  <button className="btn sm primary" onClick={() => handleApprove(u.id)}>Approve</button>
                  <button className="btn sm ghost" onClick={() => handleReject(u.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
