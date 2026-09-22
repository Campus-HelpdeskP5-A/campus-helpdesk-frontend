import { api, USE_MOCKS, mockDelay } from './client'
import { pendingAccountsMock, techniciansMock, usersMock } from '../mock/users'

// مرجع مباشر (مش نسخة) عشان register() في auth.js يقدر يضيف عليه
let pendingStore = pendingAccountsMock

/** GET /users/pending -> pending account requests */
export async function getPendingAccounts() {
  if (USE_MOCKS) return mockDelay([...pendingStore])
  return api.get('/users/pending')
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
    if (idx !== -1) pendingStore.splice(idx, 1)
    return mockDelay({ success: true })
  }
  return api.post(`/users/${id}/reject`)
}

/** يستخدمها auth.js وقت الـ register لحساب Technician/Manager جديد */
export function addPendingAccount(account) {
  pendingStore.push(account)
}

/** GET /users -> كل المستخدمين النشطين (من غير الباسورد) */
export async function getAllUsers() {
  if (USE_MOCKS) return mockDelay(usersMock.map(({ password, ...u }) => u))
  return api.get('/users')
}

/** PATCH /users/:id/role { role } -> المدير بيغيّر دور مستخدم (Reporter -> Technician/Manager..) */
export async function updateUserRole(id, role) {
  if (USE_MOCKS) {
    const idx = usersMock.findIndex((u) => u.id === id)
    if (idx !== -1) usersMock[idx] = { ...usersMock[idx], role }
    return mockDelay({ success: true })
  }
  return api.patch(`/users/${id}/role`, { role })
}

/** GET /users/technicians -> technicians with current workload, for assignment */
export async function getTechniciansWorkload() {
  if (USE_MOCKS) return mockDelay(techniciansMock)
  return api.get('/users/technicians')
}

/** POST /tickets/:ticketId/assign { technicianId } */
export async function assignTechnician(ticketId, technicianId) {
  if (USE_MOCKS) return mockDelay({ success: true })
  return api.post(`/tickets/${ticketId}/assign`, { technicianId })
}