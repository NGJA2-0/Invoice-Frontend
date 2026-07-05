import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, User, X } from 'lucide-react'
import Badge from '../common/Badge'
import { useApp } from '../../context/AppContext'

const TopNav = ({ title, subtitle, status, statusTone = 'info', avatar, onMenuClick }) => {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogoutConfirmed = () => {
    setConfirmOpen(false)
    setMenuOpen(false)
    logout()
    navigate('/auth/login', { replace: true })
  }

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Admin'

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white shadow-[0_8px_30px_-10px_rgba(15,23,42,0.15)] px-6 py-4">
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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {subtitle}
          </p>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge tone={statusTone}>{status}</Badge>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white">
              {avatar}
            </span>
            <span className="hidden sm:inline">Profile</span>
          </button>

          {menuOpen && (
            <div className="fixed left-4 right-4 top-[calc(var(--topnav-offset,4.5rem))] z-50 mx-auto w-auto max-w-sm origin-top-right rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.35)] animate-in fade-in slide-in-from-top-2 duration-150 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-72 sm:max-w-none">
              <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-semibold text-white ring-2 ring-white/30">
                  {avatar}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.fullName || 'Admin User'}
                  </p>
                  <p className="truncate text-xs text-slate-300">
                    @{user?.username || 'unknown'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 px-5 py-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Role</span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    {roleLabel}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 px-3 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setConfirmOpen(true)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Log out of your account?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              You'll need to sign in again to access the dashboard.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirmed}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopNav
