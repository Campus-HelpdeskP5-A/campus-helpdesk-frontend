const SEED_USERS = [
  { id: 1, name: 'محمد طه', email: 'reporter@uni.edu', password: '123456', role: 'reporter', status: 'active' },
  { id: 2, name: 'عمر عادل', email: 'agent@uni.edu', password: '123456', role: 'agent', status: 'active' },
  { id: 3, name: 'أحمد سيد', email: 'tech@uni.edu', password: '123456', role: 'technician', status: 'active' },
  { id: 4, name: 'سلمى فتحي', email: 'manager@uni.edu', password: '123456', role: 'manager', status: 'active' },
  { id: 5, name: 'ياسر حلمي', email: 'auditor@uni.edu', password: '123456', role: 'auditor', status: 'active' },
]

const SEED_PENDING = [
  { id: 101, name: 'خالد عمر', email: 'khaled@uni.edu', requestedRole: 'technician', requestedAt: '2026-09-20' },
  { id: 102, name: 'منى فؤاد', email: 'mona@uni.edu', requestedRole: 'manager', requestedAt: '2026-09-18' },
]

// ملحوظة: المستخدمين هنا في الذاكرة بس (in-memory) — مش بيتخزنوا في localStorage.
// يعني أي حساب جديد بيتسجل بيفضل شغال طول ما الصفحة مفتوحة، ولما تعمل refresh بيرجع
// الوضع للحسابات الأساسية (SEED_USERS) بس.
export let currentUserMock = null

export const usersMock = [...SEED_USERS]
export const pendingAccountsMock = [...SEED_PENDING]

// تنظيف أي بيانات قديمة كانت اتخزنت في المتصفح بالنسخة السابقة من المشروع
try {
  localStorage.removeItem('hlp_mock_users')
  localStorage.removeItem('hlp_mock_pending')
} catch { /* ignore */ }

export const techniciansMock = [
  { id: 3, name: 'أحمد سيد', team: 'Facilities', active: 6, capacity: 8, urgent: 2, status: 'busy' },
  { id: 6, name: 'سارة محمود', team: 'IT Support', active: 3, capacity: 8, urgent: 0, status: 'available' },
]