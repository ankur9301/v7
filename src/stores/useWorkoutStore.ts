// stores/useWorkoutStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Workout } from '@/types/types';

// Enhanced SetLog type with the required properties
interface SetLog {
  id: string;
  weight: string;
  reps: string;
  logged: boolean;
  timestamp?: number;
}

type WorkoutStore = {
  plan: Workout[];
  logs: Record<string, SetLog[]>; // workoutId -> [sets]
  elapsed: number;
  calories: number;
 

  setPlan: (plan: Workout[]) => void;

  logSet: (workoutId: string, set: SetLog) => void;
  updateSet: (workoutId: string, setId: string, field: 'reps' | 'weight', value: string) => void;
  toggleLog: (workoutId: string, setId: string) => void;
  removeSet: (workoutId: string, setId: string) => void;
  addSet: (workoutId: string) => void;

  updateTimer: (secs: number) => void;
  resetSession: () => void;
  startTimer: () => void;   // <-- new
  stopTimer: () => void;    // <-- new
  intervalId?: NodeJS.Timeout | null; // Add intervalId to the WorkoutStore type
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      plan: [],
      logs: {},
      elapsed: 0,
      calories: 0,

      setPlan: (plan) => {
        console.log('[WorkoutStore] setPlan →', plan);
        set({ plan });
      },

      

      logSet: (workoutId, setEntry) => {
        const prev = get().logs[workoutId] || [];
        const updated = [...prev, setEntry];
        console.log(`[WorkoutStore] logSet →`, { workoutId, setEntry });
        set(state => ({
          logs: {
            ...state.logs,
            [workoutId]: updated
          }
        }));
        console.log("[Zustand] Updated Logs:", get().logs);

      },

      updateSet: (workoutId, setId, field, value) => {
        const prev = get().logs[workoutId] || [];
        const updated = prev.map(set =>
          set.id === setId ? { ...set, [field]: value } : set
        );
        console.log(`[WorkoutStore] updateSet →`, { workoutId, setId, field, value });
        set(state => ({
          logs: {
            ...state.logs,
            [workoutId]: updated
          }
        }));
        console.log("[Zustand] Updated Logs:", get().logs);

      },

      toggleLog: (workoutId, setId) => {
        const prev = get().logs[workoutId] || [];
        const updated = prev.map(set =>
          set.id === setId
            ? {
                ...set,
                logged: !set.logged,
                timestamp: !set.logged ? Date.now() : undefined
              }
            : set
        );
        console.log(`[WorkoutStore] toggleLog →`, { workoutId, setId });
        set(state => ({
          logs: {
            ...state.logs,
            [workoutId]: updated
          }
        }));
        console.log("[Zustand] Updated Logs:", get().logs);

      },

      removeSet: (workoutId, setId) => {
        const prev = get().logs[workoutId] || [];
        const updated = prev.filter(set => set.id !== setId);
        console.log(`[WorkoutStore] removeSet →`, { workoutId, setId });
        set(state => ({
          logs: {
            ...state.logs,
            [workoutId]: updated
          }
        }));
        console.log("[Zustand] Updated Logs:", get().logs);

      },

      addSet: (workoutId: string, initial?: Partial<Omit<SetLog,'id'>>) => {
        const newSet: SetLog = {
          id: Date.now().toString(),
          reps: initial?.reps ?? '',
          weight: initial?.weight ?? '',
          logged: initial?.logged  ?? false,
          timestamp: initial?.timestamp
        };
     
        
        const prev = get().logs[workoutId] || [];
        const updated = [...prev, newSet];
        console.log(`[WorkoutStore] addSet →`, { workoutId, newSet });
        set(state => ({
          logs: {
            ...state.logs,
            [workoutId]: updated
          }
        }));
        console.log("[Zustand] Updated Logs:", get().logs);

      },
      startTimer: () => {
        if (get().intervalId) {
          console.warn("⏱ Timer already running");
          return;
        }
      
        const interval = setInterval(() => {
          const current = get().elapsed + 1;
          get().updateTimer(current);
        }, 1000);
      
        set({ intervalId: interval });
      },
      
      stopTimer: () => {
        const id = get().intervalId;
        if (id) clearInterval(id);
        set({ intervalId: null });
      },

      updateTimer: (secs) => {
        set({ elapsed: secs, calories: Math.round((secs * 10) / 60) });
      },

      resetSession: () => {
        console.log('[WorkoutStore] resetSession');
        set({ plan: [], logs: {}, elapsed: 0, calories: 0 });
      }
    }),
    {
      name: 'workout-store',
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
        }
      }
    }
  )
);


// // stores/useWorkoutStore.ts
// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import type { Workout, SetLog, ExerciseLog } from '@/types/types'

// interface WorkoutState {
//     plan: any[];
//     logs: Record<string, ExerciseLog>; // key = exercise.id
//     elapsed: number;
//     calories: number;
//     resetAll: () => void;
//     logSet: (exerciseId: string, set: SetLog) => void;
//     addCalories: (c: number) => void;
//     tick: () => void;
//     setPlan: (plan: any[]) => void;
//     removeSet: (workoutId: string, index: number) => void;
//     addSet: (workoutId: string) => void;
//     resetSession: () => void;
//   }
  
// type WorkoutStore = {
//   plan: Workout[]
//   logs: Record<string, SetLog[]>
//   elapsed: number
//   calories: number

//   setPlan: (plan: Workout[]) => void
//   logSet: (workoutId: string, setEntry: SetLog) => void
//   updateTimer: (secs: number) => void
//   resetSession: () => void
// }

// export const useWorkoutStore = create<WorkoutStore>()(
//   persist(
//     (set, get) => ({
//       plan: [],
//       logs: {},
//       elapsed: 0,
//       calories: 0,

//       setPlan: (plan) => {
//         console.log('[WorkoutStore] setPlan →', plan)
//         set({ plan })
//       },

//       tick: () => set(state => ({ elapsed: state.elapsed + 1 })),

//       addCalories: (c: number) => set(state => ({ calories: state.calories + c })),

//       logSet: (workoutId, setEntry) => {
//         console.log(`[WorkoutStore] logSet for ${workoutId} →`, setEntry)
//         const prev = get().logs[workoutId] || []
//         set(state => ({
//           logs: { ...state.logs, [workoutId]: [...prev, setEntry] }
//         }))
//       },

//       updateTimer: (secs) => {
//         console.log('[WorkoutStore] updateTimer →', secs)
//         set({ elapsed: secs, calories: Math.round((secs * 10) / 60) })
//       },

//       resetSession: () => {
//         console.log('[WorkoutStore] resetSession')
//         set({ plan: [], logs: {}, elapsed: 0, calories: 0 })
//       }
//     }),
//     {
//       name: 'workout-store',
//       storage: {
//         getItem: async (name) => {
//           const value = await AsyncStorage.getItem(name)
//           return value ? JSON.parse(value) : null
//         },
//         setItem: async (name, value) => {
//           await AsyncStorage.setItem(name, JSON.stringify(value))
//         },
//         removeItem: async (name) => {
//           await AsyncStorage.removeItem(name)
//         }
//       }
//     }
//   )
// )


// // stores/useWorkoutStore.ts
// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import type { Workout, SetLog } from '@/types/types'

// // Shape of our state + actions
// type WorkoutStore = {
//   plan: Workout[]
//   logs: Record<string, SetLog[]>
//   elapsed: number
//   calories: number
//   // Actions:
//   setPlan: (plan: Workout[]) => void
//   logSet: (workoutId: string, set: SetLog) => void
//   updateTimer: (secs: number) => void
//   resetSession: () => void
// }

// export const useWorkoutStore = create<WorkoutStore>()(
//   persist(
//     (set, get) => ({
//       plan: [],
//       logs: {},
//       elapsed: 0,
//       calories: 0,

//       setPlan: (plan) => {
//         console.log('[WorkoutStore] setPlan →', plan)
//         set({ plan })
//       },

//       logSet: (workoutId, setEntry) => {
//         console.log(`[WorkoutStore] logSet for ${workoutId} →`, setEntry)
//         const prev = get().logs[workoutId] || []
//         set(state => ({
//           logs: {
//             ...state.logs,
//             [workoutId]: [...prev, setEntry]
//           }
//         }))
//       },

//       updateTimer: (secs) => {
//         console.log('[WorkoutStore] updateTimer →', secs)
//         set({ elapsed: secs, calories: Math.round((secs * 10) / 60) })
//       },

//       resetSession: () => {
//         console.log('[WorkoutStore] resetSession')
//         set({ plan: [], logs: {}, elapsed: 0, calories: 0 })
//       }
//     }),
//     {
//       name: 'workout-store',       // unique storage key
//       storage: {
//         getItem: async (name) => {
//           const value = await AsyncStorage.getItem(name)
//           return value ? JSON.parse(value) : null
//         },
//         setItem: async (name, value) => {
//           await AsyncStorage.setItem(name, JSON.stringify(value))
//         },
//         removeItem: async (name) => {
//           await AsyncStorage.removeItem(name)
//         }
//       } // custom storage adapter for React Native AsyncStorage
//     }
//   )
// )
