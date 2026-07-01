import { motion } from 'framer-motion'
import { FilePlus2, ShieldCheck, Timer, FileEdit, Gem, ArrowUpRight, Clock3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import StatCard from '../../components/cards/StatCard'
import { useApp } from '../../context/AppContext'
import { formatUserStatus } from '../../utils/status'

const statusTone = {
  not_verified: 'warning',
  pending: 'info',
  approved: 'success',
  rejected: 'danger',
}

const Dashboard = () => {
  const { userStatus, invoices } = useApp()
  const navigate = useNavigate()
  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'draft')
  const approvedInvoices = invoices.filter((inv) => inv.status === 'approved')

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <StatCard label="Invoices" value={invoices.length} note="Current fiscal" />
        <StatCard label="Pending" value={pendingInvoices.length} note="Awaiting approval" />
        <StatCard label="Approved" value={approvedInvoices.length} note="Export ready" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="glass-card rounded-2xl border px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                Verification Status
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink-900">
                Dealer Documentation
              </h3>
              <p className="mt-2 text-sm text-ink-600">
                Submit export licenses to unlock invoice templates.
              </p>
            </div>
            <Badge tone={statusTone[userStatus]}>
              {formatUserStatus(userStatus)}
            </Badge>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/user/dealer-registration')}>
              Upload Documents
            </Button>
            <Button variant="secondary">View Checklist</Button>
          </div>
        </div>

        <div className="surface-card flex flex-col gap-4 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-azure-50 text-azure-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">
                Compliance Snapshot
              </p>
              <p className="text-xs text-ink-600">May 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-cloud-50 px-4 py-3 text-xs text-ink-600">
            <Timer className="h-4 w-4" />
            Average approval time: 1 working day
          </div>
          <Button variant="secondary" className="w-full">
            Download report
          </Button>
        </div>
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
        <Button className="w-fit" onClick={() => navigate('/user/create-invoice')}>
          Start Invoice
        </Button>
      </div>
    </div>
  )
}

export default Dashboard
