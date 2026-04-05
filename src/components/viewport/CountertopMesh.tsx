import type { CountertopData, CabinetData } from '../../types'

const T = 0.75

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
  const baseHeight = leftmost.height
  const x = leftmost.position.x - data.overhang.sides
  const y = baseHeight
  const z = -data.overhang.front

  const totalCabinetWidth = sortedCabinets.reduce((sum, c) => sum + c.width, 0)
  const ctWidth = totalCabinetWidth + 2 * data.overhang.sides
  const ctDepth = data.depth

  return (
    <mesh position={[x + ctWidth / 2, y + T / 2, z + ctDepth / 2]} castShadow>
      <boxGeometry args={[ctWidth, T, ctDepth]} />
      <meshStandardMaterial color="#222222" roughness={0.3} metalness={0.1} />
    </mesh>
  )
}
