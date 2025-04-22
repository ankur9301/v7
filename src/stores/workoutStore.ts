// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import NetInfo from '@react-native-community/netinfo'
// import { supabase } from '@/src/supabaseClient'
// import { ExerciseLog, SetLog, WorkoutSession } from '@/types/types'

// // State + Actions interface
// type WorkoutState = {
//   plan: string[]              // array of exercise IDs for this session
//   elapsed: number             // seconds on the timer
//   calories: number
//   logs: Record<string, ExerciseLog>
//   queue: WorkoutSession[]     // offline queue

//   // actions:
//   setPlan: (ids: string[]) => void
//   tick: () => void
//   addCalories: (c: number) => void
//   logSet: (exerciseId: string, set: SetLog) => void
//   resetSession: () => void
//   enqueueSession: (s: WorkoutSession) => void
//   syncQueue: () => Promise<void>
// }

// export const useWorkoutStore = create<WorkoutState>()(
//   persist(
//     (set, get) => ({
//       plan: [], elapsed: 0, calories: 0, logs: {}, queue: [],

//       setPlan: (ids) => {
//         console.log('[STORE] setPlan →', ids)
//         set({ plan: ids, elapsed: 0, calories: 0, logs: {} })
//       },

//       tick: () => {
//         const e = get().elapsed + 1
//         console.log('[STORE] tick →', e)
//         set({ elapsed: e })
//       },

//       addCalories: (c) => {
//         const next = get().calories + c
//         console.log('[STORE] addCalories →', next)
//         set({ calories: next })
//       },

//       logSet: (exerciseId, setLog) => {
//         console.log('[STORE] logSet', exerciseId, setLog)
//         const prevSets = get().logs[exerciseId]?.sets || []
//         const updated: ExerciseLog = {
//           exerciseId,
//           sets: [...prevSets, setLog]
//         }
//         set(state => ({
//           logs: { ...state.logs, [exerciseId]: updated }
//         }))
//       },

//       resetSession: () => {
//         console.log('[STORE] resetSession')
//         set({ plan: [], elapsed: 0, calories: 0, logs: {} })
//       },

//       enqueueSession: (session) => {
//         console.log('[STORE] enqueueSession', session)
//         set(state => ({ queue: [...state.queue, session] }))
//       },

//       syncQueue: async () => {
//         const q = get().queue
//         if (!q.length) return
//         console.log('[STORE] syncQueue: uploading', q.length, 'sessions')
//         for (const s of q) {
//           // 1) insert session row
//           const { data: sessRow, error: se } = await supabase
//             .from('workout_sessions')
//             .insert({
//               name: s.name,
//               duration_sec: s.durationSec,
//               calories_burned: s.calories,
//               logged_at: s.loggedAt
//             })
//             .single() as { data: { id: string } | null, error: any }
//           if (se || !sessRow) {
//             console.warn('[SYNC] failed to insert session', se)
//             continue
//           }
//           // 2) insert its exercise_logs
//           await supabase.from('exercise_logs').insert(
//             s.exerciseLogs.flatMap(log =>
//               log.sets.map(set => ({
//                 session_id: sessRow.id,
//                 exercise_id: log.exerciseId,
//                 weight: set.weight,
//                 reps: set.reps,
//                 timestamp: new Date(set.timestamp).toISOString()
//               }))
//             )
//           )
//         }
//         console.log('[STORE] syncQueue: clearing queue')
//         set({ queue: [] })
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
//       },
//       partialize: (state: WorkoutState) => ({ queue: state.queue })    // only queue persists across restarts
//     }
//   )
// )

// // auto‑sync whenever back online:
// NetInfo.addEventListener(state => {
//   if (state.isConnected) {
//     useWorkoutStore.getState().syncQueue()
//   }
// })
