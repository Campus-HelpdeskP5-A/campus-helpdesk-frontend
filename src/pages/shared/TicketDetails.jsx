import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTicketById, updateTicketStatus, addComment, getTicketComments, confirmResolution, reopenTicket } from '../../api/tickets'
import { createFeedback, getTicketFeedback } from '../../api/feedback'
import { Tag, LoadingState, EmptyState, Card } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'

const PRIORITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }
const STATUS_LABEL = { open: 'Open', progress: 'In progress', pending: 'Pending', done: 'Resolved' }

export default function TicketDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  // undefined = لسه بيحمّل، null = التذكرة مش موجودة
  const [ticket, setTicket] = useState(undefined)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [feedback, setFeedback] = useState([])
  const [rating, setRating] = useState('5')
  const [feedbackComment, setFeedbackComment] = useState('')

  useEffect(() => {
    let cancelled = false
    setTicket(undefined)
    Promise.all([getTicketById(id), getTicketFeedback(id), getTicketComments(id).catch(() => [])])
      .then(([t, f, c]) => { if (!cancelled) { setTicket(t); setFeedback(f); setComments(c || []) } })
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{ticket.reference}</div>
          <h2 style={{ margin: 0, fontSize: 18 }}>{ticket.title} — {ticket.location}</h2>
        </div>
        <div className="btn-row">
          <Tag variant={ticket.priority}>{PRIORITY_LABEL[ticket.priority] || ticket.priority}</Tag>
          <Tag variant={ticket.status}>{STATUS_LABEL[ticket.status] || ticket.status}</Tag>
        </div>
      </div>

      <div className="grid2">
        <div>
          <Card title="Details">
            <div className="row-list">
              <div className="item"><span>Reporter</span><span>{ticket.reporter}</span></div>
              <div className="item"><span>Category</span><span>{ticket.category}</span></div>
              <div className="item"><span>Location</span><span>{ticket.location}</span></div>
              <div className="item"><span>Team / technician</span><span>{ticket.team} — {ticket.technician || 'غير محدد'}</span></div>
            </div>
          </Card>
          <Card title="Description">
            <p style={{ fontSize: 13.5, margin: 0, color: 'var(--text-secondary)' }}>{ticket.description}</p>
          </Card>
          <Card title="Timeline">
            <div className="row-list">
              {(ticket.timeline || []).map((t, i) => (
                <div className="item" key={i}>
                  <span>{t.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.at}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card title="Comments">
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
              <button className="btn sm primary" onClick={handleAddComment}>Send</button>
            </div>
          </Card>
          {role === 'reporter' && ticket.status === 'done' && (
            <Card title="Resolution">
              <div className="btn-row">
                <button className="btn sm primary" onClick={handleConfirmResolution}>Confirm resolution</button>
                <button className="btn sm ghost" onClick={handleReopen}>Reopen ticket</button>
              </div>
            </Card>
          )}
          {role === 'reporter' && (ticket.status === 'done') && (
            <Card title="Satisfaction">
              <div className="field">
                <label>Rating</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">5 — Excellent</option>
                  <option value="4">4 — Good</option>
                  <option value="3">3 — Okay</option>
                  <option value="2">2 — Poor</option>
                  <option value="1">1 — Very poor</option>
                </select>
              </div>
              <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Optional feedback…" />
              <button className="btn sm primary" onClick={handleFeedback}>Submit feedback</button>
            </Card>
          )}
          {feedback.length > 0 && (
            <Card title="Satisfaction feedback">
              {feedback.map((f) => <div className="item" key={f.feedback_id}><span>{f.rating}/5</span><span>{f.comment || 'No comment'}</span></div>)}
            </Card>
          )}
          {role !== 'reporter' && role !== 'auditor' && (
            <Card title="Role actions">
              <div className="btn-row">
                <button className="btn sm primary" onClick={() => handleStatusChange('progress')}>Mark in progress</button>
                <button className="btn sm ghost" onClick={() => handleStatusChange('done')}>Resolve</button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
