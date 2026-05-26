import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import Input from '../common/Input'
import Textarea from '../common/Textarea'
import Select from '../common/Select'

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
        {...register(name)}
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
        {...register(name)}
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
        {...register(name)}
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
        {...register(name, { valueAsNumber: true })}
      />
    )
  }

  // Handle file fields
  if (field.dataType === 'file') {
    return null // File uploads handled separately
  }

  // Default text input
  return (
    <Input
      label={label}
      type="text"
      placeholder={field.placeholder || field.label}
      readOnly={field.readOnly}
      {...register(name)}
    />
  )
}

export default DynamicFieldRenderer
