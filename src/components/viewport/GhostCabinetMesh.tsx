interface GhostCabinetMeshProps {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  isColliding: boolean
}

export function GhostCabinetMesh({ position, width, height, depth, isColliding }: GhostCabinetMeshProps) {
  return (
    <mesh position={[position[0] + width / 2, position[1] + height / 2, position[2] + depth / 2]}>
      <boxGeometry args={[width, height, depth]} />
      <meshBasicMaterial
        color={isColliding ? '#ff4444' : '#4488ff'}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  )
}
