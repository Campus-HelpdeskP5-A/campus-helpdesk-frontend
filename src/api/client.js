
// ============================================================================
// API CLIENT — this is the ONLY place that knows how to talk to the backend.
//
// Set VITE_API_BASE_URL in your .env file (see .env.example) to your real
// backend URL, e.g. VITE_API_BASE_URL=http://localhost:8000/api
//
// While VITE_USE_MOCKS=true (default, see .env.example), every function in
// src/api/*.js reads/writes from src/mock/*.js instead of hitting the network,
// so the whole UI works standalone before the backend exists.
//
// TO CONNECT YOUR BACKEND:
//   1. Set VITE_API_BASE_URL to your backend's URL.
//   2. Set VITE_USE_MOCKS=false.
//   3. Make sure your backend implements the endpoints referenced in
//      src/api/*.js (tickets.js, auth.js, users.js, config.js, audit.js,
//      notifications.js) — each function documents the endpoint + payload
//      shape it expects.
//   4. Your backend should return JSON and accept/return a Bearer token
//      from POST /auth/login — this client automatically attaches it.
// ============================================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://campus-helpdesk-backend-production.up.railway.app/api'

export const USE_MOCKS =
  (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true'

const TOKEN_KEY = 'campus_helpdesk_token'
const USER_KEY = 'campus_helpdesk_user'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

/**
 * Generic request helper.
 * Attaches the auth token automatically and parses JSON responses.
 * Throws ApiError on non-2xx responses.
 */
export async function request(
  path,
  { method = 'GET', body, headers, signal } = {}
) {
  const token = getToken()

  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      // مع FormData (رفع ملفات) المتصفح هو اللي بيحدد الـ Content-Type بنفسه
      ...(isFormData
        ? {}
        : { 'Content-Type': 'application/json' }),

      // Attach JWT automatically
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),

      ...headers,
    },

    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),

    signal,
  })

  let data = null

  const text = await res.text()

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  // التوكن منتهي أو غير صالح:
  // نمسح الجلسة ونبلّغ AuthContext يرجّع المستخدم لصفحة الـ Login
  if (
    res.status === 401 &&
    !path.startsWith('/auth/login')
  ) {
    setToken(null)
    localStorage.removeItem(USER_KEY)

    window.dispatchEvent(
      new Event(UNAUTHORIZED_EVENT)
    )
  }

  if (!res.ok) {
    const message =
      (data && data.message) ||
      res.statusText ||
      'Request failed'

    throw new ApiError(
      message,
      res.status,
      data
    )
  }

  return data
}

export const api = {
  get: (path, opts) =>
    request(path, {
      ...opts,
      method: 'GET',
    }),

  post: (path, body, opts) =>
    request(path, {
      ...opts,
      method: 'POST',
      body,
    }),

  put: (path, body, opts) =>
    request(path, {
      ...opts,
      method: 'PUT',
      body,
    }),

  patch: (path, body, opts) =>
    request(path, {
      ...opts,
      method: 'PATCH',
      body,
    }),

  delete: (path, opts) =>
    request(path, {
      ...opts,
      method: 'DELETE',
    }),
}

/**
 * الـ backend ممكن يرجّع القائمة كـ array مباشرة، أو جوه { data: [...] }،
 * أو { data: { items | users | ... : [...] } } — الدالة دي بتطلّع الـ array في كل الحالات.
 */
export function asList(result) {
  if (Array.isArray(result)) {
    return result
  }

  const data = result?.data

  if (Array.isArray(data)) {
    return data
  }

  if (data && typeof data === 'object') {
    const firstArray =
      Object.values(data).find(Array.isArray)

    if (firstArray) {
      return firstArray
    }
  }

  return []
}

// Small helper used by every mock-backed API function so real network
// calls "feel" the same during development.
export function mockDelay(
  result,
  ms = 350
) {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve(result),
      ms
    )
  )
}

export { ApiError }

