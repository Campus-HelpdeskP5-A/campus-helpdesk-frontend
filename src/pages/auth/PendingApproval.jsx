import { useNavigate } from 'react-router-dom'
import { Tag } from '../../components/UI'

export default function PendingApproval() {
  const navigate = useNavigate()
  return (
    <div className="auth-stage">
      <div className="center-card">
        <div
          className="logo-mark"
          style={{ margin: '0 auto 16px', background: 'var(--warning-bg)' }}
        >
          <span style={{ fontSize: 22 }}>⏳</span>
        </div>
        <h3 style={{ fontSize: 16, textAlign: 'center' }}>طلبك قيد المراجعة</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 18px' }}>
          هيتم إعلامك لما مدير يوافق على حسابك.
        </p>
        <div className="row-list" style={{ marginBottom: 18 }}>
          <div className="item">
            <span>Status</span>
            <Tag variant="pending">Pending</Tag>
          </div>
        </div>
        <button className="btn ghost" style={{ width: '100%' }} onClick={() => navigate('/login')}>
          Back to login
        </button>
      </div>
    </div>
  )
}
