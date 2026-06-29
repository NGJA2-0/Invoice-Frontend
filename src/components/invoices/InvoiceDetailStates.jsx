const InvoiceDetailStates = ({ loading, error, hasPreview }) => {
  if (loading) return <div>Loading invoice…</div>
  if (error) return <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>
  if (!hasPreview) return <div style={{ color: '#6b7280', fontSize: 14 }}>Invoice not found.</div>
  return null
}

export default InvoiceDetailStates