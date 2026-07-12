import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useFieldArray } from 'react-hook-form'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import ItemTypeSearch from '../common/ItemTypeSearch'
import { Check, Trash2 } from 'lucide-react'
import { currencyApi } from '../../services/currencyApi'

const MobileItemModal = ({ columns, item, index, onSave, onDelete, onClose, isNew, getColumnOptions, templateKey }) => {
  const [localItem, setLocalItem] = useState({ ...item })
  const [openDropdown, setOpenDropdown] = useState(null)

  const handleChange = (key, value) => {
    setLocalItem((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onSave(localItem, index)
    onClose()
  }

  const handleDelete = () => {
    onDelete(index)
    onClose()
  }

  const inputStyle = {
    height: 44, borderRadius: 10, border: '1.5px solid #e5e7eb',
    background: '#fff', padding: '0 12px',
    fontSize: 14, color: '#111', outline: 'none', width: '100%',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  const readOnlyStyle = {
    ...inputStyle,
    background: '#fafaf9',
    color: '#9ca3af',
    border: '1.5px solid #f0e9d8',
    cursor: 'not-allowed',
  }

  const labelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: '#1a1a1a',  // black like table headers

  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(15, 10, 5, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .vt-modal-input:focus {
          border-color: #b8922a !important;
          box-shadow: 0 0 0 3px rgba(184,146,42,0.12);
        }
        .vt-modal-select:focus {
          border-color: #b8922a !important;
          outline: none;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '90vh',
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e7eb' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.25rem 1rem',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8922a', margin: 0 }}>
              {isNew ? 'New Item' : `Edit Item ${index + 1}`}
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f0f0f', margin: '3px 0 0', letterSpacing: '-0.02em' }}>
              {isNew ? 'Add to Valuation Table' : 'Edit Valuation Row'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '1.5px solid #e5e7eb', background: '#f9fafb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6b7280', flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f3f4f6', flexShrink: 0, marginBottom: 4 }} />

        {/* Fields */}
        <div style={{
          overflowY: 'auto', padding: '1rem 1.25rem 0.5rem',
          display: 'flex', flexDirection: 'column', gap: 16, flex: 1,
        }}>
          {columns.map((col) => {
            if (col.key === 'itemNo') return null

            const value = localItem[col.key] ?? ''
            const isReadOnly = col.readOnly || col.dataType === 'computed'

            if (isReadOnly) {
              return (
                <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={labelStyle}>{col.label}</label>
                  <div style={{ ...readOnlyStyle, display: 'flex', alignItems: 'center', fontSize: 13 }}>
                    {Number(value || 0).toFixed(2)}
                  </div>
                </div>
              )
            }

            if (col.key === 'itemType' || col.dataType === 'searchable-dropdown') {
              return (
                <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={labelStyle}>{col.label}</label>
                  <ItemTypeSearch
                    value={value}
                    onChange={(itemName) => handleChange(col.key, itemName)}
                    placeholder={col.label}
                  />
                </div>
              )
            }

            if (col.dataType === 'dropdown') {
              const options = getColumnOptions(col)
              const isOpen = openDropdown === col.key
              return (
                <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 5, position: 'relative' }}>
                  <label style={labelStyle}>{col.label}</label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : col.key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      height: 44, width: '100%', padding: '0 12px',
                      borderRadius: 12, border: '1px solid #e5e7eb',
                      background: '#fff', fontSize: 14,
                      color: value ? '#1a1a1a' : '#9ca3af',
                      cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {options.find(o => o.value === value)?.label || col.label}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#b8922a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, marginLeft: 8, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                      zIndex: 99999, background: '#fff', border: '1px solid #e5e7eb',
                      borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      overflow: 'hidden',
                    }}>
                      <ul style={{ maxHeight: 200, overflowY: 'auto', margin: 0, padding: '4px 6px 8px', listStyle: 'none' }}>
                        {options.map((opt) => (
                          <li
                            key={opt.value}
                            onClick={() => { handleChange(col.key, opt.value); setOpenDropdown(null) }}
                            style={{
                              padding: '10px 12px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
                              color: opt.value === value ? '#b8922a' : '#1a1a1a',
                              background: opt.value === value ? '#fdf6e8' : 'transparent',
                              fontWeight: opt.value === value ? 600 : 400,
                            }}
                            onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = '#fafafa' }}
                            onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = 'transparent' }}
                          >
                            {opt.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            }

            if (col.dataType === 'number') {
              const numVal = Number(value || 0)
              return (
                <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={labelStyle}>{col.label}</label>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    height: 44, borderRadius: 12, border: '1.5px solid #e5e7eb',
                    background: '#fff', overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}>
                    <button
                      type="button"
                      onClick={() => handleChange(col.key, Math.max(0, numVal - 1))}
                      style={{
                        width: 44, height: '100%', flexShrink: 0,
                        border: 'none', borderRight: '1px solid #f0f0f0',
                        background: '#fafafa', color: '#666',
                        fontSize: 18, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0e9d8'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fafafa'}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={value}
                      onChange={(e) => handleChange(col.key, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      style={{
                        flex: 1, height: '100%', border: 'none', outline: 'none',
                        textAlign: 'center', fontSize: 14, color: '#111',
                        background: 'transparent',
                        MozAppearance: 'textfield',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleChange(col.key, numVal + 1)}
                      style={{
                        width: 44, height: '100%', flexShrink: 0,
                        border: 'none', borderLeft: '1px solid #f0f0f0',
                        background: '#fafafa', color: '#b8922a',
                        fontSize: 18, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0e9d8'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fafafa'}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={labelStyle}>{col.label}</label>
                <input
                  className="vt-modal-input"
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(col.key, e.target.value)}
                  placeholder={col.label}
                  style={inputStyle}
                />
              </div>
            )
          })}

          {/* bottom breathing room */}
          <div style={{ height: 8 }} />
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.875rem 1.25rem',
          borderTop: '1px solid #f3f4f6',
          display: 'flex', gap: 10, flexShrink: 0,
          background: '#fff',
        }}>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                height: 48, borderRadius: 12,
                border: '1.5px solid #fca5a5',
                background: '#fff1f2', color: '#dc2626',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '0 18px', flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fff1f2'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            style={{
              height: 48, borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #b8922a, #d4a832)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, letterSpacing: '0.02em',
              boxShadow: '0 4px 16px rgba(184,146,42,0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 16 4 11" />
            </svg>
            {isNew ? 'Add to Table' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
const ValuationTable = ({ control, register, watch, setValue, section, businessProfile, pushToast, templateKey }) => {
  // ── Currency dropdown state ────────────────────────────────────────────
  const [currencyCodes, setCurrencyCodes] = useState([])
  const [currencyList, setCurrencyList] = useState([])
  const selectedCurrency = watch('invoiceData.exchangeRateSection.selectedCurrency') || ''
  const setSelectedCurrency = (val) => setValue('invoiceData.exchangeRateSection.selectedCurrency', val, { shouldDirty: true })
  const [currencyLoading, setCurrencyLoading] = useState(false)

  const isValuationTable = (section?.key || 'valuation') === 'valuationTable'

  const [mobileModal, setMobileModal] = useState(null)
  // mobileModal = null | { mode: 'add' } | { mode: 'edit', index: number, item: object }

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 640
  )

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isValuationTable) return
    currencyApi.getAllPublic()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? [])
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
        const payload = res?.data || res
        const rate = payload?.exchangeRate
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
  const tableConfig = useMemo(() => {
    const currencyLabel = selectedCurrency || 'USD'
    const base = section?.table || {
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
        { key: 'amount', label: `Amount (${currencyLabel})`, dataType: 'number', readOnly: true },
      ],
    }

    return {
      ...base,
      columns: base.columns.map((col) => ({
        ...col,
        label: col.label
          .replace(/\(USD\)/gi, `(${currencyLabel})`)
          .replace(/\(\$\)/gi, `(${currencyLabel})`),
      })),
    }
  }, [selectedCurrency, section?.table])

  const sectionKey = section?.key || 'valuation'
  const fieldPath = `invoiceData.${sectionKey}`
  const itemsKey = tableConfig.key || (sectionKey === 'valuationTable' ? 'valuationItems' : 'items')
  const itemsPath = `${fieldPath}.${itemsKey}`
  const exchangeRatePath = 'invoiceData.exchangeRateSection'

  // Clear stale Freight/Insurance values when the currency changes, so a
  // value entered under a previous currency can't silently satisfy validation.
  const prevCurrencyRef = useRef(selectedCurrency)
  useEffect(() => {
    if (prevCurrencyRef.current !== selectedCurrency) {
      setValue(`${exchangeRatePath}.freight`, '', { shouldValidate: false, shouldDirty: true })
      setValue(`${exchangeRatePath}.insurance`, '', { shouldValidate: false, shouldDirty: true })
      setValue(`${exchangeRatePath}.freightOther`, '', { shouldValidate: false, shouldDirty: true })
      setValue(`${exchangeRatePath}.insuranceOther`, '', { shouldValidate: false, shouldDirty: true })
      prevCurrencyRef.current = selectedCurrency
    }
  }, [selectedCurrency, exchangeRatePath, setValue])

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

  // ── Row completeness check ──────────────────────────────────────────────
  const isFieldFilled = (val) => {
    if (val === undefined || val === null) return false
    if (typeof val === 'number') return !Number.isNaN(val)
    if (typeof val === 'string') return val.trim() !== ''
    return true
  }

  // Returns the first column that's missing a value in the given item,
  // skipping itemNo and any auto-computed/readOnly columns.
  const getIncompleteColumn = (item, columns) => {
    for (const col of columns) {
      if (col.key === 'itemNo') continue
      if (col.readOnly || col.dataType === 'computed') continue
      if (!isFieldFilled(item?.[col.key])) return col
    }
    return null
  }

  // Checks the last row already in the table. Returns true (and shows a
  // toast) if it's OK to add a new row.
  const canAddNewItem = () => {
    const currentItems = watch(itemsPath) || []
    if (currentItems.length === 0) return true
    const lastIndex = currentItems.length - 1
    const lastItem = currentItems[lastIndex]
    const missingCol = getIncompleteColumn(lastItem, tableConfig.columns)
    if (missingCol) {
      if (typeof pushToast === 'function') {
        pushToast({
          title: 'Incomplete item',
          message: `Please fill "${missingCol.label}" in Item ${lastIndex + 1} before adding a new item.`,
          tone: 'danger',
        })
      }
      return false
    }
    return true
  }

  const addItem = () => {
    if (isValuationTable && !selectedCurrency) {
      if (typeof pushToast === 'function') {
        pushToast({
          title: 'Currency required',
          message: 'Select a currency before adding items to the table.',
          tone: 'danger',
        })
      }
      return
    }
    if (isValuationTable && isStockExhausted) {
      if (typeof pushToast === 'function') {
        pushToast({
          title: 'Stock value limit reached',
          message: 'You have reached your stock value, please contact NGJA for increase it or more details.',
          tone: 'danger',
        })
      }
      return
    }

    // NEW: don't allow a new blank row until the last one is fully filled
    if (!canAddNewItem()) return

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

    // Template 2: amount = numberOfItems * ratePerUnit
    if (String(templateKey || '').toUpperCase() === 'TEMPLATE_2') {
      // console.log('template2 item keys:', Object.keys(item), item)
      if (sanitized.toLowerCase().includes('amount') || sanitized === 'weight*ratePer' || sanitized.includes('ratePer')) {
        const numberOfItems = getValue('numberOfItems') || getValue('noOfPcs') || getValue('quantity') || getValue('numberOfPieces') || 0
        const ratePerUnit = getValue('ratePerUnit') || getValue('ratePer') || 0
        return numberOfItems * ratePerUnit
      }
    }

    // Special case: weight * ratePer needs unit conversion
    if (sanitized === 'weight*ratePer') {
      const weight = getValue('weight')
      const ratePer = getValue('ratePer')
      const weightUnit = String(item?.weightUnit || '').toLowerCase().trim()
      const rateUnit = String(item?.rateUnit || '').toLowerCase().trim()

      const toCtMap = { ct: 1, gr: 5, g: 5, kg: 5000 }
      const fromCtMap = { ct: 1, gr: 1 / 5, g: 1 / 5, kg: 1 / 5000 }

      const weightInCt = weight * (toCtMap[weightUnit] || 1)
      const weightInRateUnit = weightInCt * (fromCtMap[rateUnit] || 1)

      return weightInRateUnit * ratePer
    }

    if (sanitized.includes('+') && !sanitized.includes('*') && !sanitized.includes('-') && !sanitized.includes('/')) {
      return sanitized.split('+').filter(Boolean).reduce((sum, key) => sum + getValue(key), 0)
    }
    if (sanitized.includes('*') && !sanitized.includes('+') && !sanitized.includes('-') && !sanitized.includes('/')) {
      return sanitized.split('*').filter(Boolean).reduce((product, key) => product * getValue(key), 1)
    }
    return 0
  }

  useEffect(() => {
    if (String(templateKey || '').toUpperCase() === 'TEMPLATE_3') return
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

  // ── Stock value tracking (compared against FOB's LKR value) ───────────
  const fobLkrForStock = showOtherCurrency ? fobOtherLkr : fobLkr

  const stockValueNumber = useMemo(() => {
    const raw = businessProfile?.stockValueName
    if (raw === undefined || raw === null) return 0
    const cleaned = String(raw).replace(/[^0-9.-]/g, '')
    const value = Number(cleaned)
    return Number.isFinite(value) ? value : 0
  }, [businessProfile?.stockValueName])

  const remainingStockValue = stockValueNumber - fobLkrForStock

  const remainingPercentage = stockValueNumber > 0
    ? (remainingStockValue / stockValueNumber) * 100
    : 100

  const isStockExhausted = stockValueNumber > 0 && remainingStockValue <= 0

  // green: > 70% remaining | yellow: 10%–70% remaining | red: 0%–10% remaining
  const stockValueStatus = remainingPercentage <= 10
    ? 'red'
    : remainingPercentage <= 70
      ? 'yellow'
      : 'green'

  const stockValueStyles = {
    green: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    yellow: 'border-amber-300 bg-amber-50 text-amber-700',
    red: 'border-red-300 bg-red-50 text-red-700',
  }

  // ── Row "Done" handler ─────────────────────────────────────────────────
  const handleRowDone = (index) => {
    if (!hasAmountColumn && String(templateKey || '').toUpperCase() !== 'TEMPLATE_3') return

    const toCtMap = { ct: 1, gr: 5, g: 5, kg: 5000 }
    const fromCtMap = { ct: 1, gr: 1 / 5, g: 1 / 5, kg: 1 / 5000 }

    const currentItems = watch(itemsPath) || []
    const item = currentItems[index] || {}

    if (String(templateKey || '').toUpperCase() === 'TEMPLATE_3') {
      const weight = Number(item?.weight) || 0
      const ratePer = Number(item?.ratePer) || 0
      const importValue = Number(item?.importValue) || 0
      const weightUnit = String(item?.weightUnit || '').toLowerCase().trim()
      const rateUnit = String(item?.rateUnit || '').toLowerCase().trim()

      const weightInCt = weight * (toCtMap[weightUnit] || 1)
      const weightInRateUnit = weightInCt * (fromCtMap[rateUnit] || 1)

      const valueAddition = Number((weightInRateUnit * ratePer).toFixed(2))
      const totalValue = Number((valueAddition + importValue).toFixed(2))

      update(index, { ...item, valueAddition, totalValue, isDone: true })
      return
    }

    if (String(templateKey || '').toUpperCase() === 'TEMPLATE_4') {
      const numberOfItems = Number(item?.numberOfItems) || 0
      const ratePerUnit = Number(item?.ratePerUnit) || 0
      const importValue = Number(item?.importValue) || 0
      const valueAddition = Number((numberOfItems * ratePerUnit).toFixed(2))
      const amount = Number((valueAddition + importValue).toFixed(2))
      update(index, { ...item, valueAddition, amount, isDone: true })
      return
    }

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
      const weight = Number(item?.[weightKey]) || 0
      const ratePer = Number(item?.[rateKey]) || 0
      const weightUnit = String(item?.weightUnit || '').toLowerCase().trim()
      const rateUnit = String(item?.rateUnit || '').toLowerCase().trim()

      const weightInCt = weight * (toCtMap[weightUnit] || 1)
      const weightInRateUnit = weightInCt * (fromCtMap[rateUnit] || 1)
      finalAmount = Number((weightInRateUnit * ratePer).toFixed(2))
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
      const liveItems = watch(itemsPath) || []
      const displayValue = Number(liveItems[index]?.[column.key] ?? item?.[column.key]) || 0
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
        <select
          className={baseClassName}
          style={{ height: '28px', fontSize: '11px', border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', width: '100%' }}
          {...register(fieldName)}
        >
          <option value="">{column.label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )
    }

    if (
      (String(templateKey || '').toUpperCase() === 'TEMPLATE_3' &&
        (column.key === 'valueAddition' || column.key === 'totalValue')) ||
      (String(templateKey || '').toUpperCase() === 'TEMPLATE_4' &&
        column.key === 'valueAddition')
    ) {
      return (
        <Input
          type="number"
          value={Number(item?.[column.key] || 0).toFixed(2)}
          readOnly
          className={baseClassName}
        />
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
          readOnly={column.readOnly}
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
    <div className="flex flex-col gap-4" style={{ minWidth: 0, maxWidth: '100%' }}>

      <style>{`
      @media (max-width: 640px) {
        /* FOB summary — card layout on mobile */
        .vt-fob-table { width: 100%; }
        .vt-fob-table thead { display: none; }
        .vt-fob-table tbody { display: flex; flex-direction: column; gap: 0; }
        .vt-fob-table tbody tr {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .vt-fob-table tbody tr td:first-child {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6b7280;
          padding: 0 !important;
          margin-bottom: 4px;
        }
        .vt-fob-table tbody tr td {
          padding: 0 !important;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vt-fob-table tbody tr td::before {
          content: attr(data-label);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #b8922a;
          min-width: 40px;
          flex-shrink: 0;
        }
        .vt-fob-table tbody tr td:first-child::before {
          display: none;
        }
        .vt-fob-table tbody tr td input {
          flex: 1;
          min-width: 0;
          font-size: 12px !important;
        }

        /* Valuation table cells — tighter */
        .valuation-table th,
        .valuation-table td {
          padding: 4px 6px !important;
          font-size: 11px !important;
          white-space: nowrap;
        }
      }
        @media (max-width: 640px) {
        .valuation-table th {
          white-space: normal !important;
          word-break: break-word;
          font-size: 9px !important;
          padding: 4px 4px !important;
          line-height: 1.3;
          min-width: 40px;
        }
        .valuation-table td {
          padding: 4px 4px !important;
          font-size: 11px !important;
        }
        .valuation-table input,
        .valuation-table select {
          min-width: 40px !important;
          max-width: 80px !important;
          font-size: 11px !important;
          padding: 2px 4px !important;
        }
      }
    `}</style>

      {/* Stock Value (display-only, live remaining balance, color-coded by status) */}
      {sectionKey === 'valuationTable' && businessProfile?.stockValueName ? (
        <div
          className={`rounded-2xl border px-4 py-3 transition-colors duration-300 ${stockValueStyles[stockValueStatus]}`}
          style={{ width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                Stock Value:
              </span>
              <span className="text-sm font-semibold" style={{ wordBreak: 'break-word', textAlign: 'right' }}>
                LKR {stockValueNumber.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                Remaining:
              </span>
              <span className="text-sm font-semibold" style={{ wordBreak: 'break-word', textAlign: 'right' }}>
                LKR {remainingStockValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
            {isStockExhausted ? (
              <p className="text-xs font-medium leading-relaxed">
                You have reached your stock value, please contact NGJA for increase it or more details.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

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
              {tableConfig.allowRemoveRows && <th className="px-4 py-3" style={isMobile ? { display: 'none' } : {}}>Actions</th>}
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
                const item = watch(itemsPath)?.[index] || items[index] || {}
                return (
                  <tr
                    key={field.id}
                    onClick={() => {
                      if (isMobile) {
                        setMobileModal({ mode: 'edit', index, item: { ...item } })
                      }
                    }}
                    style={isMobile ? { cursor: 'pointer' } : {}}
                  >
                    {tableConfig.columns.map((column) => (
                      <td key={`${field.id}-${column.key}`} className="px-4 py-3">
                        {renderFieldInput(column, index, item[column.key], item)}
                      </td>
                    ))}
                    {tableConfig.allowRemoveRows && (
                      <td className="px-4 py-3" style={isMobile ? { display: 'none' } : {}}>
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
        <button
          type="button"
          onClick={() => {
            if (isValuationTable && !selectedCurrency) {
              if (typeof pushToast === 'function') {
                pushToast({
                  title: 'Currency required',
                  message: 'Select a currency before adding items to the table.',
                  tone: 'danger',
                })
              }
              return
            }

            // NEW: block adding another item until the last one is complete
            if (!canAddNewItem()) return

            if (isMobile) {
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
              setMobileModal({ mode: 'add', item: defaultItem })
            } else {
              addItem()
            }
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, width: '100%', padding: '0.75rem', borderRadius: 12,
            border: '1.5px dashed #b8922a', background: '#fffaf1',
            color: '#b8922a', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '0.02em', transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fdf0d8'; e.currentTarget.style.borderStyle = 'solid' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fffaf1'; e.currentTarget.style.borderStyle = 'dashed' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8922a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Item
        </button>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Total Pieces" type="number" value={totals.totalPieces.toFixed(2)} readOnly />
        <Input label="Total Weight" type="number" value={totals.totalWeight.toFixed(2)} readOnly />
        <Input label={`Total Amount (${selectedCurrency || 'USD'})`} type="number" value={totals.totalAmount.toFixed(2)} readOnly />
      </div>

      {tableConfig.totals?.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {'totalMetalWeight' in totals.totalsMap && <Input label="Total Metal Weight" type="number" value={(totals.totalsMap.totalMetalWeight || 0).toFixed(2)} readOnly />}
          {'totalMainStoneWeight' in totals.totalsMap && <Input label="Total Main Stone Weight" type="number" value={(totals.totalsMap.totalMainStoneWeight || 0).toFixed(2)} readOnly />}
          {'totalOtherStoneWeight' in totals.totalsMap && <Input label="Total Other Stone Weight" type="number" value={(totals.totalsMap.totalOtherStoneWeight || 0).toFixed(2)} readOnly />}
          {'totalCombinedWeight' in totals.totalsMap && <Input label="Total Combined Weight" type="number" value={(totals.totalsMap.totalCombinedWeight || 0).toFixed(2)} readOnly />}
          {'totalValueAddition' in totals.totalsMap && <Input label="Total Value Addition" type="number" value={(totals.totalsMap.totalValueAddition || 0).toFixed(2)} readOnly />}
          {'totalImportValue' in totals.totalsMap && <Input label="Total Import Value" type="number" value={(totals.totalsMap.totalImportValue || 0).toFixed(2)} readOnly />}
          {'totalValue' in totals.totalsMap && <Input label={`Total Value (${selectedCurrency || 'USD'})`} type="number" value={(totals.totalsMap.totalValue || 0).toFixed(2)} readOnly />}
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
            <table className="vt-fob-table min-w-full text-left text-sm">
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
                    {showOtherCurrency && (
                      <td className="px-4 py-3" data-label={selectedCurrency}>
                        <Input type="number" value={valueAdditionUsd.toFixed(2)} readOnly />
                      </td>
                    )}
                    <td className="px-4 py-3" data-label="USD">
                      <Input type="number" value={
                        showOtherCurrency
                          ? ((valueAdditionUsd * otherRateToLkr) / usdRateToLkr).toFixed(2)
                          : valueAdditionUsd.toFixed(2)
                      } readOnly />
                    </td>
                    <td className="px-4 py-3" data-label="LKR">
                      <Input type="number" value={valueAdditionLkr.toFixed(2)} readOnly />
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink-700">FOB</td>
                  {showOtherCurrency && (
                    <td className="px-4 py-3" data-label={selectedCurrency}>
                      <Input type="number" value={fobOther.toFixed(2)} readOnly />
                    </td>
                  )}
                  <td className="px-4 py-3" data-label="USD">
                    <Input type="number" value={(showOtherCurrency ? fobOtherUsd : fobUsd).toFixed(2)} readOnly />
                  </td>
                  <td className="px-4 py-3" data-label="LKR">
                    <Input type="number" value={(showOtherCurrency ? fobOtherLkr : fobLkr).toFixed(2)} readOnly />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink-700">Freight</td>
                  {showOtherCurrency && (
                    <td className="px-4 py-3" data-label={selectedCurrency}>
                      <Input type="number" min="0" placeholder="0.00" {...register(`${exchangeRatePath}.freightOther`, { valueAsNumber: true, min: 0 })} />
                    </td>
                  )}
                  <td className="px-4 py-3" data-label="USD">
                    {showOtherCurrency
                      ? <Input type="number" value={freightOtherUsd.toFixed(2)} readOnly />
                      : <Input type="number" min="0" placeholder="0.00" {...register(`${exchangeRatePath}.freight`, { valueAsNumber: true, min: 0 })} />}
                  </td>
                  <td className="px-4 py-3" data-label="LKR">
                    <Input type="number" value={(showOtherCurrency ? freightOtherLkr : freightLkr).toFixed(2)} readOnly />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink-700">Insurance</td>
                  {showOtherCurrency && (
                    <td className="px-4 py-3" data-label={selectedCurrency}>
                      <Input type="number" min="0" placeholder="0.00" {...register(`${exchangeRatePath}.insuranceOther`, { valueAsNumber: true, min: 0 })} />
                    </td>
                  )}
                  <td className="px-4 py-3" data-label="USD">
                    {showOtherCurrency
                      ? <Input type="number" value={insuranceOtherUsd.toFixed(2)} readOnly />
                      : <Input type="number" min="0" placeholder="0.00" {...register(`${exchangeRatePath}.insurance`, { valueAsNumber: true, min: 0 })} />}
                  </td>
                  <td className="px-4 py-3" data-label="LKR">
                    <Input type="number" value={(showOtherCurrency ? insuranceOtherLkr : insuranceLkr).toFixed(2)} readOnly />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink-700">CIF</td>
                  {showOtherCurrency && (
                    <td className="px-4 py-3" data-label={selectedCurrency}>
                      <Input type="number" value={cifOther.toFixed(2)} readOnly />
                    </td>
                  )}
                  <td className="px-4 py-3" data-label="USD">
                    <Input type="number" value={(showOtherCurrency ? cifOtherUsd : cifUsd).toFixed(2)} readOnly />
                  </td>
                  <td className="px-4 py-3" data-label="LKR">
                    <Input type="number" value={(showOtherCurrency ? cifOtherLkr : cifLkr).toFixed(2)} readOnly />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mobileModal && (
        <MobileItemModal
          columns={tableConfig.columns}
          item={mobileModal.item}
          index={mobileModal.mode === 'edit' ? mobileModal.index : fields.length}
          isNew={mobileModal.mode === 'add'}
          getColumnOptions={getColumnOptions}
          templateKey={templateKey}
          onClose={() => setMobileModal(null)}
          onSave={(localItem, index) => {
            if (mobileModal.mode === 'add') {
              // set itemNo then append
              localItem.itemNo = fields.length + 1
              localItem.isDone = true
              // compute amount same as handleRowDone
              const toCtMap = { ct: 1, gr: 5, g: 5, kg: 5000 }
              const fromCtMap = { ct: 1, gr: 1 / 5, g: 1 / 5, kg: 1 / 5000 }
              if (String(templateKey || '').toUpperCase() === 'TEMPLATE_3') {
                const weight = Number(localItem.weight) || 0
                const ratePer = Number(localItem.ratePer) || 0
                const importValue = Number(localItem.importValue) || 0
                const weightUnit = String(localItem.weightUnit || '').toLowerCase().trim()
                const rateUnit = String(localItem.rateUnit || '').toLowerCase().trim()
                const weightInCt = weight * (toCtMap[weightUnit] || 1)
                const weightInRateUnit = weightInCt * (fromCtMap[rateUnit] || 1)
                localItem.valueAddition = Number((weightInRateUnit * ratePer).toFixed(2))
                localItem.totalValue = Number((localItem.valueAddition + importValue).toFixed(2))
              } else if (String(templateKey || '').toUpperCase() === 'TEMPLATE_4') {
                const numberOfItems = Number(localItem.numberOfItems) || 0
                const ratePerUnit = Number(localItem.ratePerUnit) || 0
                const importValue = Number(localItem.importValue) || 0
                localItem.valueAddition = Number((numberOfItems * ratePerUnit).toFixed(2))
                localItem.amount = Number((localItem.valueAddition + importValue).toFixed(2))
              } else {
                const weight = Number(localItem[weightKey]) || 0
                const ratePer = Number(localItem[rateKey]) || 0
                const weightUnit = String(localItem.weightUnit || '').toLowerCase().trim()
                const rateUnit = String(localItem.rateUnit || '').toLowerCase().trim()
                const weightInCt = weight * (toCtMap[weightUnit] || 1)
                const weightInRateUnit = weightInCt * (fromCtMap[rateUnit] || 1)
                localItem[amountKey] = Number((weightInRateUnit * ratePer).toFixed(2))
              }
              append(localItem)
            } else {
              // edit — run same computation then update
              const toCtMap = { ct: 1, gr: 5, g: 5, kg: 5000 }
              const fromCtMap = { ct: 1, gr: 1 / 5, g: 1 / 5, kg: 1 / 5000 }
              localItem.isDone = true
              if (String(templateKey || '').toUpperCase() === 'TEMPLATE_3') {
                const weight = Number(localItem.weight) || 0
                const ratePer = Number(localItem.ratePer) || 0
                const importValue = Number(localItem.importValue) || 0
                const weightUnit = String(localItem.weightUnit || '').toLowerCase().trim()
                const rateUnit = String(localItem.rateUnit || '').toLowerCase().trim()
                const weightInCt = weight * (toCtMap[weightUnit] || 1)
                const weightInRateUnit = weightInCt * (fromCtMap[rateUnit] || 1)
                localItem.valueAddition = Number((weightInRateUnit * ratePer).toFixed(2))
                localItem.totalValue = Number((localItem.valueAddition + importValue).toFixed(2))
              } else if (String(templateKey || '').toUpperCase() === 'TEMPLATE_4') {
                const numberOfItems = Number(localItem.numberOfItems) || 0
                const ratePerUnit = Number(localItem.ratePerUnit) || 0
                const importValue = Number(localItem.importValue) || 0
                localItem.valueAddition = Number((numberOfItems * ratePerUnit).toFixed(2))
                localItem.amount = Number((localItem.valueAddition + importValue).toFixed(2))
              } else {
                const weight = Number(localItem[weightKey]) || 0
                const ratePer = Number(localItem[rateKey]) || 0
                const weightUnit = String(localItem.weightUnit || '').toLowerCase().trim()
                const rateUnit = String(localItem.rateUnit || '').toLowerCase().trim()
                const weightInCt = weight * (toCtMap[weightUnit] || 1)
                const weightInRateUnit = weightInCt * (fromCtMap[rateUnit] || 1)
                localItem[amountKey] = Number((weightInRateUnit * ratePer).toFixed(2))
              }
              update(mobileModal.index, localItem)
            }
          }}
          onDelete={(index) => remove(index)}
        />
      )}
    </div>
  )
}

export default ValuationTable