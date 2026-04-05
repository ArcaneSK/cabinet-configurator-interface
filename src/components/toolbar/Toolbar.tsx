import { useStore, useTemporalStore } from '../../store/useStore'
import { generateExport } from '../../systems/export'
import { useCallback } from 'react'

interface ToolbarProps {
  onCameraPreset?: (preset: 'front' | 'top' | 'orbit') => void
}

export function Toolbar({ onCameraPreset }: ToolbarProps) {
  const { undo, redo } = useTemporalStore().getState()

  const handleExport = useCallback(() => {
    const state = useStore.getState()
    const data = generateExport(state.wall, state.cabinets, state.countertops)
    const json = JSON.stringify(data, null, 2)

    navigator.clipboard.writeText(json).catch(() => {})
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cabinet-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="toolbar">
      <button className="toolbar-btn" onClick={() => undo()} title="Undo (Ctrl+Z)">
        ↩ Undo
      </button>
      <button className="toolbar-btn" onClick={() => redo()} title="Redo (Ctrl+Y)">
        ↪ Redo
      </button>

      <div className="toolbar-sep" />

      <button className="toolbar-btn" onClick={() => onCameraPreset?.('front')}>
        Front
      </button>
      <button className="toolbar-btn" onClick={() => onCameraPreset?.('top')}>
        Top
      </button>
      <button className="toolbar-btn" onClick={() => onCameraPreset?.('orbit')}>
        Orbit
      </button>

      <div className="toolbar-spacer" />

      <button className="export-btn" onClick={handleExport}>
        Export Config
      </button>
    </div>
  )
}
