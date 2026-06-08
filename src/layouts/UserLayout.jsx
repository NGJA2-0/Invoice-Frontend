import { useState } from 'react'
import {
  FileText,
  LayoutGrid,
  PencilLine,
  ScrollText,
  Send,
} from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import Sidebar from '../components/layout/Sidebar'
import TopNav from '../components/layout/TopNav'
import { useApp } from '../context/AppContext'

const navItems = [
  { label: 'Dashboard', path: '/user/dashboard', icon: LayoutGrid },
  { label: 'Create Invoice', path: '/user/create-invoice', icon: Send },
  { label: 'My Invoices', path: '/user/my-invoices', icon: FileText },
  { label: 'Procedure Flow', path: '/user/procedure-flow', icon: ScrollText },
  { label: 'Edit Profile', path: '/user/edit-profile', icon: PencilLine },
]

const pageLabels = {
  '/user/dashboard': 'Dashboard',
  '/user/create-invoice': 'Create Invoice',
  '/user/my-invoices': 'My Invoices',
  '/user/procedure-flow': 'Procedure Flow',
  '/user/edit-profile': 'Edit Profile',
  '/user/dealer-registration': 'Dealer Registration',
}

const statusTone = {
  'Not Verified': 'warning',
  'Pending Verification': 'info',
  Approved: 'success',
  Rejected: 'danger',
}

/* ─────────────────────────────────────────
   Inline status badge colours
───────────────────────────────────────── */
const toneStyles = {
  warning: { bg: '#fef9ec', color: '#92680a', border: '#f5dfa0' },
  info:    { bg: '#eff6ff', color: '#2563a8', border: '#bfdbfe' },
  success: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  danger:  { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
}

const UserLayout = () => {
  const location = useLocation()
  const { userStatus, user } = useApp()
  const label = pageLabels[location.pathname] || 'Dashboard'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tone = statusTone[userStatus] || 'info'
  const badge = toneStyles[tone]

  return (
    <>
      <style>{`
        /* ── Reset & base ── */
        .ul-root {
        display: grid;
        min-height: 100vh;
        grid-template-columns: 280px 1fr;
        background-color: #000;
      }
        .ul-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url('/src/assets/signup.jpg');
          background-size: cover;
          background-position: center;
          filter: blur(8px);
          transform: scale(1.05);
          z-index: 0;
        }

        .ul-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.45);
          z-index: 0;
        }

        .ul-root > * {
          position: relative;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .ul-root {
            grid-template-columns: 1fr;
          }
        }

        /* ── Main column ── */
        .ul-main {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 1.25rem 1.5rem 2rem;
          min-width: 0;
        }
        @media (min-width: 640px) {
          .ul-main {
            padding: 1.5rem 2rem 2rem;
          }
        }

        /* ── Breadcrumb row ── */
        .ul-breadcrumb-row {
          margin-bottom: 0.75rem;
        }

        /* ── Top nav card ── */
        .ul-topnav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 999px;
          padding: 0.65rem 1rem 0.65rem 1.5rem;
          margin-bottom: 1.75rem;
        }

        /* Left: system label + page title */
        .ul-topnav-left {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .ul-topnav-system {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6b7280;
          white-space: nowrap;
        }
        .ul-topnav-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Right: controls */
        .ul-topnav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        /* Status badge */
        .ul-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }
        .ul-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Bell icon button */
        .ul-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          transition: background 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .ul-icon-btn:hover {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(0, 0, 0, 0.2);
        }
        .ul-icon-btn svg {
          width: 16px;
          height: 16px;
          stroke-width: 1.8px;
        }

        .ul-avatar-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 12px 3px 3px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .ul-avatar-pill:hover {
          background: rgba(255, 255, 255, 0.7);
        }
        .ul-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e8edf7;
          color: #3b5bb5;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          text-transform: uppercase;
        }
        .ul-avatar-label {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
        }

        /* Hamburger (mobile) */
        .ul-hamburger {
          display: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.15);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }
        .ul-hamburger svg {
          width: 18px;
          height: 18px;
          stroke-width: 1.8px;
        }
        @media (max-width: 768px) {
          .ul-hamburger { display: flex; }
          .ul-status-badge { display: none; }
        }
        @media (max-width: 480px) {
          .ul-avatar-label { display: none; }
          .ul-topnav {
            padding: 0.55rem 0.75rem 0.55rem 1rem;
          }
        }

        /* ── Page shell ── */
        .ul-shell {
          flex: 1;
          min-width: 0;
        }
      `}</style>

      <div className="ul-root">
        <Sidebar
          title="NGJA Export"
          subtitle="User Workspace"
          items={navItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="ul-main">
          {/* Breadcrumbs */}
          <div className="ul-breadcrumb-row">
            <Breadcrumbs
              items={[
                { label: 'User', active: false },
                { label, active: true },
              ]}
            />
          </div>

          {/* ── Top nav bar (replaces TopNav component visually) ── */}
          <div className="ul-topnav">
            {/* Left */}
            <div className="ul-topnav-left">
              <span className="ul-topnav-system">Export Invoice System</span>
              <span className="ul-topnav-title">{label}</span>
            </div>

            {/* Right */}
            <div className="ul-topnav-right">
              {/* Status badge */}
              <div
                className="ul-status-badge"
                style={{
                  background: badge.bg,
                  color: badge.color,
                  borderColor: badge.border,
                }}
              >
                <span
                  className="ul-status-dot"
                  style={{ background: badge.color }}
                />
                {userStatus || 'Pending'}
              </div>

              {/* Bell */}
              <button
                className="ul-icon-btn"
                aria-label="Notifications"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {/* Avatar pill */}
              <div className="ul-avatar-pill">
                <div className="ul-avatar">
                  {typeof user?.avatar === 'string' && user.avatar.length <= 3
                    ? user.avatar
                    : 'U'}
                </div>
                <span className="ul-avatar-label">Profile</span>
              </div>

              {/* Hamburger (mobile only) */}
              <button
                className="ul-hamburger"
                aria-label="Open menu"
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Page content */}
          <section className="ul-shell">
            <Outlet />
          </section>
        </main>
      </div>
    </>
  )
}

export default UserLayout