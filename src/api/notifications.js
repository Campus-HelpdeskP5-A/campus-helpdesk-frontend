import { api, USE_MOCKS, mockDelay, asList } from './client'
import { notificationsMock } from '../mock/notifications'

let store = [...notificationsMock]

/** GET /notifications -> Notification[] */
export async function getNotifications() {
  if (USE_MOCKS) return mockDelay(store)

  return asList(await api.get('/notifications')).map((n) => ({
    ...n,
    id: n.notification_id,
    text: n.message,
    read: n.is_read,
    time: n.created_at,
  }))
}

/** POST /notifications/read-all */
export async function markAllRead() {
  if (USE_MOCKS) {
    store = store.map((n) => ({ ...n, read: true }))
    return mockDelay({ success: true })
  }

  return api.patch('/notifications/read-all')
}

