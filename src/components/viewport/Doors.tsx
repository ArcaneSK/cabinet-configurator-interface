import { getFinish } from '../../catalog/finishes'
import { CabinetMaterial } from './CabinetMaterial'
import { Handle } from './Handle'

const T = 0.75
const REVEAL = 3 / 8 // 3/8" gap on each side = 3/4" total reveal per door

interface DoorsProps {
  doorCount: 1 | 2
  width: number
  doorZoneTop: number
  doorZoneBottom: number
  depth: number
  faceColor: string
  handleSide: 'left' | 'right'
}

export function Doors({ doorCount, width, doorZoneTop, doorZoneBottom, depth, faceColor, handleSide }: DoorsProps) {
  const finish = getFinish(faceColor)
  // Full overlay: doors cover the face frame, with REVEAL gap on each outer edge
  const openingW = width - 2 * REVEAL
  const doorH = doorZoneTop - doorZoneBottom - 2 * REVEAL
  const doorCenterY = (doorZoneTop + doorZoneBottom) / 2
  const doorZ = depth + T / 2

  if (doorCount === 1) {
    const doorW = openingW
    const handleX = handleSide === 'left'
      ? REVEAL + 2
      : width - REVEAL - 2
    return (
      <group>
        <mesh position={[width / 2, doorCenterY, doorZ]} castShadow>
          <boxGeometry args={[doorW, doorH, T]} />
          <CabinetMaterial finish={finish} />
        </mesh>
        <Handle position={[handleX, doorCenterY, depth + T]} />
      </group>
    )
  }

  // Double door — REVEAL gap between the two doors as well
  const doorW = (openingW - REVEAL) / 2
  const leftCenterX = REVEAL + doorW / 2
  const rightCenterX = width - REVEAL - doorW / 2

  return (
    <group>
      <mesh position={[leftCenterX, doorCenterY, doorZ]} castShadow>
        <boxGeometry args={[doorW, doorH, T]} />
        <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
      </mesh>
      <mesh position={[rightCenterX, doorCenterY, doorZ]} castShadow>
        <boxGeometry args={[doorW, doorH, T]} />
        <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
      </mesh>
      <Handle position={[leftCenterX + doorW / 2 - 2, doorCenterY, depth + T]} />
      <Handle position={[rightCenterX - doorW / 2 + 2, doorCenterY, depth + T]} />
    </group>
  )
}
