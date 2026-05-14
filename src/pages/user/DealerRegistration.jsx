import { useMemo, useState } from 'react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import FileUpload from '../../components/forms/FileUpload'
import { useApp } from '../../context/AppContext'
import { formatUserStatus } from '../../utils/status'

const statusTone = {
  not_verified: 'warning',
  pending: 'info',
  approved: 'success',
  rejected: 'danger',
}

const DealerRegistration = () => {
  const { userStatus, submitRegistration, pushToast, user } = useApp()
  const [gemDealer, setGemDealer] = useState(null)
  const [jewellery, setJewellery] = useState(null)
  const [customs, setCustoms] = useState(null)
  const [tin, setTin] = useState('')
  const [vat, setVat] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = useMemo(
    () => gemDealer && jewellery && customs && tin && vat,
    [gemDealer, jewellery, customs, tin, vat],
  )

  const handleSubmit = async () => {
    if (!user?.id) {
      pushToast({
        title: 'Missing user profile',
        message: 'Please login again to submit documents.',
        tone: 'danger',
      })
      return
    }

    try {
      await submitRegistration({
        userId: user.id,
        tin,
        vat,
        documents: { gemDealer, jewellery, customs },
      })
      setSubmitted(true)
      pushToast({
        title: 'Documents submitted successfully',
        message: 'Verification may take up to 1 working day.',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Submission failed',
        message: error.message || 'Unable to submit documents.',
        tone: 'danger',
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-6 py-6">
        <div>
          <h3 className="text-xl font-semibold text-ink-900">Dealer Registration</h3>
          <p className="mt-2 text-sm text-ink-600">
            Upload documentation to unlock invoice creation.
          </p>
        </div>
        <Badge tone={statusTone[userStatus]}>
          {formatUserStatus(userStatus)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card rounded-2xl p-6">
          <div className="grid gap-4">
            <FileUpload label="Gem Dealer License" value={gemDealer} onChange={setGemDealer} />
            <FileUpload label="Jewellery License" value={jewellery} onChange={setJewellery} />
            <Input label="TIN Number" value={tin} onChange={(event) => setTin(event.target.value)} />
            <Input label="VAT Number" value={vat} onChange={(event) => setVat(event.target.value)} />
            <FileUpload label="Customs Exporter License" value={customs} onChange={setCustoms} />
          </div>
        </div>
        <div className="surface-card rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-ink-900">
            3 Ways to Obtain This License
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-ink-600">
            <li>Using the Customs Online Portal</li>
            <li>By contacting an NGJA Wharf Clerk</li>
            <li>Visiting Customs physically</li>
          </ul>
          <Button
            className="mt-6 w-full"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Submit for Verification
          </Button>
          {submitted ? (
            <p className="mt-4 text-xs text-emerald-600">
              Documents submitted successfully. Verification may take up to 1 working day.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default DealerRegistration
