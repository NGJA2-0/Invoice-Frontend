import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, X, ArrowRight, FileEdit } from 'lucide-react'
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
          margin: 18px 0 6px;
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

      {!loading && !error && edits && (
        <button className="ierd-preview-btn" onClick={() => setShowPreview(true)}>
          <Eye size={17} />
          Preview Updated Invoice
        </button>
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