import { useCallback, useEffect, useState } from 'react'
import { FileEdit, Inbox, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useApp } from '../../context/AppContext'

const PAGE_SIZE_OPTIONS = [10, 15, 20]

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

const formatDate = (iso) => {
  if (!iso) return 'N/A'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
      STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200'
    }`}
  >
    {status || 'unknown'}
  </span>
)

const TableSkeleton = () => (
  <tbody>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b border-white/5">
        {Array.from({ length: 7 }).map((__, j) => (
          <td key={j} className="px-4 py-4">
            <div className="h-3.5 w-full max-w-[120px] animate-pulse rounded bg-slate-200" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
)

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200">
      <Inbox className="h-6 w-6 text-slate-400" />
    </div>
    <p className="text-sm font-medium text-slate-700">No edit requests found</p>
    <p className="max-w-sm text-xs text-slate-500">
      There are currently no pending data edit requests to review. New submissions will appear here automatically.
    </p>
  </div>
)

const PendingEditRequests = () => {
  const { user } = useApp()
  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRequests = useCallback(async (page, limit) => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getEditRequests(page, limit)
      setRequests(data?.requests || [])
      setPagination({
        page: data?.pagination?.page || page,
        limit: data?.pagination?.limit || limit,
        total: data?.pagination?.total || 0,
        totalPages: data?.pagination?.totalPages || 1,
      })
    } catch (err) {
      setError(err?.message || 'Failed to load edit requests')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchRequests(1, pagination.limit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return
    fetchRequests(nextPage, pagination.limit)
  }

  const handleLimitChange = (nextLimit) => {
    fetchRequests(1, Number(nextLimit))
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-slate-200">
            <FileEdit className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Pending User Data Edit Requests</h2>
            <p className="text-xs text-slate-500">
              {pagination.total > 0 ? `${pagination.total} request${pagination.total === 1 ? '' : 's'} awaiting review` : 'Review dealer edit submissions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-xs text-slate-500">
            Rows per page
          </label>
          <select
            id="page-size"
            value={pagination.limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-400"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size} className="bg-white text-slate-700">
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Table / Empty / Loading */}
      {!loading && !error && requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Dealer', 'Assigned Admin', 'TIN', 'Stock Value', 'Gem Dealer File No.', 'Status', 'Submitted'].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton />
            ) : (
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{req.userName || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{req.assignedAdminName || 'Unassigned'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{req.tin || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{req.stockValueName || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{req.gemDealerFileNo || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{formatDate(req.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && requests.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500">
            Page <span className="font-medium text-slate-800">{pagination.page}</span> of{' '}
            <span className="font-medium text-slate-800">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading requests…
        </div>
      )}
    </div>
  )
}

export default PendingEditRequests