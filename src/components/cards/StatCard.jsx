const StatCard = ({ label, value, note }) => {
  return (
    <div className="surface-card flex flex-col gap-3 rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">
        {label}
      </p>
      <p className="text-2xl font-semibold text-ink-900">{value}</p>
      {note ? <p className="text-xs text-ink-600">{note}</p> : null}
    </div>
  )
}

export default StatCard
