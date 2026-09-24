import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../context/AuthContext'

export default function AppLayout({ role, showSearch = true }) {
  const { user } = useAuth()
  const effectiveRole = String(role || user?.role || '').toLowerCase()
  return (
    <div className="app-shell">
      <Sidebar role={effectiveRole} userName={user?.name} />
      <div className="main">
        <Topbar showSearch={showSearch} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
