import { describe, it, expect } from 'vitest'
import { generateExport } from './export'

describe('generateExport', () => {
  it('includes applied ends as items and counts them in summary', () => {
    const wall = { width: 192, height: 108 }
    const cabinets = {
      a: {
        id: 'a',
        type: 'base' as const,
        style: '1dr' as const,
        width: 24,
        height: 30,
        depth: 24,
        isCustomSize: false,
        faceColor: 'black',
        boxColor: 'white',
        position: { x: 0, y: 6 },
        handleSide: 'left' as const,
        toeKick: 6,
      },
    }
    const countertops = {}
    const appliedEnds = {
      e1: {
        id: 'e1',
        side: 'left' as const,
        finishId: 'black',
        cabinetIds: ['a'],
      },
    }
    const result = generateExport(wall, cabinets, countertops, appliedEnds)
    expect(result.items.some(i => i.type === 'appliedEnd')).toBe(true)
    expect(result.summary.totalAppliedEnds).toBe(1)
  })

  it('includes isCustomSize per cabinet and hasCustomSizes in summary', () => {
    const cabinets = {
      a: {
        id: 'a',
        type: 'base' as const,
        style: '1dr' as const,
        width: 27,
        height: 30,
        depth: 24,
        isCustomSize: true,
        faceColor: 'black',
        boxColor: 'white',
        position: { x: 0, y: 6 },
        handleSide: 'left' as const,
        toeKick: 6,
      },
    }
    const result = generateExport({ width: 192, height: 108 }, cabinets, {}, {})
    const cab = result.items.find((i) => i.type === 'cabinet')
    expect(cab && 'isCustomSize' in cab && cab.isCustomSize).toBe(true)
    expect(result.summary.hasCustomSizes).toBe(true)
  })
})
