const toneStyles = {
  neutral: 'bg-cloud-100 text-ink-700',
  info: 'bg-azure-50 text-azure-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
}

const Badge = ({ tone = 'neutral', className = '', children }) => {
  return (
    <span className={`badge ${toneStyles[tone]} ${className}`.trim()}>
      {children}
    </span>
  )
}

export default Badge
