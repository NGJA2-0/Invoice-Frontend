import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Download, Eye, Save, FileText, ChevronRight } from 'lucide-react'
import Button from '../../components/common/Button'
import CategorySelector from '../../components/invoices/CategorySelector'
import SubCategorySelector from '../../components/invoices/SubCategorySelector'
import TemplateEngine from '../../components/invoices/TemplateEngine'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import { useApp } from '../../context/AppContext'
import { invoiceService } from '../../services/invoiceService'
import { jsPDF } from 'jspdf'

const buildDefaultInvoiceData = () => ({
  companyHeader: {
    companyName: '',
    companyAddress: '',
    logoUrl: '',
  },
  buyerInformation: {
    buyerName: '',
    buyerAddress: '',
    buyerCountry: '',
  },
  deliveryInformation: {
    deliveryAddress: '',
    deliveryTerms: '',
  },
  transportDetails: {
    transportMode: '',
    carrier: '',
    awbNumber: '',
  },
  valuation: {
    items: [
      {
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        currency: 'USD',
        weight: '',
      },
    ],
    totalUsd: 0,
    totalLkr: 0,
  },
  exchangeRates: {
    exchangeRate: '',
  },
  certification: {
    certificateNumber: '',
    issueDate: '',
  },
  signature: {
    signatoryName: '',
    signatoryTitle: '',
  },
})

const CreateInvoice = () => {
  const { userStatus, user, createInvoice, pushToast } = useApp()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [templateConfig, setTemplateConfig] = useState(null)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [preview, setPreview] = useState(null)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const form = useForm({
    defaultValues: {
      invoiceData: buildDefaultInvoiceData(),
    },
  })

  const { register, control, watch, setValue, getValues, reset } = form

  useEffect(() => {
    if (userStatus !== 'approved') {
      navigate('/user/dealer-registration')
    }
  }, [userStatus, navigate])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await invoiceService.getCategories()
        setCategories(data || [])
      } catch (error) {
        pushToast({
          title: 'Unable to load categories',
          message: error.message || 'Please try again.',
          tone: 'danger',
        })
      }
    }
    loadCategories()
  }, [pushToast])

  useEffect(() => {
    const loadNumber = async () => {
      try {
        const nextNumber = await invoiceService.generateNumber()
        setInvoiceNumber(nextNumber?.invoiceNumber || '')
      } catch (error) {
        setInvoiceNumber('')
      }
    }
    loadNumber()
  }, [])

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!category) {
        setSubCategories([])
        setSubCategory('')
        setTemplateConfig(null)
        return
      }
      try {
        const data = await invoiceService.getSubCategories(category)
        setSubCategories(data || [])
        setSubCategory('')
        setTemplateConfig(null)
        reset({ invoiceData: buildDefaultInvoiceData() })
      } catch (error) {
        setSubCategories([])
      }
    }
    loadSubCategories()
  }, [category, reset])

  useEffect(() => {
    const shouldLoad = category && (subCategories.length === 0 || subCategory)
    if (!shouldLoad) {
      setTemplateConfig(null)
      return
    }

    const loadConfig = async () => {
      setLoadingConfig(true)
      try {
        const config = await invoiceService.getConfiguration({
          category,
          subCategory,
        })
        setTemplateConfig(config)
      } catch (error) {
        pushToast({
          title: 'Unable to load template',
          message: error.message || 'Please try again.',
          tone: 'danger',
        })
      } finally {
        setLoadingConfig(false)
      }
    }
    loadConfig()
  }, [category, subCategory, subCategories.length, pushToast])

  const formReady = useMemo(() => Boolean(category && templateConfig), [category, templateConfig])

  const handleLogoUpload = async (file) => {
    if (!file) return
    setUploadingLogo(true)
    try {
      const response = await invoiceService.uploadLogo(file)
      setValue('invoiceData.companyHeader.logoUrl', response?.path || '')
      pushToast({
        title: 'Logo uploaded',
        message: 'Company logo stored successfully.',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Logo upload failed',
        message: error.message || 'Try again with a smaller image.',
        tone: 'danger',
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const buildPayload = (status) => ({
    category,
    subCategory: subCategory || undefined,
    invoiceData: getValues('invoiceData'),
    status,
    createdBy: user?.id || '',
  })

  const handlePreview = async () => {
    if (!formReady) return
    try {
      const data = await invoiceService.preview(buildPayload('draft'))
      setPreview(data)
      pushToast({
        title: 'Preview ready',
        message: 'Invoice preview generated successfully.',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Preview failed',
        message: error.message || 'Unable to generate preview.',
        tone: 'danger',
      })
    }
  }

  const handleSave = async (status) => {
    if (!user?.id) {
      pushToast({
        title: 'Missing user profile',
        message: 'Please login again to continue.',
        tone: 'danger',
      })
      return
    }

    try {
      await createInvoice(buildPayload(status))
      pushToast({
        title: status === 'draft' ? 'Draft saved' : 'Invoice submitted',
        message:
          status === 'draft'
            ? 'Invoice saved as draft.'
            : 'Invoice submitted for review.',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Submission failed',
        message: error.message || 'Unable to submit invoice.',
        tone: 'danger',
      })
    }
  }

  const exportPdf = async () => {
    try {
      const data =
        preview || (await invoiceService.preview(buildPayload('draft')))
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('NGJA Export Invoice', 40, 50)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Invoice: ${data?.meta?.invoiceNumber || ''}`, 40, 80)
      doc.text(`Category: ${data?.meta?.category || ''}`, 40, 100)
      if (data?.meta?.subCategory) {
        doc.text(`Sub Category: ${data.meta.subCategory}`, 40, 120)
      }
      doc.text(`Template: ${data?.meta?.templateKey || ''}`, 40, 140)
      doc.text('Generated via NGJA E-Invoice System', 40, 170)
      doc.save(`${data?.meta?.invoiceNumber || 'invoice'}.pdf`)
    } catch (error) {
      pushToast({
        title: 'PDF export failed',
        message: error.message || 'Unable to generate PDF.',
        tone: 'danger',
      })
    }
  }

  return (
    <>
      <style>{`
        .ci-page {
          display: flex;
          flex-direction: column;
          gap: 0;
          min-height: 100vh;
          padding: 2rem 2.5rem;
        }

        /* ── Hero header ── */
        .ci-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          margin-bottom: 2.5rem;
        }
        .ci-hero-left {}
        .ci-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #b8922a;
          margin-bottom: 0.55rem;
        }
        .ci-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #b8922a;
          display: inline-block;
        }
        .ci-title {
          font-size: 2rem;
          font-weight: 600;
          color: #0f0f0f;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0;
        }
        .ci-subtitle {
          margin-top: 0.4rem;
          font-size: 0.875rem;
          color: #7a7a7a;
          font-weight: 400;
        }
        .ci-invoice-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }
        .ci-invoice-badge-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #b8b8b8;
        }
        .ci-invoice-badge-number {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #b8922a;
        }

        /* ── Step indicator ── */
        .ci-steps {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 2.5rem;
        }
        .ci-step {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ci-step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .ci-step-circle.active {
          background: #b8922a;
          color: #fff;
        }
        .ci-step-circle.done {
          background: #f0e9d8;
          color: #b8922a;
        }
        .ci-step-circle.idle {
          background: #f4f4f4;
          color: #c0c0c0;
        }
        .ci-step-label {
          font-size: 12px;
          font-weight: 500;
          color: #7a7a7a;
        }
        .ci-step-label.active {
          color: #0f0f0f;
          font-weight: 600;
        }
        .ci-step-divider {
          width: 36px;
          height: 1px;
          background: #e4e4e4;
          margin: 0 6px;
        }

        /* ── Section card ── */
        .ci-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          padding: 2rem 2rem;
          margin-bottom: 1.5rem;
          transition: box-shadow 0.2s ease;
        }
        .ci-card:hover {
          box-shadow: 0 2px 24px rgba(0,0,0,0.05);
        }
        .ci-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .ci-card-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1a1a1a;
        }
        .ci-card-accent {
          width: 24px;
          height: 2px;
          background: #b8922a;
          border-radius: 2px;
        }

        /* ── Selectors layout ── */
        .ci-selector-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 640px) {
          .ci-selector-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── Loading state ── */
        .ci-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 1.25rem;
          padding: 0.875rem 1rem;
          background: #faf8f4;
          border: 1px solid #f0e9d8;
          border-radius: 10px;
        }
        .ci-loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #b8922a;
          animation: ci-pulse 1.2s ease-in-out infinite;
        }
        .ci-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .ci-loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ci-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .ci-loading-text {
          font-size: 12px;
          font-weight: 500;
          color: #b8922a;
          letter-spacing: 0.03em;
        }

        /* ── Action bar ── */
        .ci-action-bar {
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
        .ci-action-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        /* ── Custom action buttons ── */
        .ci-btn {
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
        .ci-btn-primary {
          background: #1a1a1a;
          color: #fff;
        }
        .ci-btn-primary:hover {
          background: #333;
        }
        .ci-btn-gold {
          background: #b8922a;
          color: #fff;
        }
        .ci-btn-gold:hover {
          background: #a07d22;
        }
        .ci-btn-ghost {
          background: #f7f7f7;
          color: #333;
          border: 1px solid #e8e8e8;
        }
        .ci-btn-ghost:hover {
          background: #efefef;
          border-color: #d0d0d0;
        }
        .ci-btn svg {
          width: 15px;
          height: 15px;
          stroke-width: 1.8px;
          flex-shrink: 0;
        }
        .ci-btn-divider {
          width: 1px;
          height: 22px;
          background: #e8e8e8;
          margin: 0 2px;
        }

        /* ── Preview section ── */
        .ci-preview-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          overflow: hidden;
        }
        .ci-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
        }
        .ci-preview-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #888;
        }
        .ci-preview-body {
          padding: 2rem;
        }

        /* ── Empty state ── */
        .ci-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 4rem 2rem;
          background: #fafafa;
          border: 1px dashed #e0e0e0;
          border-radius: 16px;
          text-align: center;
        }
        .ci-empty-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f3ede0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b8922a;
        }
        .ci-empty-text {
          font-size: 13px;
          color: #aaa;
          max-width: 240px;
          line-height: 1.6;
        }

        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="ci-page">

        {/* ── Hero Header ── */}
        <div className="ci-hero no-print">
          <div className="ci-hero-left">
            <div className="ci-eyebrow">
              <span className="ci-eyebrow-dot" />
              NGJA Invoice Engine
            </div>
            <h1 className="ci-title">Create Export Invoice</h1>
            <p className="ci-subtitle">
              Select a category to load the correct invoice template
            </p>
          </div>
          {invoiceNumber && (
            <div className="ci-invoice-badge">
              <span className="ci-invoice-badge-label">Invoice No.</span>
              <span className="ci-invoice-badge-number">{invoiceNumber}</span>
            </div>
          )}
        </div>

        {/* ── Step indicator ── */}
        <div className="ci-steps no-print">
          <div className="ci-step">
            <div className={`ci-step-circle ${category ? 'done' : 'active'}`}>
              {category ? '✓' : '1'}
            </div>
            <span className={`ci-step-label ${!category ? 'active' : ''}`}>
              Select Category
            </span>
          </div>
          <div className="ci-step-divider" />
          <div className="ci-step">
            <div className={`ci-step-circle ${formReady ? 'done' : category ? 'active' : 'idle'}`}>
              {formReady ? '✓' : '2'}
            </div>
            <span className={`ci-step-label ${category && !formReady ? 'active' : ''}`}>
              Fill Details
            </span>
          </div>
          <div className="ci-step-divider" />
          <div className="ci-step">
            <div className={`ci-step-circle ${preview ? 'done' : 'idle'}`}>
              {preview ? '✓' : '3'}
            </div>
            <span className="ci-step-label">Review & Submit</span>
          </div>
        </div>

        {/* ── Category Selection Card ── */}
        <div className="ci-card no-print">
          <div className="ci-card-header">
            <span className="ci-card-title">Invoice Category</span>
            <div className="ci-card-accent" />
          </div>
          <div className="ci-selector-grid">
            <CategorySelector
              categories={categories}
              value={category}
              onChange={setCategory}
            />
            <SubCategorySelector
              subCategories={subCategories}
              value={subCategory}
              onChange={setSubCategory}
            />
          </div>

          {loadingConfig && (
            <div className="ci-loading">
              <div className="ci-loading-dot" />
              <div className="ci-loading-dot" />
              <div className="ci-loading-dot" />
              <span className="ci-loading-text">Loading invoice configuration…</span>
            </div>
          )}
        </div>

        {/* ── Template form ── */}
        {formReady ? (
          <form
            className="flex flex-col gap-0"
            onSubmit={(event) => event.preventDefault()}
          >
            <TemplateEngine
              templateConfig={templateConfig}
              invoiceNumber={invoiceNumber}
              register={register}
              control={control}
              watch={watch}
              setValue={setValue}
              onLogoUpload={handleLogoUpload}
              uploadingLogo={uploadingLogo}
            />

            {/* ── Action Bar ── */}
            <div className="ci-action-bar no-print" style={{ marginTop: '1.5rem' }}>
              <div className="ci-action-group">
                <button
                  type="button"
                  className="ci-btn ci-btn-ghost"
                  onClick={() => handleSave('draft')}
                >
                  <Save />
                  Save Draft
                </button>
                <button
                  type="button"
                  className="ci-btn ci-btn-primary"
                  onClick={() => handleSave('submitted')}
                >
                  <Save />
                  Submit Invoice
                </button>
              </div>

              <div className="ci-btn-divider" />

              <div className="ci-action-group">
                <button
                  type="button"
                  className="ci-btn ci-btn-ghost"
                  onClick={handlePreview}
                >
                  <Eye />
                  Preview
                </button>
                <button
                  type="button"
                  className="ci-btn ci-btn-gold"
                  onClick={exportPdf}
                >
                  <Download />
                  Export PDF
                </button>
                <button
                  type="button"
                  className="ci-btn ci-btn-ghost"
                  onClick={() => {
                    if (!preview) {
                      handlePreview()
                      return
                    }
                    window.print()
                  }}
                >
                  <Eye />
                  Print
                </button>
              </div>
            </div>
          </form>
        ) : (
          !loadingConfig && category && (
            <div className="ci-empty no-print">
              <div className="ci-empty-icon">
                <FileText size={20} />
              </div>
              <p className="ci-empty-text">
                Select a sub-category above to load the invoice template
              </p>
            </div>
          )
        )}

        {/* ── Preview panel ── */}
        {preview ? (
          <div className="ci-preview-card">
            <div className="ci-preview-header no-print">
              <span className="ci-preview-title">Invoice Preview</span>
              <button
                type="button"
                className="ci-btn ci-btn-gold"
                style={{ height: 32, fontSize: 12 }}
                onClick={exportPdf}
              >
                <Download />
                Export PDF
              </button>
            </div>
            <div className="ci-preview-body">
              <InvoicePreview preview={preview} />
            </div>
          </div>
        ) : null}

      </div>
    </>
  )
}

export default CreateInvoice