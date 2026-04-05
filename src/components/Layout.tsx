import { SceneCanvas } from './viewport/SceneCanvas'
import { Sidebar } from './sidebar/Sidebar'

export function Layout() {
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
        <div style={{
          height: 'var(--toolbar-height)',
          minHeight: 40,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
        }}>
          Toolbar
        </div>
        <div style={{ flex: 1 }}>
          <SceneCanvas />
        </div>
      </div>
    </div>
  )
}
