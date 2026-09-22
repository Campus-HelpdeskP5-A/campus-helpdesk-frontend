import { useEffect, useState } from 'react'
import { getKpiSummary } from '../../api/tickets'
import { getTechniciansWorkload } from '../../api/users'
import { Kpi, Card, LoadingState } from '../../components/UI'

export default function ManagerDashboard() {
  const [kpis, setKpis] = useState(null)
  const [techs, setTechs] = useState(null)

  useEffect(() => {
    getKpiSummary('manager').then(setKpis)
    getTechniciansWorkload().then(setTechs)
  }, [])

  if (!kpis || !techs) return <LoadingState />

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Manager dashboard</h2>
      <div className="kpi-row">
        <Kpi num={kpis.total} label="Total" />
        <Kpi num={kpis.open} label="Open" />
        <Kpi num={kpis.slaRisk} label="SLA risk" />
        <Kpi num={kpis.slaBreached} label="SLA breached" />
        <Kpi num={kpis.avgResolution} label="Avg resolution" />
      </div>
      <div className="grid2">
        <Card title="SLA compliance">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
            <span>This month</span><span>{kpis.slaCompliance}%</span>
          </div>
          <div className="progress-thin"><i style={{ width: `${kpis.slaCompliance}%` }} /></div>
        </Card>
        <Card title="Technician workload">
          <div className="row-list">
            {techs.map((t) => (
              <div className="item" key={t.id}><span>{t.name}</span><span>{t.active}/{t.capacity}</span></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
