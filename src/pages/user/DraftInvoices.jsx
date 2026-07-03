import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Inbox } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { invoiceService } from '../../services/invoiceService'

const PAGE_SIZE_OPTIONS = [10, 15, 20]

const formatCurrency = (value) => {
  const num = Number(value)
  if (Number.isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const DraftInvoices = () => {
  const { user, pushToast } = useApp()
  const navigate = useNavigate()

  const [drafts, setDrafts] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [submittingId, setSubmittingId] = useState(null)

  const loadDrafts = async (page = 1, size = pageSize) => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await invoiceService.getDraftInvoices(user.id, { page, pageSize: size })
      setDrafts(res?.data || [])
      setPagination({
        currentPage: res?.pagination?.currentPage || 1,
        pageSize: res?.pagination?.pageSize || size,
        totalRecords: res?.pagination?.totalRecords || 0,
        totalPages: res?.pagination?.totalPages || 1,
        hasNextPage: res?.pagination?.hasNextPage || false,
        hasPreviousPage: res?.pagination?.hasPreviousPage || false,
      })
    } catch (error) {
      pushToast({
        title: 'Unable to load drafts',
        message: error.message || 'Please try again.',
        tone: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrafts(1, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value)
    setPageSize(size)
    loadDrafts(1, size)
  }

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return
    loadDrafts(page, pageSize)
  }

  const handleSubmitInvoice = async (e, invoiceId) => {
    e.stopPropagation()
    if (!user?.id || submittingId) return
    setSubmittingId(invoiceId)
    try {
      await invoiceService.submitInvoice(invoiceId, user.id)
      pushToast({
        title: 'Invoice submitted',
        message: 'Invoice submitted successfully.',
        tone: 'success',
      })
      loadDrafts(pagination.currentPage, pageSize)
    } catch (error) {
      pushToast({
        title: 'Submit failed',
        message: error.message || 'Unable to submit invoice.',
        tone: 'danger',
      })
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <>
      <style>{`
        .di-page {
          display: flex;
          flex-direction: column;
          gap: 0;
          min-height: 100vh;
          padding: 2rem 2.5rem;
        }
        @media (max-width: 640px) {
          .di-page {
            padding: 0.75rem;
            padding-top: 0.5rem;
            min-height: unset;
          }
        }

        .di-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.75rem 2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          margin-bottom: 1.5rem;
        }
        @media (max-width: 640px) {
          .di-hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1.25rem 1rem;
          }
        }
        .di-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #b8922a;
          margin-bottom: 0.55rem;
        }
        .di-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #b8922a;
          display: inline-block;
        }
        .di-title {
          font-size: 2rem;
          font-weight: 600;
          color: #0f0f0f;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0;
        }
        @media (max-width: 640px) {
          .di-title { font-size: 1.5rem; }
        }
        .di-subtitle {
          margin-top: 0.4rem;
          font-size: 0.875rem;
          color: #7a7a7a;
          font-weight: 400;
        }

        .di-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 1.1rem;
          height: 38px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.18s ease;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .di-btn-ghost {
          background: #f7f7f7;
          color: #333;
          border: 1px solid #e8e8e8;
        }
        .di-btn-ghost:hover {
          background: #efefef;
          border-color: #d0d0d0;
        }
        .di-btn svg {
          width: 15px;
          height: 15px;
          stroke-width: 1.8px;
          flex-shrink: 0;
        }

        .di-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .di-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
          flex-wrap: wrap;
        }
        .di-card-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #888;
        }
        .di-page-size {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 12px;
          color: #7a7a7a;
        }
        .di-page-size select {
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          padding: 0.35rem 0.6rem;
          font-size: 12px;
          color: #1a1a1a;
          background: #fff;
          cursor: pointer;
        }

        /* ── Table (desktop) ── */
        .di-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 13px;
        }
        .di-table th {
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b0b0b0;
          padding: 0.9rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          background: #fcfcfc;
        }
        .di-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f4f4f4;
          color: #2c2c2c;
          vertical-align: middle;
        }
        .di-table tbody tr {
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .di-table tbody tr:hover {
          background: #faf8f4;
        }
        .di-table tbody tr:last-child td {
          border-bottom: none;
        }
        .di-invoice-number {
          font-weight: 600;
          color: #1a1a1a;
        }
        .di-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: #fff3d6;
          color: #b8922a;
        }
        .di-amount {
          font-weight: 600;
          color: #1a1a1a;
        }
        .di-submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 0.85rem;
          height: 30px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #b8922a;
          background: #fff;
          color: #b8922a;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .di-submit-btn:hover:not(:disabled) {
          background: #b8922a;
          color: #fff;
        }
        .di-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 640px) {
          .di-submit-btn {
            width: 100%;
            height: 34px;
            margin-top: 0.35rem;
          }
        }

        /* ── Cards (mobile) ── */
        .di-cards {
          display: none;
        }
        .di-mobile-card {
          padding: 1rem 1.1rem;
          border-bottom: 1px solid #f4f4f4;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
        }
        .di-mobile-card:last-child {
          border-bottom: none;
        }
        .di-mobile-card:active {
          background: #faf8f4;
        }
        .di-mobile-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .di-mobile-field {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #7a7a7a;
        }
        .di-mobile-field span:last-child {
          color: #2c2c2c;
          font-weight: 500;
          text-align: right;
        }

        @media (max-width: 640px) {
          .di-table { display: none; }
          .di-cards { display: block; }
        }

        /* ── Empty / loading ── */
        .di-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 4rem 2rem;
          text-align: center;
        }
        .di-empty-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f3ede0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b8922a;
        }
        .di-empty-text {
          font-size: 13px;
          color: #aaa;
          max-width: 260px;
          line-height: 1.6;
        }
        .di-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 3rem 2rem;
        }
        .di-loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #b8922a;
          animation: di-pulse 1.2s ease-in-out infinite;
        }
        .di-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .di-loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes di-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        /* ── Pagination ── */
        .di-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #f0f0f0;
          flex-wrap: wrap;
        }
        .di-pagination-info {
          font-size: 12px;
          color: #8a8a8a;
        }
        .di-pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .di-page-btn {
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          border: 1px solid #e4e4e4;
          background: #fff;
          font-size: 12px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
        }
        .di-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .di-page-btn:not(:disabled):hover {
          background: #faf8f4;
          border-color: #e0d3ae;
        }
      `}</style>

      <div className="di-page">
        {/* ── Hero ── */}
        <div className="di-hero">
          <div>
            <div className="di-eyebrow">
              <span className="di-eyebrow-dot" />
              NGJA Invoice Engine
            </div>
            <h1 className="di-title">Draft Invoices</h1>
            <p className="di-subtitle">Invoices you've saved but not yet submitted</p>
          </div>
          <button
            type="button"
            className="di-btn di-btn-ghost"
            onClick={() => navigate('/user/create-invoice')}
          >
            <ArrowLeft />
            Back to Create Invoice
          </button>
        </div>

        {/* ── Content card ── */}
        <div className="di-card">
          <div className="di-card-header">
            <span className="di-card-title">
              {pagination.totalRecords} Draft{pagination.totalRecords === 1 ? '' : 's'}
            </span>
            <div className="di-page-size">
              <span>Rows per page</span>
              <select value={pageSize} onChange={handlePageSizeChange}>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="di-loading">
              <div className="di-loading-dot" />
              <div className="di-loading-dot" />
              <div className="di-loading-dot" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="di-empty">
              <div className="di-empty-icon">
                <Inbox size={20} />
              </div>
              <p className="di-empty-text">
                You don't have any draft invoices yet. Save an invoice as a draft to see it here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="di-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Date</th>
                    <th>Export Type</th>
                    <th>Receiver</th>
                    <th>CIF (LKR)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((invoice) => (
                    <tr
                      key={invoice.invoiceId}
                      onClick={() => navigate(`/user/invoices/${invoice.invoiceId}`, { state: { from: 'drafts' } })}
                    >
                      <td className="di-invoice-number">{invoice.invoiceNumber}</td>
                      <td>{invoice.invoiceDate}</td>
                      <td>{invoice.exportType}</td>
                      <td>{invoice.receiverName}</td>
                      <td className="di-amount">{formatCurrency(invoice.cifLkr)}</td>
                      <td>
                        <span className="di-status-pill">{invoice.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="di-submit-btn"
                          disabled={submittingId === invoice.invoiceId}
                          onClick={(e) => handleSubmitInvoice(e, invoice.invoiceId)}
                        >
                          {submittingId === invoice.invoiceId ? 'Submitting…' : 'Submit'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="di-cards">
                {drafts.map((invoice) => (
                  <div
                    key={invoice.invoiceId}
                    className="di-mobile-card"
                    onClick={() => navigate(`/user/invoices/${invoice.invoiceId}`, { state: { from: 'drafts' } })}
                  >
                    <div className="di-mobile-row-top">
                      <span className="di-invoice-number">
                        <FileText size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                        {invoice.invoiceNumber}
                      </span>
                      <span className="di-status-pill">{invoice.status}</span>
                    </div>
                    <div className="di-mobile-field">
                      <span>Date</span>
                      <span>{invoice.invoiceDate}</span>
                    </div>
                    <div className="di-mobile-field">
                      <span>Export Type</span>
                      <span>{invoice.exportType}</span>
                    </div>
                    <div className="di-mobile-field">
                      <span>Receiver</span>
                      <span>{invoice.receiverName}</span>
                    </div>
                    <div className="di-mobile-field">
                      <span>CIF (LKR)</span>
                      <span>{formatCurrency(invoice.cifLkr)}</span>
                    </div>
                    <button
                      type="button"
                      className="di-submit-btn"
                      disabled={submittingId === invoice.invoiceId}
                      onClick={(e) => handleSubmitInvoice(e, invoice.invoiceId)}
                    >
                      {submittingId === invoice.invoiceId ? 'Submitting…' : 'Submit Invoice'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="di-pagination">
                <span className="di-pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalRecords} total
                </span>
                <div className="di-pagination-controls">
                  <button
                    type="button"
                    className="di-page-btn"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => goToPage(pagination.currentPage - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="di-page-btn"
                    disabled={!pagination.hasNextPage}
                    onClick={() => goToPage(pagination.currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default DraftInvoices