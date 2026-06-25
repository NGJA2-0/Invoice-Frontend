import { useEffect } from 'react'
import { useState } from 'react'
import Input from '../common/Input'
import Textarea from '../common/Textarea'
import Select from '../common/Select'
const ValidatedField = ({ label, name, register, readOnly, placeholder, required, type = 'text', pattern, errorMessage }) => {
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const validate = (value) => {
    if (required && !value) { setError('This field is required'); return }
    if (value && !pattern.test(value)) { setError(errorMessage); return }
    setError('')
  }

  const { ref, onChange, onBlur, name: fieldName } = register(name, {
    required: required ? 'This field is required' : false,
    pattern: { value: pattern, message: errorMessage },
  })

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{label}</label>
      <input
        ref={ref}
        name={fieldName}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => { onChange(e); if (touched) validate(e.target.value) }}
        onBlur={(e) => { onBlur(e); setTouched(true); validate(e.target.value) }}
        style={{
          height: '40px', width: '100%', padding: '0 12px', borderRadius: '12px',
          border: error ? '1.5px solid #ef4444' : '1px solid #e5e7eb',
          background: error ? '#fff5f5' : '#fff',
          fontSize: '14px', outline: 'none',
          transition: 'border-color 0.2s, background 0.2s', boxSizing: 'border-box',
        }}
      />
      {error && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>{error}</span>}
    </div>
  )
}

const DynamicFieldRenderer = ({ sectionKey, field, register, watch, control, setValue }) => {
  if (field.dataType === 'array') {
    return null
  }

  // Handle conditional rendering
  if (field.conditional) {
    const conditionPath = `invoiceData.${sectionKey}.${field.conditional.field}`
    const conditionValue = watch(conditionPath)
    if (String(conditionValue || '').trim() !== String(field.conditional.equals)) {
      return null
    }
  }

  const name = `invoiceData.${sectionKey}.${field.key}`
  const label = field.required ? `${field.label} *` : field.label
  const isAddress = field.key.toLowerCase().includes('address') || field.multiLine
  const value = watch(name)
  const registerOptions = field.required ? { required: `${field.label} is required` } : undefined

  // Handle autoFill fields
  useEffect(() => {
    if (field.autoFill && setValue) {
      if (field.autoFill === 'currentDate') {
        const today = new Date().toISOString().split('T')[0]
        setValue(name, today)
      } else if (field.autoFill.startsWith('computed:')) {
        // Handle computed autoFill later
      } else {
        // autoFill from another field like "companyHeader.companyName"
        const [section, fieldKey] = field.autoFill.split('.')
        const sourceValue = watch(`invoiceData.${section}.${fieldKey}`)
        if (sourceValue) {
          setValue(name, sourceValue)
        }
      }
    }
  }, [field.autoFill, field.key, name, setValue])

  // Handle dropdown fields
  if (field.dataType === 'dropdown') {
    const options = field.options || []
    return (
      <Select
        label={label}
        disabled={field.readOnly}
        {...register(name, registerOptions)}
      >
        <option value="">{field.placeholder || 'Select...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    )
  }

  // Handle date fields
  if (field.dataType === 'date') {
    return (
      <Input
        label={label}
        type="date"
        placeholder={field.placeholder || field.label}
        readOnly={field.readOnly}
        {...register(name, registerOptions)}
      />
    )
  }

  // Handle textarea fields
  if (isAddress || field.dataType === 'textarea') {
    return (
      <Textarea
        label={label}
        placeholder={field.placeholder || field.label}
        readOnly={field.readOnly}
        {...register(name, registerOptions)}
      />
    )
  }

  // Handle numeric fields
  if (field.dataType === 'number') {
    return (
      <Input
        label={label}
        type="number"
        placeholder={field.placeholder || field.label}
        readOnly={field.readOnly}
        {...register(name, { valueAsNumber: true, ...registerOptions })}
      />
    )
  }

  // Handle file fields
  if (field.dataType === 'file') {
    return null // File uploads handled separately
  }

  const isPassportField = /passport|passportId|passportNumber/i.test(field.key) || /passport/i.test(field.label)
  const isWebsiteField = /website|url|web/i.test(field.key) || /website|url|web/i.test(field.label)
  const isEmailField = /email/i.test(field.key) || /email/i.test(field.label)
  const isPhoneField = /phone|mobile|contact|telephone/i.test(field.key) || /phone|mobile|contact|telephone/i.test(field.label)

  if (isPassportField) {
    return <ValidatedField label={label} name={name} register={register} readOnly={field.readOnly}
      placeholder={field.placeholder || 'e.g. N1234567'} required={!!field.required} type="text"
      pattern={/^[A-Z0-9]{6,9}$/i}
      errorMessage="Enter a valid passport number (6-9 alphanumeric characters, e.g. N1234567)" />
  }

  if (isWebsiteField) {
    return <ValidatedField label={label} name={name} register={register} readOnly={field.readOnly}
      placeholder={field.placeholder || 'e.g. https://www.example.com'} required={!!field.required} type="text"
      pattern={/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}([-a-zA-Z0-9@:%_+.~#?&/=]*)$/}
      errorMessage="Enter a valid website URL (e.g. https://www.example.com)" />
  }

  if (isEmailField) {
    return <ValidatedField label={label} name={name} register={register} readOnly={field.readOnly}
      placeholder={field.placeholder || 'e.g. example@domain.com'} required={!!field.required} type="email"
      pattern={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
      errorMessage="Enter a valid email address (e.g. example@domain.com)" />
  }

  if (isPhoneField) {
    return <ValidatedField label={label} name={name} register={register} readOnly={field.readOnly}
      placeholder={field.placeholder || 'e.g. +94771234567'} required={!!field.required} type="tel"
      pattern={/^\+?[0-9\s\-().]{7,20}$/}
      errorMessage="Enter a valid phone number (e.g. +94771234567 or 0112345678)" />
  }

  // Default text input
  return (
    <Input
      label={label}
      type="text"
      placeholder={field.placeholder || field.label}
      readOnly={field.readOnly}
      {...register(name, registerOptions)}
    />
  )
}

export default DynamicFieldRenderer
