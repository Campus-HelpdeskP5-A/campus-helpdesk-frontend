import { useEffect, useState } from 'react'
import { getTechniciansWorkload } from '../../api/users'
import { LoadingState, Tag } from '../../components/UI'

export default function Workload() {
  const [techs, setTechs] = useState(null)

  useEffect(() => {
    getTechniciansWorkload().then(setTechs)
  }, [])

  if (!techs) return <LoadingState />

  const suggestedId = [...techs].sort((a, b) => a.active - b.active)[0]?.id

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Workload & assignment</h2>
      <table className="mini">
        <thead>
          <tr><th>Technician</th><th>Active</th><th>Capacity</th><th>Status</th><th>Urgent</th><th></th></tr>
        </thead>
        <tbody>
          {techs.map((t) => (
            <tr key={t.id}>
              <td>{t.name} {t.id === suggestedId && <span style={{ color: 'var(--success)', fontSize: 11 }}>★ suggested</span>}</td>
              <td>{t.active}</td>
              <td>{t.capacity}</td>
              <td><Tag variant={t.status === 'available' ? 'done' : 'progress'}>{t.status === 'available' ? 'Available' : 'Busy'}</Tag></td>
              <td>{t.urgent}</td>
              <td><button className={`btn sm${t.id === suggestedId ? ' primary' : ''}`}>{t.id === suggestedId ? 'Assign' : 'Reassign'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
