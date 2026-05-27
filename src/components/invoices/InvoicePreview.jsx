import { forwardRef } from 'react'

const formatLabel = (value = '') =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—'
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
      <thead className="invoice-table-head">
        <tr>
          {columns.map((column) => (
            <th key={column}>{formatLabel(column)}</th>
          ))}
        </tr>
      </thead>
      <tbody className="invoice-table-body">
        {rows.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`} className="invoice-table-row">
            {columns.map((column) => (
              <td key={`${rowIndex}-${column}`}>{formatValue(row?.[column])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const renderValuationSection = (data) => {
  const valuation = data?.valuationTable || data?.valuation || {}
  const items = valuation?.valuationItems || valuation?.items || []
  if (!items.length) return null

  const pickValue = (item, keys) => {
    for (const key of keys) {
      const value = item?.[key]
      if (value !== null && value !== undefined && value !== '') return value
    }
    return ''
  }

  const totals = items.reduce(
    (acc, item) => {
      const pieces = Number(pickValue(item, ['numberOfPieces', 'noOfPcs', 'noOfPieces', 'numberOfPcs', 'quantity', 'qty', 'pcs', 'No of Pcs', 'No Of Pcs'])) || 0
      const weight = Number(pickValue(item, ['weight'])) || 0
      const amount = Number(pickValue(item, ['amount', 'totalUsd', 'total'])) || 0
      acc.totalPieces += pieces
      acc.totalWeight += weight
      acc.totalAmount += amount
      return acc
    },
    { totalPieces: 0, totalWeight: 0, totalAmount: 0 },
  )

  const totalPiecesValue =
    Number(pickValue(valuation, ['totalPieces', 'totalPcs', 'totalPiecesValue', 'Total Pieces'])) ||
    totals.totalPieces
  const totalWeightValue =
    Number(pickValue(valuation, ['totalWeight', 'totalWeightValue', 'Total Weight'])) ||
    totals.totalWeight
  const totalAmountValue =
    Number(pickValue(valuation, ['totalAmount', 'totalAmountUsd', 'totalUsd', 'Total Amount (USD)'])) ||
    totals.totalAmount

  return (
    <div className="invoice-block">
      <table className="invoice-table">
        <thead className="invoice-table-head">
          <tr>
            <th>Item No</th>
            <th>Item Type</th>
            <th>Description of Goods</th>
            <th>No of Pcs</th>
            <th>Unit</th>
            <th>Weight</th>
            <th>Weight Unit</th>
            <th>Rate Per</th>
            <th>Rate Unit</th>
            <th>Amount (USD)</th>
          </tr>
        </thead>
        <tbody className="invoice-table-body">
          {items.map((item, index) => (
            <tr key={`valuation-${index}`} className="invoice-table-row">
              <td>{formatValue(pickValue(item, ['itemNo', 'itemNumber', 'no']))}</td>
              <td>{formatValue(pickValue(item, ['itemType', 'type', 'stoneType']))}</td>
              <td>{formatValue(pickValue(item, ['description', 'descriptionOfGoods']))}</td>
              <td>{formatValue(pickValue(item, ['numberOfPieces', 'noOfPcs', 'noOfPieces', 'numberOfPcs', 'quantity', 'qty', 'pcs', 'No of Pcs', 'No Of Pcs']))}</td>
              <td>{formatValue(pickValue(item, ['piecesUnit', 'unitType', 'unit', 'pcsUnit', 'unitTypeLabel', 'Unit']))}</td>
              <td>{formatValue(pickValue(item, ['weight']))}</td>
              <td>{formatValue(pickValue(item, ['weightUnit', 'unitWeight']))}</td>
              <td>{formatValue(pickValue(item, ['ratePer', 'rate']))}</td>
              <td>{formatValue(pickValue(item, ['rateUnit', 'unitRate']))}</td>
              <td>{formatValue(pickValue(item, ['amount', 'totalUsd', 'total']))}</td>
            </tr>
          ))}
          <tr className="invoice-table-row invoice-table-total">
            <td><strong>Totals</strong></td>
            <td></td>
            <td></td>
              <td>{totalPiecesValue.toFixed(2)}</td>
            <td></td>
              <td>{totalWeightValue.toFixed(2)}</td>
            <td></td>
            <td></td>
            <td></td>
              <td>{totalAmountValue.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div className="invoice-summary-grid">
        <div>
          <span className="invoice-summary-label">Total Pieces</span>
          <span className="invoice-summary-value">{totalPiecesValue.toFixed(2)}</span>
        </div>
        <div>
          <span className="invoice-summary-label">Total Weight</span>
          <span className="invoice-summary-value">{totalWeightValue.toFixed(2)}</span>
        </div>
        <div>
          <span className="invoice-summary-label">Total Amount (USD)</span>
          <span className="invoice-summary-value">{totalAmountValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

const renderExchangeSummary = (data) => {
  const exchange = data?.exchangeRateSection || {}
  if (!exchange || Object.keys(exchange).length === 0) return null

  return (
    <table className="invoice-table">
      <thead className="invoice-table-head">
        <tr>
          <th>Description</th>
          <th>USD</th>
          <th>LKR</th>
        </tr>
      </thead>
      <tbody className="invoice-table-body">
        <tr className="invoice-table-row">
          <td>FOB</td>
          <td>{formatValue(exchange.fob)}</td>
          <td>{formatValue(exchange.exchangeRate ? Number(exchange.fob || 0) * Number(exchange.exchangeRate || 0) : '')}</td>
        </tr>
        <tr className="invoice-table-row">
          <td>Freight</td>
          <td>{formatValue(exchange.freight)}</td>
          <td>{formatValue(exchange.exchangeRate ? Number(exchange.freight || 0) * Number(exchange.exchangeRate || 0) : '')}</td>
        </tr>
        <tr className="invoice-table-row">
          <td>Insurance</td>
          <td>{formatValue(exchange.insurance)}</td>
          <td>{formatValue(exchange.exchangeRate ? Number(exchange.insurance || 0) * Number(exchange.exchangeRate || 0) : '')}</td>
        </tr>
        <tr className="invoice-table-row">
          <td>CIF</td>
          <td>{formatValue(exchange.cif)}</td>
          <td>{formatValue(exchange.cifLkr)}</td>
        </tr>
        <tr className="invoice-table-row">
          <td>Exchange Rate (1 USD)</td>
          <td>—</td>
          <td>{formatValue(exchange.exchangeRate)}</td>
        </tr>
      </tbody>
    </table>
  )
}

const renderSectionData = (sectionKey, data) => {
  if (sectionKey === 'valuationTable' || sectionKey === 'valuation') {
    return renderValuationSection(data)
  }

  if (sectionKey === 'exchangeRateSection' || sectionKey === 'exchangeRates') {
    return renderExchangeSummary(data)
  }

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
            <div key={`${sectionKey}-${key}`} className="invoice-kv-row">
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
  const data = preview.data?.invoiceData || preview.data || {}
  const invoiceMeta = data?.invoiceMeta || {}

  const sectionOverrides = {
    buyerInfo: { label: 'TO', dataKey: 'receiverInfo' },
    receiverInfo: { label: 'TO', dataKey: 'receiverInfo' },
    deliveryInfo: { label: 'FROM', dataKey: 'senderInfo' },
    senderInfo: { label: 'FROM', dataKey: 'senderInfo' },
    transportDetails: { label: 'Delivery Type', dataKey: 'deliveryInfo' },
  }

  const shouldHideSection = (section) => {
    const key = String(section?.key || '').toLowerCase()
    const label = String(section?.label || '').toLowerCase()
    return key.includes('cert') || key.includes('signature') || label.includes('cert') || label.includes('signature')
  }

  const previewSections = (preview.sections || []).filter((section) => !shouldHideSection(section))

  return (
    <div ref={ref} className="print-sheet mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {data?.companyHeader?.logoUrl ? (
            <div className="invoice-logo">
              <img src={data.companyHeader.logoUrl} alt="Company logo" />
            </div>
          ) : null}
          <p className="invoice-doc-subtitle">NGJA Export Invoice</p>
          <h2 className="invoice-doc-title">
            {meta.invoiceNumber || 'Pending Invoice'}
          </h2>
          <p className="text-sm text-ink-500">
            {meta.category || 'Category'}
            {meta.subCategory ? ` • ${meta.subCategory}` : ''}
          </p>
          <div className="invoice-kv-grid">
            <div className="invoice-kv-row">
              <span className="invoice-kv-label">Invoice Date</span>
              <span className="invoice-kv-value">{formatValue(invoiceMeta.invoiceDate)}</span>
            </div>
            <div className="invoice-kv-row">
              <span className="invoice-kv-label">Invoice No</span>
              <span className="invoice-kv-value">{formatValue(invoiceMeta.invoiceNumber)}</span>
            </div>
            <div className="invoice-kv-row">
              <span className="invoice-kv-label">Export Type</span>
              <span className="invoice-kv-value">{formatValue(meta.templateKey || invoiceMeta.exportType)}</span>
            </div>
            <div className="invoice-kv-row">
              <span className="invoice-kv-label">Country of Origin</span>
              <span className="invoice-kv-value">{formatValue(invoiceMeta.countryOfOrigin)}</span>
            </div>
            <div className="invoice-kv-row">
              <span className="invoice-kv-label">Remarks</span>
              <span className="invoice-kv-value">{formatValue(invoiceMeta.remarks)}</span>
            </div>
          </div>
        </div>
        <div></div>
      </div>

      <div className="mt-6 grid gap-4">
        {previewSections.map((section) => {
          const labelKey = String(section.label || '').toLowerCase()
          const fallbackByLabel = labelKey.includes('buyer')
            ? { label: 'TO', dataKey: 'receiverInfo' }
            : labelKey.includes('delivery')
              ? { label: 'FROM', dataKey: 'senderInfo' }
              : labelKey.includes('transport') || labelKey.includes('delivery type')
                ? { label: 'Delivery Type', dataKey: 'deliveryInfo' }
                : {}

          const override = sectionOverrides[section.key] || fallbackByLabel
          const sectionLabel = override.label || section.label
          const sectionKey = override.dataKey || section.key
          return (
            <div key={section.key} className="invoice-section">
              <p className="invoice-section-title">{sectionLabel}</p>
              <div className="mt-3">{renderSectionData(sectionKey, data)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

InvoicePreview.displayName = 'InvoicePreview'

export default InvoicePreview
