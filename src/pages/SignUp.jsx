import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function SignUp({ onSignUp }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reporter'); // الدور الافتراضي
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();

    const newUser = {
      name,
      email: email.toLowerCase(),
      password,
      role,
    };

    // حفظ المستخدم الجديد
    onSignUp(newUser);

    alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto', background: '#ffffff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#1e293b' }}>Create New Account</h2>
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        قم بإنشاء حساب جديد وتحديد دورك في النظام
      </p>

      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Full Name</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mohamed Gamal"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

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

        <div style={{ marginBottom: '15px' }}>
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

        {/* تـحـديـد الـدور أثـنـاء الـ Sign Up */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Register As (Role):</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 'bold' }}
          >
            <option value="reporter">Student / Staff (Reporter)</option>
            <option value="technician">Technician / Support Staff</option>
            <option value="admin">System Admin</option>
          </select>
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
        >
          Sign Up
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
        Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>Log In</Link>
      </p>
    </div>
  );
}

export default SignUp;