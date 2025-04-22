import { create } from 'zustand'
import { Workout } from '@/types/types'


interface WorkoutFilterStore {
  selectedTime: string | null
  selectedMuscles: string[]
  selectedEquipment: string[]
  selectedLevel: string | null
  searchQuery: string

  setTime: (time: string | null) => void
  setMuscles: (muscles: string[]) => void
  setEquipment: (equipment: string[]) => void
  setLevel: (level: string | null) => void
  setSearchQuery: (query: string) => void

  resetFilters: () => void
}

export const useWorkoutFilterStore = create<WorkoutFilterStore>((set) => ({
  selectedTime: null,
  selectedMuscles: [],
  selectedEquipment: [],
  selectedLevel: null,
  searchQuery: '',

  setTime: (time) => set({ selectedTime: time }),
  setMuscles: (muscles) => set({ selectedMuscles: muscles }),
  setEquipment: (equipment) => set({ selectedEquipment: equipment }),
  setLevel: (level) => set({ selectedLevel: level }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  resetFilters: () =>
    set({
      selectedTime: null,
      selectedMuscles: [],
      selectedEquipment: [],
      selectedLevel: null,
      searchQuery: '',
    }),
}))

