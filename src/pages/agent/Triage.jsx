import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTicketById, triageTicket, addComment, createEscalation, getTicketPredictions } from '../../api/tickets'
import { getCategories, getSupportTeams } from '../../api/config'
import { Card, LoadingState, EmptyState } from '../../components/UI'
import { useToast } from '../../context/ToastContext'

export default function AgentTriage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  // undefined = لسه بيحمّل، null = التذكرة مش موجودة
  const [ticket, setTicket] = useState(undefined)
  const [categories, setCategories] = useState([])
  const [teams, setTeams] = useState([])
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [escalateTeam, setEscalateTeam] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
    getSupportTeams().then(setTeams).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setTicket(undefined)
    Promise.all([
      getTicketById(id),
      getTicketPredictions(id).catch(() => null),
    ])
      .then(([t, p]) => {
        if (cancelled) return
        setTicket(t)
        setPrediction(p)
        // Backend identifies categories by UUID; match the ticket's category name to its id when possible
        setCategory(t?.category_id || t?.category || '')
        setPriority(String(p?.priority || t?.aiSuggestion?.priority || t?.priority || 'medium').toLowerCase())
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
    setBusy(true)
    try {
      await triageTicket(id, { category_id: category, category, priority })
      navigate(`/ticket/${id}`)
    } catch (err) {
      showToast(err?.data?.message || err.message || 'Failed to confirm triage.')
      setBusy(false)
    }
  }

  async function handleRequestInfo() {
    setBusy(true)
    try {
      await addComment(id, 'Agent requested more information about this ticket. Please update the description with further details.')
      showToast('تم إرسال طلب معلومات إضافية ✅')
    } catch (err) {
      showToast(err?.data?.message || err.message || 'Failed to request info.')
    } finally {
      setBusy(false)
    }
  }

  async function handleEscalate() {
    if (!escalateTeam) {
      showToast('اختار الفريق اللي هتصعّد ليه التذكرة الأول.')
      return
    }
    setBusy(true)
    try {
      await createEscalation({
        ticket_id: id,
        trigger_type: 'MANUAL',
        severity: String(priority || 'medium').toUpperCase(),
        reason: 'Escalated by agent for review.',
        assigned_team_id: escalateTeam,
      })
      showToast('تم تصعيد التذكرة ✅')
      navigate(`/ticket/${id}`)
    } catch (err) {
      showToast(err?.data?.message || err.message || 'Failed to escalate ticket.')
      setBusy(false)
    }
  }

  const ai = prediction?.category || prediction?.priority
    ? {
        category: prediction.category || ticket.aiSuggestion?.category,
        categoryConfidence: prediction.categoryConfidence ?? ticket.aiSuggestion?.categoryConfidence,
        priority: prediction.priority || ticket.aiSuggestion?.priority,
        priorityConfidence: prediction.priorityConfidence ?? ticket.aiSuggestion?.priorityConfidence,
      }
    : ticket.aiSuggestion

  function acceptAi() {
    if (ai?.category) {
      const match = categories.find(
        (c) => String(c.name).toLowerCase() === String(ai.category).toLowerCase()
      )
      setCategory(match ? match.id : ai.category)
    }
    if (ai?.priority) setPriority(String(ai.priority).toLowerCase())
  }

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
            <div className="row"><b>AI Category</b><span className="conf">{ai.categoryConfidence ?? '—'}%</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${ai.categoryConfidence ?? 0}%` }} /></div>
            <div style={{ margin: '8px 0 2px' }}>Suggested: <b>{ai.category}</b></div>
            <div className="row" style={{ marginTop: 12 }}><b>AI Priority</b><span className="conf">{ai.priorityConfidence ?? '—'}%</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${ai.priorityConfidence ?? 0}%` }} /></div>
            <div style={{ marginBottom: 10 }}>Suggested: <b>{ai.priority}</b> — urgency + impact</div>
            <div className="btn-row">
              <button
                className="btn sm"
                style={{ borderColor: '#cbb1af', color: '#f2e9e6' }}
                onClick={acceptAi}
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
      <div className="field">
        <label>Escalate to team</label>
        <select value={escalateTeam} onChange={(e) => setEscalateTeam(e.target.value)}>
          <option value="">Select team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="btn-row">
        <button className="btn ghost sm" disabled={busy} onClick={handleRequestInfo}>Request info</button>
        <button className="btn ghost sm" disabled={busy} onClick={handleEscalate}>Escalate</button>
        <button className="btn primary sm" disabled={busy} onClick={handleConfirm}>Confirm & assign</button>
      </div>
    </div>
  )
}
