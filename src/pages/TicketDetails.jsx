import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReporterPages.css';

function TicketDetails() {
  const navigate = useNavigate();
  const [comment, setComment] = useState('');

  return (
    <div className="reporter-container">
      {/* Header */}
      <div className="reporter-header">
        <img src="/logo.jpeg" alt="TicketMe Logo" className="brand-logo-small" />
      </div>

      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Tickets
      </button>

      <div className="ticket-title">
        Ticket #1024 Network connection problem
      </div>

      <div className="details-grid">
        <div className="info-card">
          <div className="info-item"><span>Status</span> <span>Open</span></div>
          <div className="info-item"><span>Priority</span> <span>Low</span></div>
          <div className="info-item"><span>Category</span> <span>Network</span></div>
          <div className="info-item"><span>Created</span> <span>Sep 20, 2026</span></div>
          <div className="info-item"><span>Assigned</span> <span>Support Agent</span></div>
        </div>

        <div className="activity-card">
          <h4>Activity</h4>
          <div className="activity-list">
            <p>Created this ticket 11:20 AM</p>
            <p>Support Agent Assigned ticket 11:32 AM</p>
            <p>Technician Started working 12:05 PM</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <div className="section-label">Description</div>
          <p className="description-box">I cannot connect to the university Wi-Fi...</p>
        </div>

        <div>
          <div className="section-label">Attachments</div>
          <span style={{ color: '#665555', fontSize: '14px' }}>network-error.png</span>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: '10px' }}>Add Comment</div>
      <div className="comment-section">
        <input 
          type="text" 
          placeholder="Write a comment." 
          className="comment-input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="btn-send">Send</button>
      </div>
    </div>
  );
}

export default TicketDetails;