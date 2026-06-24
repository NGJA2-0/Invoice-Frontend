import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { officerApi } from '../../services/officerApi'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import { buildInvoicePreviewData } from '../../utils/buildInvoicePreviewData'

const OfficerInvoiceDetail = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!invoiceId) return
    setLoading(true)
    setError(null)
    officerApi
      .getDocumentById(invoiceId)
      .then((res) => {
        setInvoice(res)
      })
      .catch((err) => setError(err?.message || 'Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [invoiceId])

  const preview = useMemo(() => buildInvoicePreviewData(invoice), [invoice])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
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
            padding: 0,
          }}
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </button>

        {!loading && !error && invoice && (
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
        )}
      </div>

      {loading && <div>Loading invoice…</div>}

      {!loading && error && (
        <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>
      )}

      {!loading && !error && !invoice && (
        <div style={{ color: '#6b7280', fontSize: 14 }}>Invoice not found.</div>
      )}

      {!loading && !error && invoice && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <InvoicePreview preview={preview} />
        </div>
      )}
    </div>
  )
}

export default OfficerInvoiceDetail