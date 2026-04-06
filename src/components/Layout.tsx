import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore, useTemporalStore } from '../store/useStore'
import { Sidebar } from './sidebar/Sidebar'
import { Toolbar } from './toolbar/Toolbar'
import { SceneCanvas } from './viewport/SceneCanvas'
import { ghostAnchorX } from './viewport/GhostOverlay'
import { MarqueeOverlay } from './viewport/MarqueeOverlay'
import * as THREE from 'three'
import type { GhostCabinet, CabinetSnapshot, CabinetType, CabinetStyle } from '../types'
import { getYPosition } from '../systems/placement'

export function Layout() {
  const cameraPresetRef = useRef<((preset: 'front' | 'top' | 'orbit' | 'recenter') => void) | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [camera, setCamera] = useState<THREE.Camera | null>(null)

  const handleCameraPresetReady = useCallback((fn: (preset: 'front' | 'top' | 'orbit' | 'recenter') => void) => {
    cameraPresetRef.current = fn
  }, [])

  const handleCameraPreset = useCallback((preset: 'front' | 'top' | 'orbit' | 'recenter') => {
    cameraPresetRef.current?.(preset)
  }, [])

  const handleCameraRef = useCallback((cam: THREE.Camera) => {
    setCamera(cam)
  }, [])

  const ghostMode = useStore((s) => s.ghostMode)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useStore.getState()
      const temporal = useTemporalStore().getState()

      // Ctrl+Z — undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        temporal.undo()
      }
      // Ctrl+Y — redo
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        temporal.redo()
      }
      // Delete — remove selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedIds.size > 0) {
        if ((e.target as HTMLElement).tagName === 'INPUT') return
        state.removeCabinets(state.selectedIds)
      }
      // Escape — cancel ghost mode first, then deselect
      if (e.key === 'Escape') {
        if (state.ghostMode) {
          state.cancelGhostMode()
        } else {
          state.clearSelection()
        }
      }
      // Ctrl+C — copy
      if (e.ctrlKey && e.key === 'c' && state.selectedIds.size > 0) {
        e.preventDefault()
        state.copySelection()
      }

      // Ctrl+V — paste (enter ghost mode)
      if (e.ctrlKey && e.key === 'v' && state.clipboard.length > 0 && !state.ghostMode) {
        e.preventDefault()
        const ghosts: GhostCabinet[] = state.clipboard.map((snap) => ({
          position: [snap.offsetX, snap.position.y, 0] as [number, number, number],
          width: snap.width,
          height: snap.height,
          depth: snap.depth,
          type: snap.type,
          style: snap.style,
          color: snap.faceColor,
          offsetX: snap.offsetX,
          snapshot: snap, // preserve full data for placement
        }))
        state.setGhostMode({
          type: 'paste',
          ghosts,
          anchorWorldX: 0,
          isColliding: false,
        })
      }

      // Ctrl+A — select all
      if (e.ctrlKey && e.key === 'a' && !state.ghostMode) {
        e.preventDefault()
        state.selectAll()
      }

      // Ctrl+D — duplicate (enter ghost mode)
      if (e.ctrlKey && e.key === 'd' && state.selectedIds.size > 0 && !state.ghostMode) {
        e.preventDefault()

        const selected = Array.from(state.selectedIds)
          .map((id) => state.cabinets[id])
          .filter(Boolean)
        if (selected.length === 0) return

        const centroidX =
          selected.reduce((sum, c) => sum + c.position.x + c.width / 2, 0) /
          selected.length

        const ghosts: GhostCabinet[] = selected.map((c) => {
          const { id: _, ...rest } = c
          const snapshot: CabinetSnapshot = { ...rest, offsetX: c.position.x - centroidX }
          return {
            position: [c.position.x - centroidX, c.position.y, 0] as [number, number, number],
            width: c.width,
            height: c.height,
            depth: c.depth,
            type: c.type,
            style: c.style,
            color: c.faceColor,
            offsetX: c.position.x - centroidX,
            snapshot,
          }
        })

        state.setGhostMode({
          type: 'duplicate',
          ghosts,
          anchorWorldX: 0,
          isColliding: false,
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    let dragConfig: {
      type: CabinetType; style: CabinetStyle
      width: number; height: number; depth: number; faceColor: string
    } | null = null
    let ghostStarted = false

    const onDragStart = (e: Event) => {
      dragConfig = (e as CustomEvent).detail
      ghostStarted = false
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragConfig || ghostStarted) return

      const canvasEl = canvasContainerRef.current
      if (!canvasEl) return
      const rect = canvasEl.getBoundingClientRect()
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        ghostStarted = true
        const y = getYPosition(dragConfig.type)
        const ghost: GhostCabinet = {
          position: [0, y, 0],
          width: dragConfig.width,
          height: dragConfig.height,
          depth: dragConfig.depth,
          type: dragConfig.type,
          style: dragConfig.style,
          color: dragConfig.faceColor,
          offsetX: -dragConfig.width / 2, // center on cursor
        }
        useStore.getState().setGhostMode({
          type: 'sidebar-drag',
          ghosts: [ghost],
          anchorWorldX: 0,
          isColliding: false,
        })
      }
    }

    const onPointerUp = () => {
      if (!dragConfig) return
      dragConfig = null
      ghostStarted = false

      // For sidebar drag, mouse-up places the cabinet (not click)
      const state = useStore.getState()
      if (state.ghostMode?.type === 'sidebar-drag') {
        if (!state.ghostMode.isColliding) {
          const g = state.ghostMode.ghosts[0]
          if (g) {
            state.addCabinet({
              type: g.type,
              style: g.style,
              width: g.width,
              height: g.height,
              depth: g.depth,
              isCustomSize: false,
              faceColor: g.color,
              boxColor: 'white',
              position: { x: ghostAnchorX.current + g.offsetX, y: g.position[1] },
              appliedEndLeft: null,
              appliedEndRight: null,
              appliedEndBottom: null,
              handleSide: 'left',
              toeKick: g.type === 'upper' ? 0 : 6,
            })
          }
        }
        state.cancelGhostMode()
      }
    }

    window.addEventListener('sidebar-drag-start', onDragStart)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('sidebar-drag-start', onDragStart)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <div style={{
        width: 'var(--sidebar-width)',
        minWidth: 0,
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
      }}>
        <Sidebar />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Toolbar onCameraPreset={handleCameraPreset} />
        <div
          ref={canvasContainerRef}
          className={`canvas-container${ghostMode ? ' ghost-active' : ''}`}
          style={{ flex: 1, position: 'relative' }}
        >
          <SceneCanvas
            onCameraPresetReady={handleCameraPresetReady}
            onCameraRef={handleCameraRef}
          />
          <MarqueeOverlay canvasContainerRef={canvasContainerRef} camera={camera} />
          <div style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'var(--text-muted)',
            fontSize: 11,
            pointerEvents: 'none',
          }}>
            Left-click: select · Right-drag: orbit · Ctrl+Right-drag: pan · Scroll: zoom
          </div>
        </div>
      </div>
    </div>
  )
}
