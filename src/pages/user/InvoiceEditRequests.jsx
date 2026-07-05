import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitCompare, ChevronRight, ChevronLeft, Inbox } from 'lucide-react'
import { userService } from '../../services/userService'
import { useApp } from '../../context/AppContext'
import InvoiceDetailHeader from '../../components/invoices/InvoiceDetailHeader'

const PAGE_SIZE_OPTIONS = [10, 15, 20]

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    userService
      .getActionableInvoices(user.id, { page, pageSize })
      .then((res) => {
        const payload = res?.data || res || {}
        const list = payload?.invoices || []
        setInvoices(list)
        setTotalPages(payload?.totalPages || 1)
        setTotal(payload?.total || list.length)
      })
      .catch((err) => setError(err?.message || 'Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [user?.id, page, pageSize])

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setPage(1) // reset to first page whenever page size changes
  }

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

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

        .ier-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .ier-toolbar-count {
          font-size: 12px;
          color: #8a8a8a;
        }
        .ier-pagesize-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ier-pagesize-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .ier-pagesize-select {
          appearance: none;
          -webkit-appearance: none;
          background: #ffffff;
          border: 1.5px solid ${RULE};
          border-radius: 8px;
          padding: 6px 28px 6px 12px;
          font-size: 12.5px;
          font-weight: 700;
          color: #1a1a1a;
          cursor: pointer;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239a7b3c' stroke-width='2.5'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 13px;
          transition: border-color 0.15s ease;
        }
        .ier-pagesize-select:hover,
        .ier-pagesize-select:focus {
          border-color: ${LIGHT_GOLD};
          outline: none;
        }

        .ier-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid ${RULE};
        }
        .ier-page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1.5px solid ${RULE};
          background: #ffffff;
          color: #1a1a1a;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
          flex-shrink: 0;
        }
        .ier-page-btn:hover:not(:disabled) {
          border-color: ${LIGHT_GOLD};
          box-shadow: 0 4px 10px -4px rgba(154,123,60,0.35);
        }
        .ier-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .ier-page-indicator {
          font-size: 12.5px;
          font-weight: 700;
          color: #374151;
          white-space: nowrap;
        }
        .ier-page-indicator span {
          color: ${GOLD};
        }

        @media (max-width: 640px) {
          .ier-panel { border-radius: 14px; padding: 18px 16px 20px; }
        }
        @media (max-width: 480px) {
          .ier-heading { font-size: 16px; }
          .ier-title { font-size: 13px; }
          .ier-card { padding: 12px; }

          .ier-toolbar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .ier-toolbar-count { font-size: 11.5px; }
          .ier-pagesize-wrap {
            justify-content: flex-end;
            gap: 6px;
          }
          .ier-pagesize-label { font-size: 10.5px; }
          .ier-pagesize-select {
            padding: 5px 22px 5px 10px;
            font-size: 11.5px;
            border-radius: 999px;
            background-size: 11px;
            background-position: right 7px center;
          }

          .ier-pagination {
            gap: 6px;
            margin-top: 14px;
            padding-top: 12px;
          }
          .ier-page-btn {
            width: 28px;
            height: 28px;
            border-radius: 999px;
          }
          .ier-page-indicator {
            font-size: 11px;
          }
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

        {!loading && !error && total > 0 && (
          <div className="ier-toolbar">
            <span className="ier-toolbar-count">{total} pending request{total === 1 ? '' : 's'}</span>
            <div className="ier-pagesize-wrap">
              <span className="ier-pagesize-label">Show</span>
              <select
                className="ier-pagesize-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        )}

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

        {!loading && !error && invoices.length > 0 && totalPages > 1 && (
          <div className="ier-pagination">
            <button
              className="ier-page-btn"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="ier-page-indicator">
              Page <span>{page}</span> of {totalPages}
            </span>
            <button
              className="ier-page-btn"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceEditRequests