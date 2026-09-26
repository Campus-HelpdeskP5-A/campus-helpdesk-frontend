export function Tag({ variant = 'open', children }) {
  return <span className={`tag ${variant}`}>{children}</span>
}
export function Kpi({ num, label }) {
  return (
    <div className="kpi">
      <div className="num">{num}</div>
      <div className="lbl">{label}</div>
    </div>
  )
}

export function Card({ title, children, style }) {
  return (
    <div className="card" style={style}>
      {title && <h4>{title}</h4>}
      {children}
    </div>
  )
}

export function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>
}

export function LoadingState({ children = 'جاري التحميل…' }) {
  return <div className="loading-state">{children}</div>
}

export function ErrorBanner({ children }) {
  if (!children) return null
  return <div className="form-error-banner">{children}</div>
}
