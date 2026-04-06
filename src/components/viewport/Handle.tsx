const BAR_LENGTH = 15
const BAR_RADIUS = 0.1875
const POST_HEIGHT = 0.5
const POST_RADIUS = 0.125

interface HandleProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

export function Handle({ position, rotation = [0, 0, 0] }: HandleProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Bar */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, POST_HEIGHT]}>
        <cylinderGeometry args={[BAR_RADIUS, BAR_RADIUS, BAR_LENGTH, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.5} />
      </mesh>

      {/* Left post */}
      <mesh position={[-BAR_LENGTH / 2 + 1, 0, POST_HEIGHT / 2]}>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, POST_HEIGHT, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.5} />
      </mesh>

      {/* Right post */}
      <mesh position={[BAR_LENGTH / 2 - 1, 0, POST_HEIGHT / 2]}>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, POST_HEIGHT, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.5} />
      </mesh>
    </group>
  )
}
