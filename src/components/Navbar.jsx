import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ padding: '15px 30px', background: '#1e293b', color: '#fff', marginBottom: '30px', display: 'flex', gap: '20px' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>My Tickets</Link>
      <Link to="/create-ticket" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Create Ticket</Link>
    </nav>
  );
}
export default Navbar;