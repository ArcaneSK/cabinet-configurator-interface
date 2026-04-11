import type { CabinetData, CountertopData, WallConfig, AppliedEndData } from '../types'

interface ExportSchema {
  version: string
  wall: WallConfig
  items: (ExportCabinet | ExportCountertop | ExportAppliedEnd)[]
  summary: {
    totalCabinets: number
    totalCountertops: number
    totalAppliedEnds: number
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

interface ExportAppliedEnd {
  id: string
  type: 'appliedEnd'
  side: 'left' | 'right' | 'bottom'
  finishId: string
  cabinetIds: string[]
}

export function generateExport(
  wall: WallConfig,
  cabinets: Record<string, CabinetData>,
  countertops: Record<string, CountertopData>,
  appliedEnds: Record<string, AppliedEndData>
): ExportSchema {
  const cabinetList = Object.values(cabinets)
  const countertopList = Object.values(countertops)
  const appliedEndList = Object.values(appliedEnds)

  const items: (ExportCabinet | ExportCountertop | ExportAppliedEnd)[] = [
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
    ...appliedEndList.map((ae): ExportAppliedEnd => ({
      id: ae.id,
      type: 'appliedEnd',
      side: ae.side,
      finishId: ae.finishId,
      cabinetIds: ae.cabinetIds,
    })),
  ]

  return {
    version: '1.0',
    wall,
    items,
    summary: {
      totalCabinets: cabinetList.length,
      totalCountertops: countertopList.length,
      totalAppliedEnds: appliedEndList.length,
      hasCustomSizes: cabinetList.some(c => c.isCustomSize),
    },
  }
}
