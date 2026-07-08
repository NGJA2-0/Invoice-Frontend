import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight, X, Eye, EyeOff, Settings2 } from 'lucide-react'
import { api } from '../../services/api'

const BASE = '/admin/admins'
const CREATE_URL = '/auth/create-admin'

const emptyForm = { username: '', fullName: '', email: '', password: '', role: 'admin' }

function CapacitySlots({ total, occupied }) {
  if (!total) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const filled = Math.min(occupied, total)
  const available = total - filled

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1 max-w-[140px] sm:max-w-[180px]">
        {Array.from({ length: filled }).map((_, i) => (
          <span
            key={`filled-${i}`}
            title="Occupied"
            className="h-2.5 w-2.5 rounded-[3px] bg-green-500 border border-green-600/40 shadow-sm"
          />
        ))}
        {Array.from({ length: available }).map((_, i) => (
          <span
            key={`available-${i}`}
            title="Available"
            className="h-2.5 w-2.5 rounded-[3px] bg-white border border-border shadow-sm ring-1 ring-inset ring-black/5"
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
        {occupied}/{total} used
      </span>
    </div>
  )
}

export default function Admins() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal state
  const [modal, setModal] = useState(null) // null | 'create' | 'edit' | 'delete' | 'capacity' | 'blocked'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  // Capacity modal state
  const [capacityValue, setCapacityValue] = useState('')

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const res = await api.get(BASE)
      setAdmins(res || [])
    } catch {
      setError('Failed to load admins.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdmins() }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setFormError(null)
    setShowPassword(false)
    setModal('create')
  }

  const openEdit = (admin) => {
    setSelected(admin)
    setForm({ username: admin.username, fullName: admin.fullName, email: admin.email, password: '', role: admin.role })
    setFormError(null)
    setModal('edit')
  }

  const openDelete = (admin) => {
    setSelected(admin)
    setModal('delete')
  }

  const openCapacity = (admin) => {
    setSelected(admin)
    setCapacityValue(String(admin.totalCapacity ?? 0))
    setFormError(null)
    setModal('capacity')
  }

  const closeModal = () => {
    setModal(null)
    setSelected(null)
    setFormError(null)
  }

  const handleCreate = async () => {
    setSubmitting(true)
    setFormError(null)
    try {
      await api.post(CREATE_URL, form)
      await fetchAdmins()
      closeModal()
    } catch (e) {
      setFormError(e?.response?.data?.message || 'Failed to create admin.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    setSubmitting(true)
    setFormError(null)
    const payload = { username: form.username, fullName: form.fullName, email: form.email }
    try {
      await api.put(`${BASE}/${selected.id}`, payload)
      await fetchAdmins()
      closeModal()
    } catch (e) {
      setFormError(e?.response?.data?.message || 'Failed to update admin.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.delete(`${BASE}/${selected.id}`)
      await fetchAdmins()
      closeModal()
    } catch {
      setFormError('Failed to delete admin.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async (admin) => {
    const next = admin.status === 'active' ? 'inactive' : 'active'

    // Guard: an admin currently holding assigned registration slots
    // cannot be deactivated until those slots are freed up.
    if (next === 'inactive' && admin.occupiedSlots > 0) {
      setSelected(admin)
      setModal('blocked')
      return
    }

    try {
      await api.patch(`${BASE}/${admin.id}/status`, { status: next })
      await fetchAdmins()
    } catch {
      // silently ignore or add a toast if you have one
    }
  }

  const handleCapacity = async () => {
    const parsed = Number(capacityValue)
    if (!Number.isInteger(parsed) || parsed < 0) {
      setFormError('Enter a whole number of 0 or more.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await api.patch(`${BASE}/${selected.id}/capacity`, { totalCapacity: parsed })
      await fetchAdmins()
      closeModal()
    } catch (e) {
      setFormError(e?.response?.data?.message || 'Failed to update capacity.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading admins...</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Administrators</h2>
          <p className="text-sm text-muted-foreground">{admins.length} total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> New Admin
        </button>
      </div>

      {/* Table (md and up) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              {['Full Name', 'Username', 'Email', 'Role', 'Capacity', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map(admin => (
              <tr
                key={admin.id}
                onClick={() => navigate(`/admin/admins/${admin.id}/registrations`, { state: { fullName: admin.fullName, username: admin.username } })}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 font-medium">{admin.fullName}</td>
                <td className="px-4 py-3 text-muted-foreground">{admin.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    admin.role === 'superadmin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {admin.role === 'admin' ? (
                    <div className="flex items-center gap-2">
                      <CapacitySlots
                        total={admin.totalCapacity}
                        occupied={admin.occupiedSlots}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); openCapacity(admin) }}
                        title="Edit capacity"
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <Settings2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    admin.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {admin.status}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {/* Don't allow editing/deleting the superadmin row */}
                    {admin.role !== 'superadmin' && (
                      <>
                        <button
                          onClick={() => toggleStatus(admin)}
                          title={admin.status === 'active' ? 'Deactivate' : 'Activate'}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {admin.status === 'active'
                            ? <ToggleRight size={18} className="text-green-600" />
                            : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => openEdit(admin)}
                          title="Edit"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openDelete(admin)}
                          title="Delete"
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card list (mobile only) */}
      <div className="md:hidden flex flex-col gap-3">
        {admins.map(admin => (
          <div
            key={admin.id}
            onClick={() => navigate(`/admin/admins/${admin.id}/registrations`, { state: { fullName: admin.fullName, username: admin.username } })}
            className="rounded-xl border border-border bg-white p-4 flex flex-col gap-3 active:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{admin.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{admin.username}</p>
                <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  admin.role === 'superadmin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {admin.role}
                </span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  admin.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {admin.status}
                </span>
              </div>
            </div>

            {admin.role === 'admin' && (
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <CapacitySlots
                  total={admin.totalCapacity}
                  occupied={admin.occupiedSlots}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); openCapacity(admin) }}
                  title="Edit capacity"
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <Settings2 size={16} />
                </button>
              </div>
            )}

            {admin.role !== 'superadmin' && (
              <div
                className="flex items-center justify-end gap-4 border-t border-border pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => toggleStatus(admin)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {admin.status === 'active'
                    ? <ToggleRight size={18} className="text-green-600" />
                    : <ToggleLeft size={18} />}
                  {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEdit(admin)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => openDelete(admin)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {modal === 'create' ? 'Create New Admin' : 'Edit Admin'}
              </h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: 'Full Name', key: 'fullName', type: 'text' },
                { label: 'Username', key: 'username', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
              ].map(({ label, key, type }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}

              {modal === 'create' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {formError && <p className="text-xs text-destructive">{formError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={closeModal}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modal === 'create' ? handleCreate : handleEdit}
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : modal === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={18} className="text-red-600" />
              </span>
              <h3 className="text-base font-semibold">Delete Admin</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete{' '}
              <span className="font-medium text-foreground">{selected?.fullName}</span>?
              This cannot be undone.
            </p>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={closeModal}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'blocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <ToggleLeft size={18} className="text-amber-600" />
              </span>
              <h3 className="text-base font-semibold">Cannot Deactivate Admin</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selected?.fullName}</span>{' '}
              currently has{' '}
              <span className="font-medium text-foreground">
                {selected?.occupiedSlots} occupied slot{selected?.occupiedSlots === 1 ? '' : 's'}
              </span>{' '}
              (assigned registrations still in progress). An admin with active
              assignments cannot be deactivated, since doing so would leave
              those registrations without an assigned reviewer.
            </p>
            <p className="text-xs text-muted-foreground">
              Reassign or resolve the pending registrations for this admin
              first, then try deactivating again.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={closeModal}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'capacity' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Edit Capacity</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Set the total number of slots for{' '}
              <span className="font-medium text-foreground">{selected?.fullName}</span>.
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Total Capacity</label>
              <input
                type="number"
                min={0}
                step={1}
                value={capacityValue}
                onChange={e => setCapacityValue(e.target.value)}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {selected && (
                <span className="text-[11px] text-muted-foreground">
                  Currently {selected.occupiedSlots} of {selected.totalCapacity} slots occupied.
                </span>
              )}
            </div>

            {formError && <p className="text-xs text-destructive">{formError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={closeModal}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCapacity}
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}