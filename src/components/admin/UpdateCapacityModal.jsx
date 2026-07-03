import { useState } from 'react'
import { Gauge, X } from 'lucide-react'
import { officerApi } from '../../services/officerApi'

// Modal for updating an officer's totalCapacity.
// Enforces client-side: new total cannot be less than currently occupied slots.
export default function UpdateCapacityModal({ officer, onClose, onSaved }) {
  const occupiedSlots = officer?.occupiedSlots ?? 0

  const [totalCapacity, setTotalCapacity] = useState(officer?.totalCapacity ?? 0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setError('')
    setTotalCapacity(e.target.value)
  }

  const handleSubmit = async () => {
    const value = Number(totalCapacity)

    if (totalCapacity === '' || !Number.isInteger(value) || value < 0) {
      setError('Please enter a valid whole number.')
      return
    }

    if (value < occupiedSlots) {
      setError(
        `Total slots cannot be less than the currently occupied slots (${occupiedSlots}).`
      )
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await officerApi.updateCapacity(officer.id, { totalCapacity: value })
      onSaved()
    } catch {
      setError('Could not update capacity. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Gauge className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Update Capacity</h2>
              <p className="text-xs text-gray-500">{officer?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-1.5 block text-xs font-semibold text-gray-600">
          Total Capacity
        </label>
        <input
          type="number"
          min={0}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/20"
          value={totalCapacity}
          onChange={handleChange}
        />
        <p className="mt-1.5 text-xs text-gray-400">
          Currently occupied: <span className="font-semibold text-gray-600">{occupiedSlots}</span>
        </p>

        {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}