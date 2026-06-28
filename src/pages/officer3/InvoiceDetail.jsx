import { useMemo, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMemo as useMemoAlias } from 'react' // no-op placeholder removed below
import { ArrowLeft, Pencil } from 'lucide-react'
import { officerApi } from '../../services/officerApi'
import { buildInvoicePreviewData } from '../../utils/buildInvoicePreviewData'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import Stage3InvoiceHistoryDropdown from './Stage3InvoiceHistoryDropdown'

const Stage3InvoiceDetail = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewingHistoryRecord, setViewingHistoryRecord] = useState(null) // non-null when previewing a past edition

  useEffect(() => {
    if (!invoiceId) return
    setLoading(true)
    setError(null)
    officerApi
      .getStage3DocumentById(invoiceId)
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
          onClick={() => navigate('/officer3/dashboard')}
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
            <Stage3InvoiceHistoryDropdown
              originalInvoiceId={invoiceId}
              activeRecordId={viewingHistoryRecord?.id}
              onSelect={(record) => setViewingHistoryRecord(record)}
            />

            <button
              type="button"
              onClick={() =>
                navigate(`/officer3/invoices/${invoiceId}/edit`, {
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
    </div>
  )
}

export default Stage3InvoiceDetail