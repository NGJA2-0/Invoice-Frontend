import Button from '../common/Button'

const TemplateCard = ({ title, description, status, onSelect }) => {
  const available = status === 'Available'

  return (
    <div className="glass-card flex flex-col gap-4 rounded-2xl border px-6 py-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
          {status}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-600">{description}</p>
      </div>
      {available ? (
        <Button onClick={onSelect}>Use Template</Button>
      ) : (
        <Button variant="secondary" className="cursor-not-allowed opacity-70">
          Coming Soon
        </Button>
      )}
    </div>
  )
}

export default TemplateCard
