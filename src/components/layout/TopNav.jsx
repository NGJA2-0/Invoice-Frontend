import { Bell } from 'lucide-react'
import Badge from '../common/Badge'

const TopNav = ({ title, subtitle, status, statusTone = 'info', avatar }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cloud-200 bg-white/80 px-6 py-4 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-600">
          {subtitle}
        </p>
        <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <Badge tone={statusTone}>{status}</Badge>
        <button
          type="button"
          className="rounded-full border border-cloud-200 bg-white p-2 text-ink-600 shadow-sm"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-cloud-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-azure-100 text-azure-700">
            {avatar}
          </span>
          Profile
        </div>
      </div>
    </div>
  )
}

export default TopNav
