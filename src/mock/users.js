export let currentUserMock = null

export const usersMock = [
  { id: 1, name: 'محمد طه', email: 'reporter@uni.edu', password: '123456', role: 'reporter', status: 'active' },
  { id: 2, name: 'عمر عادل', email: 'agent@uni.edu', password: '123456', role: 'agent', status: 'active' },
  { id: 3, name: 'أحمد سيد', email: 'tech@uni.edu', password: '123456', role: 'technician', status: 'active' },
  { id: 4, name: 'سلمى فتحي', email: 'manager@uni.edu', password: '123456', role: 'manager', status: 'active' },
  { id: 5, name: 'ياسر حلمي', email: 'auditor@uni.edu', password: '123456', role: 'auditor', status: 'active' },
]

export const pendingAccountsMock = [
  { id: 101, name: 'خالد عمر', email: 'khaled@uni.edu', requestedRole: 'technician', requestedAt: '2026-09-20' },
  { id: 102, name: 'منى فؤاد', email: 'mona@uni.edu', requestedRole: 'manager', requestedAt: '2026-09-18' },
]

export const techniciansMock = [
  { id: 3, name: 'أحمد سيد', team: 'Facilities', active: 6, capacity: 8, urgent: 2, status: 'busy' },
  { id: 6, name: 'سارة محمود', team: 'IT Support', active: 3, capacity: 8, urgent: 0, status: 'available' },
]
