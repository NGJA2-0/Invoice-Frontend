import Button from '../common/Button'
import Badge from '../common/Badge'
import { formatUserStatus } from '../../utils/status'

const statusTone = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const RegistrationCard = ({ data, onView, onApprove, onReject }) => {
  return (
    <div className="glass-card flex flex-col gap-4 rounded-2xl border px-6 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{data.dealerName}</h3>
          <p className="text-sm text-ink-600">NIC {data.nic}</p>
          <p className="text-xs text-ink-500">Submitted {data.submittedDate}</p>
        </div>
        <Badge tone={statusTone[data.status] || 'info'}>
          {formatUserStatus(data.status)}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onView}>
          View Documents
        </Button>
        <Button onClick={onApprove}>Approve</Button>
        <Button variant="ghost" onClick={onReject}>
          Reject
        </Button>
      </div>
    </div>
  )
}

export default RegistrationCard
