// stores/useWorkoutDataStore.ts
import { create } from 'zustand'
import { Workout } from '@/types/types'

interface WorkoutDataStore {
  allAvailableWorkouts: Workout[]
  filteredWorkouts: Workout[]

  setAllAvailableWorkouts: (data: Workout[]) => void
  setFilteredWorkouts: (data: Workout[]) => void
  resetWorkouts: () => void
}

export const useWorkoutDataStore = create<WorkoutDataStore>((set) => ({
  allAvailableWorkouts: [],
  filteredWorkouts: [],

  setAllAvailableWorkouts: (data) => set({ allAvailableWorkouts: data }),
  setFilteredWorkouts: (data) => set({ filteredWorkouts: data }),
  resetWorkouts: () => set({ allAvailableWorkouts: [], filteredWorkouts: [] }),
}))
