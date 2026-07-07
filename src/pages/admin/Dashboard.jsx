import { useEffect } from 'react'
import { FileCheck, Users } from 'lucide-react'
import StatCard from '../../components/cards/StatCard'
import Badge from '../../components/common/Badge'
import { useApp } from '../../context/AppContext'

const STAGE_META = {
  1: { label: 'Stage 1', sub: 'Initial verification', gradient: 'from-azure-500 to-azure-700', bg: 'from-azure-50 to-white', ring: 'ring-azure-100', bar: 'bg-azure-500' },
  2: { label: 'Stage 2', sub: 'Secondary review', gradient: 'from-violet-500 to-violet-700', bg: 'from-violet-50 to-white', ring: 'ring-violet-100', bar: 'bg-violet-500' },
  3: { label: 'Stage 3', sub: 'Final approval', gradient: 'from-emerald-500 to-emerald-700', bg: 'from-emerald-50 to-white', ring: 'ring-emerald-100', bar: 'bg-emerald-500' },
}

const OfficerCapacityCard = ({ stage, totalCapacity, occupiedSlots }) => {
  const meta = STAGE_META[stage] || { label: `Stage ${stage}`, sub: 'Officers', gradient: 'from-slate-500 to-slate-700', bg: 'from-slate-50 to-white', ring: 'ring-slate-100', bar: 'bg-slate-500' }
  const available = Math.max(totalCapacity - occupiedSlots, 0)
  const pct = totalCapacity > 0 ? Math.min(Math.round((occupiedSlots / totalCapacity) * 100), 100) : 0

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br ${meta.bg} p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:p-6`}>
      <div className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-base font-bold text-white shadow-lg ring-4 ${meta.ring}`}>
            {stage}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{meta.label}</p>
            <p className="text-xs text-ink-500">{meta.sub}</p>
          </div>
        </div>
        <span className="rounded-full bg-ink-900/5 px-2.5 py-1 text-[11px] font-medium text-ink-600">
          {pct}% full
        </span>
      </div>

      <div className="relative mt-5 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            {occupiedSlots}
            <span className="text-sm font-normal text-ink-400"> / {totalCapacity}</span>
          </p>
          <p className="mt-1 text-xs text-ink-500">Officers assigned</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-emerald-600">{available}</p>
          <p className="text-xs text-ink-500">Available</p>
        </div>
      </div>

      <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-900/10">
        <div
          className={`h-full rounded-full ${meta.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const Dashboard = () => {
  const {
    role,
    registrations,
    users,
    officerCapacitySummary,
    userStats,
    refreshAdminData,
    refreshOfficerCapacitySummary,
    refreshUserStats,
  } = useApp()
  const isSuperAdmin = role === 'superadmin'

  // Non-superadmin admins keep the existing client-derived counts
  const localPending = registrations.filter((item) => item.status === 'pending')
  const localApproved = users.filter((item) => item.status === 'approved')
  const localRejected = users.filter((item) => item.status === 'rejected')

  const totalCount = isSuperAdmin ? userStats?.total ?? 0 : users.length
  const pendingCount = isSuperAdmin ? userStats?.pending ?? 0 : localPending.length
  const approvedCount = isSuperAdmin ? userStats?.approved ?? 0 : localApproved.length
  const rejectedCount = isSuperAdmin ? userStats?.rejected ?? 0 : localRejected.length

  useEffect(() => {
    refreshAdminData()
  }, [refreshAdminData])

  useEffect(() => {
    if (isSuperAdmin) {
      refreshOfficerCapacitySummary()
      refreshUserStats()
    }
  }, [isSuperAdmin, refreshOfficerCapacitySummary, refreshUserStats])

  return (
    <div className="flex flex-col gap-6">
      {isSuperAdmin ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-azure-100 bg-gradient-to-br from-azure-50 to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">Total Users</p>
            <p className="mt-3 text-3xl font-semibold text-ink-900">{totalCount}</p>
            <p className="mt-2 text-xs text-ink-500">All registered</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">Pending</p>
            <p className="mt-3 text-3xl font-semibold text-ink-900">{pendingCount}</p>
            <p className="mt-2 text-xs text-ink-500">Awaiting review</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">Approved</p>
            <p className="mt-3 text-3xl font-semibold text-ink-900">{approvedCount}</p>
            <p className="mt-2 text-xs text-ink-500">Active dealers</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">Rejected</p>
            <p className="mt-3 text-3xl font-semibold text-ink-900">{rejectedCount}</p>
            <p className="mt-2 text-xs text-ink-500">Requires follow up</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Pending" value={pendingCount} note="Awaiting review" />
          <StatCard label="Approved" value={approvedCount} note="Active dealers" />
          <StatCard label="Rejected" value={rejectedCount} note="Requires follow up" />
        </div>
      )}

      {isSuperAdmin && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
            Officer Capacity
          </p>
          <h3 className="mt-1 mb-4 text-xl font-semibold text-ink-900">
            Stage-wise availability
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {officerCapacitySummary.map((item) => (
              <OfficerCapacityCard
                key={item.stage}
                stage={item.stage}
                totalCapacity={item.totalCapacity}
                occupiedSlots={item.occupiedSlots}
              />
            ))}
          </div>
        </div>
      )}

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
          <Badge tone="info">{pendingCount} Pending</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {localPending.map((item) => (
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
