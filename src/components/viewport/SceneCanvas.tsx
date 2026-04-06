import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { WallEnvironment } from './WallEnvironment'
import { CabinetGroup } from './CabinetGroup'
import { CountertopMesh } from './CountertopMesh'
import { DimensionLabels } from './DimensionLabels'
import { GhostOverlay } from './GhostOverlay'
import { useStore } from '../../store/useStore'
import { Suspense, useRef, useEffect, useCallback } from 'react'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'
import * as THREE from 'three'

function CameraExposer({ onCamera }: { onCamera: (cam: THREE.Camera) => void }) {
  const { camera } = useThree()
  useEffect(() => { onCamera(camera) }, [camera, onCamera])
  return null
}

function CameraControlsManager({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsType | null> }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && controlsRef.current) {
        controlsRef.current.mouseButtons.RIGHT = THREE.MOUSE.PAN
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && controlsRef.current) {
        controlsRef.current.mouseButtons.RIGHT = THREE.MOUSE.ROTATE
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [controlsRef])

  return null
}

function CameraPresetHandler({ controlsRef, onReady }: {
  controlsRef: React.RefObject<OrbitControlsType | null>
  onReady: (fn: (preset: 'front' | 'top' | 'orbit' | 'recenter') => void) => void
}) {
  const { camera } = useThree()
  const wall = useStore((s) => s.wall)

  useEffect(() => {
    const cx = wall.width / 2
    const cy = wall.height / 2
    onReady((preset: 'front' | 'top' | 'orbit' | 'recenter') => {
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
        case 'recenter': {
          const cabs = Object.values(useStore.getState().cabinets)
          if (cabs.length === 0) {
            // No cabinets — fall back to wall center
            camera.position.set(cx, cy, 150)
            controls.target.set(cx, cy, 0)
          } else {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
            for (const c of cabs) {
              minX = Math.min(minX, c.position.x)
              maxX = Math.max(maxX, c.position.x + c.width)
              minY = Math.min(minY, c.position.y)
              maxY = Math.max(maxY, c.position.y + c.height)
            }
            const centerX = (minX + maxX) / 2
            const centerY = (minY + maxY) / 2
            const span = Math.max(maxX - minX, maxY - minY)
            const dist = span * 1.4 + 30
            camera.position.set(centerX, centerY, dist)
            controls.target.set(centerX, centerY, 0)
          }
          break
        }
      }
      controls.update()
    })
  }, [camera, controlsRef, onReady, wall])

  return null
}

interface SceneCanvasProps {
  onCameraPresetReady?: (fn: (preset: 'front' | 'top' | 'orbit' | 'recenter') => void) => void
  onCameraRef?: (camera: THREE.Camera) => void
}

export function SceneCanvas({ onCameraPresetReady, onCameraRef }: SceneCanvasProps) {
  const controlsRef = useRef<OrbitControlsType>(null)
  const cabinets = useStore((s) => s.cabinets)
  const countertops = useStore((s) => s.countertops)

  const handleReady = useCallback((fn: (preset: 'front' | 'top' | 'orbit' | 'recenter') => void) => {
    onCameraPresetReady?.(fn)
  }, [onCameraPresetReady])

  const handleCameraRef = useCallback((cam: THREE.Camera) => {
    onCameraRef?.(cam)
  }, [onCameraRef])

  return (
    <Canvas
      camera={{ position: [96, 54, 180], fov: 45, near: 0.1, far: 2000 }}
      style={{ background: 'linear-gradient(180deg, #0a2240 0%, #051732 100%)' }}
      shadows
      onContextMenu={(e) => e.preventDefault()}
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
        mouseButtons={{
          LEFT: undefined as unknown as THREE.MOUSE,
          MIDDLE: undefined as unknown as THREE.MOUSE,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
      />
      <CameraExposer onCamera={handleCameraRef} />
      <CameraPresetHandler controlsRef={controlsRef} onReady={handleReady} />
      <CameraControlsManager controlsRef={controlsRef} />
      <WallEnvironment />

      {Object.values(cabinets).map((cab) => (
        <Suspense key={cab.id} fallback={null}>
          <CabinetGroup data={cab} />
        </Suspense>
      ))}

      {Object.values(countertops).map((ct) => (
        <CountertopMesh key={ct.id} data={ct} cabinets={cabinets} />
      ))}

      <DimensionLabels />
      <GhostOverlay />
    </Canvas>
  )
}
