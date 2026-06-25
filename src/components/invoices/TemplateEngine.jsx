import { useEffect, useState, useRef } from 'react'
import FileUpload from '../forms/FileUpload'
import DynamicFieldRenderer from './DynamicFieldRenderer'
import ValuationTable from './ValuationTable'

const COUNTRY_LIST = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Brazzaville)",
  "Congo (Kinshasa)","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica",
  "Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
  "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea",
  "Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea (North)","Korea (South)","Kosovo","Kuwait",
  "Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
  "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand",
  "Nicaragua","Niger","Nigeria","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea",
  "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis",
  "Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal",
  "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
  "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
  "Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
]

const CountryDropdown = ({ value, onChange, label, required }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const searchRef = useRef(null)

  const filtered = COUNTRY_LIST.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus()
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-1" ref={containerRef} style={{ position: 'relative' }}>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
        {label}{required ? ' *' : ''}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch('') }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '40px',
          width: '100%',
          padding: '0 12px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          background: '#fff',
          fontSize: '14px',
          color: value ? '#1a1a1a' : '#9ca3af',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || 'Select country'}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#b8922a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, marginLeft: 8, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          {/* Search input */}
          <div style={{ padding: '10px 10px 6px' }}>
            <div style={{ position: 'relative' }}>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#b8922a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 32px',
                  borderRadius: '9px',
                  border: '1px solid #f0e9d8',
                  background: '#fffaf1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Country list */}
          <ul style={{
            maxHeight: '220px',
            overflowY: 'auto',
            margin: 0,
            padding: '4px 6px 8px',
            listStyle: 'none',
          }}>
            {filtered.length === 0 ? (
              <li style={{ padding: '10px 10px', fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>
                No countries found
              </li>
            ) : (
              filtered.map((country) => (
                <li
                  key={country}
                  onClick={() => { onChange(country); setOpen(false); setSearch('') }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: country === value ? '#b8922a' : '#1a1a1a',
                    background: country === value ? '#fdf6e8' : 'transparent',
                    fontWeight: country === value ? 600 : 400,
                  }}
                  onMouseEnter={(e) => { if (country !== value) e.currentTarget.style.background = '#fafafa' }}
                  onMouseLeave={(e) => { if (country !== value) e.currentTarget.style.background = 'transparent' }}
                >
                  {country}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

const TemplateEngine = ({
  templateConfig,
  invoiceNumber,
  register,
  control,
  watch,
  setValue,
  onLogoUpload,
  uploadingLogo,
  businessProfile,
  pushToast,
  isOfficerEdit,
}) => {
  useEffect(() => {
    if (!businessProfile || !templateConfig || isOfficerEdit) return
    // setTimeout ensures RHF has finished registering fields before we set values
    const timer = setTimeout(() => {
      setValue('invoiceData.companyHeader.companyName', businessProfile.businessName || '', { shouldValidate: false, shouldDirty: false })
      setValue('invoiceData.companyHeader.companyAddress', businessProfile.businessAddress || '', { shouldValidate: false, shouldDirty: false })
      setValue('invoiceData.companyHeader.companyPhone', (businessProfile.mobileNumbers || [])[0] || '', { shouldValidate: false, shouldDirty: false })
      setValue('invoiceData.companyHeader.tin', businessProfile.tin || '', { shouldValidate: false, shouldDirty: false })
      setValue('invoiceData.companyHeader.stockValueName', businessProfile.stockValueName || '', { shouldValidate: false, shouldDirty: false })
    }, 0)
    return () => clearTimeout(timer)
  }, [businessProfile, templateConfig, setValue])

  if (!templateConfig) {
    return null
  }

  const shouldShowSection = (section, formValues) => {
    if (!section.conditional) return true

    const fieldPath = section.conditional.field.split('.')

    const resolveValue = (root) => {
      let value = root
      for (const key of fieldPath) {
        value = value?.[key]
      }
      return value
    }

    const directValue = resolveValue(formValues)
    const invoiceValue = resolveValue(formValues?.invoiceData)
    const resolved = directValue ?? invoiceValue

    return resolved === section.conditional.equals
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          {templateConfig.templateKey}
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-ink-900">
          {templateConfig.name}
        </h3>
        <p className="mt-1 text-sm text-ink-600">
          Invoice Number: <span className="font-semibold">{invoiceNumber || 'Pending'}</span>
        </p>
      </div>

      {templateConfig.sections.map((section) => {
        const formValues = watch()
        if (!shouldShowSection(section, formValues)) return null
        if (section.key === 'exchangeRateSection' || section.key === 'cifSummary') return null
        if (section.key === 'senderInfo') return null

        return (
          <div key={section.key} className="surface-card rounded-2xl border px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="section-title">{section.label}</h4>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {section.key === 'companyHeader' ? (
                <>
                  <div className="md:col-span-2">
                    <FileUpload
                      label="Company Logo"
                      helper="PNG or JPG (optional)"
                      accept="image/png,image/jpeg"
                      onChange={onLogoUpload}
                    />
                    {uploadingLogo ? (
                      <p className="mt-2 text-xs text-ink-500">Uploading logo...</p>
                    ) : null}
                  </div>
                  {/* Register hidden inputs so RHF tracks tin + stockValueName */}
                  <input type="hidden" {...register('invoiceData.companyHeader.tin')} />
                  <input type="hidden" {...register('invoiceData.companyHeader.stockValueName')} />
                  {businessProfile?.tin ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                        TIN
                      </label>
                      <div className="flex h-10 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-ink-700 cursor-not-allowed select-none">
                        {businessProfile.tin}
                      </div>
                    </div>
                  ) : null}
                  {/* Hidden inputs so RHF form state includes these values on submit */}
                  <input type="hidden" {...register('invoiceData.companyHeader.companyName')} />
                  <input type="hidden" {...register('invoiceData.companyHeader.companyAddress')} />
                  <input type="hidden" {...register('invoiceData.companyHeader.companyPhone')} />
                </>
              ) : null}

              {(section.key === 'valuationTable' || section.sectionType === 'table') ? (
                <div className="md:col-span-2">
                  <ValuationTable
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    section={section}
                    businessProfile={businessProfile}
                    pushToast={pushToast}
                  />
                </div>
              ) : null}

              {section.sectionType !== 'table'
                ? section.fields
                    .filter((field) => !(section.key === 'companyHeader' && field.key === 'logoUrl'))
                    .filter((field) => field.key !== 'remarks')
                    .map((field) => {
                      const templateKey = String(templateConfig?.templateKey || '').toUpperCase()
                      const requiresNi = templateKey === 'TEMPLATE_3' || templateKey === 'TEMPLATE_4'
                      const adjustedField =
                        requiresNi && section.key === 'niDetails'
                          ? { ...field, required: true }
                          : field

                      const BUSINESS_PROFILE_LOCKED_KEYS = ['companyName', 'companyAddress', 'companyPhone', 'tin', 'stockValueName']
                      const isLockedByProfile =
                        section.key === 'companyHeader' &&
                        BUSINESS_PROFILE_LOCKED_KEYS.includes(field.key) &&
                        !!businessProfile && !isOfficerEdit

                      if (isLockedByProfile) {
                        const profileValueMap = {
                          companyName:    businessProfile.businessName || '',
                          companyAddress: businessProfile.businessAddress || '',
                          companyPhone:   (businessProfile.mobileNumbers || [])[0] || '',
                        }
                        const displayValue = profileValueMap[field.key] || ''
                        const isMultiline = field.key === 'companyAddress'
                        return (
                          <div key={`${section.key}-${field.key}`} className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                              {field.label}{field.required ? ' *' : ''}
                            </label>
                            {isMultiline ? (
                              <textarea
                                readOnly
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-ink-700 cursor-not-allowed resize-none"
                                {...register(`invoiceData.companyHeader.${field.key}`)}
                              />
                            ) : (
                              <input
                                type="text"
                                readOnly
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-ink-700 cursor-not-allowed"
                                {...register(`invoiceData.companyHeader.${field.key}`)}
                              />
                            )}
                          </div>
                        )
                      }

                      // Intercept receiverCountry to show a searchable dropdown
                      if (section.key === 'receiverInfo' && field.key === 'receiverCountry') {
                        const fieldPath = 'invoiceData.receiverInfo.receiverCountry'
                        const currentValue = watch(fieldPath) || ''
                        return (
                          <CountryDropdown
                            key={`${section.key}-${field.key}`}
                            label={field.label || 'Receiver Country'}
                            required={adjustedField.required}
                            value={currentValue}
                            onChange={(val) => setValue(fieldPath, val, { shouldValidate: true, shouldDirty: true })}
                          />
                        )
                      }

                      // Intercept countryOfOrigin to show a searchable dropdown
                      if (section.key === 'invoiceMeta' && field.key === 'countryOfOrigin') {
                        const fieldPath = 'invoiceData.invoiceMeta.countryOfOrigin'
                        const currentValue = watch(fieldPath) || ''
                        return (
                          <CountryDropdown
                            key={`${section.key}-${field.key}`}
                            label={field.label || 'Country of Origin'}
                            required={adjustedField.required}
                            value={currentValue}
                            onChange={(val) => setValue(fieldPath, val, { shouldValidate: true, shouldDirty: true })}
                          />
                        )
                      }

                      return (
                        <DynamicFieldRenderer
                          key={`${section.key}-${field.key}`}
                          sectionKey={section.key}
                          field={adjustedField}
                          register={register}
                          watch={watch}
                          control={control}
                          setValue={setValue}
                        />
                      )
                    })
                : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TemplateEngine
