import { useEffect, useState } from 'react'
import { getTechniciansWorkload, assignTechnician } from '../../api/users'
import { getTickets } from '../../api/tickets'
import { LoadingState, EmptyState, Tag } from '../../components/UI'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

export default function Workload() {
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [techs, setTechs] = useState(null)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState('')
  const [assigningId, setAssigningId] = useState(null)

  useEffect(() => {
    getTechniciansWorkload().then(setTechs).catch(() => setTechs([]))
    getTickets({ status: 'open' }).then(setTickets).catch(() => setTickets([]))
  }, [])

  async function handleAssign(techId, techName) {
    if (!selectedTicket) {
      showToast('اختار تذكرة من القائمة الأول عشان تعيّنها.')
      return
    }
    setAssigningId(techId)
    try {
      await assignTechnician(selectedTicket, techId)
      showToast(`تم تعيين التذكرة لـ ${techName} ✅`)
      setTechs(await getTechniciansWorkload().catch(() => techs))
    } catch (err) {
      showToast(err?.data?.message || err.message || 'Failed to assign ticket.')
    } finally {
      setAssigningId(null)
    }
  }

  if (!techs) return <LoadingState />

  const suggestedId = [...techs].sort((a, b) => a.active - b.active)[0]?.id

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>{t('Workload & assignment')}</h2>
      <div className="field" style={{ maxWidth: 480 }}>
        <label>{t('Ticket to assign')}</label>
        <select value={selectedTicket} onChange={(e) => setSelectedTicket(e.target.value)}>
          <option value="">{t('Select a ticket…')}</option>
          {tickets.map((tk) => (
            <option key={tk.id} value={tk.id}>
              {tk.reference} — {tk.title || tk.category || 'Ticket'}
            </option>
          ))}
        </select>
      </div>
      {techs.length === 0 ? (
        <EmptyState>مفيش فنيين متاحين حالياً.</EmptyState>
      ) : (
        <table className="mini">
          <thead>
            <tr><th>{t('Technician')}</th><th>{t('Active')}</th><th>{t('Capacity')}</th><th>{t('Status')}</th><th>{t('Urgent')}</th><th></th></tr>
          </thead>
          <tbody>
            {techs.map((t) => (
              <tr key={t.id}>
                <td>{t.name} {t.id === suggestedId && <span style={{ color: 'var(--success)', fontSize: 11 }}>★ suggested</span>}</td>
                <td>{t.active}</td>
                <td>{t.capacity}</td>
                <td><Tag variant={t.status === 'available' ? 'done' : 'progress'}>{t.status === 'available' ? t('Available') : t('Busy')}</Tag></td>
                <td>{t.urgent}</td>
                <td>
                  <button
                    className={`btn sm${t.id === suggestedId ? ' primary' : ''}`}
                    disabled={assigningId === t.id}
                    onClick={() => handleAssign(t.id, t.name)}
                  >
                    {assigningId === t.id ? '…' : t.id === suggestedId ? t('Assign') : t('Reassign')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
