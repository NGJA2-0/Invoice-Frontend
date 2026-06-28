import { useEffect, useState } from 'react'
import Skeleton from '../../components/common/Skeleton'
import InvoiceTable from '../../components/tables/InvoiceTable'
import { useApp } from '../../context/AppContext'

const MyInvoices = () => {
  const { invoices, invoicePagination, invoiceFilters, refreshInvoices, user } = useApp()
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState(undefined)
  const [sort, setSort] = useState('date_desc')

  useEffect(() => {
    let active = true
    const load = async () => {
      if (user?.id) {
        await refreshInvoices(user.id, { page, pageSize, status, sort })
      }
      if (active) {
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user?.id, page, pageSize, status, sort, refreshInvoices])

  const handleStatusChange = (nextStatus) => {
    setStatus(nextStatus)
    setPage(1)
  }

  const handleSortChange = (nextSort) => {
    setSort(nextSort)
    setPage(1)
  }

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize)
    setPage(1)
  }

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
        <InvoiceTable
          rows={invoices}
          pagination={invoicePagination}
          status={status}
          sort={sort}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}

export default MyInvoices
