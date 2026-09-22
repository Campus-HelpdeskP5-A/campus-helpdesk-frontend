import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TechnicianQueue.css';

function TechnicianQueue() {
  const navigate = useNavigate();

  const [tickets] = useState([
    {
      id: '#1024',
      title: 'Network connection problem',
      priority: 'HIGH',
      status: 'IN PROGRESS',
      assigned: 'Mohamed Technician',
      location: 'Lab207',
      sla: 'high', // high = red (قريب يخلص), low = green (وقت كتير)
    },
    {
      id: '#1025',
      title: 'Network connection problem',
      priority: 'HIGH',
      status: 'IN PROGRESS',
      assigned: 'Mohamed Technician',
      location: 'Lab206',
      sla: 'low',
    },
  ]);

  const [sortBy, setSortBy] = useState('Priority');

  return (
    <div className="tq-page">
      {/* Header */}
      <div className="tq-header-top">
        <div className="tq-brand">
          <span className="tq-logo">🎫 TicketMe</span>
          <span className="tq-title">My Assigned Tickets</span>
        </div>

        <div className="tq-toolbar">
          <span className="tq-sort-label">Sort BY</span>
          <select
            className="tq-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Priority">Priority</option>
            <option value="Status">Status</option>
            <option value="SLA">SLA</option>
          </select>

          <span className="tq-sla-label">TotalSLA</span>
          <span className="tq-total-sla-box"></span>
        </div>
      </div>

      {/* Tickets grid */}
      <div className="tq-grid">
        {tickets.map((t) => (
          <div key={t.id} className="tq-card">
            <div className="tq-card-id">{t.id}</div>
            <div className="tq-card-title">{t.title}</div>
            <div className="tq-card-row">Priority: {t.priority}</div>
            <div className="tq-card-row">Status: {t.status}</div>
            <div className="tq-card-row">Assigned: {t.assigned}</div>
            <div className="tq-card-row">Location: {t.location}</div>

            <div className="tq-sla-row">
              <span>SLA</span>
              <div className={`tq-sla-bar ${t.sla}`}></div>
            </div>

            <button
              className="tq-view-btn"
              onClick={() => navigate(`/technician/ticket/${t.id.replace('#', '')}`)}
            >
              View Ticket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TechnicianQueue;