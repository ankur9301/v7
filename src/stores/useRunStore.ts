// src/store/useRunStore.ts

import { create } from "zustand"
import { persist } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"

// reuse the same types from your app—or declare them here:
export type LatLngPoint = {
  latitude: number
  longitude: number
  altitude?: number
  timestamp: number
}

export interface Run {
  id: string
  date: number
  duration: number
  distanceKm: number
  distanceMi: number
  pace: string
  calories: number
//   steps: number
  elevationFt: number
  path: LatLngPoint[]
}

interface RunStore {
  runs: Run[]
  addRun: (run: Omit<Run, "id" | "date">) => void
  clearRuns: () => void
}

export const useRunStore = create<RunStore>()(
  persist(
    (set) => ({
      runs: [],
      addRun: (run: Omit<Run, "id" | "date">) => {
        const newRun: Run = {
          id: uuidv4(),
          date: Date.now(),
          ...run,
        }
        set((state: RunStore) => ({ runs: [newRun, ...state.runs] }))
      },
      clearRuns: () => set({ runs: [] }),
    }),
    {
      name: "jog-tracker-runs",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
)
