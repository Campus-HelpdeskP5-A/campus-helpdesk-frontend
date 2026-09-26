import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets } from '../../api/tickets'
import { getLocations, getSupportTeams, getTechnicians } from '../../api/config'
import { Tag, LoadingState, Card } from '../../components/UI'

const initialFilters = {
  status: '',
  priority: '',
  team_id: '',
  assignee_id: '',
  location_id: '',
  due: '',
}

export default function TechnicianDashboard() {
  const [tickets, setTickets] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [teams, setTeams] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [locations, setLocations] = useState([])

  useEffect(() => {
    Promise.all([
      getSupportTeams(),
      getTechnicians(),
      getLocations(),
    ])
      .then(([teamData, technicianData, locationData]) => {
        setTeams(teamData)
        setTechnicians(technicianData)
        setLocations(locationData)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setTickets(null)
    getTickets(filters)
      .then(setTickets)
      .catch(() => setTickets([]))
  }, [filters])

  if (!tickets) return <LoadingState />

  const active = tickets.filter((t) => t.status !== 'done')
  const total = Number.isFinite(tickets.total) ? tickets.total : tickets.length

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Technician Queue</h2>

      <Card title="Queue filters">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="progress">In progress</option>
            <option value="pending">Waiting</option>
            <option value="done">Resolved / closed</option>
          </select>

          <select value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select value={filters.team_id} onChange={(e) => updateFilter('team_id', e.target.value)}>
            <option value="">All teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          <select value={filters.assignee_id} onChange={(e) => updateFilter('assignee_id', e.target.value)}>
            <option value="">All assignees</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>{technician.name}</option>
            ))}
          </select>

          <select value={filters.location_id} onChange={(e) => updateFilter('location_id', e.target.value)}>
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.label}</option>
            ))}
          </select>

          <select value={filters.due} onChange={(e) => updateFilter('due', e.target.value)}>
            <option value="">Any due time</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <button
          type="button"
          className="btn ghost sm"
          onClick={() => setFilters(initialFilters)}
          style={{ marginTop: 12 }}
        >
          Clear filters
        </button>

        <div style={{ marginTop: 12, fontSize: 12.5, opacity: 0.75 }}>
          Showing {tickets.length} loaded ticket(s) — {total} matching ticket(s) total.
        </div>
      </Card>

      <Card title="Capacity">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
          <span>Active tickets</span><span>{active.length} / 8</span>
        </div>
        <div className="progress-thin"><i style={{ width: `${Math.min((active.length / 8) * 100, 100)}%` }} /></div>
      </Card>

      <div className="row-list">
        {active.map((t) => (
          <Link key={t.id} to={`/technician/work/${t.id}`} className="item">
            <span>
              {t.reference} — {t.title}
              <small style={{ display: 'block', opacity: 0.65 }}>
                {t.team_name || 'Unassigned team'} · {t.assignee_name || 'Unassigned'} · {t.location || [t.building, t.floor, t.room_code].filter(Boolean).join(' — ')}
              </small>
            </span>
            <Tag variant={t.priority}>{t.priority}</Tag>
          </Link>
        ))}
      </div>
    </div>
  )
}
