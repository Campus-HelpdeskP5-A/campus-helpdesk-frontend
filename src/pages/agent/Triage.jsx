import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTicketById, triageTicket } from '../../api/tickets'
import { getCategories } from '../../api/config'
import { Card, LoadingState, EmptyState } from '../../components/UI'

export default function AgentTriage() {
  const { id } = useParams()
  const navigate = useNavigate()
  // undefined = لسه بيحمّل، null = التذكرة مش موجودة
  const [ticket, setTicket] = useState(undefined)
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setTicket(undefined)
    getTicketById(id)
      .then((t) => {
        if (cancelled) return
        setTicket(t)
        // Backend identifies categories by UUID; match the ticket's category name to its id when possible
        setCategory(t?.category_id || t?.category || '')
        setPriority(String(t?.aiSuggestion?.priority || t?.priority || 'medium').toLowerCase())
      })
      .catch(() => { if (!cancelled) setTicket(null) })
    return () => { cancelled = true }
  }, [id])

  if (ticket === undefined) return <LoadingState />

  if (ticket === null) {
    return (
      <EmptyState>
        التذكرة دي مش موجودة. <Link to="/agent">رجوع للـ Dashboard</Link>
      </EmptyState>
    )
  }

  async function handleConfirm() {
    await triageTicket(id, { category_id: category, category, priority })
    navigate(`/ticket/${id}`)
  }

  const ai = ticket.aiSuggestion

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ marginBottom: 18 }}>Triage — {ticket.id}</h2>
      <div className="grid2">
        <Card title="Current">
          <div className="row-list">
            <div className="item"><span>Category</span><span>{categories.find((c) => String(c.id) === String(category))?.name || ticket.category || 'Uncategorized'}</span></div>
            <div className="item"><span>Priority</span><span>{priority || 'Medium'}</span></div>
            <div className="item"><span>Team</span><span>{ticket.team || '—'}</span></div>
            <div className="item"><span>Technician</span><span>{ticket.technician || '—'}</span></div>
          </div>
        </Card>
        {ai && (
          <div className="pill-ai">
            <div className="row"><b>AI Category</b><span className="conf">{ai.categoryConfidence}%</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${ai.categoryConfidence}%` }} /></div>
            <div style={{ margin: '8px 0 2px' }}>Suggested: <b>{ai.category}</b></div>
            <div className="row" style={{ marginTop: 12 }}><b>AI Priority</b><span className="conf">{ai.priorityConfidence}%</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${ai.priorityConfidence}%` }} /></div>
            <div style={{ marginBottom: 10 }}>Suggested: <b>{ai.priority}</b> — urgency + impact</div>
            <div className="btn-row">
              <button
                className="btn sm"
                style={{ borderColor: '#cbb1af', color: '#f2e9e6' }}
                onClick={() => { setCategory(ai.category); setPriority(ai.priority) }}
              >
                Accept
              </button>
            </div>
          </div>
        )}
      </div>
      {ticket.duplicateOf && (
        <Card title="Duplicate check">
          <p style={{ fontSize: 12.5, margin: 0 }}>Possible duplicate: <b>{ticket.duplicateOf}</b></p>
        </Card>
      )}
      <div className="field">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
      </div>
      <div className="btn-row">
        <button className="btn ghost sm">Request info</button>
        <button className="btn ghost sm">Escalate</button>
        <button className="btn primary sm" onClick={handleConfirm}>Confirm & assign</button>
      </div>
    </div>
  )
}
