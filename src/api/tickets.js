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
  NEW: 'open',
  TRIAGED: 'open',
  ASSIGNED: 'open',
  REOPENED: 'open',
  IN_PROGRESS: 'progress',
  WAITING: 'pending',
  RESOLVED: 'done',
  CLOSED: 'done',
}
// UI group -> backend canonical status (backend has no OPEN value)
const STATUS_TO_API = { open: 'NEW', progress: 'IN_PROGRESS', pending: 'WAITING', done: 'RESOLVED' }
// UI group values are filtered client-side after fetch
const UI_GROUP_STATUS = new Set(['open', 'progress', 'pending', 'done'])

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
  const locationText =
    raw.location ??
    raw.location_label ??
    [raw.building, raw.floor, raw.room_code].filter(Boolean).join(' — ') ??
    ''
  return {
    ...raw,
    id,
    ticket_id: raw.ticket_id ?? id,
    reference: raw.reference_number ?? raw.reference ?? id,
    title: raw.title ?? raw.subject ?? '',
    category: raw.category ?? raw.category_name ?? '',
    category_id: raw.category_id ?? raw.category,
    location: locationText,
    location_id: raw.location_id ?? raw.location,
    status: normalizeStatus(raw.status),
    priority: normalizePriority(raw.priority),
    reporter:
      raw.reporter && typeof raw.reporter === 'object'
        ? raw.reporter.name
        : raw.reporter ?? raw.reporter_name ?? raw.reporter_email ?? '',
    team: raw.team ?? raw.team_name ?? raw.assigned_team ?? '',
    technician: raw.technician ?? raw.assignee_name ?? null,
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
const MULTIPART_CREATE = true
const URGENCY_TO_API = { Low: 'LOW', Medium: 'MEDIUM', High: 'HIGH', Critical: 'CRITICAL' }
const CATEGORY_TO_TEAM = { Network: 'IT Support' }

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** GET /tickets */
export async function getTickets(filters = {}) {
  let list
  let paginationTotal = null

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

    // Backend only accepts canonical statuses (NEW, IN_PROGRESS, ...).
    // UI group values (open/progress/pending/done) are filtered client-side below.
    if (filters.status && !UI_GROUP_STATUS.has(String(filters.status).toLowerCase())) {
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
    paginationTotal = result?.pagination?.total ?? result?.data?.pagination?.total ?? null

    list = asList(result)
  }

  list = list.map(normalizeTicket)
  if (paginationTotal !== null) list.total = paginationTotal

  // UI group status filter (open = NEW/TRIAGED/ASSIGNED/REOPENED, ...)
  if (filters.status && UI_GROUP_STATUS.has(String(filters.status).toLowerCase())) {
    const wanted = normalizeStatus(filters.status)
    list = list.filter((t) => t.status === wanted)
  }

  // البحث النصي بيتعمل هنا في الحالتين (الـ mock والـ backend)
  if (filters.q) {
    list = list.filter((t) => matchesQuery(t, filters.q))
  }

  return USE_MOCKS ? mockDelay(list) : list
}

/** GET /status-history/ticket/:ticketId -> timeline items { label, at, by } */
export async function getTicketHistory(ticketId) {
  if (USE_MOCKS) {
    const found = mockStore.find((t) => t.id === ticketId)
    return mockDelay(found?.timeline || [])
  }

  const list = asList(await api.get(`/status-history/ticket/${ticketId}`))
  return list.map((h) => ({
    ...h,
    id: h.status_history_id ?? h.id,
    label: [h.old_status, h.new_status].filter(Boolean).join(' → ') || 'Status updated',
    at: h.changed_at ? new Date(h.changed_at).toLocaleString() : '',
    by: h.changed_by_name || '',
    reason: h.reason || '',
  }))
}

/** GET /attachments/ticket/:ticketId -> [{ name, size, type }] */
export async function getTicketAttachments(ticketId) {
  if (USE_MOCKS) return mockDelay([])
  const list = asList(await api.get(`/attachments/ticket/${ticketId}`))
  return list.map((a) => ({
    ...a,
    id: a.attachment_id ?? a.id,
    name: a.file_name ?? a.name ?? 'Attachment',
    size: a.file_size ?? a.size ?? 0,
    type: a.mime_type ?? a.type ?? '',
  }))
}

/**
 * GET /predictions/ticket/:ticketId -> AI suggestion
 * { category, categoryConfidence, priority, priorityConfidence } | null
 */
export async function getTicketPredictions(ticketId) {
  if (USE_MOCKS) return mockDelay(null)
  let list = []
  try {
    list = asList(await api.get(`/predictions/ticket/${ticketId}`))
  } catch {
    return null
  }
  if (!list.length) return null

  const pick = (type) =>
    list.find((p) => String(p.prediction_type || '').toUpperCase() === type)
  const cat = pick('CATEGORY')
  const pri = pick('PRIORITY')
  if (!cat && !pri) return null

  const pct = (c) =>
    c?.confidence === undefined || c?.confidence === null
      ? null
      : Math.round(Number(c.confidence) * 100)
  return {
    category: cat?.predicted_value ?? null,
    categoryConfidence: pct(cat),
    priority: pri ? String(pri.predicted_value).toLowerCase() : null,
    priorityConfidence: pct(pri),
  }
}

/**
 * POST /escalations { ticket_id, trigger_type, severity, reason?, assigned_to?, assigned_team_id? }
 * Note: backend requires assigned_to OR assigned_team_id.
 */
export async function createEscalation(payload) {
  if (USE_MOCKS) return mockDelay({ success: true })
  return api.post('/escalations', payload)
}

/** GET /escalations/ticket/:ticketId -> Escalation[] */
export async function getTicketEscalations(ticketId) {
  if (USE_MOCKS) return mockDelay([])
  return asList(await api.get(`/escalations/ticket/${ticketId}`))
}

/** PATCH /escalations/:id/resolve */
export async function resolveEscalation(escalationId, payload = {}) {
  if (USE_MOCKS) return mockDelay({ success: true })
  return api.patch(`/escalations/${escalationId}/resolve`, payload)
}

/** GET /work-logs/ticket/:ticketId -> WorkLog[] */
export async function getTicketWorkLogs(ticketId) {
  if (USE_MOCKS) return mockDelay([])
  return asList(await api.get(`/work-logs/ticket/${ticketId}`))
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
  const normalizedUrgency = URGENCY_TO_API[urgency] || String(urgency || '').toUpperCase()
  const normalizedImpact = URGENCY_TO_API[impact] || String(impact || '').toUpperCase()

  // Backend (POST /tickets) expects attachment metadata inside the same call
  // via `attachments: [{ file_uuid, file_name, mime_type, file_size, storage_path }]`.
  // There is no real file-storage service on the frontend, so the file name
  // is used as storage_path and a fresh UUID as file_uuid.
  const attachments = file
    ? [
        {
          file_uuid: crypto.randomUUID(),
          file_name: file.name,
          mime_type: file.type || 'application/octet-stream',
          file_size: file.size,
          storage_path: file.name,
        },
      ]
    : []

  const body = {
    ...(title ? { title: String(title).trim() } : {}),
    ...(description ? { description: String(description).trim() } : {}),
    ...(category ? { category_id: String(category) } : {}),
    ...(location ? { location_id: String(location) } : {}),
    ...(normalizedUrgency ? { urgency: normalizedUrgency } : {}),
    ...(normalizedImpact ? { impact: normalizedImpact } : {}),
    // Backend accepts a UUID or an asset tag; unknown tags only raise a warning
    ...(asset && String(asset).trim() ? { asset_id: String(asset).trim() } : {}),
    ...(attachments.length ? { attachments } : {}),
  }

  const created = normalizeTicket(unwrap(await api.post('/tickets', body)))

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

/** PATCH /tickets/:id/triage { category_id, priority } — agent only */
export async function triageTicket(id, payload) {
  if (USE_MOCKS) {
    mockStore = mockStore.map((t) =>
      t.id === id ? normalizeTicket({ ...t, ...payload }) : t
    )

    return mockDelay(normalizeTicket(mockStore.find((t) => t.id === id)))
  }

  const body = {}
  if (payload.category || payload.category_id) {
    body.category_id = String(payload.category ?? payload.category_id)
  }
  if (payload.priority) {
    body.priority = String(payload.priority).toUpperCase()
  }

  const result = await api.patch(`/tickets/${id}/triage`, body)

  return normalizeTicket(unwrap(result))
}

/** GET /comments/ticket/:ticketId -> Comment[] (normalized for the UI) */
export async function getTicketComments(ticketId) {
  if (USE_MOCKS) {
    const found = mockStore.find((t) => t.id === ticketId)
    return mockDelay(found?.comments || [])
  }

  const list = asList(await api.get(`/comments/ticket/${ticketId}`))
  return list.map((c) => ({
    ...c,
    id: c.comment_id ?? c.id,
    author: c.user_name ?? c.author ?? 'User',
    text: c.body ?? c.text ?? '',
  }))
}

/** POST /comments { ticket_id, body, is_internal } -> created comment */
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

  const result = await api.post('/comments', {
    ticket_id: id,
    body: String(text).trim(),
    is_internal: false,
  })
  const c = unwrap(result)
  return {
    ...c,
    id: c?.comment_id ?? c?.id,
    author: c?.user_name ?? 'You',
    text: c?.body ?? String(text),
  }
}

/** POST /work-logs { ticket_id, time_spent_minutes, note?, started_at?, ended_at? } */
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

  const minutes = Number.parseInt(String(payload.timeSpent ?? payload.time_spent_minutes ?? ''), 10)
  const note = [
    payload.diagnosis && `Diagnosis: ${payload.diagnosis}`,
    payload.actions && `Actions: ${payload.actions}`,
    payload.parts && `Parts: ${payload.parts}`,
    payload.resolutionCode && `Resolution: ${payload.resolutionCode}`,
    payload.internalNote && `Internal: ${payload.internalNote}`,
    payload.reporterComment && `Reporter: ${payload.reporterComment}`,
    payload.note,
  ]
    .filter(Boolean)
    .join('\n')

  const result = await api.post('/work-logs', {
    ticket_id: id,
    time_spent_minutes: Number.isFinite(minutes) && minutes >= 0 ? minutes : 0,
    ...(note ? { note } : {}),
  })

  return unwrap(result)
}

/**
 * Dashboard KPI data — aligned with backend v2 routes:
 * Reporter -> GET /dashboard/reporter { tickets: { total,new,triaged,assigned,in_progress,waiting,resolved,reopened,closed } }
 * Agent/Technician -> GET /dashboard/team { tickets, sla, escalations }
 * Manager -> GET /dashboard { tickets, sla }
 */
export async function getKpiSummary(role) {
  if (USE_MOCKS) {
    return mockDelay(kpiSummaryMock[role.toLowerCase()] || {})
  }

  const normalizedRole = role.toUpperCase()

  if (normalizedRole === 'REPORTER') {
    const result = await api.get('/dashboard/reporter')
    const t = result?.data?.tickets || {}

    const num = (v) => Number(v) || 0
    return {
      total: num(t.total),
      open: num(t.new) + num(t.triaged) + num(t.assigned) + num(t.reopened),
      progress: num(t.in_progress),
      resolved: num(t.resolved) + num(t.closed),
    }
  }

  if (normalizedRole === 'AGENT' || normalizedRole === 'TECHNICIAN') {
    const result = await api.get('/dashboard/team')
    const data = result?.data || {}

    const tickets = data.tickets || {}
    const sla = data.sla || {}
    const escalations = data.escalations || {}

    return {
      new: Number(tickets.new) || 0,
      slaRisk:
        (Number(sla.response_sla_at_risk) || 0) +
        (Number(sla.resolution_sla_at_risk) || 0),
      urgent: 0,
      overdue:
        (Number(sla.response_sla_breached) || 0) +
        (Number(sla.resolution_sla_breached) || 0),
      escalations: Number(escalations.active) || 0,
    }
  }

  if (normalizedRole === 'MANAGER') {
    const result = await api.get('/dashboard')
    const data = result?.data || {}

    const tickets = data.tickets || {}
    const sla = data.sla || {}

    const num = (v) => Number(v) || 0
    const total = num(tickets.total)
    const withinSla = num(sla.within_sla)

    return {
      total,
      open: num(tickets.new) + num(tickets.triaged) + num(tickets.assigned) + num(tickets.reopened),
      slaRisk: num(sla.response_sla_at_risk) + num(sla.resolution_sla_at_risk),
      slaBreached: num(sla.response_sla_breached) + num(sla.resolution_sla_breached),
      avgResolution: 'N/A',
      slaCompliance:
        total > 0
          ? Math.round((withinSla / total) * 100)
          : 0,
    }
  }

  return {}
}