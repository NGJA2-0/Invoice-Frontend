import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitCompare, ChevronRight, Inbox } from 'lucide-react'
import { userService } from '../../services/userService'
import { useApp } from '../../context/AppContext'
import InvoiceDetailHeader from '../../components/invoices/InvoiceDetailHeader'

const GOLD = '#9a7b3c'
const LIGHT_GOLD = '#c9a96e'
const RULE = '#e8dfc8'
const BG = '#fffdf8'

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
      .getActionableInvoices(user.id, { page: 1, pageSize: 50 })
      .then((res) => {
        const list = res?.data?.invoices || res?.invoices || []
        setInvoices(list)
      })
      .catch((err) => setError(err?.message || 'Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <InvoiceDetailHeader title="Back to Dashboard" onBack={() => navigate('/user/dashboard')} />

      <style>{`
        .ier-panel {
          position: relative;
          background: ${BG};
          border: 1px solid ${RULE};
          border-radius: 18px;
          padding: 22px 24px 24px;
          box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -16px rgba(154,123,60,0.25);
          overflow: hidden;
        }
        .ier-panel-head {
          border-bottom: 1px solid ${RULE};
          padding-bottom: 14px;
          margin-bottom: 18px;
        }
        .ier-eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 6px;
        }
        .ier-heading {
          font-size: 18px;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: -0.01em;
          margin: 0 0 4px;
        }
        .ier-subheading {
          font-size: 12.5px;
          color: #8a8a8a;
          margin: 0;
          line-height: 1.5;
        }
        .ier-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #ffffff;
          border: 1px solid ${RULE};
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: box-shadow .15s ease, transform .15s ease, border-color .15s ease;
        }
        .ier-card:last-child { margin-bottom: 0; }
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
        .ier-status-line { font-size: 13px; color: #888; padding: 6px 0; }
        .ier-status-line.error { color: #b91c1c; }
        @media (max-width: 640px) {
          .ier-panel { border-radius: 14px; padding: 18px 16px 20px; }
        }
        @media (max-width: 480px) {
          .ier-heading { font-size: 16px; }
          .ier-title { font-size: 13px; }
          .ier-card { padding: 12px; }
        }
      `}</style>

      <div className="ier-panel">
        <div className="ier-panel-head">
          <div className="ier-eyebrow">Officer Review</div>
          <h2 className="ier-heading">Invoice Edit Requests</h2>
          <p className="ier-subheading">
            Select an invoice to view any proposed edits submitted by an officer.
          </p>
        </div>

        {loading && <div className="ier-status-line">Loading invoices…</div>}
        {error && <div className="ier-status-line error">{error}</div>}

        {!loading && !error && invoices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            <Inbox size={28} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13 }}>No pending edit requests found.</div>
          </div>
        )}

        {!loading && !error && invoices.map((inv) => {
          const id = inv.originalInvoiceId || inv.invoiceId || inv.id
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
                  <div className="ier-sub">
                    Stage {inv.stage || '—'} · Pending your review
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="#c9a96e" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InvoiceEditRequests