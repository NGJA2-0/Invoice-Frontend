import { useEffect, useMemo, useState, useCallback } from 'react'
import { useFieldArray } from 'react-hook-form'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import ItemTypeSearch from '../common/ItemTypeSearch'
import { Check, Trash2 } from 'lucide-react'
import { currencyApi } from '../../services/currencyApi'

const ValuationTable = ({ control, register, watch, setValue, section }) => {
  // ── Currency dropdown state ────────────────────────────────────────────
  const [currencyCodes, setCurrencyCodes] = useState([])
  const [currencyList, setCurrencyList] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [currencyLoading, setCurrencyLoading] = useState(false)

  const isValuationTable = (section?.key || 'valuation') === 'valuationTable'

  useEffect(() => {
    if (!isValuationTable) return
    currencyApi.getAllPublic()
      .then((res) => {
        const list = res?.data ?? []
        const codes = list.map((c) => c.currencyCode).filter(Boolean)
        setCurrencyCodes(codes)
        setCurrencyList(list)
      })
      .catch(() => { })
  }, [isValuationTable])

  useEffect(() => {
    if (!isValuationTable || !selectedCurrency) return
    setCurrencyLoading(true)
    currencyApi.getByCode(selectedCurrency)
      .then((res) => {
        const rate = res?.exchangeRate
        if (rate !== undefined && rate !== null) {
          setValue(`invoiceData.exchangeRateSection.exchangeRate`, Number(rate), {
            shouldValidate: false,
            shouldDirty: true,
          })
        }
      })
      .catch(() => { })
      .finally(() => setCurrencyLoading(false))
  }, [selectedCurrency, isValuationTable, setValue])

  // ── Table config ───────────────────────────────────────────────────────
  const tableConfig = section?.table || {
    key: 'valuationItems',
    allowAddRows: true,
    allowRemoveRows: true,
    columns: [
      { key: 'itemNo', label: 'Item No', dataType: 'string', width: '80px' },
      { key: 'itemType', label: 'Item Type', dataType: 'string' },
      { key: 'description', label: 'Description of Goods', dataType: 'string' },
      { key: 'noOfPcs', label: 'No of Pcs', dataType: 'number' },
      { key: 'unitType', label: 'Unit Type', dataType: 'dropdown' },
      { key: 'weight', label: 'Weight', dataType: 'number' },
      { key: 'weightUnit', label: 'Weight Unit', dataType: 'dropdown' },
      { key: 'ratePer', label: 'Rate Per', dataType: 'number' },
      { key: 'rateUnit', label: 'Rate Unit', dataType: 'dropdown' },
      { key: 'amount', label: 'Amount (USD)', dataType: 'number', readOnly: true },
    ],
  }

  const sectionKey = section?.key || 'valuation'
  const fieldPath = `invoiceData.${sectionKey}`
  const itemsKey = tableConfig.key || (sectionKey === 'valuationTable' ? 'valuationItems' : 'items')
  const itemsPath = `${fieldPath}.${itemsKey}`
  const exchangeRatePath = 'invoiceData.exchangeRateSection'

  const { fields, append, remove, update } = useFieldArray({ control, name: itemsPath })
  const items = watch(itemsPath) || []

  // ── Column helpers ─────────────────────────────────────────────────────
  const getColumnOptions = (column) => {
    if (column.options) return column.options
    if (/weightUnit|rateUnit/i.test(column.key)) {
      return [
        { label: 'ct', value: 'ct' },
        { label: 'gr', value: 'gr' },
        { label: 'kg', value: 'kg' },
      ]
    }
    if (/unitType|pcs|pieces|numberOfUnit/i.test(column.key)) {
      return [
        { label: 'Pcs', value: 'Pcs' },
        { label: 'Lot', value: 'Lot' },
        { label: 'Prs', value: 'Prs' },
      ]
    }
    return []
  }

  useEffect(() => {
    fields.forEach((_, index) => {
      setValue(`${itemsPath}.${index}.itemNo`, index + 1, {
        shouldValidate: false,
        shouldDirty: true,
      })
    })
  }, [fields.length])

  const addItem = () => {
    const defaultItem = {}
    tableConfig.columns.forEach((col) => {
      if (col.dataType === 'number' || col.dataType === 'computed' || col.readOnly) {
        defaultItem[col.key] = 0
      } else if (col.dataType === 'dropdown' && col.options) {
        defaultItem[col.key] = col.options[0]?.value || ''
      } else {
        defaultItem[col.key] = ''
      }
    })
    defaultItem.isDone = false
    append(defaultItem)
  }

  const findColumnKey = (pattern, excludePattern) =>
    tableConfig.columns.find((col) => pattern.test(col.key) && !excludePattern?.test(col.key))?.key

  const amountKey = findColumnKey(/amount/i) || 'amount'
  const weightKey = findColumnKey(/weight/i, /unit/i) || 'weight'
  const rateKey = findColumnKey(/rate/i, /unit/i) || 'ratePer'
  const piecesKey = findColumnKey(/pcs|pieces|quantity|qty|numberOfItems|noOf/i) || 'noOfPcs'
  const hasAmountColumn = tableConfig.columns.some((col) => col.key === amountKey)

  // ── Formula computation ────────────────────────────────────────────────
  const computeFormulaValue = (formula, item) => {
    if (!formula) return 0
    const sanitized = formula.replace(/\s+/g, '')
    const getValue = (key) => Number(item?.[key]) || 0

    if (sanitized.includes('+') && !sanitized.includes('*') && !sanitized.includes('-') && !sanitized.includes('/')) {
      return sanitized.split('+').filter(Boolean).reduce((sum, key) => sum + getValue(key), 0)
    }
    if (sanitized.includes('*') && !sanitized.includes('+') && !sanitized.includes('-') && !sanitized.includes('/')) {
      return sanitized.split('*').filter(Boolean).reduce((product, key) => product * getValue(key), 1)
    }
    return 0
  }

  useEffect(() => {
    const computedColumns = tableConfig.columns.filter(
      (col) => col.formula || col.dataType === 'computed',
    )
    if (!computedColumns.length || !items.length) return
    items.forEach((item, index) => {
      computedColumns.forEach((col) => {
        const value = computeFormulaValue(col.formula, item)
        const rounded = Number(value.toFixed(2))
        const current = Number(item?.[col.key]) || 0
        if (!Number.isFinite(rounded) || rounded === current) return
        setValue(`${itemsPath}.${index}.${col.key}`, rounded, {
          shouldValidate: false,
          shouldDirty: true,
        })
      })
    })
  }, [items, itemsPath, setValue, tableConfig.columns])

  // ── Totals ─────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const totalsMap = {}
    if (Array.isArray(tableConfig.totals)) {
      tableConfig.totals.forEach((total) => {
        if (!total?.formula?.startsWith('sum:')) return
        const fieldKey = total.formula.split(':')[1]
        totalsMap[total.key] = items.reduce(
          (sum, item) => sum + (Number(item?.[fieldKey]) || 0), 0,
        )
      })
    }
    const completedItems = items.filter(
      (item) => item?.isDone || (Number(item?.[amountKey]) || 0) > 0,
    )
    const baseItems = tableConfig.totals?.length ? items : completedItems
    const totalPieces = totalsMap.totalPieces ?? baseItems.reduce((s, i) => s + (Number(i?.[piecesKey]) || 0), 0)
    const totalWeight = totalsMap.totalCombinedWeight ?? totalsMap.totalWeight ?? baseItems.reduce((s, i) => s + (Number(i?.[weightKey]) || 0), 0)
    const totalAmount = totalsMap.totalAmount ?? totalsMap.totalValue ?? baseItems.reduce((s, i) => s + (Number(i?.[amountKey]) || 0), 0)
    return { totalPieces, totalWeight, totalAmount, totalsMap }
  }, [items, amountKey, weightKey, piecesKey, tableConfig.totals])

  // ── Exchange rate & CIF ────────────────────────────────────────────────
  const exchangeRate = Number(watch(`${exchangeRatePath}.exchangeRate`)) || 0
  const freight = Number(watch(`${exchangeRatePath}.freight`)) || 0
  const insurance = Number(watch(`${exchangeRatePath}.insurance`)) || 0

  const fobUsd = totals.totalAmount
  const valueAdditionUsd = totals.totalsMap?.totalValueAddition ?? 0
  const valueAdditionLkr = valueAdditionUsd * exchangeRate
  const cifUsd = fobUsd + freight + insurance
  const fobLkr = fobUsd * exchangeRate
  const freightLkr = freight * exchangeRate
  const insuranceLkr = insurance * exchangeRate
  const cifLkr = cifUsd * exchangeRate

  // ── Other currency conversions (for FOB/Freight/Insurance summary) ─────
  const usdCurrencyEntry = currencyList.find((c) => c.currencyCode === 'USD')
  const usdRateToLkr = Number(usdCurrencyEntry?.exchangeRate) || 0
  const selectedCurrencyEntry = currencyList.find((c) => c.currencyCode === selectedCurrency)
  const otherRateToLkr = Number(selectedCurrencyEntry?.exchangeRate) || 0
  const showOtherCurrency = !!selectedCurrency && selectedCurrency !== 'USD' && otherRateToLkr > 0 && usdRateToLkr > 0

  // FOB in "other currency" = the valuation table's total amount (as entered/selected)
  const fobOther = totals.totalAmount
  const fobOtherLkr = fobOther * otherRateToLkr
  const fobOtherUsd = (fobOther * otherRateToLkr) / usdRateToLkr

  const freightOther = Number(watch(`${exchangeRatePath}.freightOther`)) || 0
  const freightOtherLkr = freightOther * otherRateToLkr
  const freightOtherUsd = (freightOther * otherRateToLkr) / usdRateToLkr

  const insuranceOther = Number(watch(`${exchangeRatePath}.insuranceOther`)) || 0
  const insuranceOtherLkr = insuranceOther * otherRateToLkr
  const insuranceOtherUsd = (insuranceOther * otherRateToLkr) / usdRateToLkr

  const cifOther = fobOther + freightOther + insuranceOther
  const cifOtherLkr = cifOther * otherRateToLkr
  const cifOtherUsd = (cifOther * otherRateToLkr) / usdRateToLkr

  // ── Row "Done" handler ─────────────────────────────────────────────────
  const handleRowDone = (index) => {
    if (!hasAmountColumn) return
    const item = items[index] || {}
    const computedUpdates = {}
    tableConfig.columns.forEach((col) => {
      if (col.formula || col.dataType === 'computed') {
        const value = computeFormulaValue(col.formula, item)
        computedUpdates[col.key] = Number(value.toFixed(2))
      }
    })
    const amountColHasFormula = tableConfig.columns.find(
      (col) => col.key === amountKey && col.formula
    )
    let finalAmount
    if (amountColHasFormula) {
      finalAmount = computedUpdates[amountKey] ?? 0
    } else {
      const valueAdditionKey = tableConfig.columns.find((col) => /valueAddition/i.test(col.key))?.key
      const importValueKey = tableConfig.columns.find((col) => /importValue/i.test(col.key))?.key
      if (valueAdditionKey && importValueKey) {
        finalAmount = Number(((Number(item?.[valueAdditionKey]) || 0) + (Number(item?.[importValueKey]) || 0)).toFixed(2))
      } else {
        finalAmount = Number(((Number(item?.[weightKey]) || 0) * (Number(item?.[rateKey]) || 0)).toFixed(2))
      }
    }
    update(index, { ...item, ...computedUpdates, isDone: true, [amountKey]: finalAmount })
  }

  useEffect(() => {
    setValue(`${exchangeRatePath}.fob`, Number(fobUsd.toFixed(2)), { shouldValidate: false })
    setValue(`${exchangeRatePath}.cif`, Number(cifUsd.toFixed(2)), { shouldValidate: false })
    setValue(`${exchangeRatePath}.cifLkr`, Number(cifLkr.toFixed(2)), { shouldValidate: false })
    if (showOtherCurrency) {
      setValue(`${exchangeRatePath}.otherCurrencyCode`, selectedCurrency, { shouldValidate: false })
      setValue(`${exchangeRatePath}.otherCurrencyRate`, otherRateToLkr, { shouldValidate: false })
      setValue(`${exchangeRatePath}.usdToLkrRate`, usdRateToLkr, { shouldValidate: false })
    } else {
      setValue(`${exchangeRatePath}.otherCurrencyCode`, '', { shouldValidate: false })
    }
  }, [fobUsd, cifUsd, cifLkr, exchangeRatePath, setValue, showOtherCurrency, selectedCurrency, otherRateToLkr, usdRateToLkr])

  // ── Field renderer ─────────────────────────────────────────────────────
  const renderFieldInput = (column, index, value, item) => {
    const fieldName = `${itemsPath}.${index}.${column.key}`
    const baseClassName = 'border-0 rounded-none bg-transparent shadow-none px-2 py-1 text-xs text-ink-900 placeholder:text-ink-400'

    // ── FIX: Auto-fill Item No with row index + 1 ──────────────────────
    if (column.key === 'itemNo') {
      return (
        <Input
          type="text"
          value={index + 1}
          readOnly
          className={baseClassName}
        />
      )
    }

    if (column.readOnly || column.dataType === 'computed') {
      const displayValue = Number(item?.[column.key]) || 0
      return (
        <Input
          type={column.dataType === 'number' ? 'number' : 'text'}
          value={displayValue.toFixed(2)}
          readOnly
          placeholder={column.label}
          className={baseClassName}
        />
      )
    }

    // ── Searchable dropdown for Item Type ──────────────────────────────
    if (column.dataType === 'searchable-dropdown' || column.key === 'itemType') {
      return (
        <ItemTypeSearch
          value={item?.[column.key] ?? ''}
          onChange={(itemName) =>
            setValue(fieldName, itemName, { shouldValidate: false, shouldDirty: true })
          }
          placeholder={column.label}
          className={baseClassName}
        />
      )
    }

    if (column.dataType === 'dropdown') {
      const options = getColumnOptions(column)
      return (
        <Select className={baseClassName} {...register(fieldName)}>
          <option value="">{column.label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      )
    }

    if (column.dataType === 'number') {
      return (
        <Input
          type="number"
          min="0"
          step="any"
          placeholder={column.label}
          className={baseClassName}
          {...register(fieldName, { valueAsNumber: true })}
        />
      )
    }

    return (
      <Input
        placeholder={column.label}
        className={baseClassName}
        {...register(fieldName)}
      />
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* Currency + Exchange Rate */}
      {sectionKey === 'valuationTable' && (
        <div className="flex flex-wrap items-end gap-3 max-w-lg">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-600">Currency</label>
            <Select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="min-w-[120px]"
            >
              <option value="">Select currency</option>
              {currencyCodes.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-600">
              Exchange Rate (1 {selectedCurrency || 'USD'} = ? LKR)
            </label>
            <Input
              type="number"
              placeholder={currencyLoading ? 'Loading…' : '0.00'}
              readOnly
              {...register(`${exchangeRatePath}.exchangeRate`, { valueAsNumber: true })}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="valuation-table min-w-full text-left text-xs">
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
                <td
                  colSpan={tableConfig.columns.length + (tableConfig.allowRemoveRows ? 1 : 0)}
                  className="px-4 py-6 text-center text-ink-500"
                >
                  No items added. Click "Add Item" to get started.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => {
                const item = items[index] || {}
                return (
                  <tr key={field.id}>
                    {tableConfig.columns.map((column) => (
                      <td key={`${field.id}-${column.key}`} className="px-4 py-3">
                        {renderFieldInput(column, index, item[column.key], item)}
                      </td>
                    ))}
                    {tableConfig.allowRemoveRows && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cloud-200 text-ink-600 transition hover:bg-cloud-50"
                            onClick={() => handleRowDone(index)}
                            aria-label="Done"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cloud-200 text-ink-600 transition hover:bg-cloud-50"
                            onClick={() => remove(index)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
          <tfoot className="bg-cloud-50 text-sm text-ink-700">
            <tr>
              {tableConfig.columns.map((column) => {
                const totalsMap = totals.totalsMap || {}
                if (column.key === piecesKey || column.key === 'numberOfItems') {
                  return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{totals.totalPieces.toFixed(2)}</td>
                }
                if (column.key === 'metalWeight') return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{(totalsMap.totalMetalWeight ?? 0).toFixed(2)}</td>
                if (column.key === 'mainStoneWeight') return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{(totalsMap.totalMainStoneWeight ?? 0).toFixed(2)}</td>
                if (column.key === 'otherStoneWeight') return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{(totalsMap.totalOtherStoneWeight ?? 0).toFixed(2)}</td>
                if (column.key === 'totalWeight') return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{totals.totalWeight.toFixed(2)}</td>
                if (column.key === 'valueAddition') return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{(totalsMap.totalValueAddition ?? 0).toFixed(2)}</td>
                if (column.key === 'importValue') return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{(totalsMap.totalImportValue ?? 0).toFixed(2)}</td>
                if (column.key === 'totalValue') return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{(totalsMap.totalValue ?? 0).toFixed(2)}</td>
                if (column.key === weightKey) return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{totals.totalWeight.toFixed(2)}</td>
                if (column.key === amountKey) return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">{totals.totalAmount.toFixed(2)}</td>
                if (column.key === tableConfig.columns[0]?.key) return <td key={`total-${column.key}`} className="px-4 py-3 font-semibold">Totals</td>
                return <td key={`total-${column.key}`} className="px-4 py-3"></td>
              })}
              {tableConfig.allowRemoveRows && <td className="px-4 py-3"></td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {tableConfig.allowAddRows && (
        <Button onClick={addItem} variant="secondary">+ Add Item</Button>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Total Pieces" type="number" value={totals.totalPieces.toFixed(2)} readOnly />
        <Input label="Total Weight" type="number" value={totals.totalWeight.toFixed(2)} readOnly />
        <Input label="Total Amount (USD)" type="number" value={totals.totalAmount.toFixed(2)} readOnly />
      </div>

      {tableConfig.totals?.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {'totalMetalWeight' in totals.totalsMap && <Input label="Total Metal Weight" type="number" value={(totals.totalsMap.totalMetalWeight || 0).toFixed(2)} readOnly />}
          {'totalMainStoneWeight' in totals.totalsMap && <Input label="Total Main Stone Weight" type="number" value={(totals.totalsMap.totalMainStoneWeight || 0).toFixed(2)} readOnly />}
          {'totalOtherStoneWeight' in totals.totalsMap && <Input label="Total Other Stone Weight" type="number" value={(totals.totalsMap.totalOtherStoneWeight || 0).toFixed(2)} readOnly />}
          {'totalCombinedWeight' in totals.totalsMap && <Input label="Total Combined Weight" type="number" value={(totals.totalsMap.totalCombinedWeight || 0).toFixed(2)} readOnly />}
          {'totalValueAddition' in totals.totalsMap && <Input label="Total Value Addition" type="number" value={(totals.totalsMap.totalValueAddition || 0).toFixed(2)} readOnly />}
          {'totalImportValue' in totals.totalsMap && <Input label="Total Import Value" type="number" value={(totals.totalsMap.totalImportValue || 0).toFixed(2)} readOnly />}
          {'totalValue' in totals.totalsMap && <Input label="Total Value" type="number" value={(totals.totalsMap.totalValue || 0).toFixed(2)} readOnly />}
        </div>
      ) : null}

      {sectionKey === 'valuationTable' && (
        <div className="mt-2 rounded-2xl border border-cloud-200 bg-white">
          <div className="border-b border-cloud-200 px-4 py-3">
            <p className="text-sm font-semibold text-ink-800">
              {totals.totalsMap?.totalValueAddition !== undefined
                ? 'Value Addition / FOB / Freight / Insurance Summary'
                : 'FOB / Freight / Insurance Summary'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-cloud-50 text-xs uppercase tracking-[0.14em] text-ink-500">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  {showOtherCurrency && <th className="px-4 py-3">{selectedCurrency}</th>}
                  <th className="px-4 py-3">USD</th>
                  <th className="px-4 py-3">LKR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {totals.totalsMap?.totalValueAddition !== undefined && (
                  <tr>
                    <td className="px-4 py-3 font-semibold text-ink-700">Value Addition</td>
                    {showOtherCurrency && <td className="px-4 py-3"><Input type="number" value="—" readOnly /></td>}
                    <td className="px-4 py-3"><Input type="number" value={valueAdditionUsd.toFixed(2)} readOnly /></td>
                    <td className="px-4 py-3"><Input type="number" value={valueAdditionLkr.toFixed(2)} readOnly /></td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink-700">FOB</td>
                  {showOtherCurrency && <td className="px-4 py-3"><Input type="number" value={fobOther.toFixed(2)} readOnly /></td>}
                  <td className="px-4 py-3"><Input type="number" value={(showOtherCurrency ? fobOtherUsd : fobUsd).toFixed(2)} readOnly /></td>
                  <td className="px-4 py-3"><Input type="number" value={(showOtherCurrency ? fobOtherLkr : fobLkr).toFixed(2)} readOnly /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink-700">Freight</td>
                  {showOtherCurrency && (
                    <td className="px-4 py-3">
                      <Input type="number" placeholder="0.00" {...register(`${exchangeRatePath}.freightOther`, { valueAsNumber: true })} />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {showOtherCurrency
                      ? <Input type="number" value={freightOtherUsd.toFixed(2)} readOnly />
                      : <Input type="number" placeholder="0.00" {...register(`${exchangeRatePath}.freight`, { valueAsNumber: true })} />}
                  </td>
                  <td className="px-4 py-3"><Input type="number" value={(showOtherCurrency ? freightOtherLkr : freightLkr).toFixed(2)} readOnly /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink-700">Insurance</td>
                  {showOtherCurrency && (
                    <td className="px-4 py-3">
                      <Input type="number" placeholder="0.00" {...register(`${exchangeRatePath}.insuranceOther`, { valueAsNumber: true })} />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {showOtherCurrency
                      ? <Input type="number" value={insuranceOtherUsd.toFixed(2)} readOnly />
                      : <Input type="number" placeholder="0.00" {...register(`${exchangeRatePath}.insurance`, { valueAsNumber: true })} />}
                  </td>
                  <td className="px-4 py-3"><Input type="number" value={(showOtherCurrency ? insuranceOtherLkr : insuranceLkr).toFixed(2)} readOnly /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink-700">CIF</td>
                  {showOtherCurrency && <td className="px-4 py-3"><Input type="number" value={cifOther.toFixed(2)} readOnly /></td>}
                  <td className="px-4 py-3"><Input type="number" value={(showOtherCurrency ? cifOtherUsd : cifUsd).toFixed(2)} readOnly /></td>
                  <td className="px-4 py-3"><Input type="number" value={(showOtherCurrency ? cifOtherLkr : cifLkr).toFixed(2)} readOnly /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ValuationTable