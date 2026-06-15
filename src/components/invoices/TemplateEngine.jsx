import { useEffect } from 'react'
import FileUpload from '../forms/FileUpload'
import DynamicFieldRenderer from './DynamicFieldRenderer'
import ValuationTable from './ValuationTable'

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
}) => {
  useEffect(() => {
    if (!businessProfile || !templateConfig) return
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
                  {businessProfile?.stockValueName ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                        Stock Value
                      </label>
                      <div className="flex h-10 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-ink-700 cursor-not-allowed select-none">
                        {businessProfile.stockValueName}
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
                        !!businessProfile

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
