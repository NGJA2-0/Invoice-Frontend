import { useEffect, useState } from 'react'
import { Layers, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { stockValueApi } from '../../services/stockValueApi'

export default function StockValues() {
  const [stockValues, setStockValues] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null) // null = create mode
  const [stockValueId, setStockValueId] = useState('')
  const [stockValueName, setStockValueName] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await stockValueApi.getAll()
      setStockValues(res.data ?? [])
      setTotal(res.total ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

    const openCreate = () => {
        setEditItem(null)
        setStockValueId(`SV${String(total + 1).padStart(3, '0')}`)
        setStockValueName('')
        setModalOpen(true)
    }

  const openEdit = (item) => {
    setEditItem(item)
    setStockValueId(item.stockValueId)
    setStockValueName(item.stockValueName)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!stockValueName.trim()) return
    setSaving(true)
    try {
      if (editItem) {
        await stockValueApi.update(editItem.id, { stockValueName })
      } else {
        await stockValueApi.create({ stockValueId, stockValueName })
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
      await stockValueApi.delete(deleteTarget.id)
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
            <Layers className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Stock Values</h2>
            <p className="text-xs text-gray-500">{total} stock value{total !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" /> Add Stock Value
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/30 backdrop-blur-sm shadow-soft">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
        ) : stockValues.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No stock values found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left">
                <th className="px-6 py-3 font-semibold text-gray-600">#</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Stock Value ID</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Stock Value Name</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Created</th>
                <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockValues.map((item, idx) => (
                <tr key={item.id} className="border-b border-white/20 hover:bg-white/20 transition">
                  <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">{item.stockValueId}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{item.stockValueName}</td>
                  <td className="px-6 py-3 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-white/60 hover:text-gray-900 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
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
          <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="mb-4 text-base font-bold text-gray-900">
              {editItem ? 'Edit Stock Value' : 'Add Stock Value'}
            </h3>

            {/* Stock Value ID — only shown on create */}
            {!editItem && (
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <span className="text-xs text-gray-400">ID</span>
                    <span className="font-mono text-sm font-semibold text-gray-700">{stockValueId}</span>
                </div>
            )}

            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="Stock Value Name (e.g. Large)"
              value={stockValueName}
              onChange={e => setStockValueName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !stockValueName.trim()}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving…' : 'Save'}
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
              <h3 className="text-base font-bold text-gray-900">Delete Stock Value</h3>
            </div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{deleteTarget.stockValueName}"</span>?
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