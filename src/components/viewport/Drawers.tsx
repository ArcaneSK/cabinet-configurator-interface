import { getFinish } from '../../catalog/finishes'
import { CabinetMaterial } from './CabinetMaterial'
import { Handle } from './Handle'

const T = 0.75
const REVEAL = 3 / 8 // 3/8" gap on each side = 3/4" total reveal

interface DrawersProps {
  drawerCount: number
  width: number
  drawerZoneTop: number
  drawerZoneBottom: number
  depth: number
  faceColor: string
}

export function Drawers({ drawerCount, width, drawerZoneTop, drawerZoneBottom, depth, faceColor }: DrawersProps) {
  const finish = getFinish(faceColor)
  // Full overlay: drawers cover the face frame
  const openingW = width - 2 * REVEAL
  const zoneH = drawerZoneTop - drawerZoneBottom
  const drawerH = (zoneH - (drawerCount + 1) * REVEAL) / drawerCount
  const drawerZ = depth + T / 2

  const drawers = []
  for (let i = 0; i < drawerCount; i++) {
    const y = drawerZoneTop - REVEAL - (i + 0.5) * (drawerH + REVEAL)
    drawers.push(
      <group key={i}>
        <mesh position={[width / 2, y, drawerZ]} castShadow>
          <boxGeometry args={[openingW, drawerH, T]} />
          <CabinetMaterial finish={finish} />
        </mesh>
        <Handle position={[width / 2, y, depth + T]} rotation={[0, 0, Math.PI / 2]} />
      </group>
    )
  }

  return <group>{drawers}</group>
}
