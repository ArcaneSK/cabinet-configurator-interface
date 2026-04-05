export type CabinetType = 'base' | 'upper' | 'pantry'

export type CabinetStyle = '1dr' | '2dr' | 'open' | '1dw1dr' | '1dw2dr' | '3dw' | '4dw'

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
  appliedEndLeft: string | null
  appliedEndRight: string | null
  handleSide: 'left' | 'right'
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
