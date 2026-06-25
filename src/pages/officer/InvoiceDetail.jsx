import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Check, X } from 'lucide-react'
import { officerApi } from '../../services/officerApi'
import { useApp } from '../../context/AppContext'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import { buildInvoicePreviewData } from '../../utils/buildInvoicePreviewData'

const OfficerInvoiceDetail = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { user, pushToast } = useApp()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // 'approve' | 'reject' | null

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

  const handleStatusUpdate = async (status) => {
    if (!invoice || !user?.id) return
    const isApprove = status === 'stage1_approved'
    const notes = window.prompt(
      isApprove ? 'Approval notes:' : 'Rejection notes:',
      isApprove ? 'All details verified. Approved.' : 'Carrier details are incorrect.'
    )
    if (notes === null) return // user cancelled the prompt

    setActionLoading(isApprove ? 'approve' : 'reject')
    try {
      await officerApi.updateInvoiceStatus(
        invoice.originalInvoiceId,
        user.id,
        { status, notes }
      )
      pushToast({
        title: isApprove ? 'Invoice approved' : 'Invoice rejected',
        message: notes,
        tone: isApprove ? 'success' : 'error',
      })
      navigate('/officer/dashboard')
    } catch (err) {
      pushToast({
        title: 'Update failed',
        message: err?.message || 'Could not update invoice status',
        tone: 'error',
      })
    } finally {
      setActionLoading(null)
    }
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleStatusUpdate('stage1_rejected')}
              disabled={actionLoading !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.5rem 1rem',
                borderRadius: 999,
                border: '1px solid rgba(185,28,28,0.3)',
                background: '#fff',
                color: '#b91c1c',
                fontSize: 13,
                fontWeight: 700,
                cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                opacity: actionLoading !== null ? 0.6 : 1,
              }}
            >
              <X size={14} />
              {actionLoading === 'reject' ? 'Rejecting…' : 'Reject Invoice'}
            </button>

            <button
              type="button"
              onClick={() => handleStatusUpdate('stage1_approved')}
              disabled={actionLoading !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.5rem 1rem',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.12)',
                background: '#15803d',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                opacity: actionLoading !== null ? 0.6 : 1,
              }}
            >
              <Check size={14} />
              {actionLoading === 'approve' ? 'Approving…' : 'Approve Invoice'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/officer/edit-invoice/' + invoiceId, { state: { invoice } })}
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
          </div>
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