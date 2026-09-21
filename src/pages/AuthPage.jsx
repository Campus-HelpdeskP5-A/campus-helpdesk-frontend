import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function AuthPage({ users, onLogin, onSignUp }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('reporter');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // تنفيذ تسجيل الدخول
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      onLogin(foundUser);
      if (foundUser.role === 'reporter') navigate('/');
      else if (foundUser.role === 'technician') navigate('/technician');
      else if (foundUser.role === 'admin') navigate('/admin');
    } else {
      setErrorMessage('Email or password incorrect!');
    }
  };

  // تنفيذ إنشاء حساب جديد
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      setErrorMessage('This email is already registered!');
      return;
    }

    const newUser = { name, email: email.toLowerCase(), password, role };
    onSignUp(newUser);

    alert('Account created successfully! Please log in now.');
    setPassword('');
    setIsSignUp(false); // تحويل المستخدم فوراً لشاشة تسجيل الدخول
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
   {/* الجانب الأيسر البني ثابت */}
<div className="auth-sidebar">

        {/* استبدال النص بالصورة مباشرة من مجلد public */}
        <img src="/logo.jpeg" alt="TicketMe Logo" className="brand-logo-img" />

        <div className="sidebar-content">
            <h3>Campus support,made simple.</h3>
            <p>Report issues<br />track requests<br />and stay updated</p>
        </div>
        <div></div>
        </div>

        {/* الجانب الأيمن للفورم */}
        <div className="auth-form-container">
          {!isSignUp ? (
            /* --- شاشـة LOG IN --- */
            <form onSubmit={handleLoginSubmit}>
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Sign in to access your Campus Helpdesk account.</p>

              {errorMessage && <div className="error-msg">{errorMessage}</div>}

              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-options">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>

              <button type="submit" className="auth-btn">Login</button>

              <div className="auth-footer">
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
                >
                  New User ? Signup
                </button>
                <span style={{ color: '#7a6868', cursor: 'pointer' }}>Forget your Password ?</span>
              </div>
            </form>
          ) : (
            /* --- شاشـة SIGN UP --- */
            <form onSubmit={handleSignUpSubmit}>
              <h2>Create Account</h2>
              <p className="auth-subtitle">Sign up to start submitting or managing tickets.</p>

              {errorMessage && <div className="error-msg">{errorMessage}</div>}

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Register As (Role)</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="reporter">Student / Staff (Reporter)</option>
                  <option value="technician">Technician / Support Staff</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <button type="submit" className="auth-btn">Sign Up</button>

              <div className="auth-footer" style={{ justifyContent: 'center' }}>
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;