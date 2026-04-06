import { Html } from '@react-three/drei'

interface ArrowHandlesProps {
  width: number
  height: number
  depth: number
}

export function ArrowHandles({ width, height, depth }: ArrowHandlesProps) {
  const centerY = height / 2
  const centerZ = depth / 2

  return (
    <>
      <Html
        position={[-2, centerY, centerZ]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          fontSize: 24,
          color: '#e94560',
          textShadow: '0 0 4px rgba(0,0,0,0.5)',
          fontWeight: 'bold',
        }}>
          &#x25C0;
        </div>
      </Html>
      <Html
        position={[width + 2, centerY, centerZ]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          fontSize: 24,
          color: '#e94560',
          textShadow: '0 0 4px rgba(0,0,0,0.5)',
          fontWeight: 'bold',
        }}>
          &#x25B6;
        </div>
      </Html>
    </>
  )
}
