import { useStore } from '../../store/useStore'
import { finishes, getFinish } from '../../catalog/finishes'
import { getStyle } from '../../catalog/styles'

const selectedLabel = { color: 'var(--text-secondary)', fontSize: 10, marginTop: 4 } as const

export function CabinetProperties() {
  const selectedIds = useStore((s) => s.selectedIds)
  const cabinets = useStore((s) => s.cabinets)
  const updateCabinet = useStore((s) => s.updateCabinet)
  const updateCabinets = useStore((s) => s.updateCabinets)
  const removeCabinet = useStore((s) => s.removeCabinet)
  const removeCabinets = useStore((s) => s.removeCabinets)

  if (selectedIds.size === 0) return null

  // Multi-select mode
  if (selectedIds.size > 1) {
    const selectedCabs = Array.from(selectedIds).map(id => cabinets[id]).filter(Boolean)
    // Check if all share the same face/box color
    const allSameFace = selectedCabs.every(c => c.faceColor === selectedCabs[0].faceColor)
    const allSameBox = selectedCabs.every(c => c.boxColor === selectedCabs[0].boxColor)

    const setAllFaceColor = (colorId: string) => {
      const updates: Record<string, { faceColor: string }> = {}
      for (const id of selectedIds) {
        updates[id] = { faceColor: colorId }
      }
      updateCabinets(updates)
    }

    const setAllBoxColor = (colorId: string) => {
      const updates: Record<string, { boxColor: string }> = {}
      for (const id of selectedIds) {
        updates[id] = { boxColor: colorId }
      }
      updateCabinets(updates)
    }

    return (
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 10 }}>
          {selectedIds.size} cabinets selected
        </div>

        <div className="prop-row">
          <div className="size-label">Face Color</div>
          <div className="swatch-row">
            {finishes.map(f => (
              <div
                key={f.id}
                className={`swatch ${allSameFace && selectedCabs[0].faceColor === f.id ? 'active' : ''}`}
                style={{ background: f.hex }}
                title={f.name}
                onClick={() => setAllFaceColor(f.id)}
              />
            ))}
          </div>
          {allSameFace && <div style={selectedLabel}>{getFinish(selectedCabs[0].faceColor).name}</div>}
        </div>

        <div className="prop-row">
          <div className="size-label">Box Color</div>
          <div className="swatch-row">
            {finishes.filter(f => f.type === 'solid').map(f => (
              <div
                key={f.id}
                className={`swatch ${allSameBox && selectedCabs[0].boxColor === f.id ? 'active' : ''}`}
                style={{ background: f.hex }}
                title={f.name}
                onClick={() => setAllBoxColor(f.id)}
              />
            ))}
          </div>
          {allSameBox && <div style={selectedLabel}>{getFinish(selectedCabs[0].boxColor).name}</div>}
        </div>

        <button className="delete-btn" onClick={() => removeCabinets(selectedIds)}>
          Delete {selectedIds.size} Cabinets
        </button>
      </div>
    )
  }

  // Single select
  const selectedId = Array.from(selectedIds)[0]
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
        <div style={selectedLabel}>{getFinish(cab.faceColor).name}</div>
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
        <div style={selectedLabel}>{getFinish(cab.boxColor).name}</div>
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
          {cab.type === 'upper' && (
            <label>
              <input
                type="checkbox"
                checked={cab.appliedEndBottom !== null}
                onChange={(e) =>
                  updateCabinet(selectedId, {
                    appliedEndBottom: e.target.checked ? cab.faceColor : null,
                  })
                }
              />
              {' '}Bottom
            </label>
          )}
        </div>
        {(cab.appliedEndLeft || cab.appliedEndRight || cab.appliedEndBottom) && (
          <div className="swatch-row" style={{ marginTop: 6 }}>
            {finishes.map(f => (
              <div
                key={f.id}
                className={`swatch ${(cab.appliedEndLeft === f.id || cab.appliedEndRight === f.id || cab.appliedEndBottom === f.id) ? 'active' : ''}`}
                style={{ background: f.hex }}
                title={f.name}
                onClick={() => {
                  const updates: Record<string, string | null> = {}
                  if (cab.appliedEndLeft) updates.appliedEndLeft = f.id
                  if (cab.appliedEndRight) updates.appliedEndRight = f.id
                  if (cab.appliedEndBottom) updates.appliedEndBottom = f.id
                  updateCabinet(selectedId, updates)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toe kick (base and pantry only) */}
      {cab.type !== 'upper' && (
        <div className="prop-row">
          <div className="size-label">Toe Kick</div>
          <div className="size-selector">
            {[6, 9].map(tk => (
              <button
                key={tk}
                className={`size-btn ${cab.toeKick === tk ? 'active' : ''}`}
                onClick={() => {
                  const delta = tk - cab.toeKick
                  updateCabinet(selectedId, {
                    toeKick: tk,
                    position: { x: cab.position.x, y: cab.position.y + delta },
                  })
                }}
              >
                {tk}"
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="delete-btn" onClick={() => removeCabinet(selectedId)}>
        Delete Cabinet
      </button>
    </div>
  )
}
