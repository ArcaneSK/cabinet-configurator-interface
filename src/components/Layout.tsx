export function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <div style={{ width: 300, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        Sidebar
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 40, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          Toolbar
        </div>
        <div style={{ flex: 1, background: 'var(--bg-primary)' }}>
          Viewport
        </div>
      </div>
    </div>
  )
}
