import { useStore } from '../../store/useStore'
import { findAdjacentUpperGroups } from '../../systems/appliedEnds'
import { getFinish } from '../../catalog/finishes'
import type { AppliedEndData, CabinetData } from '../../types'

function groupKey(group: CabinetData[]): string {
  return group.map(c => c.id).sort().join('|')
}

function matchGroup(end: AppliedEndData, group: CabinetData[]): boolean {
  if (end.side !== 'bottom') return false
  const a = [...end.cabinetIds].sort().join('|')
  const b = groupKey(group)
  return a === b
}

export function AppliedEndsPanel() {
  const cabinets = useStore((s) => s.cabinets)
  const appliedEnds = useStore((s) => s.appliedEnds)
  const addAppliedEnd = useStore((s) => s.addAppliedEnd)
  const removeAppliedEnd = useStore((s) => s.removeAppliedEnd)

  const groups = findAdjacentUpperGroups(Object.values(cabinets))
  const allEnds = Object.values(appliedEnds)

  const absorbAndAddGroup = (group: CabinetData[]) => {
    // Delete any existing bottom ends whose cabinets intersect this group,
    // then add a new group-spanning end. Single transaction.
    useStore.setState((state) => {
      const next = { ...state.appliedEnds }
      const groupIds = new Set(group.map(c => c.id))
      for (const e of Object.values(state.appliedEnds)) {
        if (e.side !== 'bottom') continue
        if (e.cabinetIds.some(id => groupIds.has(id))) {
          delete next[e.id]
        }
      }
      const id = crypto.randomUUID()
      next[id] = {
        id,
        side: 'bottom',
        finishId: group[0].faceColor,
        cabinetIds: group.map(c => c.id),
      }
      return { appliedEnds: next }
    })
  }

  return (
    <div>
      {/* Bottom (Uppers) */}
      <div className="size-label">Bottom (Uppers)</div>
      {groups.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Add upper cabinets to enable bottom applied ends.
        </div>
      )}
      {groups.map((group, i) => {
        const totalWidth = group.reduce((sum, c) => sum + c.width, 0)
        const existing = allEnds.find(e => matchGroup(e, group))
        return (
          <div key={i} style={{ marginBottom: 8, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {group.length} upper{group.length > 1 ? 's' : ''} · {totalWidth}" wide · Y={group[0].position.y}"
            </div>
            {existing ? (
              <button className="size-btn" style={{ color: '#c00', borderColor: '#c00' }} onClick={() => removeAppliedEnd(existing.id)}>
                Remove Bottom End
              </button>
            ) : (
              <button className="size-btn active" onClick={() => absorbAndAddGroup(group)}>
                + Add Bottom End
              </button>
            )}
          </div>
        )
      })}

      {/* Sides (per cabinet) */}
      <div className="size-label" style={{ marginTop: 12 }}>Sides (per cabinet)</div>
      {Object.values(cabinets).map((cab) => {
        const left = allEnds.find(e => e.side === 'left' && e.cabinetIds.length === 1 && e.cabinetIds[0] === cab.id)
        const right = allEnds.find(e => e.side === 'right' && e.cabinetIds.length === 1 && e.cabinetIds[0] === cab.id)
        return (
          <div key={cab.id} style={{ marginBottom: 4, fontSize: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{cab.type} · {cab.width}"</span>{' '}
            <label>
              <input
                type="checkbox"
                checked={!!left}
                onChange={(e) => {
                  if (e.target.checked) addAppliedEnd({ side: 'left', finishId: cab.faceColor, cabinetIds: [cab.id] })
                  else if (left) removeAppliedEnd(left.id)
                }}
              /> L
            </label>{' '}
            <label>
              <input
                type="checkbox"
                checked={!!right}
                onChange={(e) => {
                  if (e.target.checked) addAppliedEnd({ side: 'right', finishId: cab.faceColor, cabinetIds: [cab.id] })
                  else if (right) removeAppliedEnd(right.id)
                }}
              /> R
            </label>
          </div>
        )
      })}

      {/* Existing applied ends */}
      <div className="size-label" style={{ marginTop: 12 }}>Existing</div>
      {allEnds.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>None.</div>}
      {allEnds.map(e => {
        const label = e.side === 'bottom'
          ? `Bottom — ${e.cabinetIds.length} upper${e.cabinetIds.length > 1 ? 's' : ''}`
          : `${e.side === 'left' ? 'Left' : 'Right'} of cabinet`
        return (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 3 }}>
            <div style={{ width: 12, height: 12, background: getFinish(e.finishId).hex, borderRadius: 2 }} />
            <span style={{ flex: 1 }}>{label}</span>
            <button onClick={() => removeAppliedEnd(e.id)} style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer' }}>✕</button>
          </div>
        )
      })}
    </div>
  )
}
