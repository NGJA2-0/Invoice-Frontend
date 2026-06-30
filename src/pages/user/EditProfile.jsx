import { useState } from 'react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useApp } from '../../context/AppContext'

const EditProfile = () => {
  const { user, updateProfile, pushToast } = useApp()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [businessName, setBusinessName] = useState(user?.businessName || '')
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '')
  const [nicOrBrc, setNicOrBrc] = useState(user?.nicOrBrc || '')
  const [mobile1, setMobile1] = useState(user?.mobileNumbers?.[0] || '')
  const [mobile2, setMobile2] = useState(user?.mobileNumbers?.[1] || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSaving, setIsSaving] = useState(false)

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
          border-radius: 1rem;
          padding: 1.25rem 1.5rem;
        }
        .ep-header h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .ep-header p {
          margin: 0.4rem 0 0;
          font-size: 0.85rem;
          color: #6b7280;
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
      `}</style>

      <div className="ep-header glass-card border">
        <h3>Edit Profile</h3>
        <p>Update only the fields you want to change — everything else stays as is.</p>
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
    </div>
  )
}

export default EditProfile