import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatInvoiceStatus } from '../../utils/status'

const statusTone = {
  draft: 'warning',
  submitted: 'info',
  approved: 'success',
}

const InvoiceTable = ({ rows }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-cloud-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-cloud-50 text-xs uppercase tracking-[0.16em] text-ink-500">
          <tr>
            <th className="px-5 py-3">Invoice Number</th>
            <th className="px-5 py-3">Buyer</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Template</th>
            <th className="px-5 py-3">Total USD</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cloud-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-cloud-50/60">
              <td className="px-5 py-4 font-semibold text-ink-800">{row.id}</td>
              <td className="px-5 py-4 text-ink-700">{row.buyer}</td>
              <td className="px-5 py-4 text-ink-600">{row.date}</td>
              <td className="px-5 py-4">
                <Badge tone={statusTone[row.status] || 'neutral'}>
                  {formatInvoiceStatus(row.status)}
                </Badge>
              </td>
              <td className="px-5 py-4 text-ink-600">{row.template}</td>
              <td className="px-5 py-4 font-semibold text-ink-800">
                ${row.totalUsd.toLocaleString()}
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost">View</Button>
                  <Button variant="ghost">Edit</Button>
                  <Button variant="ghost">Download PDF</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InvoiceTable
