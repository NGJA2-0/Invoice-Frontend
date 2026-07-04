import { ArrowLeft } from 'lucide-react'

const InvoiceDetailHeader = ({ title = 'Back', onBack, children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.25rem',
      flexWrap: 'wrap',
      gap: 10,
    }}
  >
    <button
      type="button"
      onClick={onBack}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#ffffff',
        border: '1px solid #e8dfc8',
        borderRadius: 10,
        cursor: 'pointer',
        color: '#374151',
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 14px',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#c9a96e'
        e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(154,123,60,0.35)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e8dfc8'
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <ArrowLeft size={15} />
      {title}
    </button>

    {children && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
    )}
  </div>
)

export default InvoiceDetailHeader