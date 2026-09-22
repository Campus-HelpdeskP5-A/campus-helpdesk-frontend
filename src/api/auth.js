import { api, USE_MOCKS, mockDelay, setToken } from './client'
import { usersMock } from '../mock/users'

/**
 * POST /auth/login
 * { email, password } -> { success, message, data: { user, token } }
 */
export async function login(email, password) {
  if (USE_MOCKS) {
    const user = usersMock.find((u) => u.email === email && u.password === password)

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const token = `mock-token-${user.id}`
    setToken(token)

    const { password: _pw, ...safeUser } = user

    return mockDelay({
      token,
      user: safeUser,
    })
  }

  const result = await api.post('/auth/login', {
    email,
    password,
  })

  setToken(result.data.token)

  return result.data
}

/**
 * POST /auth/register
 * { name, email, password } -> { success, message, data: { user, token } }
 *
 * Public registration always creates a REPORTER account.
 * The role is controlled by the backend and is never sent by the client.
 */
export async function register({ name, email, password }) {
  if (USE_MOCKS) {
    const emailTaken = usersMock.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    )

    if (emailTaken) {
      throw new Error('This email is already registered')
    }

    const user = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'reporter',
      status: 'active',
    }

    usersMock.push({
      ...user,
      password,
    })

    return mockDelay({
      status: 'active',
      user,
    })
  }

  const result = await api.post('/auth/register', {
    full_name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  })

  setToken(result.data.token)

  return result.data
}

/**
 * GET /auth/me -> current user profile
 */
export async function getCurrentUser() {
  if (USE_MOCKS) {
    return mockDelay(null)
  }

  return api.get('/auth/me')
}

export function logout() {
  setToken(null)
}
