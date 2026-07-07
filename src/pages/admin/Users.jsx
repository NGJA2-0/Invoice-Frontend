import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const LIMIT_OPTIONS = [10, 15, 20]

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

const formatStatusLabel = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'

const Users = () => {
  const { usersSummary, usersSummaryPagination, refreshUsersSummary } = useApp()
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const loadUsers = useCallback(
    async (nextPage, nextLimit, nextStatus) => {
      setLoading(true)
      try {
        await refreshUsersSummary({
          page: nextPage,
          limit: nextLimit,
          status: nextStatus || undefined,
        })
      } finally {
        setLoading(false)
      }
    },
    [refreshUsersSummary],
  )

  // Reload from page 1 whenever the status filter or page size changes
  useEffect(() => {
    setPage(1)
    loadUsers(1, limit, status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, limit])

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > usersSummaryPagination.totalPages) return
    setPage(nextPage)
    loadUsers(nextPage, limit, status)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-ink-900">Users</h3>
            <p className="mt-2 text-sm text-ink-600">
              Manage NGJA export system users.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-ink-100 bg-white/70 px-3 py-2 text-sm font-medium text-ink-700 shadow-sm outline-none transition focus:border-ink-300 focus:ring-2 focus:ring-ink-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-xl border border-ink-100 bg-white/70 px-3 py-2 text-sm font-medium text-ink-700 shadow-sm outline-none transition focus:border-ink-300 focus:ring-2 focus:ring-ink-100"
            >
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl border">
        {/* Desktop / tablet table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-ink-100">
            <thead className="bg-ink-50/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Full Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  NIC
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Mobile Numbers
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {usersSummary.map((user) => (
                <tr key={user.id} className="transition hover:bg-ink-50/50">
                  <td className="px-6 py-4 text-sm font-semibold text-ink-900">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-600">{user.nic}</td>
                  <td className="px-6 py-4 text-sm text-ink-600">
                    <div className="flex flex-wrap gap-1.5">
                      {(user.mobileNumbers || []).map((num) => (
                        <span
                          key={num}
                          className="rounded-lg bg-ink-50 px-2 py-1 text-xs font-medium text-ink-700"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLES[user.status] || 'bg-ink-50 text-ink-600 ring-1 ring-ink-100'
                      }`}
                    >
                      {formatStatusLabel(user.status)}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && usersSummary.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-ink-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="divide-y divide-ink-100 md:hidden">
          {usersSummary.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">{user.fullName}</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[user.status] || 'bg-ink-50 text-ink-600 ring-1 ring-ink-100'
                  }`}
                >
                  {formatStatusLabel(user.status)}
                </span>
              </div>
              <p className="text-xs text-ink-500">NIC: {user.nic}</p>
              <div className="flex flex-wrap gap-1.5">
                {(user.mobileNumbers || []).map((num) => (
                  <span
                    key={num}
                    className="rounded-lg bg-ink-50 px-2 py-1 text-xs font-medium text-ink-700"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {!loading && usersSummary.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-ink-500">No users found.</p>
          )}
        </div>

        {loading && (
          <div className="px-6 py-10 text-center text-sm text-ink-500">Loading users…</div>
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-ink-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            Page {usersSummaryPagination.page} of {usersSummaryPagination.totalPages} ·{' '}
            {usersSummaryPagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-ink-100 px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= usersSummaryPagination.totalPages}
              className="rounded-lg border border-ink-100 px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users