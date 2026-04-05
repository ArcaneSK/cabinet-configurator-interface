import { getFinish } from '../../catalog/finishes'

const T = 0.75
const OFFSET = 0.01

interface AppliedEndProps {
  side: 'left' | 'right'
  height: number
  depth: number
  finishId: string
}

export function AppliedEnd({ side, height, depth, finishId }: AppliedEndProps) {
  const finish = getFinish(finishId)

  return (
    <mesh
      position={[
        side === 'left' ? -(T / 2 + OFFSET) : -1,
        height / 2,
        depth / 2,
      ]}
      castShadow
    >
      <boxGeometry args={[T, height, depth]} />
      <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
    </mesh>
  )
}
