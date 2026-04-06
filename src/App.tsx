import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'

export default function App() {
  // TODO: Remove this artificial delay — just for previewing the loading spinner
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true)
      document.getElementById('loading-spinner')?.remove()
    }, 3000)
    return () => clearTimeout(t)
  }, [])
  if (!ready) return null

  return <Layout />
}
