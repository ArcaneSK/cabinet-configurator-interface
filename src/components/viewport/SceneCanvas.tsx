import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { WallEnvironment } from './WallEnvironment'
import { useRef } from 'react'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'

export function SceneCanvas() {
  const controlsRef = useRef<OrbitControlsType>(null)

  return (
    <Canvas
      camera={{ position: [96, 54, 120], fov: 45, near: 0.1, far: 2000 }}
      style={{ background: 'linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)' }}
      shadows
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[100, 100, 80]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Environment preset="studio" />
      <OrbitControls
        ref={controlsRef}
        target={[96, 40, 0]}
        enableDamping
        dampingFactor={0.1}
        minDistance={20}
        maxDistance={400}
      />
      <WallEnvironment />
    </Canvas>
  )
}
