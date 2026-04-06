import { useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { cabinetPresets } from '../../catalog/presets'
import { getYPosition } from '../../systems/placement'
import { checkCollision } from '../../systems/collision'

export function PresetPanel() {
  const addCabinet = useStore((s) => s.addCabinet)
  const addCountertop = useStore((s) => s.addCountertop)
  const wall = useStore((s) => s.wall)
  const cabinets = useStore((s) => s.cabinets)

  const handlePlace = useCallback((presetId: string) => {
    const preset = cabinetPresets.find(p => p.id === presetId)
    if (!preset) return

    const existing = Object.values(cabinets)

    // Separate into rows by Y position for layout
    const floorCabs = preset.cabinets.filter(c => c.type === 'base' || c.type === 'pantry')
    const wallCabs = preset.cabinets.filter(c => c.type === 'upper')

    // Compute total width per row
    const floorWidth = floorCabs.reduce((sum, c) => sum + c.width, 0)
    const wallWidth = wallCabs.reduce((sum, c) => sum + c.width, 0)
    const totalWidth = Math.max(floorWidth, wallWidth)

    if (totalWidth > wall.width) return

    // Find starting X that avoids collisions
    let startX: number | null = null
    for (let x = 0; x <= wall.width - totalWidth; x += 1) {
      let fits = true

      // Check floor layer
      let cx = x
      for (const cab of floorCabs) {
        const y = getYPosition(cab.type, cab.toeKick)
        if (checkCollision({ x: cx, width: cab.width, type: cab.type, height: cab.height, y }, existing)) {
          fits = false
          break
        }
        cx += cab.width
      }

      // Check wall layer — place between pantries if present
      if (fits) {
        const positions = getUpperPositions(floorCabs, wallCabs, x, floorWidth, wallWidth)
        for (let i = 0; i < wallCabs.length; i++) {
          const cab = wallCabs[i]
          const y = getYPosition(cab.type, cab.toeKick)
          if (checkCollision({ x: positions[i], width: cab.width, type: cab.type, height: cab.height, y }, existing)) {
            fits = false
            break
          }
        }
      }

      if (fits) {
        startX = x
        break
      }
    }

    if (startX === null) return

    // Place floor cabinets left-to-right, track base IDs for countertop
    const baseIds: string[] = []
    let cx = startX
    for (const cab of floorCabs) {
      const y = getYPosition(cab.type, cab.toeKick)
      const id = addCabinet({
        type: cab.type,
        style: cab.style,
        width: cab.width,
        height: cab.height,
        depth: cab.depth,
        isCustomSize: false,
        faceColor: cab.faceColor,
        boxColor: cab.boxColor,
        position: { x: cx, y },
        appliedEndLeft: cab.appliedEndLeft,
        appliedEndRight: cab.appliedEndRight,
        appliedEndBottom: cab.appliedEndBottom,
        handleSide: cab.handleSide,
        toeKick: cab.toeKick,
      })
      if (cab.type === 'base') baseIds.push(id)
      cx += cab.width
    }

    // Place uppers — positioned between pantries or centered over bases
    const upperPositions = getUpperPositions(floorCabs, wallCabs, startX, floorWidth, wallWidth)
    for (let i = 0; i < wallCabs.length; i++) {
      const cab = wallCabs[i]
      const y = getYPosition(cab.type, cab.toeKick)
      addCabinet({
        type: cab.type,
        style: cab.style,
        width: cab.width,
        height: cab.height,
        depth: cab.depth,
        isCustomSize: false,
        faceColor: cab.faceColor,
        boxColor: cab.boxColor,
        position: { x: upperPositions[i], y },
        appliedEndLeft: cab.appliedEndLeft,
        appliedEndRight: cab.appliedEndRight,
        appliedEndBottom: cab.appliedEndBottom,
        handleSide: cab.handleSide,
        toeKick: cab.toeKick,
      })
    }

    // Add countertop over base cabinets if preset calls for it
    if (preset.addCountertop && baseIds.length > 0) {
      addCountertop(baseIds)
    }
  }, [addCabinet, addCountertop, wall, cabinets])

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cabinetPresets.map(preset => (
          <button
            key={preset.id}
            className="style-tile"
            style={{ textAlign: 'left', padding: '8px 10px' }}
            onClick={() => handlePlace(preset.id)}
          >
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{preset.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{preset.description}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {preset.cabinets.length} cabinets · {preset.cabinets.reduce((s, c) => s + c.width, 0)}" total
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Compute X positions for upper cabinets.
 * If pantries bookend the floor row, uppers go between them.
 * Otherwise, uppers are centered over the floor row.
 */
function getUpperPositions(
  floorCabs: { type: string; width: number }[],
  wallCabs: { width: number }[],
  startX: number,
  floorWidth: number,
  wallWidth: number,
): number[] {
  // Check if pantries bookend the floor row
  const firstIsPantry = floorCabs.length > 0 && floorCabs[0].type === 'pantry'
  const lastIsPantry = floorCabs.length > 0 && floorCabs[floorCabs.length - 1].type === 'pantry'

  let upperStartX: number
  if (firstIsPantry && lastIsPantry && floorCabs.length >= 2) {
    // Place uppers between the two pantries
    const leftPantryWidth = floorCabs[0].width
    const rightPantryWidth = floorCabs[floorCabs.length - 1].width
    const gapWidth = floorWidth - leftPantryWidth - rightPantryWidth
    const gapStart = startX + leftPantryWidth
    // Center uppers within the gap
    upperStartX = gapStart + (gapWidth - wallWidth) / 2
  } else if (firstIsPantry) {
    // Pantry on left only — uppers start after it
    upperStartX = startX + floorCabs[0].width
  } else if (lastIsPantry) {
    // Pantry on right only — uppers end before it
    const rightPantryWidth = floorCabs[floorCabs.length - 1].width
    upperStartX = startX + (floorWidth - rightPantryWidth - wallWidth)
  } else {
    // No pantries — center uppers over floor run
    const offset = floorWidth > 0 ? (floorWidth - wallWidth) / 2 : 0
    upperStartX = startX + offset
  }

  const positions: number[] = []
  let cx = upperStartX
  for (const cab of wallCabs) {
    positions.push(cx)
    cx += cab.width
  }
  return positions
}
