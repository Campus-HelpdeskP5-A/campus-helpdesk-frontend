import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wrap any page with this to require login (and optionally a specific role).
 * Usage: <ProtectedRoute roles={['manager']}><ManagerDashboard/></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />

  return children
}
