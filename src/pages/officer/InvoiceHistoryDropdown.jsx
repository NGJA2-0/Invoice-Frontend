import { useEffect, useRef, useState } from 'react'
import { History, ChevronDown, Loader2 } from 'lucide-react'
import { officerApi } from '../../services/officerApi'

// Reusable "View History" control.
// Fetches /stage1/invoices/:originalInvoiceId/history, builds a dropdown
// from each record's editionLabel (falling back to "Original" for the
// isInitialCopy record, which has no editionLabel), and calls
// onSelect(record) with the full history record the officer picked.
const InvoiceHistoryDropdown = ({ originalInvoiceId, onSelect, activeRecordId }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [records, setRecords] = useState(null) // null = not fetched yet
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await officerApi.getHistory(originalInvoiceId)
      console.log('[history] raw response:', res)

      // Handle whichever shape api.get returns:
      // - full envelope: { success, message, data: [...] }
      // - already-unwrapped array: [...]
      // - already-unwrapped object with .data: { data: [...] }
      const list = Array.isArray(res)
        ? res
        : res?.data || res?.history || []

      setRecords(list)
    } catch (err) {
      setError(err?.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && records === null && !loading) {
      fetchHistory()
    }
  }

  const labelFor = (record) => record.editionLabel || 'Original'

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0.5rem 1rem',
          borderRadius: 999,
          border: '1px solid rgba(0,0,0,0.12)',
          background: '#fff',
          color: '#374151',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <History size={14} />
        View History
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 280,
            maxHeight: 320,
            overflowY: 'auto',
            background: '#fff',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 20,
          }}
        >
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem', color: '#6b7280', fontSize: 13 }}>
              <Loader2 size={14} className="spin" />
              Loading history…
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: '0.75rem 1rem', color: '#b91c1c', fontSize: 13 }}>{error}</div>
          )}

          {!loading && !error && records && records.length === 0 && (
            <div style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: 13 }}>No history found.</div>
          )}

          {!loading && !error && records && records.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: '0.25rem' }}>
              {records.map((record) => {
                const isActive = activeRecordId === record.id
                return (
                  <li key={record.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(record)
                        setOpen(false)
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 8,
                        border: 'none',
                        background: isActive ? '#eff6ff' : 'transparent',
                        color: isActive ? '#1d4ed8' : '#374151',
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {labelFor(record)}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default InvoiceHistoryDropdown