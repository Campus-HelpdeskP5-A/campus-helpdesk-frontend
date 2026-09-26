import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets } from '../../api/tickets'
import { getLocations, getSupportTeams, getTechnicians } from '../../api/config'
import { Tag, LoadingState, Card } from '../../components/UI'
import { useLanguage } from '../../context/LanguageContext'

const initialFilters = {
  status: '',
  priority: '',
  team_id: '',
  assignee_id: '',
  location_id: '',
  due: '',
}

export default function TechnicianDashboard() {
  const { t } = useLanguage()
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
      <h2 style={{ marginBottom: 18 }}>{t('Technician Queue')}</h2>

      <Card title={t('Queue filters')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="">{t('All statuses')}</option>
            <option value="open">{t('Open')}</option>
            <option value="progress">{t('In progress')}</option>
            <option value="pending">{t('Waiting')}</option>
            <option value="done">{t('Resolved')}</option>
          </select>

          <select value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}>
            <option value="">{t('All priorities')}</option>
            <option value="low">{t('Low')}</option>
            <option value="medium">{t('Medium')}</option>
            <option value="high">{t('High')}</option>
            <option value="critical">{t('Critical')}</option>
          </select>

          <select value={filters.team_id} onChange={(e) => updateFilter('team_id', e.target.value)}>
            <option value="">{t('All teams')}</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          <select value={filters.assignee_id} onChange={(e) => updateFilter('assignee_id', e.target.value)}>
            <option value="">{t('All assignees')}</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>{technician.name}</option>
            ))}
          </select>

          <select value={filters.location_id} onChange={(e) => updateFilter('location_id', e.target.value)}>
            <option value="">{t('All locations')}</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.label}</option>
            ))}
          </select>

          <select value={filters.due} onChange={(e) => updateFilter('due', e.target.value)}>
            <option value="">{t('Any due time')}</option>
            <option value="overdue">{t('Overdue')}</option>
            <option value="today">{t('Due today')}</option>
            <option value="upcoming">{t('Upcoming')}</option>
          </select>
        </div>

        <button
          type="button"
          className="btn ghost sm"
          onClick={() => setFilters(initialFilters)}
          style={{ marginTop: 12 }}
        >
          {t('Clear filters')}
        </button>

        <div style={{ marginTop: 12, fontSize: 12.5, opacity: 0.75 }}>
          Showing {tickets.length} loaded ticket(s) — {total} matching ticket(s) total.
        </div>
      </Card>

      <Card title={t('Capacity')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
          <span>{t('Active tickets')}</span><span>{active.length} / 8</span>
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
