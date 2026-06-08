import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Coins,
} from 'lucide-react'
import { currencyApi } from '../../services/currencyApi'
import { useApp } from '../../context/AppContext'

const LIMIT = 10

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-red-100 text-red-600'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
)

const Currencies = () => {
  const navigate = useNavigate()
  const { pushToast } = useApp()

  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('') // '', 'true', 'false'
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const totalPages = Math.ceil(total / LIMIT)

  const fetchCurrencies = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (search.trim()) params.search = search.trim()
      if (filterActive !== '') params.isActive = filterActive
      const data = await currencyApi.getAll(params)
      // Support both { currencies, total } and flat array responses
      if (Array.isArray(data)) {
        setCurrencies(data)
        setTotal(data.length)
      } else {
        setCurrencies(data?.currencies || data?.data || [])
        setTotal(data?.total || 0)
      }
    } catch (err) {
      pushToast({ title: 'Error', message: 'Failed to load currencies.', tone: 'error' })
    } finally {
      setLoading(false)
    }
  }, [page, search, filterActive])

  useEffect(() => {
    fetchCurrencies()
  }, [fetchCurrencies])

  // Debounce search — reset to page 1 on new search
  useEffect(() => {
    setPage(1)
  }, [search, filterActive])

  const handleToggleStatus = async (currency) => {
    setTogglingId(currency._id)
    try {
      await currencyApi.updateStatus(currency._id, !currency.isActive)
      pushToast({
        title: 'Updated',
        message: `${currency.currencyCode} is now ${!currency.isActive ? 'active' : 'inactive'}.`,
        tone: 'success',
      })
      fetchCurrencies()
    } catch {
      pushToast({ title: 'Error', message: 'Status update failed.', tone: 'error' })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (currency) => {
    if (!window.confirm(`Delete ${currency.currencyCode} (${currency.currencyName})?`)) return
    setDeletingId(currency._id)
    try {
      await currencyApi.delete(currency._id)
      pushToast({
        title: 'Deleted',
        message: `${currency.currencyCode} has been removed.`,
        tone: 'success',
      })
      fetchCurrencies()
    } catch {
      pushToast({ title: 'Error', message: 'Delete failed.', tone: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Currency Management</h1>
            <p className="text-sm text-gray-500">Manage exchange rates against LKR</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/currencies/bulk-update')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Bulk Update
          </button>
          <button
            onClick={() => navigate('/admin/currencies/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Currency
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Symbol</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Rate (LKR)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Updated By</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : currencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Coins className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No currencies found.
                  </td>
                </tr>
              ) : (
                currencies.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-gray-900">{c.currencyCode}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.currencyName}</td>
                    <td className="px-4 py-3 font-medium text-gray-600">{c.symbol || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900">
                      {Number(c.exchangeRate).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={c.isActive} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {c.updatedBy || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/admin/currencies/${c._id}`)}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Toggle status */}
                        <button
                          onClick={() => handleToggleStatus(c)}
                          disabled={togglingId === c._id}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors disabled:opacity-40"
                          title={c.isActive ? 'Disable' : 'Enable'}
                        >
                          {c.isActive
                            ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                            : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={deletingId === c._id}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} — {total} total
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Currencies