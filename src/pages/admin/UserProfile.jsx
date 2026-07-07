import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminService } from '../../services/adminService'

// Fields to hide entirely
const HIDDEN_FIELDS = new Set(['id', 'contactInfo', 'stockValueId'])

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

// Groups fields into logical sections for a scannable, premium layout.
// Any field returned by the API that isn't explicitly placed here
// automatically falls into the "Other" bucket, so nothing gets dropped.
const SECTIONS = [
  {
    title: 'Identity',
    color: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
    fields: ['username', 'fullName', 'nic', 'nicOrBrc', 'role'],
  },
  {
    title: 'Business',
    color: 'text-amber-600',
    iconBg: 'bg-amber-50',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
      />
    ),
    fields: [
      'businessName',
      'businessAddress',
      'tin',
      'gemDealerFileNo',
      'stockValueName',
      'licenseExpiryDate',
    ],
  },
  {
    title: 'Contact',
    color: 'text-sky-600',
    iconBg: 'bg-sky-50',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    fields: ['email', 'mobileNumbers'],
  },
  {
    title: 'Account',
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    fields: ['isApproved', 'assignedAdminId', 'registeredAt', 'createdAt', 'updatedAt'],
  },
]

const FIELD_LABELS = {
  username: 'Username',
  fullName: 'Full Name',
  nic: 'NIC',
  nicOrBrc: 'NIC / BRC',
  role: 'Role',
  status: 'Status',
  tin: 'TIN',
  stockValueName: 'Stock Value',
  licenseExpiryDate: 'License Expiry Date',
  businessName: 'Business Name',
  businessAddress: 'Business Address',
  gemDealerFileNo: 'Gem Dealer File No.',
  mobileNumbers: 'Mobile Numbers',
  email: 'Email',
  registeredAt: 'Registered At',
  isApproved: 'Approved',
  assignedAdminId: 'Assigned Admin ID',
  createdAt: 'Created At',
  updatedAt: 'Updated At',
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

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'

const FieldValue = ({ fieldKey, value }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-sm text-ink-400">—</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-sm text-ink-400">—</span>
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item) => (
          <span
            key={item}
            className="rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700"
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

  if (isDateLike(fieldKey)) {
    return <span className="text-sm font-medium text-ink-900">{formatDate(value)}</span>
  }

  return <span className="text-sm font-medium text-ink-900">{String(value)}</span>
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

  const visibleKeys = profile
    ? Object.keys(profile).filter((key) => !HIDDEN_FIELDS.has(key) && key !== 'status')
    : []

  const placedKeys = new Set(SECTIONS.flatMap((section) => section.fields))
  const leftoverKeys = visibleKeys.filter((key) => !placedKeys.has(key))

  const sections = [
    ...SECTIONS.map((section) => ({
      ...section,
      fields: section.fields.filter((key) => visibleKeys.includes(key)),
    })).filter((section) => section.fields.length > 0),
    ...(leftoverKeys.length > 0
      ? [
          {
            title: 'Other',
            color: 'text-slate-600',
            iconBg: 'bg-slate-50',
            icon: null,
            fields: leftoverKeys,
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-card rounded-2xl border border-slate-100 bg-gradient-to-br from-sky-100 to-white px-6 py-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-ink-100 bg-white/70 px-3 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:bg-ink-50"
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

            {!loading && profile && (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-900 text-sm font-semibold text-white shadow-sm">
                  {getInitials(profile.fullName)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink-900">{profile.fullName}</h3>
                  <p className="mt-0.5 text-sm text-ink-500">@{profile.username}</p>
                </div>
              </div>
            )}
          </div>

          {!loading && profile?.status && (
            <span
              className={`inline-flex w-fit rounded-full px-4 py-1.5 text-xs font-semibold ${
                STATUS_STYLES[profile.status] || 'bg-ink-50 text-ink-600 ring-1 ring-ink-100'
              }`}
            >
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="surface-card rounded-2xl border px-6 py-16 text-center text-sm text-ink-500">
          Loading profile…
        </div>
      )}

      {!loading && error && (
        <div className="surface-card rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-6 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && profile && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="surface-card flex flex-col gap-1 rounded-2xl border px-6 py-5"
            >
              <div className="mb-3 flex items-center gap-2.5">
                {section.icon && (
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${section.iconBg} ${section.color}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                    >
                      {section.icon}
                    </svg>
                  </span>
                )}
                <h4
                  className={`rounded-lg px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${section.color} ${section.iconBg}`}
                >
                  {section.title}
                </h4>
              </div>

              <div className="divide-y divide-ink-100">
                {section.fields.map((key) => (
                  <div
                    key={key}
                    className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <dt className="text-sm text-ink-500">{FIELD_LABELS[key] || key}</dt>
                    <dd className="sm:text-right">
                      <FieldValue fieldKey={key} value={profile[key]} />
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserProfile