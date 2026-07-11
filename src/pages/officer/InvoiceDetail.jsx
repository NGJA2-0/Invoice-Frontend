import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Check, X } from 'lucide-react'
import { officerApi } from '../../services/officerApi'
import { useApp } from '../../context/AppContext'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import { buildInvoicePreviewData } from '../../utils/buildInvoicePreviewData'
import InvoiceHistoryDropdown from './InvoiceHistoryDropdown'

const OfficerInvoiceDetail = () => {
  const { invoiceId: originalInvoiceId } = useParams()
  const navigate = useNavigate()
  const { user, pushToast } = useApp()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // 'approve' | 'reject' | null
  const [viewingHistoryRecord, setViewingHistoryRecord] = useState(null) // non-null when previewing a past edition

  useEffect(() => {
    if (!originalInvoiceId) return
    setLoading(true)
    setError(null)
    officerApi
      .getDocumentById(originalInvoiceId)
      .then((res) => {
        setInvoice(res)
        setViewingHistoryRecord(null)
      })
      .catch((err) => setError(err?.message || 'Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [originalInvoiceId])

  // When an edition is selected from history, preview that record instead of
  // the latest invoice. Selecting it back to null (not used here, but kept
  // explicit) would fall back to the live invoice.
  const previewedInvoice = viewingHistoryRecord || invoice
  const preview = useMemo(() => buildInvoicePreviewData(previewedInvoice), [previewedInvoice])
  const isViewingPastEdition = Boolean(viewingHistoryRecord)
  const isCompleted = invoice?.status === 'stage1_completed'

  const handleReject = async () => {
    if (!invoice || !user?.id) return
    const notes = window.prompt('Rejection notes:', 'Carrier details are incorrect.')
    if (notes === null) return // user cancelled the prompt

    setActionLoading('reject')
    try {
      await officerApi.updateInvoiceStatus(
        invoice.originalInvoiceId,
        { status: 'stage1_rejected', notes }
      )
      pushToast({
        title: 'Invoice rejected',
        message: notes,
        tone: 'error',
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

  const handleApprove = async () => {
    if (!invoice || !user?.id) return
    const notes = window.prompt('Approval notes:', 'All details verified. Approved.')
    if (notes === null) return // user cancelled the prompt

    setActionLoading('approve')
    try {
      await officerApi.completeInvoice(
        invoice.originalInvoiceId,
        { notes }
      )
      pushToast({
        title: 'Invoice approved',
        message: notes,
        tone: 'success',
      })
      navigate('/officer/dashboard')
    } catch (err) {
      pushToast({
        title: 'Update failed',
        message: err?.message || 'Could not complete invoice',
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
            <InvoiceHistoryDropdown
              originalInvoiceId={originalInvoiceId}
              activeRecordId={viewingHistoryRecord?.id}
              onSelect={(record) => setViewingHistoryRecord(record)}
            />

            {!isCompleted && (
              <>
                <button
                  type="button"
                  onClick={handleReject}
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
                  onClick={handleApprove}
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
                  onClick={() =>
                    navigate(`/officer/invoices/${originalInvoiceId}/edit`, {
                      state: { invoice },
                    })
                  }
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
              </>
            )}
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
        <div>
          {isViewingPastEdition && (
            <div
              style={{
                maxWidth: 900,
                margin: '0 auto 0.75rem',
                padding: '0.5rem 0.9rem',
                borderRadius: 8,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <span>
                Viewing past edition: {viewingHistoryRecord.editionLabel || 'Original'}
              </span>
              <button
                type="button"
                onClick={() => setViewingHistoryRecord(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#92400e',
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Back to latest
              </button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <InvoicePreview preview={preview} />
          </div>
        </div>
      )}
    </div>
  )
}

export default OfficerInvoiceDetail