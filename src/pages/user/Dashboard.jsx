import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FilePlus2,
  ShieldCheck,
  Timer,
  FileEdit,
  Gem,
  ArrowUpRight,
  Clock3,
  Heart,
  HeartOff,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { userService } from '../../services/userService'
import { formatUserStatus, formatInvoiceStatus } from '../../utils/status'

const statusTone = {
  not_verified: 'warning',
  pending: 'info',
  approved: 'success',
  rejected: 'danger',
}

const invoiceStatusStyles = {
  draft: 'bg-[#FBF4E6] text-[#8a6a1e] border border-[#EFDFB8]',
  stage1_in_progress: 'bg-[#FBF4E6] text-[#8a6a1e] border border-[#EFDFB8]',
  stage2_in_progress: 'bg-[#EFF4FB] text-[#3f5f8f] border border-[#DCE7F5]',
  stage3_in_progress: 'bg-[#EFF4FB] text-[#3f5f8f] border border-[#DCE7F5]',
  completed: 'bg-[#EEF5EE] text-[#3f7a52] border border-[#D6E8D6]',
}

const formatLkr = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

const normalizeFavouriteRows = (data) => {
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
    cifLkr: invoice.cifLkr ?? 0,
    receiverName: invoice.receiverName || 'N/A',
    status: invoice.status || 'draft',
  }))
}

const Dashboard = () => {
  const { userStatus, invoices, user } = useApp()
  const navigate = useNavigate()
  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'draft')
  const approvedInvoices = invoices.filter((inv) => inv.status === 'approved')

  const [favourites, setFavourites] = useState([])
  const [favouritesLoading, setFavouritesLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadFavourites = async () => {
      if (!user?.id) {
        setFavouritesLoading(false)
        return
      }
      try {
        const data = await userService.getFavorites(user.id, { pageSize: 3 })
        if (active) setFavourites(normalizeFavouriteRows(data).slice(0, 3))
      } catch {
        if (active) setFavourites([])
      } finally {
        if (active) setFavouritesLoading(false)
      }
    }
    loadFavourites()
    return () => { active = false }
  }, [user?.id])

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-3 gap-2 md:gap-4"
      >
        {[
          {
            label: 'Invoices',
            value: invoices.length,
            note: 'Current fiscal',
            icon: FileText,
            bg: '#FBFCFE',
            border: '#9DB4DD',
            fg: '#33517F',
            iconBg: '#EAF0FA',
          },
          {
            label: 'Approved',
            value: approvedInvoices.length,
            note: 'Export ready',
            icon: CheckCircle2,
            bg: '#F9FCFA',
            border: '#84B694',
            fg: '#2E6A45',
            iconBg: '#E4F2E8',
          },
          {
            label: 'Pending',
            value: pendingInvoices.length,
            note: 'Awaiting approval',
            icon: Clock3,
            bg: '#FEFCF6',
            border: '#D9AE5E',
            fg: '#7A5A16',
            iconBg: '#F8ECD0',
          }
          
        ].map(({ label, value, note, icon: Icon, bg, border, fg, iconBg }) => (
          <div
            key={label}
            className="flex flex-row items-center justify-center gap-2 rounded-2xl p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:flex-col md:items-stretch md:justify-start md:gap-4 md:p-6"
            style={{ backgroundColor: bg, border: `2px solid ${border}` }}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9 md:rounded-xl"
              style={{ color: fg, backgroundColor: iconBg }}
            >
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </span>
            <span
              className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] md:inline"
              style={{ color: fg }}
            >
              {note}
            </span>
            <div className="text-center md:text-left">
              <p className="text-xl font-semibold tracking-tight text-ink-900 md:text-3xl">
                {value}
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-ink-600 md:text-sm md:mt-1">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="surface-card flex flex-col gap-4 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Heart className="h-5 w-5 fill-rose-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                Quick Access
              </p>
              <h3 className="mt-1 text-xl font-semibold text-ink-900">
                Favourite Invoices
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/user/favourite-invoices')}
            className="hidden shrink-0 items-center gap-1 rounded-xl border border-cloud-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-sm transition-all duration-150 hover:border-[#d9c89a] hover:bg-cloud-50 sm:flex"
          >
            View All
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {favouritesLoading ? (
          <div className="flex flex-col gap-3">
            <div className="h-14 animate-pulse rounded-2xl bg-cloud-100" />
            <div className="h-14 animate-pulse rounded-2xl bg-cloud-100" />
            <div className="h-14 animate-pulse rounded-2xl bg-cloud-100" />
          </div>
        ) : favourites.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-cloud-50 px-4 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
              <HeartOff className="h-5 w-5 text-ink-400" />
            </span>
            <p className="text-sm font-medium text-ink-600">
              You haven't favourited any invoices yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {favourites.map((row) => (
              <div
                key={row.id}
                onClick={() => navigate(`/user/invoices/${row.id}`)}
                className="group relative flex cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-2xl border border-cloud-200 bg-white px-4 py-3.5 shadow-sm transition-all duration-150 hover:border-[#d9c89a] hover:shadow-md"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#d4af37] via-[#b8922a] to-[#d4af37] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                <div className="min-w-0 flex-1 pl-1.5">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {row.invoiceNumber}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {row.receiverName} · {row.invoiceDate}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-sm font-semibold text-[#b8922a]">
                    {formatLkr(row.cifLkr)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      invoiceStatusStyles[row.status] || 'bg-cloud-100 text-ink-600 border border-cloud-200'
                    }`}
                  >
                    {formatInvoiceStatus(row.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/user/favourite-invoices')}
          className="w-full rounded-xl border border-cloud-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition-colors duration-150 hover:border-[#d9c89a] hover:bg-cloud-50 sm:hidden"
        >
          View All Favourites
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/user/edit-profile#regulated-details')}
          className="group glass-card relative flex flex-col gap-4 rounded-2xl border px-6 py-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-azure-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-700 text-white shadow-lg shadow-azure-200">
              <FileEdit className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-ink-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-azure-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">
              Edit your Regulated Details
            </h3>
            <p className="mt-1.5 text-sm text-ink-600">
              Now you can edit your TIN, Gem Dealer File No, and Stock Value.
            </p>
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-2xl bg-cloud-50 px-4 py-2.5 text-xs text-ink-600">
            <Clock3 className="h-3.5 w-3.5 flex-shrink-0" />
            Verification period: 1–2 working days
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/user/edit-profile#license-renewal')}
          className="group glass-card relative flex flex-col gap-4 rounded-2xl border px-6 py-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-azure-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-700 text-white shadow-lg shadow-azure-200">
              <Gem className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-ink-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-azure-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">
              User License Renewal
            </h3>
            <p className="mt-1.5 text-sm text-ink-600">
              You can edit your license expiry date now using this.
            </p>
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-2xl bg-cloud-50 px-4 py-2.5 text-xs text-ink-600">
            <Clock3 className="h-3.5 w-3.5 flex-shrink-0" />
            Verification period: 1–2 working days
          </div>
        </button>
      </div>

      <div className="surface-card flex flex-col gap-4 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
              Quick Start
            </p>
            <h3 className="mt-2 text-xl font-semibold text-ink-900">
              Create a new invoice
            </h3>
          </div>
          <FilePlus2 className="h-6 w-6 text-azure-600" />
        </div>
        <p className="text-sm text-ink-600">
          Select the premium template and start preparing export documentation.
        </p>
        <button
          type="button"
          onClick={() => navigate('/user/create-invoice')}
          className="w-fit rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c9a233] to-[#b8922a] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-200/60 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
        >
          Start Invoice
        </button>
      </div>
    </div>
  )
}

export default Dashboard
