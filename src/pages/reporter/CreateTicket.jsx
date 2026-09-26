import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../../api/tickets'
import { getCategories, getLocations } from '../../api/config'
import { ErrorBanner } from '../../components/UI'
import EmergencyBanner from '../../components/EmergencyBanner'
import { containsEmergencyKeyword } from '../../utils/emergencyDetection'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

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
  const { t } = useLanguage()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', asset: '', impact: 'Medium', urgency: 'Medium',
  })
  const [attachment, setAttachment] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [attachmentError, setAttachmentError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])

  const isEmergency = containsEmergencyKeyword(form.title) || containsEmergencyKeyword(form.description)

  useEffect(() => {
    Promise.all([getCategories(), getLocations()])
      .then(([categoryList, locationList]) => {
        setCategories((categoryList || []).filter((c) => (c.active ?? c.is_active ?? true) !== false))
        setLocations(locationList || [])
      })
      .catch(() => setError('تعذر تحميل بيانات الفئات والمواقع. حدّث الصفحة وحاول تاني.'))
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
      setPreviewUrl((u) => { if (u) URL.revokeObjectURL(u); return null })
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE) {
      setAttachmentError('حجم الملف أكبر من 5MB المسموح بيها.')
      setAttachment(null)
      setPreviewUrl((u) => { if (u) URL.revokeObjectURL(u); return null })
      e.target.value = ''
      return
    }
    setPreviewUrl((u) => { if (u) URL.revokeObjectURL(u); return null })
    setAttachment(file)
    // Local preview for images (the backend stores attachment metadata;
    // file bytes are handled by the storage layer separately).
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  function removeAttachment() {
    setAttachment(null)
    setAttachmentError(null)
    setPreviewUrl((u) => { if (u) URL.revokeObjectURL(u); return null })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

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
    if (!clean.title || !clean.description || !clean.location || !clean.category) {
      setError('Title و Description و Category و Building/room مطلوبين ومينفعش يكونوا مسافات بس.')
      return
    }
    // Backend accepts an asset UUID or an asset tag; unknown tags only raise a warning.
    setSubmitting(true)
    try {
      const cat = categories.find((c) => String(c.id) === String(clean.category))
      const payload = { ...clean, categoryName: cat?.name, file: attachment }
      const ticket = await createTicket(payload, user?.name)
      const warning = ticket?.asset_warning
      showToast(`تم إنشاء التذكرة ${ticket.reference || ticket.id} بنجاح ✅${warning ? ` (ملحوظة: ${warning})` : ''}`)
      navigate(`/ticket/${ticket.ticket_id || ticket.id}`)
    } catch (err) {
      const data = err?.data
      const msg =
        data?.message ||
        (data?.allowed_values ? `${data.message || 'Invalid value'} (Allowed: ${data.allowed_values.join(', ')})` : null) ||
        err?.message ||
        'Failed to create ticket'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: 20 }}>{t('Create ticket')}</h2>
      <ErrorBanner>{error}</ErrorBanner>
      {isEmergency && <EmergencyBanner />}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>{t('Title')}</label>
          <input required maxLength={120} placeholder="عنوان مختصر للمشكلة" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>
        <div className="field">
          <label>{t('Description')}</label>
          <textarea required maxLength={2000} placeholder="تفاصيل المشكلة…" value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>
        <div className="grid2">
          <div className="field">
            <label>{t('Category')}</label>
            <select required value={form.category} onChange={(e) => update('category', e.target.value)}>
              <option value="">{t('Select category')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t('Building / room')}</label>
            <select required value={form.location} onChange={(e) => update('location', e.target.value)}>
              <option value="">{t('Select location')}</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.label ?? l.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label>{t('Optional asset')}</label>
            <input maxLength={50} placeholder="رقم الجهاز (اختياري)" value={form.asset} onChange={(e) => update('asset', e.target.value)} />
          </div>
          <div className="field">
            <label>{t('Impact')}</label>
            <select value={form.impact} onChange={(e) => update('impact', e.target.value)}>
              <option value="Low">{t('Low')}</option>
              <option value="Medium">{t('Medium')}</option>
              <option value="High">{t('High')}</option>
            </select>
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label>{t('Urgency')}</label>
            <select value={form.urgency} onChange={(e) => update('urgency', e.target.value)}>
              <option value="Low">{t('Low')}</option>
              <option value="Medium">{t('Medium')}</option>
              <option value="High">{t('High')}</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>{t('Attachment')}</label>
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
                {previewUrl ? (
                  <img src={previewUrl} alt={attachment.name} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, display: 'block', margin: '0 auto 10px' }} />
                ) : (
                  <span>📎 {attachment.name} ({Math.round(attachment.size / 1024)} KB)</span>
                )}
                {previewUrl && <span>📎 {attachment.name} ({Math.round(attachment.size / 1024)} KB)</span>}
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
          {submitting ? '...' : t('Submit')}
        </button>
      </form>
    </div>
  )
}
