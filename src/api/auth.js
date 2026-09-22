import { api, USE_MOCKS, mockDelay, setToken } from './client'
import { usersMock } from '../mock/users'
import { addPendingAccount } from './users'

/**
 * POST /auth/login  { email, password } -> { token, user }
 */
export async function login(email, password) {
  if (USE_MOCKS) {
    const user = usersMock.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    const token = `mock-token-${user.id}`
    setToken(token)
    const { password: _pw, ...safeUser } = user
    return mockDelay({ token, user: safeUser })
  }
  const result = await api.post('/auth/login', { email, password })
  setToken(result.token)
  return result
}

/**
 * POST /auth/register { name, email, password, role } -> { status: 'pending' | 'active', user }
 * New Technician / Manager accounts require approval (see users.js -> approveAccount).
 */
export async function register({ name, email, password, role }) {
  if (USE_MOCKS) {
    const emailTaken = usersMock.some((u) => u.email === email)
    if (emailTaken) throw new Error('This email is already registered')

    const needsApproval = role === 'technician' || role === 'manager'

    if (needsApproval) {
      // بيتحط في قائمة الانتظار؛ لما المدير يوافق (approveAccount) بيتنقل لـ usersMock فعلياً
      addPendingAccount({
        id: Date.now(),
        name,
        email,
        password,
        requestedRole: role,
        requestedAt: new Date().toISOString().slice(0, 10),
      })
      return mockDelay({ status: 'pending', user: { name, email, role } })
    }

    // Reporter بيتفعّل فوراً ويتحفظ في usersMock عشان يقدر يعمل login على طول
    usersMock.push({ id: Date.now(), name, email, password, role, status: 'active' })
    return mockDelay({ status: 'active', user: { name, email, role } })
  }
  return api.post('/auth/register', { name, email, password, role })
}

/**
 * GET /auth/me -> current user profile (used to restore session on refresh)
 */
export async function getCurrentUser() {
  if (USE_MOCKS) return mockDelay(null)
  return api.get('/auth/me')
}

export function logout() {
  setToken(null)
}