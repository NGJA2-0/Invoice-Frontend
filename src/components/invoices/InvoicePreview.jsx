const renderSectionData = (sectionKey, data) => {
  const sectionData = data?.[sectionKey]
  if (!sectionData) return null

  if (Array.isArray(sectionData)) {
    return sectionData.map((item, index) => (
      <li key={`${sectionKey}-${index}`} className="text-sm text-ink-700">
        {JSON.stringify(item)}
      </li>
    ))
  }

  return Object.entries(sectionData).map(([key, value]) => (
    <div key={`${sectionKey}-${key}`} className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between gap-4">
        <span className="text-ink-500">{key}</span>
        {Array.isArray(value) ? (
          <span className="text-ink-800">{value.length} item(s)</span>
        ) : (
          <span className="text-ink-800">{String(value || '')}</span>
        )}
      </div>
      {Array.isArray(value)
        ? value.map((item, index) => (
            <div
              key={`${sectionKey}-${key}-${index}`}
              className="rounded-lg border border-cloud-100 bg-cloud-50 px-3 py-2 text-xs text-ink-700"
            >
              {item?.itemName || `Item ${index + 1}`} • Qty {item?.quantity || 0}
            </div>
          ))
        : null}
    </div>
  ))
}

const InvoicePreview = ({ preview }) => {
  if (!preview) return null

  return (
    <div className="print-sheet mx-auto w-full max-w-4xl rounded-2xl border border-cloud-200 bg-white px-6 py-8 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
            Preview
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink-900">
            {preview.meta?.invoiceNumber}
          </h3>
          <p className="mt-1 text-sm text-ink-600">
            {preview.meta?.category} {preview.meta?.subCategory ? `• ${preview.meta.subCategory}` : ''}
          </p>
        </div>
        <div className="text-right text-sm text-ink-600">
          <p>Template: {preview.meta?.templateKey}</p>
          <p>Version: {preview.meta?.templateVersion}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {preview.sections?.map((section) => (
          <div key={section.key} className="rounded-xl border border-cloud-100 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
              {section.label}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {renderSectionData(section.key, preview.data)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InvoicePreview
