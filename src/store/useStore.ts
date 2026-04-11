import { create } from 'zustand'
import { temporal } from 'zundo'
import { v4 as uuid } from 'uuid'
import type {
  CabinetData, CountertopData, SnapSettings, WallConfig,
  CabinetSnapshot, GhostModeState, GizmoStyle, AppliedEndData,
} from '../types'
import { clampDimensionToFit, getInvalidAppliedEnds, splitAppliedEndsOnCabinetRemoval } from '../systems/appliedEnds'
import { recomputeAllCountertopLengths } from '../systems/countertops'

interface AppState {
  // Wall
  wall: WallConfig
  setWall: (wall: Partial<WallConfig>) => void

  // Cabinets
  cabinets: Record<string, CabinetData>
  addCabinet: (cabinet: Omit<CabinetData, 'id'>) => string
  updateCabinet: (id: string, updates: Partial<CabinetData>) => void
  updateCabinets: (updates: Record<string, Partial<CabinetData>>) => void
  resizeCabinet: (id: string, dims: Partial<{ width: number; height: number; depth: number }>) => {
    committed: { width: number; height: number; depth: number }
    invalidatedAppliedEndIds: string[]
  }
  removeCabinet: (id: string) => void
  removeCabinets: (ids: Set<string>) => void

  // Countertops
  countertops: Record<string, CountertopData>
  addCountertop: (cabinetIds: string[]) => string
  removeCountertop: (id: string) => void

  // Applied ends
  appliedEnds: Record<string, AppliedEndData>
  addAppliedEnd: (end: Omit<AppliedEndData, 'id'>) => string
  removeAppliedEnd: (id: string) => void
  updateAppliedEnd: (id: string, updates: Partial<AppliedEndData>) => void
  removeCabinetFromBottomGroup: (cabinetId: string) => void

  // Selection (multi-select)
  selectedIds: Set<string>
  setSelected: (id: string) => void
  toggleSelected: (id: string) => void
  setSelectedMany: (ids: Set<string>) => void
  clearSelection: () => void
  selectAll: () => void

  // Clipboard & ghost mode
  clipboard: CabinetSnapshot[]
  ghostMode: GhostModeState | null
  copySelection: () => void
  setGhostMode: (mode: GhostModeState | null) => void
  cancelGhostMode: () => void

  // Gizmo style
  gizmoStyle: GizmoStyle
  setGizmoStyle: (style: GizmoStyle) => void

  // Snap settings
  snapSettings: SnapSettings
  setSnapSettings: (settings: Partial<SnapSettings>) => void

  // UI toggles
  showDimensions: boolean
  setShowDimensions: (show: boolean) => void
}

export const useStore = create<AppState>()(
  temporal(
    (set, get) => ({
      // Wall
      wall: { width: 192, height: 108 },
      setWall: (updates) =>
        set((state) => ({ wall: { ...state.wall, ...updates } })),

      // Cabinets
      cabinets: {},
      addCabinet: (cabinet) => {
        const id = uuid()
        set((state) => ({
          cabinets: { ...state.cabinets, [id]: { ...cabinet, id } },
        }))
        return id
      },
      updateCabinet: (id, updates) =>
        set((state) => ({
          cabinets: {
            ...state.cabinets,
            [id]: { ...state.cabinets[id], ...updates },
          },
        })),
      resizeCabinet: (id, dims) => {
        const state = get()
        const cabinet = state.cabinets[id]
        if (!cabinet) {
          return { committed: { width: 0, height: 0, depth: 0 }, invalidatedAppliedEndIds: [] }
        }
        const requested = {
          width: dims.width ?? cabinet.width,
          height: dims.height ?? cabinet.height,
          depth: dims.depth ?? cabinet.depth,
        }
        const others = Object.values(state.cabinets).filter(c => c.id !== id)
        const committed = clampDimensionToFit(cabinet, requested, others)

        // Apply cabinet update + recompute countertop lengths + delete invalid applied ends.
        // All in one set() so zundo records it as one undo step.
        let invalidated: string[] = []
        set((s) => {
          const nextCabinet = { ...cabinet, ...committed }
          const nextCabinets = { ...s.cabinets, [id]: nextCabinet }
          const nextCountertops = recomputeAllCountertopLengths(nextCabinets, s.countertops)
          invalidated = getInvalidAppliedEnds(nextCabinets, s.appliedEnds)
          const nextAppliedEnds = { ...s.appliedEnds }
          for (const eid of invalidated) delete nextAppliedEnds[eid]
          return {
            cabinets: nextCabinets,
            countertops: nextCountertops,
            appliedEnds: nextAppliedEnds,
          }
        })
        return { committed, invalidatedAppliedEndIds: invalidated }
      },
      updateCabinets: (updates) =>
        set((state) => {
          const cabinets = { ...state.cabinets }
          for (const [id, partial] of Object.entries(updates)) {
            if (cabinets[id]) {
              cabinets[id] = { ...cabinets[id], ...partial }
            }
          }
          return { cabinets }
        }),
      removeCabinet: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.cabinets
          const countertops = { ...state.countertops }
          for (const [ctId, ct] of Object.entries(countertops)) {
            if (ct.cabinetIds.includes(id)) {
              delete countertops[ctId]
            }
          }
          const appliedEnds = splitAppliedEndsOnCabinetRemoval([id], rest, state.appliedEnds)
          const newSelected = new Set(state.selectedIds)
          newSelected.delete(id)
          return { cabinets: rest, countertops, appliedEnds, selectedIds: newSelected }
        }),
      removeCabinets: (ids) =>
        set((state) => {
          const cabinets = { ...state.cabinets }
          const countertops = { ...state.countertops }
          for (const id of ids) {
            delete cabinets[id]
            for (const [ctId, ct] of Object.entries(countertops)) {
              if (ct.cabinetIds.includes(id)) {
                delete countertops[ctId]
              }
            }
          }
          const appliedEnds = splitAppliedEndsOnCabinetRemoval(Array.from(ids), cabinets, state.appliedEnds)
          const newSelected = new Set(state.selectedIds)
          for (const id of ids) newSelected.delete(id)
          return { cabinets, countertops, appliedEnds, selectedIds: newSelected }
        }),

      // Countertops
      countertops: {},
      addCountertop: (cabinetIds) => {
        const id = uuid()
        set((state) => {
          const totalWidth = cabinetIds.reduce((sum, cid) => {
            const cab = state.cabinets[cid]
            return cab ? sum + cab.width : sum
          }, 0)
          const ct: CountertopData = {
            id,
            cabinetIds,
            length: totalWidth + 1,
            depth: 25,
            color: 'black',
            overhang: { front: 0.75, sides: 0.75 },
          }
          return { countertops: { ...state.countertops, [id]: ct } }
        })
        return id
      },
      removeCountertop: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.countertops
          return { countertops: rest }
        }),

      // Applied ends
      appliedEnds: {},
      addAppliedEnd: (end) => {
        const id = uuid()
        set((state) => ({
          appliedEnds: { ...state.appliedEnds, [id]: { ...end, id } },
        }))
        return id
      },
      removeAppliedEnd: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.appliedEnds
          return { appliedEnds: rest }
        }),
      updateAppliedEnd: (id, updates) =>
        set((state) => ({
          appliedEnds: {
            ...state.appliedEnds,
            [id]: { ...state.appliedEnds[id], ...updates },
          },
        })),
      removeCabinetFromBottomGroup: (cabinetId: string) =>
        set((state) => {
          const next = { ...state.appliedEnds }
          for (const e of Object.values(state.appliedEnds)) {
            if (e.side !== 'bottom' || !e.cabinetIds.includes(cabinetId)) continue
            // Reuse the split helper by pretending this cabinet is being removed
            // from the bottom-AE's perspective only — cabinets map stays unchanged.
            const synthetic = { [e.id]: e }
            const split = splitAppliedEndsOnCabinetRemoval([cabinetId], state.cabinets, synthetic)
            delete next[e.id]
            for (const [k, v] of Object.entries(split)) next[k] = v
          }
          return { appliedEnds: next }
        }),

      // Selection
      selectedIds: new Set<string>(),
      setSelected: (id) => set({ selectedIds: new Set([id]) }),
      toggleSelected: (id) =>
        set((state) => {
          const next = new Set(state.selectedIds)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return { selectedIds: next }
        }),
      setSelectedMany: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: new Set<string>() }),
      selectAll: () =>
        set((state) => ({
          selectedIds: new Set(Object.keys(state.cabinets)),
        })),

      // Clipboard & ghost mode
      clipboard: [],
      ghostMode: null,
      copySelection: () => {
        const state = get()
        const selected = Array.from(state.selectedIds)
          .map((id) => state.cabinets[id])
          .filter(Boolean)
        if (selected.length === 0) return

        // Centroid = average center-point X of all selected cabinets
        const centroidX =
          selected.reduce((sum, c) => sum + c.position.x + c.width / 2, 0) /
          selected.length

        const snapshots: CabinetSnapshot[] = selected.map((c) => {
          const { id: _, ...rest } = c
          return { ...rest, offsetX: c.position.x - centroidX }
        })
        set({ clipboard: snapshots })
      },
      setGhostMode: (mode) => set({ ghostMode: mode }),
      cancelGhostMode: () => set({ ghostMode: null }),

      // Gizmo style
      gizmoStyle: 'arrows',
      setGizmoStyle: (style) => set({ gizmoStyle: style }),

      // Snap
      snapSettings: { grid: true, adjacent: true, gridSize: 1 },
      setSnapSettings: (updates) =>
        set((state) => ({
          snapSettings: { ...state.snapSettings, ...updates },
        })),

      // UI
      showDimensions: true,
      setShowDimensions: (show) => set({ showDimensions: show }),
    }),
    {
      // Exclude transient UI state from undo/redo history
      partialize: (state) => {
        const {
          selectedIds, clipboard, ghostMode, gizmoStyle,
          showDimensions, ...rest
        } = state
        return rest
      },
    }
  )
)

// useTemporalStore is unchanged from existing code
export const useTemporalStore = () => useStore.temporal
