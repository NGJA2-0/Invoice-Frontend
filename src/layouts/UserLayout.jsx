import { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle,
  FileText,
  LayoutGrid,
  LogOut,
  PencilLine,
  ScrollText,
  Send,
  X,
} from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import TopNav from '../components/layout/TopNav'
import { useApp } from '../context/AppContext'
import signupBg from '../assets/signup.jpg'

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
  const { userStatus, user, submitLicenseRenewal, pushToast, logout } = useApp()
  const label = pageLabels[location.pathname] || 'Dashboard'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [licenseWarningDismissed, setLicenseWarningDismissed] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  // ── Synchronously read from localStorage so modal shows on first render ──
  const readStoredLicenseState = () => {
    try {
      const raw = localStorage.getItem('ngja_user')
      if (!raw) return { isExpired: false, userId: null }
      const storedUser = JSON.parse(raw)
      const warning = storedUser?.licenseWarning || ''
      const isExpired = !!(
        warning &&
        warning.toLowerCase().includes('expired') &&
        !warning.toLowerCase().includes('will expire')
      )
      return { isExpired, userId: storedUser?.id || null }
    } catch { return { isExpired: false, userId: null } }
  }

  const readRenewalPersisted = (userId) => {
    try {
      if (!userId) return { submitted: false, status: null }
      const stored = localStorage.getItem(`ngja_license_renewal_${userId}`)
      if (!stored) return { submitted: false, status: null }
      return JSON.parse(stored)
    } catch { return { submitted: false, status: null } }
  }

  const { isExpired: initExpired, userId: initUserId } = readStoredLicenseState()
  const { submitted: initSubmitted, status: initStatus } = readRenewalPersisted(initUserId)

  const [showLicenseModal, setShowLicenseModal] = useState(initExpired)
  const [licenseForm, setLicenseForm] = useState({ newLicenseId: '', submittedExpiryDate: '' })
  const [licenseFormErrors, setLicenseFormErrors] = useState({})
  const [isSubmittingLicense, setIsSubmittingLicense] = useState(false)
  const [licenseRenewalSubmitted, setLicenseRenewalSubmitted] = useState(initSubmitted)
  const [renewalStatus, setRenewalStatus] = useState(initStatus)


  const licenseWarning = user?.licenseWarning || null
  const isLicenseExpired = !!(licenseWarning &&
    licenseWarning.toLowerCase().includes('expired') &&
    !licenseWarning.toLowerCase().includes('will expire'))

  // Keep modal open if license is expired — catches context updates after mount
  useEffect(() => {
    if (isLicenseExpired) {
      setShowLicenseModal(true)
    }
  }, [isLicenseExpired])

  const handleLicenseFormChange = (e) => {
    const { name, value } = e.target
    setLicenseForm(prev => ({ ...prev, [name]: value }))
    if (licenseFormErrors[name]) {
      setLicenseFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateLicenseForm = () => {
    const errors = {}
    if (!licenseForm.newLicenseId.trim()) errors.newLicenseId = 'License ID is required'
    if (!licenseForm.submittedExpiryDate) errors.submittedExpiryDate = 'Expiry date is required'
    else {
      const chosen = new Date(licenseForm.submittedExpiryDate)
      if (chosen <= new Date()) errors.submittedExpiryDate = 'Expiry date must be in the future'
    }
    return errors
  }

  const handleLicenseRenewalSubmit = async (e) => {
    e.preventDefault()
    const errors = validateLicenseForm()
    if (Object.keys(errors).length > 0) {
      setLicenseFormErrors(errors)
      return
    }
    setIsSubmittingLicense(true)
    try {
      const result = await submitLicenseRenewal({
        newLicenseId: licenseForm.newLicenseId,
        submittedExpiryDate: licenseForm.submittedExpiryDate,
      })
      const status = result?.status || 'pending'
      setRenewalStatus(status)
      setLicenseRenewalSubmitted(true)
      // Persist so refresh doesn't clear the submitted state
      try {
        localStorage.setItem(
          `ngja_license_renewal_${user?.id}`,
          JSON.stringify({ submitted: true, status })
        )
      } catch { /* ignore */ }
      pushToast({
        title: 'Renewal Submitted',
        message: 'Your license renewal request has been submitted successfully.',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Submission Failed',
        message: error.message || 'Unable to submit renewal. Please try again.',
        tone: 'danger',
      })
    } finally {
      setIsSubmittingLicense(false)
    }
  }

  const tone = statusTone[userStatus] || 'info'
  const badge = toneStyles[tone]

  return (
    <>
      {/* ── Profile Popup Modal — rendered outside ul-root/topnav so fixed positioning is relative to the viewport, not clipped by the topnav's backdrop-filter ── */}
      {profileMenuOpen && (
        <div
          className="ul-profile-modal-overlay"
          onClick={() => setProfileMenuOpen(false)}
        >
          <div
            className="ul-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ul-profile-modal-close"
              aria-label="Close"
              onClick={() => setProfileMenuOpen(false)}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
            <div className="ul-profile-dropdown-header">
              <div className="ul-avatar large">
                {typeof user?.avatar === 'string' && user.avatar.length <= 3
                  ? user.avatar
                  : 'U'}
              </div>
              <div className="ul-profile-dropdown-info">
                <span className="ul-profile-dropdown-name">
                  {user?.fullName || user?.username || 'User'}
                </span>
                <span className="ul-profile-dropdown-email">
                  {user?.email || 'N/A'}
                </span>
              </div>
            </div>
            <div className="ul-profile-dropdown-details">
              <div className="ul-profile-dropdown-row">
                <span>Username</span>
                <span>{user?.username || 'N/A'}</span>
              </div>
              <div className="ul-profile-dropdown-row">
                <span>NIC</span>
                <span>{user?.nic || 'N/A'}</span>
              </div>
              <div className="ul-profile-dropdown-row">
                <span>Status</span>
                <span>{userStatus || 'N/A'}</span>
              </div>
            </div>
            <button
              type="button"
              className="ul-profile-logout-btn"
              onClick={() => {
                setProfileMenuOpen(false)
                logout()
              }}
            >
              <LogOut style={{ width: 15, height: 15 }} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ── License Expired Modal — rendered outside ul-root to cover everything ── */}
      {showLicenseModal && (
        <div className="ul-license-modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(0,10,30,0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div className="ul-license-modal" style={{
            width: '100%',
            maxWidth: '480px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            <div className={`ul-license-modal-header${licenseRenewalSubmitted ? ' pending' : ''}`}>
              <div className="ul-license-modal-icon">
                {licenseRenewalSubmitted ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                )}
              </div>
              <h2 className="ul-license-modal-title">
                {licenseRenewalSubmitted ? 'Renewal Request Submitted' : 'License Expired'}
              </h2>
              <p className="ul-license-modal-subtitle">
                {licenseRenewalSubmitted
                  ? 'Your request is under review by the administrator.'
                  : 'Your gem dealer license has expired. Submit a renewal request to continue using the system.'}
              </p>
            </div>
            <div className="ul-license-modal-body">
              {!licenseRenewalSubmitted ? (
                <form onSubmit={handleLicenseRenewalSubmit}>
                  <div className="ul-license-field">
                    <label className="ul-license-label">
                      New License ID <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="newLicenseId"
                      value={licenseForm.newLicenseId}
                      onChange={handleLicenseFormChange}
                      placeholder="e.g. NEW-LIC-2027"
                      className={`ul-license-input${licenseFormErrors.newLicenseId ? ' error' : ''}`}
                    />
                    {licenseFormErrors.newLicenseId && (
                      <p className="ul-license-error">{licenseFormErrors.newLicenseId}</p>
                    )}
                  </div>
                  <div className="ul-license-field">
                    <label className="ul-license-label">
                      New Expiry Date <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="submittedExpiryDate"
                      value={licenseForm.submittedExpiryDate}
                      onChange={handleLicenseFormChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`ul-license-input${licenseFormErrors.submittedExpiryDate ? ' error' : ''}`}
                    />
                    {licenseFormErrors.submittedExpiryDate && (
                      <p className="ul-license-error">{licenseFormErrors.submittedExpiryDate}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingLicense}
                    className="ul-license-submit-btn"
                  >
                    {isSubmittingLicense ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Submitting...
                      </>
                    ) : 'Submit Renewal Request →'}
                  </button>
                </form>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Request Status:</span>
                    <span className={`ul-license-status-badge ${renewalStatus || 'pending'}`}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {renewalStatus || 'Pending'}
                    </span>
                  </div>
                  <div className="ul-license-pending-info">
                    Your renewal request has been submitted and is awaiting administrator approval.
                    Once approved, you will be able to log in and access all features again.
                    Please check back later or contact the NGJA office if you need urgent assistance.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          background-image: url('${signupBg}');
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

        /* ── Main column ── */
        .ul-main {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 1.25rem 1.5rem 2rem;
          min-width: 0;
        }

        /* ── Top nav card ── */
        .ul-topnav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 0.9rem 1.25rem 0.9rem 1.5rem;
          margin-bottom: 1.75rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.12);
          position: relative;
        }

        /* Left: system label + page title */
        .ul-topnav-left {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .ul-topnav-divider {
          width: 1px;
          align-self: stretch;
          background: linear-gradient(180deg, transparent, rgba(15,23,42,0.12), transparent);
          flex-shrink: 0;
        }
        .ul-topnav-system {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b8922a;
          white-space: nowrap;
        }
        .ul-topnav-divider {
          width: 1px;
          align-self: stretch;
          background: linear-gradient(180deg, transparent, rgba(15,23,42,0.12), transparent);
          flex-shrink: 0;
        }
        .ul-topnav-system::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d4af37;
          flex-shrink: 0;
        }
        .ul-topnav-divider {
          width: 1px;
          align-self: stretch;
          background: linear-gradient(180deg, transparent, rgba(15,23,42,0.12), transparent);
          flex-shrink: 0;
        }
        .ul-topnav-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f1a2b;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ul-topnav-divider {
          width: 1px;
          align-self: stretch;
          background: linear-gradient(180deg, transparent, rgba(15,23,42,0.12), transparent);
          flex-shrink: 0;
        }

        /* Right: controls */
        .ul-topnav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .ul-topnav-divider {
          width: 1px;
          align-self: stretch;
          background: linear-gradient(180deg, transparent, rgba(15,23,42,0.12), transparent);
          flex-shrink: 0;
        }

        /* Status badge */
        .ul-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1.5px solid;
          font-size: 12px;
          font-weight: 600;
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
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1.5px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4b5563;
          transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .ul-icon-btn:hover {
          border-color: #d9c89a;
          color: #b8922a;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px -4px rgba(184, 146, 42, 0.35);
        }
        .ul-icon-btn svg {
          width: 16px;
          height: 16px;
          stroke-width: 1.8px;
        }

        .ul-avatar-pill {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 4px 14px 4px 4px;
          border-radius: 999px;
          border: 1.5px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .ul-avatar-pill:hover {
          border-color: #d9c89a;
          box-shadow: 0 4px 10px -4px rgba(184, 146, 42, 0.35);
        }
        .ul-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d4af37 0%, #b8922a 100%);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          text-transform: uppercase;
          box-shadow: inset 0 0 0 2px rgba(255,255,255,0.35);
        }
        .ul-avatar-label {
          font-size: 13px;
          font-weight: 600;
          color: #0f1a2b;
          white-space: nowrap;
        }

        /* Profile dropdown */
        .ul-profile-menu-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .ul-profile-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 10, 30, 0.82);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .ul-profile-modal {
          position: relative;
          width: 100%;
          max-width: 300px;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
          overflow: hidden;
          animation: modalIn 0.22s ease;
        }
        .ul-profile-modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.2);
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: background 0.15s ease;
        }
        .ul-profile-modal-close:hover {
          background: rgba(255,255,255,0.35);
        }
        .ul-profile-dropdown-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #003A6B 0%, #005fa3 100%);
        }
        .ul-avatar.large {
          width: 40px;
          height: 40px;
          font-size: 14px;
        }
        .ul-profile-dropdown-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .ul-profile-dropdown-name {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ul-profile-dropdown-email {
          font-size: 11.5px;
          color: rgba(255,255,255,0.75);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ul-profile-dropdown-details {
          padding: 10px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ul-profile-dropdown-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12.5px;
        }
        .ul-profile-dropdown-row span:first-child {
          color: #6b7280;
          font-weight: 500;
        }
        .ul-profile-dropdown-row span:last-child {
          color: #0f1a2b;
          font-weight: 600;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ul-profile-logout-btn {
          width: calc(100% - 20px);
          margin: 4px 10px 10px;
          padding: 9px;
          border: none;
          border-radius: 10px;
          background: #fff1f2;
          color: #b91c1c;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s ease;
        }
        .ul-profile-logout-btn:hover {
          background: #fecdd3;
        }

        /* Premium Hamburger */
        .ul-hamburger {
            display: none;
            align-items: center;
            justify-content: center;

            width: 44px;
            height: 44px;

            border-radius: 14px;
            cursor: pointer;
            flex-shrink: 0;

            color: #2f2f2f;

            background: linear-gradient(
                145deg,
                rgba(255,255,255,0.75),
                rgba(235,235,235,0.65)
            );

            border: 1px solid rgba(255,255,255,0.6);

            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);

            box-shadow:
                0 8px 20px rgba(0,0,0,0.10),
                inset 0 1px 0 rgba(255,255,255,0.8);

            transition: all .25s ease;
        }

        .ul-hamburger svg{
            width:20px;
            height:20px;
            stroke-width:2;
            transition:transform .25s ease;
        }

        .ul-hamburger:hover{
            transform:translateY(-2px);

            background:linear-gradient(
                145deg,
                #ffffff,
                #f2f2f2
            );

            box-shadow:
                0 12px 28px rgba(0,0,0,.16),
                inset 0 1px 0 rgba(255,255,255,.9);
        }

        .ul-hamburger:hover svg{
            transform:scale(1.08);
        }

        .ul-hamburger:active{
            transform:scale(.95);
        }
        
        /* ── License warning banner ── */
        .ul-license-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-radius: 14px;
          padding: 12px 16px;
          margin-bottom: 1rem;
          font-size: 0.84rem;
          font-weight: 500;
          line-height: 1.4;
          border: 1.5px solid;
          animation: slideDown 0.3s ease;
        }
        .ul-license-banner.expired {
          background: rgba(254, 226, 226, 0.92);
          border-color: #fca5a5;
          color: #991b1b;
        }
        .ul-license-banner.expiring {
          background: rgba(254, 243, 199, 0.92);
          border-color: #fcd34d;
          color: #92400e;
        }
        .ul-license-banner-dismiss {
          margin-left: auto;
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.15s;
          color: inherit;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .ul-license-banner-dismiss:hover { opacity: 1; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Page shell ── */
        .ul-shell {
          flex: 1;
          min-width: 0;
        }

        /* ── License renewal modal ── */
        .ul-license-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 10, 30, 0.82);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          pointer-events: all;
        }
        .ul-license-modal {
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
          overflow: hidden;
          animation: modalIn 0.25s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ul-license-modal-header {
          background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%);
          padding: 1.5rem 1.75rem 1.25rem;
        }
        .ul-license-modal-header.pending {
          background: linear-gradient(135deg, #003A6B 0%, #005fa3 100%);
        }
        .ul-license-modal-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.85rem;
        }
        .ul-license-modal-title {
          margin: 0 0 4px;
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .ul-license-modal-subtitle {
          margin: 0;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.4;
        }
        .ul-license-modal-body {
          padding: 1.5rem 1.75rem 1.75rem;
        }
        .ul-license-field {
          margin-bottom: 1rem;
        }
        .ul-license-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 6px;
        }
        .ul-license-input {
          width: 100%;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
          background: #f9fafb;
          color: #111827;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .ul-license-input:focus {
          border-color: #003A6B;
          box-shadow: 0 0 0 3px rgba(0,58,107,0.1);
          background: #fff;
        }
        .ul-license-input.error {
          border-color: #f87171;
        }
        .ul-license-error {
          font-size: 0.72rem;
          color: #ef4444;
          margin-top: 4px;
        }
        .ul-license-submit-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 10px;
          border: none;
          background: #003A6B;
          color: #ffde1a;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1.25rem;
          transition: background 0.2s;
        }
        .ul-license-submit-btn:disabled {
          background: #9ca3af;
          color: #fff;
          cursor: not-allowed;
        }
        .ul-license-submit-btn:not(:disabled):hover {
          background: #004f96;
        }
        .ul-license-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 1rem;
        }
        .ul-license-status-badge.pending {
          background: #fef9ec;
          color: #92680a;
          border: 1.5px solid #f5dfa0;
        }
        .ul-license-pending-info {
          margin-top: 1rem;
          padding: 0.85rem 1rem;
          background: #f0f9ff;
          border: 1.5px solid #bae6fd;
          border-radius: 10px;
          font-size: 0.82rem;
          color: #0369a1;
          line-height: 1.5;
        }
          @media (max-width: 768px) {
          .ul-root {
            grid-template-columns: 1fr;
          }
          .ul-main {
            padding: 0.75rem 0.75rem 1.5rem;
          }
          .ul-topnav {
            margin-bottom: 1.75rem;
          }
          .ul-hamburger { display: flex; }
          .ul-status-badge { display: none; }
          .ul-root > *:first-child {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .ul-avatar-label { display: none; }
          .ul-topnav {
            padding: 0.55rem 0.75rem 0.55rem 1rem;
          }
          .ul-license-modal {
            border-radius: 16px;
          }
          .ul-license-modal-header {
            padding: 1.25rem 1.25rem 1rem;
          }
          .ul-license-modal-body {
            padding: 1.25rem 1.25rem 1.5rem;
          }
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
          {/* ── Top nav bar (replaces TopNav component visually) ── */}
          <div className="ul-topnav">
            {/* Left */}
            <div className="ul-topnav-left">
              <span className="ul-topnav-system">Export Invoice System</span>
              {location.pathname === '/user/dashboard' && (
                <span className="ul-topnav-title">{label}</span>
              )}
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
              <div className="ul-profile-menu-wrap" ref={profileMenuRef}>
                <div
                  className="ul-avatar-pill"
                  role="button"
                  tabIndex={0}
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                >
                  <div className="ul-avatar">
                    {typeof user?.avatar === 'string' && user.avatar.length <= 3
                      ? user.avatar
                      : 'U'}
                  </div>
                  <span className="ul-avatar-label">Profile</span>
                </div>
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

          {/* License expiring-soon banner (non-expired warning only) */}
          {licenseWarning && !isLicenseExpired && !licenseWarningDismissed && (
            <div className="ul-license-banner expiring">
              <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
              <span>{licenseWarning}</span>
              <button
                type="button"
                className="ul-license-banner-dismiss"
                aria-label="Dismiss license warning"
                onClick={() => setLicenseWarningDismissed(true)}
              >
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>
          )}

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