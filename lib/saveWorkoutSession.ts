// lib/saveWorkout.ts
import { supabase } from "@/src/supabaseClient";
import { useWorkoutStore } from "@/src/stores/useWorkoutStore";
import { useUserStore } from "@/store/useUserStore";

export const saveWorkoutToSupabase = async (workoutName: string) => {
  const { plan, logs, elapsed, calories } = useWorkoutStore.getState();
  const { user } = useUserStore.getState();

  if (!user?.id) {
    throw new Error("User not logged in.");
  }

  // 1. Save workout session
  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      workout_name: workoutName,
      duration_sec: elapsed,
      calories_burned: calories,
    })
    .select()
    .single();

  if (sessionError || !session) {
    throw new Error(sessionError?.message || "Failed to create session");
  }

  // 2. Save session exercises
  const sessionExercises = plan.map((exercise) => {
    const sets = logs[exercise.id] || [];
    return {
      session_id: session.id,
      exercise_name: exercise.name,
      sets: sets.length,
      reps: sets.map((s) => s.reps).join("-"),
      weight: sets.map((s) => s.weight).join("-"),
    };
  });

  const { error: exError } = await supabase
    .from("session_exercises")
    .insert(sessionExercises);

  if (exError) {
    throw new Error(exError.message);
  }

  // 3. Save exercise logs (for graphs + PRs)
  const allSetLogs = plan.flatMap((exercise) => {
    const sets = logs[exercise.id] || [];
    return sets.map((set) => ({
      user_id: user.id,
      name: exercise.name,
      weight: parseFloat(set.weight),
      reps: parseInt(set.reps),
      sets: 1,
      logged_at: new Date(set.timestamp || Date.now()).toISOString(),
    }));
  });

  const { error: logError } = await supabase
    .from("exercise_logs")
    .insert(allSetLogs);

  if (logError) {
    throw new Error(logError.message);
  }

  return true;
};
