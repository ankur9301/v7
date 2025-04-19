// utils/generate_workout.ts
import { Workout } from '../types/types'; // Adjust path as needed

interface GenerateWorkoutParams {
  selectedTime: string | null;
  selectedMuscles: string[];
  selectedEquipment: string[];
  searchQuery: string;
  allWorkouts: Workout[];
  bodyParts: string[];
  allAvailableWorkouts?: Workout[]
}


// Utility function to shuffle an array
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateWorkoutPlan = ({
  selectedTime,
  selectedMuscles,
  selectedEquipment,
  searchQuery,
  allWorkouts,
  bodyParts,
  allAvailableWorkouts,
}: GenerateWorkoutParams): Workout[] => {
  const timeMapping: { [key: string]: number } = {
    '30 Min': 3,
    '45 Min': 4,
    '60 Min': 5,
    '90 Min': 6,
    '120 Min': 8,
  };

  const totalExercises = selectedTime ? timeMapping[selectedTime] : 3; // Default to 30 Min

  if (!totalExercises) {
    throw new Error('Invalid or unsupported workout time selected.');
  }

  // Filter workouts by selected muscles, equipment, and search query
  let filtered = allWorkouts.filter(
    (workout) =>
      (selectedMuscles.length === 0 || selectedMuscles.includes(workout.muscle ?? '')) &&
      (selectedEquipment.length === 0 || selectedEquipment.includes(workout.category ?? '')) &&
      (searchQuery === '' || workout.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (filtered.length < totalExercises) {
    throw new Error('Not enough exercises match the filters and search query to generate a plan.');
  }

   // Shuffle the filtered list if only time is selected
  if (selectedMuscles.length === 0 && selectedEquipment.length === 0 && searchQuery === '') {
    filtered = shuffleArray(filtered); // Shuffle for randomness
  }

  // Determine muscles to use
  const musclesToUse = selectedMuscles.length > 0 ? selectedMuscles : bodyParts;

  // Group workouts by muscle
  const muscleGroups: { [key: string]: Workout[] } = {};
  musclesToUse.forEach((muscle) => {
    muscleGroups[muscle] = filtered.filter((workout) => workout.muscle === muscle);
  });

  // Distribute exercises evenly across muscles
  const baseCount = Math.floor(totalExercises / musclesToUse.length);
  let remainingSlots = totalExercises % musclesToUse.length;
  const distributedWorkouts: Workout[] = [];

  musclesToUse.forEach((muscle) => {
    const exercises = muscleGroups[muscle].slice(0, baseCount);
    distributedWorkouts.push(...exercises);
  });

  // Handle remaining slots by adding one exercise to each muscle in a round-robin fashion
  while (remainingSlots > 0) {
    for (const muscle of musclesToUse) {
      if (remainingSlots === 0) break;
      const currentCount = distributedWorkouts.filter((w) => w.muscle === muscle).length;
      const nextExercise = muscleGroups[muscle][currentCount];
      if (nextExercise) {
        distributedWorkouts.push(nextExercise);
        remainingSlots--;
      }
    }
  }

  // Shuffle the distributed workouts for variety
  return distributedWorkouts.sort(() => Math.random() - 0.5);
};
