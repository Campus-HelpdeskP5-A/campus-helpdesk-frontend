export const notificationsMock = [
  { id: 1, text: 'تذكرتك HLP-000123 اتحدّثت لـ In progress', time: 'منذ 5 د', read: false },
  { id: 2, text: 'HLP-000131 قربت على SLA breach', time: 'منذ 1 س', read: false },
  { id: 3, text: 'تم حل تذكرتك HLP-000108', time: 'أمس', read: true },
]

export const auditLogMock = [
  { id: 1, user: 'Manager — سلمى', action: 'Approved account', entity: 'USER #221', at: 'اليوم 09:14' },
  { id: 2, user: 'Agent — عمر', action: 'Escalated ticket', entity: 'TICKET HLP-000131', at: 'اليوم 08:40' },
  { id: 3, user: 'Technician — أحمد', action: 'Resolved ticket', entity: 'TICKET HLP-000108', at: 'أمس 16:02' },
]

export const categoriesMock = [
  { id: 1, name: 'Network', team: 'IT Support', active: true },
  { id: 2, name: 'HVAC', team: 'Facilities', active: true },
  { id: 3, name: 'Plumbing', team: 'Facilities', active: true },
  { id: 4, name: 'Electrical', team: 'Facilities', active: true },
]
