import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets } from '../../api/tickets'
import { Tag, LoadingState, EmptyState } from '../../components/UI'

const STATUS_LABEL = { open: 'Open', progress: 'In progress', done: 'Resolved' }

export default function AllTickets() {
  const [tickets, setTickets] = useState(null)
  const [filters, setFilters] = useState({ status: '', q: '' })

  useEffect(() => {
    getTickets(filters).then(setTickets).catch(() => setTickets([]))
  }, [filters])

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>All tickets</h2>

      <div className="btn-row" style={{ marginBottom: 16 }}>
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
      {tickets && tickets.length === 0 && <EmptyState>مفيش تذاكر.</EmptyState>}
      {tickets && tickets.length > 0 && (
        <div className="row-list">
          {tickets.map((t) => (
            <Link key={t.id} to={`/ticket/${t.id}`} className="item">
              <span>{t.reference} — {t.title}</span>
              <Tag variant={t.status}>{STATUS_LABEL[t.status]}</Tag>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}