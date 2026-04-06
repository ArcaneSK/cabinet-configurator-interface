import type { CabinetData, CountertopData, WallConfig } from '../types'

interface ExportSchema {
  version: string
  wall: WallConfig
  items: (ExportCabinet | ExportCountertop)[]
  summary: {
    totalCabinets: number
    totalCountertops: number
    hasCustomSizes: boolean
  }
}

interface ExportCabinet {
  id: string
  type: 'cabinet'
  cabinetType: CabinetData['type']
  style: CabinetData['style']
  width: number
  height: number
  depth: number
  isCustomSize: boolean
  faceColor: string
  boxColor: string
  appliedEnds: { left: string | null; right: string | null; bottom: string | null }
  handleSide: CabinetData['handleSide']
  toeKick: number
  position: { x: number; y: number }
}

interface ExportCountertop {
  id: string
  type: 'countertop'
  length: number
  depth: number
  color: string
  spansOver: string[]
}

export function generateExport(
  wall: WallConfig,
  cabinets: Record<string, CabinetData>,
  countertops: Record<string, CountertopData>
): ExportSchema {
  const cabinetList = Object.values(cabinets)
  const countertopList = Object.values(countertops)

  const items: (ExportCabinet | ExportCountertop)[] = [
    ...cabinetList.map((c): ExportCabinet => ({
      id: c.id,
      type: 'cabinet',
      cabinetType: c.type,
      style: c.style,
      width: c.width,
      height: c.height,
      depth: c.depth,
      isCustomSize: c.isCustomSize,
      faceColor: c.faceColor,
      boxColor: c.boxColor,
      appliedEnds: { left: c.appliedEndLeft, right: c.appliedEndRight, bottom: c.appliedEndBottom },
      handleSide: c.handleSide,
      toeKick: c.toeKick,
      position: c.position,
    })),
    ...countertopList.map((ct): ExportCountertop => ({
      id: ct.id,
      type: 'countertop',
      length: ct.length,
      depth: ct.depth,
      color: ct.color,
      spansOver: ct.cabinetIds,
    })),
  ]

  return {
    version: '1.0',
    wall,
    items,
    summary: {
      totalCabinets: cabinetList.length,
      totalCountertops: countertopList.length,
      hasCustomSizes: cabinetList.some(c => c.isCustomSize),
    },
  }
}
