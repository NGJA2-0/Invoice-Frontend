import { useEffect, useRef, useState } from 'react'
import { Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// Module-level (outside the component) so the cache survives this
// component unmounting/remounting as the admin navigates away and back,
// but is naturally cleared on a full page reload.
// Keyed by `${page}-${pageSize}` so each page/rows-per-page combo caches independently.
const registrationsCache = new Map()

const PendingRegistrations = () => {
  const { refreshPendingUsers, approvePendingUser, rejectPendingUser, pushToast, user } = useApp()

  const [registrations, setRegistrations] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [approvingId, setApprovingId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [pageSize, setPageSize] = useState(10)
  const PAGE_SIZE_OPTIONS = [10, 15, 20]
  // { type: 'approve' | 'reject', userId, businessName } | null
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const autoRefreshTimerRef = useRef(null)

  const applyResult = (res, p) => {
    setRegistrations(Array.isArray(res?.registrations) ? res.registrations : [])
    setTotalPages(res?.totalPages || 1)
    setTotal(res?.total || 0)
    setPage(p)
    setLastUpdated(Date.now())
  }

  // forceRefresh=true bypasses (and refreshes) the cache — used for the
  // manual refresh button, the 5-minute auto-refresh, and right after an
  // approve/reject action since that action changes the underlying data.
  const loadRegistrations = async (p = 1, limit = pageSize, forceRefresh = false) => {
    const cacheKey = `${p}-${limit}`
    const cached = registrationsCache.get(cacheKey)
    const isCacheFresh = cached && Date.now() - cached.timestamp < CACHE_DURATION_MS

    if (!forceRefresh && isCacheFresh) {
      applyResult(cached.data, p)
      return
    }

    // Manual/auto refresh of data already on screen shouldn't show the
    // full-page spinner — only the small refresh-button spinner.
    const isBackgroundRefresh = forceRefresh && registrations.length > 0
    if (isBackgroundRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const res = await refreshPendingUsers(p, limit)
      registrationsCache.set(cacheKey, { data: res, timestamp: Date.now() })
      applyResult(res, p)
    } catch (error) {
      pushToast({ title: 'Error', message: 'Failed to load pending registrations.', tone: 'danger' })
      if (!isBackgroundRefresh) setRegistrations([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Invalidate every cached page/pageSize entry — used after an
  // approve/reject, since we don't know which cached pages that record
  // might have appeared on.
  const invalidateCache = () => {
    registrationsCache.clear()
  }

  const handleManualRefresh = () => {
    loadRegistrations(page, pageSize, true)
  }

  useEffect(() => {
    loadRegistrations(1, pageSize)
  }, [pageSize])

  // Auto-refresh every 5 minutes, restarting the timer whenever the page
  // or pageSize changes so it always refreshes whatever is currently on screen.
  useEffect(() => {
    autoRefreshTimerRef.current = setInterval(() => {
      loadRegistrations(page, pageSize, true)
    }, CACHE_DURATION_MS)

    return () => clearInterval(autoRefreshTimerRef.current)
  }, [page, pageSize])

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
  }

  const executeApprove = async (userId) => {
    setApprovingId(userId)
    try {
      await approvePendingUser(userId, 'Documents verified')
      pushToast({ title: 'Approved', message: 'User registration approved successfully.', tone: 'success' })
      invalidateCache()
      loadRegistrations(page, pageSize, true)
    } catch (error) {
      pushToast({ title: 'Error', message: error.message || 'Failed to approve user.', tone: 'danger' })
    } finally {
      setApprovingId(null)
    }
  }

  const executeReject = async (userId) => {
    setRejectingId(userId)
    try {
      await rejectPendingUser(userId, 'Registration rejected')
      pushToast({ title: 'Rejected', message: 'User registration rejected successfully.', tone: 'success' })
      invalidateCache()
      loadRegistrations(page, pageSize, true)
    } catch (error) {
      pushToast({ title: 'Error', message: error.message || 'Failed to reject user.', tone: 'danger' })
    } finally {
      setRejectingId(null)
    }
  }

  // Buttons no longer call the API directly — they open a confirmation
  // dialog first. The API call only fires from handleConfirmDialog.
  const openConfirmDialog = (type, reg) => {
    setConfirmDialog({ type, userId: reg.id, businessName: reg.businessName })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog(null)
  }

  const handleConfirmDialog = async () => {
    if (!confirmDialog) return
    const { type, userId } = confirmDialog
    setConfirmDialog(null)
    if (type === 'approve') {
      await executeApprove(userId)
    } else {
      await executeReject(userId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-500">{total} pending registration{total !== 1 ? 's' : ''}</p>
          {lastUpdated && (
            <p className="text-[11px] text-ink-400 mt-0.5">
              Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 transition-all hover:bg-ink-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <label htmlFor="pageSize" className="text-xs text-ink-500 whitespace-nowrap">Rows per page</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-700 focus:outline-none focus:ring-2 focus:ring-azure-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-azure-500" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-xl border border-ink-100 bg-white p-12 text-center">
          <p className="text-sm text-ink-500">No pending registrations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div key={reg.id} className="glass-card rounded-xl border p-4 sm:p-5 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="font-semibold text-ink-900 break-words">{reg.businessName}</p>
                  <p className="text-xs text-ink-500 mt-0.5">@{reg.username}</p>
                </div>
                <span className="self-start rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-600">
                  {reg.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-ink-400">Address: </span><span className="text-ink-700">{reg.businessAddress}</span></div>
                <div><span className="text-ink-400">File No: </span><span className="text-ink-700">{reg.gemDealerFileNo}</span></div>
                <div><span className="text-ink-400">NIC/BRC: </span><span className="text-ink-700">{reg.nicOrBrc}</span></div>
                <div><span className="text-ink-400">Email: </span><span className="text-ink-700">{reg.email || '—'}</span></div>
                <div>
                  <span className="text-ink-400">Mobile: </span>
                  <span className="text-ink-700">{reg.mobileNumbers?.join(', ')}</span>
                </div>
                <div><span className="text-ink-400">Registered: </span><span className="text-ink-700">{new Date(reg.registeredAt).toISOString().slice(0, 10)}</span></div>
              </div>

              {reg.status === 'pending' ? (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => openConfirmDialog('reject', reg)}
                    disabled={approvingId === reg.id || rejectingId === reg.id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {rejectingId === reg.id ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rejecting...</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> Reject</>
                    )}
                  </button>
                  <button
                    onClick={() => openConfirmDialog('approve', reg)}
                    disabled={approvingId === reg.id || rejectingId === reg.id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {approvingId === reg.id ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving...</>
                    ) : (
                      <><CheckCircle className="w-3.5 h-3.5" /> Approve</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <span className="text-sm font-medium text-ink-500 bg-ink-50 px-4 py-2 rounded-lg border border-ink-100">
                    Registration {reg.status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button onClick={() => loadRegistrations(page - 1, pageSize)} disabled={page === 1}
            className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-ink-600">Page {page} of {totalPages}</span>
          <button onClick={() => loadRegistrations(page + 1, pageSize)} disabled={page === totalPages}
            className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          onClick={closeConfirmDialog}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 sm:p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  confirmDialog.type === 'approve' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    confirmDialog.type === 'approve' ? 'text-green-600' : 'text-red-600'
                  }`}
                />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">
                  {confirmDialog.type === 'approve' ? 'Approve this user?' : 'Reject this user?'}
                </p>
                <p className="text-sm text-ink-500 mt-1 break-words">
                  Are you sure you want to {confirmDialog.type} <span className="font-medium text-ink-700">{confirmDialog.businessName}</span>'s registration?
                  This action cannot be changed once confirmed.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={closeConfirmDialog}
                className="w-full sm:w-auto rounded-lg border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-600 transition-all hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDialog}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all ${
                  confirmDialog.type === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmDialog.type === 'approve' ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> Approve</>
                ) : (
                  <><XCircle className="w-3.5 h-3.5" /> Reject</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingRegistrations