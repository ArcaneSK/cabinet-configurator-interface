import { useStore } from '../../store/useStore'

export function SettingsPanel() {
  const snapSettings = useStore((s) => s.snapSettings)
  const setSnapSettings = useStore((s) => s.setSnapSettings)
  const showDimensions = useStore((s) => s.showDimensions)
  const setShowDimensions = useStore((s) => s.setShowDimensions)

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
    </div>
  )
}
