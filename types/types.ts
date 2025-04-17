// types/types.ts

export interface Workout {
  id: number;
  name: string;
  muscle: string;
  category: string;
  image: string;
  level: string;
}

export interface WorkoutPlan {
  warmUp: {
    time: number;
    description: string;
  };
  mainWorkout: Workout[];
  coolDown: {
    time: number;
    description: string;
  };
  totalTime: string;
}
