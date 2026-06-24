import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const STATUS_STYLES = {
  stage1_in_progress: { bg: '#fff7e0', color: '#9a6700', label: 'Stage 1 - In Progress' },
  stage1_completed: { bg: '#e3f6e8', color: '#1f7a3f', label: 'Stage 1 - Completed' },
  stage2_in_progress: { bg: '#e6f0ff', color: '#1d4ed8', label: 'Stage 2 - In Progress' },
  stage2_completed: { bg: '#e3f6e8', color: '#1f7a3f', label: 'Stage 2 - Completed' },
  rejected: { bg: '#fde8e8', color: '#b91c1c', label: 'Rejected' },
  draft: { bg: '#f1f1f1', color: '#555', label: 'Draft' },
}

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || {
    bg: '#f1f1f1',
    color: '#555',
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
  }

const formatDate = (value) => {
  if (!value) return 'N/A'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'N/A'
  return d.toISOString().slice(0, 10)
}

const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status)
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'capitalize',
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  )
}

const OfficerDashboard = () => {
  const { user, officerInvoices, refreshOfficerInvoices } = useApp()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.id) return
    if (officerInvoices.length > 0) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    refreshOfficerInvoices(user.id)
      .catch((err) => setError(err?.message || 'Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [user?.id, officerInvoices.length, refreshOfficerInvoices])

  const rows = useMemo(
    () =>
      (officerInvoices || []).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        category: inv.category || 'N/A',
        subCategory: inv.subCategory || 'N/A',
        status: inv.status,
        companyName: inv.data?.companyHeader?.companyName || 'N/A',
        receiverName: inv.data?.receiverInfo?.receiverName || 'N/A',
        createdAt: inv.createdAt,
      })),
    [officerInvoices],
  )

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          Assigned Invoices
        </h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
          Invoices currently assigned to you for review.
        </p>
      </div>

      {loading && <div>Loading invoices…</div>}

      {!loading && error && (
        <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          No invoices are currently assigned to you.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div
          style={{
            overflowX: 'auto',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.03)' }}>
                <th style={{ padding: '10px 14px' }}>Invoice #</th>
                <th style={{ padding: '10px 14px' }}>Company</th>
                <th style={{ padding: '10px 14px' }}>Receiver</th>
                <th style={{ padding: '10px 14px' }}>Category</th>
                <th style={{ padding: '10px 14px' }}>Sub-Category</th>
                <th style={{ padding: '10px 14px' }}>Created</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/officer/invoices/${row.id}`)}
                  style={{ borderTop: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                    {row.invoiceNumber}
                  </td>
                  <td style={{ padding: '10px 14px' }}>{row.companyName}</td>
                  <td style={{ padding: '10px 14px' }}>{row.receiverName}</td>
                  <td style={{ padding: '10px 14px' }}>{row.category}</td>
                  <td style={{ padding: '10px 14px' }}>{row.subCategory}</td>
                  <td style={{ padding: '10px 14px' }}>{formatDate(row.createdAt)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OfficerDashboard