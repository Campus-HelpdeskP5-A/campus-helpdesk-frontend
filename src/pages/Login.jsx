import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ users, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // البحث في قائمة الحسابات المسجلة
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      onLogin(foundUser);

      // التوجيه التلقائي حسب الدور اللي اختاره أثناء الـ Sign Up
      if (foundUser.role === 'reporter') {
        navigate('/');
      } else if (foundUser.role === 'technician') {
        navigate('/technician');
      } else if (foundUser.role === 'admin') {
        navigate('/admin');
      }
    } else {
      setErrorMessage('الإيميل أو كلمة المرور غير صحيحة، أو الحساب غير موجود!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', background: '#ffffff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#1e293b' }}>Campus Helpdesk Login</h2>
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        سجل دخولك بالإيميل والباسورد وسيتم التعرف على دورك تلقائياً
      </p>

      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Email Address</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@campus.edu"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
        >
          Sign In
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
        Don't have an account? <Link to="/signup" style={{ color: '#16a34a', fontWeight: 'bold' }}>Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;