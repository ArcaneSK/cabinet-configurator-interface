import { create } from 'zustand'
import { temporal } from 'zundo'
import { v4 as uuid } from 'uuid'
import type { CabinetData, CountertopData, SnapSettings, WallConfig } from '../types'

interface AppState {
  // Wall
  wall: WallConfig
  setWall: (wall: Partial<WallConfig>) => void

  // Cabinets
  cabinets: Record<string, CabinetData>
  addCabinet: (cabinet: Omit<CabinetData, 'id'>) => string
  updateCabinet: (id: string, updates: Partial<CabinetData>) => void
  removeCabinet: (id: string) => void

  // Countertops
  countertops: Record<string, CountertopData>
  addCountertop: (cabinetIds: string[]) => string
  removeCountertop: (id: string) => void

  // Selection
  selectedId: string | null
  setSelected: (id: string | null) => void

  // Snap settings
  snapSettings: SnapSettings
  setSnapSettings: (settings: Partial<SnapSettings>) => void

  // UI toggles
  showDimensions: boolean
  setShowDimensions: (show: boolean) => void
}

export const useStore = create<AppState>()(
  temporal(
    (set) => ({
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
      removeCabinet: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.cabinets
          // Remove any countertops that reference this cabinet
          const countertops = { ...state.countertops }
          for (const [ctId, ct] of Object.entries(countertops)) {
            if (ct.cabinetIds.includes(id)) {
              delete countertops[ctId]
            }
          }
          return { cabinets: rest, countertops, selectedId: state.selectedId === id ? null : state.selectedId }
        }),

      // Countertops
      countertops: {},
      addCountertop: (cabinetIds) => {
        const id = uuid()
        set((state) => {
          // Compute length from cabinet widths + overhang
          const totalWidth = cabinetIds.reduce((sum, cid) => {
            const cab = state.cabinets[cid]
            return cab ? sum + cab.width : sum
          }, 0)
          const ct: CountertopData = {
            id,
            cabinetIds,
            length: totalWidth + 1, // 0.5" overhang each side
            depth: 25, // 24" base depth + 1" front overhang
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
      selectedId: null,
      setSelected: (id) => set({ selectedId: id }),

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
      // Only track state changes for undo/redo, exclude selection and UI toggles
      partialize: (state) => {
        const { selectedId, showDimensions, ...rest } = state
        return rest
      },
    }
  )
)

export const useTemporalStore = () => useStore.temporal
