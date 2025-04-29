// src/stores/useHydrationStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UnitType = "ml" | "oz" | "cups";

interface HydrationState {
  waterAmount: number;
  waterGoal: number;
  unitType: UnitType;
  setWaterAmount: (amount: number) => void;
  addWater: (amount: number) => void;
  setWaterGoal: (goal: number) => void;
  setUnitType: (unit: UnitType) => void;
  resetHydration: () => void;
}

export const useHydrationStore = create<HydrationState>()(
  persist(
    (set) => ({
      waterAmount: 0,
      waterGoal: 2000,
      unitType: "ml",
      setWaterAmount: (amount) => set({ waterAmount: amount }),
      addWater: (amount) => set((state) => ({ waterAmount: state.waterAmount + amount })),
      setWaterGoal: (goal) => set({ waterGoal: goal }),
      setUnitType: (unit) => set({ unitType: unit }),
      resetHydration: () => set({ waterAmount: 0 }),
    }),
    {
      name: "hydration-store",
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
);


// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// type UnitType = "ml" | "oz" | "cups";

// interface HydrationState {
//   waterAmount: number;
//   waterGoal: number;
//   unitType: UnitType;

//   setWaterAmount: (amount: number) => void;
//   addWater: (amount: number) => void;
//   setWaterGoal: (goal: number) => void;
//   setUnitType: (unit: UnitType) => void;
//   resetHydration: () => void;
// }

// export const useHydrationStore = create<HydrationState>()(
//   persist(
//     (set) => ({
//       waterAmount: 0,
//       waterGoal: 2000,
//       unitType: "ml",

//       setWaterAmount: (amount) => set({ waterAmount: amount }),
//       addWater: (amount) =>
//         set((state) => ({ waterAmount: state.waterAmount + amount })),
//       setWaterGoal: (goal) => set({ waterGoal: goal }),
//       setUnitType: (unit) => set({ unitType: unit }),
//       resetHydration: () => set({ waterAmount: 0 }),
//     }),
//     {
//       name: "hydration-store",
//       storage: {
//         getItem: async (name) => {
//           const value = await AsyncStorage.getItem(name);
//           return value ? JSON.parse(value) : null;
//         },
//         setItem: async (name, value) => {
//           await AsyncStorage.setItem(name, JSON.stringify(value));
//         },
//         removeItem: async (name) => {
//           await AsyncStorage.removeItem(name);
//         },
//       },
//     }
//   )
// );
