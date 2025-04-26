// types/types.ts
export interface Workout {
  id: string | number
  name: string
  muscle?: string
  category?: string
  level?: string
  sets?: number
  reps?: string
  imageUrl?: any
  image?: any
  isCustom?: boolean;
}

export interface WorkoutHistory {
  id: string
  date: string
  title: string
  duration: string
  calories: number
  workouts: Workout[]
}

export interface WorkoutTemplate {
  id: string
  title: string
  workouts: Workout[]
  isExample?: boolean;
}

export interface SetLog {
  weight: number
  reps: number
  timestamp: number    // when that set was completed
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetLog[]
}

export interface WorkoutSession {
  id?: string            // Supabase PK
  name: string           // your “session name” input
  durationSec: number    // total seconds on the stopwatch
  calories: number       // computed on the fly
  loggedAt: string       // ISO timestamp when you hit “Log Workout”
  exerciseLogs: ExerciseLog[]
}





// // types/types.ts

// export interface Workout {
//   id: number;
//   name: string;
//   muscle: string;
//   category: string;
//   image: string;
//   level: string;
// }

// export interface WorkoutPlan {
//   warmUp: {
//     time: number;
//     description: string;
//   };
//   mainWorkout: Workout[];
//   coolDown: {
//     time: number;
//     description: string;
//   };
//   totalTime: string;
// }
