import type { StyleDefinition, CabinetType } from '../types'

export const cabinetStyles: StyleDefinition[] = [
  { id: '1dr', label: '1 Door', doors: 1, drawers: 0, allowedTypes: ['base', 'upper', 'pantry'] },
  { id: '2dr', label: '2 Door', doors: 2, drawers: 0, allowedTypes: ['base', 'upper', 'pantry'] },
  { id: 'open', label: 'Open', doors: 0, drawers: 0, allowedTypes: ['base', 'upper', 'pantry'] },
  { id: '1dw1dr', label: '1 Drawer + 1 Door', doors: 1, drawers: 1, allowedTypes: ['base'] },
  { id: '1dw2dr', label: '1 Drawer + 2 Door', doors: 2, drawers: 1, allowedTypes: ['base'] },
  { id: '3dw', label: '3 Drawer', doors: 0, drawers: 3, allowedTypes: ['base'] },
  { id: '4dw', label: '4 Drawer', doors: 0, drawers: 4, allowedTypes: ['base'] },
]

export function getStylesForType(type: CabinetType): StyleDefinition[] {
  return cabinetStyles.filter(s => s.allowedTypes.includes(type))
}

export function getStyle(id: string): StyleDefinition {
  return cabinetStyles.find(s => s.id === id) ?? cabinetStyles[0]
}
