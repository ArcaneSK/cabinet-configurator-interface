import { Sidebar } from './sidebar/Sidebar'
import { Toolbar } from './toolbar/Toolbar'
import { SceneCanvas } from './viewport/SceneCanvas'

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
        <Toolbar />
        <div style={{ flex: 1 }}>
          <SceneCanvas />
        </div>
      </div>
    </div>
  )
}
