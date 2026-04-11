import type { CabinetData, CountertopData } from '../types'

export function recomputeCountertopLength(
  ct: CountertopData,
  cabinets: Record<string, CabinetData>
): number {
  const widthSum = ct.cabinetIds.reduce((sum, id) => {
    const c = cabinets[id]
    return c ? sum + c.width : sum
  }, 0)
  return widthSum + 1
}

export function recomputeAllCountertopLengths(
  cabinets: Record<string, CabinetData>,
  countertops: Record<string, CountertopData>
): Record<string, CountertopData> {
  const out: Record<string, CountertopData> = {}
  for (const [id, ct] of Object.entries(countertops)) {
    out[id] = { ...ct, length: recomputeCountertopLength(ct, cabinets) }
  }
  return out
}
