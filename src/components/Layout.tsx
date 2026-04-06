import { useEffect, useRef, useCallback } from 'react'
import { useStore, useTemporalStore } from '../store/useStore'
import { findPlacementPosition, getYPosition } from '../systems/placement'
import { Sidebar } from './sidebar/Sidebar'
import { Toolbar } from './toolbar/Toolbar'
import { SceneCanvas } from './viewport/SceneCanvas'

export function Layout() {
  const cameraPresetRef = useRef<((preset: 'front' | 'top' | 'orbit') => void) | null>(null)

  const handleCameraPresetReady = useCallback((fn: (preset: 'front' | 'top' | 'orbit') => void) => {
    cameraPresetRef.current = fn
  }, [])

  const handleCameraPreset = useCallback((preset: 'front' | 'top' | 'orbit') => {
    cameraPresetRef.current?.(preset)
  }, [])

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
      // Ctrl+D — duplicate (single selection only)
      if (e.ctrlKey && e.key === 'd' && state.selectedIds.size > 0) {
        e.preventDefault()
        const cab = state.cabinets[Array.from(state.selectedIds)[0]]
        if (!cab) return
        const { id: _, ...cabData } = cab
        const x = findPlacementPosition(
          cabData.type, cabData.width, cabData.height, cabData.depth,
          state.wall, Object.values(state.cabinets)
        )
        if (x !== null) {
          state.addCabinet({
            ...cabData,
            position: { x, y: getYPosition(cabData.type) },
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <div style={{
        width: 'var(--sidebar-width)',
        minWidth: 300,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
      }}>
        <Sidebar />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar onCameraPreset={handleCameraPreset} />
        <div style={{ flex: 1, position: 'relative' }}>
          <SceneCanvas onCameraPresetReady={handleCameraPresetReady} />
          <div style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'var(--text-muted)',
            fontSize: 11,
            pointerEvents: 'none',
          }}>
            Click to select · Drag to move · Scroll to zoom
          </div>
        </div>
      </div>
    </div>
  )
}
