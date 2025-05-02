export const muscleCategoryMap: Record<string, "Push" | "Pull" | "Legs" | "Core" | null> = {
    Chest: "Push",
    Shoulders: "Push",
    Triceps: "Push",
    Back: "Pull",
    Biceps: "Pull",
    Legs: "Legs",
    Hamstrings: "Legs",
    Core: "Core",
    Abs: "Core",
  }
  
  type SessionExercise = {
    sets: number
    reps: number
    muscle_group: string | null
  }
  
  export function calculateMuscleDistribution(exercises: SessionExercise[]) {
    const categoryStats: Record<"Push" | "Pull" | "Legs" | "Core", { sets: number; reps: number }> = {
      Push: { sets: 0, reps: 0 },
      Pull: { sets: 0, reps: 0 },
      Legs: { sets: 0, reps: 0 },
      Core: { sets: 0, reps: 0 },
    }
  
    for (const exercise of exercises) {
      const category = muscleCategoryMap[exercise.muscle_group ?? ""]
      if (category) {
        categoryStats[category].sets += exercise.sets
        categoryStats[category].reps += exercise.reps
      }
    }
  
    const totalSets = Object.values(categoryStats).reduce((sum, c) => sum + c.sets, 0)
  
    return Object.entries(categoryStats).map(([type, { sets }]) => ({
      type,
      percentage: totalSets > 0 ? Math.round((sets / totalSets) * 100) : 0,
      color:
        type === "Push"
          ? "#6366F1"
          : type === "Pull"
          ? "#10B981"
          : type === "Legs"
          ? "#F59E0B"
          : "#8B5CF6",
    }))
  }
  