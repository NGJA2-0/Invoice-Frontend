import { useEffect, useMemo, useRef, useState } from 'react'
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
    logoUrl: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
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
    selectedCurrency: '',
  },
})

const normalizeOptions = (items) => {
  if (!items) return []
  if (!Array.isArray(items)) {
    if (Array.isArray(items.items)) return normalizeOptions(items.items)
    if (Array.isArray(items.data)) return normalizeOptions(items.data)
    return []
  }

  return items
    .map((item) => {
      if (typeof item === 'string') {
        return { name: item, value: item }
      }
      if (!item) return null
      const name = item.name ?? item.label ?? item.value
      if (!name) return null
      return {
        ...item,
        name,
        value: item.value ?? item.name ?? item.label,
      }
    })
    .filter(Boolean)
}

const CreateInvoice = () => {
  const { userStatus, user, createInvoice, pushToast } = useApp()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [category, setCategory] = useState(() => sessionStorage.getItem('ci_category') || '')
  const [subCategory, setSubCategory] = useState(() => sessionStorage.getItem('ci_subCategory') || '')
  const [templateConfig, setTemplateConfig] = useState(null)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [preview, setPreview] = useState(null)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [businessProfile, setBusinessProfile] = useState(null)
  const previewRef = useRef(null)
  const isRestoringRef = useRef(false)
  const blockSaveRef = useRef(false)
  const [showDraftConfirm, setShowDraftConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('ci_category', category)
  }, [category])

  useEffect(() => {
    sessionStorage.setItem('ci_subCategory', subCategory)
  }, [subCategory])

  const form = useForm({
    defaultValues: {
      invoiceData: buildDefaultInvoiceData(),
    },
  })

  const { register, control, watch, setValue, getValues, reset } = form

  // Watch all values and persist to sessionStorage
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (blockSaveRef.current) return
      sessionStorage.setItem('ci_invoiceData', JSON.stringify(values))
    })
    return () => subscription.unsubscribe()
  }, [form])

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

  const validateFormComplete = (action = 'viewing the preview') => {
    const showMissingToast = (fieldLabel) => {
      pushToast({
        title: 'Incomplete form',
        message: fieldLabel
          ? `"${fieldLabel}" is required. Please fill it before ${action}.`
          : `Some fields are missing. Please fill all required fields before ${action}.`,
        tone: 'danger',
      })
    }

    if (!category) {
      showMissingToast('Category')
      return false
    }
    if (subCategories.length > 0 && !subCategory) return showMissingToast('Sub-Category'), false

    const invoiceData = getValues('invoiceData')
    console.log(invoiceData)

    const exchange = invoiceData?.exchangeRateSection || {}

    if (!exchange.selectedCurrency) {
      showMissingToast('Currency (in Valuation Table)')
      return false
    }

    // otherCurrencyCode is set by ValuationTable whenever a non-USD currency
    // is active — it's the reliable source of truth for which set of
    // freight/insurance fields is actually being shown to the user.
    const usingOtherCurrency = !!exchange.otherCurrencyCode

    const freightValue = usingOtherCurrency ? exchange.freightOther : exchange.freight
    const insuranceValue = usingOtherCurrency ? exchange.insuranceOther : exchange.insurance

    const isBlank = (v) =>
      v === undefined || v === null || String(v).trim() === '' || Number.isNaN(Number(v))

    if (isBlank(freightValue)) {
      showMissingToast(usingOtherCurrency ? `Freight (${exchange.selectedCurrency})` : 'Freight')
      return false
    }

    if (isBlank(insuranceValue)) {
      showMissingToast(usingOtherCurrency ? `Insurance (${exchange.selectedCurrency})` : 'Insurance')
      return false
    }

    const invDate = invoiceData?.invoiceMeta?.invoiceDate
    const todayStr = new Date().toISOString().split('T')[0]

    if (!invDate) return showMissingToast('Invoice Date'), false
    if (invDate < todayStr) {
      pushToast({ title: 'Invalid invoice date', message: 'Invoice date cannot be in the past. Please select today or a future date.', tone: 'danger' })
      return false
    }

    const HIDDEN_SECTION_KEYS = ['exchangeRateSection', 'cifSummary', 'senderInfo']
    const SKIP_FIELDS = new Set([
      'invoiceMeta.exportType',
      'companyHeader.logoUrl',
      'companyHeader.companyWebsite',
      'companyHeader.companyEmail',
      'receiverInfo.receiverContact',
      'invoiceMeta.remarks',
    ])

    for (const section of templateConfig?.sections || []) {
      if (HIDDEN_SECTION_KEYS.includes(section.key)) continue

      const DEFAULT_VALUATION_COLUMNS = [
        { key: 'itemNo', label: 'Item No' },
        { key: 'itemType', label: 'Item Type' },
        { key: 'description', label: 'Description of Goods' },
        { key: 'noOfPcs', label: 'No of Pcs' },
        { key: 'unitType', label: 'Unit Type' },
        { key: 'weight', label: 'Weight' },
        { key: 'weightUnit', label: 'Weight Unit' },
        { key: 'ratePer', label: 'Rate Per' },
        { key: 'rateUnit', label: 'Rate Unit' },
        { key: 'amount', label: 'Amount', readOnly: true },
      ]

      const isValueMissing = (val) => {
        if (val === undefined || val === null) return true
        if (typeof val === 'number') return Number.isNaN(val)
        if (typeof val === 'string') return val.trim() === ''
        return false
      }


      if (section.table || section.key === 'valuationTable' || section.sectionType === 'table') {
        const tableKey = section.table?.key || 'valuationItems'
        const items = invoiceData?.[section.key]?.[tableKey] || []
        if (!items.length) return showMissingToast(`${section.label} — at least one item`), false

        const columns =
          section.table?.columns ||
          (section.key === 'valuationTable' ? DEFAULT_VALUATION_COLUMNS : [])

        for (let rowIndex = 0; rowIndex < items.length; rowIndex++) {
          const item = items[rowIndex]
          for (const col of columns) {
            if (col.readOnly || col.dataType === 'computed' || col.key === 'itemNo') continue
            const val = item?.[col.key]
            if (isValueMissing(val)) {
              return showMissingToast(`${col.label} (Item ${rowIndex + 1} in ${section.label})`), false
            }
          }
        }
        continue
      }

      if (section.conditional) {
        const fieldPath = section.conditional.field.split('.')
        let value = invoiceData
        for (const key of fieldPath) value = value?.[key]
        if (value !== section.conditional.equals) continue
      }

      for (const field of section.fields || []) {
        if (SKIP_FIELDS.has(`${section.key}.${field.key}`)) continue
        if (!field.required) continue
        const val = invoiceData?.[section.key]?.[field.key]
        if (val === undefined || val === null || val === '') return showMissingToast(`${field.label} (${section.label})`), false
      }
    }

    return true
  }


  const handleNewInvoice = () => {
    sessionStorage.removeItem('ci_invoiceData')
    sessionStorage.removeItem('ci_category')
    sessionStorage.removeItem('ci_subCategory')
    setCategory('')
    setSubCategory('')
    setTemplateConfig(null)
    setPreview(null)
    reset({ invoiceData: buildDefaultInvoiceData() })
  }

  useEffect(() => {
    if (userStatus !== 'approved') {
      navigate('/user/dealer-registration')
    }
  }, [userStatus, navigate])

  useEffect(() => {
    let cancelled = false
    const loadCategories = async () => {
      try {
        const data = await invoiceService.getCategories()
        if (!cancelled) setCategories(normalizeOptions(data))
      } catch (error) {
        if (!cancelled) pushToast({ title: 'Unable to load categories', message: error.message || 'Please try again.', tone: 'danger' })
      }
    }
    loadCategories()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const loadBusinessProfile = async () => {
      if (!user?.id) return
      try {
        const res = await invoiceService.getBusinessProfile(user.id)
        if (res) {
          setBusinessProfile(res)
        }
      } catch (error) {
        // silently fail — fields will just be empty
      }
    }
    loadBusinessProfile()
  }, [user?.id])

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

  const [subCategoriesLoaded, setSubCategoriesLoaded] = useState(false)

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!category) {
        setSubCategories([])
        setSubCategory('')
        setTemplateConfig(null)
        setSubCategoriesLoaded(false)
        return
      }

      const hasSaved = !!sessionStorage.getItem('ci_invoiceData')  // CHECK BEFORE ASYNC

      try {
        const data = await invoiceService.getSubCategories(category)
        const normalized = normalizeOptions(data)
        setSubCategories(normalized)
        setSubCategoriesLoaded(true)
        const autoSelected = normalized.length === 1 ? normalized[0].value : ''

        setSubCategory(prev => sessionStorage.getItem('ci_subCategory') || autoSelected)
        setTemplateConfig(null)

        if (!hasSaved) {
          const defaults = buildDefaultInvoiceData()
          if (businessProfile) {
            defaults.companyHeader.companyName = businessProfile.businessName || ''
            defaults.companyHeader.companyAddress = businessProfile.businessAddress || ''
            defaults.companyHeader.companyPhone = (businessProfile.mobileNumbers || [])[0] || ''
            defaults.companyHeader.tin = businessProfile.tin || ''
            defaults.companyHeader.stockValueName = businessProfile.stockValueName || ''
          }
          blockSaveRef.current = true
          reset({ invoiceData: defaults })
          setTimeout(() => { blockSaveRef.current = false }, 100)
        } else {
          blockSaveRef.current = true   // block saving while we restore
          isRestoringRef.current = true
        }

      } catch (error) {
        setSubCategories([])
        setSubCategoriesLoaded(true)
      }
    }
    loadSubCategories()
  }, [category, reset, businessProfile])

  useEffect(() => {
    const shouldLoad = category && subCategoriesLoaded && (subCategory || subCategories.length === 0)
    if (!shouldLoad) {
      setTemplateConfig(null)
      return
    }

    const loadTemplate = async () => {
      setLoadingConfig(true)
      try {
        const templateResolution = await invoiceService.resolveTemplate({
          category,
          subCategory,
        })

        const templateKey =
          templateResolution?.key ||
          templateResolution?.templateKey ||
          templateResolution?.template?.key

        if (!templateKey) {
          throw new Error('Unable to determine template for this category')
        }

        const templateStructure = await invoiceService.getTemplate(templateKey)
        setTemplateConfig(templateStructure)
      } catch (error) {
        pushToast({
          title: 'Unable to load template',
          message: error.message || 'Please try again.',
          tone: 'danger',
        })
        setTemplateConfig(null)
      } finally {
        setLoadingConfig(false)
      }
    }
    loadTemplate()
  }, [category, subCategory, subCategories.length, subCategoriesLoaded])

  // Re-apply business profile values whenever template config becomes available
  useEffect(() => {
    if (!templateConfig) return

    const saved = sessionStorage.getItem('ci_invoiceData')
    console.log(sessionStorage.getItem('ci_invoiceData'))
    if (isRestoringRef.current && saved) {
      try {
        const parsed = JSON.parse(saved)
        reset(parsed)
      } catch (_) { }
      isRestoringRef.current = false
    }

    // Business profile always wins for locked fields
    if (businessProfile) {
      setValue('invoiceData.companyHeader.companyName', businessProfile.businessName || '', { shouldValidate: false })
      setValue('invoiceData.companyHeader.companyAddress', businessProfile.businessAddress || '', { shouldValidate: false })
      setValue('invoiceData.companyHeader.companyPhone', (businessProfile.mobileNumbers || [])[0] || '', { shouldValidate: false })
      setValue('invoiceData.companyHeader.tin', businessProfile.tin || '', { shouldValidate: false })
      setValue('invoiceData.companyHeader.stockValueName', businessProfile.stockValueName || '', { shouldValidate: false })
    }

    // Unblock saving now that restore + profile overrides are done
    setTimeout(() => { blockSaveRef.current = false }, 100)

  }, [templateConfig, businessProfile, setValue])

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

  const buildPayload = (status) => {
    const invoiceData = getValues('invoiceData')

    const invDate = invoiceData?.invoiceMeta?.invoiceDate
    if (businessProfile?.tin) {
      invoiceData.companyHeader.tin = businessProfile.tin
    }
    return {
      category,
      subCategory: subCategory || undefined,
      invoiceData,
      status,
      createdBy: user?.id || '',
    }
  }

  const handlePreview = async () => {
    console.log("Preview clicked");

    if (!formReady || !ensureTemplate3NiDetails()) return
    console.log("Calling validation");

    if (!validateFormComplete('viewing the preview')) return
    console.log("Validation passed");
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
    if (!ensureTemplate3NiDetails()) return false
    if (!validateFormComplete(status === 'draft' ? 'saving as draft' : 'submitting the invoice')) return false
    if (!user?.id) {
      pushToast({
        title: 'Missing user profile',
        message: 'Please login again to continue.',
        tone: 'danger',
      })
      return false
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
      return true
    } catch (error) {
      pushToast({
        title: 'Submission failed',
        message: error.message || 'Unable to submit invoice.',
        tone: 'danger',
      })
      return false
    }
  }

  const confirmSaveDraft = async () => {
    setShowDraftConfirm(false)
    await handleSave('draft')
  }

  const confirmSubmitInvoice = async () => {
    setShowSubmitConfirm(false)
    const success = await handleSave('submitted')
    if (success) {
      handleNewInvoice()
      try {
        const nextNumber = await invoiceService.generateNumber()
        setInvoiceNumber(nextNumber?.invoiceNumber || '')
      } catch (error) {
        setInvoiceNumber('')
      }
    }
  }

  const ensurePreviewData = async () => {
    if (!ensureTemplate3NiDetails()) {
      throw new Error('Missing required NI details.')
    }
    if (preview) return preview
    const data = await invoiceService.preview(buildPayload('draft'))
    setPreview(data)
    return data
  }

  const waitForPreviewPaint = () =>
    new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    )

  const exportPdf = async () => {
    try {
      const data = await ensurePreviewData()
      await waitForPreviewPaint()

      const target = previewRef.current
      if (!target) {
        throw new Error('Preview is not ready yet. Please try again.')
      }

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 32
      const { width, height } = target.getBoundingClientRect()
      const scale = Math.min(
        1,
        (pageWidth - margin * 2) / width,
        (pageHeight - margin * 2) / height,
      )

      await new Promise((resolve) => {
        doc.html(target, {
          x: margin,
          y: margin,
          html2canvas: {
            scale,
            backgroundColor: '#ffffff',
          },
          windowWidth: target.scrollWidth,
          callback: (renderedDoc) => {
            renderedDoc.save(`${data?.meta?.invoiceNumber || 'invoice'}.pdf`)
            resolve()
          },
        })
      })
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
        @media (max-width: 640px) {
          .ci-page {
            padding: 0.75rem;
            padding-top: 0.5rem;    /* reduce top breathing room */
            min-height: unset;      /* don't force full vh if shell adds its own */
          }
        }
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
          padding: 1.75rem 2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          margin-bottom: 1rem;
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
          margin-bottom: 1.5rem;
          padding: 1rem 2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
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
        /* ── Draft confirm modal ── */
        .ci-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 15, 15, 0.45);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .ci-modal {
          background: #fff;
          border-radius: 16px;
          padding: 1.75rem;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
        }
        .ci-modal-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f0f0f;
          margin: 0 0 0.6rem;
        }
        .ci-modal-text {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 1.5rem;
        }
        .ci-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        /* ── Invoice preview sheet ── */
        .print-sheet {
          background: linear-gradient(180deg, #fffdfa 0%, #ffffff 45%, #fff9f1 100%);
          border: 1px solid #eee2c8;
          border-radius: 22px;
          padding: 2.5rem;
          box-shadow: 0 28px 80px rgba(15, 15, 15, 0.1);
        }
        .invoice-doc-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #121212;
        }
        .invoice-doc-subtitle {
          font-size: 12px;
          color: #8c8c8c;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .invoice-logo {
          width: 120px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 0.4rem;
        }
        .invoice-logo img {
          max-width: 100%;
          max-height: 48px;
          object-fit: contain;
        }
        .invoice-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem 1.5rem;
        }
        .invoice-meta-card {
          border: 1px solid #f0e6d2;
          border-radius: 14px;
          padding: 0.9rem 1rem;
          background: #fffaf1;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        .invoice-meta-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #b8922a;
          font-weight: 600;
        }
        .invoice-meta-value {
          margin-top: 0.35rem;
          font-size: 12px;
          color: #2c2c2c;
          font-weight: 500;
        }
        .invoice-section {
          border: 1px solid #f3ead7;
          border-radius: 16px;
          padding: 1.1rem 1.4rem;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(24, 24, 24, 0.04);
        }
        .invoice-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #b8922a;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f4ead8;
        }
        .invoice-kv-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.6rem 1.25rem;
          margin-top: 0.9rem;
          font-size: 11.5px;
        }
        .invoice-kv-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.35rem 0.5rem;
          border-radius: 10px;
          background: #fffdf8;
          border: 1px solid #f6efe2;
        }
        .invoice-kv-label {
          color: #8a8a8a;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-size: 10px;
        }
        .invoice-kv-value {
          text-align: right;
          color: #1f1f1f;
          font-weight: 600;
        }
        .invoice-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 0.9rem;
          font-size: 10px;
          border: 1px solid #f0e7d5;
          border-radius: 12px;
          overflow: hidden;
        }
        .invoice-table th,
        .invoice-table td {
          border-bottom: 1px solid #f0e7d5;
          padding: 8px 10px;
          text-align: left;
        }
        .invoice-table th:not(:first-child),
        .invoice-table td:not(:first-child) {
          border-left: 1px solid #f4ead8;
        }
        .invoice-table-head th {
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9b9b9b;
          background: #fffaf1;
        }
        .invoice-table-row:nth-child(even) td {
          background: #fffdfa;
        }
        .invoice-table-total td {
          font-weight: 700;
          background: #fff7eb;
        }
        .invoice-summary-grid {
          margin-top: 0.8rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.6rem;
        }
        .invoice-summary-grid div {
          border: 1px solid #f0e7d5;
          border-radius: 12px;
          padding: 0.6rem 0.75rem;
          background: #fffaf1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .invoice-summary-label {
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #b8922a;
          font-weight: 700;
        }
        .invoice-summary-value {
          font-size: 12px;
          font-weight: 700;
          color: #1f1f1f;
        }
        .invoice-block {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (max-width: 768px) {
          .invoice-meta-grid,
          .invoice-kv-grid,
          .invoice-summary-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          .print-sheet {
            box-shadow: none;
            border: 1px solid #e7dcc6;
            padding: 1.5rem;
          }
          .invoice-doc-title { font-size: 18px; }
          .invoice-kv-grid,
          .invoice-table { font-size: 10px; }
          .no-print { display: none !important; }
        }
          /* ── Mobile overrides — add at the bottom of the existing <style> string ── */
        @media (max-width: 640px) {
          .ci-page {
            padding: 1rem;       /* was 2rem 2.5rem — too wide for mobile */
          }
          .ci-hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1.25rem 1rem;
          }
            .ci-title {
            font-size: 1.5rem;   /* was 2rem */
          }
          .ci-invoice-badge {
            align-items: flex-start;
          }
          .ci-steps {
            padding: 0.875rem 1rem;
            overflow-x: auto;
            flex-wrap: nowrap;
          }
          .ci-step-label {
            font-size: 11px;
          }
          .ci-step-divider {
            width: 20px;
            flex-shrink: 0;
          }
          .ci-card {
            padding: 1.25rem 1rem;
          }
            .ci-action-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
          }
          .ci-action-group {
            justify-content: stretch;
          }
          .ci-action-group .ci-btn {
            flex: 1;
            justify-content: center;
          }
          .ci-btn-divider {
            display: none;
          }
          .ci-preview-header {
            padding: 1rem;
          }
          .ci-preview-body {
            padding: 1rem 0.5rem;
            overflow-x: auto;   /* invoice preview is A4-width, let it scroll */
          }
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

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ci-btn ci-btn-ghost"
              onClick={() => navigate('/user/draft-invoices')}
            >
              View Drafts
            </button>
            <button
              type="button"
              className="ci-btn ci-btn-ghost"
              onClick={handleNewInvoice}
            >
              + Create New Invoice
            </button>
          </div>
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
              businessProfile={businessProfile}
              pushToast={pushToast}
            />

            {/* ── Action Bar ── */}
            <div className="ci-action-bar no-print" style={{ marginTop: '1.5rem' }}>
              <div className="ci-action-group">
                <button
                  type="button"
                  className="ci-btn ci-btn-ghost"
                  onClick={() => setShowDraftConfirm(true)}
                >
                  <Save />
                  Save Draft
                </button>
                <button
                  type="button"
                  className="ci-btn ci-btn-primary"
                  onClick={() => setShowSubmitConfirm(true)}
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

                {/* <button
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
                </button> */}
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
                {subCategories.length > 0
                  ? 'Select a sub-category above to load the invoice template'
                  : 'Loading invoice template…'}
              </p>
            </div>
          )
        )}

        {/* ── Preview panel ── */}
        {preview ? (
          <div className="ci-preview-card">
            <div className="ci-preview-header no-print">
              <span className="ci-preview-title">Invoice Preview</span>

            </div>
            <div className="ci-preview-body">
              <InvoicePreview
                ref={previewRef}
                preview={preview}
              />
            </div>
          </div>
        ) : null}

        {/* ── Draft confirmation modal ── */}
        {showDraftConfirm && (
          <div className="ci-modal-overlay no-print" onClick={() => setShowDraftConfirm(false)}>
            <div className="ci-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="ci-modal-title">Save as Draft?</h3>
              <p className="ci-modal-text">
                Do you really want to send this invoice to draft? Once saved,
                you won't be able to edit it later — you'll only be able to
                resubmit it.
              </p>
              <div className="ci-modal-actions">
                <button
                  type="button"
                  className="ci-btn ci-btn-ghost"
                  onClick={() => setShowDraftConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ci-btn ci-btn-gold"
                  onClick={confirmSaveDraft}
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Submit confirmation modal ── */}
        {showSubmitConfirm && (
          <div className="ci-modal-overlay no-print" onClick={() => setShowSubmitConfirm(false)}>
            <div className="ci-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="ci-modal-title">Submit Invoice?</h3>
              <p className="ci-modal-text">
                Do you really want to submit this invoice? Once submitted, you'll
                need to wait for admin approval before you can use it, and you
                will no longer be able to edit it.
              </p>
              <div className="ci-modal-actions">
                <button
                  type="button"
                  className="ci-btn ci-btn-ghost"
                  onClick={() => setShowSubmitConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ci-btn ci-btn-gold"
                  onClick={confirmSubmitInvoice}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default CreateInvoice