import { useEffect, useMemo } from 'react'
import { useFieldArray } from 'react-hook-form'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'

const ValuationTable = ({ control, register, watch, setValue, section }) => {
  // For backward compatibility: if no section provided, use old defaults
  const tableConfig = section?.table || {
    key: 'valuationItems',
    allowAddRows: true,
    allowRemoveRows: true,
    columns: [
      { key: 'itemName', label: 'Item', dataType: 'string' },
      { key: 'description', label: 'Description', dataType: 'string' },
      { key: 'quantity', label: 'Qty', dataType: 'number' },
      { key: 'unitPrice', label: 'Unit Price (USD)', dataType: 'number' },
      { key: 'weight', label: 'Weight', dataType: 'number' },
    ],
    totals: [
      { key: 'totalUsd', label: 'Total USD', formula: 'sum:unitPrice' },
    ],
  }

  const sectionKey = section?.key || 'valuation'
  const fieldPath = `invoiceData.${sectionKey}`

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldPath}.items`,
  })

  const items = watch(`${fieldPath}.items`) || []

  // Get select options from column definitions
  const getColumnOptions = (column) => {
    if (column.options) return column.options
    if (column.key.includes('Unit')) {
      return [
        { label: 'Pcs', value: 'Pcs' },
        { label: 'Lot', value: 'Lot' },
      ]
    }
    if (column.key.includes('unit') || column.key === 'weightUnit' || column.key === 'rateUnit') {
      return [
        { label: 'ct', value: 'ct' },
        { label: 'gr', value: 'gr' },
        { label: 'kg', value: 'kg' },
      ]
    }
    return []
  }

  const addItem = () => {
    const defaultItem = {}
    tableConfig.columns.forEach((col) => {
      if (col.dataType === 'number') {
        defaultItem[col.key] = 0
      } else if (col.dataType === 'dropdown' && col.options) {
        defaultItem[col.key] = col.options[0]?.value || ''
      } else {
        defaultItem[col.key] = ''
      }
    })
    append(defaultItem)
  }

  const renderFieldInput = (column, index, value) => {
    const fieldName = `${fieldPath}.items.${index}.${column.key}`

    if (column.readOnly) {
      return (
        <Input
          type={column.dataType === 'number' ? 'number' : 'text'}
          value={value || ''}
          readOnly
          placeholder={column.label}
        />
      )
    }

    if (column.dataType === 'dropdown') {
      const options = getColumnOptions(column)
      return (
        <Select {...register(fieldName)}>
          <option value="">{column.label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      )
    }

    if (column.dataType === 'number') {
      return (
        <Input
          type="number"
          min="0"
          placeholder={column.label}
          {...register(fieldName)}
        />
      )
    }

    return (
      <Input
        placeholder={column.label}
        {...register(fieldName)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-2xl border border-cloud-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-cloud-50 text-xs uppercase tracking-[0.16em] text-ink-500">
            <tr>
              {tableConfig.columns.map((column) => (
                <th key={column.key} className="px-4 py-3" style={{ width: column.width }}>
                  {column.label}
                </th>
              ))}
              {tableConfig.allowRemoveRows && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud-100">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={tableConfig.columns.length + (tableConfig.allowRemoveRows ? 1 : 0)} className="px-4 py-6 text-center text-ink-500">
                  No items added. Click "Add Item" to get started.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id}>
                  {tableConfig.columns.map((column) => (
                    <td key={`${field.id}-${column.key}`} className="px-4 py-3">
                      {renderFieldInput(column, index, field[column.key])}
                    </td>
                  ))}
                  {tableConfig.allowRemoveRows && (
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {tableConfig.allowAddRows && (
        <Button onClick={addItem} variant="secondary">
          + Add Item
        </Button>
      )}

      {tableConfig.totals && tableConfig.totals.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {tableConfig.totals.map((total) => (
            <Input
              key={total.key}
              label={total.label}
              type="number"
              value={items.length > 0 ? items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2) : '0.00'}
              readOnly
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ValuationTable
