import { api, USE_MOCKS, mockDelay, asList } from './client'
import { ticketsMock, kpiSummaryMock } from '../mock/tickets'

let mockStore = [...ticketsMock]

// ---------------------------------------------------------------------------
// Normalization
// الـ backend بيرجّع statuses بحروف كبيرة (IN_PROGRESS, RESOLVED...) وأسماء حقول
// زي ticket_id / category_name، والـ mock والـ UI بيستخدموا open/progress/done و id / category.
// كل الدوال تحت بترجّع التذكرة بشكل موحّد عشان أي صفحة تشتغل مع الاتنين.
// ---------------------------------------------------------------------------
const STATUS_FROM_API = {
  OPEN: 'open',
  IN_PROGRESS: 'progress',
  WAITING: 'pending',
  RESOLVED: 'done',
  CLOSED: 'done',
  NEW: 'open',
  TRIAGED: 'open',
  ASSIGNED: 'open',
  REOPENED: 'open',
  WAITING: 'pending',
}
const STATUS_TO_API = { open: 'OPEN', progress: 'IN_PROGRESS', pending: 'WAITING', done: 'RESOLVED' }

function normalizeStatus(status) {
  if (!status) return 'open'
  return STATUS_FROM_API[String(status).toUpperCase()] || String(status).toLowerCase()
}

function normalizePriority(priority) {
  return priority ? String(priority).toLowerCase() : 'medium'
}

// قيم الـ status اللي بتتبعت للـ backend
function toApiStatus(status) {
  if (!status) return status
  if (STATUS_FROM_API[status]) return status // already an API value
  return STATUS_TO_API[String(status).toLowerCase()] || status
}

export function normalizeTicket(raw) {
  if (!raw) return null
  const id = raw.id ?? raw.ticket_id
  return {
    ...raw,
    id,
    ticket_id: raw.ticket_id ?? id,
    reference: raw.reference_number ?? raw.reference ?? id,
    title: raw.title ?? raw.subject ?? '',
    category: raw.category ?? raw.category_name ?? '',
    status: normalizeStatus(raw.status),
    priority: normalizePriority(raw.priority),
    reporter:
      raw.reporter && typeof raw.reporter === 'object' ? raw.reporter.name : raw.reporter,
    createdAt: raw.createdAt ?? raw.created_at,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    comments: Array.isArray(raw.comments) ? raw.comments : [],
  }
}

const unwrap = (result) => result?.data?.ticket || result?.data || result

function matchesQuery(ticket, q) {
  const needle = String(q || '').trim().toLowerCase()
  if (!needle) return true
  return [ticket.id, ticket.reference, ticket.title, ticket.category, ticket.reporter].some((v) =>
    String(v ?? '').toLowerCase().includes(needle)
  )
}

// بيانات الـ mock بس (الـ backend الحقيقي هو اللي بيحدد ده بنفسه)
const URGENCY_TO_PRIORITY = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' }

// ===== ADJUST TO BACKEND (create ticket) =====
// true  -> POST /tickets واحد multipart والملف جواه
// false -> POST /tickets JSON وبعده POST /tickets/:id/attachments للملف
const MULTIPART_CREATE = false
const URGENCY_TO_API = { Low: 'LOW', Medium: 'MEDIUM', High: 'HIGH', Critical: 'CRITICAL' }
const CATEGORY_TO_TEAM = { Network: 'IT Support' }

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** GET /tickets */
export async function getTickets(filters = {}) {
  let list

  if (USE_MOCKS) {
    list = [...mockStore]

    if (filters.status) {
      const wanted = normalizeStatus(filters.status)
      list = list.filter((t) => normalizeStatus(t.status) === wanted)
    }

    if (filters.category_id) {
      list = list.filter((t) => t.category_id === filters.category_id)
    }

    if (filters.priority) {
      const wanted = normalizePriority(filters.priority)
      list = list.filter((t) => normalizePriority(t.priority) === wanted)
    }
  } else {
    const params = new URLSearchParams()

    if (filters.status) {
      params.set('status', toApiStatus(filters.status))
    }

    if (filters.priority) {
      params.set('priority', String(filters.priority).toUpperCase())
    }

    if (filters.category_id) {
      params.set('category_id', filters.category_id)
    }

    if (filters.team_id) params.set('team_id', filters.team_id)
    if (filters.assignee_id) params.set('assignee_id', filters.assignee_id)
    if (filters.location_id) params.set('location_id', filters.location_id)
    if (filters.due) params.set('due', filters.due)

    const query = params.toString()
    const result = await api.get(`/tickets${query ? `?${query}` : ''}`)

    list = asList(result)
  }

  list = list.map(normalizeTicket)

  // البحث النصي بيتعمل هنا في الحالتين (الـ mock والـ backend)
  if (filters.q) {
    list = list.filter((t) => matchesQuery(t, filters.q))
  }

  return USE_MOCKS ? mockDelay(list) : list
}

/** GET /tickets/:id  -> ticket | null لو مش موجودة */
export async function getTicketById(id) {
  if (USE_MOCKS) {
    const found = mockStore.find((t) => t.id === id)
    return mockDelay(normalizeTicket(found))
  }

  const result = await api.get(`/tickets/${id}`)

  return normalizeTicket(unwrap(result))
}

/**
 * POST /tickets
 * reporterName بيستخدمه الـ mock بس عشان يكتب اسم صاحب التذكرة (الـ backend بيعرفه من الـ token).
 */
export async function createTicket(payload, reporterName) {
  if (USE_MOCKS) {
    const maxNumber = mockStore.reduce((max, t) => {
      const n = parseInt(String(t.id).replace(/\D/g, ''), 10)
      return Number.isFinite(n) ? Math.max(max, n) : max
    }, 0)
    const now = new Date()

    // التذكرة لازم تكون كاملة (timeline / comments / reporter / team...) عشان صفحة التفاصيل تشتغل
    const newTicket = {
      id: `HLP-${String(maxNumber + 1).padStart(6, '0')}`,
      title: payload.title,
      description: payload.description,
      category: payload.categoryName || payload.category,
      location: payload.location,
      asset: payload.asset || '',
      priority: URGENCY_TO_PRIORITY[payload.urgency] || 'medium',
      status: 'open',
      reporter: reporterName || 'Unknown',
      team: CATEGORY_TO_TEAM[payload.categoryName || payload.category] || 'Facilities',
      technician: null,
      createdAt: now.toISOString(),
      timeline: [{ label: 'Ticket created', at: formatTime(now) }],
      comments: [],
      attachment: payload.file ? { name: payload.file.name, size: payload.file.size, type: payload.file.type } : null,
    }

    mockStore = [newTicket, ...mockStore]

    return mockDelay(normalizeTicket(newTicket))
  }

  const { file, category, urgency, impact, asset, title, description, location } = payload
  const body = {
    title,
    description,
    category_id: category,
    location_id: location,
    impact: String(impact || 'MEDIUM').toUpperCase(),
    urgency: URGENCY_TO_API[urgency] || String(urgency || 'MEDIUM').toUpperCase(),
    ...(asset ? { asset_id: asset } : {}),
  }

  const created = normalizeTicket(unwrap(await api.post('/tickets', body)))

  // Attachments are stored through the dedicated attachment endpoint.
  // The ticket API intentionally remains JSON-based.
  if (file) {
    await api.post('/attachments', {
      ticket_id: created.id,
      file_uuid: crypto.randomUUID(),
      file_name: file.name,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      storage_path: file.name,
    })
  }

  return created
}

/** POST /tickets/:id/confirm-resolution */
export async function confirmResolution(id) {
  const result = await api.post(`/tickets/${id}/confirm-resolution`)
  return normalizeTicket(unwrap(result))
}

/** POST /tickets/:id/reopen */
export async function reopenTicket(id) {
  const result = await api.post(`/tickets/${id}/reopen`)
  return normalizeTicket(unwrap(result))
}

/** PATCH /tickets/:id/status */
export async function updateTicketStatus(id, status) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) =>
      t.id === id ? { ...t, status: normalizeStatus(status) } : t
    )

    return mockDelay(normalizeTicket(mockStore.find((t) => t.id === id)))
  }

  const result = await api.patch(`/tickets/${id}/status`, { status: toApiStatus(status) })

  return normalizeTicket(unwrap(result))
}

/** POST /tickets/:id/triage */
export async function triageTicket(id, payload) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) =>
      t.id === id ? normalizeTicket({ ...t, ...payload }) : t
    )

    return mockDelay(normalizeTicket(mockStore.find((t) => t.id === id)))
  }

  const result = await api.post(`/tickets/${id}/triage`, {
    ...payload,
    status: toApiStatus(payload.status),
    priority: payload.priority ? String(payload.priority).toUpperCase() : payload.priority,
  })

  return normalizeTicket(unwrap(result))
}

/** POST /tickets/:id/comments */
export async function addComment(id, text) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) =>
      t.id === id
        ? {
            ...t,
            comments: [
              ...(t.comments || []),
              { author: 'You', text },
            ],
          }
        : t
    )

    return mockDelay(normalizeTicket(mockStore.find((t) => t.id === id)))
  }

  const result = await api.post(`/tickets/${id}/comments`, { text })

  return normalizeTicket(unwrap(result))
}

/** POST /tickets/:id/work-log */
export async function submitWorkLog(id, payload) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) =>
      t.id === id
        ? {
            ...t,
            status: 'done',
            workLog: payload,
          }
        : t
    )

    return mockDelay(normalizeTicket(mockStore.find((t) => t.id === id)))
  }

  const result = await api.post(`/tickets/${id}/work-log`, payload)

  return normalizeTicket(unwrap(result))
}

/**
 * Dashboard KPI data
 *
 * Reporter -> /tickets
 * Agent -> /dashboard/team
 * Manager -> /dashboard
 */
export async function getKpiSummary(role) {
  if (USE_MOCKS) {
    return mockDelay(kpiSummaryMock[role.toLowerCase()] || {})
  }

  const normalizedRole = role.toUpperCase()

  if (normalizedRole === 'REPORTER') {
    const result = await api.get('/tickets')
    const tickets = asList(result).map(normalizeTicket)

    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'open').length,
      progress: tickets.filter(
        (t) => t.status === 'progress'
      ).length,
      resolved: tickets.filter(
        (t) =>
          t.status === 'done' ||
          t.status === 'done'
      ).length,
    }
  }

  if (normalizedRole === 'AGENT') {
    const result = await api.get('/dashboard/team')
    const data = result?.data || {}

    const tickets = data.tickets || {}
    const sla = data.sla || {}
    const escalations = data.escalations || {}

    return {
      new: tickets.open || 0,
      slaRisk: sla.response_sla_breached || 0,
      urgent: 0,
      overdue: sla.resolution_sla_breached || 0,
      escalations: escalations.active || 0,
    }
  }

  if (normalizedRole === 'MANAGER') {
    const result = await api.get('/dashboard')
    const data = result?.data || {}

    const tickets = data.tickets || {}
    const sla = data.sla || {}

    const total = tickets.total || 0
    const withinSla = sla.within_sla || 0

    return {
      total,
      open: tickets.open || 0,
      slaRisk: sla.response_sla_breached || 0,
      slaBreached: sla.resolution_sla_breached || 0,
      avgResolution: 'N/A',
      slaCompliance:
        total > 0
          ? Math.round((withinSla / total) * 100)
          : 0,
    }
  }

  return {}
}
