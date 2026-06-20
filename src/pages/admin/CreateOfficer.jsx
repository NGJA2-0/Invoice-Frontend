// NEW FILE: src/pages/admin/CreateOfficer.jsx
import { useEffect, useState } from 'react'
import { UserPlus, ChevronDown, CheckCircle2 } from 'lucide-react'
import { officerApi } from '../../services/officerApi'
import { useApp } from '../../context/AppContext'

const STAGES = [
  { value: 1, label: 'Stage 1' },
  { value: 2, label: 'Stage 2' },
  { value: 3, label: 'Stage 3' },
]

export default function CreateOfficer() {
  const { user } = useApp()
  const isSuperAdmin = user?.role === 'superadmin'

  // Form fields
  const [name, setName] = useState('')
  const [nic, setNic] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [stage, setStage] = useState(null)
  const [stageOpen, setStageOpen] = useState(false)

  // Admin dropdown (super admin only)
  const [admins, setAdmins] = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [loadingAdmins, setLoadingAdmins] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSuperAdmin) return
    const fetchAdmins = async () => {
      setLoadingAdmins(true)
      try {
        const res = await officerApi.getAdmins()
        const onlyAdmins = (res ?? []).filter((a) => a.role === 'admin')
        setAdmins(onlyAdmins)
      } catch {
        setError('Could not load admins. Please try again.')
      } finally {
        setLoadingAdmins(false)
      }
    }
    fetchAdmins()
  }, [isSuperAdmin])

  const resolvedAdminId = isSuperAdmin ? selectedAdmin?.id : user?.id

  const canSubmit =
    name.trim() &&
    nic.trim() &&
    email.trim() &&
    phone.trim() &&
    stage &&
    resolvedAdminId &&
    !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      await officerApi.create({
        name,
        nic,
        email,
        phone,
        stage,
        adminId: resolvedAdminId,
        createdBy: resolvedAdminId,
      })
      setSuccess(true)
      setName('')
      setNic('')
      setEmail('')
      setPhone('')
      setStage(null)
      setSelectedAdmin(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Could not create officer. Please check the details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 shadow-soft">
          <UserPlus className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Create Officer</h2>
          <p className="text-xs text-gray-500">
            {isSuperAdmin
              ? 'Assign a new officer to one of your admins'
              : 'Add a new officer under your account'}
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-lg rounded-2xl border border-white/40 bg-white/30 p-6 backdrop-blur-sm shadow-soft">
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Full Name</label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">NIC</label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="123456789V"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Phone</label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Stage dropdown — always shown */}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Stage</label>
            <button
              type="button"
              onClick={() => setStageOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              <span className={stage ? 'text-gray-900' : 'text-gray-400'}>
                {stage ? STAGES.find((s) => s.value === stage)?.label : 'Select stage'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {stageOpen && (
              <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/40 bg-white/95 shadow-lg backdrop-blur-sm">
                {STAGES.map((s) => (
                  <li
                    key={s.value}
                    onClick={() => { setStage(s.value); setStageOpen(false) }}
                    className="cursor-pointer px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Admin dropdown — super admin only */}
          {isSuperAdmin && (
            <div className="relative">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Assign to Admin</label>
              <button
                type="button"
                onClick={() => setAdminOpen((o) => !o)}
                disabled={loadingAdmins}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-50"
              >
                <span className={selectedAdmin ? 'text-gray-900' : 'text-gray-400'}>
                  {loadingAdmins
                    ? 'Loading admins…'
                    : selectedAdmin
                    ? selectedAdmin.fullName
                    : 'Select admin'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {adminOpen && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-xl border border-white/40 bg-white/95 shadow-lg backdrop-blur-sm">
                  {admins.length === 0 ? (
                    <li className="px-4 py-2.5 text-sm text-gray-400">No admins found</li>
                  ) : (
                    admins.map((a) => (
                      <li
                        key={a.id}
                        onClick={() => { setSelectedAdmin(a); setAdminOpen(false) }}
                        className="cursor-pointer px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
                      >
                        {a.fullName}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" /> Officer created successfully
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Officer'}
          </button>
        </div>
      </div>
    </div>
  )
}