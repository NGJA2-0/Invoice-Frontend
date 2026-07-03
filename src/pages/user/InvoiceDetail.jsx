import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { userService } from '../../services/userService'
import { useApp } from '../../context/AppContext'
import { buildInvoicePreviewData } from '../../utils/buildInvoicePreviewData'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import InvoiceDetailHeader from '../../components/invoices/InvoiceDetailHeader'
import InvoiceDetailStates from '../../components/invoices/InvoiceDetailStates'

const InvoiceDetail = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const cameFromFavourites = location.state?.from === 'favourites'
  const { user } = useApp()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!invoiceId || !user?.id) return
    setLoading(true)
    setError(null)
    userService
      .getInvoiceById(invoiceId, user.id)
      .then((res) => setInvoice(res))
      .catch((err) => setError(err?.message || 'Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [invoiceId, user?.id])

  const preview = useMemo(() => buildInvoicePreviewData(invoice), [invoice])

  return (
    <div>
      <InvoiceDetailHeader
        title={cameFromFavourites ? 'Back to Favourite Invoices' : 'Back to My Invoices'}
        onBack={() => navigate(cameFromFavourites ? '/user/favourite-invoices' : '/user/my-invoices')}
      />

      <InvoiceDetailStates loading={loading} error={error} hasPreview={Boolean(preview)} />

      {!loading && !error && preview && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <InvoicePreview preview={preview} />
        </div>
      )}
    </div>
  )
}

export default InvoiceDetail