import { useRef, useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import type { CabinetData } from '../../types'
import { applySnap, clampToWall } from '../../systems/snap'
import { checkCollision } from '../../systems/collision'

const DRAG_THRESHOLD = 4
const T = 0.75

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
  const dragOffset = useRef({ x: 0, y: 0 })
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
    dragOffset.current = {
      x: intersection.x - cab.position.x,
      y: intersection.y - cab.position.y,
    }

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

    let newX = intersection.x - dragOffset.current.x
    let newY = intersection.y - dragOffset.current.y
    const allCabinets = Object.values(state.cabinets)

    // Get selected cabinets
    const selectedCabs = Array.from(state.selectedIds)
      .map((id) => state.cabinets[id])
      .filter(Boolean)

    // Only allow vertical movement if ALL selected cabinets are uppers
    const allUppers = selectedCabs.every(c => c.type === 'upper')
    if (!allUppers || cab.type !== 'upper') {
      newY = cab.position.y
    } else {
      newY = Math.max(0, Math.min(newY, state.wall.height - cab.height))
    }

    if (selectedCabs.length <= 1) {
      // Single cabinet drag
      newX = clampToWall(newX, width, state.wall.width)
      newX = applySnap(newX, width, allCabinets, cabinetId, state.snapSettings)
      newX = clampToWall(newX, width, state.wall.width)

      const collides = checkCollision(
        { x: newX, width, type: cab.type, height: cab.height, y: newY },
        allCabinets,
        cabinetId
      )
      if (!collides) {
        state.updateCabinet(cabinetId, { position: { x: newX, y: newY } })
      }
    } else {
      // Group drag
      const rawDeltaX = newX - cab.position.x
      const rawDeltaY = newY - cab.position.y

      // Clamp group to wall (X)
      let groupLeft = Infinity, groupRight = -Infinity
      for (const sc of selectedCabs) {
        groupLeft = Math.min(groupLeft, sc.position.x + rawDeltaX)
        groupRight = Math.max(groupRight, sc.position.x + rawDeltaX + sc.width)
      }
      let clampedDeltaX = rawDeltaX
      if (groupLeft < 0) clampedDeltaX = rawDeltaX - groupLeft
      if (groupRight > state.wall.width) clampedDeltaX = rawDeltaX - (groupRight - state.wall.width)

      // Clamp group to wall (Y)
      let groupBottom = Infinity, groupTop = -Infinity
      for (const sc of selectedCabs) {
        groupBottom = Math.min(groupBottom, sc.position.y + rawDeltaY)
        groupTop = Math.max(groupTop, sc.position.y + rawDeltaY + sc.height)
      }
      let clampedDeltaY = rawDeltaY
      if (groupBottom < 0) clampedDeltaY = rawDeltaY - groupBottom
      if (groupTop > state.wall.height) clampedDeltaY = rawDeltaY - (groupTop - state.wall.height)

      // Apply snap to the dragged cabinet (X only)
      let snappedX = cab.position.x + clampedDeltaX
      snappedX = applySnap(snappedX, width, allCabinets, cabinetId, state.snapSettings)
      const snapDeltaX = snappedX - cab.position.x

      // Re-check wall bounds after snap
      groupLeft = Infinity
      groupRight = -Infinity
      for (const sc of selectedCabs) {
        groupLeft = Math.min(groupLeft, sc.position.x + snapDeltaX)
        groupRight = Math.max(groupRight, sc.position.x + snapDeltaX + sc.width)
      }
      if (groupLeft < 0 || groupRight > state.wall.width) return

      // Check collision per-cabinet (each with its own collision layer)
      const excludeIds = state.selectedIds
      for (const sc of selectedCabs) {
        const movedX = sc.position.x + snapDeltaX
        const movedY = sc.position.y + clampedDeltaY
        if (checkCollision(
          { x: movedX, width: sc.width, type: sc.type, height: sc.height, y: movedY },
          allCabinets,
          excludeIds
        )) {
          return // any collision blocks the entire group
        }
      }

      // Batch update all positions (single undo entry)
      const updates: Record<string, Partial<CabinetData>> = {}
      for (const sc of selectedCabs) {
        updates[sc.id] = { position: { x: sc.position.x + snapDeltaX, y: sc.position.y + clampedDeltaY } }
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

  // Safety: if pointer is released outside the mesh, reset drag state via DOM listener
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        dragStarted.current = false
        cabinetDragActive.current = false
      }
    }
    window.addEventListener('pointerup', handleGlobalPointerUp)
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp)
  }, [])

  return (
    <mesh
      position={[width / 2, height / 2, depth + T]}
      visible={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}
