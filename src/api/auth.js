import { api, USE_MOCKS, mockDelay, setToken, getToken } from './client'
import { usersMock } from '../mock/users'
import { addPendingAccount, normalizeUser, isPendingEmail, isPendingStatus } from './users'

function pendingError() {
  const e = new Error('حسابك قيد المراجعة من المدير.')
  e.code = 'PENDING'
  return e
}

/**
 * POST /auth/login  { email, password } -> { token, user }
 */
export async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  if (USE_MOCKS) {
    const user = usersMock.find((u) => u.email.toLowerCase() === normalizedEmail && u.password === password)
    if (!user && isPendingEmail(normalizedEmail)) throw pendingError()
    if (!user) throw new Error('Invalid email or password')
    if (user.status === 'rejected') {
      throw new Error('طلب حسابك اتم رفضه من المدير. تواصل مع الإدارة لمزيد من التفاصيل.')
    }
    const token = `mock-token-${user.id}`
    setToken(token)
    const { password: _pw, ...safeUser } = user
    return mockDelay({ token, user: safeUser })
  }
  const result = await api.post('/auth/login', { email: normalizedEmail, password })
  // بندعم الشكلين: { token, user } أو { data: { token, user } }
  const payload = result?.token ? result : result?.data || result
  const user = normalizeUser(payload.user)
  if (isPendingStatus(user?.status)) throw pendingError()
  setToken(payload.token)
  return { token: payload.token, user }
}

/**
 * POST /auth/register { name, email, password, role } -> { status: 'pending' | 'active', user }
 * New Technician / Manager accounts require approval (see users.js -> approveAccount).
 */
export async function register({ name, email, password, role }) {
  if (USE_MOCKS) {
    role = role || 'reporter'
    const normalizedEmail = email.trim().toLowerCase()
    const emailTaken = usersMock.some((u) => u.email.toLowerCase() === normalizedEmail)
    if (emailTaken) throw new Error('This email is already registered')

    const needsApproval = role === 'technician' || role === 'manager'

    if (needsApproval) {
      // بيتحط في قائمة الانتظار؛ لما المدير يوافق (approveAccount) بيتنقل لـ usersMock فعلياً
      addPendingAccount({
        id: Date.now(),
        name,
        email: normalizedEmail,
        password,
        requestedRole: role,
        requestedAt: new Date().toISOString().slice(0, 10),
      })
      return mockDelay({ status: 'pending', user: { name, email: normalizedEmail, role } })
    }

    // Reporter بيتفعّل فوراً ويتضاف في usersMock (في الذاكرة بس) عشان يقدر يعمل login على طول
    usersMock.push({ id: Date.now(), name, email: normalizedEmail, password, role, status: 'active' })
    return mockDelay({ status: 'active', user: { name, email: normalizedEmail, role } })
  }
  // الـ role بيتبعت بس لو اتحدد صراحة — غير كده الـ backend هو اللي يقرر الافتراضي
  return api.post('/auth/register', { full_name: name, email: email.trim().toLowerCase(), password, ...(role ? { role } : {}) })
}

/**
 * GET /auth/me -> current user profile (used to restore session on refresh)
 */
export async function getCurrentUser() {
  if (USE_MOCKS) {
    const token = getToken()
    const id = token ? Number(token.replace('mock-token-', '')) : null
    const user = id ? usersMock.find((u) => u.id === id) : null
    if (!user) return mockDelay({ data: { user: null } })
    const { password: _pw, ...safeUser } = user
    return mockDelay({ data: { user: safeUser } })
  }
  const result = await api.get('/auth/me')
  const user = result?.data?.user ?? result?.user ?? result?.data ?? null
  return { data: { user: normalizeUser(user) } }
}

export function logout() {
  setToken(null)
}