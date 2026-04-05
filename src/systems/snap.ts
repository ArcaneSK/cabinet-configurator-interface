import type { CabinetData, SnapSettings } from '../types'

const ADJACENT_THRESHOLD = 2 // inches

export function applySnap(
  x: number,
  cabinetWidth: number,
  allCabinets: CabinetData[],
  draggedId: string,
  settings: SnapSettings
): number {
  let snapped = x

  // Adjacent snap takes priority
  if (settings.adjacent) {
    const others = allCabinets.filter(c => c.id !== draggedId)
    const leftEdge = x
    const rightEdge = x + cabinetWidth

    for (const other of others) {
      const otherLeft = other.position.x
      const otherRight = other.position.x + other.width

      // Snap our left edge to their right edge
      if (Math.abs(leftEdge - otherRight) < ADJACENT_THRESHOLD) {
        return otherRight
      }
      // Snap our right edge to their left edge
      if (Math.abs(rightEdge - otherLeft) < ADJACENT_THRESHOLD) {
        return otherLeft - cabinetWidth
      }
    }
  }

  // Grid snap
  if (settings.grid) {
    snapped = Math.round(x / settings.gridSize) * settings.gridSize
  }

  return snapped
}

export function clampToWall(x: number, cabinetWidth: number, wallWidth: number): number {
  return Math.max(0, Math.min(x, wallWidth - cabinetWidth))
}
