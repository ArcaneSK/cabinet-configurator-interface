import { Html } from '@react-three/drei'
import { useStore } from '../../store/useStore'

export function DimensionLabels() {
  const cabinets = useStore((s) => s.cabinets)
  const showDimensions = useStore((s) => s.showDimensions)
  const wall = useStore((s) => s.wall)

  if (!showDimensions) return null

  const cabinetList = Object.values(cabinets)
  const totalUsedWidth = cabinetList.reduce((sum, c) => sum + c.width, 0)
  const remaining = wall.width - totalUsedWidth

  return (
    <group>
      {/* Per-cabinet width labels */}
      {cabinetList.map((cab) => (
        <Html
          key={cab.id}
          position={[cab.position.x + cab.width / 2, cab.position.y + cab.height + 2, cab.depth / 2]}
          center
          style={{
            color: '#e94560',
            fontSize: '11px',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.6)',
            padding: '1px 4px',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {cab.width}"
        </Html>
      ))}

      {/* Wall remaining space */}
      <Html
        position={[wall.width / 2, wall.height + 4, 0]}
        center
        style={{
          color: '#888',
          fontSize: '12px',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 8px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        Wall: {wall.width}" | Remaining: {remaining}"
      </Html>
    </group>
  )
}
