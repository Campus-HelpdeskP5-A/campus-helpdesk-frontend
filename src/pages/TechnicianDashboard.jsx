import { useState } from 'react';

function TechnicianDashboard() {
  const [tickets, setTickets] = useState([
    {
      id: 'HLP-1024',
      title: 'Wi-Fi not working in Lab 3',
      category: 'IT Support',
      location: 'Building A - Floor 2',
      urgency: 'High',
      status: 'In Progress',
      assignedTo: 'Eng. Ahmed',
      internalNotes: ['Replaced router power adapter.', 'Checking signal strength.'],
    },
    {
      id: 'HLP-1025',
      title: 'Projector light bulb broken',
      category: 'Classroom Equipment',
      location: 'Building C - Room 101',
      urgency: 'Medium',
      status: 'Triaged',
      assignedTo: 'Unassigned',
      internalNotes: [],
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newInternalNote, setNewInternalNote] = useState('');

  // تحديث حالة التذكرة
  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(
      tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  // إضافة ملاحظة داخلية (Internal Note - HLP-FR-07)
  const handleAddInternalNote = (e) => {
    e.preventDefault();
    if (!newInternalNote.trim() || !selectedTicket) return;

    const updatedNotes = [...selectedTicket.internalNotes, newInternalNote];
    
    setTickets(
      tickets.map((t) =>
        t.id === selectedTicket.id ? { ...t, internalNotes: updatedNotes } : t
      )
    );

    setSelectedTicket({ ...selectedTicket, internalNotes: updatedNotes });
    setNewInternalNote('');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>🛠️ Technician Dashboard & Queue</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* قائمة التذاكر */}
        <div>
          <h3>Incoming Tickets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                style={{
                  background: '#fff',
                  padding: '15px',
                  borderRadius: '8px',
                  border: selectedTicket?.id === ticket.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong>{ticket.id}</strong>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                    {ticket.status}
                  </span>
                </div>
                <h4 style={{ margin: '5px 0' }}>{ticket.title}</h4>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  📍 {ticket.location} | Priority: <strong>{ticket.urgency}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل التذكرة المحددة للتحكم الفني */}
        <div>
          <h3>Ticket Management</h3>
          {selectedTicket ? (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '10px' }}>
              <h4>{selectedTicket.title} ({selectedTicket.id})</h4>
              <p style={{ fontSize: '14px', color: '#475569', margin: '10px 0' }}>Location: {selectedTicket.location}</p>

              {/* تغيير الحالة */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Update Status:</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="New">New</option>
                  <option value="Triaged">Triaged</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <hr style={{ margin: '15px 0' }} />

              {/* قسم الملاحظات الداخلية - Internal Notes (HLP-FR-07) */}
              <div>
                <h5 style={{ color: '#dc2626', marginBottom: '8px' }}>🔒 Internal Notes (Visible to Techs Only)</h5>
                
                <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '10px', minHeight: '60px' }}>
                  {selectedTicket.internalNotes.length === 0 ? (
                    <span style={{ fontSize: '12px', color: '#991b1b' }}>No internal notes added yet.</span>
                  ) : (
                    selectedTicket.internalNotes.map((note, idx) => (
                      <div key={idx} style={{ fontSize: '13px', color: '#7f1d1d', marginBottom: '4px' }}>
                        • {note}
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddInternalNote}>
                  <input
                    type="text"
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    placeholder="Add private note for support team..."
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px' }}
                  />
                  <button type="submit" style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    + Add Internal Note
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', marginTop: '10px', textAlign: 'center', color: '#94a3b8' }}>
              Select a ticket from the left queue to view and manage details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TechnicianDashboard;