// stores/useWorkoutStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Workout } from '@/types/types';
import { fetchLastSessionForExercise } from '@/lib/exerciseService'

const randomId = () => Date.now().toString() + Math.random().toString().slice(2);

// function generateDefaultSets(count: number, reps = '10', weight = '10') {
//   return Array.from({ length: count }).map(() => ({
//     id: randomId(),
//     reps,
//     weight,
//     logged: false,
//     timestamp: undefined,
//   }));
// }

function generateDefaultSets() {
  const preset = [
    { reps: '12', weight: '10' },
    { reps: '10', weight: '12' },
    { reps: '8', weight: '15' }
  ];

  return preset.map(p => ({
    id: randomId(),
    reps: p.reps,
    weight: p.weight,
    logged: false,
    timestamp: undefined,
  }));
}


// Enhanced SetLog type with the required properties
export interface SetLog {
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
  seedSession: (workoutId: string, defaultCount?: number) => Promise<void>
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
      },
      seedSession: async (workoutId, defaultCount = 3) => {
        const defaults = generateDefaultSets();

        try {
          const lastSets = await fetchLastSessionForExercise(workoutId);
        
          if (lastSets.length > 0) {
            console.log("🌟 Preloading from previous session");
        
            const preloaded = lastSets.map(set => ({
              id: randomId(),
              reps: String(set.reps ?? ''),
              weight: String(set.weight ?? ''),
              logged: false,
              timestamp: undefined,
            }));
        
            set(state => ({
              logs: {
                ...state.logs,
                [workoutId]: preloaded
              }
            }));
        
          } else {
            console.log("🆕 No previous session found, loading default varied sets");
        
            const defaults = generateDefaultSets(); // <--- new call
        
            set(state => ({
              logs: {
                ...state.logs,
                [workoutId]: defaults
              }
            }));
          }
        } catch (error) {
          console.error("❌ Error seeding session:", error);
        
          const defaults = generateDefaultSets(); // <--- also here fallback
        
          set(state => ({
            logs: {
              ...state.logs,
              [workoutId]: defaults
            }
          }));
        }
        
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
