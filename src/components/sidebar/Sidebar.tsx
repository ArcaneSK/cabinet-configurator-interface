import { useState } from 'react'
import { WallSetup } from './WallSetup'
import { CabinetCatalog } from './CabinetCatalog'

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
  return (
    <div className="sidebar">
      <Section title="Wall Setup" badge="">
        <WallSetup />
      </Section>
      <Section title="Add Cabinet">
        <CabinetCatalog />
      </Section>
    </div>
  )
}

export { Section }
