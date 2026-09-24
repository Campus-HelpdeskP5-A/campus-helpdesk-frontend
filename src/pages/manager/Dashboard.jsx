import { useEffect, useState } from 'react'
import { getKpiSummary } from '../../api/tickets'
import { Kpi, Card, LoadingState } from '../../components/UI'

export default function ManagerDashboard() {
  const [kpis, setKpis] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getKpiSummary('MANAGER')
      .then(setKpis)
      .catch((err) => {
        setError(err.message)
      })
  }, [])

  if (!kpis && !error) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div>
        <h2 style={{ marginBottom: 18 }}>Manager dashboard</h2>
        <p>Failed to load dashboard data.</p>
      </div>
    )
  }

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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12.5,
              marginBottom: 6,
            }}
          >
            <span>Current</span>
            <span>{kpis.slaCompliance}%</span>
          </div>

          <div className="progress-thin">
            <i style={{ width: `${kpis.slaCompliance}%` }} />
          </div>
        </Card>

        <Card title="Ticket summary">
          <div className="row-list">
            <div className="item">
              <span>Open</span>
              <span>{kpis.open}</span>
            </div>

            <div className="item">
              <span>SLA risk</span>
              <span>{kpis.slaRisk}</span>
            </div>

            <div className="item">
              <span>SLA breached</span>
              <span>{kpis.slaBreached}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
