import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets, getKpiSummary } from '../../api/tickets'
import { Kpi, Tag, LoadingState } from '../../components/UI'

const STATUS_LABELS = {
  open: 'Open',
  progress: 'In progress',
  pending: 'Pending',
  done: 'Resolved',
}

export default function AgentDashboard() {
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
      <h2 style={{ marginBottom: 18 }}>Agent dashboard</h2>

      {kpis && (
        <div className="kpi-row">
          <Kpi num={kpis.new} label="New" />
          <Kpi num={kpis.slaRisk} label="SLA risk" />
          <Kpi num={kpis.urgent} label="Urgent" />
          <Kpi num={kpis.overdue} label="Overdue" />
          <Kpi num={kpis.escalations} label="Escalations" />
        </div>
      )}

      {!tickets && <LoadingState />}

      {tickets && tickets.length === 0 && (
        <p>No tickets found.</p>
      )}

      {tickets && tickets.length > 0 && (
        <table className="mini">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
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
                    {STATUS_LABELS[ticket.status] || ticket.status}
                  </Tag>
                </td>

                <td>
                  <Link to={`/agent/triage/${ticket.id}`}>
                    <button className="btn sm">Review</button>
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
