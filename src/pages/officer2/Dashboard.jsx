import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const STATUS_STYLES = {
  stage2_in_progress: { bg: '#e6f0ff', color: '#1d4ed8', label: 'Stage 2 - In Progress' },
  stage2_pending_user_approval: { bg: '#fef3c7', color: '#b45309', label: 'Pending User Approval' },
  stage2_user_rejected: { bg: '#fde8e8', color: '#b91c1c', label: 'User Rejected' },
  stage2_approved: { bg: '#e3f6e8', color: '#1f7a3f', label: 'Stage 2 - Approved' },
  stage2_rejected: { bg: '#fde8e8', color: '#b91c1c', label: 'Stage 2 - Rejected' },
  stage2_completed: { bg: '#e3f6e8', color: '#1f7a3f', label: 'Stage 2 - Completed' },
  rejected: { bg: '#fde8e8', color: '#b91c1c', label: 'Rejected' },
  draft: { bg: '#f1f1f1', color: '#555', label: 'Draft' },
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'stage2_in_progress', label: 'Stage 2 - In Progress' },
  { value: 'stage2_pending_user_approval', label: 'Pending User Approval' },
  { value: 'stage2_user_rejected', label: 'User Rejected' },
  { value: 'stage2_approved', label: 'Stage 2 - Approved' },
  { value: 'stage2_rejected', label: 'Stage 2 - Rejected' },
  { value: 'stage2_completed', label: 'Stage 2 - Completed' },
]

const PAGE_SIZE_OPTIONS = [10, 15, 20]

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || {
    bg: '#f1f1f1',
    color: '#555',
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
  }

const formatDate = (value) => {
  if (!value) return 'N/A'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'N/A'
  return d.toISOString().slice(0, 10)
}

const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status)
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'capitalize',
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  )
}

const Stage2Dashboard = () => {
  const { user, stage2OfficerInvoices, stage2OfficerInvoicesPagination, refreshStage2OfficerInvoices } = useApp()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [status, setStatus] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    refreshStage2OfficerInvoices({
      page,
      pageSize: limit,
      status: status || undefined,
      search: search || undefined,
    })
      .catch((err) => setError(err?.message || 'Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [user?.id, page, limit, status, search, refreshStage2OfficerInvoices])

  const rows = useMemo(
    () =>
      (stage2OfficerInvoices || []).map((inv) => ({
        id: inv.originalInvoiceId,
        invoiceNumber: inv.invoiceNumber,
        category: inv.category || 'N/A',
        subCategory: inv.subCategory || 'N/A',
        status: inv.status,
        companyName: inv.data?.companyHeader?.companyName || 'N/A',
        receiverName: inv.data?.receiverInfo?.receiverName || 'N/A',
        createdAt: inv.createdAt,
      })),
    [stage2OfficerInvoices],
  )

  const totalPages = stage2OfficerInvoicesPagination?.totalPages || 1
  const currentPage = stage2OfficerInvoicesPagination?.currentPage || page
  const totalRecords = stage2OfficerInvoicesPagination?.totalRecords || 0

  return (
    <>
      <style>{`
        .od-header { margin-bottom: 1.25rem; }
        .od-title { font-size: 1.25rem; font-weight: 700; margin: 0; color: #111827; }
        .od-subtitle { color: #6b7280; font-size: 13px; margin-top: 4px; }

        .od-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin-bottom: 18px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.06);
          background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,252,0.9));
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .od-search {
          flex: 1 1 220px;
          min-width: 0;
          padding: 9px 14px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.12);
          font-size: 13px;
          outline: none;
          background: #fff;
          box-sizing: border-box;
        }
        .od-select {
          flex: 1 1 150px;
          min-width: 0;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.12);
          font-size: 13px;
          background: #fff;
          box-sizing: border-box;
        }

        .od-state { color: #6b7280; font-size: 14px; }
        .od-error { color: #b91c1c; font-size: 14px; }

        .od-table-wrap {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.7);
          -webkit-overflow-scrolling: touch;
        }
        .od-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 640px; }
        .od-table thead tr { text-align: left; background: rgba(0,0,0,0.03); }
        .od-table th, .od-table td { padding: 10px 14px; }
        .od-table tbody tr { border-top: 1px solid rgba(0,0,0,0.06); cursor: pointer; transition: background 0.12s; }
        .od-table tbody tr:hover { background: rgba(0,0,0,0.03); }
        .od-table td.od-invnum { font-weight: 600; white-space: nowrap; }

        .od-cards { display: none; flex-direction: column; gap: 10px; }
        .od-card {
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.85);
          padding: 14px 16px;
          cursor: pointer;
        }
        .od-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }
        .od-card-invnum { font-weight: 700; font-size: 14px; color: #111827; }
        .od-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 12px;
          font-size: 12.5px;
        }
        .od-card-label { color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
        .od-card-value { color: #374151; margin-top: 1px; }

        .od-pagination {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
        }
        .od-pagination-info { font-size: 12px; color: #6b7280; }
        .od-pagination-btns { display: flex; gap: 8px; }
        .od-page-btn {
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.12);
          background: #fff;
          font-size: 13px;
          cursor: pointer;
          color: #111;
        }
        .od-page-btn:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }

        @media (max-width: 720px) {
          .od-table-wrap { display: none; }
          .od-cards { display: flex; }
          .od-filters { padding: 12px; }
          .od-select { flex: 1 1 45%; }
          .od-pagination { justify-content: center; text-align: center; }
        }
      `}</style>

      <div>
        <div className="od-header">
          <h2 className="od-title">Assigned Invoices</h2>
          <p className="od-subtitle">Invoices currently assigned to you for review.</p>
        </div>

        {/* Filters */}
        <div className="od-filters">
          <input
            type="text"
            className="od-search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by invoice number…"
          />

          <select
            className="od-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className="od-select"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value))
              setPage(1)
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="od-state">Loading invoices…</div>}

        {!loading && error && <div className="od-error">{error}</div>}

        {!loading && !error && rows.length === 0 && (
          <div className="od-state">No invoices match your filters.</div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="od-table-wrap">
              <table className="od-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Company</th>
                    <th>Receiver</th>
                    <th>Category</th>
                    <th>Sub-Category</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} onClick={() => navigate(`/officer2/invoices/${row.id}`)}>
                      <td className="od-invnum">{row.invoiceNumber}</td>
                      <td>{row.companyName}</td>
                      <td>{row.receiverName}</td>
                      <td>{row.category}</td>
                      <td>{row.subCategory}</td>
                      <td>{formatDate(row.createdAt)}</td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="od-cards">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="od-card"
                  onClick={() => navigate(`/officer2/invoices/${row.id}`)}
                >
                  <div className="od-card-top">
                    <span className="od-card-invnum">{row.invoiceNumber}</span>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="od-card-grid">
                    <div>
                      <div className="od-card-label">Company</div>
                      <div className="od-card-value">{row.companyName}</div>
                    </div>
                    <div>
                      <div className="od-card-label">Receiver</div>
                      <div className="od-card-value">{row.receiverName}</div>
                    </div>
                    <div>
                      <div className="od-card-label">Category</div>
                      <div className="od-card-value">{row.category}</div>
                    </div>
                    <div>
                      <div className="od-card-label">Sub-Category</div>
                      <div className="od-card-value">{row.subCategory}</div>
                    </div>
                    <div>
                      <div className="od-card-label">Created</div>
                      <div className="od-card-value">{formatDate(row.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="od-pagination">
              <span className="od-pagination-info">
                Page {currentPage} of {totalPages} · {totalRecords} invoice{totalRecords === 1 ? '' : 's'}
              </span>
              <div className="od-pagination-btns">
                <button
                  className="od-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!stage2OfficerInvoicesPagination?.hasPreviousPage}
                >
                  Previous
                </button>
                <button
                  className="od-page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!stage2OfficerInvoicesPagination?.hasNextPage}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Stage2Dashboard