import { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '../api/auth'
import { getToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('campus_helpdesk_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { user: loggedInUser } = await authApi.login(email, password)
      setUser(loggedInUser)
      localStorage.setItem('campus_helpdesk_user', JSON.stringify(loggedInUser))
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
      return await authApi.register(payload)
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

  const isAuthenticated = !!user || !!getToken()

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
