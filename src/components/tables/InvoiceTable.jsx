import { ChevronDown } from 'lucide-react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatInvoiceStatus } from '../../utils/status'

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
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud-100">
            {rows.map((row) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {rows.map((row) => (
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
              <Badge tone={statusTone[row.status] || 'neutral'}>
                {formatInvoiceStatus(row.status)}
              </Badge>
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
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            Page {pagination.currentPage} of {pagination.totalPages} ·{' '}
            {pagination.totalRecords} invoices
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              disabled={!pagination.hasPreviousPage}
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
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