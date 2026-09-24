import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets } from '../../api/tickets'
import { Tag, LoadingState, Card } from '../../components/UI'

export default function TechnicianDashboard() {
  const [tickets, setTickets] = useState(null)

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch(() => setTickets([]))
  }, [])

  if (!tickets) return <LoadingState />

  const active = tickets.filter((t) => t.status !== 'done')

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>My dashboard</h2>
      <Card title="Capacity">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
          <span>Active tickets</span><span>{active.length} / 8</span>
        </div>
        <div className="progress-thin"><i style={{ width: `${(active.length / 8) * 100}%` }} /></div>
      </Card>
      <div className="row-list">
        {active.map((t) => (
          <Link key={t.id} to={`/technician/work/${t.id}`} className="item">
            <span>{t.id} — {t.title}</span>
            <Tag variant={t.priority}>{t.priority}</Tag>
          </Link>
        ))}
      </div>
    </div>
  )
}
