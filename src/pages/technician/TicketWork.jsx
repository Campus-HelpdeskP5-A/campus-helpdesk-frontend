import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { submitWorkLog } from '../../api/tickets'

export default function TicketWork() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    diagnosis: '', actions: '', parts: '', timeSpent: '', resolutionCode: 'Fixed', internalNote: '', reporterComment: '',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleResolve() {
    await submitWorkLog(id, form)
    navigate(`/ticket/${id}`)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: 18 }}>Ticket work — {id}</h2>
      <div className="field">
        <label>Diagnosis</label>
        <textarea placeholder="السبب اللي تم اكتشافه…" value={form.diagnosis} onChange={(e) => update('diagnosis', e.target.value)} />
      </div>
      <div className="field">
        <label>Actions taken</label>
        <textarea placeholder="الخطوات اللي اتعملت…" value={form.actions} onChange={(e) => update('actions', e.target.value)} />
      </div>
      <div className="grid2">
        <div className="field">
          <label>Parts used</label>
          <input placeholder="مثلاً: فيوز، كابل شبكة" value={form.parts} onChange={(e) => update('parts', e.target.value)} />
        </div>
        <div className="field">
          <label>Time spent</label>
          <input placeholder="45 دقيقة" value={form.timeSpent} onChange={(e) => update('timeSpent', e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Resolution code</label>
        <select value={form.resolutionCode} onChange={(e) => update('resolutionCode', e.target.value)}>
          <option>Fixed</option><option>Replaced part</option><option>Needs follow-up</option>
        </select>
      </div>
      <div className="field">
        <label>Internal note</label>
        <textarea placeholder="ملاحظة داخلية (مش ظاهرة للـ Reporter)" value={form.internalNote} onChange={(e) => update('internalNote', e.target.value)} />
      </div>
      <div className="field">
        <label>Reporter-visible comment</label>
        <textarea placeholder="تعليق هيشوفه اللي بلّغ" value={form.reporterComment} onChange={(e) => update('reporterComment', e.target.value)} />
      </div>
      <div className="btn-row">
        <button className="btn ghost sm">Start work</button>
        <button className="btn ghost sm">Waiting</button>
        <button className="btn primary sm" onClick={handleResolve}>Resolve</button>
      </div>
    </div>
  )
}
