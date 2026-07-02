import { useState } from 'react'
import {
  X,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Hash,
  FileText,
  IdCard,
  Eye,
  EyeOff,
} from 'lucide-react'
import { api } from '../../services/api'

const STEPS = ['tin', 'gemDealerFileNo', 'nicOrBrc']

const STEP_CONFIG = {
  tin: { label: 'Your TIN Number', placeholder: 'e.g. TIN-12345', icon: Hash },
  gemDealerFileNo: { label: 'Your Gem Dealer File No.', placeholder: 'e.g. GDF123456', icon: FileText },
  nicOrBrc: { label: 'Your NIC / BRC Number', placeholder: 'e.g. 123456789V', icon: IdCard },
}

const HEADER_TEXT = {
  collecting: 'Verify your identity to reset access',
  verifying: 'Please wait while we check your details',
  credentials: 'Choose your new username & password',
  resetting: 'Applying your new credentials',
}

const ResultPopup = ({ result, onClose, primaryLabel }) => {
  if (!result) return null
  const isSuccess = result.success

  return (
    <div className="fp-result-overlay">
      <div className="fp-result-card">
        <button type="button" className="fp-result-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <div className={`fp-result-icon ${isSuccess ? 'success' : 'fail'}`}>
          {isSuccess ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
        </div>
        <h3>{isSuccess ? 'Success' : 'Verification Failed'}</h3>
        <p>{result.message}</p>
        <button type="button" className="fp-primary-btn" onClick={onClose}>
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}

const ForgotPassword = ({ isOpen, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0)
  const [formData, setFormData] = useState({ tin: '', gemDealerFileNo: '', nicOrBrc: '' })
  const [inputValue, setInputValue] = useState('')
  const [phase, setPhase] = useState('collecting') // collecting | verifying | verifyResult | credentials | resetting | resetResult
  const [verifyResult, setVerifyResult] = useState(null)
  const [resetResult, setResetResult] = useState(null)

  const [resetData, setResetData] = useState({ newUsername: '', newPassword: '', confirmPassword: '' })
  const [resetErrors, setResetErrors] = useState({})
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!isOpen) return null

  const currentStepKey = STEPS[stepIndex]
  const currentConfig = STEP_CONFIG[currentStepKey]

  const resetAll = () => {
    setStepIndex(0)
    setFormData({ tin: '', gemDealerFileNo: '', nicOrBrc: '' })
    setInputValue('')
    setPhase('collecting')
    setVerifyResult(null)
    setResetResult(null)
    setResetData({ newUsername: '', newPassword: '', confirmPassword: '' })
    setResetErrors({})
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    resetAll()
    onClose()
  }

  const handleStepSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const updated = { ...formData, [currentStepKey]: inputValue.trim() }
    setFormData(updated)

    if (stepIndex < STEPS.length - 1) {
      setInputValue('')
      setStepIndex((i) => i + 1)
      return
    }

    // All three answers collected — call the verification API
    setPhase('verifying')
    try {
      const result = await api.post('/auth/verify-security-info', updated)
      setVerifyResult({
        success: true,
        message: result?.message || 'Security information verified successfully',
      })
    } catch (error) {
      setVerifyResult({
        success: false,
        message:
          error.message ||
          'Security verification failed. If you cannot reset your credentials yourself, please contact the NGJA directly for assistance.',
      })
    } finally {
      setPhase('verifyResult')
    }
  }

  const handleBack = () => {
    if (stepIndex === 0) return
    const prevKey = STEPS[stepIndex - 1]
    setInputValue(formData[prevKey])
    setStepIndex((i) => i - 1)
  }

  const handleVerifyResultClose = () => {
    if (verifyResult?.success) {
      setPhase('credentials')
    } else {
      handleClose()
    }
  }

  const handleResetChange = (e) => {
    const { name, value } = e.target
    setResetData((prev) => ({ ...prev, [name]: value }))
    if (resetErrors[name]) {
      setResetErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateResetForm = () => {
    const errors = {}
    if (!resetData.newUsername.trim()) errors.newUsername = 'Username is required'
    else if (resetData.newUsername.trim().length < 3) errors.newUsername = 'Username must be at least 3 characters'

    if (!resetData.newPassword.trim()) errors.newPassword = 'Password is required'
    else if (resetData.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters'

    if (resetData.newPassword !== resetData.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    return errors
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    const errors = validateResetForm()
    if (Object.keys(errors).length > 0) {
      setResetErrors(errors)
      return
    }

    setPhase('resetting')
    try {
      const result = await api.post('/auth/reset-credentials', {
        nicOrBrc: formData.nicOrBrc,
        newUsername: resetData.newUsername.trim(),
        newPassword: resetData.newPassword,
      })
      setResetResult({
        success: true,
        message: result?.message || 'Credentials reset successfully',
      })
    } catch (error) {
      setResetResult({
        success: false,
        message: error.message || 'Unable to reset credentials. Please try again.',
      })
    } finally {
      setPhase('resetResult')
    }
  }

  const handleResetResultClose = () => {
    if (resetResult?.success) {
      handleClose()
    } else {
      setPhase('credentials')
    }
  }

  return (
    <div className="fp-overlay">
      <div className="fp-card">
        <div className="fp-header">
          <div className="fp-header-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="fp-header-text">
            <h2>Reset Your Access</h2>
            <p>{HEADER_TEXT[phase] || HEADER_TEXT.collecting}</p>
          </div>
          <button type="button" className="fp-close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="fp-body">
          {(phase === 'collecting' || phase === 'verifying') && (
            <>
              <div className="fp-progress">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`fp-dot ${i === stepIndex ? 'active' : i < stepIndex ? 'done' : ''}`}
                  />
                ))}
              </div>

              <form onSubmit={handleStepSubmit}>
                <label className="fp-label">
                  {currentConfig.label} <span className="fp-req">*</span>
                </label>
                <div className="fp-input-wrap">
                  <currentConfig.icon size={16} className="fp-input-icon" />
                  <input
                    key={currentStepKey}
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentConfig.placeholder}
                    disabled={phase === 'verifying'}
                    className="fp-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim() || phase === 'verifying'}
                  className="fp-primary-btn"
                >
                  {phase === 'verifying' ? (
                    <>
                      <Loader2 size={16} className="fp-spin" /> Verifying...
                    </>
                  ) : stepIndex < STEPS.length - 1 ? (
                    <>
                      Continue <ArrowRight size={15} />
                    </>
                  ) : (
                    <>
                      Verify Details <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {stepIndex > 0 && phase !== 'verifying' && (
                  <button type="button" className="fp-back-link" onClick={handleBack}>
                    ← Back
                  </button>
                )}
              </form>
            </>
          )}

          {phase === 'credentials' && (
            <form onSubmit={handleResetSubmit}>
              <div>
                <label className="fp-label">
                  New Username <span className="fp-req">*</span>
                </label>
                <div className="fp-input-wrap">
                  <input
                    type="text"
                    name="newUsername"
                    value={resetData.newUsername}
                    onChange={handleResetChange}
                    placeholder="Choose a new username"
                    className={`fp-input ${resetErrors.newUsername ? 'fp-input-error' : ''}`}
                    style={{ paddingLeft: '14px' }}
                  />
                </div>
                {resetErrors.newUsername && <p className="fp-error">{resetErrors.newUsername}</p>}
              </div>

              <div>
                <label className="fp-label">
                  New Password <span className="fp-req">*</span>
                </label>
                <div className="fp-input-wrap">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={resetData.newPassword}
                    onChange={handleResetChange}
                    placeholder="Min. 6 characters"
                    className={`fp-input ${resetErrors.newPassword ? 'fp-input-error' : ''}`}
                    style={{ paddingLeft: '14px', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    className="fp-eye-btn"
                    onClick={() => setShowNewPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {resetErrors.newPassword && <p className="fp-error">{resetErrors.newPassword}</p>}
              </div>

              <div>
                <label className="fp-label">
                  Confirm New Password <span className="fp-req">*</span>
                </label>
                <div className="fp-input-wrap">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={resetData.confirmPassword}
                    onChange={handleResetChange}
                    placeholder="Repeat new password"
                    className={`fp-input ${resetErrors.confirmPassword ? 'fp-input-error' : ''}`}
                    style={{ paddingLeft: '14px', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    className="fp-eye-btn"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {resetErrors.confirmPassword && <p className="fp-error">{resetErrors.confirmPassword}</p>}
              </div>

              <button type="submit" className="fp-primary-btn">
                Reset Credentials <ArrowRight size={15} />
              </button>
            </form>
          )}

          {phase === 'resetting' && (
            <div className="fp-loading">
              <Loader2 size={28} className="fp-spin" />
              <p>Resetting your credentials...</p>
            </div>
          )}
        </div>
      </div>

      {phase === 'verifyResult' && (
        <ResultPopup
          result={verifyResult}
          onClose={handleVerifyResultClose}
          primaryLabel={verifyResult?.success ? 'Continue' : 'Close'}
        />
      )}

      {phase === 'resetResult' && (
        <ResultPopup
          result={resetResult}
          onClose={handleResetResultClose}
          primaryLabel={resetResult?.success ? 'Done' : 'Try Again'}
        />
      )}

      <style>{`
        .fp-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 12, 32, 0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1000;
        }

        .fp-card {
          width: 100%;
          max-width: 440px;
          background: rgba(20, 35, 65, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          animation: fp-pop 0.22s ease;
        }

        .fp-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 1.5rem 1.5rem 1.25rem;
          background: rgba(0, 40, 90, 0.55);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .fp-header-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #003A6B 0%, #005fa3 100%);
          border: 1px solid rgba(255, 222, 26, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffde1a;
        }

        .fp-header-text { flex: 1; min-width: 0; }

        .fp-header-text h2 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.25;
        }

        .fp-header-text p {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.55);
        }

        .fp-close {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          border-radius: 8px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.7);
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .fp-close:hover { background: rgba(255, 255, 255, 0.18); color: #ffffff; }

        .fp-body { padding: 1.75rem 1.5rem; }

        .fp-progress {
          display: flex;
          gap: 8px;
          margin-bottom: 1.5rem;
        }
        .fp-dot {
          flex: 1;
          height: 4px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.15);
          transition: background 0.25s;
        }
        .fp-dot.active { background: #ffde1a; }
        .fp-dot.done { background: rgba(255, 222, 26, 0.5); }

        .fp-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 6px;
        }

        .fp-req { color: #e53e3e; }

        .fp-input-wrap {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .fp-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }

        .fp-input {
          width: 100%;
          padding: 0.7rem 1rem 0.7rem 38px;
          font-size: 0.9rem;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .fp-input::placeholder { color: rgba(255, 255, 255, 0.35); }
        .fp-input:focus { border-color: #ffde1a; }
        .fp-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .fp-input-error { border-color: #ff6b6b !important; }

        .fp-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: rgba(255, 255, 255, 0.45);
          display: flex;
          align-items: center;
        }

        .fp-error {
          font-size: 0.72rem;
          color: #ff8a8a;
          margin: -0.9rem 0 1.1rem;
        }

        .fp-primary-btn {
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
          transition: opacity 0.15s;
        }
        .fp-primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .fp-primary-btn:not(:disabled):hover { opacity: 0.9; }

        .fp-back-link {
          display: block;
          margin: 14px auto 0;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.78rem;
          font-weight: 600;
        }
        .fp-back-link:hover { color: #ffde1a; }

        .fp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 1.5rem 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .fp-spin { animation: fp-spin 1s linear infinite; }
        @keyframes fp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fp-pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

        .fp-result-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 8, 24, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1100;
        }

        .fp-result-card {
          position: relative;
          width: 100%;
          max-width: 360px;
          background: rgba(22, 38, 70, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 18px;
          padding: 2rem 1.75rem 1.75rem;
          text-align: center;
          box-shadow: 0 12px 50px rgba(0, 0, 0, 0.55);
          animation: fp-pop 0.2s ease;
        }

        .fp-result-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          border-radius: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.7);
        }
        .fp-result-close:hover { background: rgba(255, 255, 255, 0.18); color: #ffffff; }

        .fp-result-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fp-result-icon.success { background: rgba(255, 222, 26, 0.15); color: #ffde1a; }
        .fp-result-icon.fail { background: rgba(255, 107, 107, 0.15); color: #ff6b6b; }

        .fp-result-card h3 {
          margin: 0 0 8px;
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
        }

        .fp-result-card p {
          margin: 0 0 1.5rem;
          font-size: 0.85rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.65);
        }

        @media (max-width: 480px) {
          .fp-card { max-width: 100%; border-radius: 16px; }
          .fp-header { padding: 1.25rem 1.1rem 1rem; }
          .fp-body { padding: 1.4rem 1.1rem; }
          .fp-header-text h2 { font-size: 1.05rem; }
          .fp-result-card { padding: 1.75rem 1.25rem 1.5rem; }
        }
      `}</style>
    </div>
  )
}

export default ForgotPassword