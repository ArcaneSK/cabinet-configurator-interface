import type { CabinetData, CabinetType, WallConfig } from '../types'
import { checkCollision } from './collision'

const Y_POSITIONS: Record<CabinetType, number> = {
  base: 6,   // default toe kick
  upper: 54,
  pantry: 6, // default toe kick
}

export function getYPosition(type: CabinetType, toeKick?: number): number {
  if (toeKick !== undefined && type !== 'upper') return toeKick
  return Y_POSITIONS[type]
}

export function findPlacementPosition(
  type: CabinetType,
  width: number,
  height: number,
  _depth: number,
  wall: WallConfig,
  existingCabinets: CabinetData[]
): number | null {
  const y = getYPosition(type)

  // Scan left-to-right in 1" increments looking for a gap that fits
  for (let x = 0; x <= wall.width - width; x += 1) {
    const collides = checkCollision(
      { x, width, type, height, y },
      existingCabinets
    )
    if (!collides) return x
  }

  return null // wall is full
}
