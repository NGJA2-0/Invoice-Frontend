import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

const Sidebar = ({ title, subtitle, items, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-6 border-r border-white/30 bg-white/30 backdrop-blur-xl px-6 py-8 transition-transform duration-300 md:relative md:inset-auto md:w-auto md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Close Button for Mobile */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-cloud-100 md:hidden"
        >
          <X className="h-5 w-5 text-ink-700" />
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {subtitle}
          </p>
          <h1 className="mt-2 font-display text-2xl text-gray-900">{title}</h1>
        </div>

        <nav className="flex flex-col gap-2">
          {items.map((item, index) => {
            // Render section divider
            if (item.type === 'divider') {
              return (
                <div key={`divider-${index}`} className="mt-2 mb-1">
                  <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {item.label}
                  </p>
                </div>
              )
            }

            // Render normal nav link
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white/60 text-gray-900 shadow-soft'
                      : 'text-gray-700 hover:bg-white/40 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar