import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Download, Eye, Send } from 'lucide-react'
import TemplateEngine from '../../components/invoices/TemplateEngine'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import { useApp } from '../../context/AppContext'
import { officerApi } from '../../services/officerApi'
import { api } from '../../services/api'
import { jsPDF } from 'jspdf'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const buildDefaultInvoiceData = () => ({
  companyHeader: {
    logoUrl: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    tin: '',
    stockValueName: '',
  },
  receiverInfo: {
    receiverName: '',
    receiverAddress: '',
    receiverCountry: '',
    receiverContact: '',
  },
  senderInfo: {
    senderName: '',
    senderAddress: '',
    senderPhone: '',
    senderWebsite: '',
  },
  invoiceMeta: {
    invoiceDate: '',
    invoiceNumber: '',
    exportType: '',
    countryOfOrigin: '',
    remarks: '',
  },
  niDetails: {
    niNumber: '',
    niDate: '',
  },
  deliveryInfo: {
    deliveryType: '',
  },
  carrierDetails: {
    carrierFullName: '',
    carrierPassportID: '',
    carrierContact: '',
    carrierNationality: '',
    flightNumber: '',
    airline: '',
    destinationCountry: '',
  },
  valuationTable: {
    valuationItems: [],
  },
  cifSummary: {
    cifItems: [],
  },
  exchangeRateSection: {
    exchangeRate: '',
    fob: '',
    freight: '',
    insurance: '',
    cif: '',
    cifLkr: '',
  },
})

/**
 * Deep-merge the stored invoice data into the default shape so every
 * react-hook-form field is guaranteed to have a value (even empty string).
 */
const mergeInvoiceData = (existingData = {}) => {
  const defaults = buildDefaultInvoiceData()
  const merge = (target, source) => {
    if (!source || typeof source !== 'object') return target
    const result = { ...target }
    for (const key of Object.keys(target)) {
      if (source[key] !== undefined && source[key] !== null) {
        const tIsObj = typeof target[key] === 'object' && !Array.isArray(target[key])
        const sIsObj = typeof source[key] === 'object' && !Array.isArray(source[key])
        result[key] = tIsObj && sIsObj ? merge(target[key], source[key]) : source[key]
      }
    }
    // copy any extra keys the server sends (e.g. additional cifSummary fields)
    for (const key of Object.keys(source)) {
      if (!(key in result)) result[key] = source[key]
    }
    return result
  }
  return merge(defaults, existingData)
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const Stage3EditInvoice = () => {
  const { invoiceId: originalInvoiceId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, pushToast } = useApp()

  // ── Invoice data (prefer state passed from InvoiceDetail, fallback to fetch) ──
  const [invoice, setInvoice] = useState(state?.invoice || null)
  const [loadingInvoice, setLoadingInvoice] = useState(!state?.invoice)

  // ── Template config (fetched directly by templateKey — no user-auth endpoint) ──
  const [templateConfig, setTemplateConfig] = useState(null)
  const [loadingTemplate, setLoadingTemplate] = useState(false)

  // ── UI state ──
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState('')

  const previewRef = useRef(null)

  const form = useForm({
    defaultValues: { invoiceData: buildDefaultInvoiceData() },
  })
  const { register, control, watch, setValue, getValues, reset } = form

  // ── Fetch invoice if not passed via state ──
  useEffect(() => {
    if (invoice || !originalInvoiceId) return
    setLoadingInvoice(true)
    officerApi
      .getStage3DocumentById(originalInvoiceId)
      .then((res) => setInvoice(res))
      .catch((err) =>
        pushToast({ title: 'Failed to load invoice', message: err?.message, tone: 'error' })
      )
      .finally(() => setLoadingInvoice(false))
  }, [originalInvoiceId, invoice, pushToast])

  // ── Fetch template directly by templateKey (officer-safe endpoint) ──
  // GET /api/v1/templates/:templateKey — does NOT require a user token
  useEffect(() => {
    if (!invoice) return
    const key = invoice.templateKey
    if (!key) {
      pushToast({
        title: 'Template unknown',
        message: 'The invoice has no template key. Cannot load the edit form.',
        tone: 'error',
      })
      return
    }

    setLoadingTemplate(true)
    api
      .get(`/templates/${key}`)
      .then((structure) => setTemplateConfig(structure))
      .catch((err) =>
        pushToast({
          title: 'Unable to load template',
          message: err?.message || 'Please try again.',
          tone: 'danger',
        })
      )
      .finally(() => setLoadingTemplate(false))
  }, [invoice, pushToast])

  // ── Auto-fill form fields once template is loaded ──
  useEffect(() => {
    if (!templateConfig || !invoice) return
    const merged = mergeInvoiceData(invoice.data || {})
    reset({ invoiceData: merged })
  }, [templateConfig, invoice, reset])

  // ── Derived ──
  const formReady = Boolean(templateConfig)

  const templateKey = String(templateConfig?.templateKey || '').toUpperCase()
  const isTemplate3 = templateKey === 'TEMPLATE_3'
  const isTemplate4 = templateKey === 'TEMPLATE_4'

  const ensureTemplate3NiDetails = () => {
    if (!isTemplate3 && !isTemplate4) return true
    const niNumber = getValues('invoiceData.niDetails.niNumber')
    const niDate = getValues('invoiceData.niDetails.niDate')
    if (niNumber && niDate) return true
    pushToast({
      title: 'NI details required',
      message: 'Please provide NI Number and NI Date before continuing.',
      tone: 'danger',
    })
    return false
  }

  // ── Logo upload (officer still needs to upload via officer token context) ──
  const handleLogoUpload = async (file) => {
    if (!file) return
    setUploadingLogo(true)
    try {
      // Use the shared upload-logo endpoint with the officer's stored id header
      const formData = new FormData()
      formData.append('logo', file)
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://invoice-backend-ibyr.onrender.com/api/v1'}/invoices/upload-logo`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token || ''}`,
          },
        }
      )
      const json = await response.json().catch(() => null)
      if (!response.ok) throw new Error(json?.message || 'Upload failed')
      setValue('invoiceData.companyHeader.logoUrl', json?.data?.path || json?.path || '')
      pushToast({ title: 'Logo uploaded', message: 'Logo stored successfully.', tone: 'success' })
    } catch (error) {
      pushToast({ title: 'Logo upload failed', message: error.message || 'Try again.', tone: 'danger' })
    } finally {
      setUploadingLogo(false)
    }
  }

  // ── Build preview payload ──
  const buildPreviewPayload = () => ({
    category: invoice?.category,
    subCategory: invoice?.subCategory || undefined,
    invoiceData: getValues('invoiceData'),
  })

  // ── Preview (uses shared preview endpoint; officer identity derived from Bearer token) ──
  const handlePreview = async () => {
    if (!formReady || !ensureTemplate3NiDetails()) return
    try {
      const data = await api.post('/invoices/preview', buildPreviewPayload())
      setPreview(data)
      pushToast({ title: 'Preview ready', message: 'Invoice preview generated.', tone: 'success' })
    } catch (error) {
      pushToast({ title: 'Preview failed', message: error.message || 'Unable to generate preview.', tone: 'danger' })
    }
  }

  // ── Resubmit (officer edit) ──
  const handleResubmit = async () => {
    if (!ensureTemplate3NiDetails()) return
    if (!user?.id) {
      pushToast({ title: 'Not authenticated', message: 'Please log in again.', tone: 'danger' })
      return
    }

    // The originalInvoiceId to post against is the root invoice id (not the snapshot id)
    const targetId = invoice?.originalInvoiceId || originalInvoiceId

    const payload = {
      invoiceData: getValues('invoiceData'),
      notes: notes.trim() || 'Edited by Stage 3 Officer',
    }

    setSubmitting(true)
    try {
      await officerApi.editStage3Invoice(targetId, payload)
      pushToast({
        title: 'Invoice resubmitted',
        message: 'Edition snapshot saved successfully.',
        tone: 'success',
      })
      navigate('/officer3/dashboard')
    } catch (err) {
      pushToast({
        title: 'Resubmit failed',
        message: err?.message || 'Could not save the edited invoice.',
        tone: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // ── PDF export ──
  const ensurePreviewData = async () => {
    if (!ensureTemplate3NiDetails()) throw new Error('Missing required NI details.')
    if (preview) return preview
    const data = await api.post('/invoices/preview', buildPreviewPayload())
    setPreview(data)
    return data
  }

  const exportPdf = async () => {
    try {
      const data = await ensurePreviewData()
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      const target = previewRef.current
      if (!target) throw new Error('Preview is not ready yet. Please try again.')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 32
      const { width, height } = target.getBoundingClientRect()
      const scale = Math.min(
        1,
        (pageWidth - margin * 2) / width,
        (pageHeight - margin * 2) / height
      )
      await new Promise((resolve) => {
        doc.html(target, {
          x: margin,
          y: margin,
          html2canvas: { scale, backgroundColor: '#ffffff' },
          windowWidth: target.scrollWidth,
          callback: (renderedDoc) => {
            renderedDoc.save(`${data?.meta?.invoiceNumber || 'invoice'}.pdf`)
            resolve()
          },
        })
      })
    } catch (error) {
      pushToast({ title: 'PDF export failed', message: error.message || 'Unable to generate PDF.', tone: 'danger' })
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────────────────

  if (loadingInvoice || (invoice && loadingTemplate && !templateConfig)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
        <div style={{ marginBottom: 8 }}>⏳ Loading invoice editor…</div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>Fetching template configuration</div>
      </div>
    )
  }

  const invoiceLabel =
    invoice?.invoiceNumber || invoice?.editionLabel || originalInvoiceId

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .oei-page {
          display: flex;
          flex-direction: column;
          gap: 0;
          min-height: 100vh;
          padding: 2rem 2.5rem;
        }
        .oei-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 1.75rem 2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          margin-bottom: 1rem;
        }
        .oei-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #003A6B;
          margin-bottom: 0.55rem;
        }
        .oei-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #003A6B;
          display: inline-block;
        }
        .oei-title {
          font-size: 2rem;
          font-weight: 600;
          color: #0f0f0f;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0;
        }
        .oei-subtitle {
          margin-top: 0.4rem;
          font-size: 0.875rem;
          color: #7a7a7a;
          font-weight: 400;
        }
        .oei-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }
        .oei-badge-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #b8b8b8;
        }
        .oei-badge-number {
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #003A6B;
        }
        .oei-info-bar {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          padding: 1rem 1.5rem;
          background: #f0f5ff;
          border: 1px solid #c7d9f0;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        .oei-info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .oei-info-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6b90b8;
        }
        .oei-info-value {
          font-size: 13px;
          font-weight: 600;
          color: #003A6B;
        }
        .oei-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          transition: box-shadow 0.2s ease;
        }
        .oei-card:hover { box-shadow: 0 2px 24px rgba(0,0,0,0.05); }
        .oei-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .oei-card-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1a1a1a;
        }
        .oei-card-accent {
          width: 24px;
          height: 2px;
          background: #003A6B;
          border-radius: 2px;
        }
        .oei-notes-area {
          width: 100%;
          resize: vertical;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 13px;
          font-family: inherit;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.2s;
          min-height: 72px;
          box-sizing: border-box;
        }
        .oei-notes-area:focus { border-color: #003A6B; }
        .oei-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.25rem 2rem;
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }
        .oei-action-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .oei-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 1.1rem;
          height: 38px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.18s ease;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .oei-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .oei-btn-navy { background: #003A6B; color: #ffde1a; }
        .oei-btn-navy:hover:not(:disabled) { background: #004f93; }
        .oei-btn-gold { background: #b8922a; color: #fff; }
        .oei-btn-gold:hover:not(:disabled) { background: #a07d22; }
        .oei-btn-ghost { background: #f7f7f7; color: #333; border: 1px solid #e8e8e8; }
        .oei-btn-ghost:hover:not(:disabled) { background: #efefef; border-color: #d0d0d0; }
        .oei-btn svg { width: 15px; height: 15px; stroke-width: 1.8px; flex-shrink: 0; }
        .oei-btn-divider { width: 1px; height: 22px; background: #e8e8e8; margin: 0 2px; }
        .oei-preview-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          overflow: hidden;
        }
        .oei-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
        }
        .oei-preview-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #888;
        }
        .oei-preview-body { padding: 2rem; }
      `}</style>

      <div className="oei-page">

        {/* ── Back navigation ── */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate(`/officer3/invoices/${originalInvoiceId}`)}
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
            Back to invoice
          </button>
        </div>

        {/* ── Hero Header ── */}
        <div className="oei-hero no-print">
          <div>
            <div className="oei-eyebrow">
              <span className="oei-eyebrow-dot" />
              NGJA — Stage 3 Officer
            </div>
            <h1 className="oei-title">Edit Invoice</h1>
            <p className="oei-subtitle">
              Correct the details below and resubmit for review
            </p>
          </div>
          {invoiceLabel && (
            <div className="oei-badge">
              <span className="oei-badge-label">Invoice</span>
              <span className="oei-badge-number">{invoiceLabel}</span>
            </div>
          )}
        </div>

        {/* ── Invoice meta info bar ── */}
        {invoice && (
          <div className="oei-info-bar no-print">
            {invoice.category && (
              <div className="oei-info-item">
                <span className="oei-info-label">Category</span>
                <span className="oei-info-value">{invoice.category}</span>
              </div>
            )}
            {invoice.subCategory && (
              <div className="oei-info-item">
                <span className="oei-info-label">Sub-Category</span>
                <span className="oei-info-value">{invoice.subCategory}</span>
              </div>
            )}
            {invoice.templateKey && (
              <div className="oei-info-item">
                <span className="oei-info-label">Template</span>
                <span className="oei-info-value">{invoice.templateKey}</span>
              </div>
            )}
            {invoice.status && (
              <div className="oei-info-item">
                <span className="oei-info-label">Status</span>
                <span className="oei-info-value">{invoice.status}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Template form ── */}
        {formReady ? (
          <form
            className="flex flex-col gap-0"
            onSubmit={(e) => e.preventDefault()}
          >
            <TemplateEngine
              templateConfig={templateConfig}
              invoiceNumber={invoice?.invoiceNumber || ''}
              register={register}
              control={control}
              watch={watch}
              setValue={setValue}
              onLogoUpload={handleLogoUpload}
              uploadingLogo={uploadingLogo}
              businessProfile={null}
              pushToast={pushToast}
            />

            {/* ── Notes ── */}
            <div className="oei-card no-print" style={{ marginTop: '1.5rem' }}>
              <div className="oei-card-header">
                <span className="oei-card-title">Officer Notes</span>
                <div className="oei-card-accent" />
              </div>
              <textarea
                className="oei-notes-area"
                placeholder="Describe what was corrected (e.g. carrier details updated, valuation fixed)…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* ── Action Bar ── */}
            <div className="oei-action-bar no-print">
              <div className="oei-action-group">
                <button
                  type="button"
                  className="oei-btn oei-btn-navy"
                  disabled={submitting}
                  onClick={handleResubmit}
                >
                  <Send />
                  {submitting ? 'Resubmitting…' : 'Resubmit Invoice'}
                </button>
              </div>

              <div className="oei-btn-divider" />

              <div className="oei-action-group">
                <button
                  type="button"
                  className="oei-btn oei-btn-ghost"
                  onClick={handlePreview}
                >
                  <Eye />
                  Preview
                </button>
                <button
                  type="button"
                  className="oei-btn oei-btn-gold"
                  onClick={exportPdf}
                >
                  <Download />
                  Export PDF
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            {loadingTemplate ? 'Loading template…' : 'Could not load the invoice template.'}
          </div>
        )}

        {/* ── Preview panel ── */}
        {preview ? (
          <div className="oei-preview-card">
            <div className="oei-preview-header no-print">
              <span className="oei-preview-title">Invoice Preview</span>
              <button
                type="button"
                className="oei-btn oei-btn-gold"
                style={{ height: 32, fontSize: 12 }}
                onClick={exportPdf}
              >
                <Download />
                Export PDF
              </button>
            </div>
            <div className="oei-preview-body">
              <InvoicePreview ref={previewRef} preview={preview} />
            </div>
          </div>
        ) : null}

      </div>
    </>
  )
}

export default Stage3EditInvoice