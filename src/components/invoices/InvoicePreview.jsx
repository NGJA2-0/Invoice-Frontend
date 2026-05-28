import { forwardRef, useRef } from 'react'

/* ─── helpers ─────────────────────────────────────────────── */
const formatLabel = (value = '') =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return `${value.length} item(s)`
  return String(value)
}

const pickValue = (item, keys) => {
  for (const key of keys) {
    const v = item?.[key]
    if (v !== null && v !== undefined && v !== '') return v
  }
  return ''
}

/* ─── sub-renderers ────────────────────────────────────────── */
const KVGrid = ({ data, exclude = [] }) => (
  <div style={styles.kvGrid}>
    {Object.entries(data)
      .filter(([k]) => !exclude.includes(k))
      .map(([k, v]) => (
        <div key={k} style={styles.kvRow}>
          <span style={styles.kvLabel}>{formatLabel(k)}</span>
          <span style={styles.kvValue}>{formatValue(v)}</span>
        </div>
      ))}
  </div>
)

const SimpleTable = ({ rows }) => {
  if (!rows.length) return null
  const cols = Object.keys(rows[0] || {})
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {cols.map((c) => <th key={c} style={styles.th}>{formatLabel(c)}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {cols.map((c) => <td key={c} style={styles.td}>{formatValue(row?.[c])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const ValuationSection = ({ data }) => {
  const valuation = data?.valuationTable || data?.valuation || {}
  const items = valuation?.valuationItems || valuation?.items || []
  if (!items.length) return null

  const totals = items.reduce(
    (acc, item) => {
      acc.pieces += Number(pickValue(item, ['numberOfPieces','noOfPcs','noOfPieces','quantity','qty','pcs'])) || 0
      acc.weight += Number(pickValue(item, ['weight'])) || 0
      acc.amount += Number(pickValue(item, ['amount','totalUsd','total'])) || 0
      return acc
    },
    { pieces: 0, weight: 0, amount: 0 },
  )

  const totalPcs = Number(pickValue(valuation, ['totalPieces','totalPcs'])) || totals.pieces
  const totalWt  = Number(pickValue(valuation, ['totalWeight'])) || totals.weight
  const totalAmt = Number(pickValue(valuation, ['totalAmount','totalAmountUsd','totalUsd'])) || totals.amount

  return (
    <>
      <table style={styles.table}>
        <thead>
          <tr>
            {['Item No','Item Type','Description','No of Pcs','Unit','Weight','Wt Unit','Rate Per','Rate Unit','Amt (USD)'].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={styles.td}>{formatValue(pickValue(item, ['itemNo','itemNumber','no']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['itemType','type','stoneType']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['description','descriptionOfGoods']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['numberOfPieces','noOfPcs','quantity','qty','pcs']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['piecesUnit','unitType','unit','pcsUnit']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['weight']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['weightUnit','unitWeight']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['ratePer','rate']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['rateUnit','unitRate']))}</td>
              <td style={styles.td}>{formatValue(pickValue(item, ['amount','totalUsd','total']))}</td>
            </tr>
          ))}

        </tbody>
      </table>
      <div style={styles.summaryRow}>
        {[['Total Pieces', totalPcs.toFixed(2)], ['Total Weight', totalWt.toFixed(2)], ['Total Amount (USD)', totalAmt.toFixed(2)]].map(([lbl, val]) => (
          <div key={lbl} style={styles.summaryBox}>
            <div style={styles.summaryLabel}>{lbl}</div>
            <div style={styles.summaryValue}>{val}</div>
          </div>
        ))}
      </div>
    </>
  )
}

const ExchangeSection = ({ data }) => {
  const ex = data?.exchangeRateSection || {}
  if (!Object.keys(ex).length) return null
  const rows = [
    ['FOB', ex.fob, ex.exchangeRate ? (Number(ex.fob||0)*Number(ex.exchangeRate||0)).toString() : '—'],
    ['Freight', ex.freight, ex.exchangeRate ? (Number(ex.freight||0)*Number(ex.exchangeRate||0)).toString() : '—'],
    ['Insurance', ex.insurance, ex.exchangeRate ? (Number(ex.insurance||0)*Number(ex.exchangeRate||0)).toString() : '—'],
    ['CIF', ex.cif, ex.cifLkr],
    ['Exchange Rate (1 USD)', '—', ex.exchangeRate],
  ]
  return (
    <table style={styles.tableExchange}>
      <thead>
        <tr>
          {['Description','USD','LKR'].map((h) => <th key={h} style={styles.thExchange}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map(([desc, usd, lkr]) => (
          <tr key={desc}>
            <td style={styles.tdExchange}>{desc}</td>
            <td style={styles.tdExchange}>{formatValue(usd)}</td>
            <td style={styles.tdExchange}>{formatValue(lkr)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const renderSectionData = (sectionKey, data) => {
  if (sectionKey === 'valuationTable' || sectionKey === 'valuation') return <ValuationSection data={data} />
  if (sectionKey === 'exchangeRateSection' || sectionKey === 'exchangeRates') return <ExchangeSection data={data} />

  const sd = data?.[sectionKey]
  if (!sd) return null
  if (Array.isArray(sd)) return <SimpleTable rows={sd} />

  const entries = Object.entries(sd)
  const arrayEntry = entries.find(([, v]) => Array.isArray(v))
  if (arrayEntry) return <SimpleTable rows={arrayEntry[1]} />

  // For senderInfo / receiverInfo: exclude logoUrl
  const exclude = sectionKey === 'companyHeader' ? ['logoUrl'] : []
  return <KVGrid data={sd} exclude={exclude} />
}

/* ─── colour tokens ────────────────────────────────────────── */
const GOLD       = '#9a7b3c'
const LIGHT_GOLD = '#c9a96e'
const BG         = '#fffdf8'
const RULE       = '#e8dfc8'

/* ─── styles ───────────────────────────────────────────────── */
const styles = {
  page: {
    width: '210mm',
    height: '297mm',
    overflow: 'hidden',
    background: BG,
    fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    color: '#1a1a1a',
    padding: '10mm 12mm 12mm 12mm',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },

  /* ── header bar ── */
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: `2px solid ${GOLD}`,
    paddingBottom: 10,
    marginBottom: 8,
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerLeftText: { display: 'flex', flexDirection: 'column', gap: 2 },
  logoPlaceholder: {
    width: 64, height: 64, borderRadius: 6,
    background: '#f0e8d5', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, color: GOLD, border: `2px solid ${RULE}`, fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    flexShrink: 0, fontWeight: 700, letterSpacing: 1,
    boxShadow: '0 2px 8px rgba(154,123,60,0.12)',
  },
  docLabel: { fontSize: 8.5, letterSpacing: 2.5, color: GOLD, textTransform: 'uppercase' },
  docTitle: { fontSize: 18, fontWeight: 700, letterSpacing: 0.3, color: '#111', margin: '2px 0' },
  docSub:   { fontSize: 9.5, color: '#666', letterSpacing: 0.8, marginBottom: 4 },

  /* company details stacked under name */
  companyMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    marginTop: 4,
  },
  companyMetaAddress: {
    display: 'flex',
    gap: 4,
    alignItems: 'baseline',
  },
  companyMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1px 14px',
  },
  companyMetaItem: {
    display: 'flex',
    gap: 4,
    alignItems: 'baseline',
  },
  companyMetaLabel: { fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 1, color: '#aaa', fontWeight: 700 },
  companyMetaValue: { fontSize: 11, fontWeight: 600, color: '#333' },

  headerRight: { textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 },
  metaChip: {
    display: 'inline-flex', gap: 10, background: '#f5f0e8',
    border: `1px solid ${RULE}`, borderRadius: 3, padding: '4px 9px',
    fontSize: 9, alignItems: 'center', minWidth: 180,
  },
  metaLabel: { color: GOLD, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700, fontSize: 7.5 },
  metaValue: { color: '#222', fontWeight: 600, marginLeft: 'auto' },

  /* ── body: flex column that grows ── */
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    overflow: 'hidden',
  },

  /* ── top layout: all sections stacked vertically ── */
  topRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 6,
    flexShrink: 0,
  },

  toFromStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  /* ── each section box ── */
  section: {
    border: `1px solid ${RULE}`,
    borderRadius: 3,
    overflow: 'hidden',
  },
  /* wide sections grow to fill remaining space */
  sectionWide: {
    border: `1px solid ${RULE}`,
    borderRadius: 3,
    overflow: 'hidden',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 6,
  },
  sectionHead: {
    background: `linear-gradient(90deg, #f0e8d4 0%, #fffdf8 100%)`,
    borderBottom: `1px solid ${RULE}`,
    padding: '4px 10px',
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 2,
    color: GOLD,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  sectionBody: {
    padding: '7px 10px',
    flex: 1,
  },

  /* ── delivery type: compact premium horizontal bar ── */
  deliveryCard: {
    border: `1px solid ${RULE}`,
    borderRadius: 3,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
  },
  deliveryCardHead: {
    background: `linear-gradient(90deg, #f0e8d4 0%, #fffdf8 100%)`,
    borderRight: `1px solid ${RULE}`,
    padding: '6px 12px',
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 2,
    color: GOLD,
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    minWidth: 70,
  },
  deliveryCardBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '6px 12px',
    gap: 10,
  },
  deliveryBadge: {
    background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
    color: '#fff',
    borderRadius: 3,
    padding: '4px 14px',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    whiteSpace: 'nowrap',
  },
  deliveryLabel: {
    fontSize: 7,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* ── KV grid inside narrow sections (TO / FROM) ── */
  kvGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' },
  kvRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 },
  kvLabel: { fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.8, color: '#888', flexShrink: 0 },
  kvValue: { fontSize: 11, fontWeight: 600, color: '#1a1a1a', textAlign: 'right' },

  /* ── tables ── */
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
  th: {
    background: '#f0e8d4', color: GOLD, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 0.8, fontSize: 9.5, padding: '6px 7px', textAlign: 'left',
    borderBottom: `1px solid ${RULE}`,
  },
  td: { padding: '6px 7px', borderBottom: `1px solid ${RULE}`, color: '#222', fontSize: 11 },

  /* ── exchange rates table (larger font) ── */
  tableExchange: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
  thExchange: {
    background: '#f0e8d4', color: GOLD, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 0.8, fontSize: 9.5, padding: '7px 10px', textAlign: 'left',
    borderBottom: `1px solid ${RULE}`,
  },
  tdExchange: { padding: '7px 10px', borderBottom: `1px solid ${RULE}`, color: '#222', fontSize: 11 },

  /* ── valuation summary pills ── */
  summaryRow: { display: 'flex', gap: 6, marginTop: 8 },
  summaryBox: {
    flex: 1, background: '#f5f0e6', border: `1px solid ${RULE}`,
    borderRadius: 3, padding: '6px 10px',
  },
  summaryLabel: { fontSize: 8, color: GOLD, textTransform: 'uppercase', letterSpacing: 0.8 },
  summaryValue: { fontSize: 13, fontWeight: 700, color: '#111', marginTop: 2 },

  /* ── footer ── */
  footer: {
    flexShrink: 0,
    borderTop: `1px solid ${RULE}`,
    paddingTop: 5,
    marginTop: 5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 7, color: '#bbb', letterSpacing: 0.6 },

  /* ── gold right-edge accent ── */
  goldAccent: {
    position: 'absolute', top: 0, right: 0, width: 4, height: '100%',
    background: `linear-gradient(180deg, ${GOLD} 0%, ${LIGHT_GOLD} 50%, ${GOLD} 100%)`,
  },
}

/* ─── Download button ──────────────────────────────────────── */
const DownloadButton = ({ targetRef }) => {
  const handlePrint = () => {
    if (!targetRef.current) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head>
      <title>NGJA Export Invoice</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:white; }
        @page { size:A4; margin:0; }
        @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
      </style>
    </head><body>${targetRef.current.outerHTML}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, maxWidth: '210mm' }}>
      <button onClick={handlePrint} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 18px', fontSize: 13, fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
        color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer',
        letterSpacing: 0.5, fontWeight: 600,
        boxShadow: '0 2px 10px rgba(154,123,60,0.35)',
      }}>
        ⬇ Download PDF
      </button>
    </div>
  )
}

/* ─── Main component ───────────────────────────────────────── */
const InvoicePreview = forwardRef(({ preview }, _ref) => {
  const pageRef = useRef(null)

  if (!preview) return null

  const meta          = preview.meta || {}
  const data          = preview.data?.invoiceData || preview.data || {}
  const invoiceMeta   = data?.invoiceMeta || {}
  const companyHeader = data?.companyHeader || {}

  // Company fields for header display (exclude logoUrl)
  const companyFields = [
    ['Address',  companyHeader.companyAddress],
    ['Email',    companyHeader.companyEmail],
    ['Phone',    companyHeader.companyPhone],
    ['Website',  companyHeader.companyWebsite],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '')

  const sectionOverrides = {
    buyerInfo:        { label: 'TO',            dataKey: 'receiverInfo' },
    receiverInfo:     { label: 'TO',            dataKey: 'receiverInfo' },
    deliveryInfo:     { label: 'FROM',          dataKey: 'senderInfo'   },
    senderInfo:       { label: 'FROM',          dataKey: 'senderInfo'   },
    transportDetails: { label: 'Delivery Type', dataKey: 'deliveryInfo' },
  }

  const shouldHide = (s) => {
    const k = String(s?.key   || '').toLowerCase()
    const l = String(s?.label || '').toLowerCase()
    return (
      k.includes('cert') || k.includes('signature') ||
      l.includes('cert') || l.includes('signature') ||
      // hide companyHeader section since we moved it to the header
      k === 'companyheader' || k === 'company_header' || l === 'company header'
    )
  }

  const sections = (preview.sections || []).filter((s) => !shouldHide(s))

  const WIDE_KEYS    = ['valuationTable','valuation','exchangeRateSection','exchangeRates']
  const DELIVERY_KEYS = ['deliveryInfo','transportDetails']

  const wideSections     = sections.filter((s) => WIDE_KEYS.includes(sectionOverrides[s.key]?.dataKey || s.key))
  const deliverySections = sections.filter((s) => {
    const resolved = sectionOverrides[s.key]?.dataKey || s.key
    const label    = String(s.label || '').toLowerCase()
    return (
      DELIVERY_KEYS.includes(resolved) ||
      label.includes('delivery type') ||
      label.includes('transport')
    )
  })
  const narrowSections   = sections.filter((s) => !wideSections.includes(s) && !deliverySections.includes(s))

  // resolve label + key for a section
  const resolveSection = (section) => {
    const labelKey = String(section.label || '').toLowerCase()
    const fallback = labelKey.includes('buyer')
      ? { label: 'TO',            dataKey: 'receiverInfo' }
      : labelKey.includes('delivery type') || labelKey.includes('transport')
      ? { label: 'Delivery Type', dataKey: 'deliveryInfo' }
      : labelKey.includes('delivery')
      ? { label: 'FROM',          dataKey: 'senderInfo'   }
      : {}
    const override     = sectionOverrides[section.key] || fallback
    return {
      sectionLabel: override.label   || section.label,
      sectionKey:   override.dataKey || section.key,
    }
  }

  const renderNarrowSec = (section) => {
    const { sectionLabel, sectionKey } = resolveSection(section)
    return (
      <div key={section.key} style={styles.section}>
        <div style={styles.sectionHead}>{sectionLabel}</div>
        <div style={styles.sectionBody}>{renderSectionData(sectionKey, data)}</div>
      </div>
    )
  }

  const renderWideSec = (section) => {
    const { sectionLabel, sectionKey } = resolveSection(section)
    return (
      <div key={section.key} style={styles.sectionWide}>
        <div style={styles.sectionHead}>{sectionLabel}</div>
        <div style={styles.sectionBody}>{renderSectionData(sectionKey, data)}</div>
      </div>
    )
  }

  // Delivery value — pull from deliveryInfo or transportDetails
  const deliveryValue = (() => {
    const di = data?.deliveryInfo || {}
    return (
      pickValue(di, ['deliveryType','courier','method','type','carrier']) ||
      pickValue(data?.transportDetails || {}, ['deliveryType','courier','method','type','carrier']) ||
      ''
    )
  })()

  return (
    <div>
      <DownloadButton targetRef={pageRef} />

      <div ref={pageRef} style={styles.page}>
        {/* right-edge gold bar */}
        <div style={styles.goldAccent} />

        {/* ── HEADER ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {companyHeader?.logoUrl
              ? <img src={companyHeader.logoUrl} alt="logo" style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0, borderRadius: 6, boxShadow: '0 2px 8px rgba(154,123,60,0.12)' }} />
              : <div style={styles.logoPlaceholder}>LOGO</div>
            }
            <div style={styles.headerLeftText}>
              <div style={styles.docLabel}>NGJA Export Invoice</div>
              {/* Company name replaces invoice number */}
              <div style={styles.docTitle}>
                {companyHeader.companyName || meta.companyName || 'Company Name'}
              </div>
              <div style={styles.docSub}>
                {meta.category || 'Category'}{meta.subCategory ? ` · ${meta.subCategory}` : ''}
              </div>
              {/* Company details: address first, then email / phone / website each on own line */}
              {companyFields.length > 0 && (
                <div style={styles.companyMeta}>
                  {/* Address row */}
                  {companyHeader.companyAddress && (
                    <div style={styles.companyMetaAddress}>
                      <span style={styles.companyMetaLabel}>Address</span>
                      <span style={styles.companyMetaValue}>{formatValue(companyHeader.companyAddress)}</span>
                    </div>
                  )}
                  {/* Email, Phone, Website — each on its own line */}
                  {[['Email', companyHeader.companyEmail], ['Phone', companyHeader.companyPhone], ['Website', companyHeader.companyWebsite]]
                    .filter(([, v]) => v !== null && v !== undefined && v !== '')
                    .map(([lbl, val]) => (
                      <div key={lbl} style={styles.companyMetaAddress}>
                        <span style={styles.companyMetaLabel}>{lbl}</span>
                        <span style={styles.companyMetaValue}>{formatValue(val)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.headerRight}>
            {[
              ['Invoice Date', invoiceMeta.invoiceDate],
              ['Invoice No',   invoiceMeta.invoiceNumber || meta.invoiceNumber],
              ['Export Type',  meta.templateKey || invoiceMeta.exportType],
              ['Country',      invoiceMeta.countryOfOrigin],
              ['Remarks',      invoiceMeta.remarks],
            ].map(([lbl, val]) => (
              <div key={lbl} style={styles.metaChip}>
                <span style={styles.metaLabel}>{lbl}</span>
                <span style={styles.metaValue}>{formatValue(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY (flex column, fills remaining height) ── */}
        <div style={styles.body}>

          {/* TO, FROM stacked, then Delivery below */}
          <div style={styles.topRow}>
            <div style={styles.toFromStack}>
              {narrowSections.map((s) => renderNarrowSec(s))}
            </div>

            {/* Delivery Type: full-width horizontal bar below FROM */}
            {deliverySections.length > 0 && (
              <div style={styles.deliveryCard}>
                <div style={styles.deliveryCardHead}>Delivery</div>
                <div style={styles.deliveryCardBody}>
                  <div style={styles.deliveryBadge}>
                    {deliveryValue || formatValue(
                      (() => {
                        const di = data?.deliveryInfo || data?.transportDetails || {}
                        const vals = Object.values(di).filter(v => v && typeof v === 'string')
                        return vals[0] || ''
                      })()
                    )}
                  </div>
                  <div style={styles.deliveryLabel}>Courier Method</div>
                </div>
              </div>
            )}
          </div>

          {/* wide sections grow to fill space */}
          {wideSections.map((s) => renderWideSec(s))}

          {/* spacer pushes footer to bottom */}
          <div style={{ flex: 1 }} />

          {/* ── FOOTER ── */}
          <div style={styles.footer}>
            <span style={styles.footerText}>NGJA — National Gem &amp; Jewellery Authority, Sri Lanka</span>
            <span style={styles.footerText}>
              Generated&nbsp;
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

        </div>
      </div>
    </div>
  )
})

InvoicePreview.displayName = 'InvoicePreview'
export default InvoicePreview