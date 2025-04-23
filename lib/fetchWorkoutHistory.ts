import { supabase } from "@/src/supabaseClient";
import { useUserStore } from "@/store/useUserStore";
import { workouts as allWorkouts } from "@/constants/data";
import type { WorkoutHistory } from "@/types/types";

export const fetchWorkoutHistory = async (): Promise<WorkoutHistory[]> => {
  const { user } = useUserStore.getState();
  if (!user?.id) throw new Error("User not logged in");

  const { data: sessions, error: sessionError } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false });

  if (sessionError) throw sessionError;

  const sessionIds = sessions.map((s) => s.id);

  const { data: exercises, error: exError } = await supabase
    .from("session_exercises")
    .select("*")
    .in("session_id", sessionIds);

  if (exError) throw exError;

  const history: WorkoutHistory[] = sessions.map((session) => {
    const related = exercises.filter(e => e.session_id === session.id);

    // 🧠 Group by exercise_name
    const grouped: Record<string, typeof related> = {};
    for (const ex of related) {
      if (!grouped[ex.exercise_name]) grouped[ex.exercise_name] = [];
      grouped[ex.exercise_name].push(ex);
    }

    const workouts = Object.entries(grouped).map(([name, sets]) => {
        const base = allWorkouts.find(w => w.name.toLowerCase() === name.toLowerCase());
      
        return {
          id: base?.id || name, // <- Use the string ID from constants if exists
          name,
          muscle: base?.muscle || "General",
          level: base?.level || "All Levels",
          sets: sets.length,
          reps: summarizeReps(sets.map(s => s.reps)),
          imageUrl: base?.image || require("@/assets/images/placeholder.jpg"),
        };
      });
      

    return {
      id: session.id,
      title: session.workout_name,
      date: new Date(session.logged_at).toLocaleString(),
      duration: `${Math.round(session.duration_sec / 60)} min`,
      calories: session.calories_burned || 0,
      workouts,
    };
  });

  return history;
};

// 👇 Helper to show rep range like "10-12"
function summarizeReps(repList: string[]): string {
  const numeric = repList.map(Number).filter(Boolean);
  if (numeric.length === 0) return "-";
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  return min === max ? `${min}` : `${min}-${max}`;
}
