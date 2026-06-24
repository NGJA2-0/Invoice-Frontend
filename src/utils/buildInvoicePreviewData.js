// src/utils/buildInvoicePreviewData.js

// Maps invoice.data keys to display labels used by InvoicePreview's section renderer.
// Order here determines render order (narrow sections render in this order, wide too).
const SECTION_LABELS = {
  receiverInfo: 'TO',
  senderInfo: 'FROM',
  deliveryInfo: 'Delivery Type',
  carrierDetails: 'Carrier Details',
  niDetails: 'NI Details',
  valuationTable: 'Valuation',
  exchangeRateSection: 'Exchange Rates',
}

const SECTION_ORDER = [
  'receiverInfo',
  'senderInfo',
  'deliveryInfo',
  'carrierDetails',
  'niDetails',
  'valuationTable',
  'exchangeRateSection',
]

// Section keys whose "emptiness" is judged by whether they contain any
// non-empty scalar field (KVGrid-style sections). Table-style sections
// (valuationTable, exchangeRateSection) are checked separately below.
const KV_SECTION_KEYS = ['receiverInfo', 'senderInfo', 'deliveryInfo', 'carrierDetails', 'niDetails']

const isEmptyVal = (v) => v === null || v === undefined || v === ''

const hasContent = (key, sectionData) => {
  if (!sectionData) return false

  if (key === 'valuationTable') {
    const items = sectionData.valuationItems || sectionData.items || []
    return items.length > 0
  }

  if (key === 'exchangeRateSection') {
    return Object.values(sectionData).some((v) => !isEmptyVal(v))
  }

  if (KV_SECTION_KEYS.includes(key)) {
    return Object.entries(sectionData)
      .filter(([k]) => k !== 'logoUrl')
      .some(([, v]) => !isEmptyVal(v))
  }

  // Fallback: any non-empty field at all
  return Object.values(sectionData).some((v) => !isEmptyVal(v))
}

export const buildInvoicePreviewData = (invoice) => {
  if (!invoice) return null

  const data = invoice.data || {}
  const companyHeader = data.companyHeader || {}
  const invoiceMeta = data.invoiceMeta || {}

  const meta = {
    templateKey: invoice.templateKey,
    category: invoice.category,
    subCategory: invoice.subCategory,
    companyName: companyHeader.companyName,
    invoiceNumber: invoice.invoiceNumber || invoiceMeta.invoiceNumber,
  }

  const sections = SECTION_ORDER
    .filter((key) => hasContent(key, data[key]))
    .map((key) => ({ key, label: SECTION_LABELS[key] }))

  return { meta, data, sections }
}