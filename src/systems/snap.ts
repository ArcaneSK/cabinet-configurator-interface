import type { CabinetData, SnapSettings } from '../types'

const ADJACENT_THRESHOLD = 2 // inches

/**
 * Canonical bottom Y for the first upper on an empty wall — matches
 * Y_POSITIONS.upper in placement.ts and gives the Y snap a sensible
 * anchor when no other uppers exist yet.
 */
export const DEFAULT_UPPER_BOTTOM = 54

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

/**
 * Vertical snap for upper cabinets. Snap targets (all subject to the
 * same ADJACENT_THRESHOLD as the X snap):
 *   - Any other upper's bottom edge  -> dragged bottom aligns
 *   - Any other upper's top edge     -> dragged bottom lands on their top (stacking)
 *   - Any other upper's bottom edge  -> dragged top lands on their bottom (stacking below)
 *   - Any other upper's top edge     -> dragged top aligns
 *   - DEFAULT_UPPER_BOTTOM (54")     -> dragged bottom aligns with the canonical upper line
 *
 * Only uppers participate as snap sources/targets — bases and pantries
 * live in the floor layer and would otherwise pull the dragged upper
 * into awkward positions.
 */
export function applyVerticalSnap(
  y: number,
  cabinetHeight: number,
  allCabinets: CabinetData[],
  draggedId: string,
  settings: SnapSettings
): number {
  if (!settings.adjacent) return y

  const bottomEdge = y
  const topEdge = y + cabinetHeight
  const others = allCabinets.filter(c => c.id !== draggedId && c.type === 'upper')

  for (const other of others) {
    const otherBottom = other.position.y
    const otherTop = other.position.y + other.height

    // Bottom-to-bottom (undersides aligned — horizontal AE groups)
    if (Math.abs(bottomEdge - otherBottom) < ADJACENT_THRESHOLD) {
      return otherBottom
    }
    // Top-to-top (crown line)
    if (Math.abs(topEdge - otherTop) < ADJACENT_THRESHOLD) {
      return otherTop - cabinetHeight
    }
    // Bottom-of-dragged on top-of-other (stacking above)
    if (Math.abs(bottomEdge - otherTop) < ADJACENT_THRESHOLD) {
      return otherTop
    }
    // Top-of-dragged on bottom-of-other (stacking below)
    if (Math.abs(topEdge - otherBottom) < ADJACENT_THRESHOLD) {
      return otherBottom - cabinetHeight
    }
  }

  // Fallback: canonical upper bottom line (54") — gives a sensible
  // anchor for the first upper on an empty wall.
  if (Math.abs(bottomEdge - DEFAULT_UPPER_BOTTOM) < ADJACENT_THRESHOLD) {
    return DEFAULT_UPPER_BOTTOM
  }

  return y
}

export function clampToWall(x: number, cabinetWidth: number, wallWidth: number): number {
  return Math.max(0, Math.min(x, wallWidth - cabinetWidth))
}
