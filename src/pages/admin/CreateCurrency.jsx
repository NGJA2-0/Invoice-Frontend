import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Coins, Save } from 'lucide-react'
import { currencyApi } from '../../services/currencyApi'
import { useApp } from '../../context/AppContext'

const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const inputCls =
  'px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow'

const CreateCurrency = () => {
  const navigate = useNavigate()
  const { pushToast } = useApp()

  const [form, setForm] = useState({
    currencyCode: '',
    currencyName: '',
    symbol: '',
    exchangeRate: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.currencyCode.trim()) e.currencyCode = 'Currency code is required.'
    else if (form.currencyCode.length > 10) e.currencyCode = 'Max 10 characters.'
    if (!form.currencyName.trim()) e.currencyName = 'Currency name is required.'
    else if (form.currencyName.length > 100) e.currencyName = 'Max 100 characters.'
    if (form.symbol && form.symbol.length > 10) e.symbol = 'Max 10 characters.'
    if (!form.exchangeRate) e.exchangeRate = 'Exchange rate is required.'
    else if (isNaN(Number(form.exchangeRate)) || Number(form.exchangeRate) <= 0)
      e.exchangeRate = 'Must be a number greater than zero.'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      await currencyApi.create({
        currencyCode: form.currencyCode.trim().toUpperCase(),
        currencyName: form.currencyName.trim(),
        symbol: form.symbol.trim() || undefined,
        exchangeRate: Number(form.exchangeRate),
      })
      pushToast({
        title: 'Currency Created',
        message: `${form.currencyCode.toUpperCase()} has been added.`,
        tone: 'success',
      })
      navigate('/admin/currencies')
    } catch (err) {
      const msg = err?.message || 'Failed to create currency.'
      pushToast({ title: 'Error', message: msg, tone: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
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
          <div className="p-2 rounded-lg bg-amber-100">
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">New Currency</h2>
            <p className="text-xs text-gray-500">
              Exchange rate = value of 1 unit in LKR
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Currency Code" required error={errors.currencyCode}>
            <input
              className={`${inputCls} uppercase`}
              placeholder="USD"
              maxLength={10}
              value={form.currencyCode}
              onChange={(e) =>
                setForm((p) => ({ ...p, currencyCode: e.target.value.toUpperCase() }))
              }
            />
          </Field>

          <Field label="Symbol" error={errors.symbol}>
            <input
              className={inputCls}
              placeholder="$"
              maxLength={10}
              value={form.symbol}
              onChange={set('symbol')}
            />
          </Field>

          <Field label="Currency Name" required error={errors.currencyName}>
            <input
              className={`${inputCls} sm:col-span-2`}
              placeholder="US Dollar"
              maxLength={100}
              value={form.currencyName}
              onChange={set('currencyName')}
            />
          </Field>

          <Field label="Exchange Rate (LKR)" required error={errors.exchangeRate}>
            <div className="relative">
              <input
                className={`${inputCls} w-full pr-16`}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="300.50"
                value={form.exchangeRate}
                onChange={set('exchangeRate')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                LKR
              </span>
            </div>
            {form.exchangeRate && Number(form.exchangeRate) > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                1 {form.currencyCode || '?'} = {Number(form.exchangeRate).toFixed(2)} LKR
              </p>
            )}
          </Field>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => navigate('/admin/currencies')}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating…' : 'Create Currency'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateCurrency