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
const BG = '#fffdf8'

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

const STAGES = ['stage1', 'stage2', 'stage3']
const STAGE_LABELS = {
  stage1: 'Stage 1 Officer',
  stage2: 'Stage 2 Officer',
  stage3: 'Stage 3 Officer',
}

const InvoiceEditRequestDetail = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()

  // { stage1: {originalData, proposedData} | null, stage2: ..., stage3: ... }
  const [editsByStage, setEditsByStage] = useState({})
  const [originalInvoice, setOriginalInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewStage, setPreviewStage] = useState(null) // which stage's preview is open
  const [reviewModalStage, setReviewModalStage] = useState(null) // which stage's review modal is open
  const [reviewStep, setReviewStep] = useState('choice') // 'choice' | 'reject-reason'
  const [rejectionReason, setRejectionReason] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    if (!invoiceId || !user?.id) return
    setLoading(true)
    setError(null)

    Promise.all([
      ...STAGES.map((stage) =>
        userService
          .getProposedEdits(stage, invoiceId, user.id)
          .then((res) => ({ stage, res }))
          .catch(() => ({ stage, res: null })), // no pending edits at this stage
      ),
      userService.getInvoiceById(invoiceId, user.id),
    ])
      .then((results) => {
        const invoiceRes = results.pop()
        const stageMap = {}
        results.forEach(({ stage, res }) => {
          stageMap[stage] = res
        })
        setEditsByStage(stageMap)
        setOriginalInvoice(invoiceRes)
      })
      .catch((err) => setError(err?.message || 'Failed to load proposed edits'))
      .finally(() => setLoading(false))
  }, [invoiceId, user?.id])

  // Returns [{ stage, edits, groupedDiff }] — only stages that actually have changes
  const stageDiffs = useMemo(() => {
    return STAGES
      .map((stage) => {
        const edits = editsByStage[stage]
        if (!edits) return null
        const flat = diffInvoiceData(edits.originalData, edits.proposedData)
        const groupedDiff = groupDiffBySection(flat)
        if (groupedDiff.length === 0) return null
        return { stage, edits, groupedDiff }
      })
      .filter(Boolean)
  }, [editsByStage])

  const buildPreviewForStage = (stage) => {
    const edits = editsByStage[stage]
    if (!edits || !originalInvoice) return null
    const syntheticInvoice = { ...originalInvoice, data: edits.proposedData }
    return buildInvoicePreviewData(syntheticInvoice)
  }

  const closeReviewModal = () => {
    if (isSubmittingReview) return
    setReviewModalStage(null)
    setReviewStep('choice')
    setRejectionReason('')
    setReviewError('')
  }

  const handleApprove = async () => {
    if (!reviewModalStage) return
    setIsSubmittingReview(true)
    setReviewError('')
    try {
      await userService.reviewProposedEdits(reviewModalStage, invoiceId, user.id, {
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
    if (!reviewModalStage) return
    if (!rejectionReason.trim()) {
      setReviewError('Please enter a reason for rejection')
      return
    }
    setIsSubmittingReview(true)
    setReviewError('')
    try {
      await userService.reviewProposedEdits(reviewModalStage, invoiceId, user.id, {
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
        .ierd-panel {
          position: relative;
          background: ${BG};
          border: 1px solid ${RULE};
          border-radius: 18px;
          padding: 22px 24px 24px;
          box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -16px rgba(154,123,60,0.25);
          overflow: hidden;
        }
        .ierd-panel-head {
          border-bottom: 1px solid ${RULE};
          padding-bottom: 14px;
          margin-bottom: 18px;
        }
        .ierd-eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 6px;
        }
        .ierd-heading {
          font-size: 17px;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: -0.01em;
          margin: 0 0 4px;
          line-height: 1.4;
        }
        .ierd-subheading {
          font-size: 12.5px;
          color: #8a8a8a;
          margin: 0;
          line-height: 1.5;
        }
        .ierd-status-line { font-size: 13px; color: #888; padding: 6px 0; }
        .ierd-status-line.error { color: #b91c1c; }
        .ierd-actions-card {
          background: #ffffff;
          border: 1px solid ${RULE};
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 1px 2px rgba(15,23,42,0.03);
        }
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
        .ierd-stage-block {
          margin-bottom: 26px;
          padding-bottom: 4px;
          border-bottom: 1px dashed ${RULE};
        }
        .ierd-stage-block:last-of-type {
          border-bottom: none;
        }
        .ierd-stage-heading {
          font-size: 12.5px;
          font-weight: 800;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 10px;
          padding-left: 2px;
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
        @media (min-width: 641px) {
          .ierd-preview-overlay {
            align-items: center;
          }
          .ierd-preview-inner {
            justify-content: center;
          }
          .ierd-preview-close {
            position: fixed;
            top: 20px;
            right: 24px;
            width: 44px;
            height: 44px;
            background: #ffffff;
            color: #1a1a1a;
            box-shadow: 0 8px 24px -6px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.06);
            margin-bottom: 0;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .ierd-preview-close:hover {
            transform: scale(1.08);
            box-shadow: 0 10px 28px -6px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.08);
          }
        }
        @media (max-width: 640px) {
          .ierd-panel { border-radius: 14px; padding: 18px 16px 20px; }
        }
        @media (max-width: 480px) {
          .ierd-heading { font-size: 15px; }
          .ierd-section-head { font-size: 10px; padding: 9px 12px; }
          .ierd-field-row { padding: 10px 12px; flex-direction: column; align-items: flex-start; }
          .ierd-value-pair { width: 100%; }
          .ierd-actions-card { padding: 12px; }
          .ierd-review-modal { padding: 20px 16px 18px; border-radius: 16px; }
          .ierd-review-actions { flex-direction: column; }
          .ierd-review-btn-accept, .ierd-review-btn-reject, .ierd-review-btn-cancel {
            width: 100%;
          }
        }
      `}</style>

      <div className="ierd-panel">
        <div className="ierd-panel-head">
          <div className="ierd-eyebrow">Officer Review</div>
          <h2 className="ierd-heading">
            Proposed Edits — Invoice #
            {originalInvoice?.data?.invoiceMeta?.invoiceNumber ||
              originalInvoice?.invoiceNumber ||
              invoiceId}
          </h2>
          <p className="ierd-subheading">Only the fields that changed are shown below.</p>
        </div>

        {loading && <div className="ierd-status-line">Loading proposed edits…</div>}
        {error && <div className="ierd-status-line error">{error}</div>}

        {!loading && !error && stageDiffs.length === 0 && (
          <div className="ierd-empty">
            <FileEdit size={26} style={{ marginBottom: 8 }} />
            <div>No pending edits proposed for this invoice.</div>
          </div>
        )}

        {!loading && !error && stageDiffs.map(({ stage, groupedDiff }) => (
          <div key={stage} className="ierd-stage-block">
            <div className="ierd-stage-heading">{STAGE_LABELS[stage]} — Proposed Changes</div>

            {groupedDiff.map(({ sectionKey, fields }) => (
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

            <div className="ierd-actions-card">
              <button
                className="ierd-review-btn"
                onClick={() => setReviewModalStage(stage)}
              >
                <CheckCircle2 size={17} />
                Approve or Reject {STAGE_LABELS[stage]} Changes
              </button>

              <button className="ierd-preview-btn" onClick={() => setPreviewStage(stage)}>
                <Eye size={17} />
                Preview Invoice With {STAGE_LABELS[stage]} Changes
              </button>
            </div>
          </div>
        ))}
      </div>

      {reviewModalStage && (
        <div className="ierd-review-overlay" onClick={closeReviewModal}>
          <div className="ierd-review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ierd-review-modal-close" onClick={closeReviewModal} disabled={isSubmittingReview}>
              <X size={16} />
            </button>

            {reviewStep === 'choice' ? (
              <>
                <h3 className="ierd-review-title">Review {STAGE_LABELS[reviewModalStage]} Changes</h3>
                <p className="ierd-review-subtitle">
                  Do you want to accept or reject the changes proposed at this stage?
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

      {previewStage && buildPreviewForStage(previewStage) && (
        <div className="ierd-preview-overlay" onClick={() => setPreviewStage(null)}>
          <button className="ierd-preview-close" onClick={() => setPreviewStage(null)}>
            <X size={18} />
          </button>
          <div
            className="ierd-preview-inner"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <InvoicePreview preview={buildPreviewForStage(previewStage)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceEditRequestDetail