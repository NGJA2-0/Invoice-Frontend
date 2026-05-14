const Select = ({ label, hint, className = '', children, ...props }) => {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-ink-800">
      {label ? <span className="label">{label}</span> : null}
      <select className={`input-base ${className}`.trim()} {...props}>
        {children}
      </select>
      {hint ? <span className="text-xs text-ink-600">{hint}</span> : null}
    </label>
  )
}

export default Select
