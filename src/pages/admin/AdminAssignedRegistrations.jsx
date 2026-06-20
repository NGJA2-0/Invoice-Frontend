import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '../../services/api'

const BASE = '/admin/registrations/assigned'

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function AdminAssignedRegistrations() {
  const { adminId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const [registrations, setRegistrations] = useState([])
  const [slotInfo, setSlotInfo] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAssigned = async (pageNum = 1) => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get(`${BASE}?page=${pageNum}&limit=10`, {
        headers: { 'X-User-Id': adminId },
      })
      setRegistrations(res?.registrations || [])
      setSlotInfo(res?.slotInfo || null)
      setPagination(res?.pagination || null)
    } catch {
      setError('Failed to load assigned registrations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssigned(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId, page])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/admins')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Back to Admins
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold">
          {state?.fullName ? `${state.fullName}'s Assigned Registrations` : 'Assigned Registrations'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {state?.username ? `@${state.username}` : adminId}
        </p>
      </div>

      {slotInfo && (
        <div className="flex flex-wrap gap-4">
          <div className="rounded-xl border border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Total Capacity</p>
            <p className="text-lg font-semibold">{slotInfo.totalCapacity}</p>
          </div>
          <div className="rounded-xl border border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Occupied Slots</p>
            <p className="text-lg font-semibold">{slotInfo.occupiedSlots}</p>
          </div>
          <div className="rounded-xl border border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Available Slots</p>
            <p className="text-lg font-semibold">{slotInfo.availableSlots}</p>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground">Loading registrations...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                {['Business Name', 'Username', 'Dealer File No', 'Email', 'Mobile', 'Status', 'Registered At'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    No assigned registrations found.
                  </td>
                </tr>
              ) : (
                registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{reg.businessName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{reg.username}</td>
                    <td className="px-4 py-3 text-muted-foreground">{reg.gemDealerFileNo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{reg.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{reg.mobileNumbers?.join(', ')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[reg.status] || 'bg-muted text-muted-foreground'}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}