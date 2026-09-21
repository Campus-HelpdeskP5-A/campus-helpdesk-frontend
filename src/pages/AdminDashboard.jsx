import { useState } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const [categoryBreakdown] = useState([
    { label: 'Network', value: '35%' },
    { label: 'Hardware', value: '25%' },
    { label: 'Software', value: '20%' },
    { label: 'Other', value: '20%' },
  ]);

  const [priorityBreakdown] = useState([
    { label: 'Low', value: '40%' },
    { label: 'Medium', value: '35%' },
    { label: 'High', value: '20%' },
    { label: 'Critical', value: '5%' },
  ]);

  const [teamPerformance] = useState([
    { agent: 'Eng. Ahmed', assigned: 24, resolved: 20, avgTime: '3.2h' },
    { agent: 'Eng. Mahmoud', assigned: 18, resolved: 15, avgTime: '4.1h' },
    { agent: 'Eng. Sarah', assigned: 21, resolved: 19, avgTime: '2.8h' },
  ]);

  return (
    <div className="ad-page">
      {/* Header */}
      <div className="ad-header-top">
        <span className="ad-brand">🎫 TicketMe</span>
        <span className="ad-title">Manager Dashboard</span>
        <span className="ad-greeting">Good morning, {user?.name || 'Admin'}</span>
      </div>

      {/* Ticket Volume */}
      <div className="ad-section-title">Ticket Volume</div>
      <div className="ad-volume-row">
        <div className="ad-chart-box">Chart</div>
        <div className="ad-stat-box">
          <div className="ad-stat-num">156</div>
          <div className="ad-stat-label">Tickets</div>
        </div>
        <div className="ad-stat-box">
          <div className="ad-stat-num">42</div>
          <div className="ad-stat-label">Open</div>
        </div>
        <div className="ad-stat-box">
          <div className="ad-stat-num">18</div>
          <div className="ad-stat-label">Urgent</div>
        </div>
        <div className="ad-stat-box">
          <div className="ad-stat-num">96%</div>
          <div className="ad-stat-label">SLA</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="ad-breakdown-row">
        <div className="ad-breakdown-col">
          <div className="ad-section-title">Tickets by Category</div>
          <div className="ad-breakdown-box">
            {categoryBreakdown.map((c) => (
              <div key={c.label} className="ad-breakdown-row-item">
                <span>{c.label}</span>
                <span>{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-breakdown-col">
          <div className="ad-section-title">Tickets by Priority</div>
          <div className="ad-breakdown-box">
            {priorityBreakdown.map((p) => (
              <div key={p.label} className="ad-breakdown-row-item">
                <span>{p.label}</span>
                <span>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="ad-team-section">
        <h3>Team Performance</h3>
        <table className="ad-team-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Assigned</th>
              <th>Resolved</th>
              <th>Avg. Time</th>
            </tr>
          </thead>
          <tbody>
            {teamPerformance.map((row) => (
              <tr key={row.agent}>
                <td>{row.agent}</td>
                <td>{row.assigned}</td>
                <td>{row.resolved}</td>
                <td>{row.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;