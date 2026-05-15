import { useEffect, useMemo } from 'react'
import { useFieldArray } from 'react-hook-form'
import Button from '../common/Button'
import Input from '../common/Input'

const ValuationTable = ({ control, register, watch, setValue }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoiceData.valuation.items',
  })

  const items = watch('invoiceData.valuation.items') || []
  const exchangeRate = Number(watch('invoiceData.exchangeRates.exchangeRate') || 0)

  const totals = useMemo(() => {
    const totalUsd = items.reduce((acc, item) => {
      const quantity = Number(item?.quantity || 0)
      const unitPrice = Number(item?.unitPrice || 0)
      return acc + quantity * unitPrice
    }, 0)
    const totalLkr = totalUsd * exchangeRate
    return { totalUsd, totalLkr }
  }, [items, exchangeRate])

  useEffect(() => {
    setValue('invoiceData.valuation.totalUsd', Number(totals.totalUsd.toFixed(2)))
    setValue('invoiceData.valuation.totalLkr', Number(totals.totalLkr.toFixed(2)))
  }, [setValue, totals.totalLkr, totals.totalUsd])

  const addItem = () => {
    append({
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      currency: 'USD',
      weight: '',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" {...register('invoiceData.valuation.totalUsd')} />
      <input type="hidden" {...register('invoiceData.valuation.totalLkr')} />
      <div className="overflow-hidden rounded-2xl border border-cloud-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-cloud-50 text-xs uppercase tracking-[0.16em] text-ink-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price (USD)</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud-100">
            {fields.map((field, index) => (
              <tr key={field.id}>
                <td className="px-4 py-3">
                  <Input
                    placeholder="Item name"
                    {...register(`invoiceData.valuation.items.${index}.itemName`)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    placeholder="Description"
                    {...register(`invoiceData.valuation.items.${index}.description`)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="0"
                    {...register(`invoiceData.valuation.items.${index}.quantity`)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="0"
                    {...register(`invoiceData.valuation.items.${index}.unitPrice`)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="0"
                    {...register(`invoiceData.valuation.items.${index}.weight`)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={addItem}>Add Item</Button>
        <Input
          label="Total USD"
          type="number"
          value={totals.totalUsd.toFixed(2)}
          readOnly
        />
        <Input
          label="Total LKR"
          type="number"
          value={totals.totalLkr.toFixed(2)}
          readOnly
        />
      </div>
    </div>
  )
}

export default ValuationTable
