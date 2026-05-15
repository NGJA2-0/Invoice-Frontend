import Select from '../common/Select'

const CategorySelector = ({ categories, value, onChange }) => {
  return (
    <Select label="Invoice Category" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select category</option>
      {categories.map((category) => (
        <option key={category.name} value={category.name}>
          {category.name}
        </option>
      ))}
    </Select>
  )
}

export default CategorySelector
