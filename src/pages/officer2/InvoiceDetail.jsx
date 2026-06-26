import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { officerApi } from '../../services/officerApi'
import { buildInvoicePreviewData } from '../../utils/buildInvoicePreviewData'
import InvoicePreview from '../../components/invoices/InvoicePreview'

const Stage2InvoiceDetail = () => {
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
      .getStage2DocumentById(invoiceId)
      .then((res) => {
        setInvoice(res)
      })
      .catch((err) => setError(err?.message || 'Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [invoiceId])

  const preview = useMemo(() => buildInvoicePreviewData(invoice), [invoice])

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/officer2/dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#374151',
          fontSize: 13,
          fontWeight: 600,
          padding: 0,
          marginBottom: '1.25rem',
        }}
      >
        <ArrowLeft size={15} />
        Back to Assigned Invoices
      </button>

      {loading && <div>Loading invoice…</div>}

      {!loading && error && (
        <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>
      )}

      {!loading && !error && !preview && (
        <div style={{ color: '#6b7280', fontSize: 14 }}>Invoice not found.</div>
      )}

      {!loading && !error && preview && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <InvoicePreview preview={preview} />
        </div>
      )}
    </div>
  )
}

export default Stage2InvoiceDetail