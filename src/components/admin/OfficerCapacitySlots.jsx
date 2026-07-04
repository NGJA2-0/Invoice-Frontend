import { Users } from 'lucide-react'

// Displays an officer's slot capacity as two premium stat "chips":
// total capacity (white/neutral) and occupied slots (green, highlighted).
export default function OfficerCapacitySlots({ totalCapacity = 0, occupiedSlots = 0 }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur-sm sm:gap-2.5 sm:px-3">
      <Users className="hidden h-4 w-4 shrink-0 text-gray-400 sm:block" />

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Total capacity */}
        <div className="flex min-w-[3.25rem] flex-col items-center rounded-xl border border-gray-100 bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:min-w-[3.75rem] sm:px-4 sm:py-2">
          <span className="text-base font-extrabold leading-none text-gray-900 sm:text-lg">
            {totalCapacity}
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-gray-400 sm:text-[10px]">
            Total
          </span>
        </div>

        <span className="text-sm font-medium text-gray-300">/</span>

        {/* Occupied slots */}
        <div className="flex min-w-[3.25rem] flex-col items-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 px-3 py-1.5 shadow-[0_3px_10px_rgba(16,185,129,0.35)] sm:min-w-[3.75rem] sm:px-4 sm:py-2">
          <span className="text-base font-extrabold leading-none text-white sm:text-lg">
            {occupiedSlots}
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-50 sm:text-[10px]">
            Occupied
          </span>
        </div>
      </div>
    </div>
  )
}