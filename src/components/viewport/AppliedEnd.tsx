import { getFinish } from '../../catalog/finishes'
import { useStore } from '../../store/useStore'
import type { AppliedEndSide } from '../../types'

const T = 0.75
const OFFSET = 0.01

interface AppliedEndProps {
  side: AppliedEndSide
  cabinetIds: string[]
  finishId: string
}

export function AppliedEnd({ side, cabinetIds, finishId }: AppliedEndProps) {
  const cabinets = useStore((s) => s.cabinets)
  const finish = getFinish(finishId)

  const cabs = cabinetIds.map(id => cabinets[id]).filter(Boolean)
  if (cabs.length === 0) return null

  if (side === 'left' || side === 'right') {
    const cab = cabs[0]
    const x = side === 'left'
      ? cab.position.x - (T / 2 + OFFSET)
      : cab.position.x + cab.width + (T / 2 + OFFSET)
    const y = cab.position.y + cab.height / 2
    const z = cab.depth / 2
    return (
      <mesh position={[x, y, z]} castShadow>
        <boxGeometry args={[T, cab.height, cab.depth]} />
        <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
      </mesh>
    )
  }

  // bottom: spans the group
  const sorted = [...cabs].sort((a, b) => a.position.x - b.position.x)
  const first = sorted[0]
  const totalWidth = sorted.reduce((sum, c) => sum + c.width, 0)
  const x = first.position.x + totalWidth / 2
  const y = first.position.y - T / 2 - OFFSET
  const z = first.depth / 2
  return (
    <mesh position={[x, y, z]} castShadow>
      <boxGeometry args={[totalWidth, T, first.depth]} />
      <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
    </mesh>
  )
}
