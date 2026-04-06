import { useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { applySnap, clampToWall } from '../../systems/snap'
import { checkCollision } from '../../systems/collision'

export const cabinetDragActive = { current: false }

interface DragHandlerProps {
  cabinetId: string
  width: number
  height: number
  depth: number
}

export function DragHandler({ cabinetId, width, height, depth }: DragHandlerProps) {
  const isDragging = useRef(false)
  const dragOffset = useRef(0)
  const { camera, gl } = useThree()

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    cabinetDragActive.current = true
    const state = useStore.getState()
    const cab = state.cabinets[cabinetId]
    if (!cab) return

    state.setSelected(cabinetId)
    isDragging.current = true

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(
      (e.nativeEvent.offsetX / gl.domElement.clientWidth) * 2 - 1,
      -(e.nativeEvent.offsetY / gl.domElement.clientHeight) * 2 + 1
    )
    raycaster.setFromCamera(mouse, camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)
    dragOffset.current = intersection.x - cab.position.x

    gl.domElement.setPointerCapture(e.nativeEvent.pointerId)
  }, [cabinetId, camera, gl])

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(
      (e.nativeEvent.offsetX / gl.domElement.clientWidth) * 2 - 1,
      -(e.nativeEvent.offsetY / gl.domElement.clientHeight) * 2 + 1
    )
    raycaster.setFromCamera(mouse, camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    const state = useStore.getState()
    const cab = state.cabinets[cabinetId]
    if (!cab) return

    let newX = intersection.x - dragOffset.current
    newX = clampToWall(newX, width, state.wall.width)

    const allCabinets = Object.values(state.cabinets)
    newX = applySnap(newX, width, allCabinets, cabinetId, state.snapSettings)
    newX = clampToWall(newX, width, state.wall.width)

    const collides = checkCollision(
      { x: newX, width, type: cab.type, height: cab.height, y: cab.position.y },
      allCabinets,
      cabinetId
    )

    if (!collides) {
      state.updateCabinet(cabinetId, { position: { x: newX, y: cab.position.y } })
    }
  }, [cabinetId, width, camera, gl])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
    cabinetDragActive.current = false
  }, [])

  return (
    <mesh
      position={[width / 2, height / 2, depth / 2]}
      visible={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <boxGeometry args={[width, height, depth]} />
    </mesh>
  )
}
