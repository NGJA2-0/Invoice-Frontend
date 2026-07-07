import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminService } from '../../services/adminService'

// Fields to hide from the detail view entirely
const HIDDEN_FIELDS = new Set(['id', 'contactInfo', 'stockValueId'])

// Friendlier labels for camelCase keys
const FIELD_LABELS = {
  username: 'Username',
  fullName: 'Full Name',
  nic: 'NIC',
  role: 'Role',
  status: 'Status',
  tin: 'TIN',
  stockValueName: 'Stock Value',
  licenseExpiryDate: 'License Expiry Date',
  businessName: 'Business Name',
  businessAddress: 'Business Address',
  gemDealerFileNo: 'Gem Dealer File No.',
  nicOrBrc: 'NIC / BRC',
  mobileNumbers: 'Mobile Numbers',
  email: 'Email',
  registeredAt: 'Registered At',
  isApproved: 'Approved',
  assignedAdminId: 'Assigned Admin ID',
  createdAt: 'Created At',
  updatedAt: 'Updated At',
}

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

const isDateLike = (key) => /At$|Date$/.test(key)

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '—'

  if (Array.isArray(value)) {
    if (value.length === 0) return '—'
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item) => (
          <span
            key={item}
            className="rounded-lg bg-ink-50 px-2 py-1 text-xs font-medium text-ink-700"
          >
            {item}
          </span>
        ))}
      </div>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          value
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-ink-50 text-ink-600 ring-1 ring-ink-100'
        }`}
      >
        {value ? 'Yes' : 'No'}
      </span>
    )
  }

  if (key === 'status') {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          STATUS_STYLES[value] || 'bg-ink-50 text-ink-600 ring-1 ring-ink-100'
        }`}
      >
        {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
      </span>
    )
  }

  if (isDateLike(key)) {
    return formatDate(value)
  }

  return String(value)
}

const UserProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await adminService.getUserProfile(userId)
        if (!cancelled) setProfile(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load user profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const fields = profile
    ? Object.entries(profile).filter(([key]) => !HIDDEN_FIELDS.has(key))
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-100 bg-white/70 px-3 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:bg-ink-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <div>
            <h3 className="text-xl font-semibold text-ink-900">
              {profile?.fullName || 'User Profile'}
            </h3>
            <p className="mt-1 text-sm text-ink-600">Full account details.</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="surface-card rounded-2xl border px-6 py-10 text-center text-sm text-ink-500">
          Loading profile…
        </div>
      )}

      {!loading && error && (
        <div className="surface-card rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-6 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && profile && (
        <div className="surface-card overflow-hidden rounded-2xl border">
          <dl className="divide-y divide-ink-100">
            {fields.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:items-start sm:gap-4"
              >
                <dt className="text-sm font-semibold text-ink-500">
                  {FIELD_LABELS[key] || key}
                </dt>
                <dd className="text-sm text-ink-900 sm:col-span-2">
                  {formatValue(key, value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

export default UserProfile