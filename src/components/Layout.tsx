import { useEffect } from 'react'
import { useStore, useTemporalStore } from '../store/useStore'
import { findPlacementPosition, getYPosition } from '../systems/placement'
import { Sidebar } from './sidebar/Sidebar'
import { Toolbar } from './toolbar/Toolbar'
import { SceneCanvas } from './viewport/SceneCanvas'

export function Layout() {
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
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
        if ((e.target as HTMLElement).tagName === 'INPUT') return
        state.removeCabinet(state.selectedId)
      }
      // Escape — deselect
      if (e.key === 'Escape') {
        state.setSelected(null)
      }
      // Ctrl+D — duplicate
      if (e.ctrlKey && e.key === 'd' && state.selectedId) {
        e.preventDefault()
        const cab = state.cabinets[state.selectedId]
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
        <Toolbar />
        <div style={{ flex: 1, position: 'relative' }}>
          <SceneCanvas />
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
