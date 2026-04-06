import { useCallback, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { checkCollision } from '../../systems/collision'
import { GhostCabinetMesh } from './GhostCabinetMesh'

// Module-level ref for live anchor X — readable by Layout for sidebar-drag placement
export const ghostAnchorX = { current: 0 }

export function GhostOverlay() {
  const ghostMode = useStore((s) => s.ghostMode)
  const { camera, gl } = useThree()

  // Mutable refs for per-frame tracking (no React re-renders)
  const ghostPositions = useRef<[number, number, number][]>([])
  const isColliding = useRef(false)
  const needsUpdate = useRef(false)
  // React state only for rendering
  const [renderState, setRenderState] = useState<{
    positions: [number, number, number][]
    colliding: boolean
  }>({ positions: [], colliding: false })

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    const state = useStore.getState()
    if (!state.ghostMode) return

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(
      (e.nativeEvent.offsetX / gl.domElement.clientWidth) * 2 - 1,
      -(e.nativeEvent.offsetY / gl.domElement.clientHeight) * 2 + 1
    )
    raycaster.setFromCamera(mouse, camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    let ax = intersection.x
    // Grid snap
    if (state.snapSettings.grid) {
      ax = Math.round(ax / state.snapSettings.gridSize) * state.snapSettings.gridSize
    }

    const ghosts = state.ghostMode.ghosts
    // Compute positions
    const positions: [number, number, number][] = ghosts.map((g) => [
      ax + g.offsetX, g.position[1], g.position[2],
    ])

    // Clamp group to wall
    let groupLeft = Infinity, groupRight = -Infinity
    for (let i = 0; i < ghosts.length; i++) {
      groupLeft = Math.min(groupLeft, positions[i][0])
      groupRight = Math.max(groupRight, positions[i][0] + ghosts[i].width)
    }
    if (groupLeft < 0) {
      const shift = -groupLeft
      for (const p of positions) p[0] += shift
      ax += shift
    }
    if (groupRight > state.wall.width) {
      const shift = groupRight - state.wall.width
      for (const p of positions) p[0] -= shift
      ax -= shift
    }

    // Check collision per ghost
    const allCabinets = Object.values(state.cabinets)
    let colliding = false
    for (let i = 0; i < ghosts.length; i++) {
      if (checkCollision(
        { x: positions[i][0], width: ghosts[i].width, type: ghosts[i].type, height: ghosts[i].height, y: positions[i][1] },
        allCabinets
      )) {
        colliding = true
        break
      }
    }

    // Update refs
    ghostPositions.current = positions
    ghostAnchorX.current = ax
    const collidingChanged = isColliding.current !== colliding
    isColliding.current = colliding
    needsUpdate.current = true

    // Only update store if collision state changed
    if (collidingChanged) {
      state.setGhostMode({ ...state.ghostMode, isColliding: colliding, anchorWorldX: ax })
    }
  }, [camera, gl])

  // Sync render state at frame rate
  useFrame(() => {
    if (needsUpdate.current) {
      needsUpdate.current = false
      setRenderState({
        positions: [...ghostPositions.current],
        colliding: isColliding.current,
      })
    }
  })

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    const state = useStore.getState()
    if (!state.ghostMode) return

    // Right-click cancels ghost mode (no stopPropagation so OrbitControls can still orbit)
    if (e.button === 2) {
      state.cancelGhostMode()
      return
    }

    if (e.button !== 0) return
    // Sidebar drag uses pointerup in Layout, not click here
    if (state.ghostMode.type === 'sidebar-drag') return
    if (isColliding.current) return

    e.stopPropagation()

    // Place all ghosts as real cabinets
    const ghosts = state.ghostMode.ghosts
    const positions = ghostPositions.current
    for (let i = 0; i < ghosts.length; i++) {
      const g = ghosts[i]
      const pos = positions[i] || g.position
      if (g.snapshot) {
        // Paste/duplicate: use full snapshot data to preserve all cabinet properties
        const { offsetX: _ox, ...cabinetData } = g.snapshot
        state.addCabinet({
          ...cabinetData,
          position: { x: pos[0], y: pos[1] },
        })
      } else {
        // Fallback for ghosts without snapshot: create cabinet with defaults
        state.addCabinet({
          type: g.type,
          style: g.style,
          width: g.width,
          height: g.height,
          depth: g.depth,
          isCustomSize: false,
          faceColor: g.color,
          boxColor: 'white',
          position: { x: pos[0], y: pos[1] },
          appliedEndLeft: null,
          appliedEndRight: null,
          handleSide: 'left',
        })
      }
    }

    state.cancelGhostMode()
  }, [])

  if (!ghostMode) return null

  return (
    <>
      {/* Invisible interaction plane */}
      <mesh
        position={[96, 54, 0]}
        visible={false}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
      >
        <planeGeometry args={[500, 500]} />
      </mesh>

      {/* Ghost meshes */}
      {ghostMode.ghosts.map((g, i) => (
        <GhostCabinetMesh
          key={i}
          position={renderState.positions[i] || g.position}
          width={g.width}
          height={g.height}
          depth={g.depth}
          isColliding={renderState.colliding}
        />
      ))}
    </>
  )
}
