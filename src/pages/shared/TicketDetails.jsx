import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTicketById, updateTicketStatus, addComment } from '../../api/tickets'
import { Tag, LoadingState, Card } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'

const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }
const STATUS_LABEL = { open: 'Open', progress: 'In progress', done: 'Resolved' }

export default function TicketDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    getTicketById(id).then(setTicket)
  }, [id])

  if (!ticket) return <LoadingState />

  async function handleStatusChange(status) {
    const updated = await updateTicketStatus(id, status)
    setTicket(updated)
  }

  async function handleAddComment() {
    if (!comment.trim()) return
    const updated = await addComment(id, comment)
    setTicket(updated)
    setComment('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{ticket.id}</div>
          <h2 style={{ margin: 0, fontSize: 18 }}>{ticket.title} — {ticket.location}</h2>
        </div>
        <div className="btn-row">
          <Tag variant={ticket.priority}>{PRIORITY_LABEL[ticket.priority]}</Tag>
          <Tag variant={ticket.status}>{STATUS_LABEL[ticket.status]}</Tag>
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
              {ticket.timeline.map((t, i) => (
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
            {ticket.comments.map((c, i) => (
              <p key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                <b>{c.author}:</b> {c.text}
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
          {user?.role !== 'reporter' && user?.role !== 'auditor' && (
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
