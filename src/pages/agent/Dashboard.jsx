import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets, getKpiSummary } from '../../api/tickets'
import { Kpi, Tag, LoadingState } from '../../components/UI'
import { useLanguage } from '../../context/LanguageContext'

const STATUS_LABELS = {
  open: 'Open',
  progress: 'In progress',
  pending: 'Waiting',
  done: 'Resolved',
}

export default function AgentDashboard() {
  const { t } = useLanguage()
  const [tickets, setTickets] = useState(null)
  const [kpis, setKpis] = useState(null)

  useEffect(() => {
    getKpiSummary('AGENT')
      .then(setKpis)
      .catch(() => setKpis(null))

    getTickets()
      .then(setTickets)
      .catch(() => setTickets([]))
  }, [])

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>{t('Agent dashboard')}</h2>

      {kpis && (
        <div className="kpi-row">
          <Kpi num={kpis.new} label={t('New')} />
          <Kpi num={kpis.slaRisk} label={t('SLA risk')} />
          <Kpi num={kpis.urgent} label={t('Urgent')} />
          <Kpi num={kpis.overdue} label={t('Overdue')} />
          <Kpi num={kpis.escalations} label={t('Escalations')} />
        </div>
      )}

      {!tickets && <LoadingState />}

      {tickets && tickets.length === 0 && (
        <p>{t('No tickets found.')}</p>
      )}

      {tickets && tickets.length > 0 && (
        <table className="mini">
          <thead>
            <tr>
              <th>{t('Ticket')}</th>
              <th>{t('Category')}</th>
              <th>{t('Priority')}</th>
              <th>{t('Status')}</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  {ticket.reference || ticket.id}
                </td>

                <td>
                  {ticket.category || '—'}
                </td>

                <td>
                  <Tag variant={ticket.priority}>
                    {ticket.priority || '—'}
                  </Tag>
                </td>

                <td>
                  <Tag variant={ticket.status}>
                    {t(STATUS_LABELS[ticket.status] || ticket.status)}
                  </Tag>
                </td>

                <td>
                  <Link to={`/agent/triage/${ticket.id}`}>
                    <button className="btn sm">{t('Review')}</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
