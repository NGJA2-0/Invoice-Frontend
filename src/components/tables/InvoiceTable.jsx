import { useEffect, useState } from 'react'
import { ChevronDown, Heart, HeartOff } from 'lucide-react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatInvoiceStatus } from '../../utils/status'
import { userService } from '../../services/userService'
import { useApp } from '../../context/AppContext'

const statusTone = {
  draft: 'warning',
  stage1_in_progress: 'warning',
  stage2_in_progress: 'info',
  stage3_in_progress: 'info',
  completed: 'success',
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'stage1_in_progress', label: 'Stage 1 in progress' },
  { value: 'stage2_in_progress', label: 'Stage 2 in progress' },
  { value: 'stage3_in_progress', label: 'Stage 3 in progress' },
]

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
]

const PAGE_SIZE_OPTIONS = [10, 15, 20]

const formatLkr = (value) =>
  `Rs. ${Number(value || 0).toLocaleString()}`

// Module-level cache so the favourites list isn't re-fetched every time
// InvoiceTable mounts (e.g. navigating away from "My Invoices" and back).
// Keyed by userId; cleared/replaced whenever it's older than CACHE_TTL_MS
// or when a favourite is added/removed, so it can't go stale mid-session.
const favoritesCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const getCachedFavoriteIds = (userId) => {
  const entry = favoritesCache.get(userId)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    favoritesCache.delete(userId)
    return null
  }
  return entry.ids
}

const setCachedFavoriteIds = (userId, ids) => {
  favoritesCache.set(userId, { ids, timestamp: Date.now() })
}

const InvoiceTable = ({
  rows,
  pagination,
  status,
  sort,
  onStatusChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}) => {
  const { user, pushToast } = useApp()
  const [favoritingId, setFavoritingId] = useState(null)
  const [favoritedIds, setFavoritedIds] = useState(() => new Set())

  // The invoice list endpoint doesn't tell us which invoices are already
  // favourited, so we fetch the favourites list separately and use it to
  // seed which hearts should render filled — otherwise every heart looks
  // empty again after a refresh even if it was favourited before.
  useEffect(() => {
    let active = true

    const extractItems = (data) =>
      Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.invoices)
            ? data.invoices
            : []

    const loadFavoriteIds = async () => {
      if (!user?.id) return

      // Use the cache if we have a recent one — skips the API calls entirely.
      const cached = getCachedFavoriteIds(user.id)
      if (cached) {
        setFavoritedIds(new Set(cached))
        return
      }

      const ids = new Set()

      try {
        // Fetch page 1 first to learn how many total pages exist.
        const firstPage = await userService.getFavorites(user.id, { page: 1, pageSize: 100 })
        extractItems(firstPage).forEach((invoice) => {
          if (invoice?.invoiceId) ids.add(invoice.invoiceId)
        })

        // Cap at 50 pages (5,000 favourites) as a safety net against a
        // backend pagination bug rather than fetching an unbounded amount.
        const totalPages = Math.min(firstPage?.pagination?.totalPages || 1, 50)

        if (totalPages > 1) {
          // Fetch remaining pages in parallel instead of one-by-one —
          // keeps this fast even for users with hundreds of favourites.
          const remainingPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              userService.getFavorites(user.id, { page: i + 2, pageSize: 100 }),
            ),
          )
          remainingPages.forEach((data) => {
            extractItems(data).forEach((invoice) => {
              if (invoice?.invoiceId) ids.add(invoice.invoiceId)
            })
          })
        }

        if (active) {
          setFavoritedIds(ids)
          setCachedFavoriteIds(user.id, ids)
        }
      } catch (error) {
        // If this fails, hearts just default to "not favourited" — clicking
        // add/remove still works fine, so this is a soft failure.
      }
    }

    loadFavoriteIds()
    return () => {
      active = false
    }
  }, [user?.id])

  // Updates favoritedIds state and keeps the module-level cache in sync,
  // so a future remount of this table doesn't show stale data.
  const updateFavoritedIds = (updater) => {
    setFavoritedIds((prev) => {
      const next = updater(prev)
      if (user?.id) {
        setCachedFavoriteIds(user.id, next)
      }
      return next
    })
  }

  const handleAddFavorite = async (invoiceId) => {
    if (!user?.id || favoritingId) return
    setFavoritingId(invoiceId)

    // Optimistic update — heart fills in immediately
    updateFavoritedIds((prev) => new Set(prev).add(invoiceId))

    try {
      await userService.addFavorite(user.id, invoiceId)
      pushToast?.({ title: 'Added to favourites', tone: 'success' })
    } catch (error) {
      const alreadyFavorited = /already in favorites/i.test(error?.message || '')

      if (alreadyFavorited) {
        // Invoice was already favourited (e.g. from a previous session) —
        // keep the heart filled and disabled, just sync silently.
        updateFavoritedIds((prev) => new Set(prev).add(invoiceId))
      } else {
        // Genuine failure — roll back so the user can retry
        updateFavoritedIds((prev) => {
          const next = new Set(prev)
          next.delete(invoiceId)
          return next
        })
        pushToast?.({
          title: 'Could not add favourite',
          message: error?.message,
          tone: 'error',
        })
      }
    } finally {
      setFavoritingId(null)
    }
  }

  const handleRemoveFavorite = async (invoiceId) => {
    if (!user?.id || favoritingId) return
    setFavoritingId(invoiceId)

    // Optimistic update — icon reverts to empty heart immediately
    updateFavoritedIds((prev) => {
      const next = new Set(prev)
      next.delete(invoiceId)
      return next
    })

    try {
      await userService.removeFavorite(invoiceId, user.id)
      pushToast?.({ title: 'Removed from favourites', tone: 'success' })
    } catch (error) {
      // Roll back on failure so the icon goes back to "remove" state
      updateFavoritedIds((prev) => new Set(prev).add(invoiceId))
      pushToast?.({
        title: 'Could not remove favourite',
        message: error?.message,
        tone: 'error',
      })
    } finally {
      setFavoritingId(null)
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 overflow-x-hidden">
      {/* Filter / sort controls */}
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full min-w-0 max-w-full sm:w-auto">
            <select
              value={status || ''}
              onChange={(e) => onStatusChange?.(e.target.value || undefined)}
              className="box-border w-full max-w-full appearance-none truncate rounded-xl border border-cloud-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-ink-700 shadow-sm transition-all duration-150 hover:border-[#d9c89a] focus:border-[#b8922a] focus:outline-none focus:ring-2 focus:ring-[#b8922a]/20 sm:w-auto"
            >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
          </div>

          <div className="relative w-full min-w-0 max-w-full sm:w-auto">
            <select
              value={sort || 'date_desc'}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="box-border w-full max-w-full appearance-none truncate rounded-xl border border-cloud-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-ink-700 shadow-sm transition-all duration-150 hover:border-[#d9c89a] focus:border-[#b8922a] focus:outline-none focus:ring-2 focus:ring-[#b8922a]/20 sm:w-auto"
            >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
          </div>
        </div>

        <div className="relative w-full min-w-0 max-w-full sm:w-auto">
          <select
            key={`page-size-${pagination?.pageSize ?? 10}`}
            value={String(pagination?.pageSize ?? 10)}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="box-border w-full max-w-full appearance-none truncate rounded-xl border border-cloud-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-ink-700 shadow-sm transition-all duration-150 hover:border-[#d9c89a] focus:border-[#b8922a] focus:outline-none focus:ring-2 focus:ring-[#b8922a]/20 sm:w-auto"
          >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={String(size)}>
              {size} per page
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
      </div>
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-cloud-200 bg-white sm:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-cloud-50 text-xs uppercase tracking-[0.16em] text-ink-500">
            <tr>
              <th className="px-5 py-3">Invoice Number</th>
              <th className="px-5 py-3">Invoice Date</th>
              <th className="px-5 py-3">Export Type</th>
              <th className="px-5 py-3">Total Value (LKR)</th>
              <th className="px-5 py-3">Receiver's Name</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Favourite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud-100">
            {rows.map((row) => {
              const isFavorited = favoritedIds.has(row.id)
              return (
              <tr key={row.id} className="hover:bg-cloud-50/60">
                <td className="px-5 py-4 font-semibold text-ink-800">{row.invoiceNumber}</td>
                <td className="px-5 py-4 text-ink-600">{row.invoiceDate}</td>
                <td className="px-5 py-4 text-ink-700">{row.exportType}</td>
                <td className="px-5 py-4 font-semibold text-ink-800">{formatLkr(row.cifLkr)}</td>
                <td className="px-5 py-4 text-ink-700">{row.receiverName}</td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone[row.status] || 'neutral'}>
                    {formatInvoiceStatus(row.status)}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      isFavorited ? handleRemoveFavorite(row.id) : handleAddFavorite(row.id)
                    }
                    disabled={favoritingId === row.id}
                    title={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
                    aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
                    className="inline-flex items-center justify-center rounded-full p-1.5 transition-transform duration-150 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isFavorited ? (
                      <HeartOff size={18} className="text-ink-400" />
                    ) : (
                      <Heart size={18} className="text-ink-400" />
                    )}
                  </button>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {rows.map((row) => {
          const isFavorited = favoritedIds.has(row.id)
          return (
          <div
            key={row.id}
            className="relative overflow-hidden rounded-2xl border border-cloud-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.02] transition-shadow"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#d4af37] via-[#b8922a] to-[#d4af37]" />

            <div className="flex items-start justify-between gap-3 pl-2">
              <div>
                <p className="text-[15px] font-bold tracking-tight text-ink-900">
                  {row.invoiceNumber}
                </p>
                <p className="mt-0.5 text-xs font-medium text-ink-400">{row.invoiceDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone[row.status] || 'neutral'}>
                  {formatInvoiceStatus(row.status)}
                </Badge>
                <button
                  type="button"
                  onClick={() =>
                    isFavorited ? handleRemoveFavorite(row.id) : handleAddFavorite(row.id)
                  }
                  disabled={favoritingId === row.id}
                  title={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
                  aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
                  className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFavorited ? (
                    <HeartOff size={18} className="text-ink-400" />
                  ) : (
                    <Heart size={18} className="text-ink-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="my-3 h-px bg-gradient-to-r from-cloud-200 via-cloud-100 to-transparent pl-2" />

            <dl className="flex flex-col gap-3 pl-2 text-sm">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  Export Type
                </dt>
                <dd className="mt-0.5 break-words text-ink-700">{row.exportType}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  Total Value
                </dt>
                <dd className="mt-0.5 font-bold text-[#b8922a]">{formatLkr(row.cifLkr)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  Receiver's Name
                </dt>
                <dd className="mt-0.5 font-medium text-ink-700">{row.receiverName}</dd>
              </div>
            </dl>
          </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col gap-3 rounded-2xl border border-cloud-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-ink-500">
            Page {pagination.currentPage} of {pagination.totalPages} ·{' '}
            {pagination.totalRecords} invoices
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              disabled={!pagination.hasPreviousPage}
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              className="!rounded-xl !border !border-cloud-200 !bg-white !px-4 !py-2 !text-sm !font-medium !text-ink-700 !shadow-sm transition-all duration-150 hover:!border-[#d9c89a] hover:!bg-cloud-50 disabled:!cursor-not-allowed disabled:!opacity-40 disabled:hover:!border-cloud-200 disabled:hover:!bg-white"
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              className="!rounded-xl !border !border-cloud-200 !bg-white !px-4 !py-2 !text-sm !font-medium !text-ink-700 !shadow-sm transition-all duration-150 hover:!border-[#d9c89a] hover:!bg-cloud-50 disabled:!cursor-not-allowed disabled:!opacity-40 disabled:hover:!border-cloud-200 disabled:hover:!bg-white"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceTable