import Select from '../common/Select'

const SubCategorySelector = ({ subCategories, value, onChange }) => {
  if (!subCategories || subCategories.length === 0) {
    return null
  }

  return (
    <Select
      label="Sub Category"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select sub category</option>
      {subCategories.map((subCategory) => (
        <option key={subCategory.name} value={subCategory.name}>
          {subCategory.name}
        </option>
      ))}
    </Select>
  )
}

export default SubCategorySelector
