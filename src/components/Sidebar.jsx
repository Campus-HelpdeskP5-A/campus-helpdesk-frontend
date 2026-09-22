import { NavLink } from 'react-router-dom'
import Logo from './Logo'

const NAV_BY_ROLE = {
  reporter: [
    { to: '/reporter', label: 'Dashboard', end: true },
    { to: '/reporter/new', label: 'Create ticket' },
    { to: '/notifications', label: 'Notifications' },
  ],
  agent: [
    { to: '/agent', label: 'Dashboard', end: true },
    { to: '/notifications', label: 'Notifications' },
  ],
  technician: [
    { to: '/technician', label: 'My dashboard', end: true },
    { to: '/notifications', label: 'Notifications' },
  ],
  manager: [
    { to: '/manager', label: 'Dashboard', end: true },
    { to: '/manager/accounts', label: 'Account requests' },
    { to: '/manager/users', label: 'User management' },
    { to: '/manager/workload', label: 'Workload' },
    { to: '/manager/config', label: 'Configuration' },
    { to: '/notifications', label: 'Notifications' },
  ],
  auditor: [
    { to: '/auditor', label: 'Recent changes', end: true },
  ],
}

export default function Sidebar({ role, userName }) {
  const items = NAV_BY_ROLE[role] || []
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <Logo />
      </div>
      <nav>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="foot">{userName} · Logout</div>
    </aside>
  )
}