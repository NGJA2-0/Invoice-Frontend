import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Coins,
  Save,
  Trash2,
  User,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from 'lucide-react'
import { currencyApi } from '../../services/currencyApi'
import { useApp } from '../../context/AppContext'

const inputCls =
  'px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-500'

const Field = ({ label, required, error, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const MetaRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-500">
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span className="font-medium text-gray-600">{label}:</span>
    <span>{value || '—'}</span>
  </div>
)

const CurrencyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pushToast } = useApp()

  const [currency, setCurrency] = useState(null)
  const [form, setForm] = useState({ currencyName: '', symbol: '', exchangeRate: '', isActive: true })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await currencyApi.getById(id)
        setCurrency(data)
        setForm({
          currencyName: data.currencyName || '',
          symbol: data.symbol || '',
          exchangeRate: String(data.exchangeRate || ''),
          isActive: data.isActive ?? true,
        })
      } catch {
        pushToast({ title: 'Error', message: 'Failed to load currency.', tone: 'error' })
        navigate('/admin/currencies')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.currencyName.trim()) e.currencyName = 'Currency name is required.'
    else if (form.currencyName.length > 100) e.currencyName = 'Max 100 characters.'
    if (form.symbol && form.symbol.length > 10) e.symbol = 'Max 10 characters.'
    if (!form.exchangeRate) e.exchangeRate = 'Exchange rate is required.'
    else if (isNaN(Number(form.exchangeRate)) || Number(form.exchangeRate) <= 0)
      e.exchangeRate = 'Must be greater than zero.'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await currencyApi.update(id, {
        currencyName: form.currencyName.trim(),
        symbol: form.symbol.trim() || undefined,
        exchangeRate: Number(form.exchangeRate),
      })
      pushToast({ title: 'Saved', message: 'Currency updated.', tone: 'success' })
      navigate('/admin/currencies')
    } catch (err) {
      pushToast({ title: 'Error', message: err?.message || 'Update failed.', tone: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async () => {
    setToggling(true)
    const next = !form.isActive
    try {
      await currencyApi.updateStatus(id, next)
      setForm((p) => ({ ...p, isActive: next }))
      pushToast({
        title: 'Status Updated',
        message: `${currency.currencyCode} is now ${next ? 'active' : 'inactive'}.`,
        tone: 'success',
      })
    } catch {
      pushToast({ title: 'Error', message: 'Status update failed.', tone: 'error' })
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${currency?.currencyCode}?`)) return
    setDeleting(true)
    try {
      await currencyApi.delete(id)
      pushToast({ title: 'Deleted', message: `${currency.currencyCode} removed.`, tone: 'success' })
      navigate('/admin/currencies')
    } catch {
      pushToast({ title: 'Error', message: 'Delete failed.', tone: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-xl animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-100" />
        ))}
      </div>
    )
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
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900 font-mono">
                  {currency?.currencyCode}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    form.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-500'
                  }`}
                >
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500">{currency?.baseCurrency || 'LKR'} base</p>
            </div>
          </div>

          {/* Toggle status */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {toggling
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : form.isActive
                ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                : <ToggleLeft className="w-4 h-4 text-gray-400" />}
            {form.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>

        {/* Read-only code field */}
        <Field label="Currency Code" hint="Code cannot be changed after creation.">
          <input
            className={inputCls}
            value={currency?.currencyCode || ''}
            disabled
          />
        </Field>

        {/* Editable fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Currency Name" required error={errors.currencyName}>
            <input
              className={inputCls}
              placeholder="US Dollar"
              maxLength={100}
              value={form.currencyName}
              onChange={set('currencyName')}
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
        </div>

        <Field
          label="Exchange Rate (LKR)"
          required
          error={errors.exchangeRate}
          hint={
            form.exchangeRate && Number(form.exchangeRate) > 0
              ? `1 ${currency?.currencyCode} = ${Number(form.exchangeRate).toFixed(2)} LKR`
              : undefined
          }
        >
          <div className="relative">
            <input
              className={`${inputCls} w-full pr-16`}
              type="number"
              step="0.01"
              min="0.01"
              value={form.exchangeRate}
              onChange={set('exchangeRate')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
              LKR
            </span>
          </div>
        </Field>

        {/* Audit info */}
        {(currency?.updatedBy || currency?.updatedAt || currency?.createdAt) && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Audit</p>
            {currency.updatedBy && (
              <MetaRow icon={User} label="Last updated by" value={currency.updatedBy} />
            )}
            {currency.updatedAt && (
              <MetaRow
                icon={Calendar}
                label="Updated at"
                value={new Date(currency.updatedAt).toLocaleString()}
              />
            )}
            {currency.createdAt && (
              <MetaRow
                icon={Calendar}
                label="Created at"
                value={new Date(currency.createdAt).toLocaleString()}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
          >
            {deleting
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Trash2 className="w-4 h-4" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/currencies')}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrencyDetail