import { api, USE_MOCKS, mockDelay, asList } from './client'
import { pendingAccountsMock, techniciansMock, usersMock } from '../mock/users'

/** بيوحّد شكل المستخدم: id / name / role بحروف صغيرة / status، سواء جاي من الـ mock أو الـ backend */
export function normalizeUser(u) {
  if (!u) return null
  return {
    ...u,
    id: u.id ?? u.user_id,
    name: u.name ?? u.full_name ?? '',
    role: u.role ? String(u.role).toLowerCase() : u.role,
    status: u.status ? String(u.status).toLowerCase() : u.status,
  }
}

// مرجع مباشر (مش نسخة) عشان register() في auth.js يقدر يضيف عليه
let pendingStore = pendingAccountsMock

/** GET /users/pending -> pending account requests (normalized for the UI) */
export async function getPendingAccounts() {
  if (USE_MOCKS) return mockDelay([...pendingStore])
  const list = asList(await api.get('/users/pending'))
  return list.map((u) => ({
    ...u,
    id: u.user_id ?? u.id,
    name: u.full_name ?? u.name ?? '',
    email: u.email ?? '',
    requestedRole: u.requested_role ?? u.role ?? '',
    requestedAt: u.created_at ?? u.requestedAt ?? '',
  }))
}

/** POST /users/:id/approve */
export async function approveAccount(id) {
  if (USE_MOCKS) {
    const idx = pendingStore.findIndex((u) => u.id === id)
    if (idx !== -1) {
      const { requestedRole, password, name, email } = pendingStore[idx]
      // نقل الحساب فعلياً لقائمة المستخدمين النشطين عشان يقدر يعمل login بعد الموافقة
      usersMock.push({ id: Date.now(), name, email, password, role: requestedRole, status: 'active' })
      pendingStore.splice(idx, 1)
    }
    return mockDelay({ success: true })
  }
  return api.patch(`/users/${id}/approve`)
}

/** Reject -> backend has no /reject route; deactivate via PATCH /users/:id/status */
export async function rejectAccount(id) {
  if (USE_MOCKS) {
    const idx = pendingStore.findIndex((u) => u.id === id)
    if (idx !== -1) {
      const { requestedRole, password, name, email } = pendingStore[idx]
      // بيتحفظ بحالة 'rejected' عشان الإيميل يفضل محظور نهائي، مش يتمسح ويتاح للتسجيل تاني
      usersMock.push({ id: Date.now(), name, email, password, role: requestedRole, status: 'rejected' })
      pendingStore.splice(idx, 1)
    }
    return mockDelay({ success: true })
  }
  return api.patch(`/users/${id}/status`, { is_active: false })
}

/** يستخدمها auth.js وقت الـ register لحساب Technician/Manager جديد */
export function addPendingAccount(account) {
  pendingStore.push(account)
}

export const isPendingEmail = (email) => pendingStore.some((u) => u.email.toLowerCase() === email)
export const isPendingStatus = (s) => /pending/i.test(String(s || ''))

/** GET /users -> كل المستخدمين النشطين (من غير الباسورد) */
export async function getAllUsers() {
  if (USE_MOCKS) return mockDelay(usersMock.map(({ password, ...u }) => u))
  return asList(await api.get('/users')).map(normalizeUser)
}

/** PUT /users/:id { role } -> المدير بيغيّر دور مستخدم (Reporter -> Technician/Manager..) */
export async function updateUserRole(id, role) {
  if (USE_MOCKS) {
    const idx = usersMock.findIndex((u) => u.id === id)
    if (idx !== -1) {
      usersMock[idx] = { ...usersMock[idx], role }
    }
    return mockDelay({ success: true })
  }
  return api.put(`/users/${id}`, { role: String(role).toUpperCase() })
}

/** Deactivate -> backend has no DELETE /users/:id; deactivate via PATCH /users/:id/status */
export async function deleteUser(id) {
  if (USE_MOCKS) {
    const idx = usersMock.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('المستخدم مش موجود')
    usersMock.splice(idx, 1)
    return mockDelay({ success: true })
  }
  return api.patch(`/users/${id}/status`, { is_active: false })
}

/** GET /users/technicians -> technicians with current workload, for assignment */
export async function getTechniciansWorkload() {
  if (USE_MOCKS) return mockDelay(techniciansMock)
  const list = asList(await api.get('/users/technicians'))
  // Backend returns { user_id, full_name, workload }; UI expects { id, name, active, capacity, status, urgent }
  return list.map((u) => {
    const active = Number(u.workload ?? u.active ?? 0) || 0
    return {
      ...u,
      id: u.user_id ?? u.id,
      name: u.full_name ?? u.name ?? '',
      active,
      capacity: 8,
      status: active >= 6 ? 'busy' : 'available',
      urgent: 0,
    }
  })
}

/** POST /assignments { ticket_id, assigned_to } */
export async function assignTechnician(ticketId, technicianId) {
  if (USE_MOCKS) return mockDelay({ success: true })
  return api.post('/assignments', { ticket_id: ticketId, assigned_to: technicianId })
}