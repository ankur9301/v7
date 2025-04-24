import { create } from 'zustand'
import { supabase } from '@/src/supabaseClient'

type WeeklyDay = { day: string; workouts: number; calories: number }

interface StatsState {
  weeklyActivity: WeeklyDay[]
  userStats: {
    streakDays: number
    monthlyWorkouts: number
    totalCalories: number
    totalMinutes: number
    weeklyCalories: number
    weeklyWorkouts: number
    totalWorkouts: number
  }
  fetchStats: (userId: string) => Promise<void>
}

export const useStatsStore = create<StatsState>((set) => ({
  weeklyActivity: [],
  userStats: {
    streakDays: 0,
    monthlyWorkouts: 0,
    totalCalories: 0,
    totalMinutes: 0,
    weeklyCalories: 0,
    weeklyWorkouts: 0,
    totalWorkouts: 0
  },

  fetchStats: async (userId) => {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 6)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)

    // ✅ First fetch past week data to calculate weekly stats
    const pastWeek = new Date();
    pastWeek.setHours(0, 0, 0, 0);
    pastWeek.setDate(pastWeek.getDate() - 6);
    
    const { data: sessions, error: weekError } = await supabase
      .from('workout_sessions')
      .select('calories_burned, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', pastWeek.toISOString()); // ✅ Always use ISO!
    
    // const pastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    // const { data: sessions } = await supabase
    //   .from('workout_sessions')
    //   .select('calories_burned, logged_at')
    //   .eq('user_id', userId)
    //   .gte('logged_at', pastWeek)

    const weeklyCalories = sessions ? sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0) : 0
    const weeklyWorkouts = sessions ? sessions.length : 0

    // ✅ Now fetch all user sessions for full stats
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('logged_at, duration_sec, calories_burned')
      .eq('user_id', userId)

    if (!data) return

    const weeklyMap: Record<string, { workouts: number; calories: number }> = {
      Sun: { workouts: 0, calories: 0 },
      Mon: { workouts: 0, calories: 0 },
      Tue: { workouts: 0, calories: 0 },
      Wed: { workouts: 0, calories: 0 },
      Thu: { workouts: 0, calories: 0 },
      Fri: { workouts: 0, calories: 0 },
      Sat: { workouts: 0, calories: 0 },
    }

    const recentDates: string[] = []
    let monthlyWorkouts = 0
    let totalCalories = 0
    let totalMinutes = 0

    data.forEach((d) => {
      const date = new Date(d.logged_at)
      const day = date.toLocaleDateString('en-US', { weekday: 'short' })

      // Weekly breakdown
      if (date >= sevenDaysAgo) {
        weeklyMap[day].workouts += 1
        weeklyMap[day].calories += d.calories_burned || 0
      }

      // Streak
      recentDates.push(date.toDateString())

      // Monthly totals
      if (date >= startOfMonth) {
        monthlyWorkouts += 1
        totalCalories += d.calories_burned || 0
        totalMinutes += Math.round((d.duration_sec || 0) / 60)
      }
    })

    const calculateStreak = (dates: string[]) => {
      const unique = [...new Set(dates)]
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const dayStr = new Date(today.setDate(today.getDate() - i)).toDateString()
        if (unique.includes(dayStr)) streak++
        else break
      }
      return streak
    }

    const weeklyActivity = Object.entries(weeklyMap).map(([day, data]) => ({
      day,
      workouts: data.workouts,
      calories: data.calories,
    }))

    // ✅ Final state update - include all stats + preserve weekly ones
    set((state) => ({
      weeklyActivity,
      userStats: {
        ...state.userStats,
        weeklyCalories,
        weeklyWorkouts,
        streakDays: calculateStreak(recentDates),
        monthlyWorkouts,
        totalCalories,
        totalMinutes,
        totalWorkouts: data.length
      },
    }))
  },
}))


// import { create } from 'zustand'
// import { supabase } from '@/src/supabaseClient'

// type WeeklyDay = { day: string; workouts: number; calories: number }

// interface StatsState {
//   weeklyActivity: WeeklyDay[]
//   userStats: {
//     streakDays: number
//     monthlyWorkouts: number
//     totalCalories: number
//     totalMinutes: number
//     weeklyCalories: number;
//     weeklyWorkouts: number;
//   }
//   fetchStats: (userId: string) => Promise<void>
// }

// export const useStatsStore = create<StatsState>((set) => ({
//   weeklyActivity: [],
//   userStats: {
//       streakDays: 0,
//       monthlyWorkouts: 0,
//       totalCalories: 0,
//       totalMinutes: 0,
//       weeklyCalories: 0,
//       weeklyWorkouts: 0
//   },

//   fetchStats: async (userId) => {
//     const now = new Date()
//     const sevenDaysAgo = new Date(now)
//     sevenDaysAgo.setDate(now.getDate() - 6)

//     const startOfMonth = new Date()
//     startOfMonth.setDate(1)

//     const pastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//     const { data: sessions } = await supabase
//     .from('workout_sessions')
//     .select('calories_burned, logged_at')
//     .eq('user_id', userId)
//     .gte('logged_at', pastWeek);

//     const weeklyCalories = sessions ? sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0) : 0;
//     const weeklyWorkouts = sessions ? sessions.length : 0;

  

//     const { data, error } = await supabase
//       .from('workout_sessions')
//       .select('logged_at, duration_sec, calories_burned')
//       .eq('user_id', userId)

//     if (!data) return

//     // WEEKLY activity
//     const weeklyMap: Record<string, { workouts: number; calories: number }> = {
//       Sun: { workouts: 0, calories: 0 },
//       Mon: { workouts: 0, calories: 0 },
//       Tue: { workouts: 0, calories: 0 },
//       Wed: { workouts: 0, calories: 0 },
//       Thu: { workouts: 0, calories: 0 },
//       Fri: { workouts: 0, calories: 0 },
//       Sat: { workouts: 0, calories: 0 },
//     }

//     const recentDates: string[] = []

//     let monthlyWorkouts = 0
//     let totalCalories = 0
//     let totalMinutes = 0

//     data.forEach((d) => {
//       const date = new Date(d.logged_at)
//       const day = date.toLocaleDateString('en-US', { weekday: 'short' })

//       // Weekly
//       if (date >= sevenDaysAgo) {
//         weeklyMap[day].workouts += 1
//         weeklyMap[day].calories += d.calories_burned || 0
//       }

//       // Streak
//       recentDates.push(date.toDateString())

//       // Monthly
//       if (date >= startOfMonth) {
//         monthlyWorkouts += 1
//         totalCalories += d.calories_burned || 0
//         totalMinutes += Math.round((d.duration_sec || 0) / 60)
//       }
//     })

//     // Streak calculation
//     const calculateStreak = (dates: string[]) => {
//       const unique = [...new Set(dates)]
//       let streak = 0
//       const today = new Date()
//       for (let i = 0; i < 30; i++) {
//         const dayStr = new Date(today.setDate(today.getDate() - i)).toDateString()
//         if (unique.includes(dayStr)) streak++
//         else break
//       }
//       return streak
//     }

//     const weeklyActivity = Object.entries(weeklyMap).map(([day, data]) => ({
//       day,
//       workouts: data.workouts,
//       calories: data.calories,
//     }))

//     set({
//       weeklyActivity,
//       userStats: {
//           streakDays: calculateStreak(recentDates),
//           monthlyWorkouts,
//           totalCalories,
//           totalMinutes,
//           weeklyCalories: 0,
//           weeklyWorkouts: 0
//       },
//     })
//   },
// }))
