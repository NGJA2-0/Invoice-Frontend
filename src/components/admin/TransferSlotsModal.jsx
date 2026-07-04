import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRightLeft,
  ChevronDown,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { officerApi } from '../../services/officerApi'

// Same floating-dropdown pattern used elsewhere in admin — portal to <body> so
// it isn't clipped by the modal's own scroll container.
function FloatingMenu({ anchorRect, onClose, children }) {
  if (!anchorRect) return null
  return createPortal(
    <>
      <div className="fixed inset-0 z-[210]" onClick={onClose} />
      <ul
        className="fixed z-[211] max-h-56 overflow-auto rounded-xl border border-white/40 bg-white/95 shadow-lg backdrop-blur-sm"
        style={{
          top: anchorRect.bottom + 4,
          left: anchorRect.left,
          width: anchorRect.width,
        }}
      >
        {children}
      </ul>
    </>,
    document.body
  )
}

function OfficerSelect({ label, placeholder, officers, value, onChange, disabled, excludeId }) {
  const [menuRect, setMenuRect] = useState(null)
  const buttonRef = useRef(null)
  const list = officers.filter((o) => o.id !== excludeId)

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</label>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() =>
          setMenuRect((open) => (open ? null : buttonRef.current.getBoundingClientRect()))
        }
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-900/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? value.name : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>
      <FloatingMenu anchorRect={menuRect} onClose={() => setMenuRect(null)}>
        {list.length === 0 ? (
          <li className="px-4 py-2.5 text-sm text-gray-400">No officers available</li>
        ) : (
          list.map((o) => (
            <li
              key={o.id}
              onClick={() => {
                onChange(o)
                setMenuRect(null)
              }}
              className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
            >
              <span className="truncate">{o.name}</span>
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Stage {o.stage}
              </span>
            </li>
          ))
        )}
      </FloatingMenu>
    </div>
  )
}

function CapacityBadge({ officer }) {
  if (!officer) return null
  const total = officer.totalCapacity ?? 0
  const occupied = officer.occupiedSlots ?? 0
  const free = Math.max(total - occupied, 0)
  return (
    <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/70 p-3">
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Total</p>
        <p className="text-sm font-bold text-gray-900">{total}</p>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Occupied</p>
        <p className="text-sm font-bold text-gray-900">{occupied}</p>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Free</p>
        <p className="text-sm font-bold text-emerald-600">{free}</p>
      </div>
    </div>
  )
}

export default function TransferSlotsModal({ adminId, onClose, onSuccess }) {
  const [officers, setOfficers] = useState([])
  const [loadingOfficers, setLoadingOfficers] = useState(true)
  const [listError, setListError] = useState('')

  const [fromOfficer, setFromOfficer] = useState(null)
  const [toOfficer, setToOfficer] = useState(null)
  const [slots, setSlots] = useState('')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!adminId) return
    const fetchOfficers = async () => {
      setLoadingOfficers(true)
      setListError('')
      try {
        const res = await officerApi.getByAdmin(adminId)
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        setOfficers(list)
      } catch {
        setListError('Could not load officers. Please try again.')
      } finally {
        setLoadingOfficers(false)
      }
    }
    fetchOfficers()
  }, [adminId])

  const handleFromChange = (officer) => {
    setFromOfficer(officer)
    setToOfficer(null)
    setSlots('')
    setError('')
  }

  const handleToChange = (officer) => {
    setToOfficer(officer)
    setError('')
  }

  const slotsNumber = Number(slots)
  const canTransfer =
    fromOfficer &&
    toOfficer &&
    slots.trim() !== '' &&
    Number.isInteger(slotsNumber) &&
    slotsNumber > 0 &&
    !submitting

  // Cancelling the confirmation means "do nothing" — close everything and
  // reload so the underlying list reflects a clean, untouched state.
  const cancelConfirm = () => {
    setConfirmOpen(false)
    onClose()
    window.location.reload()
  }

  const handleTransfer = async () => {
    setSubmitting(true)
    setError('')
    try {
      await officerApi.transferSlots({
        fromOfficerId: fromOfficer.id,
        toOfficerId: toOfficer.id,
        slots: slotsNumber,
      })
      setConfirmOpen(false)
      onSuccess?.()
    } catch (err) {
      setConfirmOpen(false)
      setError(err?.message || 'Could not transfer slots. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/40 bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 shadow-md">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Transfer Slots</h2>
              <p className="text-xs text-gray-500">Move capacity slots between officers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {listError && <p className="mb-3 text-xs font-medium text-red-500">{listError}</p>}

        <div className="flex flex-col gap-4">
          <div>
            <OfficerSelect
              label="Transfer from"
              placeholder={loadingOfficers ? 'Loading officers…' : 'Select officer'}
              officers={officers}
              value={fromOfficer}
              onChange={handleFromChange}
              disabled={loadingOfficers}
              excludeId={toOfficer?.id}
            />
            <CapacityBadge officer={fromOfficer} />
          </div>

          <OfficerSelect
            label="Transfer to"
            placeholder={!fromOfficer ? 'Select source officer first' : 'Select officer'}
            officers={officers}
            value={toOfficer}
            onChange={handleToChange}
            disabled={!fromOfficer}
            excludeId={fromOfficer?.id}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Number of slots
            </label>
            <input
              type="number"
              min="1"
              disabled={!toOfficer}
              value={slots}
              onChange={(e) => setSlots(e.target.value)}
              placeholder="e.g. 2"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-900/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!canTransfer}
            className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Transfer
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white p-6 shadow-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="mt-3 text-base font-bold text-gray-900">Confirm transfer</h3>
            <p className="mt-2 text-sm text-gray-600">
              Transfer <strong>{slotsNumber}</strong> slot{slotsNumber === 1 ? '' : 's'} from{' '}
              <strong>{fromOfficer?.name}</strong> to <strong>{toOfficer?.name}</strong>?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={cancelConfirm}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Transferring…' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}