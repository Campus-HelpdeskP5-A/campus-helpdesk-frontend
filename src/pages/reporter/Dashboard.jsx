import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets, getKpiSummary } from '../../api/tickets'
import { Kpi, Tag, LoadingState, EmptyState } from '../../components/UI'

export default function ReporterDashboard() {
  const [tickets, setTickets] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', q: '' })

  useEffect(() => {
    getKpiSummary('reporter').then(setKpis)
  }, [])

  useEffect(() => {
    getTickets(filters).then(setTickets)
  }, [filters])

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>My tickets</h2>

      {kpis && (
        <div className="kpi-row">
          <Kpi num={kpis.total} label="Total" />
          <Kpi num={kpis.open} label="Open" />
          <Kpi num={kpis.progress} label="In progress" />
          <Kpi num={kpis.resolved} label="Resolved" />
        </div>
      )}

      <div className="btn-row" style={{ marginBottom: 16 }}>
        <Link to="/reporter/new"><button className="btn primary sm">+ Create ticket</button></Link>
        <input
          placeholder="Search tickets…"
          style={{ flex: 1, minWidth: 140, height: 32, borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'var(--cream)', color: 'var(--text-primary)', padding: '0 10px', fontSize: 12.5 }}
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <select className="btn ghost sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">Status</option>
          <option value="open">Open</option>
          <option value="progress">In progress</option>
          <option value="done">Resolved</option>
        </select>
      </div>

      {!tickets && <LoadingState />}
      {tickets && tickets.length === 0 && <EmptyState>مفيش تذاكر لسه.</EmptyState>}
      {tickets && tickets.length > 0 && (
        <div className="row-list">
          {tickets.map((t) => (
            <Link key={t.id} to={`/ticket/${t.id}`} className="item">
              <span>{t.id} — {t.title}</span>
              <Tag variant={t.status}>{{ open: 'Open', progress: 'In progress', done: 'Resolved' }[t.status]}</Tag>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
