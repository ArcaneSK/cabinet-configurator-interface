interface TranslateGizmoProps {
  width: number
  height: number
  depth: number
}

export function TranslateGizmo({ width, height: _height, depth }: TranslateGizmoProps) {
  const originY = 0.5
  const arrowLength = Math.min(width * 0.6, 12)

  return (
    <group position={[0, originY, depth / 2]}>
      {/* X axis (red) */}
      <mesh position={[arrowLength / 2, 0, 0]}>
        <boxGeometry args={[arrowLength, 0.4, 0.4]} />
        <meshBasicMaterial color="#e94560" />
      </mesh>
      <mesh position={[arrowLength + 0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshBasicMaterial color="#e94560" />
      </mesh>

      {/* Z axis (blue) */}
      <mesh position={[0, 0, arrowLength / 2]}>
        <boxGeometry args={[0.4, 0.4, arrowLength]} />
        <meshBasicMaterial color="#4488ff" />
      </mesh>
      <mesh position={[0, 0, arrowLength + 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshBasicMaterial color="#4488ff" />
      </mesh>
    </group>
  )
}
