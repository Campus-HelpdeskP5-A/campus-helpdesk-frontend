export default function Logo({ size = 'md' }) {
  const width = size === 'lg' ? 170 : 120
  return (
    <img
      src="/logo.jpeg"
      alt="TicketMe"
      style={{ width, maxWidth: '100%', display: 'block', borderRadius: 8 }}
    />
  )
}