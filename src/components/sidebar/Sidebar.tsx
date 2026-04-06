import { useState } from 'react'
import { WallSetup } from './WallSetup'
import { CabinetCatalog } from './CabinetCatalog'
import { CabinetProperties } from './CabinetProperties'
import { CountertopPanel } from './CountertopPanel'
import { SettingsPanel } from './SettingsPanel'
import { useStore } from '../../store/useStore'

interface SectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  badge?: string
}

function Section({ title, defaultOpen = true, children, badge }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-header" onClick={() => setOpen(!open)}>
        <span>{open ? '\u25BE' : '\u25B8'} {title}</span>
        {badge && <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 400 }}>{badge}</span>}
      </div>
      {open && <div className="sidebar-section-body">{children}</div>}
    </div>
  )
}

export function Sidebar() {
  const selectedIds = useStore((s) => s.selectedIds)
  const wall = useStore((s) => s.wall)

  return (
    <div className="sidebar">
      <Section title="Wall Setup" badge={`${Math.round(wall.width / 12)}' \u00D7 ${Math.round(wall.height / 12)}'`}>
        <WallSetup />
      </Section>
      <Section title="Add Cabinet">
        <CabinetCatalog />
      </Section>
      {selectedIds.size > 0 && (
        <Section title="Selected Cabinet">
          <CabinetProperties />
        </Section>
      )}
      <Section title="Countertops">
        <CountertopPanel />
      </Section>
      <Section title="Settings" defaultOpen={false}>
        <SettingsPanel />
      </Section>
    </div>
  )
}
