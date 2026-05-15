import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Download, Eye, Save } from 'lucide-react'
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
        message: status === 'draft'
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
      const data = preview || (await invoiceService.preview(buildPayload('draft')))
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
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6 no-print">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          NGJA Invoice Engine
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-ink-900">
          Create Export Invoice
        </h3>
        <p className="mt-2 text-sm text-ink-600">
          Select category and sub category to load the correct invoice template.
        </p>
      </div>

      <div className="surface-card rounded-2xl border px-6 py-6 no-print">
        <div className="grid gap-4 md:grid-cols-2">
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
        {loadingConfig ? (
          <p className="mt-4 text-sm text-ink-600">Loading invoice configuration...</p>
        ) : null}
      </div>

      {formReady ? (
        <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
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

          <div className="flex flex-wrap gap-3 no-print">
            <Button variant="secondary" onClick={() => handleSave('draft')}>
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave('submitted')}>
              <Save className="h-4 w-4" />
              Submit Invoice
            </Button>
            <Button variant="secondary" onClick={handlePreview}>
              <Eye className="h-4 w-4" />
              Generate Preview
            </Button>
            <Button variant="secondary" onClick={exportPdf}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!preview) {
                  handlePreview()
                  return
                }
                window.print()
              }}
            >
              <Eye className="h-4 w-4" />
              Print Preview
            </Button>
          </div>
        </form>
      ) : null}

      {preview ? (
        <div className="surface-card rounded-2xl border px-6 py-6">
          <InvoicePreview preview={preview} />
        </div>
      ) : null}
    </div>
  )
}

export default CreateInvoice
