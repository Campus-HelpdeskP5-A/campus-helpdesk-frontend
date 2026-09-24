import { api, USE_MOCKS, mockDelay, asList } from './client'
import { notificationsMock } from '../mock/notifications'

let store = [...notificationsMock]

/** GET /notifications -> Notification[] */
export async function getNotifications() {
  if (USE_MOCKS) return mockDelay(store)
  return asList(await api.get('/notifications'))
}

/** POST /notifications/read-all */
export async function markAllRead() {
  if (USE_MOCKS) {
    store = store.map((n) => ({ ...n, read: true }))
    return mockDelay({ success: true })
  }
  return api.patch('/notifications/read-all')
}

