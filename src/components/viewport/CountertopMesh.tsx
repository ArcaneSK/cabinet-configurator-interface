import type { CountertopData, CabinetData } from '../../types'
import { getFinish } from '../../catalog/finishes'

const T = 0.75
const ADJACENCY_TOLERANCE = 1 // within 1" counts as adjacent

interface CountertopMeshProps {
  data: CountertopData
  cabinets: Record<string, CabinetData>
}

export function CountertopMesh({ data, cabinets }: CountertopMeshProps) {
  const sortedCabinets = data.cabinetIds
    .map(id => cabinets[id])
    .filter(Boolean)
    .sort((a, b) => a.position.x - b.position.x)

  if (sortedCabinets.length === 0) return null

  const leftmost = sortedCabinets[0]
  const rightmost = sortedCabinets[sortedCabinets.length - 1]
  const leftEdge = leftmost.position.x
  const rightEdge = rightmost.position.x + rightmost.width

  // Check if a pantry is adjacent on either side
  const allCabinets = Object.values(cabinets)
  const pantryOnLeft = allCabinets.some(c =>
    c.type === 'pantry' &&
    Math.abs(c.position.x + c.width - leftEdge) < ADJACENCY_TOLERANCE
  )
  const pantryOnRight = allCabinets.some(c =>
    c.type === 'pantry' &&
    Math.abs(c.position.x - rightEdge) < ADJACENCY_TOLERANCE
  )

  const overhangLeft = pantryOnLeft ? 0 : data.overhang.sides
  const overhangRight = pantryOnRight ? 0 : data.overhang.sides

  const cabinetDepth = leftmost.depth
  const x = leftEdge - overhangLeft
  const y = leftmost.position.y + leftmost.height
  const z = 0 // flush to wall

  const totalCabinetWidth = sortedCabinets.reduce((sum, c) => sum + c.width, 0)
  const ctWidth = totalCabinetWidth + overhangLeft + overhangRight
  const ctDepth = cabinetDepth + data.overhang.front // flush back + overhang front

  return (
    <mesh position={[x + ctWidth / 2, y + T / 2, z + ctDepth / 2]} castShadow>
      <boxGeometry args={[ctWidth, T, ctDepth]} />
      <meshStandardMaterial color={getFinish(data.color).hex} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}
