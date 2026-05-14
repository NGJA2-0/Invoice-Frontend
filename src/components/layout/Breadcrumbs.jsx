import { ChevronRight } from 'lucide-react'

const Breadcrumbs = ({ items }) => {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-ink-600">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={item.active ? 'text-ink-900' : ''}>{item.label}</span>
          {index < items.length - 1 ? <ChevronRight className="h-3 w-3" /> : null}
        </div>
      ))}
    </div>
  )
}

export default Breadcrumbs
