import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { useEffect, useRef, useState } from 'react'
import { getNotifications } from '../api/notifications'

export default function Topbar({ showSearch = true, onSearch }) {
  const { user, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang, t } = useLanguage()
  const navigate = useNavigate()
  const [hasUnread, setHasUnread] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
  getNotifications()
    .then((result) => {
      const list = Array.isArray(result) ? result : result?.data || []
      setHasUnread(list.some((n) => !n.read))
    })
    .catch(() => {
      setHasUnread(false)
    })
}, [])

  // قفل القائمة لو ضغطت في أي مكان تاني بره الأيقونة
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
            placeholder={t('Search…')}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        )}
      </div>
      <div className="topbar-right">
        <button
          className="bell"
          onClick={toggleLang}
          title={lang === 'ar' ? 'English' : 'عربي'}
        >
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
        <button
          className="bell"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          className={`bell${hasUnread ? ' has-unread' : ''}`}
          onClick={() => navigate('/notifications')}
          title={t('Notifications')}
        >
          🔔
        </button>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <div
            className="avatar"
            title={user?.name || ''}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {initials}
          </div>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 42,
                left: 0,
                minWidth: 200,
                background: 'var(--white)',
                border: '1px solid var(--cream-dark)',
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                padding: 14,
                zIndex: 50,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, wordBreak: 'break-all' }}>
                {user?.email}
              </div>
              <button
                className="btn ghost sm"
                style={{ width: '100%' }}
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                {t('Logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}