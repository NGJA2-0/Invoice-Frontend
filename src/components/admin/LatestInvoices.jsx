import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileCheck, ArrowRight } from 'lucide-react'
import { adminService } from '../../services/adminService'

const STATUS_META = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  submitted: { label: 'Submitted', className: 'bg-azure-50 text-azure-600' },
  stage1_in_progress: { label: 'Stage 1 Review', className: 'bg-amber-50 text-amber-600' },
  stage2_in_progress: { label: 'Stage 2 Review', className: 'bg-violet-50 text-violet-600' },
  stage3_in_progress: { label: 'Stage 3 Review', className: 'bg-indigo-50 text-indigo-600' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-600' },
  rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-600' },
}

const formatStatus = (status) => {
  if (STATUS_META[status]) return STATUS_META[status]
  const label =
    status
      ?.replace(/_/g, ' ')
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unknown'
  return { label, className: 'bg-ink-900/5 text-ink-600' }
}

const formatDate = (isoString) => {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return (
    date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  )
}

// Superadmin-only widget: shows the most recent invoices raised across the
// whole system (not scoped to a single dealer or admin).
const LatestInvoices = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const goToInvoiceManagement = (invoiceNumber) => {
    navigate('/admin/invoice-management', invoiceNumber ? { state: { invoiceNumber } } : undefined)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminService.getLatestInvoices()
        if (mounted) setInvoices(Array.isArray(data) ? data : [])
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load latest invoices')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="surface-card rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
            Recent Activity
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink-900">Latest invoices</h3>
        </div>
        <button
          type="button"
          onClick={() => goToInvoiceManagement()}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 shadow-sm transition hover:bg-ink-900/5 hover:text-ink-900"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="animate-pulse rounded-2xl border border-ink-100 bg-ink-900/[0.03] px-5 py-4"
            >
              <div className="h-3 w-24 rounded bg-ink-900/10" />
              <div className="mt-3 h-4 w-32 rounded bg-ink-900/10" />
              <div className="mt-3 h-3 w-20 rounded bg-ink-900/10" />
            </div>
          ))}

        {!loading && error && (
          <p className="col-span-full text-sm text-rose-600">{error}</p>
        )}

        {!loading && !error && invoices.length === 0 && (
          <p className="col-span-full text-sm text-ink-500">No invoices yet.</p>
        )}

        {!loading &&
          !error &&
          invoices.map((invoice) => {
            const status = formatStatus(invoice.status)
            return (
              <div
                key={invoice.invoiceNumber}
                onClick={() => goToInvoiceManagement(invoice.invoiceNumber)}
                className="glass-card cursor-pointer rounded-2xl border px-5 py-4 transition hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-500">
                      {invoice.exportType || 'N/A'}
                    </p>
                  </div>
                  <FileCheck className="h-4 w-4 flex-shrink-0 text-azure-600" />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={`truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <span className="flex-shrink-0 text-[10px] text-ink-400">
                    {formatDate(invoice.createdAt)}
                  </span>
                </div>

                <p className="mt-2 truncate text-xs text-ink-500">
                  by {invoice.createdByName || 'N/A'}
                </p>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default LatestInvoices