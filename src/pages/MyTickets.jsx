import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReporterPages.css';

function MyTickets({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const allTickets = [
    { id: '#1024', subject: 'Network Issue', status: 'Open', location: 'Lab 3', date: 'Sep 20, 2026' },
    { id: '#1023', subject: 'Laptop Problem', status: 'In Progress', location: 'Lab 5', date: 'Sep 19, 2026' },
    { id: '#1022', subject: 'Software Request', status: 'Resolved', location: 'Lab 6', date: 'Sep 18, 2026' },
    { id: '#1021', subject: 'wifi issue', status: 'Resolved', location: 'Lab 6', date: 'Sep 15, 2026' },
    { id: '#1020', subject: 'Printer Not Working', status: 'Resolved', location: 'Library', date: 'Sep 10, 2026' },
    { id: '#1019', subject: 'Projector Maintenance', status: 'Resolved', location: 'Hall A', date: 'Sep 05, 2026' },
  ];

  const recentTickets = allTickets.slice(0, 4);

  return (
    <div className="reporter-container">
      {/* Header بدون اسم أو جرس */}
      <div className="reporter-header">
        <img src="/logo.jpeg" alt="TicketMe Logo" className="brand-logo-small" />
      </div>

      <p className="welcome-msg">
        Good morning, Here's what's happening with your support requests.
      </p>

      <div className="dashboard-layout">
        {/* Side Menu */}
        <div className="side-menu">
          <button 
            className={`menu-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>

          <button 
            className="menu-btn" 
            onClick={() => navigate('/create-ticket')}
          >
            Create Ticket
          </button>

          <button 
            className={`menu-btn ${activeTab === 'my-tickets' ? 'active' : ''}`} 
            onClick={() => setActiveTab('my-tickets')}
          >
            My Tickets
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {activeTab === 'dashboard' ? (
            <>
              <div className="stats-container">
                <div className="stat-card">
                  <div className="num">{allTickets.length}</div>
                  <div className="label">Total Tickets</div>
                </div>
                <div className="stat-card">
                  <div className="num">
                    {allTickets.filter(t => t.status === 'In Progress' || t.status === 'Open').length}
                  </div>
                  <div className="label">In progress</div>
                </div>
                <div className="stat-card">
                  <div className="num">
                    {allTickets.filter(t => t.status === 'Resolved').length}
                  </div>
                  <div className="label">Resolved</div>
                </div>
              </div>

              <div className="tickets-section">
                <h3>Recent Tickets</h3>
                <div className="tickets-table-card">
                  {recentTickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="ticket-row"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/ticket/${ticket.id.replace('#', '')}`)}
                    >
                      <span>{ticket.id}</span>
                      <span>{ticket.subject}</span>
                      <span>{ticket.status}</span>
                      <span>{ticket.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="tickets-section">
              <h3>All My Tickets ({allTickets.length})</h3>
              <div className="tickets-table-card">
                {allTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="ticket-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/ticket/${ticket.id.replace('#', '')}`)}
                  >
                    <span>{ticket.id}</span>
                    <span>{ticket.subject}</span>
                    <span>{ticket.status}</span>
                    <span>{ticket.location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <span>Profile</span>
        <span>Settings</span>
        {onLogout && <span onClick={onLogout} style={{ cursor: 'pointer' }}>Logout</span>}
      </div>
    </div>
  );
}

export default MyTickets;