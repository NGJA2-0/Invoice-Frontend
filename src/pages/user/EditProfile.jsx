import { useState } from 'react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import FileUpload from '../../components/forms/FileUpload'
import { useApp } from '../../context/AppContext'

const EditProfile = () => {
  const { user, updateProfile, pushToast } = useApp()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.contactInfo?.phone || '')
  const [email, setEmail] = useState(user?.contactInfo?.email || '')
  const [address, setAddress] = useState(user?.contactInfo?.address || '')
  const [tin, setTin] = useState(user?.tin || '')
  const [vat, setVat] = useState(user?.vat || '')

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">Edit Profile</h3>
        <p className="mt-2 text-sm text-ink-600">
          Update your contact details and uploaded licenses.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card rounded-2xl p-6">
          <div className="grid gap-4">
            <Input
              label="Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            <Input
              label="Contact Number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <Input
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            <Input
              label="TIN"
              value={tin}
              onChange={(event) => setTin(event.target.value)}
            />
            <Input
              label="VAT"
              value={vat}
              onChange={(event) => setVat(event.target.value)}
            />
          </div>
          <Button
            className="mt-6"
            onClick={async () => {
              if (!user?.id) return
              try {
                await updateProfile(user.id, {
                  fullName,
                  tin,
                  vat,
                  contactInfo: { phone, email, address },
                })
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
              }
            }}
          >
            Save Changes
          </Button>
        </div>
        <div className="surface-card rounded-2xl p-6">
          <div className="grid gap-4">
            <FileUpload label="Gem Dealer License" value={user?.licenses?.gemDealer} onChange={() => {}} />
            <FileUpload label="Jewellery License" value={user?.licenses?.jewellery} onChange={() => {}} />
            <FileUpload label="Customs Exporter License" value={user?.licenses?.customs} onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
