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
