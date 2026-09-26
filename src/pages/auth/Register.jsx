import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import { ErrorBanner } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'
import { isPendingStatus } from '../../api/users'

export default function Register() {
  const { register, loading, error } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'reporter' })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await register({ ...form, name: form.name.trim() })
      // Backend activates accounts immediately; only go to pending-approval
      // when the server actually reports a pending status.
      const st = res?.status || res?.data?.status || res?.user?.status || res?.data?.user?.status
      if (isPendingStatus(st)) {
        navigate('/pending-approval', { state: { role: form.role } })
      } else {
        showToast('تم إنشاء الحساب بنجاح ✅ سجّل دخولك دلوقتي.')
        navigate('/login')
      }
    } catch {
      // error surfaced via useAuth().error
    }
  }

  return (
    <div className="auth-stage">
      <div className="center-card" style={{ maxWidth: 400 }}>
        <div className="auth-head">
          <Logo />
          <h3>{t('Create account')}</h3>
        </div>
        <ErrorBanner>{error}</ErrorBanner>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t('Full name')}</label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={t('Enter your name')} />
          </div>
          <div className="field">
            <label>{t('Email')}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="name@university.edu"
            />
          </div>
          <div className="field">
            <label>{t('Password')}</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder={t('8 characters at least')}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <div className="field">
            <label>{t('Account type')}</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="reporter">{t('Reporter')}</option>
              <option value="technician">{t('Technician (needs manager approval)')}</option>
              <option value="manager">{t('Manager (needs manager approval)')}</option>
            </select>
          </div>
          <button className="btn primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? '...' : t('Create account')}
          </button>
        </form>
        <div className="auth-footer">
          عندك حساب؟ <Link to="/login"><button type="button">{t('Login')}</button></Link>
        </div>
      </div>
    </div>
  )
}
