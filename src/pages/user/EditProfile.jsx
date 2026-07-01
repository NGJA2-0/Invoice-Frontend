import { useState, useEffect } from 'react'
import { AlertTriangle, ChevronDown, RefreshCw, UserCog } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useApp } from '../../context/AppContext'
import { userService } from '../../services/userService'

const EditProfile = () => {
  const { user, updateProfile, submitEditRequest, submitLicenseRenewal, logout, pushToast } = useApp()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [businessName, setBusinessName] = useState(user?.businessName || '')
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '')
  const [nicOrBrc, setNicOrBrc] = useState(user?.nicOrBrc || '')
  const [mobile1, setMobile1] = useState(user?.mobileNumbers?.[0] || '')
  const [mobile2, setMobile2] = useState(user?.mobileNumbers?.[1] || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSaving, setIsSaving] = useState(false)

  // Regulated fields — require admin approval
  const [tin, setTin] = useState(user?.tin || '')
  const [stockValueId, setStockValueId] = useState(user?.stockValueId || '')
  const [stockValueName, setStockValueName] = useState(user?.stockValueName || '')
  const [gemDealerFileNo, setGemDealerFileNo] = useState(user?.gemDealerFileNo || '')
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // License renewal fields
  const [newLicenseId, setNewLicenseId] = useState('')
  const [submittedExpiryDate, setSubmittedExpiryDate] = useState('')
  const [isSubmittingLicenseRenewal, setIsSubmittingLicenseRenewal] = useState(false)
  const [showLicenseConfirmModal, setShowLicenseConfirmModal] = useState(false)

  // Stock values dropdown
  const [stockValues, setStockValues] = useState([])
  const [isLoadingStockValues, setIsLoadingStockValues] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadStockValues = async () => {
      try {
        const list = await userService.getStockValues()
        if (!cancelled) setStockValues(list)
      } catch (error) {
        if (!cancelled) {
          pushToast({
            title: 'Could not load stock values',
            message: error.message || 'Please refresh and try again.',
            tone: 'danger',
          })
        }
      } finally {
        if (!cancelled) setIsLoadingStockValues(false)
      }
    }
    loadStockValues()
    return () => { cancelled = true }
  }, [])

  const handleStockValueSelect = (event) => {
    const selectedId = event.target.value
    setStockValueId(selectedId)
    const match = stockValues.find((item) => item.id === selectedId)
    setStockValueName(match?.stockValueName || '')
  }

  const buildEditRequestPayload = () => ({
    ...(tin.trim() && { tin: tin.trim() }),
    ...(stockValueId && stockValueName && { stockValueId, stockValueName }),
    ...(gemDealerFileNo.trim() && { gemDealerFileNo: gemDealerFileNo.trim() }),
  })

  const handleRequestChangeClick = () => {
    const payload = buildEditRequestPayload()
    if (Object.keys(payload).length === 0) {
      pushToast({
        title: 'Nothing to submit',
        message: 'Fill in at least one field before submitting.',
        tone: 'warning',
      })
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    const payload = buildEditRequestPayload()
    setIsSubmittingRequest(true)
    try {
      await submitEditRequest(payload)
      pushToast({
        title: 'Request Submitted',
        message: 'Your account is locked until an admin reviews this request.',
        tone: 'success',
      })
      // submitEditRequest() already logs the user out — they'll be redirected
      // to login by the route guard once `role`/`user` clear.
    } catch (error) {
      pushToast({
        title: 'Submission Failed',
        message: error.message || 'Unable to submit edit request.',
        tone: 'danger',
      })
      setShowConfirmModal(false)
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  const handleLicenseRenewalClick = () => {
    if (!newLicenseId.trim() || !submittedExpiryDate) {
      pushToast({
        title: 'Missing information',
        message: 'Please fill in both the new license ID and expiry date.',
        tone: 'warning',
      })
      return
    }
    setShowLicenseConfirmModal(true)
  }

  const handleLicenseConfirmSubmit = async () => {
    setIsSubmittingLicenseRenewal(true)
    try {
      await submitLicenseRenewal({
        newLicenseId: newLicenseId.trim(),
        submittedExpiryDate,
      })
      pushToast({
        title: 'Renewal Submitted',
        message: 'Your account is locked until an admin reviews this request.',
        tone: 'success',
      })
      // Account is locked pending review — log the user out, same as edit requests.
      logout()
    } catch (error) {
      pushToast({
        title: 'Submission Failed',
        message: error.message || 'Unable to submit license renewal request.',
        tone: 'danger',
      })
      setShowLicenseConfirmModal(false)
    } finally {
      setIsSubmittingLicenseRenewal(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    const mobileNumbers = [mobile1, mobile2].filter((num) => num.trim() !== '')

    const payload = {
      ...(fullName.trim() && { fullName: fullName.trim() }),
      ...(businessName.trim() && { businessName: businessName.trim() }),
      ...(businessAddress.trim() && { businessAddress: businessAddress.trim() }),
      ...(nicOrBrc.trim() && { nicOrBrc: nicOrBrc.trim() }),
      ...(mobileNumbers.length > 0 && { mobileNumbers }),
      ...(email.trim() && { email: email.trim() }),
    }

    if (Object.keys(payload).length === 0) {
      pushToast({
        title: 'Nothing to update',
        message: 'Change at least one field before saving.',
        tone: 'warning',
      })
      return
    }

    setIsSaving(true)
    try {
      await updateProfile(user.id, payload)
      pushToast({
        title: 'Profile updated',
        message: 'Your profile changes were saved.',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Update failed',
        message: error.message || 'Unable to update profile.',
        tone: 'danger',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="ep-root">
      <style>{`
        .ep-root {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .ep-header {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          padding: 1.5rem 1.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, #0a1628 0%, #003A6B 60%, #005fa3 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 28px rgba(0, 58, 107, 0.22);
        }
        .ep-header::after {
          content: '';
          position: absolute;
          top: -40%;
          right: -8%;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(255, 222, 26, 0.14) 0%, rgba(255, 222, 26, 0) 70%);
          pointer-events: none;
        }
        .ep-header-icon-badge {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: rgba(255, 222, 26, 0.12);
          border: 1px solid rgba(255, 222, 26, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffde1a;
          position: relative;
          z-index: 1;
        }
        .ep-header-text {
          position: relative;
          z-index: 1;
          min-width: 0;
        }
        .ep-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin: 0;
        }
        .ep-header p {
          margin: 0.35rem 0 0;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.4;
        }

        @media (max-width: 640px) {
          .ep-header {
            padding: 1.15rem 1.25rem;
            gap: 0.8rem;
            border-radius: 0.85rem;
          }
          .ep-header-icon-badge {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }
          .ep-header h3 {
            font-size: 1.05rem;
          }
          .ep-header p {
            font-size: 0.8rem;
          }
        }
        .ep-card {
          border-radius: 1rem;
          padding: 1.25rem 1.5rem 1.5rem;
        }
        .ep-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 1.25rem;
        }
        .ep-grid .ep-full {
          grid-column: 1 / -1;
        }
        .ep-btn-row {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }
        .ep-btn-row .ep-save-btn {
          width: 100%;
        }

        @media (min-width: 640px) {
          .ep-btn-row .ep-save-btn {
            width: auto;
            min-width: 180px;
          }
        }

        @media (max-width: 640px) {
          .ep-grid {
            grid-template-columns: 1fr;
          }
          .ep-header,
          .ep-card {
            padding: 1rem 1.1rem 1.25rem;
            border-radius: 0.85rem;
          }
        }

        /* ── Stock value dropdown ── */
        .ep-select-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ep-select-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #374151;
        }
        .ep-select-wrap {
          position: relative;
        }
        .ep-select {
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
          padding: 0.7rem 2.5rem 0.7rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          background: #eef1f6;
          color: #111827;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
          cursor: pointer;
        }
        .ep-select:focus {
          border-color: #003A6B;
          box-shadow: 0 0 0 3px rgba(0, 58, 107, 0.12);
          background: #ffffff;
        }
        .ep-select:hover:not(:disabled) {
          border-color: #9aa7ba;
        }
        .ep-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ep-select option {
          background: #ffffff;
          color: #111827;
        }
        .ep-select-icon {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #6b7280;
          pointer-events: none;
        }

        /* ── Premium light inputs (applies to shared Input component too) ── */
        .ep-grid input,
        .ep-grid input[type="text"],
        .ep-grid input[type="email"],
        .ep-grid input[type="date"] {
          background: #eef1f6 !important;
          color: #111827 !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 10px !important;
          padding: 0.7rem 1rem !important;
          font-weight: 500 !important;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.05) !important;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s !important;
        }
        .ep-grid input::placeholder {
          color: #9ca3af !important;
          font-weight: 400 !important;
        }
        .ep-grid input:hover:not(:focus):not(:disabled) {
          border-color: #9aa7ba !important;
        }
        .ep-grid input:focus {
          border-color: #003A6B !important;
          box-shadow: 0 0 0 3px rgba(0, 58, 107, 0.12), inset 0 1px 2px rgba(15, 23, 42, 0.05) !important;
          background: #ffffff !important;
        }
        .ep-grid input:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        .ep-grid label,
        .ep-select-label {
          color: #374151 !important;
        }

        /* ── Regulated fields section ── */
        .ep-regulated-header {
          margin-bottom: 1rem;
        }
        .ep-regulated-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        .ep-regulated-header p {
          margin: 0.35rem 0 0;
          font-size: 0.8rem;
          color: #b45309;
          line-height: 1.4;
        }
        .ep-request-btn {
          background: #b45309 !important;
        }
        .ep-request-btn:hover:not(:disabled) {
          background: #92400e !important;
        }

        /* ── License renewal section ── */
        .ep-license-section {
          position: relative;
          border-top: 3px solid #003A6B;
        }
        .ep-license-header-row {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          margin-bottom: 1.1rem;
        }
        .ep-license-icon-badge {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #003A6B 0%, #005fa3 100%);
          color: #ffde1a;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 58, 107, 0.25);
        }
        .ep-license-title-wrap {
          min-width: 0;
        }
        .ep-license-title-line {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .ep-license-title-line h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        .ep-license-pill {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #003A6B;
          background: #e8f1fb;
          border: 1px solid #cfe0f4;
          padding: 2px 9px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .ep-license-title-wrap p {
          margin: 0.35rem 0 0;
          font-size: 0.8rem;
          color: #6b7280;
          line-height: 1.45;
        }
        .ep-license-btn {
          background: #003A6B !important;
          color: #ffde1a !important;
        }
        .ep-license-btn:hover:not(:disabled) {
          background: #004f96 !important;
        }
        .ep-license-btn:disabled {
          background: #9ca3af !important;
          color: #ffffff !important;
        }

        @media (max-width: 640px) {
          .ep-license-section {
            border-top-width: 2.5px;
          }
          .ep-license-header-row {
            gap: 0.65rem;
            margin-bottom: 0.9rem;
          }
          .ep-license-icon-badge {
            width: 34px;
            height: 34px;
            border-radius: 9px;
          }
          .ep-license-title-line {
            gap: 0.4rem;
          }
        }

        /* ── Confirmation modal ── */
        .ep-modal-overlay {
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
        .ep-modal {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
          padding: 1.75rem 1.5rem;
          text-align: center;
        }
        .ep-modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #b45309;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .ep-modal-title {
          margin: 0 0 0.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
        }
        .ep-modal-body {
          margin: 0 0 1.5rem;
          font-size: 0.85rem;
          color: #4b5563;
          line-height: 1.5;
        }
        .ep-modal-actions {
          display: flex;
          gap: 0.75rem;
        }
        .ep-modal-btn {
          flex: 1;
          padding: 0.7rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid transparent;
        }
        .ep-modal-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ep-modal-cancel {
          background: #f3f4f6;
          color: #374151;
          border-color: #e5e7eb;
        }
        .ep-modal-cancel:hover:not(:disabled) {
          background: #e5e7eb;
        }
        .ep-modal-confirm {
          background: #b45309;
          color: #ffffff;
        }
        .ep-modal-confirm:hover:not(:disabled) {
          background: #92400e;
        }

        @media (max-width: 640px) {
          .ep-modal {
            padding: 1.5rem 1.25rem;
            border-radius: 14px;
          }
          .ep-modal-actions {
            flex-direction: column-reverse;
          }
        }
      `}</style>

      <div className="ep-header">
        <div className="ep-header-icon-badge">
          <UserCog style={{ width: 22, height: 22 }} />
        </div>
        <div className="ep-header-text">
          <h3>Edit Profile</h3>
          <p>Update only the fields you want to change — everything else stays as is.</p>
        </div>
      </div>

      <div className="ep-card surface-card">
        <div className="ep-grid">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="e.g. John Perera"
          />
          <Input
            label="NIC / BRC"
            value={nicOrBrc}
            onChange={(event) => setNicOrBrc(event.target.value)}
            placeholder="e.g. 199912345678"
          />
          <Input
            label="Business Name"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="e.g. Perera Gems Pvt Ltd"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="e.g. john.perera@example.com"
          />
          <Input
            className="ep-full"
            label="Business Address"
            value={businessAddress}
            onChange={(event) => setBusinessAddress(event.target.value)}
            placeholder="e.g. No 12, Main Street, Colombo 07"
          />
          <Input
            label="Mobile Number 1"
            value={mobile1}
            onChange={(event) => setMobile1(event.target.value)}
            placeholder="e.g. 0771234567"
          />
          <Input
            label="Mobile Number 2"
            value={mobile2}
            onChange={(event) => setMobile2(event.target.value)}
            placeholder="e.g. 0712345678 (optional)"
          />
        </div>

        <div className="ep-btn-row">
          <Button className="ep-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* ── Regulated fields — admin approval required ── */}
      <div className="ep-card surface-card">
        <div className="ep-regulated-header">
          <h4>Regulated Details</h4>
          <p>
            Changes to these fields require admin approval. Your account will be
            temporarily locked until the request is reviewed.
          </p>
        </div>

        <div className="ep-grid">
          <Input
            label="TIN"
            value={tin}
            onChange={(event) => setTin(event.target.value)}
            placeholder="e.g. TIN123456789"
          />
          <Input
            label="Gem Dealer File No"
            value={gemDealerFileNo}
            onChange={(event) => setGemDealerFileNo(event.target.value)}
            placeholder="e.g. GD/2024/001234"
          />
          <div className="ep-full ep-select-field">
            <label className="ep-select-label">Stock Value</label>
            <div className="ep-select-wrap">
              <select
                className="ep-select"
                value={stockValueId}
                onChange={handleStockValueSelect}
                disabled={isLoadingStockValues}
              >
                <option value="">
                  {isLoadingStockValues ? 'Loading stock values...' : 'Select a stock value'}
                </option>
                {stockValues.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.stockValueId} — {item.stockValueName}
                  </option>
                ))}
              </select>
              <ChevronDown className="ep-select-icon" />
            </div>
          </div>
        </div>

        <div className="ep-btn-row">
          <Button
            className="ep-save-btn ep-request-btn"
            onClick={handleRequestChangeClick}
            disabled={isSubmittingRequest}
          >
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* ── License renewal — admin approval required ── */}
      <div className="ep-card surface-card ep-license-section">
        <div className="ep-license-header-row">
          <div className="ep-license-icon-badge">
            <RefreshCw style={{ width: 18, height: 18 }} />
          </div>
          <div className="ep-license-title-wrap">
            <div className="ep-license-title-line">
              <h4>License Renewal</h4>
              <span className="ep-license-pill">Requires Approval</span>
            </div>
            <p>
              Submitting a renewal will lock your account until an admin approves
              the request — this usually takes 1–2 working days.
            </p>
          </div>
        </div>

        <div className="ep-grid">
          <Input
            label="New License ID"
            value={newLicenseId}
            onChange={(event) => setNewLicenseId(event.target.value)}
            placeholder="e.g. NEW-LIC-2027"
          />
          <Input
            label="New Expiry Date"
            type="date"
            value={submittedExpiryDate}
            onChange={(event) => setSubmittedExpiryDate(event.target.value)}
          />
        </div>

        <div className="ep-btn-row">
          <Button
            className="ep-save-btn ep-license-btn"
            onClick={handleLicenseRenewalClick}
            disabled={isSubmittingLicenseRenewal}
          >
            {isSubmittingLicenseRenewal ? 'Submitting...' : 'Submit Renewal Request'}
          </Button>
        </div>
      </div>

      {/* ── Confirmation modal ── */}
      {showConfirmModal && (
        <div className="ep-modal-overlay">
          <div className="ep-modal">
            <div className="ep-modal-icon">
              <AlertTriangle style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <h3 className="ep-modal-title">Are you sure?</h3>
            <p className="ep-modal-body">
              After this you cannot access the account until an admin approves your
              request. This may take 1–2 working days.
            </p>
            <div className="ep-modal-actions">
              <button
                type="button"
                className="ep-modal-btn ep-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmittingRequest}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ep-modal-btn ep-modal-confirm"
                onClick={handleConfirmSubmit}
                disabled={isSubmittingRequest}
              >
                {isSubmittingRequest ? 'Submitting...' : 'OK, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── License renewal confirmation modal ── */}
      {showLicenseConfirmModal && (
        <div className="ep-modal-overlay">
          <div className="ep-modal">
            <div className="ep-modal-icon">
              <AlertTriangle style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <h3 className="ep-modal-title">Are you sure?</h3>
            <p className="ep-modal-body">
              After submitting this, your account will be disabled till the admin
              approval of your request. This will take 1 to 2 working days. Thank
              you for your patience.
            </p>
            <div className="ep-modal-actions">
              <button
                type="button"
                className="ep-modal-btn ep-modal-cancel"
                onClick={() => setShowLicenseConfirmModal(false)}
                disabled={isSubmittingLicenseRenewal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ep-modal-btn ep-modal-confirm"
                onClick={handleLicenseConfirmSubmit}
                disabled={isSubmittingLicenseRenewal}
              >
                {isSubmittingLicenseRenewal ? 'Submitting...' : 'OK, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditProfile