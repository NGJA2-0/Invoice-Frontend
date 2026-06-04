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
    // Clear error for this field when user starts typing
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

      // Reset form and go back to login
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

  if (showSignUp) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass-card w-full max-w-2xl rounded-2xl border px-6 py-8 sm:px-8 sm:py-10">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => {
                setShowSignUp(false)
                setSignupErrors({})
              }}
              className="text-azure-600 hover:text-azure-700 transition-colors"
              type="button"
            >
              ← Back
            </button>
          </div>

          <h1 className="font-display text-3xl text-ink-900">Create Account</h1>
          <p className="mt-2 text-sm text-ink-600">
            Register for NGJA export invoice access.
          </p>

          <form onSubmit={handleSignup} className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="text-sm font-semibold text-ink-900">Username <span className="text-red-500">*</span></label>
                <input type="text" name="username" value={signupData.username} onChange={handleSignupChange} placeholder="abc_gems"
                  className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${signupErrors.username ? 'border-red-500' : 'border-ink-200 focus:border-azure-500'}`} />
                {signupErrors.username && <p className="mt-1 text-xs text-red-500">{signupErrors.username}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-900">Business Name <span className="text-red-500">*</span></label>
                <input type="text" name="businessName" value={signupData.businessName} onChange={handleSignupChange} placeholder="ABC Gems Pvt Ltd"
                  className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${signupErrors.businessName ? 'border-red-500' : 'border-ink-200 focus:border-azure-500'}`} />
                {signupErrors.businessName && <p className="mt-1 text-xs text-red-500">{signupErrors.businessName}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink-900">Business Address <span className="text-red-500">*</span></label>
                <input type="text" name="businessAddress" value={signupData.businessAddress} onChange={handleSignupChange} placeholder="123 Main Street, Colombo"
                  className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${signupErrors.businessAddress ? 'border-red-500' : 'border-ink-200 focus:border-azure-500'}`} />
                {signupErrors.businessAddress && <p className="mt-1 text-xs text-red-500">{signupErrors.businessAddress}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-900">Gem Dealer File No. <span className="text-red-500">*</span></label>
                <input type="text" name="gemDealerFileNo" value={signupData.gemDealerFileNo} onChange={handleSignupChange} placeholder="GDF123456"
                  className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${signupErrors.gemDealerFileNo ? 'border-red-500' : 'border-ink-200 focus:border-azure-500'}`} />
                {signupErrors.gemDealerFileNo && <p className="mt-1 text-xs text-red-500">{signupErrors.gemDealerFileNo}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-900">NIC / BRC Number <span className="text-red-500">*</span></label>
                <input type="text" name="nicOrBrc" value={signupData.nicOrBrc} onChange={handleSignupChange} placeholder="123456789V"
                  className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${signupErrors.nicOrBrc ? 'border-red-500' : 'border-ink-200 focus:border-azure-500'}`} />
                {signupErrors.nicOrBrc && <p className="mt-1 text-xs text-red-500">{signupErrors.nicOrBrc}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink-900">Mobile Numbers <span className="text-red-500">*</span></label>
                {signupData.mobileNumbers.map((mobile, index) => (
                  <div key={index} className="mt-2 flex gap-2">
                    <input type="tel" value={mobile} onChange={(e) => handleMobileChange(index, e.target.value)} placeholder="0771234567"
                      className={`flex-1 rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${signupErrors.mobileNumbers ? 'border-red-500' : 'border-ink-200 focus:border-azure-500'}`} />
                    {signupData.mobileNumbers.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMobile(index)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {signupErrors.mobileNumbers && <p className="mt-1 text-xs text-red-500">{signupErrors.mobileNumbers}</p>}
                <button type="button" onClick={handleAddMobile}
                  className="mt-2 text-xs font-semibold text-azure-600 hover:text-azure-700 transition-colors">
                  + Add Another Mobile Number
                </button>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink-900">Email <span className="text-ink-400 font-normal">(Optional)</span></label>
                <input type="email" name="email" value={signupData.email} onChange={handleSignupChange} placeholder="info@abcgems.com"
                  className="mt-2 w-full rounded-lg border border-ink-200 px-4 py-2 text-sm outline-none transition-colors focus:border-azure-500" />
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-900">Password <span className="text-red-500">*</span></label>
                <input type="password" name="password" value={signupData.password} onChange={handleSignupChange} placeholder="Create secure password"
                  className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${signupErrors.password ? 'border-red-500' : 'border-ink-200 focus:border-azure-500'}`} />
                {signupErrors.password && <p className="mt-1 text-xs text-red-500">{signupErrors.password}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-900">Confirm Password <span className="text-red-500">*</span></label>
                <input type="password" name="confirmPassword" value={signupData.confirmPassword} onChange={handleSignupChange} placeholder="Confirm password"
                  className={`mt-2 w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${signupErrors.confirmPassword ? 'border-red-500' : 'border-ink-200 focus:border-azure-500'}`} />
                {signupErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{signupErrors.confirmPassword}</p>}
              </div>

            </div>

            <button type="submit" disabled={isSigningUp}
              className="w-full rounded-lg bg-azure-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-azure-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSigningUp ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating Account...</>) : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-card w-full max-w-md rounded-2xl border px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink-900">Welcome</h1>
          <p className="mt-2 text-sm text-ink-600">
            Sign in to your NGJA export invoice account.
          </p>
        </div>

        {/* Username Verification */}
        {!isUsernameVerified ? (
          <form onSubmit={handleVerifyUsername} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-ink-900">
                Username
              </label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-3 h-5 w-5 text-ink-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe"
                  className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-azure-500 focus:ring-1 focus:ring-azure-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !username.trim()}
              className="w-full rounded-lg bg-azure-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-azure-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-ink-500">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSignUp(true)}
              className="w-full rounded-lg border border-azure-600 py-2.5 text-sm font-semibold text-azure-600 transition-all hover:bg-azure-50"
            >
              Create New Account
            </button>
          </form>
        ) : (
          /* Password Entry */
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Verified User Info */}
            <div className="rounded-lg bg-azure-50 border border-azure-200 p-4">
              <p className="text-xs text-ink-600">Verified as</p>
              <p className="text-sm font-semibold text-ink-900 mt-1">
                {verifiedUserInfo.fullName}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">
                {verifiedUserInfo.isAdmin ? 'Administrator' : 'User'}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-ink-900">
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-3 h-5 w-5 text-ink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-azure-500 focus:ring-1 focus:ring-azure-200"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !password.trim()}
              className="w-full rounded-lg bg-azure-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-azure-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <button
              type="button"
              onClick={handleResetLogin}
              className="w-full text-center text-xs font-semibold text-ink-500 hover:text-ink-700 transition-colors"
            >
              ← Use Different Username
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
