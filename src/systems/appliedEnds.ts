import { v4 as uuid } from 'uuid'
import type { CabinetData, AppliedEndData } from '../types'
import { checkCollision } from './collision'

/**
 * Groups adjacent upper cabinets that could share a single horizontal
 * bottom applied end. Rule: type === 'upper', sorted by position.x,
 * adjacent (gap <= 1 inch), same position.y, same depth.
 */
export function findAdjacentUpperGroups(cabinets: CabinetData[]): CabinetData[][] {
  const uppers = cabinets
    .filter(c => c.type === 'upper')
    .sort((a, b) => a.position.x - b.position.x)

  if (uppers.length === 0) return []

  const groups: CabinetData[][] = [[uppers[0]]]
  for (let i = 1; i < uppers.length; i++) {
    const prev = uppers[i - 1]
    const curr = uppers[i]
    const gap = curr.position.x - (prev.position.x + prev.width)
    const sameY = curr.position.y === prev.position.y
    const sameDepth = curr.depth === prev.depth
    if (gap <= 1 && sameY && sameDepth) {
      groups[groups.length - 1].push(curr)
    } else {
      groups.push([curr])
    }
  }
  return groups
}

/**
 * Validates an applied end based on its current cabinet configuration.
 * For left/right ends: cabinets must exist and length must be 1.
 * For bottom ends: all cabinets must be uppers, same Y, same depth, contiguous (gap <= 1").
 */
export function isAppliedEndValid(
  end: AppliedEndData,
  cabinets: Record<string, CabinetData>
): boolean {
  if (end.cabinetIds.length === 0) return false

  const cabs = end.cabinetIds.map(id => cabinets[id])
  if (cabs.some(c => c === undefined)) return false

  if (end.side !== 'bottom') {
    // left/right: anchor must exist (and should be length 1)
    return cabs.length === 1
  }

  // bottom: all must be uppers, same Y, same depth, contiguous (gap <= 1")
  const sorted = [...cabs].sort((a, b) => a.position.x - b.position.x)
  const first = sorted[0]
  if (first.type !== 'upper') return false
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i]
    if (c.type !== 'upper') return false
    if (c.position.y !== first.position.y) return false
    if (c.depth !== first.depth) return false
    if (i > 0) {
      const prev = sorted[i - 1]
      const gap = c.position.x - (prev.position.x + prev.width)
      if (gap > 1) return false
    }
  }
  return true
}

/**
 * Returns an array of applied end IDs that are no longer valid
 * given the current cabinet configuration.
 */
export function getInvalidAppliedEnds(
  cabinets: Record<string, CabinetData>,
  appliedEnds: Record<string, AppliedEndData>
): string[] {
  return Object.values(appliedEnds)
    .filter(e => !isAppliedEndValid(e, cabinets))
    .map(e => e.id)
}

/**
 * Solve each axis independently and in order W -> H -> D to find the
 * largest requested dimension that does not cause a collision with any
 * other cabinet. Anchors: W grows from left edge, H grows upward, D grows
 * outward from the wall — so position stays fixed on each axis.
 *
 * If even the current value collides (shouldn't happen in a consistent
 * scene), the axis is left unchanged.
 *
 * NOTE: collision.ts currently models only X and Y, so the depth axis
 * is effectively unconstrained in practice — this is intentional.
 */
export function clampDimensionToFit(
  cabinet: CabinetData,
  nextDims: { width: number; height: number; depth: number },
  others: CabinetData[]
): { width: number; height: number; depth: number } {
  const solved = {
    width: cabinet.width,
    height: cabinet.height,
    depth: cabinet.depth,
  }
  const axes: Array<keyof typeof solved> = ['width', 'height', 'depth']

  for (const axis of axes) {
    const requested = nextDims[axis]
    const current = solved[axis]
    if (requested <= current) {
      // Shrinking — always safe.
      solved[axis] = requested
      continue
    }
    // Grow: scan down from requested to current.
    let found = current
    // 1" coarse scan
    for (let w = requested; w >= current; w -= 1) {
      const trial = { ...solved, [axis]: w }
      if (!collides(cabinet, trial, others)) {
        found = w
        break
      }
    }
    // 0.25" refinement in the last inch above `found`
    for (let w = found + 0.75; w > found && w <= requested; w -= 0.25) {
      const trial = { ...solved, [axis]: w }
      if (!collides(cabinet, trial, others)) {
        found = w
        break
      }
    }
    solved[axis] = found
  }
  return solved
}

function collides(
  cabinet: CabinetData,
  dims: { width: number; height: number; depth: number },
  others: CabinetData[]
): boolean {
  return checkCollision(
    {
      x: cabinet.position.x,
      width: dims.width,
      type: cabinet.type,
      height: dims.height,
      y: cabinet.position.y,
    },
    others,
    cabinet.id
  )
}

/**
 * Given a set of cabinet ids being removed, returns the updated appliedEnds
 * map. Length-1 ends whose anchor is gone are removed. Bottom group-ends
 * have removed cabinets stripped out; if the remaining ids are no longer
 * contiguous / matching, the end is split into maximal valid runs (each
 * new run gets a fresh id, inheriting the original finishId). Runs of
 * length 0 are dropped.
 */
export function splitAppliedEndsOnCabinetRemoval(
  removedIds: string[],
  cabinetsAfter: Record<string, CabinetData>,
  appliedEnds: Record<string, AppliedEndData>
): Record<string, AppliedEndData> {
  const removed = new Set(removedIds)
  const out: Record<string, AppliedEndData> = {}

  for (const end of Object.values(appliedEnds)) {
    const remaining = end.cabinetIds.filter(id => !removed.has(id))
    if (remaining.length === 0) continue

    if (end.side !== 'bottom') {
      // Left/right — length must be 1 and the cabinet must still exist.
      if (remaining.length === 1 && cabinetsAfter[remaining[0]]) {
        out[end.id] = { ...end, cabinetIds: remaining }
      }
      continue
    }

    // Bottom: walk the remaining cabinets in x order, cut into maximal
    // contiguous matching runs using the same rules as findAdjacentUpperGroups.
    const cabs = remaining
      .map(id => cabinetsAfter[id])
      .filter((c): c is CabinetData => c !== undefined)
      .sort((a, b) => a.position.x - b.position.x)
    if (cabs.length === 0) continue

    const runs: CabinetData[][] = [[cabs[0]]]
    for (let i = 1; i < cabs.length; i++) {
      const prev = cabs[i - 1]
      const curr = cabs[i]
      const gap = curr.position.x - (prev.position.x + prev.width)
      const sameY = curr.position.y === prev.position.y
      const sameDepth = curr.depth === prev.depth
      if (gap <= 1 && sameY && sameDepth) {
        runs[runs.length - 1].push(curr)
      } else {
        runs.push([curr])
      }
    }

    // Emit one AppliedEndData per run. First run keeps the original id
    // to give consumers a stable reference when only a trim happened.
    runs.forEach((run, idx) => {
      const id = idx === 0 ? end.id : uuid()
      out[id] = { id, side: 'bottom', finishId: end.finishId, cabinetIds: run.map(c => c.id) }
    })
  }

  return out
}
