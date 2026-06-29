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
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#374151',
        fontSize: 13,
        fontWeight: 600,
        padding: 0,
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