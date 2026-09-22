import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import { ErrorBanner } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await register(form)
      navigate('/dashboard')
    } catch {
      // error surfaced via useAuth().error
    }
  }

  return (
    <div className="auth-stage">
      <div className="center-card" style={{ maxWidth: 400 }}>
        <div className="auth-head">
          <Logo />
          <h3>Create account</h3>
        </div>
        <ErrorBanner>{error}</ErrorBanner>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Enter your name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="name@university.edu"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <button className="btn primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? '...' : 'Create account'}
          </button>
        </form>
        <div className="auth-footer">
          عندك حساب؟ <Link to="/login"><button type="button">Login</button></Link>
        </div>
      </div>
    </div>
  )
}