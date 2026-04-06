import { Html } from '@react-three/drei'

interface ArrowHandlesProps {
  width: number
  height: number
  depth: number
  showVertical?: boolean
}

export function ArrowHandles({ width, height, depth, showVertical = false }: ArrowHandlesProps) {
  const centerY = height / 2
  const centerZ = depth / 2

  return (
    <>
      {/* Left arrow */}
      <Html
        position={[-2, centerY, centerZ]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          fontSize: 24,
          color: '#fbcf20',
          textShadow: '0 0 4px rgba(0,0,0,0.5)',
          fontWeight: 'bold',
        }}>
          &#x25C0;
        </div>
      </Html>
      {/* Right arrow */}
      <Html
        position={[width + 2, centerY, centerZ]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          fontSize: 24,
          color: '#fbcf20',
          textShadow: '0 0 4px rgba(0,0,0,0.5)',
          fontWeight: 'bold',
        }}>
          &#x25B6;
        </div>
      </Html>
      {/* Up arrow (uppers only) */}
      {showVertical && (
        <Html
          position={[width / 2, height + 2, centerZ]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            fontSize: 24,
            color: '#22cc66',
            textShadow: '0 0 4px rgba(0,0,0,0.5)',
            fontWeight: 'bold',
          }}>
            &#x25B2;
          </div>
        </Html>
      )}
      {/* Down arrow (uppers only) */}
      {showVertical && (
        <Html
          position={[width / 2, -2, centerZ]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            fontSize: 24,
            color: '#22cc66',
            textShadow: '0 0 4px rgba(0,0,0,0.5)',
            fontWeight: 'bold',
          }}>
            &#x25BC;
          </div>
        </Html>
      )}
    </>
  )
}
