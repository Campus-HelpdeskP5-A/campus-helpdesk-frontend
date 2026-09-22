import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { getNotifications } from '../api/notifications'

export default function Topbar({ showSearch = true, onSearch }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    getNotifications().then((list) => setHasUnread(list.some((n) => !n.read)))
  }, [])

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="topbar">
      <div className="search">
        {showSearch && (
          <input
            placeholder="Search…"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        )}
      </div>
      <div className="topbar-right">
        <button
          className={`bell${hasUnread ? ' has-unread' : ''}`}
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          🔔
        </button>
        <div
          className="avatar"
          title={`${user?.name || ''} — logout`}
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  )
}
