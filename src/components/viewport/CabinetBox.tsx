import { Edges } from '@react-three/drei'
import { getFinish } from '../../catalog/finishes'
import { CabinetMaterial } from './CabinetMaterial'

const T = 0.75 // panel thickness in inches

interface CabinetBoxProps {
  width: number
  height: number
  depth: number
  boxColor: string
  shelfY?: number
  toeKick?: number
}

export function CabinetBox({ width, height, depth, boxColor, shelfY }: CabinetBoxProps) {
  const finish = getFinish(boxColor)
  const innerW = width - 2 * T
  const innerD = depth - T
  const actualShelfY = shelfY ?? height / 2

  return (
    <group>
      {/* Left side */}
      <mesh position={[T / 2, height / 2, depth / 2]} castShadow>
        <boxGeometry args={[T, height, depth]} />
        <CabinetMaterial finish={finish} />
      </mesh>

      {/* Right side */}
      <mesh position={[width - T / 2, height / 2, depth / 2]} castShadow>
        <boxGeometry args={[T, height, depth]} />
        <CabinetMaterial finish={finish} />
      </mesh>

      {/* Top */}
      <mesh position={[width / 2, height - T / 2, depth / 2]} castShadow>
        <boxGeometry args={[innerW, T, depth]} />
        <CabinetMaterial finish={finish} />
      </mesh>

      {/* Bottom */}
      <mesh position={[width / 2, T / 2, depth / 2]} castShadow>
        <boxGeometry args={[innerW, T, depth]} />
        <CabinetMaterial finish={finish} />
      </mesh>

      {/* Back panel */}
      <mesh position={[width / 2, height / 2, T / 2]}>
        <boxGeometry args={[innerW, height - 2 * T, T]} />
        <CabinetMaterial finish={finish} />
      </mesh>

      {/* Shelf */}
      <mesh position={[width / 2, actualShelfY, depth / 2 + T / 2]}>
        <boxGeometry args={[innerW, T, innerD]} />
        <CabinetMaterial finish={finish} />
      </mesh>

      {/* Subtle outline for visibility */}
      <mesh position={[width / 2, height / 2, depth / 2]}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial visible={false} />
        <Edges threshold={15} color="#999" />
      </mesh>

      {/* Toe kick is open — cabinet floats at position.y with no geometry below */}
    </group>
  )
}
