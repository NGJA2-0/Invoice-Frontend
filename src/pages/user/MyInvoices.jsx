import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Skeleton from '../../components/common/Skeleton'
import InvoiceTable from '../../components/tables/InvoiceTable'
import Button from '../../components/common/Button'
import { useApp } from '../../context/AppContext'

const MyInvoices = () => {
  const { invoices, invoicePagination, invoiceFilters, refreshInvoices, user } = useApp()
  const navigate = useNavigate()
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
      <div className="glass-card flex flex-col gap-4 rounded-2xl border px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-ink-900">My Invoices</h3>
          <p className="mt-2 text-sm text-ink-600">
            Review your invoice history and access export documentation.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/user/favourite-invoices')}
          className="!flex !w-fit !items-center !gap-2 !rounded-xl !border !border-cloud-200 !bg-white !px-4 !py-2.5 !text-sm !font-medium !text-ink-700 !shadow-sm transition-all duration-150 hover:!border-[#d9c89a] hover:!bg-cloud-50"
        >
          <Heart size={16} className="text-[#b8922a]" />
          Favourites
        </Button>
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
