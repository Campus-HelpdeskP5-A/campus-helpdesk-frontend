import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MyTickets from './pages/MyTickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import TechnicianQueue from './pages/TechnicianQueue';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([
    { name: 'Mohamed Gamal', email: 'student@campus.edu', password: '123', role: 'reporter' },
    { name: 'Eng. Ahmed', email: 'tech@campus.edu', password: '123', role: 'technician' },
    { name: 'System Admin', email: 'admin@campus.edu', password: '123', role: 'admin' },
  ]);

  const handleSignUp = (newUser) => {
    setRegisteredUsers([...registeredUsers, newUser]);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <nav style={{ padding: '15px 30px', background: '#1e293b', color: '#fff', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#60a5fa', marginRight: '15px' }}>🎓 Campus Helpdesk</span>
          
          {user && user.role === 'reporter' && (
            <>
              <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>My Tickets</Link>
              <Link to="/create-ticket" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Create Ticket</Link>
            </>
          )}

          {user && user.role === 'technician' && (
            <Link to="/technician" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Technician Queue</Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Admin Dashboard</Link>
          )}
        </div>

        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px', color: '#cbd5e1' }}>👤 {user.name} ({user.role})</span>
              <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ background: '#6b4c4c', color: '#fff', padding: '6px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
              Login / Sign Up
            </Link>
          )}
        </div>
      </nav>

      <div style={{ padding: '0 20px' }}>
        <Routes>
          <Route 
            path="/login" 
            element={<AuthPage users={registeredUsers} onLogin={(u) => setUser(u)} onSignUp={handleSignUp} />} 
          />
          
          {/* Reporter */}
          <Route path="/" element={user ? (user.role === 'technician' ? <Navigate to="/technician" /> : user.role === 'admin' ? <Navigate to="/admin" /> : <MyTickets />) : <Navigate to="/login" />} />
          <Route path="/create-ticket" element={user ? <CreateTicket /> : <Navigate to="/login" />} />
          <Route path="/ticket/:id" element={user ? <TicketDetails /> : <Navigate to="/login" />} />
          
          {/* Technician */}
          <Route path="/technician" element={user ? <TechnicianQueue /> : <Navigate to="/login" />} />
          <Route path="/technician/ticket/:id" element={user ? <TicketDetails /> : <Navigate to="/login" />} />
          
          {/* Admin */}
          <Route path="/admin" element={user ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;