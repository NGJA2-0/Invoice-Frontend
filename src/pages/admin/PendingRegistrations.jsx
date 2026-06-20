import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const PendingRegistrations = () => {
  const { refreshPendingUsers, approvePendingUser, rejectPendingUser, pushToast, user } = useApp()

  const [registrations, setRegistrations] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [approvingId, setApprovingId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const LIMIT = 10

  const loadRegistrations = async (p = 1) => {
    setIsLoading(true)
    try {
      const res = await refreshPendingUsers(p, LIMIT)
      setRegistrations(res?.registrations || [])
      setTotalPages(res?.totalPages || 1)
      setTotal(res?.total || 0)
      setPage(p)
    } catch (error) {
      pushToast({ title: 'Error', message: 'Failed to load pending registrations.', tone: 'danger' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRegistrations(1)
  }, [])

  const handleApprove = async (userId) => {
    setApprovingId(userId)
    try {
      await approvePendingUser(userId, 'Documents verified')
      pushToast({ title: 'Approved', message: 'User registration approved successfully.', tone: 'success' })
      loadRegistrations(page)
    } catch (error) {
      pushToast({ title: 'Error', message: error.message || 'Failed to approve user.', tone: 'danger' })
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (userId) => {
    setRejectingId(userId)
    try {
      await rejectPendingUser(userId, 'Registration rejected')
      pushToast({ title: 'Rejected', message: 'User registration rejected successfully.', tone: 'success' })
      loadRegistrations(page)
    } catch (error) {
      pushToast({ title: 'Error', message: error.message || 'Failed to reject user.', tone: 'danger' })
    } finally {
      setRejectingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{total} pending registration{total !== 1 ? 's' : ''}</p>
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
            <div key={reg.id} className="glass-card rounded-xl border p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink-900">{reg.businessName}</p>
                  <p className="text-xs text-ink-500 mt-0.5">@{reg.username}</p>
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-600">
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
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleReject(reg.id)}
                    disabled={approvingId === reg.id || rejectingId === reg.id}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {rejectingId === reg.id ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rejecting...</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> Reject</>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(reg.id)}
                    disabled={approvingId === reg.id || rejectingId === reg.id}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
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
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => loadRegistrations(page - 1)} disabled={page === 1}
            className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-ink-600">Page {page} of {totalPages}</span>
          <button onClick={() => loadRegistrations(page + 1)} disabled={page === totalPages}
            className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default PendingRegistrations