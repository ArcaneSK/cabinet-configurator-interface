export const standardCountertopLengths = [24, 36, 48, 60, 72, 96, 120]

export function findNearestStandardLength(computedLength: number): number {
  return standardCountertopLengths.reduce((prev, curr) =>
    Math.abs(curr - computedLength) < Math.abs(prev - computedLength) ? curr : prev
  )
}
