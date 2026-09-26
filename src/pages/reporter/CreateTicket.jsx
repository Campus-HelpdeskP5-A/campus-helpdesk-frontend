import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../../api/tickets'
import { getCategories, getLocations } from '../../api/config'
import { USE_MOCKS } from '../../api/client'
import { ErrorBanner } from '../../components/UI'
import EmergencyBanner from '../../components/EmergencyBanner'
import { containsEmergencyKeyword } from '../../utils/emergencyDetection'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export default function CreateTicket() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
<<<<<<< HEAD
    title: '', description: '', category: '', location: '', asset: '', impact: 'Medium', urgency: 'Medium',
=======
    title: '', description: '', category: '', location: '', asset: '', urgency: 'Medium', impact: 'Medium',
>>>>>>> e046bbc (HLP-FR-02, Sprint 1, Frontend: Done)
  })
  const [attachment, setAttachment] = useState(null)
  const [attachmentError, setAttachmentError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
<<<<<<< HEAD

  useEffect(() => {
    Promise.all([getCategories(), getLocations()])
      .then(([categoryList, locationList]) => {
        setCategories(categoryList.filter((c) => c.active !== false))
        setLocations(locationList)
      })
      .catch(() => setError('تعذر تحميل بيانات الفئات والمواقع. حدّث الصفحة وحاول تاني.'))
=======

  const isEmergency = containsEmergencyKeyword(form.title) || containsEmergencyKeyword(form.description)

  useEffect(() => {
    getCategories()
      .then((list) => setCategories(list.filter((c) => c.active !== false)))
      .catch(() => setError('تعذر تحميل الفئات. حدّث الصفحة وحاول تاني.'))
    getLocations()
      .then(setLocations)
      .catch(() => setError('تعذر تحميل الأماكن. حدّث الصفحة وحاول تاني.'))
>>>>>>> e046bbc (HLP-FR-02, Sprint 1, Frontend: Done)
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAttachmentError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAttachmentError('نوع الملف غير مسموح. الأنواع المسموحة: PNG، JPEG، PDF، Word.')
      setAttachment(null)
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE) {
      setAttachmentError('حجم الملف أكبر من 5MB المسموح بيها.')
      setAttachment(null)
      e.target.value = ''
      return
    }
    setAttachment(file)
  }

  function removeAttachment() {
    setAttachment(null)
    setAttachmentError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const clean = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      asset: form.asset.trim(),
      impact: form.impact,
    }
<<<<<<< HEAD
<<<<<<< HEAD
    if (!clean.title || !clean.description || !clean.location || !clean.impact) {
=======
       if (!clean.title || !clean.description || !clean.location) {
>>>>>>> e046bbc (HLP-FR-02, Sprint 1, Frontend: Done)
=======
    if (!clean.title || !clean.description || !clean.location) {
>>>>>>> 3cd98ae (HLP-FR-02, Sprint 1, Frontend: Update)
      setError('Title و Description و Building/room مطلوبين ومينفعش يكونوا مسافات بس.')
      return
    }
    if (!USE_MOCKS && clean.asset && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean.asset)) {
      setError('Asset ID لازم يكون UUID صحيح. سيبه فاضي لحد ما الباك يضيف endpoint للأجهزة.')
      return
    }
    setSubmitting(true)
    try {
      const cat = categories.find((c) => String(c.id) === String(clean.category))
      const payload = { ...clean, categoryName: cat?.name, file: attachment }
      const ticket = await createTicket(payload, user?.name)
      showToast(`تم إنشاء التذكرة ${ticket.reference || ticket.id} بنجاح ✅`)
      navigate(`/ticket/${ticket.id}`)
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Failed to create ticket'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: 20 }}>Create ticket</h2>
      <ErrorBanner>{error}</ErrorBanner>
      {isEmergency && <EmergencyBanner />}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Title</label>
          <input required maxLength={120} placeholder="عنوان مختصر للمشكلة" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea required maxLength={2000} placeholder="تفاصيل المشكلة…" value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>
        <div className="grid2">
          <div className="field">
            <label>Category</label>
            <select required value={form.category} onChange={(e) => update('category', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Building / room</label>
            <select required value={form.location} onChange={(e) => update('location', e.target.value)}>
              <option value="">Select location</option>
              {locations.map((l) => (
<<<<<<< HEAD
                <option key={l.id} value={l.id}>{l.label}</option>
=======
                <option key={l.id} value={l.id}>{l.name}</option>
>>>>>>> e046bbc (HLP-FR-02, Sprint 1, Frontend: Done)
              ))}
            </select>
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label>Optional asset</label>
            <input maxLength={50} placeholder="رقم الجهاز (اختياري)" value={form.asset} onChange={(e) => update('asset', e.target.value)} />
          </div>
          <div className="field">
            <label>Impact</label>
            <select value={form.impact} onChange={(e) => update('impact', e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="field">
            <label>Urgency</label>
            <select value={form.urgency} onChange={(e) => update('urgency', e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Impact</label>
          <select value={form.impact} onChange={(e) => update('impact', e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div className="field">
          <label>Attachment</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '1.5px dashed var(--cream-dark)',
              borderRadius: 8,
              padding: 16,
              textAlign: 'center',
              fontSize: 12.5,
              color: attachment ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {attachment ? (
              <span>
                📎 {attachment.name} ({Math.round(attachment.size / 1024)} KB)
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeAttachment() }}
                  className="btn ghost sm"
                  style={{ marginInlineStart: 10 }}
                >
                  إزالة
                </button>
              </span>
            ) : (
              'اسحب ملف أو اضغط للرفع (PNG، JPEG، PDF، Word — حتى 5MB)'
            )}
          </div>
          {attachmentError && (
            <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 6 }}>{attachmentError}</div>
          )}
        </div>
        <button className="btn primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? '...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}