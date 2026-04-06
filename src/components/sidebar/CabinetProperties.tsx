import { useStore } from '../../store/useStore'
import { finishes } from '../../catalog/finishes'
import { getStyle } from '../../catalog/styles'

export function CabinetProperties() {
  const selectedIds = useStore((s) => s.selectedIds)
  const cabinets = useStore((s) => s.cabinets)
  const updateCabinet = useStore((s) => s.updateCabinet)
  const removeCabinet = useStore((s) => s.removeCabinet)

  const selectedId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : null

  if (selectedIds.size > 1) {
    return <div style={{ padding: 8, color: 'var(--text-muted)', fontSize: 12 }}>{selectedIds.size} cabinets selected</div>
  }
  if (!selectedId || !cabinets[selectedId]) return null

  const cab = cabinets[selectedId]
  const style = getStyle(cab.style)

  return (
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 10 }}>
        {cab.type.charAt(0).toUpperCase() + cab.type.slice(1)} · {style.label} · {cab.width}"W × {cab.height}"H × {cab.depth}"D
      </div>

      {/* Face color */}
      <div className="prop-row">
        <div className="size-label">Face Color</div>
        <div className="swatch-row">
          {finishes.map(f => (
            <div
              key={f.id}
              className={`swatch ${cab.faceColor === f.id ? 'active' : ''}`}
              style={{ background: f.hex }}
              title={f.name}
              onClick={() => updateCabinet(selectedId, { faceColor: f.id })}
            />
          ))}
        </div>
      </div>

      {/* Box color */}
      <div className="prop-row">
        <div className="size-label">Box Color</div>
        <div className="swatch-row">
          {finishes.filter(f => f.type === 'solid').map(f => (
            <div
              key={f.id}
              className={`swatch ${cab.boxColor === f.id ? 'active' : ''}`}
              style={{ background: f.hex }}
              title={f.name}
              onClick={() => updateCabinet(selectedId, { boxColor: f.id })}
            />
          ))}
        </div>
      </div>

      {/* Handle side */}
      {style.doors > 0 && (
        <div className="prop-row">
          <div className="size-label">Handle Side</div>
          <div className="size-selector">
            <button
              className={`size-btn ${cab.handleSide === 'left' ? 'active' : ''}`}
              onClick={() => updateCabinet(selectedId, { handleSide: 'left' })}
            >
              Left
            </button>
            <button
              className={`size-btn ${cab.handleSide === 'right' ? 'active' : ''}`}
              onClick={() => updateCabinet(selectedId, { handleSide: 'right' })}
            >
              Right
            </button>
          </div>
        </div>
      )}

      {/* Applied ends */}
      <div className="prop-row">
        <div className="size-label">Applied Ends</div>
        <div className="toggle-row">
          <label>
            <input
              type="checkbox"
              checked={cab.appliedEndLeft !== null}
              onChange={(e) =>
                updateCabinet(selectedId, {
                  appliedEndLeft: e.target.checked ? cab.faceColor : null,
                })
              }
            />
            {' '}Left
          </label>
          <label>
            <input
              type="checkbox"
              checked={cab.appliedEndRight !== null}
              onChange={(e) =>
                updateCabinet(selectedId, {
                  appliedEndRight: e.target.checked ? cab.faceColor : null,
                })
              }
            />
            {' '}Right
          </label>
        </div>
        {(cab.appliedEndLeft || cab.appliedEndRight) && (
          <div className="swatch-row" style={{ marginTop: 6 }}>
            {finishes.map(f => (
              <div
                key={f.id}
                className={`swatch ${(cab.appliedEndLeft === f.id || cab.appliedEndRight === f.id) ? 'active' : ''}`}
                style={{ background: f.hex }}
                title={f.name}
                onClick={() => {
                  const updates: Record<string, string | null> = {}
                  if (cab.appliedEndLeft) updates.appliedEndLeft = f.id
                  if (cab.appliedEndRight) updates.appliedEndRight = f.id
                  updateCabinet(selectedId, updates)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <button className="delete-btn" onClick={() => removeCabinet(selectedId)}>
        Delete Cabinet
      </button>
    </div>
  )
}
