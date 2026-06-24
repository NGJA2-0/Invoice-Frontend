import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import InvoiceDetailView from '../../components/InvoiceDetailView'

const OfficerInvoiceDetail = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { user, officerInvoices, refreshOfficerInvoices } = useApp()
  const [loading, setLoading] = useState(officerInvoices.length === 0)
  const [error, setError] = useState(null)

  // If invoices aren't loaded yet (e.g. direct page refresh on this URL),
  // fetch them so we have data to find the invoice from.
  useEffect(() => {
    if (officerInvoices.length > 0 || !user?.id) return
    setLoading(true)
    setError(null)
    refreshOfficerInvoices(user.id)
      .catch((err) => setError(err?.message || 'Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [user?.id, officerInvoices.length, refreshOfficerInvoices])

  const invoice = officerInvoices.find((inv) => inv.id === invoiceId)

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/officer/dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#374151',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1rem',
          padding: 0,
        }}
      >
        <ArrowLeft size={15} />
        Back to dashboard
      </button>

      {loading && <div>Loading invoice…</div>}

      {!loading && error && (
        <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>
      )}

      {!loading && !error && !invoice && (
        <div style={{ color: '#6b7280', fontSize: 14 }}>Invoice not found.</div>
      )}

      {!loading && !error && invoice && (
        <InvoiceDetailView
          invoice={invoice}
          actions={
            <button
              type="button"
              onClick={() => {}}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.5rem 1rem',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.12)',
                background: '#003A6B',
                color: '#ffde1a',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Pencil size={14} />
              Edit Invoice
            </button>
          }
        />
      )}
    </div>
  )
}

export default OfficerInvoiceDetail