import { useStore } from '../../store/useStore'

export function WallSetup() {
  const wall = useStore((s) => s.wall)
  const setWall = useStore((s) => s.setWall)

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="size-label">Width</span>
        <input
          type="number"
          value={wall.width}
          min={48}
          max={480}
          onChange={(e) => setWall({ width: Math.max(48, Math.min(480, Number(e.target.value))) })}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>"</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="size-label">Height</span>
        <input
          type="number"
          value={wall.height}
          min={72}
          max={144}
          onChange={(e) => setWall({ height: Math.max(72, Math.min(144, Number(e.target.value))) })}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>"</span>
      </label>
    </div>
  )
}
