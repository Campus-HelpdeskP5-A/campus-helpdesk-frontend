import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets, getKpiSummary } from '../../api/tickets'
import { Kpi, Tag, LoadingState } from '../../components/UI'

export default function AgentDashboard() {
  const [tickets, setTickets] = useState(null)
  const [kpis, setKpis] = useState(null)

  useEffect(() => {
    getKpiSummary('agent').then(setKpis)
    getTickets().then(setTickets)
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
      {tickets && (
        <table className="mini">
          <thead>
            <tr><th>Ticket</th><th>Category</th><th>Priority</th><th>SLA</th><th></th></tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.category}</td>
                <td><Tag variant={t.priority}>{t.priority}</Tag></td>
                <td><Tag variant={t.status === 'open' ? 'progress' : 'done'}>{t.status === 'open' ? 'Risk' : 'OK'}</Tag></td>
                <td><Link to={`/agent/triage/${t.id}`}><button className="btn sm">Review</button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
