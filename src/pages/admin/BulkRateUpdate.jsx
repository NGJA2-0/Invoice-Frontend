import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'
import { currencyApi } from '../../services/currencyApi'
import { useApp } from '../../context/AppContext'

const inputCls =
  'px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow'

const emptyRow = () => ({ currencyCode: '', exchangeRate: '', _key: Date.now() + Math.random() })

const BulkRateUpdate = () => {
  const navigate = useNavigate()
  const { pushToast } = useApp()

  const [rows, setRows] = useState([emptyRow()])
  const [errors, setErrors] = useState({}) // keyed by row._key
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // success summary

  const addRow = () => setRows((prev) => [...prev, emptyRow()])

  const removeRow = (key) =>
    setRows((prev) => prev.length === 1 ? prev : prev.filter((r) => r._key !== key))

  const updateRow = (key, field, value) =>
    setRows((prev) =>
      prev.map((r) =>
        r._key === key ? { ...r, [field]: field === 'currencyCode' ? value.toUpperCase() : value } : r
      )
    )

  const validate = () => {
    const e = {}
    rows.forEach((row) => {
      const rowErr = {}
      if (!row.currencyCode.trim()) rowErr.currencyCode = 'Required'
      else if (row.currencyCode.length > 10) rowErr.currencyCode = 'Max 10 chars'
      if (!row.exchangeRate) rowErr.exchangeRate = 'Required'
      else if (isNaN(Number(row.exchangeRate)) || Number(row.exchangeRate) <= 0)
        rowErr.exchangeRate = 'Must be > 0'
      if (Object.keys(rowErr).length) e[row._key] = rowErr
    })

    // Check for duplicate codes
    const codes = rows.map((r) => r.currencyCode.trim().toUpperCase()).filter(Boolean)
    const dupes = codes.filter((c, i) => codes.indexOf(c) !== i)
    if (dupes.length) {
      rows.forEach((row) => {
        if (dupes.includes(row.currencyCode.trim().toUpperCase())) {
          e[row._key] = { ...(e[row._key] || {}), currencyCode: 'Duplicate code' }
        }
      })
    }

    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      const currencies = rows.map((r) => ({
        currencyCode: r.currencyCode.trim().toUpperCase(),
        exchangeRate: Number(r.exchangeRate),
      }))
      const data = await currencyApi.bulkUpdate(currencies)
      setResult({ count: currencies.length, updated: currencies })
      pushToast({
        title: 'Rates Updated',
        message: `${currencies.length} exchange rate${currencies.length > 1 ? 's' : ''} updated.`,
        tone: 'success',
      })
    } catch (err) {
      pushToast({ title: 'Error', message: err?.message || 'Bulk update failed.', tone: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setRows([emptyRow()])
    setErrors({})
    setResult(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/currencies')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Currencies
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-6">
        {/* Title */}
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-blue-100">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Bulk Exchange Rate Update</h2>
            <p className="text-xs text-gray-500">
              Update multiple currency rates against LKR at once
            </p>
          </div>
        </div>

        {/* Success state */}
        {result ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-700 mb-3">
                ✓ {result.count} rate{result.count > 1 ? 's' : ''} updated successfully
              </p>
              <div className="flex flex-col gap-1.5">
                {result.updated.map((r) => (
                  <div key={r.currencyCode} className="flex items-center justify-between text-sm">
                    <span className="font-mono font-semibold text-gray-700">{r.currencyCode}</span>
                    <span className="text-gray-600">
                      1 {r.currencyCode} = <strong>{r.exchangeRate.toFixed(2)}</strong> LKR
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Update More
              </button>
              <button
                onClick={() => navigate('/admin/currencies')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                View All Currencies
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Currency Code
              </span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                New Rate (LKR)
              </span>
              <span className="w-8" />
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-3">
              {rows.map((row, idx) => (
                <div key={row._key} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start">
                  <div className="flex flex-col gap-1">
                    <input
                      className={`${inputCls} uppercase font-mono`}
                      placeholder="USD"
                      maxLength={10}
                      value={row.currencyCode}
                      onChange={(e) => updateRow(row._key, 'currencyCode', e.target.value)}
                    />
                    {errors[row._key]?.currencyCode && (
                      <p className="text-xs text-red-500">{errors[row._key].currencyCode}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <input
                        className={`${inputCls} w-full pr-12`}
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="300.50"
                        value={row.exchangeRate}
                        onChange={(e) => updateRow(row._key, 'exchangeRate', e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        LKR
                      </span>
                    </div>
                    {errors[row._key]?.exchangeRate && (
                      <p className="text-xs text-red-500">{errors[row._key].exchangeRate}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeRow(row._key)}
                    disabled={rows.length === 1}
                    className="mt-1.5 p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Preview */}
            {rows.some((r) => r.currencyCode && Number(r.exchangeRate) > 0) && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Preview</p>
                <div className="flex flex-col gap-1">
                  {rows
                    .filter((r) => r.currencyCode && Number(r.exchangeRate) > 0)
                    .map((r) => (
                      <p key={r._key} className="text-sm text-gray-600">
                        1 <span className="font-mono font-semibold">{r.currencyCode}</span> ={' '}
                        <strong>{Number(r.exchangeRate).toFixed(2)}</strong> LKR
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Add row + submit */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={addRow}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add currency
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/currencies')}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Updating…' : `Update ${rows.length} Rate${rows.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BulkRateUpdate