import { useEffect, useState } from 'react'
import { getPendingAccounts, approveAccount, rejectAccount } from '../../api/users'
import { LoadingState, EmptyState, Tag } from '../../components/UI'
import { useLanguage } from '../../context/LanguageContext'

export default function AccountRequests() {
  const { t } = useLanguage()
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
      <h2 style={{ marginBottom: 18 }}>{t('Account requests')}</h2>
      {list.length === 0 ? (
        <EmptyState>مفيش طلبات حسابات جديدة.</EmptyState>
      ) : (
        <table className="mini">
          <thead>
            <tr><th>{t('Name')}</th><th>{t('Email')}</th><th>{t('Requested role')}</th><th>{t('Requested at')}</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><Tag variant="pending">{u.requestedRole}</Tag></td>
                <td>{u.requestedAt}</td>
                <td className="btn-row">
                  <button className="btn sm primary" onClick={() => handleApprove(u.id)}>{t('Approve')}</button>
                  <button className="btn sm ghost" onClick={() => handleReject(u.id)}>{t('Reject')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
