import { useRef, useState, useCallback } from 'react'
import type { Group } from 'three'
import type { CabinetData } from '../../types'
import { useStore } from '../../store/useStore'
import { getStyle } from '../../catalog/styles'
import { getFinish } from '../../catalog/finishes'
import { CabinetBox } from './CabinetBox'
import { Doors } from './Doors'
import { Drawers } from './Drawers'
import { DragHandler } from './DragHandler'

const T = 0.75
const DRAWER_HEIGHT = 6

interface CabinetGroupProps {
  data: CabinetData
}

export function CabinetGroup({ data }: CabinetGroupProps) {
  const groupRef = useRef<Group>(null)
  const selectedId = useStore((s) => s.selectedId)
  const setSelected = useStore((s) => s.setSelected)
  const isSelected = selectedId === data.id
  const [isHovered, setIsHovered] = useState(false)

  const style = getStyle(data.style)
  const { width, height, depth } = data

  // Compute door/drawer zones
  const interiorBottom = T
  const interiorTop = height - T
  let drawerZoneTop = interiorTop
  let drawerZoneBottom = interiorTop
  let doorZoneTop = interiorTop
  let doorZoneBottom = interiorBottom

  if (style.drawers > 0 && style.doors > 0) {
    const drawerZoneH = style.drawers * DRAWER_HEIGHT
    drawerZoneTop = interiorTop
    drawerZoneBottom = interiorTop - drawerZoneH
    doorZoneTop = drawerZoneBottom
    doorZoneBottom = interiorBottom
  } else if (style.drawers > 0 && style.doors === 0) {
    drawerZoneTop = interiorTop
    drawerZoneBottom = interiorBottom
  } else {
    doorZoneTop = interiorTop
    doorZoneBottom = interiorBottom
  }

  const shelfY = style.drawers > 0 && style.doors > 0
    ? drawerZoneBottom
    : (interiorTop + interiorBottom) / 2

  const handleClick = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setSelected(data.id)
  }, [data.id, setSelected])

  return (
    <group
      ref={groupRef}
      position={[data.position.x, data.position.y, 0]}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true) }}
      onPointerOut={() => setIsHovered(false)}
    >
      <CabinetBox
        width={width}
        height={height}
        depth={depth}
        boxColor={data.boxColor}
        shelfY={shelfY}
      />

      {style.doors > 0 && (
        <Doors
          doorCount={style.doors as 1 | 2}
          width={width}
          doorZoneTop={doorZoneTop}
          doorZoneBottom={doorZoneBottom}
          depth={depth}
          faceColor={data.faceColor}
          handleSide={data.handleSide}
        />
      )}

      {style.drawers > 0 && (
        <Drawers
          drawerCount={style.drawers}
          width={width}
          drawerZoneTop={drawerZoneTop}
          drawerZoneBottom={drawerZoneBottom}
          depth={depth}
          faceColor={data.faceColor}
        />
      )}

      {/* Applied ends */}
      {data.appliedEndLeft && (() => {
        const finish = getFinish(data.appliedEndLeft)
        return (
          <group position={[-(T / 2 + 0.01), 0, 0]}>
            <mesh position={[0, height / 2, depth / 2]} castShadow>
              <boxGeometry args={[T, height, depth]} />
              <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
            </mesh>
          </group>
        )
      })()}
      {data.appliedEndRight && (() => {
        const finish = getFinish(data.appliedEndRight)
        return (
          <group position={[width + T / 2 + 0.01, 0, 0]}>
            <mesh position={[0, height / 2, depth / 2]} castShadow>
              <boxGeometry args={[T, height, depth]} />
              <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
            </mesh>
          </group>
        )
      })()}

      <DragHandler cabinetId={data.id} width={width} height={height} depth={depth} />

      {/* Selection / hover highlight */}
      {(isSelected || isHovered) && (
        <mesh position={[width / 2, height / 2, depth / 2]}>
          <boxGeometry args={[width + 0.5, height + 0.5, depth + 0.5]} />
          <meshBasicMaterial
            color={isSelected ? '#e94560' : '#4488ff'}
            transparent
            opacity={isSelected ? 0.15 : 0.08}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
