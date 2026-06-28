import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Pencil, X } from 'lucide-react'
import { officerApi } from '../../services/officerApi'
import { useApp } from '../../context/AppContext'
import { buildInvoicePreviewData } from '../../utils/buildInvoicePreviewData'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import Stage2InvoiceHistoryDropdown from '../../pages/officer/Stage2InvoiceHistoryDropdown'

const Stage2InvoiceDetail = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('Missing supporting documents.')
  const [viewingHistoryRecord, setViewingHistoryRecord] = useState(null) // non-null when previewing a past edition

 useEffect(() => {
    if (!invoiceId) return
    setLoading(true)
    setError(null)
    officerApi
      .getStage2DocumentById(invoiceId)
      .then((res) => {
        setInvoice(res)
        setViewingHistoryRecord(null)
      })
      .catch((err) => setError(err?.message || 'Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [invoiceId])

  const previewedInvoice = viewingHistoryRecord || invoice
  const preview = useMemo(() => buildInvoicePreviewData(previewedInvoice), [previewedInvoice])
  const isViewingPastEdition = Boolean(viewingHistoryRecord)
  const isApproved = invoice?.status === 'stage2_completed'

  const handleRejectConfirm = async () => {
    if (!invoice || !user?.id) return
    setActionLoading(true)
    try {
      await officerApi.updateStage2InvoiceStatus(invoiceId, user.id, {
        status: 'stage2_rejected',
        notes: rejectNotes,
      })
      setShowRejectDialog(false)
      navigate('/officer2/dashboard')
    } catch (err) {
      setError(err?.message || 'Could not reject invoice')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!invoice || !user?.id) return
    setApproveLoading(true)
    try {
      await officerApi.completeStage2Invoice(invoiceId, user.id)
      navigate('/officer2/dashboard')
    } catch (err) {
      setError(err?.message || 'Could not approve invoice')
    } finally {
      setApproveLoading(false)
    }
  }

  return (
    <div>
     <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
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
          }}
        >
          <ArrowLeft size={15} />
          Back to Assigned Invoices
        </button>

        {!loading && !error && invoice && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stage2InvoiceHistoryDropdown
              originalInvoiceId={invoiceId}
              activeRecordId={viewingHistoryRecord?.id}
              onSelect={(record) => setViewingHistoryRecord(record)}
            />

            {!isApproved && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={actionLoading}
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
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.6 : 1,
                  }}
                >
                  <X size={14} />
                  Reject Invoice
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approveLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '0.5rem 1rem',
                    borderRadius: 999,
                    border: '1px solid rgba(22,163,74,0.3)',
                    background: '#fff',
                    color: '#15803d',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: approveLoading ? 'not-allowed' : 'pointer',
                    opacity: approveLoading ? 0.6 : 1,
                  }}
                >
                  <Check size={14} />
                  {approveLoading ? 'Approving…' : 'Approve Invoice'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/officer2/invoices/${invoiceId}/edit`, {
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

      {!loading && !error && !preview && (
        <div style={{ color: '#6b7280', fontSize: 14 }}>Invoice not found.</div>
      )}

      {!loading && !error && preview && (
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

      {showRejectDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '1.25rem',
              width: '90%',
              maxWidth: 380,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem', fontSize: 15, fontWeight: 700, color: '#111827' }}>
              Reject Invoice
            </h3>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
              Rejection notes
            </label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                marginTop: 6,
                marginBottom: 14,
                padding: '0.5rem',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 13,
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowRejectDialog(false)}
                disabled={actionLoading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 999,
                  border: '1px solid rgba(0,0,0,0.12)',
                  background: '#fff',
                  color: '#374151',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={actionLoading || !rejectNotes.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 999,
                  border: '1px solid rgba(0,0,0,0.12)',
                  background: '#b91c1c',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stage2InvoiceDetail