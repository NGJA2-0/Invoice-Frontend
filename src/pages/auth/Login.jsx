import { useState, useRef } from 'react'
import { Lock, User, Loader2, ArrowRight, Mail, Phone, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useApp } from '../../context/AppContext'

const Login = () => {
  const navigate = useNavigate()
  const { pushToast, userLogin, adminLogin, signUp, verifyUsername } = useApp()

  // Login states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isUsernameVerified, setIsUsernameVerified] = useState(false)
  const [verifiedUserInfo, setVerifiedUserInfo] = useState(null)

  // Signup states
  const [showSignUp, setShowSignUp] = useState(false)
  const [signupData, setSignupData] = useState({
    username: '',
    businessName: '',
    businessAddress: '',
    gemDealerFileNo: '',
    nicOrBrc: '',
    mobileNumbers: [''],
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signupErrors, setSignupErrors] = useState({})

  // Handle username verification
  const handleVerifyUsername = async (e) => {
    e.preventDefault()

    if (!username.trim()) {
      pushToast({
        title: 'Validation Error',
        message: 'Please enter a username.',
        tone: 'warning',
      })
      return
    }

    setIsVerifying(true)
    try {
      const userInfo = await verifyUsername(username)
      setVerifiedUserInfo(userInfo)
      setIsUsernameVerified(true)
      pushToast({
        title: 'Username Verified',
        message: `Welcome, ${userInfo.fullName}!`,
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Verification Failed',
        message: error.message || 'Unable to verify username. Please try again.',
        tone: 'danger',
      })
      setIsUsernameVerified(false)
      setVerifiedUserInfo(null)
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()

    if (!password.trim()) {
      pushToast({
        title: 'Validation Error',
        message: 'Please enter your password.',
        tone: 'warning',
      })
      return
    }

    setIsLoggingIn(true)
    try {
      let loggedIn

      if (verifiedUserInfo.isAdmin) {
        loggedIn = await adminLogin(username, password)
        pushToast({
          title: 'Login Successful',
          message: 'Welcome to the Admin Portal.',
          tone: 'success',
        })
        navigate('/admin/dashboard')
      } else {
        loggedIn = await userLogin(username, password)
        pushToast({
          title: 'Login Successful',
          message: 'Welcome to the User Portal.',
          tone: 'success',
        })
        navigate('/user/dashboard')
      }
    } catch (error) {
      pushToast({
        title: 'Login Failed',
        message: error.message?.toLowerCase().includes('invalid credentials')
          ? 'Your account is currently awaiting administrator approval.'
          : error.message || 'Unable to login. Please try again.',
        tone: 'danger',
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Handle signup form changes
  const handleSignupChange = (e) => {
    const { name, value } = e.target
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (signupErrors[name]) {
      setSignupErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleAddMobile = () => {
    setSignupData(prev => ({ ...prev, mobileNumbers: [...prev.mobileNumbers, ''] }))
  }

  const handleMobileChange = (index, value) => {
    const updated = [...signupData.mobileNumbers]
    updated[index] = value
    setSignupData(prev => ({ ...prev, mobileNumbers: updated }))
    if (signupErrors.mobileNumbers) {
      setSignupErrors(prev => ({ ...prev, mobileNumbers: '' }))
    }
  }

  const handleRemoveMobile = (index) => {
    if (signupData.mobileNumbers.length === 1) return
    setSignupData(prev => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.filter((_, i) => i !== index)
    }))
  }

  const validateSignupForm = () => {
    const errors = {}

    if (!signupData.username.trim()) errors.username = 'Username is required'
    else if (signupData.username.length < 3) errors.username = 'Username must be at least 3 characters'

    if (!signupData.businessName.trim()) errors.businessName = 'Business name is required'
    if (!signupData.businessAddress.trim()) errors.businessAddress = 'Business address is required'
    if (!signupData.gemDealerFileNo.trim()) errors.gemDealerFileNo = 'Gem dealer file number is required'
    if (!signupData.nicOrBrc.trim()) errors.nicOrBrc = 'NIC/BRC number is required'

    const validMobiles = signupData.mobileNumbers.filter(m => m.trim())
    if (validMobiles.length === 0) errors.mobileNumbers = 'At least one mobile number is required'

    if (!signupData.password.trim()) errors.password = 'Password is required'
    else if (signupData.password.length < 6) errors.password = 'Password must be at least 6 characters'

    if (signupData.password !== signupData.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    return errors
  }

  // Handle signup submission
  const handleSignup = async (e) => {
    e.preventDefault()

    const errors = validateSignupForm()
    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors)
      pushToast({
        title: 'Validation Error',
        message: 'Please fix all errors before submitting.',
        tone: 'warning',
      })
      return
    }

    setIsSigningUp(true)
    try {
      await signUp({
        username: signupData.username,
        businessName: signupData.businessName,
        businessAddress: signupData.businessAddress,
        gemDealerFileNo: signupData.gemDealerFileNo,
        nicOrBrc: signupData.nicOrBrc,
        mobileNumbers: signupData.mobileNumbers.filter(m => m.trim()),
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
      })

      pushToast({
        title: 'Account Created',
        message: 'Your account has been created successfully. You can now login.',
        tone: 'success',
      })

      setShowSignUp(false)
      setUsername('')
      setPassword('')
      setIsUsernameVerified(false)
      setVerifiedUserInfo(null)
      setSignupData({
        username: '',
        businessName: '',
        businessAddress: '',
        gemDealerFileNo: '',
        nicOrBrc: '',
        mobileNumbers: [''],
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch (error) {
      pushToast({
        title: 'Signup Failed',
        message: error.message || 'Unable to create account. Please try again.',
        tone: 'danger',
      })
    } finally {
      setIsSigningUp(false)
    }
  }

  // Reset form
  const handleResetLogin = () => {
    setUsername('')
    setPassword('')
    setIsUsernameVerified(false)
    setVerifiedUserInfo(null)
  }

  // ─── Shared styles ───────────────────────────────────────────────────────────

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    backgroundImage: 'url(/src/assets/signup.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.65rem 1rem',
    fontSize: '0.875rem',
    border: `1.5px solid ${hasError ? '#e53e3e' : '#d1d9e6'}`,
    borderRadius: '10px',
    outline: 'none',
    background: '#f8f9fc',
    color: '#1a202c',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  })

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#003A6B',
    marginBottom: '6px',
  }

  const errorStyle = {
    fontSize: '0.72rem',
    color: '#e53e3e',
    marginTop: '4px',
  }

  const primaryBtnStyle = (disabled) => ({
    width: '100%',
    padding: '0.75rem',
    borderRadius: '10px',
    border: 'none',
    background: disabled ? '#b0bec5' : '#003A6B',
    color: disabled ? '#fff' : '#ffde1a',
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '0.03em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s, transform 0.1s',
  })

  // ─── Signup View ─────────────────────────────────────────────────────────────

  // Branding component (shared by both login and signup)
  const BrandingPanel = () => (
    <div className="login-left">
      {/* Gem icon */}
      <div style={{
        width: '90px', height: '90px', marginBottom: '1.5rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #003A6B 0%, #005fa3 100%)',
        border: '2px solid rgba(255,222,26,0.4)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,222,26,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 44,16 44,32 24,44 4,32 4,16" fill="rgba(255,222,26,0.15)" stroke="#ffde1a" strokeWidth="1.5"/>
          <polygon points="24,10 38,19 38,29 24,38 10,29 10,19" fill="rgba(255,222,26,0.25)" stroke="#ffde1a" strokeWidth="1"/>
          <polygon points="24,16 32,21 32,27 24,32 16,27 16,21" fill="#ffde1a" opacity="0.9"/>
        </svg>
      </div>

      {/* NGJA */}
      <h1 style={{
        margin: '0 0 6px',
        fontSize: '3.5rem',
        fontWeight: '900',
        letterSpacing: '0.18em',
        color: '#ffffff',
        textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        lineHeight: 1,
      }}>
        NGJA
      </h1>

      {/* Sinhala name */}
      <p style={{
        margin: '0 0 1.25rem',
        fontSize: '1.35rem',
        fontWeight: '700',
        color: '#ffde1a',
        letterSpacing: '0.06em',
        textShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}>
        රත්නදීප
      </p>

      {/* Divider line */}
      <div style={{
        width: '48px', height: '2px',
        background: 'linear-gradient(90deg, transparent, #ffde1a, transparent)',
        marginBottom: '1.1rem',
      }} />

      <p style={{
        margin: 0,
        fontSize: '0.78rem',
        fontWeight: '600',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
      }}>
        National Gem & Jewellery Authority
      </p>
    </div>
  )

  if (showSignUp) {
    return (
      <div style={pageStyle}>
        <div style={{
          position: 'fixed', inset: 0,
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          background: 'rgba(0, 20, 50, 0.50)', zIndex: 0,
        }} />

        <div className="login-layout" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>

          {/* ── LEFT: Branding ── */}
          <BrandingPanel />

          {/* ── RIGHT: Signup card ── */}
          <div className="login-right">
            <div style={{
              width: '100%', maxWidth: '680px',
              background: 'rgba(255,255,255,0.97)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '2.5rem',
              boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
            }}>

              {/* Header */}
              <div style={{ marginBottom: '2rem' }}>
                <button
                  onClick={() => { setShowSignUp(false); setSignupErrors({}) }}
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#003A6B',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    padding: '0',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ← Back to login
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#003A6B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{ width: '20px', height: '3px', background: '#ffde1a', borderRadius: '2px' }} />
                  </div>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#003A6B', lineHeight: 1.2 }}>
                      Create Account
                    </h1>
                    <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                      Register for NGJA export invoice access
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#eef2f7', marginBottom: '1.75rem' }} />

          <form onSubmit={handleSignup}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              {/* Username */}
              <div>
                <label style={labelStyle}>Username <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="text" name="username" value={signupData.username}
                  onChange={handleSignupChange} placeholder="abc_gems"
                  style={inputStyle(signupErrors.username)}
                />
                {signupErrors.username && <p style={errorStyle}>{signupErrors.username}</p>}
              </div>

              {/* Business Name */}
              <div>
                <label style={labelStyle}>Business Name <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="text" name="businessName" value={signupData.businessName}
                  onChange={handleSignupChange} placeholder="ABC Gems Pvt Ltd"
                  style={inputStyle(signupErrors.businessName)}
                />
                {signupErrors.businessName && <p style={errorStyle}>{signupErrors.businessName}</p>}
              </div>

              {/* Business Address — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Business Address <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="text" name="businessAddress" value={signupData.businessAddress}
                  onChange={handleSignupChange} placeholder="123 Main Street, Colombo"
                  style={inputStyle(signupErrors.businessAddress)}
                />
                {signupErrors.businessAddress && <p style={errorStyle}>{signupErrors.businessAddress}</p>}
              </div>

              {/* Gem Dealer File No */}
              <div>
                <label style={labelStyle}>Gem Dealer File No. <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="text" name="gemDealerFileNo" value={signupData.gemDealerFileNo}
                  onChange={handleSignupChange} placeholder="GDF123456"
                  style={inputStyle(signupErrors.gemDealerFileNo)}
                />
                {signupErrors.gemDealerFileNo && <p style={errorStyle}>{signupErrors.gemDealerFileNo}</p>}
              </div>

              {/* NIC / BRC */}
              <div>
                <label style={labelStyle}>NIC / BRC Number <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="text" name="nicOrBrc" value={signupData.nicOrBrc}
                  onChange={handleSignupChange} placeholder="123456789V"
                  style={inputStyle(signupErrors.nicOrBrc)}
                />
                {signupErrors.nicOrBrc && <p style={errorStyle}>{signupErrors.nicOrBrc}</p>}
              </div>

              {/* Mobile Numbers — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Mobile Numbers <span style={{ color: '#e53e3e' }}>*</span></label>
                {signupData.mobileNumbers.map((mobile, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginTop: index === 0 ? '0' : '8px' }}>
                    <input
                      type="tel" value={mobile}
                      onChange={(e) => handleMobileChange(index, e.target.value)}
                      placeholder="0771234567"
                      style={{ ...inputStyle(signupErrors.mobileNumbers), flex: 1 }}
                    />
                    {signupData.mobileNumbers.length > 1 && (
                      <button
                        type="button" onClick={() => handleRemoveMobile(index)}
                        style={{
                          padding: '0 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #fecaca',
                          background: '#fff5f5',
                          color: '#e53e3e',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {signupErrors.mobileNumbers && <p style={errorStyle}>{signupErrors.mobileNumbers}</p>}
                <button
                  type="button" onClick={handleAddMobile}
                  style={{
                    marginTop: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#003A6B',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    padding: '0',
                    letterSpacing: '0.02em',
                  }}
                >
                  + Add Another Number
                </button>
              </div>

              {/* Email — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>
                  Email <span style={{ color: '#94a3b8', fontWeight: '500', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <input
                  type="email" name="email" value={signupData.email}
                  onChange={handleSignupChange} placeholder="info@abcgems.com"
                  style={inputStyle(false)}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="password" name="password" value={signupData.password}
                  onChange={handleSignupChange} placeholder="Min. 6 characters"
                  style={inputStyle(signupErrors.password)}
                />
                {signupErrors.password && <p style={errorStyle}>{signupErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={labelStyle}>Confirm Password <span style={{ color: '#e53e3e' }}>*</span></label>
                <input
                  type="password" name="confirmPassword" value={signupData.confirmPassword}
                  onChange={handleSignupChange} placeholder="Repeat password"
                  style={inputStyle(signupErrors.confirmPassword)}
                />
                {signupErrors.confirmPassword && <p style={errorStyle}>{signupErrors.confirmPassword}</p>}
              </div>

            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#eef2f7', margin: '1.75rem 0' }} />

            <button
              type="submit"
              disabled={isSigningUp}
              style={primaryBtnStyle(isSigningUp)}
            >
              {isSigningUp
                ? (<><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />Creating Account...</>)
                : 'Create Account →'
              }
              </button>
            </form>
          </div>
        </div>
      </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .login-layout { display: flex; align-items: center; width: 100%; max-width: 1100px; gap: 0; position: relative; z-index: 1; }
          .login-left { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
          .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 1rem; }
          @media (max-width: 768px) {
            .login-layout { flex-direction: column; }
            .login-left { padding: 2rem 1rem 0.5rem; }
            .login-right { width: 100%; }
          }
        `}</style>
      </div>
    )
  }

  // ─── Login View ───────────────────────────────────────────────────────────────

  return (
    <div style={pageStyle}>
      <div style={{
        position: 'fixed', inset: 0,
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        background: 'rgba(0, 20, 50, 0.50)', zIndex: 0,
      }} />

      <div className="login-layout">

        {/* ── LEFT: Branding ── */}
        <BrandingPanel />

        {/* ── RIGHT: Login card ── */}
        <div className="login-right">
          <div style={{
            width: '100%', maxWidth: '420px',
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          }}>

            {/* Top accent bar */}
        <div style={{
          background: '#003A6B',
          padding: '1.75rem 2rem',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '1rem',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffde1a' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.12em', color: 'rgba(255,222,26,0.8)', textTransform: 'uppercase' }}>
              NGJA Portal
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>
            Welcome back
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
            Sign in to your export invoice account
          </p>
        </div>

        {/* Form area */}
        <div style={{ padding: '2rem' }}>

          {/* ── Step 1: Username Verification ── */}
          {!isUsernameVerified ? (
            <form onSubmit={handleVerifyUsername} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div>
                <label style={labelStyle}>Username</label>
                <div style={{ position: 'relative' }}>
                  <User style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: 16, height: 16, color: '#94a3b8',
                  }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="john_doe"
                    style={{ ...inputStyle(false), paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !username.trim()}
                style={primaryBtnStyle(isVerifying || !username.trim())}
              >
                {isVerifying
                  ? (<><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />Verifying...</>)
                  : (<>Continue <ArrowRight style={{ width: 15, height: 15 }} /></>)
                }
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: '#eef2f7' }} />
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.06em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#eef2f7' }} />
              </div>

              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                style={{
                  width: '100%',
                  padding: '0.72rem',
                  borderRadius: '10px',
                  border: '1.5px solid #003A6B',
                  background: 'transparent',
                  color: '#003A6B',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f5fb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Create New Account
              </button>

            </form>

          ) : (

            /* ── Step 2: Password Entry ── */
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Verified user badge */}
              <div style={{
                background: '#003A6B',
                borderRadius: '12px',
                padding: '1rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#ffde1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <User style={{ width: 18, height: 18, color: '#003A6B' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#ffffff', lineHeight: 1.3 }}>
                    {verifiedUserInfo.fullName}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '3px',
                    padding: '1px 8px',
                    borderRadius: '20px',
                    background: 'rgba(255,222,26,0.15)',
                    color: '#ffde1a',
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>
                    {verifiedUserInfo.isAdmin ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>

              {/* Password field */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: 16, height: 16, color: '#94a3b8',
                  }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    style={{ ...inputStyle(false), paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || !password.trim()}
                style={primaryBtnStyle(isLoggingIn || !password.trim())}
              >
                {isLoggingIn
                  ? (<><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />Signing in...</>)
                  : 'Sign In →'
                }
              </button>

              <button
                type="button"
                onClick={handleResetLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  letterSpacing: '0.02em',
                  padding: '0',
                  textAlign: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#003A6B'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                ← Use Different Username
              </button>

            </form>
          )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .login-layout { display: flex; align-items: center; width: 100%; max-width: 1100px; gap: 0; position: relative; z-index: 1; }
        .login-left { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
        .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        @media (max-width: 768px) {
          .login-layout { flex-direction: column; }
          .login-left { padding: 2rem 1rem 0.5rem; }
          .login-right { width: 100%; }
        }
      `}</style>
    </div>
  )
}

export default Login