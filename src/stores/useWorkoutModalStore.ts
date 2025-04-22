// src/stores/useWorkoutModalStore.ts
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface Set { id: string; reps: string; weight: string; logged: boolean; timestamp?: number }
interface ExerciseState {
  showNotes: any;
  sets: Set[]
  notes: string
  restTimer: number
  isTimerRunning: boolean
  stopwatchDuration?: number;
  stopwatchCalories?: number;
}
interface WorkoutModalStore {
  // mapping exerciseId → its local state
  exercises: Record<string, ExerciseState>
  // which exercise modal is currently open
  activeId: string | null
  
  // open modal for a given exercise: load from AsyncStorage if present
  open: (id: string) => Promise<void>
  // close modal (just null out activeId)
  close: () => void
  
  // per‑exercise actions
  addSet: () => void
  updateSet: (index: number, field: 'reps'|'weight', value: string) => void
  toggleLog: (index: number) => void
  updateNotes: (text: string) => void
  
  // timer controls
  startRestTimer: () => void
  pauseRestTimer: () => void
  resetRestTimer: () => void
  
  // when you finally “Log Workout” in Stopwatch, call this to clear everything
  resetAll: () => void

  
}

export const useWorkoutModalStore = create<WorkoutModalStore>((set, get) => ({
  exercises: {},
  activeId: null,

  open: async (id) => {
    // load from AsyncStorage if exists
    const raw = await AsyncStorage.getItem(`workout_${id}_state`)
    let data: ExerciseState
    if (raw) {
      data = JSON.parse(raw)
    } else {
      data = {
        showNotes: null,
        sets: [
          { id:'1', reps:'12', weight:'10', logged:false },
          { id:'2', reps:'10', weight:'15', logged:false },
          { id:'3', reps:'8',  weight:'20', logged:false },
        ],
        notes: '',
        restTimer: 0,
        isTimerRunning: false
      }
      await AsyncStorage.setItem(`workout_${id}_state`, JSON.stringify(data))
    }
    set(state => ({
      exercises: { ...state.exercises, [id]: data },
      activeId: id
    }))
  },

  close: () => set({ activeId: null }),

  addSet: async () => {
    const id = get().activeId!
    const ex = get().exercises[id]
    const newSet = { id: Date.now().toString(), reps:'8', weight:'0', logged:false }
    const updated: ExerciseState = {
      ...ex,
      sets: [...ex.sets, newSet]
    }
    await AsyncStorage.setItem(`workout_${id}_state`, JSON.stringify(updated))
    set(state => ({ exercises: { ...state.exercises, [id]: updated } }))
  },

  updateSet: async (idx, field, val) => {
    const id = get().activeId!
    let ex = get().exercises[id]
    const sets = ex.sets.map((s,i) => i===idx ? { ...s, [field]: val } : s)
    const updated = { ...ex, sets }
    await AsyncStorage.setItem(`workout_${id}_state`, JSON.stringify(updated))
    set(state => ({ exercises: { ...state.exercises, [id]: updated } }))
  },

  toggleLog: async (idx) => {
    const id = get().activeId!
    let ex = get().exercises[id]
    const sets = ex.sets.map((s,i) => i===idx
      ? { ...s, logged: !s.logged, timestamp: !s.logged ? Date.now() : undefined }
      : s
    )
    const updated = { ...ex, sets, restTimer: 0, isTimerRunning: true }
    await AsyncStorage.setItem(`workout_${id}_state`, JSON.stringify(updated))
    set(state => ({ exercises: { ...state.exercises, [id]: updated } }))
  },

  updateNotes: async (text) => {
    const id = get().activeId!
    let ex = get().exercises[id]
    const updated = { ...ex, notes: text }
    await AsyncStorage.setItem(`workout_${id}_state`, JSON.stringify(updated))
    set(state => ({ exercises: { ...state.exercises, [id]: updated } }))
  },

  startRestTimer: () => {
    const id = get().activeId!
    set(state => {
      const ex = state.exercises[id]
      return { exercises: { ...state.exercises, [id]: { ...ex, isTimerRunning: true } } }
    })
  },

  pauseRestTimer: () => {
    const id = get().activeId!
    set(state => {
      const ex = state.exercises[id]
      return { exercises: { ...state.exercises, [id]: { ...ex, isTimerRunning: false } } }
    })
  },

  resetRestTimer: () => {
    const id = get().activeId!
    set(state => {
      const ex = state.exercises[id]
      return { exercises: { ...state.exercises, [id]: { ...ex, restTimer: 0, isTimerRunning: false } } }
    })
  },

  resetAll: () => {
    set({ exercises: {}, activeId: null })
  }
}))
