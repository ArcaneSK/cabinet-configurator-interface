import type { CabinetType, SizeCatalog } from '../types'

export const sizeCatalog: Record<CabinetType, SizeCatalog> = {
  base: {
    widths: [18, 24, 30, 36],
    heights: [30],
    depths: [24],
  },
  upper: {
    widths: [18, 24, 30, 36],
    heights: [12, 18, 24, 30],
    depths: [12, 15],
  },
  pantry: {
    widths: [18, 24, 30, 36],
    heights: [60, 72, 84, 96],
    depths: [24],
  },
}

export const customSizeConstraints = {
  width: { min: 12, max: 60 },
  height: { min: 12, max: 96 },
  depth: { min: 10, max: 36 },
}

export const defaultDimensions: Record<CabinetType, { width: number; height: number; depth: number }> = {
  base: { width: 24, height: 30, depth: 24 },
  upper: { width: 24, height: 24, depth: 12 },
  pantry: { width: 24, height: 84, depth: 24 },
}
