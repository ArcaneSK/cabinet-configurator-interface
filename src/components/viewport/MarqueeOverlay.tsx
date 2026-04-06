import { useRef, useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { cabinetDragActive } from './DragHandler'
import * as THREE from 'three'

const DRAG_THRESHOLD = 4

interface MarqueeOverlayProps {
  canvasContainer: HTMLDivElement | null
  camera: THREE.Camera | null
}

export function MarqueeOverlay({ canvasContainer, camera }: MarqueeOverlayProps) {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  // Keep a stable ref to camera so the pointer-event closure always sees the latest value
  const cameraRef = useRef<THREE.Camera | null>(camera)
  useEffect(() => { cameraRef.current = camera }, [camera])

  useEffect(() => {
    if (!canvasContainer) return

    let isDown = false
    let startX = 0
    let startY = 0
    let didDrag = false
    let shiftHeld = false

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      // Only start on the canvas element itself
      const canvas = canvasContainer.querySelector('canvas')
      if (e.target !== canvas) return

      isDown = true
      startX = e.clientX
      startY = e.clientY
      didDrag = false
      shiftHeld = e.shiftKey
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return
      // If a cabinet drag is active, abort marquee
      if (cabinetDragActive.current) {
        isDown = false
        setRect(null)
        return
      }

      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (!didDrag && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return

      didDrag = true
      setRect({
        left: Math.min(startX, e.clientX),
        top: Math.min(startY, e.clientY),
        width: Math.abs(e.clientX - startX),
        height: Math.abs(e.clientY - startY),
      })
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!isDown) return
      isDown = false

      // If cabinet drag was active, ignore
      if (cabinetDragActive.current) {
        setRect(null)
        return
      }

      if (!didDrag) {
        // Simple click on empty space — deselect (unless shift)
        if (!shiftHeld) {
          useStore.getState().clearSelection()
        }
        setRect(null)
        return
      }

      // Marquee completed — find cabinets in the rectangle
      const marqueeRect = {
        left: Math.min(startX, e.clientX),
        right: Math.max(startX, e.clientX),
        top: Math.min(startY, e.clientY),
        bottom: Math.max(startY, e.clientY),
      }

      const cam = cameraRef.current
      if (!cam) { setRect(null); return }

      const state = useStore.getState()
      const canvasBounds = canvasContainer.getBoundingClientRect()
      const matched = new Set<string>()

      for (const cab of Object.values(state.cabinets)) {
        const { x, y } = cab.position
        // Project 8 bounding box corners to screen space
        const corners = [
          new THREE.Vector3(x, y, 0),
          new THREE.Vector3(x + cab.width, y, 0),
          new THREE.Vector3(x, y + cab.height, 0),
          new THREE.Vector3(x + cab.width, y + cab.height, 0),
          new THREE.Vector3(x, y, cab.depth),
          new THREE.Vector3(x + cab.width, y, cab.depth),
          new THREE.Vector3(x, y + cab.height, cab.depth),
          new THREE.Vector3(x + cab.width, y + cab.height, cab.depth),
        ]

        let minSX = Infinity, maxSX = -Infinity, minSY = Infinity, maxSY = -Infinity
        for (const corner of corners) {
          const projected = corner.clone().project(cam)
          const sx = (projected.x * 0.5 + 0.5) * canvasBounds.width + canvasBounds.left
          const sy = (-projected.y * 0.5 + 0.5) * canvasBounds.height + canvasBounds.top
          minSX = Math.min(minSX, sx)
          maxSX = Math.max(maxSX, sx)
          minSY = Math.min(minSY, sy)
          maxSY = Math.max(maxSY, sy)
        }

        // Test overlap with marquee
        if (maxSX >= marqueeRect.left && minSX <= marqueeRect.right &&
            maxSY >= marqueeRect.top && minSY <= marqueeRect.bottom) {
          matched.add(cab.id)
        }
      }

      if (e.shiftKey) {
        const combined = new Set(state.selectedIds)
        for (const id of matched) combined.add(id)
        state.setSelectedMany(combined)
      } else {
        state.setSelectedMany(matched)
      }

      setRect(null)
    }

    // Escape cancels marquee mid-drag
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDown && didDrag) {
        isDown = false
        didDrag = false
        setRect(null)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [canvasContainer])

  if (!rect) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        border: '1px solid #4488ff',
        background: 'rgba(68, 136, 255, 0.1)',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  )
}
