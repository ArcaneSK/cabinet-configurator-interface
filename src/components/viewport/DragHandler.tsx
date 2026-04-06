import { useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import type { CabinetData } from '../../types'
import { applySnap, clampToWall } from '../../systems/snap'
import { checkCollision } from '../../systems/collision'

const DRAG_THRESHOLD = 4

export const cabinetDragActive = { current: false }

interface DragHandlerProps {
  cabinetId: string
  width: number
  height: number
  depth: number
}

export function DragHandler({ cabinetId, width, height, depth }: DragHandlerProps) {
  const isDragging = useRef(false)
  const dragStarted = useRef(false)
  const dragOffset = useRef(0)
  const startPointerPos = useRef({ x: 0, y: 0 })
  const { camera, gl } = useThree()

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

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.button !== 0) return

    const state = useStore.getState()
    const cab = state.cabinets[cabinetId]
    if (!cab) return

    // If not already selected, select it (replace unless shift)
    if (!state.selectedIds.has(cabinetId)) {
      if (e.shiftKey) {
        state.toggleSelected(cabinetId)
      } else {
        state.setSelected(cabinetId)
      }
    }

    isDragging.current = true
    dragStarted.current = false
    cabinetDragActive.current = true
    startPointerPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }

    const intersection = raycastToPlane(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    dragOffset.current = intersection.x - cab.position.x

    gl.domElement.setPointerCapture(e.nativeEvent.pointerId)
  }, [cabinetId, gl, raycastToPlane])

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return

    // Drag threshold
    if (!dragStarted.current) {
      const dx = e.nativeEvent.clientX - startPointerPos.current.x
      const dy = e.nativeEvent.clientY - startPointerPos.current.y
      if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return
      dragStarted.current = true
    }

    const intersection = raycastToPlane(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    const state = useStore.getState()
    const cab = state.cabinets[cabinetId]
    if (!cab) return

    let newX = intersection.x - dragOffset.current
    const allCabinets = Object.values(state.cabinets)

    // Get selected cabinets
    const selectedCabs = Array.from(state.selectedIds)
      .map((id) => state.cabinets[id])
      .filter(Boolean)

    if (selectedCabs.length <= 1) {
      // Single cabinet drag
      newX = clampToWall(newX, width, state.wall.width)
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
    } else {
      // Group drag
      const rawDelta = newX - cab.position.x

      // Clamp group to wall
      let groupLeft = Infinity, groupRight = -Infinity
      for (const sc of selectedCabs) {
        groupLeft = Math.min(groupLeft, sc.position.x + rawDelta)
        groupRight = Math.max(groupRight, sc.position.x + rawDelta + sc.width)
      }
      let clampedDelta = rawDelta
      if (groupLeft < 0) clampedDelta = rawDelta - groupLeft
      if (groupRight > state.wall.width) clampedDelta = rawDelta - (groupRight - state.wall.width)

      // Apply snap to the dragged cabinet
      let snappedX = cab.position.x + clampedDelta
      snappedX = applySnap(snappedX, width, allCabinets, cabinetId, state.snapSettings)
      const snapDelta = snappedX - cab.position.x

      // Re-check wall bounds after snap
      groupLeft = Infinity
      groupRight = -Infinity
      for (const sc of selectedCabs) {
        groupLeft = Math.min(groupLeft, sc.position.x + snapDelta)
        groupRight = Math.max(groupRight, sc.position.x + snapDelta + sc.width)
      }
      if (groupLeft < 0 || groupRight > state.wall.width) return

      // Check collision per-cabinet (each with its own collision layer)
      const excludeIds = state.selectedIds
      for (const sc of selectedCabs) {
        const movedX = sc.position.x + snapDelta
        if (checkCollision(
          { x: movedX, width: sc.width, type: sc.type, height: sc.height, y: sc.position.y },
          allCabinets,
          excludeIds
        )) {
          return // any collision blocks the entire group
        }
      }

      // Batch update all positions (single undo entry)
      const updates: Record<string, Partial<CabinetData>> = {}
      for (const sc of selectedCabs) {
        updates[sc.id] = { position: { x: sc.position.x + snapDelta, y: sc.position.y } }
      }
      state.updateCabinets(updates)
    }
  }, [cabinetId, width, raycastToPlane])

  const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    isDragging.current = false
    dragStarted.current = false
    cabinetDragActive.current = false
    gl.domElement.releasePointerCapture(e.nativeEvent.pointerId)
  }, [gl])

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
