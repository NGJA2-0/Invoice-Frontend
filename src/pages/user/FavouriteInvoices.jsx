import { useEffect, useState } from 'react'
import { ArrowLeft, Heart, HeartOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Skeleton from '../../components/common/Skeleton'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
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

const PAGE_SIZE_OPTIONS = [10, 15, 20]

const formatLkr = (value) =>
  `Rs. ${Number(value || 0).toLocaleString()}`

const normalizeRows = (data) => {
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.invoices)
        ? data.invoices
        : []

  return items.map((invoice) => ({
    id: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber || 'N/A',
    invoiceDate: invoice.invoiceDate || 'N/A',
    exportType: invoice.exportType || 'N/A',
    cifLkr: invoice.cifLkr ?? 0,
    receiverName: invoice.receiverName || 'N/A',
    status: invoice.status || 'draft',
  }))
}

const normalizePagination = (data) => ({
  currentPage: data?.pagination?.currentPage || 1,
  pageSize: data?.pagination?.pageSize || 10,
  totalRecords: data?.pagination?.totalRecords || 0,
  totalPages: data?.pagination?.totalPages || 1,
  hasNextPage: data?.pagination?.hasNextPage || false,
  hasPreviousPage: data?.pagination?.hasPreviousPage || false,
})

const FavouriteInvoices = () => {
  const { user } = useApp()
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (user?.id) {
        const data = await userService.getFavorites(user.id, { pageSize })
        if (active) {
          setRows(normalizeRows(data))
          setPagination(normalizePagination(data))
        }
      }
      if (active) {
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user?.id, pageSize])

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize)
  }

  const handleRemoveFavorite = async (invoiceId) => {
    if (!user?.id || removingId) return
    setRemovingId(invoiceId)

    // Optimistic removal — invoice disappears immediately
    const previousRows = rows
    const previousPagination = pagination
    setRows((prev) => prev.filter((row) => row.id !== invoiceId))
    setPagination((prev) =>
      prev ? { ...prev, totalRecords: Math.max(0, prev.totalRecords - 1) } : prev,
    )

    try {
      await userService.removeFavorite(invoiceId, user.id)
    } catch (error) {
      // Roll back on failure so the card reappears
      setRows(previousRows)
      setPagination(previousPagination)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card flex flex-col gap-4 rounded-2xl border px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-ink-900">Favourite Invoices</h3>
          <p className="mt-2 text-sm text-ink-600">
            Invoices you've marked as favourites for quick access.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/user/my-invoices')}
          className="!flex !w-fit !items-center !gap-2 !rounded-xl !border !border-cloud-200 !bg-white !px-4 !py-2.5 !text-sm !font-medium !text-ink-700 !shadow-sm transition-all duration-150 hover:!border-[#d9c89a] hover:!bg-cloud-50"
        >
          <ArrowLeft size={16} />
          Back to My Invoices
        </Button>
      </div>

      {loading ? (
        <div className="surface-card flex flex-col gap-3 rounded-2xl p-6">
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
        </div>
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-4 overflow-x-hidden">
          {/* Page size control only — no status/sort filters for favourites */}
          <div className="flex w-full min-w-0 justify-end">
            <div className="relative w-full min-w-0 max-w-full sm:w-auto">
              <select
                key={`fav-page-size-${pagination?.pageSize ?? 10}`}
                value={String(pagination?.pageSize ?? 10)}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="box-border w-full max-w-full appearance-none truncate rounded-xl border border-cloud-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-ink-700 shadow-sm transition-all duration-150 hover:border-[#d9c89a] focus:border-[#b8922a] focus:outline-none focus:ring-2 focus:ring-[#b8922a]/20 sm:w-auto"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={String(size)}>
                    {size} per page
                  </option>
                ))}
              </select>
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
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cloud-50">
                          <HeartOff size={20} className="text-ink-400" />
                        </span>
                        <p className="text-sm font-medium text-ink-600">
                          Your favourite list is empty
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
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
                          onClick={() => handleRemoveFavorite(row.id)}
                          disabled={removingId === row.id}
                          aria-label="Remove from favourites"
                          className="inline-flex items-center justify-center rounded-full p-1.5 transition-transform duration-150 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Heart
                            size={18}
                            className="fill-red-500 text-red-500"
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-cloud-200 bg-white px-4 py-12 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cloud-50">
                  <HeartOff size={20} className="text-ink-400" />
                </span>
                <p className="text-sm font-medium text-ink-600">
                  Your favourite list is empty
                </p>
              </div>
            ) : (
              rows.map((row) => (
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
                      onClick={() => handleRemoveFavorite(row.id)}
                      disabled={removingId === row.id}
                      aria-label="Remove from favourites"
                      className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Heart size={18} className="fill-red-500 text-red-500" />
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
              ))
            )}
          </div>

          {/* Pagination only — no status/sort filters, hidden when list is empty */}
          {pagination && rows.length > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-cloud-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-ink-500">
                Page {pagination.currentPage} of {pagination.totalPages} ·{' '}
                {pagination.totalRecords} invoices
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  disabled={!pagination.hasPreviousPage}
                  onClick={async () => {
                    const data = await userService.getFavorites(user.id, {
                      pageSize,
                      page: pagination.currentPage - 1,
                    })
                    setRows(normalizeRows(data))
                    setPagination(normalizePagination(data))
                  }}
                  className="!rounded-xl !border !border-cloud-200 !bg-white !px-4 !py-2 !text-sm !font-medium !text-ink-700 !shadow-sm transition-all duration-150 hover:!border-[#d9c89a] hover:!bg-cloud-50 disabled:!cursor-not-allowed disabled:!opacity-40 disabled:hover:!border-cloud-200 disabled:hover:!bg-white"
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  disabled={!pagination.hasNextPage}
                  onClick={async () => {
                    const data = await userService.getFavorites(user.id, {
                      pageSize,
                      page: pagination.currentPage + 1,
                    })
                    setRows(normalizeRows(data))
                    setPagination(normalizePagination(data))
                  }}
                  className="!rounded-xl !border !border-cloud-200 !bg-white !px-4 !py-2 !text-sm !font-medium !text-ink-700 !shadow-sm transition-all duration-150 hover:!border-[#d9c89a] hover:!bg-cloud-50 disabled:!cursor-not-allowed disabled:!opacity-40 disabled:hover:!border-cloud-200 disabled:hover:!bg-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FavouriteInvoices