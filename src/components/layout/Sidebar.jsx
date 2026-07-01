import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

const Sidebar = ({ title, subtitle, items, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* ── Mobile modal overlay — only renders on mobile when open ── */}
      {isOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={onClose}
        >
          <style>{`
            @keyframes sidebarIn {
              from { opacity: 0; transform: scale(0.95) translateY(8px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '320px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              padding: '2rem 1.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'relative',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)',
              animation: 'sidebarIn 0.22s ease',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                width: 32, height: 32, borderRadius: '50%',
                border: '1px solid #e5e7eb', background: '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6b7280',
              }}
            >
              <X size={16} />
            </button>

            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6 }}>
                {subtitle}
              </p>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
                {title}
              </h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((item, index) => {
                if (item.type === 'divider') {
                  return (
                    <div key={`divider-${index}`} style={{ marginTop: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#d1d5db', paddingLeft: 12 }}>
                        {item.label}
                      </p>
                    </div>
                  )
                }
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 12,
                      borderRadius: 12, padding: '11px 14px',
                      fontSize: 14, fontWeight: 600, textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      background: isActive ? '#f0e9d8' : 'transparent',
                      color: isActive ? '#b8922a' : '#374151',
                    })}
                  >
                    <Icon size={17} />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar — always visible, hidden on mobile via CSS ── */}
      <aside className="ul-sidebar hidden md:flex flex-col gap-8 border-r border-white/60 bg-white/70 backdrop-blur-xl px-6 py-8">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b8922a]">
            <span className="h-[5px] w-[5px] rounded-full bg-[#d4af37]" />
            {subtitle}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#0f1a2b]">{title}</h1>
        </div>

        <nav className="flex flex-col gap-1.5">
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={`divider-${index}`} className="mt-3 mb-1.5">
                  <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {item.label}
                  </p>
                </div>
              )
            }
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FBF4E6] text-[#8a6a1e]'
                      : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#d4af37] to-[#b8922a] transition-opacity duration-150 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <Icon
                      className={`h-4 w-4 ${isActive ? 'text-[#b8922a]' : 'text-gray-400 group-hover:text-gray-600'}`}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar