import { useCallback, useEffect, useRef, useState } from 'react'
import { officerApi } from '../../services/officerApi'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Module-level cache: persists across SPA navigation, but resets on a
// full page refresh (since JS memory is wiped), so a hard refresh
// always triggers a fresh fetch.
let capacityCache = {
  officerId: null,
  data: null,
  timestamp: 0,
}

const OfficerCapacity = ({ officerId }) => {
  const [capacity, setCapacity] = useState(() =>
    capacityCache.officerId === officerId ? capacityCache.data : null
  )
  const [loading, setLoading] = useState(!capacity)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const fetchCapacity = useCallback(
    async (force = false) => {
      if (!officerId) return

      const isCacheValid =
        !force &&
        capacityCache.officerId === officerId &&
        capacityCache.data &&
        Date.now() - capacityCache.timestamp < CACHE_DURATION

      if (isCacheValid) {
        setCapacity(capacityCache.data)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await officerApi.getCapacity(officerId)
        capacityCache = { officerId, data, timestamp: Date.now() }
        setCapacity(data)
      } catch (err) {
        setError(err.message || 'Failed to load capacity')
      } finally {
        setLoading(false)
      }
    },
    [officerId]
  )

  useEffect(() => {
    fetchCapacity(false)

    intervalRef.current = setInterval(() => {
      fetchCapacity(true)
    }, CACHE_DURATION)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchCapacity])

  if (!officerId) return null

  const total = capacity?.totalCapacity ?? 0
  const occupied = Math.min(capacity?.occupiedSlots ?? 0, total)
  const available = total - occupied
  const slots = Array.from({ length: total }, (_, i) => i < occupied)

  return (
    <>
      <style>{`
        .oc-card {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
          margin-bottom: 1.5rem;
        }

        .oc-stats {
          display: flex;
          gap: 1.75rem;
          flex-shrink: 0;
        }

        .oc-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .oc-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8a93a3;
        }
        .oc-stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .oc-stat-value.oc-occupied { color: #16a34a; }
        .oc-stat-value.oc-available { color: #003A6B; }

        .oc-divider {
          width: 1px;
          align-self: stretch;
          background: rgba(15, 23, 42, 0.08);
          flex-shrink: 0;
        }

        .oc-grid-wrap {
          flex: 1;
          min-width: 180px;
        }
        .oc-grid-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8a93a3;
          margin-bottom: 8px;
        }
        .oc-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .oc-slot {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #ffffff;
          transition: transform 0.15s ease;
        }
        .oc-slot.oc-slot-filled {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-color: #15803d;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.35);
        }
        .oc-slot:hover {
          transform: translateY(-2px);
        }

        .oc-legend {
          display: flex;
          gap: 14px;
          margin-top: 10px;
        }
        .oc-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }
        .oc-legend-swatch {
          width: 11px;
          height: 11px;
          border-radius: 3px;
          border: 1px solid rgba(15, 23, 42, 0.14);
        }
        .oc-legend-swatch.oc-legend-filled {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-color: #15803d;
        }

        .oc-error {
          font-size: 12px;
          color: #dc2626;
          font-weight: 500;
        }
        .oc-loading {
          font-size: 12px;
          color: #8a93a3;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .oc-card {
            padding: 0.9rem 1rem;
            gap: 1rem;
          }
          .oc-stats {
            gap: 1.1rem;
          }
          .oc-stat-value {
            font-size: 1.15rem;
          }
          .oc-divider {
            display: none;
          }
          .oc-slot {
            width: 16px;
            height: 16px;
            border-radius: 5px;
          }
        }
      `}</style>

      <div className="oc-card">
        <div className="oc-stats">
          <div className="oc-stat">
            <span className="oc-stat-label">Total Slots</span>
            <span className="oc-stat-value">{total}</span>
          </div>
          <div className="oc-stat">
            <span className="oc-stat-label">Occupied</span>
            <span className="oc-stat-value oc-occupied">{occupied}</span>
          </div>
          <div className="oc-stat">
            <span className="oc-stat-label">Available</span>
            <span className="oc-stat-value oc-available">{available}</span>
          </div>
        </div>

        <div className="oc-divider" />

        <div className="oc-grid-wrap">
          <div className="oc-grid-label">Slot Overview</div>

          {loading && !capacity ? (
            <span className="oc-loading">Loading slot data…</span>
          ) : error ? (
            <span className="oc-error">{error}</span>
          ) : (
            <>
              <div className="oc-grid">
                {slots.map((filled, index) => (
                  <div
                    key={index}
                    className={`oc-slot ${filled ? 'oc-slot-filled' : ''}`}
                    title={filled ? `Slot ${index + 1} — Occupied` : `Slot ${index + 1} — Available`}
                  />
                ))}
              </div>
              <div className="oc-legend">
                <div className="oc-legend-item">
                  <span className="oc-legend-swatch oc-legend-filled" />
                  Occupied
                </div>
                <div className="oc-legend-item">
                  <span className="oc-legend-swatch" />
                  Available
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default OfficerCapacity