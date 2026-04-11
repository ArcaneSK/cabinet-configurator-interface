import { describe, it, expect, beforeEach } from 'vitest'
import { findAdjacentUpperGroups, isAppliedEndValid, getInvalidAppliedEnds, clampDimensionToFit, splitAppliedEndsOnCabinetRemoval } from './appliedEnds'
import type { CabinetData, AppliedEndData } from '../types'

function makeUpper(id: string, x: number, width: number, y = 54, depth = 12): CabinetData {
  return {
    id,
    type: 'upper',
    style: '1dr',
    width,
    height: 24,
    depth,
    isCustomSize: false,
    faceColor: 'black',
    boxColor: 'white',
    position: { x, y },
    handleSide: 'left',
    toeKick: 0,
  }
}

describe('findAdjacentUpperGroups', () => {
  it('returns empty array for no cabinets', () => {
    expect(findAdjacentUpperGroups([])).toEqual([])
  })

  it('returns empty array when only bases are present', () => {
    const base: CabinetData = { ...makeUpper('a', 0, 24), type: 'base', position: { x: 0, y: 6 } }
    expect(findAdjacentUpperGroups([base])).toEqual([])
  })

  it('groups two adjacent uppers with matching Y and depth', () => {
    const groups = findAdjacentUpperGroups([
      makeUpper('a', 0, 24),
      makeUpper('b', 24, 24),
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0].map(c => c.id)).toEqual(['a', 'b'])
  })

  it('splits uppers at different Y into separate groups', () => {
    const groups = findAdjacentUpperGroups([
      makeUpper('a', 0, 24, 54),
      makeUpper('b', 24, 24, 60),
    ])
    expect(groups).toHaveLength(2)
  })

  it('splits uppers at different depth into separate groups', () => {
    const groups = findAdjacentUpperGroups([
      makeUpper('a', 0, 24, 54, 12),
      makeUpper('b', 24, 24, 54, 15),
    ])
    expect(groups).toHaveLength(2)
  })

  it('splits uppers with a gap greater than 1 inch', () => {
    const groups = findAdjacentUpperGroups([
      makeUpper('a', 0, 24),
      makeUpper('b', 26, 24), // 2" gap
    ])
    expect(groups).toHaveLength(2)
  })

  it('keeps uppers with a gap up to 1 inch in the same group', () => {
    const groups = findAdjacentUpperGroups([
      makeUpper('a', 0, 24),
      makeUpper('b', 25, 24), // 1" gap
    ])
    expect(groups).toHaveLength(1)
  })

  it('returns cabinets in each group sorted by position.x', () => {
    const groups = findAdjacentUpperGroups([
      makeUpper('b', 24, 24),
      makeUpper('a', 0, 24),
    ])
    expect(groups[0].map(c => c.id)).toEqual(['a', 'b'])
  })
})

describe('isAppliedEndValid', () => {
  it('returns true for a length-1 left end whose cabinet exists', () => {
    const cabs = { a: makeUpper('a', 0, 24) }
    const end: AppliedEndData = { id: 'e1', side: 'left', finishId: 'black', cabinetIds: ['a'] }
    expect(isAppliedEndValid(end, cabs)).toBe(true)
  })

  it('returns false for a length-1 end whose cabinet was removed', () => {
    const end: AppliedEndData = { id: 'e1', side: 'left', finishId: 'black', cabinetIds: ['gone'] }
    expect(isAppliedEndValid(end, {})).toBe(false)
  })

  it('returns true for a bottom end that still spans contiguous matching uppers', () => {
    const cabs = {
      a: makeUpper('a', 0, 24),
      b: makeUpper('b', 24, 24),
    }
    const end: AppliedEndData = { id: 'e1', side: 'bottom', finishId: 'black', cabinetIds: ['a', 'b'] }
    expect(isAppliedEndValid(end, cabs)).toBe(true)
  })

  it('returns false for a bottom end when one cabinet moved to a different Y', () => {
    const cabs = {
      a: makeUpper('a', 0, 24, 54),
      b: makeUpper('b', 24, 24, 60),
    }
    const end: AppliedEndData = { id: 'e1', side: 'bottom', finishId: 'black', cabinetIds: ['a', 'b'] }
    expect(isAppliedEndValid(end, cabs)).toBe(false)
  })

  it('returns false for a bottom end when one cabinet has a different depth', () => {
    const cabs = {
      a: makeUpper('a', 0, 24, 54, 12),
      b: makeUpper('b', 24, 24, 54, 15),
    }
    const end: AppliedEndData = { id: 'e1', side: 'bottom', finishId: 'black', cabinetIds: ['a', 'b'] }
    expect(isAppliedEndValid(end, cabs)).toBe(false)
  })

  it('returns false for a bottom end where cabinets are no longer contiguous', () => {
    const cabs = {
      a: makeUpper('a', 0, 24),
      b: makeUpper('b', 30, 24), // 6" gap
    }
    const end: AppliedEndData = { id: 'e1', side: 'bottom', finishId: 'black', cabinetIds: ['a', 'b'] }
    expect(isAppliedEndValid(end, cabs)).toBe(false)
  })
})

describe('getInvalidAppliedEnds', () => {
  it('returns ids of ends whose anchor cabinet is missing', () => {
    const cabs = { a: makeUpper('a', 0, 24) }
    const ends = {
      e1: { id: 'e1', side: 'left', finishId: 'black', cabinetIds: ['a'] } as AppliedEndData,
      e2: { id: 'e2', side: 'left', finishId: 'black', cabinetIds: ['gone'] } as AppliedEndData,
    }
    expect(getInvalidAppliedEnds(cabs, ends)).toEqual(['e2'])
  })
})

function makeBase(id: string, x: number, width: number): CabinetData {
  return {
    id,
    type: 'base',
    style: '1dr',
    width,
    height: 30,
    depth: 24,
    isCustomSize: false,
    faceColor: 'black',
    boxColor: 'white',
    position: { x, y: 6 },
    handleSide: 'left',
    toeKick: 6,
  }
}

describe('clampDimensionToFit', () => {
  it('returns the requested dimensions when nothing collides', () => {
    const target = makeBase('a', 0, 24)
    const others: CabinetData[] = []
    const result = clampDimensionToFit(target, { width: 30, height: 30, depth: 24 }, others)
    expect(result).toEqual({ width: 30, height: 30, depth: 24 })
  })

  it('clamps width down to the largest value that does not collide with a right neighbor', () => {
    const target = makeBase('a', 0, 24)   // occupies x=[0, 24)
    const neighbor = makeBase('b', 30, 24) // occupies x=[30, 54)
    // Requesting width=36 would push to x=[0, 36) and collide.
    // Max non-colliding width = 30 (touches but does not overlap).
    const result = clampDimensionToFit(target, { width: 36, height: 30, depth: 24 }, [neighbor])
    expect(result.width).toBe(30)
  })

  it('clamps width but leaves height and depth untouched when only width is requested larger', () => {
    const target = makeBase('a', 0, 24)
    const neighbor = makeBase('b', 30, 24)
    const result = clampDimensionToFit(target, { width: 36, height: 30, depth: 24 }, [neighbor])
    expect(result.height).toBe(30)
    expect(result.depth).toBe(24)
  })

  it('solves width, height, depth independently in W -> H -> D order', () => {
    // Two neighbors: one restricts width, another (a base above) restricts height.
    const target = makeBase('a', 0, 24)   // occupies x=[0, 24), y=[6, 36)
    const rightNeighbor = makeBase('b', 30, 24) // occupies x=[30, 54)
    const baseAbove: CabinetData = {
      ...makeBase('c', 0, 24),
      position: { x: 0, y: 44 }, // occupies y=[44, 74)
    }
    // Requesting height=40 would push to y=[6, 46), colliding with baseAbove at y=[44, 74).
    // Max non-colliding height = 38 (to reach y=[6, 44)).
    const result = clampDimensionToFit(
      target,
      { width: 36, height: 40, depth: 24 },
      [rightNeighbor, baseAbove]
    )
    expect(result.width).toBeLessThanOrEqual(30)
    expect(result.height).toBeLessThanOrEqual(38)
  })

  it('leaves the current value when even the current value would collide (defensive)', () => {
    // Target is already overlapping — shouldn't happen in practice, but helper must not loop forever.
    const target = makeBase('a', 0, 24)
    const overlap = makeBase('b', 10, 24) // overlaps target
    const result = clampDimensionToFit(target, { width: 30, height: 30, depth: 24 }, [overlap])
    expect(result.width).toBe(24) // unchanged from current
  })
})

import { useStore } from '../store/useStore'

describe('resizeCabinet store action', () => {
  beforeEach(() => {
    useStore.setState({
      cabinets: {},
      countertops: {},
      appliedEnds: {},
      selectedIds: new Set<string>(),
    })
  })

  it('clamps width down when a neighbor would collide', () => {
    const aId = useStore.getState().addCabinet({
      type: 'base', style: '1dr', width: 24, height: 30, depth: 24,
      isCustomSize: false, faceColor: 'black', boxColor: 'white',
      position: { x: 0, y: 6 }, handleSide: 'left', toeKick: 6,
    })
    useStore.getState().addCabinet({
      type: 'base', style: '1dr', width: 24, height: 30, depth: 24,
      isCustomSize: false, faceColor: 'black', boxColor: 'white',
      position: { x: 30, y: 6 }, handleSide: 'left', toeKick: 6,
    })
    const result = useStore.getState().resizeCabinet(aId, { width: 40 })
    expect(result.committed.width).toBe(30)
    expect(useStore.getState().cabinets[aId].width).toBe(30)
  })

  it('removes a bottom applied end when resize breaks the group', () => {
    const aId = useStore.getState().addCabinet({
      type: 'upper', style: '1dr', width: 24, height: 24, depth: 12,
      isCustomSize: false, faceColor: 'black', boxColor: 'white',
      position: { x: 0, y: 54 }, handleSide: 'left', toeKick: 0,
    })
    const bId = useStore.getState().addCabinet({
      type: 'upper', style: '1dr', width: 24, height: 24, depth: 12,
      isCustomSize: false, faceColor: 'black', boxColor: 'white',
      position: { x: 24, y: 54 }, handleSide: 'left', toeKick: 0,
    })
    const endId = useStore.getState().addAppliedEnd({
      side: 'bottom', finishId: 'black', cabinetIds: [aId, bId],
    })
    const result = useStore.getState().resizeCabinet(bId, { depth: 15 })
    expect(result.invalidatedAppliedEndIds).toContain(endId)
    expect(useStore.getState().appliedEnds[endId]).toBeUndefined()
  })
})

describe('splitAppliedEndsOnCabinetRemoval', () => {
  it('deletes a length-1 end whose cabinet is removed', () => {
    const cabs = { a: makeUpper('a', 0, 24) }
    const ends = {
      e1: { id: 'e1', side: 'left', finishId: 'black', cabinetIds: ['a'] } as AppliedEndData,
    }
    const result = splitAppliedEndsOnCabinetRemoval(['a'], cabs, ends)
    expect(result).toEqual({})
  })

  it('shrinks a bottom group when an edge cabinet is removed', () => {
    const cabs = {
      a: makeUpper('a', 0, 24),
      b: makeUpper('b', 24, 24),
      c: makeUpper('c', 48, 24),
    }
    const ends = {
      e1: { id: 'e1', side: 'bottom', finishId: 'black', cabinetIds: ['a', 'b', 'c'] } as AppliedEndData,
    }
    const nextCabs = { b: cabs.b, c: cabs.c }
    const result = splitAppliedEndsOnCabinetRemoval(['a'], nextCabs, ends)
    expect(Object.values(result)).toHaveLength(1)
    expect(Object.values(result)[0].cabinetIds).toEqual(['b', 'c'])
  })

  it('splits a bottom group into two when a middle cabinet is removed', () => {
    const cabs = {
      a: makeUpper('a', 0, 24),
      c: makeUpper('c', 48, 24),
    }
    const ends = {
      e1: { id: 'e1', side: 'bottom', finishId: 'black', cabinetIds: ['a', 'b', 'c'] } as AppliedEndData,
    }
    const result = splitAppliedEndsOnCabinetRemoval(['b'], cabs, ends)
    const runs = Object.values(result)
    expect(runs).toHaveLength(2)
    expect(runs[0].cabinetIds).toEqual(['a'])
    expect(runs[1].cabinetIds).toEqual(['c'])
    expect(runs.every(r => r.finishId === 'black')).toBe(true)
  })
})
