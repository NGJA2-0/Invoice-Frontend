import Button from '../common/Button'

const ConfirmModal = ({
  open,
  title,
  description,
  onConfirm,
  onClose,
  confirmLabel = 'Confirm',
  showCancel = true,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 px-4">
      <div className="glass-card w-full max-w-md rounded-2xl border px-6 py-5">
        <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          {showCancel ? (
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          ) : null}
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
