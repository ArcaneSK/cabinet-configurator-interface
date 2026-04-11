import { describe, it, expect } from 'vitest'
import { recomputeCountertopLength, recomputeAllCountertopLengths } from './countertops'
import type { CabinetData, CountertopData } from '../types'

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

function makeCt(id: string, cabinetIds: string[]): CountertopData {
  return {
    id,
    cabinetIds,
    length: 0,
    depth: 25,
    color: 'black',
    overhang: { front: 0.75, sides: 0.75 },
  }
}

describe('recomputeCountertopLength', () => {
  it('sums cabinet widths plus 1"', () => {
    const cabs = { a: makeBase('a', 0, 24), b: makeBase('b', 24, 30) }
    const ct = makeCt('c1', ['a', 'b'])
    expect(recomputeCountertopLength(ct, cabs)).toBe(55)
  })

  it('ignores missing cabinet ids', () => {
    const cabs = { a: makeBase('a', 0, 24) }
    const ct = makeCt('c1', ['a', 'gone'])
    expect(recomputeCountertopLength(ct, cabs)).toBe(25)
  })
})

describe('recomputeAllCountertopLengths', () => {
  it('returns a new map with updated lengths', () => {
    const cabs = { a: makeBase('a', 0, 24), b: makeBase('b', 24, 30) }
    const cts = {
      c1: makeCt('c1', ['a']),
      c2: makeCt('c2', ['a', 'b']),
    }
    const result = recomputeAllCountertopLengths(cabs, cts)
    expect(result.c1.length).toBe(25)
    expect(result.c2.length).toBe(55)
  })
})
