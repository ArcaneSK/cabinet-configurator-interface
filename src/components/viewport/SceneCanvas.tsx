import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { WallEnvironment } from './WallEnvironment'
import { CabinetGroup } from './CabinetGroup'
import { CountertopMesh } from './CountertopMesh'
import { DimensionLabels } from './DimensionLabels'
import { useStore } from '../../store/useStore'
import { useRef, useEffect, useCallback } from 'react'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'

function CameraPresetHandler({ controlsRef, onReady }: {
  controlsRef: React.RefObject<OrbitControlsType | null>
  onReady: (fn: (preset: 'front' | 'top' | 'orbit') => void) => void
}) {
  const { camera } = useThree()
  const wall = useStore((s) => s.wall)

  useEffect(() => {
    const cx = wall.width / 2
    const cy = wall.height / 2
    onReady((preset: 'front' | 'top' | 'orbit') => {
      const controls = controlsRef.current
      if (!controls) return
      switch (preset) {
        case 'front':
          camera.position.set(cx, cy, 150)
          controls.target.set(cx, cy, 0)
          break
        case 'top':
          camera.position.set(cx, wall.height + 100, 10)
          controls.target.set(cx, 0, 10)
          break
        case 'orbit':
          camera.position.set(cx, cy, 120)
          controls.target.set(cx, 40, 0)
          break
      }
      controls.update()
    })
  }, [camera, controlsRef, onReady, wall])

  return null
}

interface SceneCanvasProps {
  onCameraPresetReady?: (fn: (preset: 'front' | 'top' | 'orbit') => void) => void
}

export function SceneCanvas({ onCameraPresetReady }: SceneCanvasProps) {
  const controlsRef = useRef<OrbitControlsType>(null)
  const cabinets = useStore((s) => s.cabinets)
  const countertops = useStore((s) => s.countertops)

  const handleReady = useCallback((fn: (preset: 'front' | 'top' | 'orbit') => void) => {
    onCameraPresetReady?.(fn)
  }, [onCameraPresetReady])

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
      <CameraPresetHandler controlsRef={controlsRef} onReady={handleReady} />
      <WallEnvironment />

      {Object.values(cabinets).map((cab) => (
        <CabinetGroup key={cab.id} data={cab} />
      ))}

      {Object.values(countertops).map((ct) => (
        <CountertopMesh key={ct.id} data={ct} cabinets={cabinets} />
      ))}

      <DimensionLabels />

      {/* Click on empty space to deselect */}
      <mesh
        position={[96, 54, -1]}
        visible={false}
        onClick={() => useStore.getState().clearSelection()}
      >
        <planeGeometry args={[500, 500]} />
      </mesh>
    </Canvas>
  )
}
