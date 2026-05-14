import Badge from '../../components/common/Badge'
import { useApp } from '../../context/AppContext'
import { formatUserStatus } from '../../utils/status'

const RejectedDealers = () => {
  const { users } = useApp()
  const rejected = users.filter((item) => item.status === 'rejected')

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">Rejected Dealers</h3>
        <p className="mt-2 text-sm text-ink-600">
          Dealers requiring follow up or corrections.
        </p>
      </div>
      <div className="grid gap-4">
        {rejected.map((item) => (
          <div key={item.id} className="surface-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {item.fullName}
                </p>
                <p className="text-xs text-ink-500">NIC {item.nic}</p>
              </div>
              <Badge tone="danger">{formatUserStatus(item.status)}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RejectedDealers
