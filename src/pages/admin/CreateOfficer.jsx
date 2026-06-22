import { useEffect, useState } from 'react'
import {
  UserPlus,
  ChevronDown,
  CheckCircle2,
  X,
  Pencil,
  Trash2,
  Users2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { officerApi } from '../../services/officerApi'
import { useApp } from '../../context/AppContext'

const STAGES = [
  { value: 1, label: 'Stage 1' },
  { value: 2, label: 'Stage 2' },
  { value: 3, label: 'Stage 3' },
]

const stageLabel = (value) => STAGES.find((s) => s.value === value)?.label || `Stage ${value}`

// ---------- Create / Edit Officer Modal ----------
function OfficerFormModal({
  mode, // 'create' | 'edit'
  isSuperAdmin,
  currentUser,
  admins,
  loadingAdmins,
  officer, // populated when editing
  onClose,
  onSaved,
}) {
  const [name, setName] = useState(officer?.name || '')
  const [nic, setNic] = useState(officer?.nic || '')
  const [email, setEmail] = useState(officer?.email || '')
  const [phone, setPhone] = useState(officer?.phone || '')
  const [stage, setStage] = useState(officer?.stage || null)
  const [stageOpen, setStageOpen] = useState(false)

  const [username, setUsername] = useState(officer?.username || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const initialAdmin = officer
    ? admins.find((a) => a.id === officer.adminId) || null
    : null
  const [selectedAdmin, setSelectedAdmin] = useState(initialAdmin)
  const [adminOpen, setAdminOpen] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const resolvedAdminId = isSuperAdmin
    ? selectedAdmin?.id || officer?.adminId
    : currentUser?.id

  const canSubmit =
    name.trim() &&
    nic.trim() &&
    email.trim() &&
    phone.trim() &&
    stage &&
    resolvedAdminId &&
    username.trim() &&
    password.trim() &&
    !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        name,
        nic,
        email,
        phone,
        stage,
        adminId: resolvedAdminId,
        username,
        password,
      }
      if (mode === 'create') {
        await officerApi.create({
          ...payload,
          createdBy: currentUser?.id,
        })
      } else {
        await officerApi.update(officer.id, {
          ...payload,
          createdBy: resolvedAdminId,
        })
      }
      onSaved()
    } catch {
      setError(
        mode === 'create'
          ? 'Could not create officer. Please check the details and try again.'
          : 'Could not update officer. Please check the details and try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-white/40 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <UserPlus className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'create' ? 'Create Officer' : 'Edit Officer'}
              </h2>
              <p className="text-xs text-gray-500">
                {isSuperAdmin
                  ? 'Assign a new officer to one of your admins'
                  : 'Add a new officer under your account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
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

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Username</label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="john.silva"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="SecurePass123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Stage dropdown */}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Stage</label>
            <button
              type="button"
              onClick={() => setStageOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              <span className={stage ? 'text-gray-900' : 'text-gray-400'}>
                {stage ? stageLabel(stage) : 'Select stage'}
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

          {/* Admin dropdown — super admin only, locked during edit */}
          {isSuperAdmin && (
            <div className="relative">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Assign to Admin</label>
              <button
                type="button"
                onClick={() => mode === 'create' && setAdminOpen((o) => !o)}
                disabled={loadingAdmins || mode === 'edit'}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {mode === 'create' && adminOpen && (
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
        </div>

        <div className="mt-4 flex shrink-0 gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting
              ? mode === 'create' ? 'Creating…' : 'Saving…'
              : mode === 'create' ? 'Create Officer' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- Officer row ----------
function OfficerRow({ officer, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900">{officer.name}</span>
        <span className="text-xs text-gray-500">{officer.email} · {officer.phone}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {stageLabel(officer.stage)}
        </span>
        <button
          onClick={() => onEdit(officer)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          title="Edit officer"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(officer)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          title="Delete officer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Normalizes whatever shape the api wrapper hands back —
// could be the raw array, or { success, message, data: [...] }
const extractList = (res) => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  return []
}

export default function CreateOfficer() {
  const { user } = useApp()
  const isSuperAdmin = user?.role === 'superadmin'

  // Admins (used for the "Assign to Admin" dropdown in the form)
  const [admins, setAdmins] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)

  // List data
  const [officers, setOfficers] = useState([])       // regular admin view
  const [groups, setGroups] = useState([])           // super admin view
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOfficer, setEditingOfficer] = useState(null) // null = create mode
  const [successMsg, setSuccessMsg] = useState('')

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isSuperAdmin) return
    const fetchAdmins = async () => {
      setLoadingAdmins(true)
      try {
        const res = await officerApi.getAdmins()
        const onlyAdmins = (res ?? []).filter((a) => a.role === 'admin')
        setAdmins(onlyAdmins)
      } catch {
        // non-fatal for the list view; form will just show "No admins found"
      } finally {
        setLoadingAdmins(false)
      }
    }
    fetchAdmins()
  }, [isSuperAdmin])

  const fetchList = async () => {
    setLoadingList(true)
    setListError('')
    try {
      if (isSuperAdmin) {
        const res = await officerApi.getGrouped()
        setGroups(extractList(res))
      } else {
        const res = await officerApi.getByAdmin(user?.id)
        setOfficers(extractList(res))
      }
    } catch {
      setListError('Could not load officers. Please try again.')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isSuperAdmin])

  const openCreateModal = () => {
    setEditingOfficer(null)
    setModalOpen(true)
  }

  const openEditModal = (officer) => {
    setEditingOfficer(officer)
    setModalOpen(true)
  }

  const handleSaved = async () => {
    setModalOpen(false)
    setSuccessMsg(editingOfficer ? 'Officer updated successfully' : 'Officer created successfully')
    setEditingOfficer(null)
    await fetchList()
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await officerApi.remove(deleteTarget.id)
      setDeleteTarget(null)
      await fetchList()
    } catch {
      setListError('Could not delete officer. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 shadow-soft">
            <Users2 className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Officer Management</h2>
            <p className="text-xs text-gray-500">
              {isSuperAdmin
                ? 'View officers across all admins and manage their details'
                : 'View and manage officers under your account'}
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          <UserPlus className="h-4 w-4" />
          Create Officer
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          <CheckCircle2 className="h-4 w-4" /> {successMsg}
        </div>
      )}

      {listError && <p className="text-xs font-medium text-red-500">{listError}</p>}

      {/* List */}
      {loadingList ? (
        <p className="text-sm text-gray-500">Loading officers…</p>
      ) : isSuperAdmin ? (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div
              key={group.adminId}
              className="rounded-2xl border border-white/40 bg-white/30 p-5 backdrop-blur-sm shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{group.fullName}</h3>
                  <p className="text-xs text-gray-500">{group.email}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {group.officers.length} officer{group.officers.length === 1 ? '' : 's'}
                </span>
              </div>

              {group.officers.length === 0 ? (
                <p className="text-xs text-gray-400">
                  This admin currently does not have assigned officers.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {group.officers.map((officer) => (
                    <OfficerRow
                      key={officer.id}
                      officer={officer}
                      onEdit={openEditModal}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/40 bg-white/30 p-5 backdrop-blur-sm shadow-soft">
          {officers.length === 0 ? (
            <p className="text-xs text-gray-400">
              This admin currently does not have assigned officers.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {officers.map((officer) => (
                <OfficerRow
                  key={officer.id}
                  officer={officer}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <OfficerFormModal
          mode={editingOfficer ? 'edit' : 'create'}
          isSuperAdmin={isSuperAdmin}
          currentUser={user}
          admins={admins}
          loadingAdmins={loadingAdmins}
          officer={editingOfficer}
          onClose={() => { setModalOpen(false); setEditingOfficer(null) }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Delete Officer</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}