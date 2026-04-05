import { useStore } from '../../store/useStore'
import { Grid } from '@react-three/drei'

export function WallEnvironment() {
  const wall = useStore((s) => s.wall)
  const halfW = wall.width / 2
  const halfH = wall.height / 2

  return (
    <group>
      {/* Wall plane */}
      <mesh position={[halfW, halfH, -0.5]} receiveShadow>
        <planeGeometry args={[wall.width, wall.height]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
      </mesh>

      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[halfW, -0.1, wall.width * 0.3]} receiveShadow>
        <planeGeometry args={[wall.width * 1.5, wall.width * 0.8]} />
        <meshStandardMaterial color="#cccccc" roughness={0.95} />
      </mesh>

      {/* Grid overlay on wall */}
      <Grid
        position={[halfW, halfH, -0.4]}
        args={[wall.width, wall.height]}
        cellSize={6}
        cellThickness={0.3}
        cellColor="#ccc"
        sectionSize={12}
        sectionThickness={0.6}
        sectionColor="#aaa"
        fadeDistance={400}
        fadeStrength={1}
      />

      {/* Wall boundary lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={8}
            array={new Float32Array([
              0, 0, 0, wall.width, 0, 0,
              wall.width, 0, 0, wall.width, wall.height, 0,
              wall.width, wall.height, 0, 0, wall.height, 0,
              0, wall.height, 0, 0, 0, 0,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666" linewidth={1} />
      </lineSegments>
    </group>
  )
}
