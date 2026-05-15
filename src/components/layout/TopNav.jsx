import { Bell, Menu } from 'lucide-react'
import Badge from '../common/Badge'

const TopNav = ({ title, subtitle, status, statusTone = 'info', avatar, onMenuClick }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cloud-200 bg-white/80 px-6 py-4 shadow-soft">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink-700 hover:bg-cloud-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-600">
            {subtitle}
          </p>
          <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
        </div>
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
          <span className="hidden sm:inline">Profile</span>
        </div>
      </div>
    </div>
  )
}

export default TopNav
