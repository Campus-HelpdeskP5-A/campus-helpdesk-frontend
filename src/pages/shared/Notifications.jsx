import { useEffect, useState } from 'react'
import { getNotifications, markAllRead } from '../../api/notifications'
import { LoadingState, EmptyState } from '../../components/UI'

export default function Notifications() {
  const [list, setList] = useState(null)

  useEffect(() => {
    getNotifications().then(setList)
  }, [])

  async function handleMarkAllRead() {
    await markAllRead()
    setList((l) => l.map((n) => ({ ...n, read: true })))
  }

  if (!list) return <LoadingState />

  return (
    <div style={{ maxWidth: 440 }}>
      <h2 style={{ marginBottom: 16 }}>Notifications</h2>
      {list.length === 0 ? (
        <EmptyState>مفيش إشعارات جديدة.</EmptyState>
      ) : (
        <div className="row-list">
          {list.map((n) => (
            <div className="item" key={n.id} style={{ alignItems: 'flex-start', opacity: n.read ? 0.6 : 1 }}>
              <span>{n.read ? '✅' : '🔔'} {n.text}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{n.time}</span>
            </div>
          ))}
        </div>
      )}
      <button className="btn ghost sm" style={{ width: '100%', marginTop: 12 }} onClick={handleMarkAllRead}>
        Mark all as read
      </button>
    </div>
  )
}
