import { useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { formatUserStatus } from '../../utils/status'

const Users = () => {
  const { users, refreshAdminData } = useApp()

  useEffect(() => {
    refreshAdminData()
  }, [refreshAdminData])

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">Users</h3>
        <p className="mt-2 text-sm text-ink-600">
          Manage NGJA export system users.
        </p>
      </div>
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="surface-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {user.fullName}
                </p>
                <p className="text-xs text-ink-500">{user.role}</p>
              </div>
              <span className="badge bg-cloud-100 text-ink-700">
                {formatUserStatus(user.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Users
