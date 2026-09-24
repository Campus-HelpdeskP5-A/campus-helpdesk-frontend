import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets, getKpiSummary } from '../../api/tickets'
import { Kpi, Tag, LoadingState, EmptyState } from '../../components/UI'

const STATUS_LABELS = {
  open: 'Open',
  progress: 'In progress',
  pending: 'Pending',
  done: 'Resolved',
}

export default function ReporterDashboard() {
  const [tickets, setTickets] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    q: '',
  })

  useEffect(() => {
    getKpiSummary('REPORTER')
      .then(setKpis)
      .catch(() => setKpis(null))
  }, [])

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch(() => setTickets([]))
  }, [])

  const filteredTickets = useMemo(() => {
    if (!tickets) return null

    const search = filters.q.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const matchesStatus =
        !filters.status || ticket.status === filters.status

      const matchesPriority =
        !filters.priority || ticket.priority === filters.priority

      const matchesSearch =
        !search ||
        String(ticket.id || '').toLowerCase().includes(search) ||
        String(ticket.reference || '').toLowerCase().includes(search) ||
        String(ticket.title || '').toLowerCase().includes(search) ||
        String(ticket.category || '').toLowerCase().includes(search)

      return matchesStatus && matchesPriority && matchesSearch
    })
  }, [tickets, filters])

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
        <Link to="/reporter/new">
          <button className="btn primary sm">+ Create ticket</button>
        </Link>

        <input
          placeholder="Search tickets..."
          style={{
            flex: 1,
            minWidth: 140,
            height: 32,
            borderRadius: 8,
            border: '1.5px solid var(--cream-dark)',
            background: 'var(--cream)',
            color: 'var(--text-primary)',
            padding: '0 10px',
            fontSize: 12.5,
          }}
          value={filters.q}
          onChange={(e) =>
            setFilters((f) => ({ ...f, q: e.target.value }))
          }
        />

        <select
          className="btn ghost sm"
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
        >
          <option value="">Status</option>
          <option value="open">Open</option>
          <option value="progress">In progress</option>
          <option value="pending">Pending</option>
          <option value="done">Resolved</option>
        </select>

        <select
          className="btn ghost sm"
          value={filters.priority}
          onChange={(e) =>
            setFilters((f) => ({ ...f, priority: e.target.value }))
          }
        >
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {!filteredTickets && <LoadingState />}

      {filteredTickets && filteredTickets.length === 0 && (
        <EmptyState>No tickets found.</EmptyState>
      )}

      {filteredTickets && filteredTickets.length > 0 && (
        <div className="row-list">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/ticket/${ticket.id}`}
              className="item"
            >
              <span>
                {ticket.reference || ticket.id}
                {' — '}
                {ticket.title || ticket.category || 'Ticket'}
              </span>

              <Tag variant={ticket.status}>
                {STATUS_LABELS[ticket.status] || ticket.status}
              </Tag>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
