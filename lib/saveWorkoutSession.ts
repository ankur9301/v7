// lib/saveWorkout.ts
import { supabase } from "@/src/supabaseClient";
import { useWorkoutStore } from "@/src/stores/useWorkoutStore";
import { useUserStore } from "@/store/useUserStore";

export const saveWorkoutToSupabase = async (workoutName: string) => {
  const { plan, logs, elapsed, calories } = useWorkoutStore.getState();
  const { user } = useUserStore.getState();
  // ✅ Check: Are there any logged sets at all?
    const hasLoggedSets = Object.values(logs).some((sets) =>
        sets.some((set) => set.logged)
    );

    if (!hasLoggedSets) {
        throw new Error("❗Please complete at least one set before logging your workout.");
    }
  

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
//   const sessionExercises = plan.map((exercise) => {
//     const sets = logs[exercise.id] || [];
//     return {
//       session_id: session.id,
//       exercise_name: exercise.name,
//       sets: sets.length,
//       reps: sets.map((s) => s.reps).join("-"),
//       weight: sets.map((s) => s.weight).join("-"),
//     };
//   });


const sessionExercises = Object.entries(logs)
  .flatMap(([workoutId, sets]) =>
    sets
      .filter(set => set.logged) // ✅ only logged sets
      .map(set => ({
        session_id: session.id,  // from your workout_sessions insert
        // exercise_name: plan.find(exercise => exercise.id === workoutId)?.name || workoutId, // fallback to workoutId if name is unavailable
        exercise_name: plan.find(ex => String(ex.id) === String(workoutId))?.name || "Unknown",

        sets: 1,
        reps: set.reps,
        weight: set.weight,
        created_at: new Date().toISOString(),
      }))
  );


  const { error: exError } = await supabase
    .from("session_exercises")
    .insert(sessionExercises);

  if (exError) {
    throw new Error(exError.message);
  }

  // 3. Save exercise logs (for graphs + PRs)
  const allSetLogs = plan.flatMap((exercise) => {
    const sets = logs[exercise.id] || [];
  
    return sets
      .filter(set => set.logged)
      .map((set) => ({
        user_id: user.id,
        name: exercise.name,
        weight: parseFloat(set.weight),
        reps: parseInt(set.reps),
        sets: 1,
        logged_at: new Date(set.timestamp || Date.now()).toISOString(),
        session_id: session.id, // ✅ include this
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
