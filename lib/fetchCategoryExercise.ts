import { supabase } from '@/src/supabaseClient'

export async function fetchMuscleExercises(sessionIds: string[]) {
  if (sessionIds.length === 0) return []

  // 1️⃣ Fetch session exercises (with exercise_name)
  const { data: exercises, error: exError } = await supabase
    .from('session_exercises')
    .select('sets, reps, exercise_name')
    .in('session_id', sessionIds)

  if (exError) {
    console.error('❌ Error fetching session exercises:', exError)
    return []
  }

  // 2️⃣ Fetch default workouts for matching exercise names
  const uniqueNames = Array.from(new Set(exercises.map(e => e.exercise_name)))

  const { data: defaultWorkouts, error: dwError } = await supabase
    .from('default_workouts')
    .select('name, muscle')
    .in('name', uniqueNames)

  if (dwError) {
    console.error('❌ Error fetching default workouts:', dwError)
    return []
  }

  // 3️⃣ Join manually in JS
  const nameToMuscleMap = Object.fromEntries(
    (defaultWorkouts ?? []).map(d => [d.name, d.muscle])
  )

  return (exercises ?? []).map(e => ({
    sets: e.sets,
    reps: e.reps,
    muscle_group: nameToMuscleMap[e.exercise_name] ?? null,
  }))
}


// import { supabase } from '@/src/supabaseClient'

// type EnrichedExercise = {
//   sets: number
//   reps: number
//   muscle_group: string | null
// }

// export async function fetchMuscleExercises(sessionIds: string[]): Promise<EnrichedExercise[]> {
//   if (sessionIds.length === 0) return []

//   const { data, error } = await supabase
//     .from('session_exercises')
//     .select(`
//       sets,
//       reps,
//       default_workouts (
//         muscle_group
//       )
//     `)
//     .in('session_id', sessionIds)

//   if (error) {
//     console.error('❌ Error fetching muscle exercises:', error)
//     return []
//   }

//   return (data ?? []).map((e: any) => ({
//     sets: e.sets,
//     reps: e.reps,
//     muscle_group: e.default_workouts?.muscle_group ?? null,
//   }))
// }
