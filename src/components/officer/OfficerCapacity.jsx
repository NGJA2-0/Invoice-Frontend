import { useCallback, useEffect, useState } from 'react'
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
  const [capacity, setCapacity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCapacity = useCallback(async (force = false) => {
    if (!officerId) return

    const isCacheValid =
      !force &&
      capacityCache.officerId === officerId &&
      capacityCache.data &&
      Date.now() - capacityCache.timestamp < CACHE_DURATION

    if (isCacheValid) {
      setCapacity(capacityCache.data)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await officerApi.getMyCapacity()
      capacityCache = { officerId, data, timestamp: Date.now() }
      setCapacity(data)
    } catch (err) {
      setError(err.message || 'Failed to load slot data')
    } finally {
      setLoading(false)
    }
  }, [officerId])

  // Initial load — uses cache if it's still within the 5-minute window
  useEffect(() => {
    fetchCapacity()
  }, [fetchCapacity])

  // Auto-refresh every 5 minutes. A manual browser refresh also gets
  // fresh data instantly, since capacityCache lives in JS memory and
  // is wiped on full page reload.
  useEffect(() => {
    if (!officerId) return
    const interval = setInterval(() => fetchCapacity(true), CACHE_DURATION)
    return () => clearInterval(interval)
  }, [officerId, fetchCapacity])

  if (!officerId) return null

  const total = capacity?.totalCapacity ?? 0
  const occupied = Math.min(capacity?.occupiedSlots ?? 0, total)
  const available = total - occupied
  const slots = Array.from({ length: total }, (_, i) => i < occupied)

  return (
    <>
      <style>{`
        .oc-card {
          background: rgba(226, 230, 236, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 16px;
          padding: 1.85rem;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
          margin: 0 auto 1.5rem;
          max-width: 700px;
        }

        .oc-card-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2.75rem;
          max-width: 620px;
          margin: 0 auto;
        }

        .oc-stats {
          display: flex;
          gap: 2rem;
          flex-shrink: 0;
        }

        .oc-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 64px;
        }
        .oc-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8a93a3;
        }
        .oc-stat-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .oc-stat-value.oc-occupied { color: #16a34a; }
        .oc-stat-value.oc-available { color: #003A6B; }

        .oc-divider {
          width: 1px;
          height: 44px;
          background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.12), transparent);
          flex-shrink: 0;
        }

        .oc-grid-section {
          flex-shrink: 0;
          width: 190px;
        }

        .oc-grid-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .oc-grid-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8a93a3;
        }
        .oc-grid-fraction {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          background: rgba(15, 23, 42, 0.05);
          padding: 2px 9px;
          border-radius: 999px;
        }

        .oc-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .oc-slot {
          aspect-ratio: 1 / 1;
          width: 100%;
          border-radius: 6px;
          border: 2.5px solid rgba(15, 23, 42, 0.22);
          background: #ffffff;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .oc-slot.oc-slot-filled {
          background: linear-gradient(135deg, #34d399, #16a34a);
          border-color: #15803d;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.35);
        }
        .oc-slot:hover {
          transform: translateY(-2px) scale(1.06);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
        }

        .oc-footer-row {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
        }

        .oc-legend {
          display: flex;
          gap: 16px;
        }
        .oc-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #64748b;
          font-weight: 500;
        }
        .oc-legend-swatch {
          width: 11px;
          height: 11px;
          border-radius: 3px;
          border: 2px solid rgba(15, 23, 42, 0.22);
        }
        .oc-legend-swatch.oc-legend-filled {
          background: linear-gradient(135deg, #34d399, #16a34a);
          border-color: #15803d;
        }

        .oc-progress-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.07);
          overflow: hidden;
        }
        .oc-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #34d399, #16a34a);
          transition: width 0.4s ease;
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

        @media (max-width: 768px) {
          .oc-card {
            max-width: 100%;
            padding: 1.1rem;
          }
          .oc-card-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .oc-stats {
            justify-content: space-between;
            gap: 0.75rem;
          }
          .oc-stat {
            min-width: 0;
          }
          .oc-divider {
            display: none;
          }
          .oc-grid-section {
            width: 100%;
            max-width: 240px;
            margin: 0 auto;
          }
          .oc-grid {
            gap: 6px;
          }
        }

        @media (max-width: 480px) {
          .oc-card {
            padding: 0.85rem;
          }
          .oc-stat-label {
            font-size: 9px;
          }
          .oc-stat-value {
            font-size: 1.2rem;
          }
          .oc-grid-label {
            font-size: 9px;
          }
          .oc-grid-fraction {
            font-size: 10px;
            padding: 2px 7px;
          }
          .oc-grid-section {
            max-width: 210px;
          }
          .oc-grid {
            gap: 5px;
          }
          .oc-legend-item {
            font-size: 10.5px;
          }
        }
      `}</style>

      <div className="oc-card">
        <div className="oc-card-inner">
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

          <div className="oc-grid-section">
            <div className="oc-grid-header">
              <span className="oc-grid-label">Slot Overview</span>
              {!loading && !error && (
                <span className="oc-grid-fraction">{occupied}/{total} used</span>
              )}
            </div>

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

                <div className="oc-footer-row">
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

                  <div className="oc-progress-track">
                    <div
                      className="oc-progress-fill"
                      style={{ width: total > 0 ? `${(occupied / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OfficerCapacity