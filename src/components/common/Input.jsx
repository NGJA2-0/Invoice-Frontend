const Input = ({ label, hint, className = '', ...props }) => {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-ink-800">
      {label ? <span className="label">{label}</span> : null}
      <input className={`input-base min-h-[44px] sm:min-h-0 ${className}`.trim()} {...props} />
      {hint ? <span className="text-xs text-ink-600">{hint}</span> : null}
    </label>
  )
}

export default Input
