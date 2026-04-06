import { useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { applySnap, clampToWall } from '../../systems/snap'
import { checkCollision } from '../../systems/collision'

interface TranslateGizmoProps {
  width: number
  height: number
  depth: number
  showVertical?: boolean
}

const SHAFT_RADIUS = 0.3
const CONE_RADIUS = 0.8
const CONE_HEIGHT = 1.6
const ARM_COLOR_X = '#fbcf20'
const ARM_COLOR_Y = '#22cc66'

export function TranslateGizmo({ width, height, depth, showVertical = false }: TranslateGizmoProps) {
  const centerX = width / 2
  const centerY = height / 2
  const centerZ = depth + 1
  const armLength = Math.min(Math.max(width, height) * 0.4, 14)

  const { camera, gl } = useThree()
  const isDragging = useRef<'x' | 'y' | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const cabinetId = useRef<string | null>(null)

  const raycastToPlane = useCallback((offsetX: number, offsetY: number) => {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(
      (offsetX / gl.domElement.clientWidth) * 2 - 1,
      -(offsetY / gl.domElement.clientHeight) * 2 + 1
    )
    raycaster.setFromCamera(mouse, camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)
    return intersection
  }, [camera, gl])

  const onPointerDown = useCallback((axis: 'x' | 'y') => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.button !== 0) return

    const state = useStore.getState()
    const selectedId = Array.from(state.selectedIds)[0]
    if (!selectedId) return
    const cab = state.cabinets[selectedId]
    if (!cab) return

    isDragging.current = axis
    cabinetId.current = selectedId

    const intersection = raycastToPlane(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    dragOffset.current = {
      x: intersection.x - cab.position.x,
      y: intersection.y - cab.position.y,
    }

    gl.domElement.setPointerCapture(e.nativeEvent.pointerId)
  }, [gl, raycastToPlane])

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current || !cabinetId.current) return

    const intersection = raycastToPlane(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    const state = useStore.getState()
    const cab = state.cabinets[cabinetId.current]
    if (!cab) return

    const allCabinets = Object.values(state.cabinets)

    if (isDragging.current === 'x') {
      let newX = intersection.x - dragOffset.current.x
      newX = clampToWall(newX, cab.width, state.wall.width)
      newX = applySnap(newX, cab.width, allCabinets, cabinetId.current, state.snapSettings)
      newX = clampToWall(newX, cab.width, state.wall.width)

      const collides = checkCollision(
        { x: newX, width: cab.width, type: cab.type, height: cab.height, y: cab.position.y },
        allCabinets,
        cabinetId.current
      )
      if (!collides) {
        state.updateCabinet(cabinetId.current, { position: { x: newX, y: cab.position.y } })
      }
    } else {
      let newY = intersection.y - dragOffset.current.y
      // Clamp Y to wall bounds
      newY = Math.max(0, Math.min(newY, state.wall.height - cab.height))

      const collides = checkCollision(
        { x: cab.position.x, width: cab.width, type: cab.type, height: cab.height, y: newY },
        allCabinets,
        cabinetId.current
      )
      if (!collides) {
        state.updateCabinet(cabinetId.current, { position: { x: cab.position.x, y: newY } })
      }
    }
  }, [raycastToPlane])

  const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    isDragging.current = null
    cabinetId.current = null
    gl.domElement.releasePointerCapture(e.nativeEvent.pointerId)
  }, [gl])

  return (
    <group position={[centerX, centerY, centerZ]}>
      {/* X axis shaft */}
      <mesh
        position={[armLength / 2, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onPointerDown={onPointerDown('x')}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <cylinderGeometry args={[SHAFT_RADIUS, SHAFT_RADIUS, armLength, 8]} />
        <meshBasicMaterial color={ARM_COLOR_X} />
      </mesh>
      {/* X axis arrow */}
      <mesh
        position={[armLength + CONE_HEIGHT / 2, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onPointerDown={onPointerDown('x')}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <coneGeometry args={[CONE_RADIUS, CONE_HEIGHT, 8]} />
        <meshBasicMaterial color={ARM_COLOR_X} />
      </mesh>

      {/* Y axis shaft (uppers only) */}
      {showVertical && (
        <>
          <mesh
            position={[0, armLength / 2, 0]}
            onPointerDown={onPointerDown('y')}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <cylinderGeometry args={[SHAFT_RADIUS, SHAFT_RADIUS, armLength, 8]} />
            <meshBasicMaterial color={ARM_COLOR_Y} />
          </mesh>
          <mesh
            position={[0, armLength + CONE_HEIGHT / 2, 0]}
            onPointerDown={onPointerDown('y')}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <coneGeometry args={[CONE_RADIUS, CONE_HEIGHT, 8]} />
            <meshBasicMaterial color={ARM_COLOR_Y} />
          </mesh>
        </>
      )}

      {/* Center dot */}
      <mesh>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}
