import { useEffect } from 'react'
import { FileCheck, Users } from 'lucide-react'
import StatCard from '../../components/cards/StatCard'
import Badge from '../../components/common/Badge'
import { useApp } from '../../context/AppContext'

const Dashboard = () => {
  const { registrations, users, refreshAdminData } = useApp()
  const pending = registrations.filter((item) => item.status === 'pending')
  const approved = users.filter((item) => item.status === 'approved')
  const rejected = users.filter((item) => item.status === 'rejected')

  useEffect(() => {
    refreshAdminData()
  }, [refreshAdminData])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending" value={pending.length} note="Awaiting review" />
        <StatCard label="Approved" value={approved.length} note="Active dealers" />
        <StatCard label="Rejected" value={rejected.length} note="Requires follow up" />
      </div>

      <div className="surface-card rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
              Review Queue
            </p>
            <h3 className="mt-2 text-xl font-semibold text-ink-900">
              Latest submissions
            </h3>
          </div>
          <Badge tone="info">{pending.length} Pending</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pending.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl border px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {item.dealerName}
                  </p>
                  <p className="text-xs text-ink-500">{item.submittedDate}</p>
                </div>
                <FileCheck className="h-4 w-4 text-azure-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card flex items-center justify-between rounded-2xl border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-azure-50 text-azure-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Active users</p>
            <p className="text-xs text-ink-600">126 export clients</p>
          </div>
        </div>
        <Badge tone="success">All systems normal</Badge>
      </div>
    </div>
  )
}

export default Dashboard
