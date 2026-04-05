import type { CabinetData } from '../types'

type CollisionLayer = 'floor' | 'wall'

function getCollisionLayer(type: CabinetData['type']): CollisionLayer[] {
  switch (type) {
    case 'base': return ['floor']
    case 'upper': return ['wall']
    case 'pantry': return ['floor', 'wall'] // pantries span both
  }
}

function layersOverlap(a: CollisionLayer[], b: CollisionLayer[]): boolean {
  return a.some(layer => b.includes(layer))
}

export function checkCollision(
  candidate: { x: number; width: number; type: CabinetData['type']; height: number; y: number },
  others: CabinetData[],
  excludeId?: string
): boolean {
  const candidateLayers = getCollisionLayer(candidate.type)

  for (const other of others) {
    if (other.id === excludeId) continue

    const otherLayers = getCollisionLayer(other.type)
    if (!layersOverlap(candidateLayers, otherLayers)) continue

    // AABB overlap on X axis
    const xOverlap =
      candidate.x < other.position.x + other.width &&
      candidate.x + candidate.width > other.position.x

    if (!xOverlap) continue

    // Check vertical overlap
    const candTop = candidate.y + candidate.height
    const otherTop = other.position.y + other.height
    const yOverlap = candidate.y < otherTop && candTop > other.position.y

    if (yOverlap) return true
  }

  return false
}
