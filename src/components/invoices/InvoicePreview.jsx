import { forwardRef } from 'react'

const formatLabel = (value = '') =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const formatValue = (value) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return `${value.length} item(s)`
  return String(value)
}

const renderTable = (rows = []) => {
  if (!rows.length) return null
  const columns = Object.keys(rows[0] || {})
  if (!columns.length) return null

  return (
    <table className="invoice-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{formatLabel(column)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {columns.map((column) => (
              <td key={`${rowIndex}-${column}`}>{formatValue(row?.[column])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const renderSectionData = (sectionKey, data) => {
  const sectionData = data?.[sectionKey]
  if (!sectionData) return null

  if (Array.isArray(sectionData)) {
    return renderTable(sectionData)
  }

  const entries = Object.entries(sectionData)
  const arrayEntry = entries.find(([, value]) => Array.isArray(value))
  const hasArray = Boolean(arrayEntry)

  return (
    <>
      {!hasArray && (
        <div className="invoice-kv-grid">
          {entries.map(([key, value]) => (
            <div key={`${sectionKey}-${key}`} className="flex items-center justify-between">
              <span className="invoice-kv-label">{formatLabel(key)}</span>
              <span className="invoice-kv-value">{formatValue(value)}</span>
            </div>
          ))}
        </div>
      )}
      {hasArray && renderTable(arrayEntry?.[1])}
    </>
  )
}

const InvoicePreview = forwardRef(({ preview }, ref) => {
  if (!preview) return null

  const meta = preview.meta || {}
  const data = preview.data || {}

  return (
    <div ref={ref} className="print-sheet mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="invoice-doc-subtitle">NGJA Export Invoice</p>
          <h2 className="invoice-doc-title">
            {meta.invoiceNumber || 'Pending Invoice'}
          </h2>
          <p className="text-sm text-ink-500">
            {meta.category || 'Category'}
            {meta.subCategory ? ` • ${meta.subCategory}` : ''}
          </p>
        </div>
        <div className="invoice-meta-grid">
          <div className="invoice-meta-card">
            <p className="invoice-meta-label">Template</p>
            <p className="invoice-meta-value">{meta.templateKey || 'N/A'}</p>
          </div>
          <div className="invoice-meta-card">
            <p className="invoice-meta-label">Version</p>
            <p className="invoice-meta-value">{meta.templateVersion || '1.0'}</p>
          </div>
          <div className="invoice-meta-card">
            <p className="invoice-meta-label">Issued</p>
            <p className="invoice-meta-value">{data?.invoiceMeta?.invoiceDate || '—'}</p>
          </div>
          <div className="invoice-meta-card">
            <p className="invoice-meta-label">Export Type</p>
            <p className="invoice-meta-value">{data?.invoiceMeta?.exportType || '—'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {preview.sections?.map((section) => (
          <div key={section.key} className="invoice-section">
            <p className="invoice-section-title">{section.label}</p>
            <div className="mt-3">{renderSectionData(section.key, data)}</div>
          </div>
        ))}
      </div>
    </div>
  )
})

InvoicePreview.displayName = 'InvoicePreview'

export default InvoicePreview
