import type { CabinetType, CabinetStyle } from '../types'

/**
 * Pre-configured cabinet arrangements.
 *
 * Each preset defines a list of cabinets with relative X offsets.
 * The placement engine auto-positions them starting from the left
 * edge of the wall (or centered, depending on fit).
 *
 * To add/remove presets, simply edit this array.
 */

export interface PresetCabinet {
  type: CabinetType
  style: CabinetStyle
  width: number
  height: number
  depth: number
  toeKick: number
  faceColor: string
  boxColor: string
  handleSide: 'left' | 'right'
}

export interface CabinetPreset {
  id: string
  name: string
  description: string
  cabinets: PresetCabinet[]
  /** If true, automatically add a countertop spanning the base cabinets */
  addCountertop?: boolean
}

export const cabinetPresets: CabinetPreset[] = [
  // ─────────────────────────────────────────────
  // 1. Full Garage Wall
  //    Pantries on each end with applied ends facing out,
  //    3 bases in the middle, 3 uppers above
  // ─────────────────────────────────────────────
  {
    id: 'full-wall',
    name: 'Full Garage Wall',
    description: 'Pantries bookending bases & uppers with applied ends',
    cabinets: [
      // Left pantry
      { type: 'pantry', style: '2dr', width: 24, height: 84, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'right' },
      // 3 bases
      { type: 'base', style: '3dw', width: 24, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '1dw2dr', width: 36, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '3dw', width: 24, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      // 3 uppers above the bases
      { type: 'upper', style: '2dr', width: 24, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '2dr', width: 36, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '2dr', width: 24, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      // Right pantry
      { type: 'pantry', style: '2dr', width: 24, height: 84, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
    ],
    addCountertop: true,
  },

  // ─────────────────────────────────────────────
  // 2. Workbench Station
  //    Drawer bank in center flanked by door cabinets,
  //    uppers above for tool storage
  // ─────────────────────────────────────────────
  {
    id: 'workbench',
    name: 'Workbench Station',
    description: '3 bases with drawer bank center, 3 uppers above',
    cabinets: [
      // Bases
      { type: 'base', style: '1dr', width: 24, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '4dw', width: 30, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '1dr', width: 24, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'right' },
      // Uppers
      { type: 'upper', style: '1dr', width: 24, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '2dr', width: 30, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '1dr', width: 24, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'right' },
    ],
    addCountertop: true,
  },

  // ─────────────────────────────────────────────
  // 3. Storage Tower Pair
  //    Two tall combo pantries with uppers between them
  // ─────────────────────────────────────────────
  {
    id: 'storage-towers',
    name: 'Storage Towers',
    description: '2 combo pantries with 3 uppers between',
    cabinets: [
      { type: 'pantry', style: 'combo', width: 24, height: 84, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'right' },
      { type: 'base', style: '4dw', width: 30, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '1dw2dr', width: 36, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '4dw', width: 30, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '2dr', width: 30, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '2dr', width: 36, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '2dr', width: 30, height: 24, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'pantry', style: 'combo', width: 24, height: 84, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
    ],
    addCountertop: true,
  },

  // ─────────────────────────────────────────────
  // 4. Drawer Bank
  //    All-drawer run for maximum organized storage
  // ─────────────────────────────────────────────
  {
    id: 'drawer-bank',
    name: 'Drawer Bank',
    description: '4 base drawer cabinets for maximum storage',
    cabinets: [
      { type: 'base', style: '3dw', width: 24, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '4dw', width: 24, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '4dw', width: 24, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'base', style: '3dw', width: 24, height: 30, depth: 24, toeKick: 6, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
    ],
    addCountertop: true,
  },

  // ─────────────────────────────────────────────
  // 5. Upper Wall
  //    Row of upper cabinets — lightweight wall storage
  // ─────────────────────────────────────────────
  {
    id: 'upper-wall',
    name: 'Upper Wall',
    description: '5 upper cabinets for overhead storage',
    cabinets: [
      { type: 'upper', style: '1dr', width: 18, height: 30, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '2dr', width: 30, height: 30, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: 'open', width: 24, height: 30, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'left' },
      { type: 'upper', style: '2dr', width: 30, height: 30, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'right' },
      { type: 'upper', style: '1dr', width: 18, height: 30, depth: 12, toeKick: 0, faceColor: 'black', boxColor: 'white', handleSide: 'right' },
    ],
  },
]
