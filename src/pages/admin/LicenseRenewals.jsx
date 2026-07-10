import { useEffect, useState } from 'react'
import { FileCheck2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { licenseRenewalApi } from '../../services/licenseRenewalApi'

export default function LicenseRenewals() {
  const [renewals, setRenewals] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionTarget, setActionTarget] = useState(null) // { item, type: 'approve'|'reject' }
  const [processing, setProcessing] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await licenseRenewalApi.getPending()
      // api.get auto-unwraps payload.data — res is already the renewals array (or the raw payload)
      setRenewals(Array.isArray(res) ? res : (res?.data ?? []))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleAction = async () => {
    if (!actionTarget) return
    setProcessing(true)
    try {
      if (actionTarget.type === 'approve') {
        await licenseRenewalApi.approve(actionTarget.item.id)
      } else {
        await licenseRenewalApi.reject(actionTarget.item.id)
      }
      setActionTarget(null)
      fetchAll()
    } finally {
      setProcessing(false)
    }
  }

  const fmt = (d) => new Date(d).toLocaleDateString()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 shadow-soft">
            <FileCheck2 className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">License Renewals</h2>
            <p className="text-xs text-gray-500">{renewals.length} pending request{renewals.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/60 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-white"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/30 backdrop-blur-sm shadow-soft">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
        ) : renewals.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No pending renewal requests.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left">
                <th className="px-6 py-3 font-semibold text-gray-600">#</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Business</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Username</th>
                <th className="px-6 py-3 font-semibold text-gray-600">TIN</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Current Expiry</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Requested Expiry</th>
                <th className="px-6 py-3 font-semibold text-gray-600">New License ID</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Submitted</th>
                <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {renewals.map((item, idx) => (
                <tr key={item.id} className="border-b border-white/20 hover:bg-white/20 transition">
                  <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{item.businessName}</td>
                  <td className="px-6 py-3 text-gray-500">{item.username}</td>
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">{item.tin}</td>
                  <td className="px-6 py-3 text-gray-500">{fmt(item.currentExpiryDate)}</td>
                  <td className="px-6 py-3 text-gray-900 font-medium">{fmt(item.submittedExpiryDate)}</td>
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">{item.newLicenseId}</td>
                  <td className="px-6 py-3 text-gray-500">{fmt(item.createdAt)}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActionTarget({ item, type: 'approve' })}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setActionTarget({ item, type: 'reject' })}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <div className={`mb-3 flex items-center gap-3 ${actionTarget.type === 'approve' ? 'text-green-600' : 'text-red-500'}`}>
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">
                {actionTarget.type === 'approve' ? 'Approve' : 'Reject'} Renewal Request
              </h3>
            </div>
            <p className="text-sm text-gray-700">
              Are you sure you want to{' '}
              <span className="font-semibold">{actionTarget.type}</span> the renewal request for{' '}
              <span className="font-semibold">"{actionTarget.item.businessName}"</span>?
            </p>
            <p className="mt-1 text-xs text-gray-500">
              New expiry: <span className="font-medium">{fmt(actionTarget.item.submittedExpiryDate)}</span>
              {' · '}License ID: <span className="font-mono">{actionTarget.item.newLicenseId}</span>
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setActionTarget(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition ${
                  actionTarget.type === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing
                  ? (actionTarget.type === 'approve' ? 'Approving…' : 'Rejecting…')
                  : (actionTarget.type === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}