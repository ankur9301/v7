// Expanded data for the fitness app

// Featured Plans with detailed day-by-day workouts
export const featuredPlans = [
    {
      id: '1',
      title: '30-Day Strength',
      description: 'Build muscle and strength with this comprehensive plan designed to progressively challenge your body over 30 days.',
      duration: '30 days',
      level: 'Intermediate',
      workoutsCount: 24,
      progress: 0.45,
      image: require('../assets/images/placeholder.jpg'),
      days: [
        // Week 1
        {
          day: 1,
          title: 'Upper Body Focus',
          exercises: [
            { id: 24, name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 45 },
            { id: 13, name: 'Overhead Press', muscle: 'Shoulders', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 30 },
            { id: 63, name: 'Bicep Curl', muscle: 'Biceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 25 },
            { id: 73, name: 'Skull Crushers', muscle: 'Triceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 20 },
            { id: 44, name: 'Bent Over Row', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 40 }
          ],
          isCompleted: true,
          duration: '45 min',
          calories: 350
        },
        {
          day: 2,
          title: 'Lower Body Power',
          exercises: [
            { id: 33, name: 'Barbell Squat', muscle: 'Legs', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '8-10', weight: 60 },
            { id: 53, name: 'Romanian Deadlift', muscle: 'Hamstrings', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 50 },
            { id: 34, name: 'Dumbbell Lunge', muscle: 'Legs', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 15 },
            { id: 35, name: 'Leg Press', muscle: 'Legs', category: 'Machine', level: 'Beginner', sets: 3, reps: '12-15', weight: 80 },
            { id: 55, name: 'Leg Curl', muscle: 'Hamstrings', category: 'Machine', level: 'Beginner', sets: 3, reps: '12-15', weight: 40 }
          ],
          isCompleted: true,
          duration: '50 min',
          calories: 400
        },
        {
          day: 3,
          title: 'Core & Cardio',
          exercises: [
            { id: 3, name: 'Plank', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '30-60 sec', weight: 0 },
            { id: 4, name: 'Sit-up', muscle: 'Core', category: 'Bodyweight', level: 'Beginner', sets: 3, reps: '15-20', weight: 0 },
            { id: 9, name: 'Mountain Climbers', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '20 each side', weight: 0 },
            { id: 83, name: 'Burpees', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '10-15', weight: 0 },
            { id: 1, name: 'Jumping Jacks', muscle: 'Core', category: 'Pre_warmup', level: 'Beginner', sets: 3, reps: '30 sec', weight: 0 }
          ],
          isCompleted: true,
          duration: '35 min',
          calories: 300
        },
        {
          day: 4,
          title: 'Rest Day',
          exercises: [
            { id: 10, name: 'Dead Bug', muscle: 'Core', category: 'Post_warmup', level: 'Beginner', sets: 2, reps: '10 each side', weight: 0 },
            { id: 52, name: 'Standing Hamstring Stretch', muscle: 'Hamstrings', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec hold', weight: 0 },
            { id: 22, name: 'Chest Opener Stretch', muscle: 'Chest', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec hold', weight: 0 }
          ],
          isCompleted: true,
          duration: '20 min',
          calories: 100
        },
        {
          day: 5,
          title: 'Push Day',
          exercises: [
            { id: 24, name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 50 },
            { id: 26, name: 'Machine Chest Fly', muscle: 'Chest', category: 'Machine', level: 'Beginner', sets: 3, reps: '10-12', weight: 35 },
            { id: 13, name: 'Overhead Press', muscle: 'Shoulders', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 35 },
            { id: 15, name: 'Lateral Raise', muscle: 'Shoulders', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 10 },
            { id: 75, name: 'Cable Tricep Pushdown', muscle: 'Triceps', category: 'Cable', level: 'Intermediate', sets: 3, reps: '12-15', weight: 25 }
          ],
          isCompleted: true,
          duration: '55 min',
          calories: 380
        },
        {
          day: 6,
          title: 'Pull Day',
          exercises: [
            { id: 43, name: 'Deadlift', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 70 },
            { id: 45, name: 'Pull-ups', muscle: 'Back', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '8-10', weight: 0 },
            { id: 47, name: 'Cable Seated Row', muscle: 'Back', category: 'Cable', level: 'Intermediate', sets: 3, reps: '10-12', weight: 45 },
            { id: 64, name: 'Bicep Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 15 },
            { id: 67, name: 'Hammer Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '12-15', weight: 12 }
          ],
          isCompleted: true,
          duration: '50 min',
          calories: 370
        },
        {
          day: 7,
          title: 'Leg Focus',
          exercises: [
            { id: 33, name: 'Barbell Squat', muscle: 'Legs', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '8-10', weight: 65 },
            { id: 38, name: 'Machine Hack Squat', muscle: 'Legs', category: 'Machine', level: 'Intermediate', sets: 3, reps: '10-12', weight: 70 },
            { id: 39, name: 'Dumbbell Step-Up', muscle: 'Legs', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '12 each leg', weight: 12 },
            { id: 55, name: 'Machine Leg Curl', muscle: 'Hamstrings', category: 'Machine', level: 'Beginner', sets: 3, reps: '12-15', weight: 45 },
            { id: 100, name: 'Seated Calf Raise', muscle: 'Legs', category: 'Machine', level: 'Beginner', sets: 4, reps: '15-20', weight: 40 }
          ],
          isCompleted: true,
          duration: '55 min',
          calories: 410
        },
        // Week 2 (days 8-14) - Increasing intensity
        {
          day: 8,
          title: 'Upper Body Strength',
          exercises: [
            { id: 24, name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 55 },
            { id: 13, name: 'Overhead Press', muscle: 'Shoulders', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 35 },
            { id: 63, name: 'Bicep Curl', muscle: 'Biceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 30 },
            { id: 73, name: 'Skull Crushers', muscle: 'Triceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 25 },
            { id: 44, name: 'Bent Over Row', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 45 }
          ],
          isCompleted: true,
          duration: '50 min',
          calories: 380
        },
        // Continue with days 9-30 following similar pattern with progressive overload
        // ...
        {
          day: 9,
          title: 'Lower Body Power',
          exercises: [
            { id: 33, name: 'Barbell Squat', muscle: 'Legs', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 70 },
            { id: 53, name: 'Romanian Deadlift', muscle: 'Hamstrings', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '8-10', weight: 55 },
            { id: 34, name: 'Dumbbell Lunge', muscle: 'Legs', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '10 each leg', weight: 18 },
            { id: 35, name: 'Leg Press', muscle: 'Legs', category: 'Machine', level: 'Beginner', sets: 3, reps: '10-12', weight: 90 },
            { id: 55, name: 'Leg Curl', muscle: 'Hamstrings', category: 'Machine', level: 'Beginner', sets: 3, reps: '12-15', weight: 45 }
          ],
          isCompleted: true,
          duration: '55 min',
          calories: 420
        },
        {
          day: 10,
          title: 'Core & HIIT',
          exercises: [
            { id: 3, name: 'Plank', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '45-60 sec', weight: 0 },
            { id: 4, name: 'Sit-up', muscle: 'Core', category: 'Bodyweight', level: 'Beginner', sets: 3, reps: '20-25', weight: 0 },
            { id: 9, name: 'Mountain Climbers', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 4, reps: '20 each side', weight: 0 },
            { id: 83, name: 'Burpees', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 4, reps: '12-15', weight: 0 },
            { id: 84, name: 'Hollow Hold', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '30-45 sec', weight: 0 }
          ],
          isCompleted: true,
          duration: '40 min',
          calories: 350
        },
        {
          day: 11,
          title: 'Active Recovery',
          exercises: [
            { id: 10, name: 'Dead Bug', muscle: 'Core', category: 'Post_warmup', level: 'Beginner', sets: 2, reps: '12 each side', weight: 0 },
            { id: 52, name: 'Standing Hamstring Stretch', muscle: 'Hamstrings', category: 'Pre_warmup', level: 'Beginner', sets: 3, reps: '30 sec hold', weight: 0 },
            { id: 22, name: 'Chest Opener Stretch', muscle: 'Chest', category: 'Pre_warmup', level: 'Beginner', sets: 3, reps: '30 sec hold', weight: 0 },
            { id: 41, name: 'Cat-Camel Stretch', muscle: 'Back', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '10 reps', weight: 0 },
            { id: 71, name: 'Tricep Stretch', muscle: 'Triceps', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec hold', weight: 0 }
          ],
          isCompleted: true,
          duration: '25 min',
          calories: 120
        },
        {
          day: 12,
          title: 'Push Day - Heavy',
          exercises: [
            { id: 24, name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', level: 'Intermediate', sets: 5, reps: '5-6', weight: 60 },
            { id: 26, name: 'Machine Chest Fly', muscle: 'Chest', category: 'Machine', level: 'Beginner', sets: 3, reps: '10-12', weight: 40 },
            { id: 13, name: 'Overhead Press', muscle: 'Shoulders', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 40 },
            { id: 15, name: 'Lateral Raise', muscle: 'Shoulders', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 12 },
            { id: 77, name: 'Close-Grip Bench Press', muscle: 'Triceps', category: 'Barbell', level: 'Advanced', sets: 3, reps: '8-10', weight: 45 }
          ],
          isCompleted: true,
          duration: '60 min',
          calories: 400
        },
        {
          day: 13,
          title: 'Pull Day - Heavy',
          exercises: [
            { id: 43, name: 'Deadlift', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 5, reps: '5-6', weight: 80 },
            { id: 45, name: 'Pull-ups', muscle: 'Back', category: 'Bodyweight', level: 'Intermediate', sets: 4, reps: '8-10', weight: 0 },
            { id: 47, name: 'Cable Seated Row', muscle: 'Back', category: 'Cable', level: 'Intermediate', sets: 3, reps: '8-10', weight: 50 },
            { id: 64, name: 'Bicep Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '10-12', weight: 17 },
            { id: 69, name: 'EZ Bar Curl', muscle: 'Biceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 30 }
          ],
          isCompleted: true,
          duration: '55 min',
          calories: 390
        },
        {
          day: 14,
          title: 'Leg Day - Heavy',
          exercises: [
            { id: 33, name: 'Barbell Squat', muscle: 'Legs', category: 'Barbell', level: 'Intermediate', sets: 5, reps: '5-6', weight: 75 },
            { id: 38, name: 'Machine Hack Squat', muscle: 'Legs', category: 'Machine', level: 'Intermediate', sets: 3, reps: '8-10', weight: 80 },
            { id: 39, name: 'Dumbbell Step-Up', muscle: 'Legs', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '10 each leg', weight: 15 },
            { id: 55, name: 'Machine Leg Curl', muscle: 'Hamstrings', category: 'Machine', level: 'Beginner', sets: 3, reps: '10-12', weight: 50 },
            { id: 100, name: 'Seated Calf Raise', muscle: 'Legs', category: 'Machine', level: 'Beginner', sets: 4, reps: '15-20', weight: 45 }
          ],
          isCompleted: false,
          duration: '60 min',
          calories: 430
        },
        // Week 3 (days 15-21) - Peak intensity
        {
          day: 15,
          title: 'Upper Body Power',
          exercises: [
            { id: 24, name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', level: 'Intermediate', sets: 5, reps: '4-6', weight: 65 },
            { id: 13, name: 'Overhead Press', muscle: 'Shoulders', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 45 },
            { id: 63, name: 'Bicep Curl', muscle: 'Biceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 35 },
            { id: 73, name: 'Skull Crushers', muscle: 'Triceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 30 },
            { id: 44, name: 'Bent Over Row', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 50 }
          ],
          isCompleted: false,
          duration: '55 min',
          calories: 400
        },
        // Continue with remaining days...
      ]
    },
    {
      id: '2',
      title: 'Fat Burn Challenge',
      description: 'High intensity workouts to maximize calorie burn and shed unwanted fat over 21 days.',
      duration: '21 days',
      level: 'Advanced',
      workoutsCount: 18,
      progress: 0.2,
      image: require('../assets/images/placeholder.jpg'),
      days: [
        // Week 1
        {
          day: 1,
          title: 'HIIT Cardio',
          exercises: [
            { id: 1, name: 'Jumping Jacks', muscle: 'Core', category: 'Pre_warmup', level: 'Beginner', sets: 3, reps: '45 sec', weight: 0 },
            { id: 83, name: 'Burpees', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 4, reps: '30 sec', weight: 0 },
            { id: 9, name: 'Mountain Climbers', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 4, reps: '45 sec', weight: 0 },
            { id: 31, name: 'High Knees', muscle: 'Legs', category: 'Pre_warmup', level: 'Beginner', sets: 3, reps: '45 sec', weight: 0 },
            { id: 32, name: 'Butt Kicks', muscle: 'Legs', category: 'Pre_warmup', level: 'Beginner', sets: 3, reps: '45 sec', weight: 0 }
          ],
          isCompleted: true,
          duration: '35 min',
          calories: 400
        },
        {
          day: 2,
          title: 'Full Body Circuit',
          exercises: [
            { id: 23, name: 'Push-ups', muscle: 'Chest', category: 'Bodyweight', level: 'Beginner', sets: 3, reps: '15-20', weight: 0 },
            { id: 33, name: 'Bodyweight Squat', muscle: 'Legs', category: 'Bodyweight', level: 'Beginner', sets: 3, reps: '20-25', weight: 0 },
            { id: 49, name: 'Inverted Row', muscle: 'Back', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '12-15', weight: 0 },
            { id: 4, name: 'Sit-up', muscle: 'Core', category: 'Bodyweight', level: 'Beginner', sets: 3, reps: '20-25', weight: 0 },
            { id: 78, name: 'Bench Dip', muscle: 'Triceps', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '15-20', weight: 0 }
          ],
          isCompleted: true,
          duration: '40 min',
          calories: 350
        },
        // Continue with remaining days...
      ]
    },
    {
      id: '3',
      title: 'Beginner Fitness',
      description: 'Perfect for those just starting their fitness journey with gradual progression over 14 days.',
      duration: '14 days',
      level: 'Beginner',
      workoutsCount: 12,
      progress: 0.8,
      image: require('../assets/images/placeholder.jpg'),
      days: [
        // Week 1
        {
          day: 1,
          title: 'Introduction to Fitness',
          exercises: [
            { id: 1, name: 'Jumping Jacks', muscle: 'Core', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec', weight: 0 },
            { id: 23, name: 'Push-ups (Modified)', muscle: 'Chest', category: 'Bodyweight', level: 'Beginner', sets: 2, reps: '8-10', weight: 0 },
            { id: 37, name: 'Bodyweight Squat', muscle: 'Legs', category: 'Bodyweight', level: 'Beginner', sets: 2, reps: '12-15', weight: 0 },
            { id: 4, name: 'Sit-up', muscle: 'Core', category: 'Bodyweight', level: 'Beginner', sets: 2, reps: '10-12', weight: 0 },
            { id: 3, name: 'Plank', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 2, reps: '20-30 sec', weight: 0 }
          ],
          isCompleted: true,
          duration: '25 min',
          calories: 180
        },
        // Continue with remaining days...
      ]
    }
  ];
  
  // Expanded Popular Workouts with detailed exercises
  export const popularWorkouts = [
    {
      id: '1',
      title: 'Shoulder Flex Stability',
      level: 'Beginner',
      duration: '55 min',
      totalCalories: 320,
      image: require('../assets/images/placeholder.jpg'),
      exercises: [
        { id: 11, name: 'Arm Circles', muscle: 'Shoulders', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec each direction', weight: 0 },
        { id: 12, name: 'Shoulder Shrugs (No Weights)', muscle: 'Shoulders', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '15-20', weight: 0 },
        { id: 15, name: 'Lateral Raise', muscle: 'Shoulders', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 8 },
        { id: 16, name: 'Front Raise', muscle: 'Shoulders', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 8 },
        { id: 18, name: 'Machine Shoulder Press', muscle: 'Shoulders', category: 'Machine', level: 'Beginner', sets: 3, reps: '10-12', weight: 25 },
        { id: 91, name: 'Bent Over Reverse Fly', muscle: 'Shoulders', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '12-15', weight: 6 },
        { id: 20, name: 'Rear Delt Fly (Machine)', muscle: 'Shoulders', category: 'Post_warmup', level: 'Intermediate', sets: 3, reps: '12-15', weight: 20 }
      ]
    },
    {
      id: '2',
      title: 'Full Body Burn',
      level: 'Intermediate',
      duration: '45 min',
      totalCalories: 380,
      image: require('../assets/images/placeholder.jpg'),
      exercises: [
        { id: 1, name: 'Jumping Jacks', muscle: 'Core', category: 'Pre_warmup', level: 'Beginner', sets: 1, reps: '60 sec', weight: 0 },
        { id: 23, name: 'Push-ups', muscle: 'Chest', category: 'Bodyweight', level: 'Beginner', sets: 3, reps: '12-15', weight: 0 },
        { id: 33, name: 'Barbell Squat', muscle: 'Legs', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 45 },
        { id: 44, name: 'Bent Over Row', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 40 },
        { id: 64, name: 'Bicep Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 12 },
        { id: 75, name: 'Cable Tricep Pushdown', muscle: 'Triceps', category: 'Cable', level: 'Intermediate', sets: 3, reps: '12-15', weight: 25 },
        { id: 3, name: 'Plank', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '30-45 sec', weight: 0 },
        { id: 83, name: 'Burpees', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 2, reps: '10-12', weight: 0 }
      ]
    },
    {
      id: '3',
      title: 'Core Crusher',
      level: 'Advanced',
      duration: '30 min',
      totalCalories: 250,
      image: require('../assets/images/placeholder.jpg'),
      exercises: [
        { id: 3, name: 'Plank', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '60 sec', weight: 0 },
        { id: 4, name: 'Sit-up', muscle: 'Core', category: 'Bodyweight', level: 'Beginner', sets: 3, reps: '20-25', weight: 0 },
        { id: 9, name: 'Mountain Climbers', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '30 each side', weight: 0 },
        { id: 84, name: 'Hollow Hold', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '45-60 sec', weight: 0 },
        { id: 5, name: 'Ab Wheel Rollout', muscle: 'Abs', category: 'Equipment', level: 'Advanced', sets: 3, reps: '10-12', weight: 0 },
        { id: 10, name: 'Dead Bug', muscle: 'Core', category: 'Post_warmup', level: 'Beginner', sets: 3, reps: '12 each side', weight: 0 },
        { id: 83, name: 'Burpees', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '15', weight: 0 }
      ]
    },
    {
      id: '4',
      title: 'Leg Day Challenge',
      level: 'Intermediate',
      duration: '60 min',
      totalCalories: 420,
      image: require('../assets/images/placeholder.jpg'),
      exercises: [
        { id: 31, name: 'High Knees', muscle: 'Legs', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec', weight: 0 },
        { id: 32, name: 'Butt Kicks', muscle: 'Legs', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec', weight: 0 },
        { id: 33, name: 'Barbell Squat', muscle: 'Legs', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '8-10', weight: 60 },
        { id: 34, name: 'Dumbbell Lunge', muscle: 'Legs', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '12 each leg', weight: 15 },
        { id: 35, name: 'Leg Press', muscle: 'Legs', category: 'Machine', level: 'Beginner', sets: 3, reps: '12-15', weight: 80 },
        { id: 53, name: 'Romanian Deadlift', muscle: 'Hamstrings', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 50 },
        { id: 55, name: 'Machine Leg Curl', muscle: 'Hamstrings', category: 'Machine', level: 'Beginner', sets: 3, reps: '12-15', weight: 45 },
        { id: 100, name: 'Seated Calf Raise', muscle: 'Legs', category: 'Machine', level: 'Beginner', sets: 4, reps: '15-20', weight: 40 },
        { id: 40, name: 'Quad Stretch', muscle: 'Legs', category: 'Post_warmup', level: 'Beginner', sets: 2, reps: '30 sec each leg', weight: 0 }
      ]
    },
    {
      id: '5',
      title: 'Upper Body Blast',
      level: 'Intermediate',
      duration: '50 min',
      totalCalories: 350,
      image: require('../assets/images/placeholder.jpg'),
      exercises: [
        { id: 21, name: 'Arm Swings', muscle: 'Chest', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec', weight: 0 },
        { id: 24, name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '8-10', weight: 50 },
        { id: 13, name: 'Overhead Press', muscle: 'Shoulders', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 35 },
        { id: 44, name: 'Bent Over Row', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 45 },
        { id: 64, name: 'Bicep Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 15 },
        { id: 75, name: 'Cable Tricep Pushdown', muscle: 'Triceps', category: 'Cable', level: 'Intermediate', sets: 3, reps: '12-15', weight: 25 },
        { id: 15, name: 'Lateral Raise', muscle: 'Shoulders', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 10 }
      ]
    },
    {
      id: '6',
      title: 'Back & Biceps',
      level: 'Intermediate',
      duration: '45 min',
      totalCalories: 330,
      image: require('../assets/images/placeholder.jpg'),
      exercises: [
        { id: 41, name: 'Cat-Camel Stretch', muscle: 'Back', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '10 reps', weight: 0 },
        { id: 43, name: 'Deadlift', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '8-10', weight: 60 },
        { id: 45, name: 'Pull-ups', muscle: 'Back', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '8-10', weight: 0 },
        { id: 47, name: 'Cable Seated Row', muscle: 'Back', category: 'Cable', level: 'Intermediate', sets: 3, reps: '10-12', weight: 45 },
        { id: 48, name: 'Machine Lat Pulldown', muscle: 'Back', category: 'Machine', level: 'Beginner', sets: 3, reps: '10-12', weight: 50 },
        { id: 64, name: 'Bicep Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 15 },
        { id: 67, name: 'Hammer Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '12-15', weight: 12 },
        { id: 69, name: 'EZ Bar Curl', muscle: 'Biceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 25 }
      ]
    }
  ];
  
  // Workouts by category
  export const workoutsByCategory = {
    'Chest': [
      {
        id: 'chest-1',
        title: 'Chest Builder',
        level: 'Intermediate',
        duration: '45 min',
        totalCalories: 350,
        image: require('../assets/images/placeholder.jpg'),
        exercises: [
          { id: 21, name: 'Arm Swings', muscle: 'Chest', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec', weight: 0 },
          { id: 22, name: 'Chest Opener Stretch', muscle: 'Chest', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec hold', weight: 0 },
          { id: 24, name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '8-10', weight: 50 },
          { id: 25, name: 'Incline Dumbbell Bench Press', muscle: 'Chest', category: 'Dumbbell', level: 'Advanced', sets: 3, reps: '10-12', weight: 20 },
          { id: 26, name: 'Machine Chest Fly', muscle: 'Chest', category: 'Machine', level: 'Beginner', sets: 3, reps: '12-15', weight: 35 },
          { id: 27, name: 'Cable Chest Fly', muscle: 'Chest', category: 'Cable', level: 'Intermediate', sets: 3, reps: '12-15', weight: 15 },
          { id: 29, name: 'Chest Dips', muscle: 'Chest', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '10-12', weight: 0 }
        ]
      }
    ],
    'Back': [
      {
        id: 'back-1',
        title: 'Back Strength',
        level: 'Intermediate',
        duration: '50 min',
        totalCalories: 370,
        image: require('../assets/images/placeholder.jpg'),
        exercises: [
          { id: 41, name: 'Cat-Camel Stretch', muscle: 'Back', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '10 reps', weight: 0 },
          { id: 42, name: 'Bent Over T-Spine Rotation', muscle: 'Back', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '10 each side', weight: 0 },
          { id: 43, name: 'Deadlift', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '6-8', weight: 70 },
          { id: 44, name: 'Bent Over Row', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 45 },
          { id: 45, name: 'Pull-ups', muscle: 'Back', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '8-10', weight: 0 },
          { id: 47, name: 'Cable Seated Row', muscle: 'Back', category: 'Cable', level: 'Intermediate', sets: 3, reps: '10-12', weight: 45 },
          { id: 48, name: 'Machine Lat Pulldown', muscle: 'Back', category: 'Machine', level: 'Beginner', sets: 3, reps: '10-12', weight: 50 }
        ]
      }
    ],
    'Arms': [
      {
        id: 'arms-1',
        title: 'Arm Sculptor',
        level: 'Intermediate',
        duration: '40 min',
        totalCalories: 280,
        image: require('../assets/images/placeholder.jpg'),
        exercises: [
          { id: 61, name: 'Wrist Rotations', muscle: 'Biceps', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec each direction', weight: 0 },
          { id: 71, name: 'Tricep Stretch', muscle: 'Triceps', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec hold', weight: 0 },
          { id: 63, name: 'Bicep Curl', muscle: 'Biceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 30 },
          { id: 67, name: 'Hammer Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 15 },
          { id: 73, name: 'Skull Crushers', muscle: 'Triceps', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 25 },
          { id: 75, name: 'Cable Tricep Pushdown', muscle: 'Triceps', category: 'Cable', level: 'Intermediate', sets: 3, reps: '12-15', weight: 25 },
          { id: 97, name: 'Diamond Push-ups', muscle: 'Triceps', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '12-15', weight: 0 }
        ]
      }
    ],
    'Shoulders': [
      {
        id: 'shoulders-1',
        title: 'Shoulder Definition',
        level: 'Intermediate',
        duration: '45 min',
        totalCalories: 300,
        image: require('../assets/images/placeholder.jpg'),
        exercises: [
          { id: 11, name: 'Arm Circles', muscle: 'Shoulders', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec each direction', weight: 0 },
          { id: 13, name: 'Overhead Press', muscle: 'Shoulders', category: 'Barbell', level: 'Intermediate', sets: 4, reps: '8-10', weight: 40 },
          { id: 14, name: 'Arnold Press', muscle: 'Shoulders', category: 'Dumbbell', level: 'Advanced', sets: 3, reps: '10-12', weight: 15 },
          { id: 15, name: 'Lateral Raise', muscle: 'Shoulders', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 10 },
          { id: 16, name: 'Front Raise', muscle: 'Shoulders', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 10 },
          { id: 17, name: 'Cable Lateral Raise', muscle: 'Shoulders', category: 'Cable', level: 'Intermediate', sets: 3, reps: '12-15', weight: 8 },
          { id: 91, name: 'Bent Over Reverse Fly', muscle: 'Shoulders', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '12-15', weight: 8 }
        ]
      }
    ],
    'Legs': [
      {
        id: 'legs-1',
        title: 'Quad Destroyer',
        level: 'Advanced',
        duration: '55 min',
        totalCalories: 400,
        image: require('../assets/images/placeholder.jpg'),
        exercises: [
          { id: 31, name: 'High Knees', muscle: 'Legs', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '30 sec', weight: 0 },
          { id: 33, name: 'Barbell Squat', muscle: 'Legs', category: 'Barbell', level: 'Intermediate', sets: 5, reps: '6-8', weight: 70 },
          { id: 35, name: 'Leg Press', muscle: 'Legs', category: 'Machine', level: 'Beginner', sets: 4, reps: '10-12', weight: 100 },
          { id: 38, name: 'Machine Hack Squat', muscle: 'Legs', category: 'Machine', level: 'Intermediate', sets: 3, reps: '10-12', weight: 80 },
          { id: 34, name: 'Dumbbell Lunge', muscle: 'Legs', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '12 each leg', weight: 20 },
          { id: 39, name: 'Dumbbell Step-Up', muscle: 'Legs', category: 'Dumbbell', level: 'Intermediate', sets: 3, reps: '12 each leg', weight: 15 },
          { id: 89, name: 'Pistol Squat', muscle: 'Legs', category: 'Bodyweight', level: 'Advanced', sets: 3, reps: '8 each leg', weight: 0 },
          { id: 100, name: 'Seated Calf Raise', muscle: 'Legs', category: 'Machine', level: 'Beginner', sets: 4, reps: '15-20', weight: 45 }
        ]
      }
    ],
    'Core': [
      {
        id: 'core-1',
        title: 'Ab Shredder',
        level: 'Intermediate',
        duration: '35 min',
        totalCalories: 280,
        image: require('../assets/images/placeholder.jpg'),
        exercises: [
          { id: 2, name: 'Standing Side Bends', muscle: 'Core', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '15 each side', weight: 0 },
          { id: 3, name: 'Plank', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '45-60 sec', weight: 0 },
          { id: 4, name: 'Sit-up', muscle: 'Core', category: 'Bodyweight', level: 'Beginner', sets: 3, reps: '15-20', weight: 0 },
          { id: 9, name: 'Mountain Climbers', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '30 each side', weight: 0 },
          { id: 84, name: 'Hollow Hold', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '30-45 sec', weight: 0 },
          { id: 5, name: 'Ab Wheel Rollout', muscle: 'Abs', category: 'Equipment', level: 'Advanced', sets: 3, reps: '8-12', weight: 0 },
          { id: 10, name: 'Dead Bug', muscle: 'Core', category: 'Post_warmup', level: 'Beginner', sets: 3, reps: '10 each side', weight: 0 }
        ]
      }
    ],
    'All': [
      {
        id: 'all-1',
        title: 'Total Body Conditioning',
        level: 'Intermediate',
        duration: '60 min',
        totalCalories: 450,
        image: require('../assets/images/placeholder.jpg'),
        exercises: [
          { id: 1, name: 'Jumping Jacks', muscle: 'Core', category: 'Pre_warmup', level: 'Beginner', sets: 2, reps: '45 sec', weight: 0 },
          { id: 24, name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 45 },
          { id: 33, name: 'Barbell Squat', muscle: 'Legs', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '10-12', weight: 50 },
          { id: 43, name: 'Deadlift', muscle: 'Back', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 60 },
          { id: 13, name: 'Overhead Press', muscle: 'Shoulders', category: 'Barbell', level: 'Intermediate', sets: 3, reps: '8-10', weight: 35 },
          { id: 64, name: 'Bicep Curl', muscle: 'Biceps', category: 'Dumbbell', level: 'Beginner', sets: 3, reps: '12-15', weight: 15 },
          { id: 75, name: 'Cable Tricep Pushdown', muscle: 'Triceps', category: 'Cable', level: 'Intermediate', sets: 3, reps: '12-15', weight: 25 },
          { id: 3, name: 'Plank', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 3, reps: '30-45 sec', weight: 0 },
          { id: 83, name: 'Burpees', muscle: 'Core', category: 'Bodyweight', level: 'Intermediate', sets: 2, reps: '10-15', weight: 0 }
        ]
      }
    ]
  };