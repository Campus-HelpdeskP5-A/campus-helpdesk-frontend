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

/** GET /users/pending -> pending account requests */
export async function getPendingAccounts() {
  if (USE_MOCKS) return mockDelay([...pendingStore])
  return asList(await api.get('/users/pending'))
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
  return api.post(`/users/${id}/approve`)
}

/** POST /users/:id/reject */
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
  return api.post(`/users/${id}/reject`)
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

/** PATCH /users/:id/role { role } -> المدير بيغيّر دور مستخدم (Reporter -> Technician/Manager..) */
export async function updateUserRole(id, role) {
  if (USE_MOCKS) {
    const idx = usersMock.findIndex((u) => u.id === id)
    if (idx !== -1) {
      usersMock[idx] = { ...usersMock[idx], role }
    }
    return mockDelay({ success: true })
  }
  return api.patch(`/users/${id}/role`, { role })
}

/** DELETE /users/:id -> المدير بيحذف مستخدم نهائياً */
export async function deleteUser(id) {
  if (USE_MOCKS) {
    const idx = usersMock.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('المستخدم مش موجود')
    usersMock.splice(idx, 1)
    return mockDelay({ success: true })
  }
  return api.delete(`/users/${id}`)
}

/** GET /users/technicians -> technicians with current workload, for assignment */
export async function getTechniciansWorkload() {
  if (USE_MOCKS) return mockDelay(techniciansMock)
  return asList(await api.get('/users/technicians'))
}

/** POST /tickets/:ticketId/assign { technicianId } */
export async function assignTechnician(ticketId, technicianId) {
  if (USE_MOCKS) return mockDelay({ success: true })
  return api.post(`/tickets/${ticketId}/assign`, { technicianId })
}