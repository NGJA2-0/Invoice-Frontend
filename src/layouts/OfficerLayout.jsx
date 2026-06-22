import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import signupBg from '../assets/signup.jpg'

const OfficerLayout = () => {
  const navigate = useNavigate()
  const { user, logout } = useApp()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <>
      <style>{`
        .ol-root {
          min-height: 100vh;
          background-color: #000;
          position: relative;
        }
        .ol-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url('${signupBg}');
          background-size: cover;
          background-position: center;
          filter: blur(8px);
          transform: scale(1.05);
          z-index: 0;
        }
        .ol-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.45);
          z-index: 0;
        }
        .ol-root > * {
          position: relative;
          z-index: 1;
        }

        .ol-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.6);
          padding: 0.85rem 1.5rem;
        }
        .ol-topbar-left {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .ol-topbar-system {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6b7280;
        }
        .ol-topbar-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          letter-spacing: -0.02em;
        }

        .ol-topbar-right {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .ol-avatar-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 12px 3px 3px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.5);
        }
        .ol-avatar {
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
        .ol-avatar-label {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
        }

        .ol-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #003A6B;
          color: #ffde1a;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ol-logout-btn:hover {
          background: #004f96;
        }
        .ol-logout-btn svg {
          width: 15px;
          height: 15px;
        }

        .ol-main {
          padding: 1.5rem;
        }
      `}</style>

      <div className="ol-root">
        <div className="ol-topbar">
          <div className="ol-topbar-left">
            <span className="ol-topbar-system">Export Invoice System</span>
            <span className="ol-topbar-title">Officer Workspace</span>
          </div>

          <div className="ol-topbar-right">
            <div className="ol-avatar-pill">
              <div className="ol-avatar">
                {typeof user?.name === 'string' && user.name.length > 0
                  ? user.name.charAt(0)
                  : 'O'}
              </div>
              <span className="ol-avatar-label">{user?.name || 'Officer'}</span>
            </div>

            <button type="button" className="ol-logout-btn" onClick={handleLogout}>
              <LogOut />
              Logout
            </button>
          </div>
        </div>

        <main className="ol-main">
          <Outlet />
        </main>
      </div>
    </>
  )
}

export default OfficerLayout