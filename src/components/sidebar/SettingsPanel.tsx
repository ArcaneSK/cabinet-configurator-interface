import { useStore } from '../../store/useStore'
import type { GizmoStyle } from '../../types'

export function SettingsPanel() {
  const snapSettings = useStore((s) => s.snapSettings)
  const setSnapSettings = useStore((s) => s.setSnapSettings)
  const showDimensions = useStore((s) => s.showDimensions)
  const setShowDimensions = useStore((s) => s.setShowDimensions)
  const gizmoStyle = useStore((s) => s.gizmoStyle)
  const setGizmoStyle = useStore((s) => s.setGizmoStyle)

  const gizmoOptions: { value: GizmoStyle; label: string }[] = [
    { value: 'arrows', label: 'Arrows' },
    { value: 'translate', label: 'Translate' },
    { value: 'boundingBox', label: 'Bounding Box' },
  ]

  return (
    <div>
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={snapSettings.grid}
          onChange={(e) => setSnapSettings({ grid: e.target.checked })}
        />
        Grid Snap
      </label>
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={snapSettings.adjacent}
          onChange={(e) => setSnapSettings({ adjacent: e.target.checked })}
        />
        Adjacent Snap
      </label>
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={showDimensions}
          onChange={(e) => setShowDimensions(e.target.checked)}
        />
        Show Dimensions
      </label>

      <div className="setting-section">
        <div className="setting-label">Gizmo Style</div>
        <div className="segmented-toggle">
          {gizmoOptions.map((opt) => (
            <button
              key={opt.value}
              className={`segment-btn ${gizmoStyle === opt.value ? 'active' : ''}`}
              onClick={() => setGizmoStyle(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
