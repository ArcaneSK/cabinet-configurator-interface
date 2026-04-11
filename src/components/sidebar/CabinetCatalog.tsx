import { useState, useCallback, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { getStylesForType } from '../../catalog/styles'
import { sizeCatalog, defaultDimensions, customSizeConstraints } from '../../catalog/sizes'
import { findPlacementPosition, getYPosition } from '../../systems/placement'
import type { CabinetType, CabinetStyle } from '../../types'

export function CabinetCatalog() {
  const [activeType, setActiveType] = useState<CabinetType>('base')
  const [activeStyle, setActiveStyle] = useState<CabinetStyle>('1dr')
  const [selectedWidth, setSelectedWidth] = useState(24)
  const [selectedHeight, setSelectedHeight] = useState(defaultDimensions.base.height)
  const [selectedDepth, setSelectedDepth] = useState(defaultDimensions.base.depth)
  const [customMode, setCustomMode] = useState(false)

  const clampCustom = (axis: 'width' | 'height' | 'depth', v: number) => {
    const { min, max } = customSizeConstraints[axis]
    if (Number.isNaN(v)) return min
    return Math.max(min, Math.min(max, v))
  }

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
    const toeKick = activeType === 'upper' ? 0 : 6
    const y = getYPosition(activeType, toeKick)
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
      isCustomSize: customMode,
      faceColor: 'black',
      boxColor: 'white',
      position: { x, y },
      handleSide: 'left',
      toeKick: activeType === 'upper' ? 0 : 6,
    })
  }, [activeType, activeStyle, selectedWidth, selectedHeight, selectedDepth, wall, cabinets, addCabinet, customMode])

  function CabinetIcon({ styleId }: { styleId: string }) {
    const w = 32, h = 36
    const stroke = '#9aa8b5'
    const fill = 'none'
    const sw = 1.5

    switch (styleId) {
      case '1dr':
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <rect x={2} y={2} width={w-4} height={h-4} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <circle cx={w-7} cy={h/2} r={1.5} fill={stroke} />
          </svg>
        )
      case '2dr':
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <rect x={2} y={2} width={(w-5)/2} height={h-4} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <rect x={w/2+0.5} y={2} width={(w-5)/2} height={h-4} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <circle cx={w/2-3} cy={h/2} r={1.5} fill={stroke} />
            <circle cx={w/2+3.5} cy={h/2} r={1.5} fill={stroke} />
          </svg>
        )
      case 'open':
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <rect x={2} y={2} width={w-4} height={h-4} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <line x1={4} y1={h/2} x2={w-4} y2={h/2} stroke={stroke} strokeWidth={1} strokeDasharray="2 2" />
          </svg>
        )
      case '1dw1dr': {
        const dwH = 10
        const doorY = dwH + 4
        const doorH = h - doorY - 2
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <rect x={2} y={2} width={w-4} height={dwH} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <rect x={2} y={doorY} width={w-4} height={doorH} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <line x1={w/2-5} y1={2+dwH/2} x2={w/2+5} y2={2+dwH/2} stroke={stroke} strokeWidth={1.5} />
            <circle cx={w-7} cy={doorY+doorH/2} r={1.5} fill={stroke} />
          </svg>
        )
      }
      case '1dw2dr': {
        const dwH = 10
        const doorY = dwH + 4
        const doorH = h - doorY - 2
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <rect x={2} y={2} width={w-4} height={dwH} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <rect x={2} y={doorY} width={(w-5)/2} height={doorH} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <rect x={w/2+0.5} y={doorY} width={(w-5)/2} height={doorH} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <line x1={w/2-5} y1={2+dwH/2} x2={w/2+5} y2={2+dwH/2} stroke={stroke} strokeWidth={1.5} />
            <circle cx={w/2-3} cy={doorY+doorH/2} r={1.5} fill={stroke} />
            <circle cx={w/2+3.5} cy={doorY+doorH/2} r={1.5} fill={stroke} />
          </svg>
        )
      }
      case '3dw': {
        const dh = (h-4-4)/3
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={2} y={2+i*(dh+2)} width={w-4} height={dh} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
                <line x1={w/2-4} y1={2+i*(dh+2)+dh/2} x2={w/2+4} y2={2+i*(dh+2)+dh/2} stroke={stroke} strokeWidth={1.5} />
              </g>
            ))}
          </svg>
        )
      }
      case '4dw': {
        const dh = (h-4-6)/4
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {[0,1,2,3].map(i => (
              <g key={i}>
                <rect x={2} y={2+i*(dh+2)} width={w-4} height={dh} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
                <line x1={w/2-4} y1={2+i*(dh+2)+dh/2} x2={w/2+4} y2={2+i*(dh+2)+dh/2} stroke={stroke} strokeWidth={1.5} />
              </g>
            ))}
          </svg>
        )
      }
      case 'combo': {
        const mid = h / 2
        const dh = (mid - 4 - 4) / 3
        return (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {/* Top: 2 doors */}
            <rect x={2} y={2} width={(w-5)/2} height={mid-3} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <rect x={w/2+0.5} y={2} width={(w-5)/2} height={mid-3} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
            <circle cx={w/2-3} cy={mid/2} r={1.2} fill={stroke} />
            <circle cx={w/2+3.5} cy={mid/2} r={1.2} fill={stroke} />
            {/* Divider line */}
            <line x1={2} y1={mid} x2={w-2} y2={mid} stroke={stroke} strokeWidth={1.5} />
            {/* Bottom: 3 drawers */}
            {[0,1,2].map(i => (
              <g key={i}>
                <rect x={2} y={mid+2+i*(dh+2)} width={w-4} height={dh} rx={1} stroke={stroke} fill={fill} strokeWidth={sw} />
                <line x1={w/2-3} y1={mid+2+i*(dh+2)+dh/2} x2={w/2+3} y2={mid+2+i*(dh+2)+dh/2} stroke={stroke} strokeWidth={1} />
              </g>
            ))}
          </svg>
        )
      }
      default:
        return <span>?</span>
    }
  }

  const cabinetCount = Object.keys(cabinets).length
  const [tipDismissed, setTipDismissed] = useState(false)
  const showTip = cabinetCount === 0 && !tipDismissed

  // Auto-dismiss once a cabinet is placed
  useEffect(() => {
    if (cabinetCount > 0) setTipDismissed(true)
  }, [cabinetCount])

  return (
    <div>
      {showTip && (
        <div style={{
          position: 'relative',
          background: 'var(--accent)',
          color: '#051732',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.4,
          padding: '10px 28px 10px 12px',
          borderRadius: 6,
          marginBottom: 10,
        }}>
          Choose a cabinet type and style, then drag it into the 3D workspace to start building.
          <button
            onClick={() => setTipDismissed(true)}
            style={{
              position: 'absolute',
              top: 4,
              right: 6,
              background: 'none',
              border: 'none',
              color: '#051732',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '2px 4px',
            }}
          >
            &times;
          </button>
          {/* Arrow pointing down at the style grid */}
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: 20,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid var(--accent)',
          }} />
        </div>
      )}
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
                  isCustomSize: customMode,
                },
              }))
            }}
            style={{ cursor: 'grab', touchAction: 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
              <CabinetIcon styleId={s.id} />
            </div>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>
        Click to select style · Drag into 3D view to place
      </div>

      {!customMode && (
        <>
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
        </>
      )}

      {customMode && (
        <>
          <div className="size-label">Width (in)</div>
          <input
            type="number"
            value={selectedWidth}
            min={customSizeConstraints.width.min}
            max={customSizeConstraints.width.max}
            step={1}
            onChange={(e) => setSelectedWidth(clampCustom('width', parseFloat(e.target.value)))}
          />
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {customSizeConstraints.width.min}–{customSizeConstraints.width.max} in
          </div>

          <div className="size-label">Height (in)</div>
          <input
            type="number"
            value={selectedHeight}
            min={customSizeConstraints.height.min}
            max={customSizeConstraints.height.max}
            step={1}
            onChange={(e) => setSelectedHeight(clampCustom('height', parseFloat(e.target.value)))}
          />
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {customSizeConstraints.height.min}–{customSizeConstraints.height.max} in
          </div>

          <div className="size-label">Depth (in)</div>
          <input
            type="number"
            value={selectedDepth}
            min={customSizeConstraints.depth.min}
            max={customSizeConstraints.depth.max}
            step={1}
            onChange={(e) => setSelectedDepth(clampCustom('depth', parseFloat(e.target.value)))}
          />
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {customSizeConstraints.depth.min}–{customSizeConstraints.depth.max} in
          </div>
        </>
      )}

      {!customMode && sizes.heights.length > 1 && (
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

      {!customMode && sizes.depths.length > 1 && (
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

      <button
        className={`size-btn ${customMode ? 'active' : ''}`}
        style={{ width: '100%', marginTop: 8, marginBottom: 8 }}
        onClick={() => setCustomMode(m => !m)}
        title={customMode ? 'Return to preset dimensions' : 'Enter custom width, height, and depth'}
      >
        {customMode ? '\u2190 Use Preset Dimensions' : 'Use Custom Dimensions\u2026'}
      </button>

      <button className="add-btn" onClick={handleAdd}>
        + Add {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Cabinet
      </button>
    </div>
  )
}
