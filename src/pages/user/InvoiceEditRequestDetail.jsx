import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, X, ArrowRight, FileEdit, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { userService } from '../../services/userService'
import { useApp } from '../../context/AppContext'
import { buildInvoicePreviewData } from '../../utils/buildInvoicePreviewData'
import { diffInvoiceData, groupDiffBySection } from '../../utils/diffInvoiceData'
import InvoiceDetailHeader from '../../components/invoices/InvoiceDetailHeader'
import InvoicePreview from '../../components/invoices/InvoicePreview'

const GOLD = '#9a7b3c'
const LIGHT_GOLD = '#c9a96e'
const RULE = '#e8dfc8'

const SECTION_LABELS = {
  companyHeader: 'Company Details',
  invoiceMeta: 'Invoice Details',
  receiverInfo: 'Receiver (TO)',
  senderInfo: 'Sender (FROM)',
  deliveryInfo: 'Delivery Type',
  carrierDetails: 'Carrier Details',
  niDetails: 'NI Details',
  valuationTable: 'Valuation',
  exchangeRateSection: 'Exchange Rates',
  cifSummary: 'CIF Summary',
}

const formatLabel = (value = '') =>
  String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

const formatVal = (v) => {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return String(v)
}

const InvoiceEditRequestDetail = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()

  const [edits, setEdits] = useState(null)
  const [originalInvoice, setOriginalInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewStep, setReviewStep] = useState('choice') // 'choice' | 'reject-reason'
  const [rejectionReason, setRejectionReason] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    if (!invoiceId || !user?.id) return
    setLoading(true)
    setError(null)
    Promise.all([
      userService.getProposedEdits(invoiceId, user.id),
      userService.getInvoiceById(invoiceId, user.id),
    ])
      .then(([editsRes, invoiceRes]) => {
        setEdits(editsRes)
        setOriginalInvoice(invoiceRes)
      })
      .catch((err) => setError(err?.message || 'Failed to load proposed edits'))
      .finally(() => setLoading(false))
  }, [invoiceId, user?.id])

  const groupedDiff = useMemo(() => {
    if (!edits) return []
    const flat = diffInvoiceData(edits.originalData, edits.proposedData)
    return groupDiffBySection(flat)
  }, [edits])

  const previewData = useMemo(() => {
    if (!edits || !originalInvoice) return null
    const syntheticInvoice = { ...originalInvoice, data: edits.proposedData }
    return buildInvoicePreviewData(syntheticInvoice)
  }, [edits, originalInvoice])

  const closeReviewModal = () => {
    if (isSubmittingReview) return
    setShowReviewModal(false)
    setReviewStep('choice')
    setRejectionReason('')
    setReviewError('')
  }

  const handleApprove = async () => {
    setIsSubmittingReview(true)
    setReviewError('')
    try {
      await userService.reviewProposedEdits(invoiceId, user.id, {
        approved: true,
        rejectionReason: 'none',
      })
      window.location.reload()
    } catch (err) {
      setReviewError(err?.message || 'Failed to approve changes')
      setIsSubmittingReview(false)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setReviewError('Please enter a reason for rejection')
      return
    }
    setIsSubmittingReview(true)
    setReviewError('')
    try {
      await userService.reviewProposedEdits(invoiceId, user.id, {
        approved: false,
        rejectionReason: rejectionReason.trim(),
      })
      window.location.reload()
    } catch (err) {
      setReviewError(err?.message || 'Failed to reject changes')
      setIsSubmittingReview(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <InvoiceDetailHeader
        title="Back to Edit Requests"
        onBack={() => navigate('/user/invoice-edit-requests')}
      />

      <style>{`
        .ierd-section {
          background: rgba(255,255,255,0.9);
          border: 1px solid ${RULE};
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 14px;
          box-shadow: 0 1px 2px rgba(15,23,42,0.03);
        }
        .ierd-section-head {
          background: linear-gradient(90deg, #f0e8d4 0%, #fffdf8 100%);
          border-bottom: 1px solid ${RULE};
          padding: 10px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: ${GOLD};
        }
        .ierd-field-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid ${RULE};
        }
        .ierd-field-row:last-child { border-bottom: none; }
        .ierd-field-label {
          font-size: 11.5px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .ierd-value-pair {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ierd-old-value {
          font-size: 13px;
          color: #b91c1c;
          text-decoration: line-through;
          opacity: 0.75;
        }
        .ierd-new-value {
          font-size: 13.5px;
          font-weight: 700;
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          padding: 2px 8px;
        }
        .ierd-preview-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD});
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          box-shadow: 0 4px 14px -4px rgba(154,123,60,0.5);
          margin: 8px 0 6px;
        }
        .ierd-review-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: 1.5px solid #1a1a1a;
          background: #1a1a1a;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          margin: 18px 0 0;
        }
        .ierd-review-btn:hover { background: #2a2a2a; }

        .ierd-review-overlay {
          position: fixed;
          inset: 0;
          z-index: 100000;
          background: rgba(0,10,30,0.82);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .ierd-review-modal {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 18px;
          padding: 24px 22px 22px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
          animation: ierdModalIn 0.2s ease;
        }
        @keyframes ierdModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ierd-review-modal-close {
          position: absolute;
          top: 12px; right: 12px;
          width: 28px; height: 28px;
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          color: #4b5563;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .ierd-review-modal-close:disabled { opacity: 0.5; cursor: not-allowed; }
        .ierd-review-title {
          font-size: 16px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 6px;
        }
        .ierd-review-subtitle {
          font-size: 12.5px;
          color: #6b7280;
          line-height: 1.5;
          margin: 0 0 18px;
        }
        .ierd-review-error {
          font-size: 12px;
          color: #b91c1c;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: 8px;
          padding: 8px 10px;
          margin-bottom: 14px;
        }
        .ierd-review-actions {
          display: flex;
          gap: 10px;
        }
        .ierd-review-btn-accept,
        .ierd-review-btn-reject,
        .ierd-review-btn-cancel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          border: none;
        }
        .ierd-review-btn-accept {
          background: #166534;
          color: #fff;
        }
        .ierd-review-btn-accept:hover { background: #14532d; }
        .ierd-review-btn-reject {
          background: #b91c1c;
          color: #fff;
        }
        .ierd-review-btn-reject:hover { background: #991b1b; }
        .ierd-review-btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }
        .ierd-review-btn-cancel:hover { background: #e5e7eb; }
        .ierd-review-btn-accept:disabled,
        .ierd-review-btn-reject:disabled,
        .ierd-review-btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ierd-reject-textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13.5px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          margin-bottom: 14px;
          background: #f9fafb;
          color: #111827;
        }
        .ierd-reject-textarea:focus {
          border-color: ${GOLD};
          background: #fff;
        }
        .ierd-spin {
          animation: ierdSpin 1s linear infinite;
        }
        @keyframes ierdSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ierd-empty {
          text-align: center;
          padding: 50px 16px;
          color: #9ca3af;
          font-size: 13.5px;
        }
        .ierd-preview-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0,10,30,0.82);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
          padding: 16px;
        }
        .ierd-preview-close {
          position: sticky;
          top: 0;
          align-self: flex-end;
          width: 38px; height: 38px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.9);
          color: #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          margin-bottom: 10px;
          z-index: 2;
        }
        @media (max-width: 480px) {
          .ierd-section-head { font-size: 10px; padding: 9px 12px; }
          .ierd-field-row { padding: 10px 12px; flex-direction: column; align-items: flex-start; }
          .ierd-value-pair { width: 100%; }
          .ierd-review-modal { padding: 20px 16px 18px; border-radius: 16px; }
          .ierd-review-actions { flex-direction: column; }
          .ierd-review-btn-accept, .ierd-review-btn-reject, .ierd-review-btn-cancel {
            width: 100%;
          }
        }
      `}</style>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
        Proposed Edits — Invoice #{edits?.proposedData?.invoiceMeta?.invoiceNumber || invoiceId}
      </h2>
      <p style={{ fontSize: 12.5, color: '#888', marginBottom: 16 }}>
        Only the fields that changed are shown below.
      </p>

      {loading && <div style={{ fontSize: 13, color: '#888' }}>Loading proposed edits…</div>}
      {error && <div style={{ fontSize: 13, color: '#b91c1c' }}>{error}</div>}

      {!loading && !error && groupedDiff.length === 0 && (
        <div className="ierd-empty">
          <FileEdit size={26} style={{ marginBottom: 8 }} />
          <div>No pending edits proposed for this invoice.</div>
        </div>
      )}

      {!loading && !error && groupedDiff.map(({ sectionKey, fields }) => (
        <div className="ierd-section" key={sectionKey}>
          <div className="ierd-section-head">
            {SECTION_LABELS[sectionKey] || formatLabel(sectionKey)}
          </div>
          {fields.map((f, i) => (
            <div className="ierd-field-row" key={i}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ierd-field-label">{f.fieldPath.map(formatLabel).join(' / ')}</div>
                <div className="ierd-value-pair">
                  <span className="ierd-old-value">{formatVal(f.oldValue)}</span>
                  <ArrowRight size={13} color="#9ca3af" />
                  <span className="ierd-new-value">{formatVal(f.newValue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {!loading && !error && edits && groupedDiff.length > 0 && (
        <button
          className="ierd-review-btn"
          onClick={() => setShowReviewModal(true)}
        >
          <CheckCircle2 size={17} />
          Approve or Reject Changes
        </button>
      )}

      {!loading && !error && edits && (
        <button className="ierd-preview-btn" onClick={() => setShowPreview(true)}>
          <Eye size={17} />
          Preview Updated Invoice
        </button>
      )}

      {showReviewModal && (
        <div className="ierd-review-overlay" onClick={closeReviewModal}>
          <div className="ierd-review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ierd-review-modal-close" onClick={closeReviewModal} disabled={isSubmittingReview}>
              <X size={16} />
            </button>

            {reviewStep === 'choice' ? (
              <>
                <h3 className="ierd-review-title">Review Proposed Changes</h3>
                <p className="ierd-review-subtitle">
                  Do you want to accept or reject the changes proposed for this invoice?
                </p>
                {reviewError && <div className="ierd-review-error">{reviewError}</div>}
                <div className="ierd-review-actions">
                  <button
                    className="ierd-review-btn-accept"
                    onClick={handleApprove}
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? <Loader2 size={16} className="ierd-spin" /> : <CheckCircle2 size={16} />}
                    Accept
                  </button>
                  <button
                    className="ierd-review-btn-reject"
                    onClick={() => { setReviewStep('reject-reason'); setReviewError('') }}
                    disabled={isSubmittingReview}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="ierd-review-title">Reason for Rejection</h3>
                <p className="ierd-review-subtitle">
                  Please explain why you're rejecting these proposed changes.
                </p>
                <textarea
                  className="ierd-reject-textarea"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => { setRejectionReason(e.target.value); setReviewError('') }}
                  placeholder="e.g. Receiver address is incorrect, please re-check with the client."
                  disabled={isSubmittingReview}
                />
                {reviewError && <div className="ierd-review-error">{reviewError}</div>}
                <div className="ierd-review-actions">
                  <button
                    className="ierd-review-btn-cancel"
                    onClick={() => { setReviewStep('choice'); setRejectionReason(''); setReviewError('') }}
                    disabled={isSubmittingReview}
                  >
                    Cancel
                  </button>
                  <button
                    className="ierd-review-btn-reject"
                    onClick={handleRejectSubmit}
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? <Loader2 size={16} className="ierd-spin" /> : <XCircle size={16} />}
                    Submit Rejection
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPreview && previewData && (
        <div className="ierd-preview-overlay" onClick={() => setShowPreview(false)}>
          <button className="ierd-preview-close" onClick={() => setShowPreview(false)}>
            <X size={18} />
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <InvoicePreview preview={previewData} />
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceEditRequestDetail