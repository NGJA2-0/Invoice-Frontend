import { useCallback, useEffect, useRef, useState } from 'react'
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

// 5 minute client-side cache, keyed by the exact page/limit/status combination.
// Kept at module scope (not inside the component / useRef) so it survives
// the component unmounting when the user navigates to another tab and
// remounting when they come back — a component-scoped ref would reset to
// empty on every remount, defeating the cache.
const CACHE_TTL = 5 * 60 * 1000
const cacheKey = (page, limit, status) => `${page}|${limit}|${status || ''}`

// key -> { data, timestamp }
const usersCache = new Map()
// A single background auto-refresh timer, shared across mounts. We only
// ever need one active timer for whichever page/limit/status is currently
// being viewed.
let autoRefreshTimer = null

const emptyData = { users: [], total: 0, page: 1, limit: 10, totalPages: 1 }

const Users = () => {
  const { refreshUsersSummary } = useApp()

  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)

  const [displayData, setDisplayData] = useState(emptyData)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Guards against setState calls after the component has unmounted
  // (e.g. a silent background refresh resolving while the user is on another tab)
  const mountedRef = useRef(true)

  const scheduleAutoRefresh = useCallback((delay, p, l, s) => {
    if (autoRefreshTimer) clearTimeout(autoRefreshTimer)
    autoRefreshTimer = setTimeout(() => {
      loadUsers(p, l, s, { force: true, silent: true })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, Math.max(delay, 0))
  }, [])

  const loadUsers = useCallback(
    async (p, l, s, opts = {}) => {
      const { force = false, silent = false } = opts
      const key = cacheKey(p, l, s)
      const cached = usersCache.get(key)
      const age = cached ? Date.now() - cached.timestamp : Infinity
      const isFresh = cached && age < CACHE_TTL

      if (!force && isFresh) {
        setDisplayData(cached.data)
        setLastUpdated(cached.timestamp)
        scheduleAutoRefresh(CACHE_TTL - age, p, l, s)
        return
      }

      if (silent) setRefreshing(true)
      else setLoading(true)

      try {
        const data = await refreshUsersSummary({ page: p, limit: l, status: s || undefined })
        const normalized = {
          users: Array.isArray(data?.users) ? data.users : [],
          total: data?.total || 0,
          page: data?.page || p,
          limit: data?.limit || l,
          totalPages: data?.totalPages || 1,
        }
        const timestamp = Date.now()
        usersCache.set(key, { data: normalized, timestamp })

        // Only touch state if we're still mounted (e.g. a silent refresh
        // may resolve after the user has navigated away to another tab)
        if (mountedRef.current) {
          setDisplayData(normalized)
          setLastUpdated(timestamp)
        }
        scheduleAutoRefresh(CACHE_TTL, p, l, s)
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [refreshUsersSummary, scheduleAutoRefresh],
  )

  // On mount: if we already have a fresh cached entry for the current
  // page/limit/status (e.g. user came back from another tab), show it
  // immediately without calling the API.
  useEffect(() => {
    mountedRef.current = true
    const key = cacheKey(page, limit, status)
    const cached = usersCache.get(key)
    const age = cached ? Date.now() - cached.timestamp : Infinity
    if (cached && age < CACHE_TTL) {
      setDisplayData(cached.data)
      setLastUpdated(cached.timestamp)
      scheduleAutoRefresh(CACHE_TTL - age, page, limit, status)
    }
    return () => {
      mountedRef.current = false
    }
    // Only run this "restore from cache on mount" check once, on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Status or page-size change -> reset to page 1 and (re)fetch, respecting cache
  useEffect(() => {
    setPage(1)
    loadUsers(1, limit, status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, limit])

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > displayData.totalPages) return
    setPage(nextPage)
    loadUsers(nextPage, limit, status)
  }

  const handleManualRefresh = () => {
    loadUsers(page, limit, status, { force: true })
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return ''
    const seconds = Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000))
    if (seconds < 5) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
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

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-100 bg-white/70 px-3 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
              Refresh
            </button>
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
              {displayData.users.map((user) => (
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

              {!loading && displayData.users.length === 0 && (
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
          {displayData.users.map((user) => (
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

          {!loading && displayData.users.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-ink-500">No users found.</p>
          )}
        </div>

        {loading && (
          <div className="px-6 py-10 text-center text-sm text-ink-500">Loading users…</div>
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-ink-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            Page {displayData.page} of {displayData.totalPages} · {displayData.total} users
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
              disabled={page >= displayData.totalPages}
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