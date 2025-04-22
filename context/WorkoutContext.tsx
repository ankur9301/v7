// context/WorkoutContext.tsx

import React, { createContext, useState } from 'react';
import { Workout } from '../types/types';
import { supabase } from '../src/supabaseClient';


interface WorkoutContextProps {
  workoutPlan: Workout[];
  setWorkoutPlan: (plan: Workout[]) => void;
  fetchWorkouts: () => void;
}

export const WorkoutContext = createContext<WorkoutContextProps>({
  workoutPlan: [],
  setWorkoutPlan: () => {},
  fetchWorkouts: () => {},
});

interface WorkoutProviderProps {
  children: React.ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [workoutPlan, setWorkoutPlan] = useState<Workout[]>([]);
  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Fetch Workouts Error:', error.message);
    else setWorkoutPlan(data);
  };

  return (
    <WorkoutContext.Provider value={{ workoutPlan, setWorkoutPlan, fetchWorkouts }}>
      {children}
    </WorkoutContext.Provider>
  );
};











