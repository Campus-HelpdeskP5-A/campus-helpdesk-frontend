import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTicketById, updateTicketStatus, addComment, getTicketComments, getTicketHistory, getTicketAttachments, getTicketEscalations, resolveEscalation, getTicketWorkLogs, confirmResolution, reopenTicket } from '../../api/tickets'
import { createFeedback, getTicketFeedback } from '../../api/feedback'
import { Tag, LoadingState, EmptyState, Card } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

const PRIORITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }
const STATUS_LABEL = { open: 'Open', progress: 'In progress', pending: 'Waiting', done: 'Resolved' }

export default function TicketDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { t } = useLanguage()
  // undefined = لسه بيحمّل، null = التذكرة مش موجودة
  const [ticket, setTicket] = useState(undefined)
  const [comments, setComments] = useState([])
  const [timeline, setTimeline] = useState([])
  const [attachments, setAttachments] = useState([])
  const [escalations, setEscalations] = useState([])
  const [workLogs, setWorkLogs] = useState([])
  const [comment, setComment] = useState('')
  const [feedback, setFeedback] = useState([])
  const [rating, setRating] = useState('5')
  const [feedbackComment, setFeedbackComment] = useState('')

  useEffect(() => {
    let cancelled = false
    setTicket(undefined)
    Promise.all([
      getTicketById(id),
      getTicketFeedback(id),
      getTicketComments(id).catch(() => []),
      getTicketHistory(id).catch(() => []),
      getTicketAttachments(id).catch(() => []),
      getTicketEscalations(id).catch(() => []),
      getTicketWorkLogs(id).catch(() => []),
    ])
      .then(([tk, f, c, h, a, esc, wl]) => {
        if (!cancelled) {
          setTicket(tk)
          setFeedback(f)
          setComments(c || [])
          setTimeline(h || [])
          setAttachments(a || [])
          setEscalations(esc || [])
          setWorkLogs(wl || [])
        }
      })
      .catch(() => { if (!cancelled) setTicket(null) })
    return () => { cancelled = true }
  }, [id])

  if (ticket === undefined) return <LoadingState />

  if (ticket === null) {
    return (
      <EmptyState>
        التذكرة دي مش موجودة. <Link to="/">رجوع</Link>
      </EmptyState>
    )
  }

  const role = user?.role?.toLowerCase()

  async function handleStatusChange(status) {
    const updated = await updateTicketStatus(id, status)
    setTicket(updated)
  }

  async function handleConfirmResolution() {
    const updated = await confirmResolution(id)
    setTicket(updated)
  }

  async function handleReopen() {
    const updated = await reopenTicket(id)
    setTicket(updated)
  }

  async function handleFeedback() {
    await createFeedback({
      ticket_id: id,
      rating: Number(rating),
      comment: feedbackComment.trim() || null,
    })
    setFeedback(await getTicketFeedback(id))
    setFeedbackComment('')
  }

  async function handleAddComment() {
    if (!comment.trim()) return
    const created = await addComment(id, comment)
    if (created && (created.id || created.comment_id || created.text)) {
      setComments((l) => [...l, created])
    } else {
      setComments(await getTicketComments(id).catch(() => []))
    }
    setComment('')
  }

  async function handleResolveEscalation(escalationId) {
    try {
      await resolveEscalation(escalationId)
      setEscalations((l) => l.map((e) => ((e.escalation_id || e.id) === escalationId ? { ...e, resolved_at: new Date().toISOString() } : e)))
      showToast('تم حل التصعيد ✅')
    } catch (err) {
      showToast(err?.data?.message || err.message || 'Failed to resolve escalation.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{ticket.reference}</div>
          <h2 style={{ margin: 0, fontSize: 18 }}>{ticket.title} — {ticket.location}</h2>
        </div>
        <div className="btn-row">
          <Tag variant={ticket.priority}>{t(PRIORITY_LABEL[ticket.priority] || ticket.priority)}</Tag>
          <Tag variant={ticket.status}>{t(STATUS_LABEL[ticket.status] || ticket.status)}</Tag>
        </div>
      </div>

      <div className="grid2">
        <div>
          <Card title={t('Details')}>
            <div className="row-list">
              <div className="item"><span>{t('Reporter')}</span><span>{ticket.reporter}</span></div>
              <div className="item"><span>{t('Category')}</span><span>{ticket.category}</span></div>
              <div className="item"><span>{t('Location')}</span><span>{ticket.location}</span></div>
              <div className="item"><span>{t('Team')} / {t('Technician')}</span><span>{ticket.team} — {ticket.technician || 'غير محدد'}</span></div>
            </div>
          </Card>
          <Card title={t('Description')}>
            <p style={{ fontSize: 13.5, margin: 0, color: 'var(--text-secondary)' }}>{ticket.description}</p>
          </Card>
          <Card title={t('Timeline')}>
            <div className="row-list">
              {(timeline.length > 0 ? timeline : (ticket.timeline || [])).map((tm, i) => (
                <div className="item" key={tm.id || i}>
                  <span>{tm.label}{tm.by ? ` — ${tm.by}` : ''}{tm.reason ? ` (${tm.reason})` : ''}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{tm.at}</span>
                </div>
              ))}
              {timeline.length === 0 && (ticket.timeline || []).length === 0 && (
                <div className="item"><span style={{ color: 'var(--text-muted)' }}>{t('No history yet.')}</span></div>
              )}
            </div>
          </Card>
          {attachments.length > 0 && (
            <Card title={t('Attachments')}>
              <div className="row-list">
                {attachments.map((a) => (
                  <div className="item" key={a.id}>
                    <span>📎 {a.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{a.size ? `${Math.round(a.size / 1024)} KB` : ''}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {workLogs.length > 0 && (
            <Card title={t('Work logs')}>
              <div className="row-list">
                {workLogs.map((w, i) => (
                  <div className="item" key={w.work_log_id || w.id || i}>
                    <span>{w.note || w.description || w.action_taken || '—'}{w.time_spent_minutes !== undefined ? ` (${w.time_spent_minutes} min)` : ''}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{w.created_at ? new Date(w.created_at).toLocaleDateString() : ''}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {escalations.length > 0 && (
            <Card title={t('Escalations')}>
              <div className="row-list">
                {escalations.map((e) => {
                  const escId = e.escalation_id || e.id
                  const resolved = !!e.resolved_at
                  return (
                    <div className="item" key={escId}>
                      <span>
                        <Tag variant={resolved ? 'done' : 'progress'}>{resolved ? t('Resolved') : t('Open')}</Tag>{' '}
                        {e.severity || ''}{e.reason ? ` — ${e.reason}` : ''}
                      </span>
                      {!resolved && role !== 'reporter' && role !== 'auditor' && (
                        <button className="btn sm ghost" onClick={() => handleResolveEscalation(escId)}>{t('Resolve')}</button>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
        <div>
          <Card title={t('Comments')}>
            {(comments.length > 0 ? comments : (ticket.comments || [])).map((c, i) => (
              <p key={c.id || c.comment_id || i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                <b>{c.author || c.user_name || 'User'}:</b> {c.text || c.body || ''}
              </p>
            ))}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                placeholder="اكتب تعليق…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ flex: 1, height: 34, borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'var(--cream)', color: 'var(--text-primary)', padding: '0 10px', fontSize: 12.5 }}
              />
              <button className="btn sm primary" onClick={handleAddComment}>{t('Send')}</button>
            </div>
          </Card>
          {role === 'reporter' && ticket.status === 'done' && (
            <Card title={t('Resolution')}>
              <div className="btn-row">
                <button className="btn sm primary" onClick={handleConfirmResolution}>{t('Confirm resolution')}</button>
                <button className="btn sm ghost" onClick={handleReopen}>{t('Reopen ticket')}</button>
              </div>
            </Card>
          )}
          {role === 'reporter' && (ticket.status === 'done') && (
            <Card title={t('Satisfaction')}>
              <div className="field">
                <label>{t('Rating')}</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">5 — Excellent</option>
                  <option value="4">4 — Good</option>
                  <option value="3">3 — Okay</option>
                  <option value="2">2 — Poor</option>
                  <option value="1">1 — Very poor</option>
                </select>
              </div>
              <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Optional feedback…" />
              <button className="btn sm primary" onClick={handleFeedback}>{t('Submit feedback')}</button>
            </Card>
          )}
          {feedback.length > 0 && (
            <Card title={t('Satisfaction feedback')}>
              {feedback.map((f) => <div className="item" key={f.feedback_id}><span>{f.rating}/5</span><span>{f.comment || 'No comment'}</span></div>)}
            </Card>
          )}
          {role !== 'reporter' && role !== 'auditor' && (
            <Card title={t('Role actions')}>
              <div className="btn-row">
                <button className="btn sm primary" onClick={() => handleStatusChange('progress')}>{t('Mark in progress')}</button>
                <button className="btn sm ghost" onClick={() => handleStatusChange('done')}>{t('Resolve')}</button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
