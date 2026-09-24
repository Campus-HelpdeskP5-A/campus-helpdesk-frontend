import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

/**
 * Wrap any page with this to require login (and optionally a specific role).
 * Usage: <ProtectedRoute roles={['manager']}><ManagerDashboard/></ProtectedRoute>
 * لو الوصول متمنوع، بتظهر رسالة Toast واضحة توضح السبب بدل الـ redirect الصامت.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const deniedByAuth = !isAuthenticated
  const userRole = user?.role?.toLowerCase()
  const allowedRoles = roles?.map((r) => r.toLowerCase())
  const deniedByRole = !deniedByAuth && allowedRoles && userRole && !allowedRoles.includes(userRole)

  useEffect(() => {
    if (deniedByAuth) {
      showToast('لازم تسجّل دخولك الأول عشان توصل للصفحة دي.')
    } else if (deniedByRole) {
      showToast('مفيش صلاحية عندك تدخل الصفحة دي.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deniedByAuth, deniedByRole])

  if (deniedByAuth) return <Navigate to="/login" replace />
  if (deniedByRole) return <Navigate to="/" replace />

  return children
}