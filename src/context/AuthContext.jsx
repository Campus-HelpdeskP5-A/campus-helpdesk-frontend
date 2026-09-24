import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../api/auth'
import { getToken, UNAUTHORIZED_EVENT } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('campus_helpdesk_user')
    return stored ? JSON.parse(stored) : null
  })

  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCurrentUser() {
      const token = getToken()

      if (!token) {
        setInitializing(false)
        return
      }

      try {
        const result = await authApi.getCurrentUser()
        const currentUser = result?.data?.user

        if (currentUser) {
          setUser(currentUser)
          localStorage.setItem(
            'campus_helpdesk_user',
            JSON.stringify(currentUser)
          )
        } else {
          authApi.logout()
          setUser(null)
          localStorage.removeItem('campus_helpdesk_user')
        }
      } catch {
        authApi.logout()
        setUser(null)
        localStorage.removeItem('campus_helpdesk_user')
      } finally {
        setInitializing(false)
      }
    }

    loadCurrentUser()
  }, [])

  // أي طلب رجع 401 (token منتهي) -> نخرّج المستخدم فوراً
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const { user: loggedInUser } = await authApi.login(email, password)

      setUser(loggedInUser)

      localStorage.setItem(
        'campus_helpdesk_user',
        JSON.stringify(loggedInUser)
      )

      return loggedInUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    setError(null)

    try {
      const result = await authApi.register(payload)

      // مش بنعمل login تلقائي بعد التسجيل: الحساب الجديد مفيهوش token،
      // والمستخدم لازم يسجّل دخول بشكل طبيعي من صفحة الـ Login.
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
    localStorage.removeItem('campus_helpdesk_user')
  }, [])

  // الجلسة صالحة بس لو فيه token (مجرد وجود user قديم في localStorage مش كفاية)
  const isAuthenticated = !!getToken()

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        initializing,
        error,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
