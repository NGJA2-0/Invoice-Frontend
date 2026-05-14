import { X } from 'lucide-react'

const toneStyles = {
  info: 'border-azure-100 bg-azure-50/80 text-azure-700',
  success: 'border-emerald-100 bg-emerald-50/80 text-emerald-700',
  warning: 'border-amber-100 bg-amber-50/80 text-amber-700',
  danger: 'border-rose-100 bg-rose-50/80 text-rose-700',
}

const ToastStack = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null

  return (
    <div className="fixed right-6 top-6 z-50 flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass-card flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-soft ${
            toneStyles[toast.tone]
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message ? (
              <p className="mt-1 text-xs text-ink-700">{toast.message}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="text-ink-500 hover:text-ink-800"
            onClick={() => onDismiss(toast.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
