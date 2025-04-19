import { supabase } from "@/src/supabaseClient";
import { Workout } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveCustomExerciseLocally(exercise: Exercise) {
  try {
    const existing = await AsyncStorage.getItem("custom_exercises");
    const parsed = existing ? JSON.parse(existing) : [];
    const updated = [...parsed, exercise];
    await AsyncStorage.setItem("custom_exercises", JSON.stringify(updated));
  } catch (err) {
    console.error("❌ Error saving locally", err);
  }
}

interface Exercise {
    id?: number;
    name: string;
    muscle: string;
    category: string;
    level: string;
    description?: string;
    isCustom?: boolean;
  }
  

  export async function addExerciseToSupabase(exercise: Exercise) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
  
    const user = session?.user;
    if (!user) throw new Error("User not logged in");
  
    const { data, error } = await supabase
      .from("custom_exercises")
      .insert([{ ...exercise, user_id: user.id, isCustom: true }]) // ✅ write isCustom to DB too
      .select()
      .single();
  
    if (error) throw error;
  
    const workout: Workout = {
      id: data.id,
      name: data.name,
      muscle: data.muscle,
      category: data.category,
      level: data.level,
      isCustom: true,
    };
  
    await saveCustomExerciseLocally(workout as Exercise);
    return workout;
  }
  
  export async function getCachedCustomExercises(): Promise<Workout[]> {
    const data = await AsyncStorage.getItem("custom_exercises");
    const parsed = data ? JSON.parse(data) : [];
  
    return parsed.map((item: Workout) => ({
      ...item,
      isCustom: true, // ✅ make sure it's always tagged
    }));
  }
  


  export async function fetchCustomExercisesFromSupabase(): Promise<Workout[]> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
  
    const user = session?.user;
    if (!user) throw new Error("User not logged in");
  
    const { data, error } = await supabase
      .from("custom_exercises")
      .select("*")
      .eq("user_id", user.id);
  
    if (error) throw error;
  
    const workouts = (data || []).map((item) => ({
      ...item,
      isCustom: true,
    }));
  
    // Save to local cache
    await AsyncStorage.setItem("custom_exercises", JSON.stringify(workouts));
  
    return workouts;
  }
  