import { useEffect, useState, useRef } from 'react'
import { Package, Plus, Pencil, Trash2, Search, X, AlertTriangle } from 'lucide-react'
import { itemApi } from '../../services/itemApi'

export default function Items() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null) // null = create mode
  const [itemName, setItemName] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const suggestRef = useRef(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
        const res = await itemApi.getAll()
        setItems(res.data ?? [])
        setTotal(res.total ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Suggestions debounce
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    const t = setTimeout(async () => {
      try {
        const res = await itemApi.suggest(query)
        setSuggestions(res.data ?? [])
        setShowSuggestions(true)
      } catch { setSuggestions([]) }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const handleSearch = async (q = query) => {
    setShowSuggestions(false)
    if (!q.trim()) { fetchAll(); return }
    setLoading(true)
    try {
        const res = await itemApi.search(q)
        setItems(res.data ?? [])
        setTotal(res.total ?? res.data?.length ?? 0)
    } finally { setLoading(false) }
  }

  const clearSearch = () => { setQuery(''); fetchAll() }

  const openCreate = () => { setEditItem(null); setItemName(''); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); setItemName(item.itemName); setModalOpen(true) }

  const handleSave = async () => {
    if (!itemName.trim()) return
    setSaving(true)
    try {
      if (editItem) {
        await itemApi.update(editItem.id, { itemName })
      } else {
        await itemApi.create({ itemName })
      }
      setModalOpen(false)
      fetchAll()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await itemApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchAll()
    } finally { setDeleting(false) }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 shadow-soft">
            <Package className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Items</h2>
            <p className="text-xs text-gray-500">{total} item{total !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative" ref={suggestRef}>
        <div className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/40 px-4 py-2.5 shadow-soft backdrop-blur-sm">
          <Search className="h-4 w-4 shrink-0 text-gray-500" />
          <input
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            placeholder="Search items…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          {query && (
            <button onClick={clearSearch}><X className="h-4 w-4 text-gray-400 hover:text-gray-700" /></button>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/40 bg-white/90 shadow-lg backdrop-blur-sm">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="cursor-pointer px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
                onMouseDown={() => { setQuery(s.itemName ?? s); handleSearch(s.itemName ?? s) }}
              >
                {s.itemName ?? s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/30 backdrop-blur-sm shadow-soft">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No items found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left">
                <th className="px-6 py-3 font-semibold text-gray-600">#</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Item Name</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Created</th>
                <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-white/20 hover:bg-white/20 transition">
                  <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{item.itemName}</td>
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
            <h3 className="mb-4 text-base font-bold text-gray-900">{editItem ? 'Edit Item' : 'Add Item'}</h3>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="Item name"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
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
                disabled={saving || !itemName.trim()}
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
              <h3 className="text-base font-bold text-gray-900">Delete Item</h3>
            </div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete <span className="font-semibold">"{deleteTarget.itemName}"</span>?
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