import type { FinishOption } from '../types'

export const finishes: FinishOption[] = [
  // Solids
  { id: 'white', name: 'White', type: 'solid', hex: '#F5F5F5', roughness: 0.5 },
  { id: 'black', name: 'Black', type: 'solid', hex: '#222222', roughness: 0.4 },
  { id: 'charcoal', name: 'Charcoal', type: 'solid', hex: '#555555', roughness: 0.45 },
  { id: 'red', name: 'Red', type: 'solid', hex: '#CC0000', roughness: 0.4 },
  { id: 'blue', name: 'Blue', type: 'solid', hex: '#0066CC', roughness: 0.4 },
  // Wood grains
  { id: 'oak', name: 'Oak', type: 'woodgrain', hex: '#C19A6B', roughness: 0.6, textureUrl: '/textures/oak.jpg', uvRepeat: [2, 2] },
  { id: 'walnut', name: 'Walnut', type: 'woodgrain', hex: '#5C4033', roughness: 0.55, textureUrl: '/textures/walnut.jpg', uvRepeat: [2, 2] },
  { id: 'maple', name: 'Maple', type: 'woodgrain', hex: '#E8D5B7', roughness: 0.5, textureUrl: '/textures/maple.jpg', uvRepeat: [2, 2] },
  { id: 'ebony', name: 'Ebony', type: 'woodgrain', hex: '#3C2415', roughness: 0.5, textureUrl: '/textures/ebony.jpg', uvRepeat: [2, 2] },
]

export function getFinish(id: string): FinishOption {
  return finishes.find(f => f.id === id) ?? finishes[0]
}
