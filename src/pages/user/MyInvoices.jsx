import { useEffect, useState } from 'react'
import Skeleton from '../../components/common/Skeleton'
import InvoiceTable from '../../components/tables/InvoiceTable'
import { useApp } from '../../context/AppContext'

const MyInvoices = () => {
  const { invoices, refreshInvoices, user } = useApp()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (user?.id) {
        await refreshInvoices(user.id)
      }
      if (active) {
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user?.id, refreshInvoices])

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">My Invoices</h3>
        <p className="mt-2 text-sm text-ink-600">
          Review your invoice history and access export documentation.
        </p>
      </div>
      {loading ? (
        <div className="surface-card flex flex-col gap-3 rounded-2xl p-6">
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
        </div>
      ) : (
        <InvoiceTable rows={invoices} />
      )}
    </div>
  )
}

export default MyInvoices
