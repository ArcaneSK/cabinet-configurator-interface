import { useState, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { getStylesForType } from '../../catalog/styles'
import { sizeCatalog, defaultDimensions } from '../../catalog/sizes'
import { findPlacementPosition, getYPosition } from '../../systems/placement'
import type { CabinetType, CabinetStyle } from '../../types'

export function CabinetCatalog() {
  const [activeType, setActiveType] = useState<CabinetType>('base')
  const [activeStyle, setActiveStyle] = useState<CabinetStyle>('1dr')
  const [selectedWidth, setSelectedWidth] = useState(24)
  const [selectedHeight, setSelectedHeight] = useState(defaultDimensions.base.height)
  const [selectedDepth, setSelectedDepth] = useState(defaultDimensions.base.depth)

  const addCabinet = useStore((s) => s.addCabinet)
  const wall = useStore((s) => s.wall)
  const cabinets = useStore((s) => s.cabinets)

  const styles = getStylesForType(activeType)
  const sizes = sizeCatalog[activeType]

  const handleTypeChange = useCallback((type: CabinetType) => {
    setActiveType(type)
    const defaults = defaultDimensions[type]
    setSelectedWidth(defaults.width)
    setSelectedHeight(defaults.height)
    setSelectedDepth(defaults.depth)
    const available = getStylesForType(type)
    if (!available.find(s => s.id === activeStyle)) {
      setActiveStyle(available[0].id)
    }
  }, [activeStyle])

  const handleAdd = useCallback(() => {
    const y = getYPosition(activeType)
    const x = findPlacementPosition(
      activeType,
      selectedWidth,
      selectedHeight,
      selectedDepth,
      wall,
      Object.values(cabinets)
    )
    if (x === null) {
      return
    }

    addCabinet({
      type: activeType,
      style: activeStyle,
      width: selectedWidth,
      height: selectedHeight,
      depth: selectedDepth,
      isCustomSize: !sizes.widths.includes(selectedWidth),
      faceColor: 'black',
      boxColor: 'white',
      position: { x, y },
      appliedEndLeft: null,
      appliedEndRight: null,
      handleSide: 'left',
    })
  }, [activeType, activeStyle, selectedWidth, selectedHeight, selectedDepth, wall, cabinets, addCabinet, sizes])

  const styleIcons: Record<string, string> = {
    '1dr': '\u{1F6AA}',
    '2dr': '\u{1F6AA}\u{1F6AA}',
    'open': '\u2610',
    '1dw1dr': '\u25AC\n\u{1F6AA}',
    '1dw2dr': '\u25AC\n\u{1F6AA}\u{1F6AA}',
    '3dw': '\u25AC\n\u25AC\n\u25AC',
    '4dw': '\u25AC\n\u25AC\n\u25AC\n\u25AC',
  }

  return (
    <div>
      <div className="type-tabs">
        {(['base', 'upper', 'pantry'] as CabinetType[]).map(t => (
          <button
            key={t}
            className={`type-tab ${activeType === t ? 'active' : ''}`}
            onClick={() => handleTypeChange(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="style-grid">
        {styles.map(s => (
          <button
            key={s.id}
            className={`style-tile ${activeStyle === s.id ? 'active' : ''}`}
            onClick={() => setActiveStyle(s.id)}
            onPointerDown={(e) => {
              if (e.button !== 0) return
              window.dispatchEvent(new CustomEvent('sidebar-drag-start', {
                detail: {
                  type: activeType,
                  style: s.id,
                  width: selectedWidth,
                  height: selectedHeight,
                  depth: selectedDepth,
                  faceColor: 'black',
                },
              }))
            }}
            style={{ cursor: 'grab', touchAction: 'none' }}
          >
            <div style={{ whiteSpace: 'pre-line', fontSize: 14, marginBottom: 2 }}>
              {styleIcons[s.id] ?? '?'}
            </div>
            {s.label}
          </button>
        ))}
      </div>

      <div className="size-label">Width</div>
      <div className="size-selector">
        {sizes.widths.map(w => (
          <button
            key={w}
            className={`size-btn ${selectedWidth === w ? 'active' : ''}`}
            onClick={() => setSelectedWidth(w)}
          >
            {w}"
          </button>
        ))}
      </div>

      {sizes.heights.length > 1 && (
        <>
          <div className="size-label">Height</div>
          <div className="size-selector">
            {sizes.heights.map(h => (
              <button
                key={h}
                className={`size-btn ${selectedHeight === h ? 'active' : ''}`}
                onClick={() => setSelectedHeight(h)}
              >
                {h}"
              </button>
            ))}
          </div>
        </>
      )}

      {sizes.depths.length > 1 && (
        <>
          <div className="size-label">Depth</div>
          <div className="size-selector">
            {sizes.depths.map(d => (
              <button
                key={d}
                className={`size-btn ${selectedDepth === d ? 'active' : ''}`}
                onClick={() => setSelectedDepth(d)}
              >
                {d}"
              </button>
            ))}
          </div>
        </>
      )}

      <button className="add-btn" onClick={handleAdd}>
        + Add {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Cabinet
      </button>
    </div>
  )
}
