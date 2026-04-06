import { create } from 'zustand'
import { temporal } from 'zundo'
import { v4 as uuid } from 'uuid'
import type {
  CabinetData, CountertopData, SnapSettings, WallConfig,
  CabinetSnapshot, GhostModeState, GizmoStyle
} from '../types'

interface AppState {
  // Wall
  wall: WallConfig
  setWall: (wall: Partial<WallConfig>) => void

  // Cabinets
  cabinets: Record<string, CabinetData>
  addCabinet: (cabinet: Omit<CabinetData, 'id'>) => string
  updateCabinet: (id: string, updates: Partial<CabinetData>) => void
  updateCabinets: (updates: Record<string, Partial<CabinetData>>) => void
  removeCabinet: (id: string) => void
  removeCabinets: (ids: Set<string>) => void

  // Countertops
  countertops: Record<string, CountertopData>
  addCountertop: (cabinetIds: string[]) => string
  removeCountertop: (id: string) => void

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
          const newSelected = new Set(state.selectedIds)
          newSelected.delete(id)
          return { cabinets: rest, countertops, selectedIds: newSelected }
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
          return { cabinets, countertops, selectedIds: new Set<string>() }
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
            overhang: { front: 1, sides: 0.5 },
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
