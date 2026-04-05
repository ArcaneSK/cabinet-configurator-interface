import { getFinish } from '../../catalog/finishes'
import { Handle } from './Handle'

const T = 0.75
const REVEAL = 1 / 16

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
  const openingW = width - 2 * T - 2 * REVEAL
  const doorH = doorZoneTop - doorZoneBottom - 2 * REVEAL
  const doorCenterY = (doorZoneTop + doorZoneBottom) / 2
  const doorZ = depth + T / 2

  if (doorCount === 1) {
    const doorW = openingW
    const handleX = handleSide === 'left'
      ? T + REVEAL + 2
      : width - T - REVEAL - 2
    return (
      <group>
        <mesh position={[width / 2, doorCenterY, doorZ]} castShadow>
          <boxGeometry args={[doorW, doorH, T]} />
          <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
        </mesh>
        <Handle position={[handleX, doorCenterY, depth + T]} />
      </group>
    )
  }

  // Double door
  const doorW = (openingW - REVEAL) / 2
  const leftCenterX = T + REVEAL + doorW / 2
  const rightCenterX = width - T - REVEAL - doorW / 2

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
