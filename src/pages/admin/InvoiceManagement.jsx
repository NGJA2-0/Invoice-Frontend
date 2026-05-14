import InvoiceTable from '../../components/tables/InvoiceTable'
import { useApp } from '../../context/AppContext'

const InvoiceManagement = () => {
  const { invoices } = useApp()

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">Invoice Management</h3>
        <p className="mt-2 text-sm text-ink-600">
          Monitor export invoices submitted by dealers.
        </p>
      </div>
      <InvoiceTable rows={invoices} />
    </div>
  )
}

export default InvoiceManagement
