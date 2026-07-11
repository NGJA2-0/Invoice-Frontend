import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileCheck, Users, AlertTriangle, Lock, UserPlus } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../../components/cards/StatCard'
import Badge from '../../components/common/Badge'
import LatestInvoices from '../../components/admin/LatestInvoices'
import { useApp } from '../../context/AppContext'

const STAGE_META = {
  1: { label: 'Stage 1', sub: 'Initial verification', gradient: 'from-azure-500 to-azure-700', bg: 'from-azure-50 to-white', ring: 'ring-azure-100', bar: 'bg-azure-500', hex: '#3b82f6' },
  2: { label: 'Stage 2', sub: 'Secondary review', gradient: 'from-violet-500 to-violet-700', bg: 'from-violet-50 to-white', ring: 'ring-violet-100', bar: 'bg-violet-500', hex: '#8b5cf6' },
  3: { label: 'Stage 3', sub: 'Final approval', gradient: 'from-emerald-500 to-emerald-700', bg: 'from-emerald-50 to-white', ring: 'ring-emerald-100', bar: 'bg-emerald-500', hex: '#10b981' },
}

const OfficerCapacityCard = ({ stage, totalCapacity, occupiedSlots, onClick }) => {
  const meta = STAGE_META[stage] || { label: `Stage ${stage}`, sub: 'Officers', gradient: 'from-slate-500 to-slate-700', bg: 'from-slate-50 to-white', ring: 'ring-slate-100', bar: 'bg-slate-500' }
  const available = Math.max(totalCapacity - occupiedSlots, 0)
  const pct = totalCapacity > 0 ? Math.min(Math.round((occupiedSlots / totalCapacity) * 100), 100) : 0

  return (
    <div
      onClick={onClick}
      className={`relative inline-block w-fit cursor-pointer overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br ${meta.bg} px-4 py-1.5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_6px_24px_rgba(15,23,42,0.1)]`}
    >
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 blur-2xl`} />
      <div className="relative flex items-center gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-sm font-bold text-white shadow-md ring-4 ${meta.ring}`}>
            {stage}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{meta.label}</p>
            <div className="mt-1 h-1.5 w-36 max-w-full overflow-hidden rounded-full bg-ink-900/10">
              <div
                className={`h-full rounded-full ${meta.bar} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-4">
          <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-[10px] font-medium text-ink-600">
            {pct}% full
          </span>
          <div className="flex items-center gap-3 border-l border-ink-900/5 pl-5">
            <div className="text-center">
              <p className="text-lg font-semibold text-ink-900">
                {occupiedSlots}
                <span className="text-[11px] font-normal text-ink-400">/{totalCapacity}</span>
              </p>
              <p className="text-[10px] text-ink-500">Assigned</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-emerald-600">{available}</p>
              <p className="text-[10px] text-ink-500">Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
const OfficerCapacityCardDetailed = ({ stage, totalCapacity, occupiedSlots, onClick }) => {
  const meta = STAGE_META[stage] || { label: `Stage ${stage}`, sub: 'Officers', gradient: 'from-slate-500 to-slate-700', bg: 'from-slate-50 to-white', ring: 'ring-slate-100', bar: 'bg-slate-500' }
  const available = Math.max(totalCapacity - occupiedSlots, 0)
  const pct = totalCapacity > 0 ? Math.min(Math.round((occupiedSlots / totalCapacity) * 100), 100) : 0

  return (
    <div
      onClick={onClick}
      className={`relative mx-auto w-[92%] cursor-pointer overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br ${meta.bg} p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_6px_24px_rgba(15,23,42,0.1)]`}
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-xl font-bold text-white shadow-lg ring-4 ${meta.ring}`}>
            {stage}
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-900">{meta.label}</p>
            <p className="text-sm text-ink-500">{meta.sub}</p>
          </div>
        </div>
        <span className="rounded-full bg-ink-900/5 px-3 py-1.5 text-sm font-medium text-ink-600">
          {pct}% full
        </span>
      </div>

      <div className="relative mt-5 flex items-end justify-between">
        <div>
          <p className="text-4xl font-semibold text-ink-900 sm:text-5xl">
            {occupiedSlots}
            <span className="text-lg font-normal text-ink-400"> / {totalCapacity}</span>
          </p>
          <p className="mt-1 text-sm text-ink-500">Officers assigned</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-emerald-600">{available}</p>
          <p className="text-sm text-ink-500">Available</p>
        </div>
      </div>

      <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-900/10">
        <div
          className={`h-full rounded-full ${meta.bar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// Superadmin-only: horizontal gauge showing admin slot occupancy,
// with a red warning banner once remaining slots drop below 5.
const AdminSlotsGauge = ({ occupiedSlots, remainingSlots, totalAdmins, totalSlots }) => {
  const pct = totalSlots > 0 ? Math.min(Math.round((occupiedSlots / totalSlots) * 100), 100) : 0
  const isLow = remainingSlots < 5

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
        Admin Capacity
      </p>
      <h3 className="mt-1 mb-4 text-xl font-semibold text-ink-900">
        Admin slot usage
      </h3>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br from-azure-50 via-white to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] lg:max-w-[50%]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-azure-500 to-azure-700 opacity-10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br from-azure-400 to-azure-600 opacity-[0.06] blur-2xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-azure-500 to-azure-700 text-white shadow-md ring-4 ring-azure-100">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{totalAdmins} admins active</p>
                <p className="text-xs text-ink-500">Across {totalSlots} total slots</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-ink-900/5 px-3 py-1.5 text-xs font-medium text-ink-600">
              {pct}% full
            </span>
          </div>

          <div className="relative mt-5 h-2.5 w-full overflow-hidden rounded-full bg-ink-900/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                isLow ? 'from-rose-500 to-rose-600' : 'from-azure-500 to-azure-700'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {isLow && (
            <div className="relative mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
              <p className="text-xs font-medium text-rose-700">
                Only {remainingSlots} admin slot{remainingSlots === 1 ? '' : 's'} left — consider increasing capacity soon.
              </p>
            </div>
          )}
        </div>

        <div className="relative flex flex-1 overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br from-slate-50 via-white to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 opacity-[0.08] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-gradient-to-br from-azure-400 to-azure-600 opacity-[0.06] blur-2xl" />

          <div className="relative flex w-full items-center justify-around">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md ring-4 ring-rose-100">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-semibold text-ink-900">
                  {occupiedSlots}
                  <span className="text-sm font-normal text-ink-400">/{totalSlots}</span>
                </p>
                <p className="text-xs text-ink-500">Occupied</p>
              </div>
            </div>

            <div className="h-10 w-px bg-ink-900/10" />

            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-4 ${
                isLow ? 'bg-gradient-to-br from-rose-500 to-rose-600 ring-rose-100' : 'bg-gradient-to-br from-emerald-500 to-emerald-700 ring-emerald-100'
              }`}>
                <UserPlus className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <p className={`text-2xl font-semibold ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {remainingSlots}
                </p>
                <p className="text-xs text-ink-500">Remaining</p>
              </div>
            </div>
          </div>
        </div>
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
    adminSlotsSummary,
    userStats,
    adminUserStats,
    refreshAdminData,
    refreshOfficerCapacitySummary,
    refreshAdminSlotsSummary,
    refreshUserStats,
  } = useApp()
  const navigate = useNavigate()
  const isSuperAdmin = role === 'superadmin'
  const isAdmin = role === 'admin'

  // Non-superadmin admins keep the existing client-derived counts
  const localPending = registrations.filter((item) => item.status === 'pending')
  const localApproved = users.filter((item) => item.status === 'approved')
  const localRejected = users.filter((item) => item.status === 'rejected')

  const totalCount = isSuperAdmin
    ? userStats?.total ?? 0
    : isAdmin
      ? adminUserStats?.total ?? 0
      : users.length
  const pendingCount = isSuperAdmin
    ? userStats?.pending ?? 0
    : isAdmin
      ? adminUserStats?.pending ?? 0
      : localPending.length
  const approvedCount = isSuperAdmin
    ? userStats?.approved ?? 0
    : isAdmin
      ? adminUserStats?.approved ?? 0
      : localApproved.length
  const rejectedCount = isSuperAdmin
    ? userStats?.rejected ?? 0
    : isAdmin
      ? adminUserStats?.rejected ?? 0
      : localRejected.length

  useEffect(() => {
    refreshAdminData()
  }, [refreshAdminData])

  useEffect(() => {
    if (isSuperAdmin) {
      refreshOfficerCapacitySummary()
      refreshAdminSlotsSummary()
      refreshUserStats()
    }
  }, [isSuperAdmin, refreshOfficerCapacitySummary, refreshAdminSlotsSummary, refreshUserStats])

  // Pie-chart selection: null means "show all 3 stage cards"
  const [selectedStage, setSelectedStage] = useState(null)

  const pieData = officerCapacitySummary.map((item) => ({
    name: (STAGE_META[item.stage] || {}).label || `Stage ${item.stage}`,
    value: item.totalCapacity,
    stage: item.stage,
  }))

  const totalSlots = officerCapacitySummary.reduce(
    (sum, item) => sum + (item.totalCapacity || 0),
    0,
  )

  const visibleCapacityCards = selectedStage
    ? officerCapacitySummary.filter((item) => item.stage === selectedStage)
    : officerCapacitySummary

  const handleSliceClick = (stage) => {
    setSelectedStage((prev) => (prev === stage ? null : stage))
  }

  return (
    <div className="flex flex-col gap-6">
      {isSuperAdmin ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div
            onClick={() => navigate('/admin/users', { state: { status: '' } })}
            className="cursor-pointer rounded-2xl border border-azure-100 bg-gradient-to-br from-azure-50 to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition hover:shadow-[0_6px_24px_rgba(15,23,42,0.1)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">Total Users</p>
            <p className="mt-3 text-3xl font-semibold text-ink-900">{totalCount}</p>
            <p className="mt-2 text-xs text-ink-500">All registered</p>
          </div>
          <div
            onClick={() => navigate('/admin/users', { state: { status: 'pending' } })}
            className="cursor-pointer rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition hover:shadow-[0_6px_24px_rgba(15,23,42,0.1)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">Pending</p>
            <p className="mt-3 text-3xl font-semibold text-ink-900">{pendingCount}</p>
            <p className="mt-2 text-xs text-ink-500">Awaiting review</p>
          </div>
          <div
            onClick={() => navigate('/admin/users', { state: { status: 'approved' } })}
            className="cursor-pointer rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition hover:shadow-[0_6px_24px_rgba(15,23,42,0.1)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">Approved</p>
            <p className="mt-3 text-3xl font-semibold text-ink-900">{approvedCount}</p>
            <p className="mt-2 text-xs text-ink-500">Active dealers</p>
          </div>
          <div
            onClick={() => navigate('/admin/users', { state: { status: 'rejected' } })}
            className="cursor-pointer rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition hover:shadow-[0_6px_24px_rgba(15,23,42,0.1)]"
          >
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

          <div className="lg:flex lg:items-center lg:gap-6">
            {/* Donut chart — large screens only */}
            <div className="hidden lg:flex lg:w-[38%] lg:flex-shrink-0">
              <div className="relative flex w-full flex-col items-center justify-center rounded-2xl p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={90}
                      paddingAngle={4}
                      stroke="none"
                      cursor="pointer"
                      onClick={(entry) => handleSliceClick(entry.stage)}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.stage}
                          fill={(STAGE_META[entry.stage] || {}).hex || '#94a3b8'}
                          opacity={selectedStage && selectedStage !== entry.stage ? 0.25 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} total slots`, name]}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                      position={{ x: undefined, y: -10 }}
                      wrapperStyle={{ zIndex: 20 }}
                      cursor={false}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute top-4 flex h-[200px] w-full flex-col items-center justify-center">
                  <p className="text-2xl font-semibold text-ink-900">{totalSlots}</p>
                  <p className="text-xs text-ink-500">Total slots</p>
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {pieData.map((entry) => (
                    <button
                      key={entry.stage}
                      type="button"
                      onClick={() => handleSliceClick(entry.stage)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        selectedStage === entry.stage
                          ? 'bg-ink-900/5 text-ink-900'
                          : 'text-ink-500 hover:text-ink-800'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: (STAGE_META[entry.stage] || {}).hex || '#94a3b8' }}
                      />
                      {entry.name}
                    </button>
                  ))}
                </div>

                {selectedStage && (
                  <button
                    type="button"
                    onClick={() => setSelectedStage(null)}
                    className="mt-2 text-xs font-medium text-azure-600 hover:underline"
                  >
                    Show all stages
                  </button>
                )}
              </div>
            </div>

            {/* Stage cards */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:hidden">
              {visibleCapacityCards.map((item) => (
                <OfficerCapacityCardDetailed
                  key={`mobile-${item.stage}`}
                  stage={item.stage}
                  totalCapacity={item.totalCapacity}
                  occupiedSlots={item.occupiedSlots}
                  onClick={() => navigate('/admin/create-officer')}
                />
              ))}
            </div>

            <div
              className={`mt-4 hidden gap-3 sm:grid lg:mt-0 lg:flex-1 lg:content-start ${
                selectedStage
                  ? 'grid-cols-1'
                  : 'sm:grid-cols-2 lg:grid-cols-1'
              }`}
            >
              {visibleCapacityCards.map((item) =>
                selectedStage ? (
                  <OfficerCapacityCardDetailed
                    key={item.stage}
                    stage={item.stage}
                    totalCapacity={item.totalCapacity}
                    occupiedSlots={item.occupiedSlots}
                    onClick={() => navigate('/admin/create-officer')}
                  />
                ) : (
                  <OfficerCapacityCard
                    key={item.stage}
                    stage={item.stage}
                    totalCapacity={item.totalCapacity}
                    occupiedSlots={item.occupiedSlots}
                    onClick={() => navigate('/admin/create-officer')}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {isSuperAdmin && adminSlotsSummary && (
        <AdminSlotsGauge
          occupiedSlots={adminSlotsSummary.occupiedSlots}
          remainingSlots={adminSlotsSummary.remainingSlots}
          totalAdmins={adminSlotsSummary.totalAdmins}
          totalSlots={adminSlotsSummary.totalSlots}
        />
      )}

      {isSuperAdmin ? (
        <LatestInvoices />
      ) : (
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
      )}
    </div>
  )
}

export default Dashboard
