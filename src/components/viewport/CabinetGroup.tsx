import { useRef, useState, useCallback } from 'react'
import type { Group } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { CabinetData } from '../../types'
import { useStore } from '../../store/useStore'
import { getStyle } from '../../catalog/styles'
import { CabinetBox } from './CabinetBox'
import { Doors } from './Doors'
import { Drawers } from './Drawers'
import { DragHandler } from './DragHandler'
import { ArrowHandles } from './ArrowHandles'
import { TranslateGizmo } from './TranslateGizmo'

const DRAWER_HEIGHT = 6

interface CabinetGroupProps {
  data: CabinetData
}

export function CabinetGroup({ data }: CabinetGroupProps) {
  const groupRef = useRef<Group>(null)
  const selectedIds = useStore((s) => s.selectedIds)
  const setSelected = useStore((s) => s.setSelected)
  const toggleSelected = useStore((s) => s.toggleSelected)
  const isSelected = selectedIds.has(data.id)
  const gizmoStyle = useStore((s) => s.gizmoStyle)
  const [isHovered, setIsHovered] = useState(false)

  const style = getStyle(data.style)
  const { width, height, depth } = data

  // Compute door/drawer zones — full overlay: zones span full cabinet height
  // so faces cover the top/bottom panels. Each component applies REVEAL at edges.
  let drawerZoneTop = height
  let drawerZoneBottom = height
  let doorZoneTop = height
  let doorZoneBottom = 0

  if (data.style === 'combo') {
    // Combo pantry: top half = doors, bottom half = drawers, divided at midpoint
    const midpoint = height / 2
    doorZoneTop = height
    doorZoneBottom = midpoint
    drawerZoneTop = midpoint
    drawerZoneBottom = 0
  } else if (style.drawers > 0 && style.doors > 0) {
    const drawerZoneH = style.drawers * DRAWER_HEIGHT
    drawerZoneTop = height
    drawerZoneBottom = height - drawerZoneH
    doorZoneTop = drawerZoneBottom
    doorZoneBottom = 0
  } else if (style.drawers > 0 && style.doors === 0) {
    drawerZoneTop = height
    drawerZoneBottom = 0
  } else {
    doorZoneTop = height
    doorZoneBottom = 0
  }

  const shelfY = data.style === 'combo'
    ? height / 2
    : style.drawers > 0 && style.doors > 0
      ? drawerZoneBottom
      : height / 2

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.shiftKey) {
      toggleSelected(data.id)
    } else {
      setSelected(data.id)
    }
  }, [data.id, setSelected, toggleSelected])

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
        toeKick={data.toeKick}
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

      <DragHandler cabinetId={data.id} width={width} height={height} depth={depth} />

      {/* Selection / hover highlight */}
      {(isSelected || isHovered) && (
        <mesh position={[width / 2, height / 2, depth / 2]}>
          <boxGeometry args={[width + 0.5, height + 0.5, depth + 0.5]} />
          <meshBasicMaterial
            color={isSelected ? '#fbcf20' : '#4488ff'}
            transparent
            opacity={isSelected ? 0.15 : 0.08}
            depthWrite={false}
          />
        </mesh>
      )}

      {isSelected && gizmoStyle === 'arrows' && (
        <ArrowHandles width={width} height={height} depth={depth} showVertical={data.type === 'upper'} />
      )}
      {isSelected && gizmoStyle === 'translate' && (
        <TranslateGizmo width={width} height={height} depth={depth} showVertical={data.type === 'upper'} />
      )}
      {/* 'boundingBox' style: no extra widget — just the selection highlight */}
    </group>
  )
}
