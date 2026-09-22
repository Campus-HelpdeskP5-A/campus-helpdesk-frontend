import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../../api/tickets'
import { ErrorBanner } from '../../components/UI'

export default function CreateTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', category: 'Network', location: '', asset: '', urgency: 'Normal',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const ticket = await createTicket(form)
      navigate(`/ticket/${ticket.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: 20 }}>Create ticket</h2>
      <ErrorBanner>{error}</ErrorBanner>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Title</label>
          <input required placeholder="عنوان مختصر للمشكلة" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea required placeholder="تفاصيل المشكلة…" value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>
        <div className="grid2">
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => update('category', e.target.value)}>
              <option>Network</option>
              <option>Electrical</option>
              <option>Plumbing</option>
              <option>HVAC</option>
            </select>
          </div>
          <div className="field">
            <label>Building / room</label>
            <input required placeholder="مبنى 3 — قاعة 101" value={form.location} onChange={(e) => update('location', e.target.value)} />
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label>Optional asset</label>
            <input placeholder="رقم الجهاز (اختياري)" value={form.asset} onChange={(e) => update('asset', e.target.value)} />
          </div>
          <div className="field">
            <label>Urgency</label>
            <select value={form.urgency} onChange={(e) => update('urgency', e.target.value)}>
              <option>Normal</option>
              <option>High</option>
              <option>Emergency</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Attachment</label>
          <div style={{ border: '1.5px dashed var(--cream-dark)', borderRadius: 8, padding: 16, textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>
            اسحب ملف أو اضغط للرفع
          </div>
        </div>
        <button className="btn primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? '...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
