import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReporterPages.css';

function CreateTicket() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    location: '',
    priority: 'Low',
    description: '',
    attachment: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Ticket submitted successfully!');
    navigate('/');
  };

  return (
    <div className="reporter-container">
      {/* Header */}
      <div className="reporter-header">
        <img src="/logo.jpeg" alt="TicketMe Logo" className="brand-logo-small" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-row">
          <label>Subject</label>
          <input 
            type="text" 
            required 
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
          />
        </div>

        <div className="form-row">
          <label>Category</label>
          <select 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="">Select category ▼</option>
            <option value="Network">Network</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
          </select>
        </div>

        <div className="form-row">
          <label>Location</label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div className="form-row">
          <label>Priority</label>
          <select 
            value={formData.priority} 
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
          >
            <option value="Low">Low ▼</option>
            <option value="Medium">Medium ▼</option>
            <option value="High">High ▼</option>
          </select>
        </div>

        <div className="form-row">
          <label>Description</label>
          <textarea 
            rows="2"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="form-row">
          <label>Attachments</label>
          <input 
            type="file" 
            onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn-submit">Submit Ticket</button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;