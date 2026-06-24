const SectionCard = ({ title, children }) => (
  <div
    style={{
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.08)',
      background: 'rgba(255,255,255,0.7)',
      padding: '1rem 1.25rem',
      marginBottom: '1rem',
    }}
  >
    <h3
      style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: '#6b7280',
        margin: '0 0 0.75rem 0',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
)

const Field = ({ label, value }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>
      {value === '' || value === null || value === undefined ? 'N/A' : String(value)}
    </div>
  </div>
)

const FieldGrid = ({ children }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '0.5rem 1.25rem',
    }}
  >
    {children}
  </div>
)

const formatDate = (value) => {
  if (!value) return 'N/A'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'N/A'
  return d.toISOString().slice(0, 10)
}

const InvoiceDetailView = ({ invoice, actions }) => {
  if (!invoice) return null

  const data = invoice.data || {}
  const companyHeader = data.companyHeader || {}
  const receiverInfo = data.receiverInfo || {}
  const senderInfo = data.senderInfo || {}
  const carrierDetails = data.carrierDetails || {}
  const deliveryInfo = data.deliveryInfo || {}
  const invoiceMeta = data.invoiceMeta || {}
  const niDetails = data.niDetails || {}
  const exchangeRateSection = data.exchangeRateSection || {}
  const valuationTable = data.valuationTable || {}
  const valuationItems = valuationTable.valuationItems || []
  const cifItems = data.cifSummary?.cifItems || []

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {invoice.invoiceNumber || 'Invoice'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            {invoice.category || 'N/A'} · {invoice.subCategory || 'N/A'}
          </p>
        </div>
        {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>

      <SectionCard title="Invoice Meta">
        <FieldGrid>
          <Field label="Invoice Number" value={invoiceMeta.invoiceNumber} />
          <Field label="Invoice Date" value={formatDate(invoiceMeta.invoiceDate)} />
          <Field label="Export Type" value={invoiceMeta.exportType} />
          <Field label="Country of Origin" value={invoiceMeta.countryOfOrigin} />
          <Field label="Remarks" value={invoiceMeta.remarks} />
          <Field label="Status" value={invoice.status} />
          <Field label="Template" value={invoice.templateKey} />
          <Field label="Created" value={formatDate(invoice.createdAt)} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Company Header">
        <FieldGrid>
          <Field label="Company Name" value={companyHeader.companyName} />
          <Field label="Address" value={companyHeader.companyAddress} />
          <Field label="Email" value={companyHeader.companyEmail} />
          <Field label="Phone" value={companyHeader.companyPhone} />
          <Field label="Website" value={companyHeader.companyWebsite} />
          <Field label="TIN" value={companyHeader.tin} />
          <Field label="Stock Value Name" value={companyHeader.stockValueName} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Receiver Info">
        <FieldGrid>
          <Field label="Receiver Name" value={receiverInfo.receiverName} />
          <Field label="Address" value={receiverInfo.receiverAddress} />
          <Field label="Contact" value={receiverInfo.receiverContact} />
          <Field label="Country" value={receiverInfo.receiverCountry} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Sender Info">
        <FieldGrid>
          <Field label="Sender Name" value={senderInfo.senderName} />
          <Field label="Address" value={senderInfo.senderAddress} />
          <Field label="Phone" value={senderInfo.senderPhone} />
          <Field label="Website" value={senderInfo.senderWebsite} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Carrier Details">
        <FieldGrid>
          <Field label="Carrier Full Name" value={carrierDetails.carrierFullName} />
          <Field label="Nationality" value={carrierDetails.carrierNationality} />
          <Field label="Passport ID" value={carrierDetails.carrierPassportID} />
          <Field label="Contact" value={carrierDetails.carrierContact} />
          <Field label="Airline" value={carrierDetails.airline} />
          <Field label="Flight Number" value={carrierDetails.flightNumber} />
          <Field label="Destination Country" value={carrierDetails.destinationCountry} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Delivery & NI Details">
        <FieldGrid>
          <Field label="Delivery Type" value={deliveryInfo.deliveryType} />
          <Field label="NI Number" value={niDetails.niNumber} />
          <Field label="NI Date" value={formatDate(niDetails.niDate)} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Exchange Rate Section">
        <FieldGrid>
          <Field label="Exchange Rate" value={exchangeRateSection.exchangeRate} />
          <Field label="FOB" value={exchangeRateSection.fob} />
          <Field label="Freight" value={exchangeRateSection.freight} />
          <Field label="Insurance" value={exchangeRateSection.insurance} />
          <Field label="CIF" value={exchangeRateSection.cif} />
          <Field label="CIF (LKR)" value={exchangeRateSection.cifLkr} />
          <Field label="Other Currency Code" value={exchangeRateSection.otherCurrencyCode} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Valuation Table">
        <FieldGrid>
          <Field label="Total Amount" value={valuationTable.totalAmount} />
          <Field label="Total Pieces" value={valuationTable.totalPieces} />
          <Field label="Total Weight" value={valuationTable.totalWeight} />
        </FieldGrid>

        {valuationItems.length > 0 && (
          <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.03)' }}>
                  <th style={{ padding: '8px 12px' }}>#</th>
                  <th style={{ padding: '8px 12px' }}>Item Type</th>
                  <th style={{ padding: '8px 12px' }}>Description</th>
                  <th style={{ padding: '8px 12px' }}>Pieces</th>
                  <th style={{ padding: '8px 12px' }}>Weight</th>
                  <th style={{ padding: '8px 12px' }}>Rate/Unit</th>
                  <th style={{ padding: '8px 12px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {valuationItems.map((item, idx) => {
                  const pieces = item.numberOfPieces ?? item.noOfPcs
                  return (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <td style={{ padding: '8px 12px' }}>{item.itemNo ?? idx + 1}</td>
                      <td style={{ padding: '8px 12px' }}>{item.itemType || 'N/A'}</td>
                      <td style={{ padding: '8px 12px' }}>{item.description || 'N/A'}</td>
                      <td style={{ padding: '8px 12px' }}>
                        {pieces ?? 'N/A'} {item.piecesUnit || ''}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        {item.weight ?? 'N/A'} {item.weightUnit || ''}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        {item.ratePer ?? 'N/A'} {item.rateUnit || ''}
                      </td>
                      <td style={{ padding: '8px 12px' }}>{item.amount ?? 'N/A'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {cifItems.length > 0 && (
        <SectionCard title="CIF Summary">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.03)' }}>
                  {Object.keys(cifItems[0]).map((key) => (
                    <th key={key} style={{ padding: '8px 12px', textTransform: 'capitalize' }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cifItems.map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    {Object.values(item).map((val, i) => (
                      <td key={i} style={{ padding: '8px 12px' }}>{String(val ?? 'N/A')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

export default InvoiceDetailView