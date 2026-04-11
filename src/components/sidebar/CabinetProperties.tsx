import { useEffect, useState } from 'react'
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
  const resizeCabinet = useStore((s) => s.resizeCabinet)
  const appliedEnds = useStore((s) => s.appliedEnds)
  const addAppliedEnd = useStore((s) => s.addAppliedEnd)
  const removeAppliedEnd = useStore((s) => s.removeAppliedEnd)
  const updateAppliedEnd = useStore((s) => s.updateAppliedEnd)
  const removeCabinetFromBottomGroup = useStore((s) => s.removeCabinetFromBottomGroup)

  // Hooks for dimension inputs — must be called unconditionally. When
  // no single cabinet is selected these values are unused.
  const singleId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : null
  const singleCab = singleId ? cabinets[singleId] : null
  const [limitedAxis, setLimitedAxis] = useState<'W' | 'H' | 'D' | null>(null)
  const [dimInput, setDimInput] = useState({
    width: singleCab ? String(singleCab.width) : '',
    height: singleCab ? String(singleCab.height) : '',
    depth: singleCab ? String(singleCab.depth) : '',
  })
  // Reset local state when selection or underlying size changes.
  const singleW = singleCab?.width
  const singleH = singleCab?.height
  const singleD = singleCab?.depth
  useEffect(() => {
    if (singleW !== undefined && singleH !== undefined && singleD !== undefined) {
      setDimInput({
        width: String(singleW),
        height: String(singleH),
        depth: String(singleD),
      })
    }
  }, [singleId, singleW, singleH, singleD])

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

        <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 10 }}>
          Select a single cabinet to resize.
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

  function commitDim(axis: 'width' | 'height' | 'depth', raw: string, label: 'W' | 'H' | 'D') {
    const v = parseFloat(raw)
    if (Number.isNaN(v) || v === cab[axis]) {
      setDimInput(prev => ({ ...prev, [axis]: String(cab[axis]) }))
      return
    }
    const r = resizeCabinet(selectedId, { [axis]: v })
    if (r.committed[axis] !== v) {
      setLimitedAxis(label)
      setTimeout(() => setLimitedAxis(null), 2000)
      setDimInput(prev => ({ ...prev, [axis]: String(r.committed[axis]) }))
    }
  }

  const endsForThisCabinet = Object.values(appliedEnds).filter(e =>
    e.cabinetIds.includes(selectedId)
  )
  const leftEnd = endsForThisCabinet.find(e => e.side === 'left' && e.cabinetIds.length === 1)
  const rightEnd = endsForThisCabinet.find(e => e.side === 'right' && e.cabinetIds.length === 1)
  const bottomEnds = endsForThisCabinet.filter(e => e.side === 'bottom')

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

      {/* Dimensions (single select only) */}
      <div className="prop-row">
        <div className="size-label">Dimensions (in)</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="number"
            value={dimInput.width}
            step={1}
            onChange={(e) => setDimInput(prev => ({ ...prev, width: e.target.value }))}
            onBlur={(e) => commitDim('width', e.target.value, 'W')}
            title="W"
          />
          <input
            type="number"
            value={dimInput.height}
            step={1}
            onChange={(e) => setDimInput(prev => ({ ...prev, height: e.target.value }))}
            onBlur={(e) => commitDim('height', e.target.value, 'H')}
            title="H"
          />
          <input
            type="number"
            value={dimInput.depth}
            step={1}
            onChange={(e) => setDimInput(prev => ({ ...prev, depth: e.target.value }))}
            onBlur={(e) => commitDim('depth', e.target.value, 'D')}
            title="D"
          />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          12–60 × 12–96 × 10–36 in
        </div>
        {limitedAxis && (
          <div style={{ fontSize: 11, color: 'var(--accent)' }}>
            Limited on {limitedAxis} by neighbor cabinet
          </div>
        )}
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

      {/* Applied ends */}
      <div className="prop-row">
        <div className="size-label">Applied Ends</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <input
              type="checkbox"
              checked={!!leftEnd}
              onChange={(e) => {
                if (e.target.checked) {
                  addAppliedEnd({ side: 'left', finishId: cab.faceColor, cabinetIds: [selectedId] })
                } else if (leftEnd) {
                  removeAppliedEnd(leftEnd.id)
                }
              }}
            />
            Left
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <input
              type="checkbox"
              checked={!!rightEnd}
              onChange={(e) => {
                if (e.target.checked) {
                  addAppliedEnd({ side: 'right', finishId: cab.faceColor, cabinetIds: [selectedId] })
                } else if (rightEnd) {
                  removeAppliedEnd(rightEnd.id)
                }
              }}
            />
            Right
          </label>
          {cab.type === 'upper' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <input
                type="checkbox"
                checked={bottomEnds.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    addAppliedEnd({ side: 'bottom', finishId: cab.faceColor, cabinetIds: [selectedId] })
                  } else if (bottomEnds.length === 1 && bottomEnds[0].cabinetIds.length === 1) {
                    removeAppliedEnd(bottomEnds[0].id)
                  } else {
                    removeCabinetFromBottomGroup(selectedId)
                  }
                }}
              />
              Bottom
            </label>
          )}
        </div>
        {endsForThisCabinet.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
              Applied End Color
            </div>
            <div className="swatch-row">
              {finishes.map(f => {
                const allSame = endsForThisCabinet.every(e => e.finishId === f.id)
                return (
                  <div
                    key={f.id}
                    className={`swatch ${allSame ? 'active' : ''}`}
                    style={{ background: f.hex }}
                    title={f.name}
                    onClick={() => {
                      for (const e of endsForThisCabinet) {
                        updateAppliedEnd(e.id, { finishId: f.id })
                      }
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      <button className="delete-btn" onClick={() => removeCabinet(selectedId)}>
        Delete Cabinet
      </button>
    </div>
  )
}
