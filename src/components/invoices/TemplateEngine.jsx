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
}) => {
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

        return (
          <div key={section.key} className="surface-card rounded-2xl border px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="section-title">{section.label}</h4>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {section.key === 'companyHeader' ? (
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
                    .map((field) => {
                      const templateKey = String(templateConfig?.templateKey || '').toUpperCase()
                      const requiresNi = templateKey === 'TEMPLATE_3' || templateKey === 'TEMPLATE_4'
                      const isSenderInfo = section.key === 'senderInfo'
                      const adjustedField =
                        requiresNi && section.key === 'niDetails'
                          ? { ...field, required: true }
                          : isSenderInfo
                          ? { ...field, disabled: true }
                          : field

                      return (
                        <DynamicFieldRenderer
                          key={`${section.key}-${field.key}`}
                          sectionKey={section.key}
                          field={adjustedField}
                          register={register}
                          watch={watch}
                          control={control}
                          setValue={setValue}
                          disabled={isSenderInfo}
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
