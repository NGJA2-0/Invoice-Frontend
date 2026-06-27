import { useState, useRef, useEffect } from 'react'

const Select = ({ label, hint, className = '', children, value, onChange, ...props }) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Extract options from children (supports <option> children)
  const flattenChildren = (nodes) => {
    const result = []
    const process = (node) => {
      if (!node) return
      if (Array.isArray(node)) { node.forEach(process); return }
      if (node.props?.value !== undefined) {
        result.push({ value: node.props.value ?? '', label: node.props.children ?? '' })
      }
    }
    process(nodes)
    return result
  }
  const options = flattenChildren(children)

  const selected = options.find((o) => String(o.value) === String(value))
  const placeholder = options.find((o) => o.value === '')?.label || 'Select…'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optValue) => {
    // Simulate a native onChange event so callers using event.target.value still work
    onChange?.({ target: { value: optValue } })
    setOpen(false)
  }
  return (
    <div className="flex flex-col gap-2 text-sm text-ink-800 w-full" ref={containerRef}
      style={{ position: 'relative' }}>
      {label ? (
        <label className="label">{label}</label>
      ) : null}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '44px', width: '100%', padding: '0 12px',
          borderRadius: '12px', border: '1px solid #e5e7eb',
          background: '#fff', fontSize: '14px',
          color: selected && selected.value !== '' ? '#1a1a1a' : '#9ca3af',
          cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected && selected.value !== '' ? selected.label : placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#b8922a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0, marginLeft: 8,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          zIndex: 9999, background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          <ul style={{
            maxHeight: '260px', overflowY: 'auto',
            margin: 0, padding: '4px 6px 8px', listStyle: 'none',
          }}>
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: '9px 12px', borderRadius: '8px',
                  fontSize: '13px', cursor: opt.value === '' ? 'default' : 'pointer',
                  color: opt.value === '' ? '#9ca3af'
                    : String(opt.value) === String(value) ? '#b8922a' : '#1a1a1a',
                  background: String(opt.value) === String(value) ? '#fdf6e8' : 'transparent',
                  fontWeight: String(opt.value) === String(value) ? 600 : 400,
                  pointerEvents: opt.value === '' ? 'none' : 'auto',
                }}
                onMouseEnter={(e) => {
                  if (String(opt.value) !== String(value) && opt.value !== '')
                    e.currentTarget.style.background = '#fafafa'
                }}
                onMouseLeave={(e) => {
                  if (String(opt.value) !== String(value))
                    e.currentTarget.style.background = 'transparent'
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hint ? <span className="text-xs text-ink-600">{hint}</span> : null}
    </div>
  )
}
export default Select