import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { submitWorkLog, updateTicketStatus } from '../../api/tickets'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

export default function TicketWork() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    diagnosis: '', actions: '', parts: '', timeSpent: '', resolutionCode: 'Fixed', internalNote: '', reporterComment: '',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleResolve() {
    setBusy(true)
    try {
      await submitWorkLog(id, form)
      navigate(`/ticket/${id}`)
    } catch (err) {
      showToast(err.message || 'حصلت مشكلة وهو بيحل التذكرة.')
      setBusy(false)
    }
  }

  async function handleStatus(status, message) {
    setBusy(true)
    try {
      await updateTicketStatus(id, status)
      showToast(message)
    } catch (err) {
      showToast(err.message || 'حصلت مشكلة وهو بيحدّث الحالة.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: 18 }}>{t('Ticket work')} — {id}</h2>
      <div className="field">
        <label>{t('Diagnosis')}</label>
        <textarea placeholder="السبب اللي تم اكتشافه…" value={form.diagnosis} onChange={(e) => update('diagnosis', e.target.value)} />
      </div>
      <div className="field">
        <label>{t('Actions taken')}</label>
        <textarea placeholder="الخطوات اللي اتعملت…" value={form.actions} onChange={(e) => update('actions', e.target.value)} />
      </div>
      <div className="grid2">
        <div className="field">
          <label>{t('Parts used')}</label>
          <input placeholder="مثلاً: فيوز، كابل شبكة" value={form.parts} onChange={(e) => update('parts', e.target.value)} />
        </div>
        <div className="field">
          <label>{t('Time spent')}</label>
          <input placeholder="45 دقيقة" value={form.timeSpent} onChange={(e) => update('timeSpent', e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>{t('Resolution code')}</label>
        <select value={form.resolutionCode} onChange={(e) => update('resolutionCode', e.target.value)}>
          <option>Fixed</option><option>Replaced part</option><option>Needs follow-up</option>
        </select>
      </div>
      <div className="field">
        <label>{t('Internal note')}</label>
        <textarea placeholder="ملاحظة داخلية (مش ظاهرة للـ Reporter)" value={form.internalNote} onChange={(e) => update('internalNote', e.target.value)} />
      </div>
      <div className="field">
        <label>{t('Reporter-visible comment')}</label>
        <textarea placeholder="تعليق هيشوفه اللي بلّغ" value={form.reporterComment} onChange={(e) => update('reporterComment', e.target.value)} />
      </div>
      <div className="btn-row">
        <button className="btn ghost sm" disabled={busy} onClick={() => handleStatus('progress', 'الحالة اتغيّرت لـ In progress')}>{t('Start work')}</button>
        <button className="btn ghost sm" disabled={busy} onClick={() => handleStatus('pending', 'الحالة اتغيّرت لـ Pending')}>{t('Waiting')}</button>
        <button className="btn primary sm" disabled={busy} onClick={handleResolve}>{t('Resolve')}</button>
      </div>
    </div>
  )
}
