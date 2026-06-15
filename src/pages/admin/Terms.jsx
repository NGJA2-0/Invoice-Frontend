import { useEffect, useState } from 'react'
import { ScrollText, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { termsApi } from '../../services/termsApi'

export default function Terms() {
  const [terms, setTerms] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editTerm, setEditTerm] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await termsApi.getAll()
      setTerms(res.terms ?? [])
      setTotal(res.total ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setEditTerm(null)
    setForm({ title: '', content: '' })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (term) => {
    setEditTerm(term)
    setForm({ title: term.title, content: term.content })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.content.trim()) e.content = 'Content is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editTerm) {
        await termsApi.update(editTerm.id, { title: form.title, content: form.content })
      } else {
        await termsApi.create({ title: form.title, content: form.content, version: '' })
      }
      setModalOpen(false)
      fetchAll()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await termsApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchAll()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 shadow-soft">
            <ScrollText className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Terms</h2>
            <p className="text-xs text-gray-500">{total} term{total !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" /> Add Term
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/30 backdrop-blur-sm shadow-soft">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
        ) : terms.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No terms found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left">
                <th className="px-6 py-3 font-semibold text-gray-600">#</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Title</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Version</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Content</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Created</th>
                <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term, idx) => (
                <tr key={term.id} className="border-b border-white/20 hover:bg-white/20 transition">
                  <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{term.title}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {term.version ? (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        v{term.version}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500 max-w-xs">
                    <span className="line-clamp-2">{term.content}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(term.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(term)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-white/60 hover:text-gray-900 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(term)}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="mb-4 text-base font-bold text-gray-900">
              {editTerm ? 'Edit Term' : 'Add Term'}
            </h3>

            {/* Title */}
            <div className="mb-3 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Title *</label>
              <input
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20 ${
                  errors.title ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="e.g. Terms and Conditions"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                autoFocus
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Content *</label>
              <textarea
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20 min-h-[160px] resize-y ${
                  errors.content ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Enter the full terms content…"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
              {errors.content && (
                <p className="text-xs text-red-500">{errors.content}</p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving…' : editTerm ? 'Save Changes' : 'Add Term'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-3 text-red-500">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">Delete Term</h3>
            </div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{deleteTarget.title}"</span>?
            </p>
            <p className="mt-1 text-xs text-red-500 font-medium">
              ⚠ This will permanently delete it from the database and cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}