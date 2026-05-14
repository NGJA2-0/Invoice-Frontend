import { NavLink } from 'react-router-dom'

const Sidebar = ({ title, subtitle, items }) => {
  return (
    <aside className="flex h-full flex-col gap-6 border-r border-cloud-200 bg-white/80 px-6 py-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-azure-600">
          {subtitle}
        </p>
        <h1 className="mt-2 font-display text-2xl text-ink-900">{title}</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-azure-50 text-azure-700 shadow-soft'
                  : 'text-ink-700 hover:bg-cloud-100'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
