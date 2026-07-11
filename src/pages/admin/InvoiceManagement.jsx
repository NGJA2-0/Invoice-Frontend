import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminService } from '../../services/adminService'

const STATUS_GROUPS = [
  {
    label: 'General',
    options: ['draft', 'submitted', 'approved', 'rejected'],
  },
  {
    label: 'Stage 1',
    options: [
      'stage1_in_progress',
      'stage1_pending_user_approval',
      'stage1_user_rejected',
      'stage1_approved',
      'stage1_rejected',
      'stage1_completed',
    ],
  },
  {
    label: 'Stage 2',
    options: [
      'stage2_in_progress',
      'stage2_pending_user_approval',
      'stage2_user_rejected',
      'stage2_approved',
      'stage2_rejected',
      'stage2_completed',
    ],
  },
  {
    label: 'Stage 3',
    options: [
      'stage3_in_progress',
      'stage3_pending_user_approval',
      'stage3_user_rejected',
      'stage3_rejected',
      'stage3_completed',
    ],
  },
  {
    label: 'Final',
    options: ['completed'],
  },
]

const PAGE_SIZE_OPTIONS = [10, 15, 20]

// Turns "stage2_pending_user_approval" into "Stage 2 · Pending User Approval"
const formatStatusLabel = (status) => {
  if (!status) return 'Unknown'
  const stageMatch = status.match(/^stage(\d)_(.+)$/)
  const toTitle = (s) =>
    s
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  if (stageMatch) {
    return `Stage ${stageMatch[1]} · ${toTitle(stageMatch[2])}`
  }
  return toTitle(status)
}

const getStatusTone = (status = '') => {
  if (status === 'draft') return 'slate'
  if (status === 'submitted') return 'sky'
  if (status.endsWith('_in_progress')) return 'amber'
  if (status.endsWith('_pending_user_approval')) return 'violet'
  if (status.endsWith('_user_rejected') || status.endsWith('_rejected') || status === 'rejected') return 'rose'
  if (status.endsWith('_approved') || status.endsWith('_completed') || status === 'approved' || status === 'completed') return 'emerald'
  return 'slate'
}

const STATUS_TONE_CLASSES = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-600/15',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

const StatusBadge = ({ status }) => {
  const tone = getStatusTone(status)
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE_CLASSES[tone]}`}
    >
      {formatStatusLabel(status)}
    </span>
  )
}

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatCurrency = (value) => {
  const amount = Number(value)
  if (Number.isNaN(amount)) return 'N/A'
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Defensively unwrap whatever shape the API returns the list + pagination in.
const extractInvoiceList = (res) => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.invoices)) return res.data.invoices
  if (Array.isArray(res?.invoices)) return res.invoices
  return []
}

const extractPagination = (res, fallbackPage, fallbackLimit) => {
  const p = res?.pagination || res?.data?.pagination || {}
  return {
    currentPage: p.currentPage || p.page || fallbackPage,
    totalPages: p.totalPages || 1,
    totalRecords: p.totalRecords || p.total || 0,
    hasNextPage: p.hasNextPage ?? false,
    hasPreviousPage: p.hasPreviousPage ?? false,
    pageSize: p.pageSize || p.limit || fallbackLimit,
  }
}

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [status, setStatus] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    pageSize: 10,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminService.getSuperAdminInvoices({ page, limit, status: status || undefined })
      setInvoices(extractInvoiceList(res))
      setPagination(extractPagination(res, page, limit))
    } catch (err) {
      setError(err?.message || 'Failed to load invoices.')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [page, limit, status])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value))
    setPage(1)
  }

  const rangeLabel = useMemo(() => {
    if (!pagination.totalRecords) return '0 results'
    const start = (pagination.currentPage - 1) * pagination.pageSize + 1
    const end = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)
    return `${start}–${end} of ${pagination.totalRecords}`
  }, [pagination])

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">Invoice Management</h3>
        <p className="mt-2 text-sm text-ink-600">
          Monitor export invoices submitted by dealers across every stage of review.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card flex flex-col gap-4 rounded-2xl border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status-filter" className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={handleStatusChange}
            className="w-full min-w-[220px] rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 shadow-sm outline-none transition focus:border-ink-400 focus:ring-2 focus:ring-ink-200 sm:w-auto"
          >
            <option value="">All statuses</option>
            {STATUS_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {formatStatusLabel(opt)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="limit-filter" className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Rows per page
          </label>
          <select
            id="limit-filter"
            value={limit}
            onChange={handleLimitChange}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 shadow-sm outline-none transition focus:border-ink-400 focus:ring-2 focus:ring-ink-200 sm:w-28"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data */}
      <div className="glass-card overflow-hidden rounded-2xl border">
        {error && (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3 px-6 py-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-ink-100/70" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-base font-medium text-ink-800">No invoices found</p>
            <p className="text-sm text-ink-500">Try adjusting the status filter to see more results.</p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                    <th className="px-6 py-3 font-medium">Invoice</th>
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Export type</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Created by</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                    <th className="px-6 py-3 font-medium">Updated</th>
                    <th className="px-6 py-3 text-right font-medium">CIF (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="transition hover:bg-ink-50/50">
                      <td className="px-6 py-4 font-semibold text-ink-900">{invoice.invoiceNumber || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink-800">{invoice.companyName || 'N/A'}</div>
                        <div className="mt-0.5 max-w-[220px] truncate text-xs text-ink-500">
                          {invoice.companyAddress || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[240px] text-ink-700">
                        <span className="line-clamp-2">{invoice.exportType || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-ink-700">{invoice.createdBy?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-ink-600">{formatDate(invoice.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-ink-600">{formatDate(invoice.updatedAt)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-ink-900">
                        {formatCurrency(invoice.cifLkr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col divide-y divide-ink-100 md:hidden">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{invoice.invoiceNumber || 'N/A'}</p>
                      <p className="mt-0.5 text-xs text-ink-500">{invoice.companyName || 'N/A'}</p>
                    </div>
                    <StatusBadge status={invoice.status} />
                  </div>

                  <p className="text-xs text-ink-500">{invoice.companyAddress || 'N/A'}</p>
                  <p className="text-xs text-ink-600">{invoice.exportType || 'N/A'}</p>

                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-ink-50/60 p-3 text-xs">
                    <div>
                      <p className="text-ink-400">Created by</p>
                      <p className="mt-0.5 font-medium text-ink-700">{invoice.createdBy?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-ink-400">CIF (LKR)</p>
                      <p className="mt-0.5 font-medium text-ink-700">{formatCurrency(invoice.cifLkr)}</p>
                    </div>
                    <div>
                      <p className="text-ink-400">Created</p>
                      <p className="mt-0.5 font-medium text-ink-700">{formatDate(invoice.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-ink-400">Updated</p>
                      <p className="mt-0.5 font-medium text-ink-700">{formatDate(invoice.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && invoices.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-100 px-6 py-4 sm:flex-row">
            <p className="text-xs text-ink-500">{rangeLabel}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPreviousPage && pagination.currentPage <= 1}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-medium text-ink-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage && pagination.currentPage >= pagination.totalPages}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceManagement