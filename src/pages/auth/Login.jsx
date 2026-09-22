import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ErrorBanner } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'

const ROLE_HOME = {
  REPORTER: '/reporter',
  AGENT: '/agent',
  TECHNICIAN: '/technician',
  MANAGER: '/manager',
  AUDITOR: '/auditor',
}
export default function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const user = await login(email, password)
      navigate(ROLE_HOME[user.role] || '/')
    } catch {
      // error is already surfaced via useAuth().error
    }
  }

  return (
    <div className="auth-stage">
      <div className="center-card">
        <div className="auth-head">
          <img src="/logo.jpeg" alt="TicketMe" style={{ width: 180, maxWidth: '100%', display: 'block', margin: '0 auto 10px', borderRadius: 10 }} />
          <p>سجّل دخولك لمتابعة تذاكرك</p>
        </div>
        <ErrorBanner>{error}</ErrorBanner>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? '...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          مالكش حساب؟ <Link to="/register"><button type="button">Register</button></Link>
        </div>
      </div>
    </div>
  )
}