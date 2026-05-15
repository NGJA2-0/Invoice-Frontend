import Input from '../common/Input'
import Textarea from '../common/Textarea'

const DynamicFieldRenderer = ({ sectionKey, field, register, watch }) => {
  if (field.dataType === 'array') {
    return null
  }

  if (field.conditional) {
    const conditionValue = watch(`invoiceData.${sectionKey}.${field.conditional.field}`)
    if (String(conditionValue || '').trim() !== String(field.conditional.equals)) {
      return null
    }
  }

  const name = `invoiceData.${sectionKey}.${field.key}`
  const label = field.required ? `${field.label} *` : field.label
  const isAddress = field.key.toLowerCase().includes('address')

  if (isAddress) {
    return (
      <Textarea
        label={label}
        placeholder={field.label}
        {...register(name)}
      />
    )
  }

  return (
    <Input
      label={label}
      type={field.dataType === 'number' ? 'number' : 'text'}
      placeholder={field.label}
      {...register(name)}
    />
  )
}

export default DynamicFieldRenderer
