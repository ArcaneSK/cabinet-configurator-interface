import { getFinish } from '../../catalog/finishes'

const T = 0.75 // panel thickness in inches

interface CabinetBoxProps {
  width: number
  height: number
  depth: number
  boxColor: string
  shelfY?: number
}

export function CabinetBox({ width, height, depth, boxColor, shelfY }: CabinetBoxProps) {
  const finish = getFinish(boxColor)
  const innerW = width - 2 * T
  const innerD = depth - T
  const actualShelfY = shelfY ?? height / 2
  const color = finish.hex

  return (
    <group>
      {/* Left side */}
      <mesh position={[T / 2, height / 2, depth / 2]} castShadow>
        <boxGeometry args={[T, height, depth]} />
        <meshStandardMaterial color={color} roughness={finish.roughness} />
      </mesh>

      {/* Right side */}
      <mesh position={[width - T / 2, height / 2, depth / 2]} castShadow>
        <boxGeometry args={[T, height, depth]} />
        <meshStandardMaterial color={color} roughness={finish.roughness} />
      </mesh>

      {/* Top */}
      <mesh position={[width / 2, height - T / 2, depth / 2]} castShadow>
        <boxGeometry args={[innerW, T, depth]} />
        <meshStandardMaterial color={color} roughness={finish.roughness} />
      </mesh>

      {/* Bottom */}
      <mesh position={[width / 2, T / 2, depth / 2]} castShadow>
        <boxGeometry args={[innerW, T, depth]} />
        <meshStandardMaterial color={color} roughness={finish.roughness} />
      </mesh>

      {/* Back panel */}
      <mesh position={[width / 2, height / 2, T / 2]}>
        <boxGeometry args={[innerW, height - 2 * T, T]} />
        <meshStandardMaterial color={color} roughness={finish.roughness} />
      </mesh>

      {/* Shelf */}
      <mesh position={[width / 2, actualShelfY, depth / 2 + T / 2]}>
        <boxGeometry args={[innerW, T, innerD]} />
        <meshStandardMaterial color={color} roughness={finish.roughness} />
      </mesh>
    </group>
  )
}
