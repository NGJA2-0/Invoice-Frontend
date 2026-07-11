import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatLabel = (value) => {
  if (!value) return 'N/A'
  return value
    .toString()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const USER_STATUS_TONE = {
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  not_verified: 'bg-slate-100 text-slate-700 ring-slate-600/15',
}

const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
      USER_STATUS_TONE[status] || 'bg-slate-100 text-slate-700 ring-slate-600/15'
    }`}
  >
    {formatLabel(status)}
  </span>
)

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?'

// A labeled value used throughout the info grid — keeps spacing/typography consistent.
const Field = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
    <p className="mt-0.5 text-sm font-medium text-ink-800 break-words">{value || 'N/A'}</p>
  </div>
)

const SectionTitle = ({ children }) => (
  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">{children}</p>
)

const UserDetailsModal = ({ userId, onClose }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const panelRef = useRef(null)
  const navigate = useNavigate()

  const handleGoToAdmin = (adminId) => {
    onClose()
    navigate('/admin/admins', { state: { highlightAdminId: adminId } })
  }

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await adminService.getUserDetailsById(userId)
        if (!cancelled) setUser(data)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load user details.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!userId) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center sm:py-10">
      {/* Backdrop — blurs and dims the whole page */}
      <div
        className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl shadow-ink-900/20 ring-1 ring-black/5 lg:max-w-6xl"
        >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-ink-500 shadow-sm ring-1 ring-ink-200 transition hover:bg-ink-50 hover:text-ink-800"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {loading ? (
          <div className="flex flex-col gap-4 px-6 py-10 sm:px-8">
            <div className="h-16 w-16 animate-pulse rounded-full bg-ink-100" />
            <div className="h-4 w-40 animate-pulse rounded bg-ink-100" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-ink-100" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm font-medium text-rose-600">{error}</p>
          </div>
        ) : (
          user && (
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-br from-sky-50 via-amber-50/40 to-white px-6 py-6 sm:px-8 sm:py-7 lg:px-10">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-lg font-semibold text-white">
                    {getInitials(user.fullName || user.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-ink-900">
                      {user.fullName || user.businessName || 'N/A'}
                    </h3>
                    <p className="text-sm text-ink-500">@{user.username || 'N/A'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill status={user.status} />
                      <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600 ring-1 ring-inset ring-ink-600/10">
                        {formatLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-7 px-6 py-6 sm:px-8 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-6 lg:px-10">
                {/* Identity */}
                <div className="lg:rounded-2xl lg:border lg:border-sky-100 lg:bg-sky-50/50 lg:p-5">
                    <SectionTitle>Identity</SectionTitle>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="NIC" value={user.nic} />
                        <Field label="NIC / BRC" value={user.nicOrBrc} />
                        <Field label="TIN" value={user.tin} />
                        <Field label="Gem Dealer File No." value={user.gemDealerFileNo} />
                    </div>
                </div>

                {/* Business */}
                <div className="border-t border-ink-100 pt-6 lg:border-t-0 lg:pt-0 lg:rounded-2xl lg:border lg:border-amber-100 lg:bg-amber-50/50 lg:p-5">
                    <SectionTitle>Business</SectionTitle>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Business Name" value={user.businessName} />
                        <Field label="Stock Value" value={user.stockValueName} />
                        <div className="sm:col-span-2">
                        <Field label="Business Address" value={user.businessAddress} />
                        </div>      
                    </div>
                </div>

                {/* Contact */}
                <div className="border-t border-ink-100 pt-6 lg:border-t-0 lg:pt-0 lg:rounded-2xl lg:border lg:border-emerald-100 lg:bg-emerald-50/50 lg:p-5">
                    <SectionTitle>Contact</SectionTitle>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Email" value={user.email} />
                        <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Mobile Numbers</p>
                        {user.mobileNumbers?.length ? (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                            {user.mobileNumbers.map((num) => (
                                <span
                                key={num}
                                className="rounded-lg bg-ink-50 px-2 py-1 text-xs font-medium text-ink-700 ring-1 ring-inset ring-ink-200"
                                >
                                {num}
                                </span>
                            ))}
                            </div>
                        ) : (
                            <p className="mt-0.5 text-sm font-medium text-ink-800">N/A</p>
                        )}
                        </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-ink-100 pt-6 lg:border-t-0 lg:pt-0 lg:rounded-2xl lg:border lg:border-rose-100 lg:bg-rose-50/50 lg:p-5">
                    <SectionTitle>Timeline</SectionTitle>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Field label="Registered" value={formatDate(user.registeredAt)} />
                        <Field label="Approved" value={formatDate(user.approvedAt)} />
                        <Field label="License Expiry" value={formatDate(user.licenseExpiryDate)} />
                    </div>
                </div>

                {/* Assigned Admin */}
                <div className="border-t border-ink-100 pt-6 lg:col-span-2">
                    <SectionTitle>Assigned Admin</SectionTitle>
                  {user.assignedAdmin ? (
                    <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-4 ring-1 ring-indigo-100 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink-700 ring-1 ring-ink-200">
                          {getInitials(user.assignedAdmin.fullName || user.assignedAdmin.username)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {user.assignedAdmin.fullName || 'N/A'}
                          </p>
                          <p className="truncate text-xs text-ink-500">
                            @{user.assignedAdmin.username || 'N/A'} · {user.assignedAdmin.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGoToAdmin(user.assignedAdmin.id)}
                        className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ink-800"
                      >
                        Go to admin
                        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                          <path
                            d="M4 10H16M16 10L11 5M16 10L11 15"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-500">No admin assigned.</p>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>,
    document.body,
  )
}

export default UserDetailsModal