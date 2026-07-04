import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitCompare, ChevronRight, Inbox } from 'lucide-react'
import { userService } from '../../services/userService'
import { useApp } from '../../context/AppContext'
import InvoiceDetailHeader from '../../components/invoices/InvoiceDetailHeader'

const GOLD = '#9a7b3c'
const LIGHT_GOLD = '#c9a96e'

const InvoiceEditRequests = () => {
  const { user } = useApp()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    userService
      .getInvoices(user.id, { page: 1, pageSize: 50 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.invoices || res?.data || []
        setInvoices(list)
      })
      .catch((err) => setError(err?.message || 'Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <InvoiceDetailHeader title="Back to Dashboard" onBack={() => navigate('/user/dashboard')} />

      <style>{`
        .ier-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: rgba(255,255,255,0.85);
          border: 1px solid #e8dfc8;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: box-shadow .15s ease, transform .15s ease, border-color .15s ease;
        }
        .ier-card:hover {
          box-shadow: 0 6px 18px -8px rgba(154,123,60,0.35);
          border-color: ${LIGHT_GOLD};
          transform: translateY(-1px);
        }
        .ier-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD});
          display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .ier-title { font-size: 14px; font-weight: 700; color: #1a1a1a; }
        .ier-sub { font-size: 12px; color: #888; margin-top: 2px; }
        @media (max-width: 480px) {
          .ier-title { font-size: 13px; }
          .ier-card { padding: 12px; }
        }
      `}</style>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
        Invoice Edit Requests
      </h2>
      <p style={{ fontSize: 12.5, color: '#888', marginBottom: 16 }}>
        Select an invoice to view any proposed edits submitted by an officer.
      </p>

      {loading && <div style={{ fontSize: 13, color: '#888' }}>Loading invoices…</div>}
      {error && <div style={{ fontSize: 13, color: '#b91c1c' }}>{error}</div>}

      {!loading && !error && invoices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
          <Inbox size={28} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 13 }}>No invoices found.</div>
        </div>
      )}

      {!loading && !error && invoices.map((inv) => {
        const id = inv.invoiceId || inv.id
        return (
          <div
            key={id}
            className="ier-card"
            onClick={() => navigate(`/user/invoice-edit-requests/${id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div className="ier-icon"><GitCompare size={17} /></div>
              <div style={{ minWidth: 0 }}>
                <div className="ier-title">Invoice #{inv.invoiceNumber || 'N/A'}</div>
                <div className="ier-sub">{inv.invoiceDate || 'N/A'} · {inv.receiverName || 'N/A'}</div>
              </div>
            </div>
            <ChevronRight size={18} color="#c9a96e" />
          </div>
        )
      })}
    </div>
  )
}

export default InvoiceEditRequests