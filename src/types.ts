export type CabinetType = 'base' | 'upper' | 'pantry'

export type CabinetStyle = '1dr' | '2dr' | 'open' | '1dw1dr' | '1dw2dr' | '3dw' | '4dw' | 'combo'

export interface CabinetData {
  id: string
  type: CabinetType
  style: CabinetStyle
  width: number
  height: number
  depth: number
  isCustomSize: boolean
  faceColor: string
  boxColor: string
  position: { x: number; y: number }
  handleSide: 'left' | 'right'
  toeKick: number // toe kick height in inches (base and pantry only)
}

export interface CountertopData {
  id: string
  cabinetIds: string[]
  length: number
  depth: number
  color: string
  overhang: { front: number; sides: number }
}

export interface SnapSettings {
  grid: boolean
  adjacent: boolean
  gridSize: number
}

export interface WallConfig {
  width: number
  height: number
}

export interface FinishOption {
  id: string
  name: string
  type: 'solid' | 'woodgrain'
  hex: string
  roughness: number
  textureUrl?: string
  uvRepeat?: [number, number]
}

export interface StyleDefinition {
  id: CabinetStyle
  label: string
  doors: number
  drawers: number
  allowedTypes: CabinetType[]
}

export interface SizeCatalog {
  widths: number[]
  heights: number[]
  depths: number[]
}

export type AppliedEndSide = 'left' | 'right' | 'bottom'

export interface AppliedEndData {
  id: string
  side: AppliedEndSide
  finishId: string
  // length 1 for 'left' | 'right', 1..N (sorted by position.x) for 'bottom'
  cabinetIds: string[]
}

export type CabinetSnapshot = Omit<CabinetData, 'id'> & {
  offsetX: number // X position relative to group centroid (center-point average)
}

export interface GhostCabinet {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  type: CabinetType
  style: CabinetStyle
  color: string         // faceColor for rendering
  offsetX: number       // offset from anchor point
  // Full snapshot data for placement (preserves handleSide, appliedEnds, boxColor, isCustomSize)
  snapshot?: CabinetSnapshot
}

export type GhostModeType = 'paste' | 'duplicate' | 'sidebar-drag'

export interface GhostModeState {
  type: GhostModeType
  ghosts: GhostCabinet[]
  anchorWorldX: number
  isColliding: boolean
}

export type GizmoStyle = 'arrows' | 'translate' | 'boundingBox'
