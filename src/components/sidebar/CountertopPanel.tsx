import { useStore } from '../../store/useStore'
import type { CabinetData } from '../../types'

function findAdjacentBaseGroups(cabinets: CabinetData[]): CabinetData[][] {
  const bases = cabinets
    .filter(c => c.type === 'base')
    .sort((a, b) => a.position.x - b.position.x)

  if (bases.length === 0) return []

  const groups: CabinetData[][] = [[bases[0]]]
  for (let i = 1; i < bases.length; i++) {
    const prev = bases[i - 1]
    const curr = bases[i]
    const gap = curr.position.x - (prev.position.x + prev.width)
    if (gap <= 1) {
      groups[groups.length - 1].push(curr)
    } else {
      groups.push([curr])
    }
  }
  return groups
}

export function CountertopPanel() {
  const cabinets = useStore((s) => s.cabinets)
  const countertops = useStore((s) => s.countertops)
  const addCountertop = useStore((s) => s.addCountertop)
  const removeCountertop = useStore((s) => s.removeCountertop)

  const groups = findAdjacentBaseGroups(Object.values(cabinets))
  const existingCtIds = new Set(
    Object.values(countertops).flatMap(ct => ct.cabinetIds)
  )

  return (
    <div>
      {groups.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Add base cabinets to enable countertops.
        </div>
      )}
      {groups.map((group, i) => {
        const ids = group.map(c => c.id)
        const hasCountertop = ids.some(id => existingCtIds.has(id))
        const totalWidth = group.reduce((sum, c) => sum + c.width, 0)

        return (
          <div key={i} style={{ marginBottom: 8, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Group {i + 1}: {group.length} cabinet{group.length > 1 ? 's' : ''} · {totalWidth}" wide
            </div>
            {hasCountertop ? (
              <button
                className="size-btn"
                style={{ color: '#c00', borderColor: '#c00' }}
                onClick={() => {
                  const ct = Object.values(countertops).find(ct =>
                    ct.cabinetIds.some(id => ids.includes(id))
                  )
                  if (ct) removeCountertop(ct.id)
                }}
              >
                Remove Countertop
              </button>
            ) : (
              <button
                className="size-btn active"
                onClick={() => addCountertop(ids)}
              >
                + Add Countertop
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
