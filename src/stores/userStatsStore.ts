import { create } from 'zustand'
import { supabase } from '@/src/supabaseClient'

export type ActivityDay = { day: string; workouts: number; calories: number }
export type WorkoutSession = {
  id: string
  muscles: string[]
  date: string
  calories?: number
}

// Convert a UTC timestamp string to local “YYYY-MM-DD”
const utcToLocalDateKey = (dateString: string) => {
  const d = new Date(dateString)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .split('T')[0]
}

interface StatsState {
  weeklyActivity: ActivityDay[]
  monthlyActivity: ActivityDay[]
  userStats: {
    streakDays: number
    monthlyWorkouts: number
    totalCalories: number
    totalMinutes: number
    weeklyCalories: number
    weeklyWorkouts: number
    totalWorkouts: number
  },
  allTimeStats: {
    streakDays: number
    monthlyWorkouts: number
    totalCalories: number
    totalMinutes: number
    weeklyCalories: number
    weeklyWorkouts: number
    totalWorkouts: number
  }
  
  
  
  
  fetchStats: (input: string) => Promise<WorkoutSession[]>
}

export const useStatsStore = create<StatsState>((set, get) => ({
  weeklyActivity: [],
  monthlyActivity: [],
  userStats: {
    streakDays: 0,
    monthlyWorkouts: 0,
    totalCalories: 0,
    totalMinutes: 0,
    weeklyCalories: 0,
    weeklyWorkouts: 0,
    totalWorkouts: 0,
  },
  allTimeStats: {
    streakDays: 0,
    monthlyWorkouts: 0,
    totalCalories: 0,
    totalMinutes: 0,
    weeklyCalories: 0,
    weeklyWorkouts: 0,
    totalWorkouts: 0,
  },
  


  fetchStats: async (input) => {
    const [userId, startStr, endStr] = input.split('|')
    const isAllTime = startStr === 'ALL'

    let start: Date | null = null
    let end: Date | null = null
    if (!isAllTime) {
      start = new Date(startStr)
      end = new Date(endStr)
    }

    const isWeeklyView = !isAllTime && (end!.getTime() - start!.getTime()) <= 7 * 24 * 60 * 60 * 1_000
    const month = isAllTime ? 0 : start!.getMonth()
    const year = isAllTime ? 0 : start!.getFullYear()

    console.log(`📅 Fetch range: ${startStr} → ${endStr}`)

    let sessionQuery = supabase
      .from('workout_sessions')
      .select('id, calories_burned, logged_at, duration_sec')
      .eq('user_id', userId)

    if (!isAllTime) {
      sessionQuery = sessionQuery
        .gte('logged_at', startStr)
        .lte('logged_at', endStr)
    } else {
      sessionQuery = sessionQuery.lte('logged_at', new Date().toISOString())
    }

    const { data: sessions, error } = await sessionQuery

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // if (!sessions || sessions.length === 0) {
    //   set({
    //     weeklyActivity: [],
    //     monthlyActivity: [],
    //     userStats: {
    //       ...get().userStats,
    //       weeklyCalories: 0,
    //       weeklyWorkouts: 0,
    //       monthlyWorkouts: 0,
    //       totalCalories: 0,
    //       totalMinutes: 0,
    //       totalWorkouts: 0,
    //       streakDays: 0,
    //     },
    //   })
    //   return []
    // }
    if (!sessions || sessions.length === 0) {
      if (isWeeklyView) {
        set({ weeklyActivity: [] })
      } else {
        set({ monthlyActivity: [] })
      }
      return []
    }
    



    const weekMap: Record<string, { workouts: number; calories: number }> = {}
    if (!isAllTime && start) {
      for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        weekMap[d.toISOString().slice(0, 10)] = { workouts: 0, calories: 0 }
      }
    }
    let weeklyCalories = 0
    let weeklyWorkouts = 0

    sessions.forEach((s) => {
      const key = utcToLocalDateKey(s.logged_at)
      if (weekMap[key]) {
        weekMap[key].workouts++
        weekMap[key].calories += s.calories_burned || 0
        weeklyWorkouts++
        weeklyCalories += s.calories_burned || 0
      }
    })

    const weeklyActivity: ActivityDay[] = isAllTime ? [] : Object
      .entries(weekMap)
      .map(([iso, bin]) => ({
        day: new Date(iso).toLocaleDateString('en-US', { weekday: 'short' }),
        workouts: bin.workouts,
        calories: bin.calories,
      }))

    const monthMap: Record<string, { workouts: number; calories: number }> = {}
    if (!isAllTime) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = new Date(year, month, d).toISOString().slice(0, 10)
        monthMap[iso] = { workouts: 0, calories: 0 }
      }
    }

    let monthlyWorkouts = 0
    let monthlyCalories = 0
    let monthlyMinutes = 0
    const recentDates: string[] = []

    sessions.forEach((s) => {
      const key = utcToLocalDateKey(s.logged_at)
      if (monthMap[key]) {
        monthMap[key].workouts++
        monthMap[key].calories += s.calories_burned || 0
        monthlyWorkouts++
        monthlyCalories += s.calories_burned || 0
        monthlyMinutes += Math.round((s.duration_sec || 0) / 60)
      }
      recentDates.push(new Date(s.logged_at).toDateString())
    })

    const monthlyActivity: ActivityDay[] = isAllTime ? [] : Object
      .entries(monthMap)
      .map(([day, bin]) => ({
        day,
        workouts: bin.workouts,
        calories: bin.calories,
      }))

    const calculateStreak = (dates: string[]) => {
      const unique = Array.from(new Set(dates))
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        if (unique.includes(d.toDateString())) streak++
        else break
      }
      return streak
    }

    // set({
    //   weeklyActivity,
    //   monthlyActivity,
    //   userStats: {
    //     streakDays: calculateStreak(recentDates),
    //     monthlyWorkouts: isAllTime ? 0 : monthlyWorkouts,
    //     totalCalories: sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0),
    //     totalMinutes: sessions.reduce((sum, s) => sum + Math.round((s.duration_sec || 0) / 60), 0),
    //     weeklyCalories,
    //     weeklyWorkouts,
    //     totalWorkouts: sessions.length,
    //   },
    // })
    if (isAllTime) {
      set({
        allTimeStats: {
          streakDays: calculateStreak(recentDates),
          monthlyWorkouts: 0,
          totalCalories: sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0),
          totalMinutes: sessions.reduce((sum, s) => sum + Math.round((s.duration_sec || 0) / 60), 0),
          weeklyCalories: 0,
          weeklyWorkouts: 0,
          totalWorkouts: sessions.length,
        },
      })
    } else {
      set({
        weeklyActivity,
        monthlyActivity,
        userStats: {
          streakDays: calculateStreak(recentDates),
          monthlyWorkouts: isAllTime ? 0 : monthlyWorkouts,
          totalCalories: sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0),
          totalMinutes: sessions.reduce((sum, s) => sum + Math.round((s.duration_sec || 0) / 60), 0),
          weeklyCalories,
          weeklyWorkouts,
          totalWorkouts: sessions.length,
        },
      })
    }
    

    return sessions.map((s) => ({
      id: s.id,
      muscles: [],
      date: s.logged_at,
      calories: s.calories_burned,
    }))
  },
}))


// // src/stores/userStatsStore.ts
// import { create } from 'zustand'
// import { supabase } from '@/src/supabaseClient'

// export type ActivityDay = { day: string; workouts: number; calories: number }
// export type WorkoutSession = {
//   id: string
//   muscles: string[]    // placeholder for later enrichment
//   date:    string
//   calories?: number
// }

// // Convert a UTC timestamp string to local “YYYY-MM-DD”
// const utcToLocalDateKey = (dateString: string) => {
//   const d = new Date(dateString)
//   return new Date(d.getFullYear(), d.getMonth(), d.getDate())
//     .toISOString()
//     .split('T')[0]
// }

// interface StatsState {
//   weeklyActivity:   ActivityDay[]
//   monthlyActivity:  ActivityDay[]
//   userStats: {
//     streakDays:      number
//     monthlyWorkouts: number
//     totalCalories:   number
//     totalMinutes:    number
//     weeklyCalories:  number
//     weeklyWorkouts:  number
//     totalWorkouts:   number
//   }
//   fetchStats: (input: string) => Promise<WorkoutSession[]>
// }

// export const useStatsStore = create<StatsState>((set, get) => ({
//   weeklyActivity:  [],
//   monthlyActivity: [],
//   userStats: {
//     streakDays:      0,
//     monthlyWorkouts: 0,
//     totalCalories:   0,
//     totalMinutes:    0,
//     weeklyCalories:  0,
//     weeklyWorkouts:  0,
//     totalWorkouts:   0,
//   },

//   fetchStats: async (input) => {
//     // const [userId, startStr, endStr] = input.split('|')
//     const [userId, startStr, endStr] = input.split('|')
//     const isAllTime = startStr === 'ALL'

//     const start = new Date(startStr)
//     const end   = new Date(endStr)

//     // Are we looking at a 7-day window (weekly) or a full month?
//     const isWeeklyView = (end.getTime() - start.getTime()) <= 7 * 24 * 60 * 60 * 1_000
//     const month        = start.getMonth()
//     const year         = start.getFullYear()

//     console.log(`📅 Fetch range: ${start.toISOString()} → ${end.toISOString()}`)

//     // const { data: sessions, error } = await supabase
//     //   .from('workout_sessions')
//     //   .select('id, calories_burned, logged_at, duration_sec')
//     //   .eq('user_id', userId)
//     //   .gte('logged_at', start.toISOString())
//     //   .lte('logged_at', end.toISOString())

//     let sessionQuery = supabase
//   .from('workout_sessions')
//   .select('id, calories_burned, logged_at, duration_sec')
//   .eq('user_id', userId)

// if (!isAllTime) {
//   sessionQuery = sessionQuery
//     .gte('logged_at', startStr)
//     .lte('logged_at', endStr)
// }

// const { data: sessions, error } = await sessionQuery

//     if (error) {
//       console.error('Supabase error:', error)
//       throw error
//     }

//     // If no data, zero‐out only that slice (weekly vs. monthly)
//     // if (!sessions || sessions.length === 0) {
//     //   if (isWeeklyView) {
//     //     set({
//     //       weeklyActivity: [],
//     //       userStats: {
//     //         ...get().userStats,
//     //         weeklyCalories: 0,
//     //         weeklyWorkouts: 0,
//     //       },
//     //     })
//     //   } else {
//     //     set({
//     //       monthlyActivity: [],
//     //       userStats: {
//     //         ...get().userStats,
//     //         monthlyWorkouts: 0,
//     //         totalCalories:   0,
//     //         totalMinutes:    0,
//     //       },
//     //     })
//     //   }
//     //   return []
//     // }
//     if (!sessions || sessions.length === 0) {
//       set({
//         weeklyActivity: [],
//         monthlyActivity: [],
//         userStats: {
//           ...get().userStats,
//           weeklyCalories: 0,
//           weeklyWorkouts: 0,
//           monthlyWorkouts: 0,
//           totalCalories:   0,
//           totalMinutes:    0,
//           totalWorkouts:   0,
//           streakDays:      0,
//         },
//       })
//       return []
//     }
    

//     //
//     // 1️⃣ BUILD WEEKLY ACTIVITY
//     //
//     const weekMap: Record<string, { workouts: number; calories: number }> = {}
//     for (let i = 0; i < 7; i++) {
//       const d = new Date(start)
//       d.setDate(d.getDate() + i)
//       weekMap[d.toISOString().slice(0, 10)] = { workouts: 0, calories: 0 }
//     }
//     let weeklyCalories = 0
//     let weeklyWorkouts = 0

//     sessions.forEach((s) => {
//       const key = utcToLocalDateKey(s.logged_at)
//       if (weekMap[key]) {
//         weekMap[key].workouts++
//         weekMap[key].calories += s.calories_burned || 0
//         weeklyWorkouts++
//         weeklyCalories += s.calories_burned || 0
//       }
//     })

//     const weeklyActivity: ActivityDay[] = Object
//       .entries(weekMap)
//       .map(([iso, bin]) => ({
//         day:      new Date(iso).toLocaleDateString('en-US', { weekday: 'short' }),
//         workouts: bin.workouts,
//         calories: bin.calories,
//       }))

//     //
//     // 2️⃣ BUILD MONTHLY ACTIVITY
//     //
//     const daysInMonth = new Date(year, month + 1, 0).getDate()
//     const monthMap: Record<string, { workouts: number; calories: number }> = {}
//     for (let d = 1; d <= daysInMonth; d++) {
//       const iso = new Date(year, month, d).toISOString().slice(0, 10)
//       monthMap[iso] = { workouts: 0, calories: 0 }
//     }
//     let monthlyWorkouts = 0
//     let monthlyCalories = 0
//     let monthlyMinutes  = 0
//     const recentDates: string[] = []

//     sessions.forEach((s) => {
//       const key = utcToLocalDateKey(s.logged_at)
//       if (monthMap[key]) {
//         monthMap[key].workouts++
//         monthMap[key].calories += s.calories_burned || 0
//         monthlyWorkouts++
//         monthlyCalories += s.calories_burned || 0
//         monthlyMinutes  += Math.round((s.duration_sec || 0) / 60)
//       }
//       recentDates.push(new Date(s.logged_at).toDateString())
//     })

//     const monthlyActivity: ActivityDay[] = Object
//       .entries(monthMap)
//       .map(([day, bin]) => ({
//         day,
//         workouts: bin.workouts,
//         calories: bin.calories,
//       }))

//     //
//     // 3️⃣ CALCULATE STREAK
//     //
//     const calculateStreak = (dates: string[]) => {
//       const unique = Array.from(new Set(dates))
//       let streak = 0
//       const today = new Date()
//       today.setHours(0, 0, 0, 0)
//       for (let i = 0; i < 30; i++) {
//         const d = new Date(today)
//         d.setDate(d.getDate() - i)
//         if (unique.includes(d.toDateString())) streak++
//         else break
//       }
//       return streak
//     }

//     //
//     // WRITE BACK
//     //
//     set({
//       weeklyActivity,
//       monthlyActivity,
//       // userStats: {
//       //   streakDays:      calculateStreak(recentDates),
//       //   monthlyWorkouts,
//       //   totalCalories:   monthlyCalories,
//       //   totalMinutes:    monthlyMinutes,
//       //   weeklyCalories,
//       //   weeklyWorkouts,
//       //   totalWorkouts:   sessions.length,
//       // },
//       userStats: {
//         streakDays:      calculateStreak(recentDates),
//         monthlyWorkouts: isAllTime ? 0 : monthlyWorkouts,
//         totalCalories:   sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0),
//         totalMinutes:    sessions.reduce((sum, s) => sum + Math.round((s.duration_sec || 0) / 60), 0),
//         weeklyCalories,
//         weeklyWorkouts,
//         totalWorkouts:   sessions.length,
//       },      
//     })

//     // Return minimal sessions for your muscle‐distribution, etc.
//     return sessions.map((s) => ({
//       id: s.id,
//       muscles:  [],
//       date:     s.logged_at,
//       calories: s.calories_burned,
//     }))
//   },
// }))

// // src/stores/userStatsStore.ts
// import { create } from 'zustand'
// import { supabase } from '@/src/supabaseClient'

// export type ActivityDay = { day: string; workouts: number; calories: number }
// export type WorkoutSession = {
//   muscles: string[]  // placeholder
//   date: string
//   calories?: number
// }

// const utcToLocalDateKey = (dateString: string) => {
//   const d = new Date(dateString)
//   return new Date(d.getFullYear(), d.getMonth(), d.getDate())
//     .toISOString()
//     .split('T')[0]
// }

// interface StatsState {
//   weeklyActivity: ActivityDay[]
//   monthlyActivity: ActivityDay[]
//   userStats: {
//     streakDays: number
//     monthlyWorkouts: number
//     totalCalories: number
//     totalMinutes: number
//     weeklyCalories: number
//     weeklyWorkouts: number
//     totalWorkouts: number
//   }
//   fetchStats: (input: string) => Promise<WorkoutSession[]>
// }

// export const useStatsStore = create<StatsState>((set, get) => ({
//   weeklyActivity: [],
//   monthlyActivity: [],
//   userStats: {
//     streakDays:      0,
//     monthlyWorkouts: 0,
//     totalCalories:   0,
//     totalMinutes:    0,
//     weeklyCalories:  0,
//     weeklyWorkouts:  0,
//     totalWorkouts:   0,
//   },

//   fetchStats: async (input) => {
//     const [userId, startStr, endStr] = input.split('|')
//     const start = new Date(startStr)
//     const end   = new Date(endStr)
//     const isWeeklyView = (end.getTime() - start.getTime()) <= 7 * 24 * 60 * 60 * 1000
//     const month = start.getMonth()
//     const year  = start.getFullYear()

//     console.log(`📅 Fetch range: ${start.toISOString()} → ${end.toISOString()}`)

//     const { data: sessions, error } = await supabase
//       .from('workout_sessions')
//       .select('calories_burned, logged_at, duration_sec')
//       .eq('user_id', userId)
//       .gte('logged_at', start.toISOString())
//       .lte('logged_at',   end.toISOString())

//     if (error) {
//       console.error('Supabase error:', error)
//       return []
//     }

//     // === NO SESSIONS branch ===
//     if (!sessions || sessions.length === 0) {
//       if (isWeeklyView) {
//         // clear only the weekly side
//         set({
//           weeklyActivity: [],
//           userStats: {
//             ...get().userStats,
//             weeklyCalories: 0,
//             weeklyWorkouts: 0,
//             totalWorkouts:  get().userStats.totalWorkouts, // keep overall total
//           },
//         })
//       } else {
//         // clear only the monthly side
//         set({
//           monthlyActivity: [],
//           userStats: {
//             ...get().userStats,
//             monthlyWorkouts: 0,
//             totalCalories:   0,
//             totalMinutes:    0,
//             totalWorkouts:   get().userStats.totalWorkouts,
//           },
//         })
//       }
//       return []
//     }

//     // ————————————— Build weekly map (always) —————————————
//     const weekMap: Record<string, { workouts: number; calories: number }> = {}
//     for (let i = 0; i < 7; i++) {
//       const d = new Date(start)
//       d.setDate(d.getDate() + i)
//       weekMap[d.toISOString().slice(0, 10)] = { workouts: 0, calories: 0 }
//     }
//     let weeklyCalories = 0
//     let weeklyWorkouts = 0
//     sessions.forEach(s => {
//       const key = utcToLocalDateKey(s.logged_at)
//       if (weekMap[key]) {
//         weekMap[key].workouts++
//         weekMap[key].calories += s.calories_burned || 0
//         weeklyWorkouts++
//         weeklyCalories += s.calories_burned || 0
//       }
//     })
//     const weeklyActivity = Object.entries(weekMap).map(
//       ([iso, bin]) => ({
//         day:      new Date(iso).toLocaleDateString('en-US', { weekday: 'short' }),
//         workouts: bin.workouts,
//         calories: bin.calories,
//       })
//     )

//     // ————————————— Build monthly map (always) —————————————
//     const daysInMonth = new Date(year, month+1, 0).getDate()
//     const monthMap: Record<string, { workouts: number; calories: number }> = {}
//     for (let d = 1; d <= daysInMonth; d++) {
//       const iso = new Date(year, month, d).toISOString().slice(0,10)
//       monthMap[iso] = { workouts: 0, calories: 0 }
//     }
//     let monthlyWorkouts = 0
//     let monthlyCalories = 0
//     let monthlyMinutes  = 0
//     const recentDates: string[] = []
//     sessions.forEach(s => {
//       const key = utcToLocalDateKey(s.logged_at)
//       if (monthMap[key]) {
//         monthMap[key].workouts++
//         monthMap[key].calories += s.calories_burned || 0
//         monthlyWorkouts++
//         monthlyCalories += s.calories_burned || 0
//         monthlyMinutes += Math.round((s.duration_sec||0)/60)
//       }
//       recentDates.push(new Date(s.logged_at).toDateString())
//     })
//     const monthlyActivity = Object.entries(monthMap).map(
//       ([day,bin]) => ({
//         day,
//         workouts: bin.workouts,
//         calories: bin.calories,
//       })
//     )

//     // ————————————— Calculate streak —————————————
//     const calculateStreak = (dates: string[]) => {
//       const unique = Array.from(new Set(dates))
//       let streak = 0
//       const today = new Date()
//       today.setHours(0,0,0,0)
//       for (let i=0; i<30; i++){
//         const d = new Date(today)
//         d.setDate(d.getDate() - i)
//         if (unique.includes(d.toDateString())) streak++ 
//         else break
//       }
//       return streak
//     }

//     // ————————————— finally set both sides —————————————
//     set({
//       weeklyActivity,
//       monthlyActivity,
//       userStats: {
//         streakDays:      calculateStreak(recentDates),
//         weeklyCalories,
//         weeklyWorkouts,
//         monthlyWorkouts,
//         totalCalories:   monthlyCalories,
//         totalMinutes:    monthlyMinutes,
//         totalWorkouts:   sessions.length,
//       },
//     })

//     // return minimal sessions for your muscle chart
//     return sessions.map(s => ({
//       muscles:  [],
//       date:     s.logged_at,
//       calories: s.calories_burned,
//     }))
//   },
// }))



// import { create } from 'zustand';
// import { supabase } from '@/src/supabaseClient';

// type ActivityDay = { day: string; workouts: number; calories: number };

// type WorkoutSession = {
//   muscles: string[]; // Can be enhanced with actual data later
//   date: string;
//   calories?: number;
// };


// const utcToLocalDateKey = (dateString: string) => {
//   const date = new Date(dateString);
//   // Convert to local time string without time component
//   return new Date(
//     date.getFullYear(),
//     date.getMonth(),
//     date.getDate()
//   ).toISOString().split('T')[0];
// };
// // Helper to get all days in a month
// const getAllDaysInMonth = (year: number, month: number) => {
//   const date = new Date(year, month, 1);
//   const days = [];

//   while (date.getMonth() === month) {
//     days.push(new Date(date));
//     date.setDate(date.getDate() + 1);
//   }

//   return days;
// };

// interface StatsState {
//   weeklyActivity: ActivityDay[];
//   monthlyActivity: ActivityDay[];
//   userStats: {
//     streakDays: number;
//     monthlyWorkouts: number;
//     totalCalories: number;
//     totalMinutes: number;
//     weeklyCalories: number;
//     weeklyWorkouts: number;
//     totalWorkouts: number;
//   };
//   fetchStats: (input: string) => Promise<WorkoutSession[]>;
// }

// export const useStatsStore = create<StatsState>((set) => ({
//   weeklyActivity: [],
//   monthlyActivity: [],
//   userStats: {
//     streakDays: 0,
//     monthlyWorkouts: 0,
//     totalCalories: 0,
//     totalMinutes: 0,
//     weeklyCalories: 0,
//     weeklyWorkouts: 0,
//     totalWorkouts: 0,
//   },

//   fetchStats: async (input) => {
//     const [userId, startStr, endStr] = input.split('|');
//     const start = new Date(startStr);
//     const end = new Date(endStr);
  
//     console.log(`📅 Fetch range: ${start.toISOString()} to ${end.toISOString()}`);
//     // Determine if we're in weekly or monthly view
//     const isWeeklyView = (end.getTime() - start.getTime()) <= 7 * 24 * 60 * 60 * 1000;
//     const viewingMonth = start.getMonth();
//     const viewingYear = start.getFullYear();
  
//     // Fetch sessions with proper date range
//     const { data: sessions, error } = await supabase
//       .from('workout_sessions')
//       .select('id, calories_burned, logged_at, duration_sec')
//       .eq('user_id', userId)
//       .gte('logged_at', start.toISOString())
//       .lte('logged_at', end.toISOString());

//       if (!sessions || sessions.length === 0) {
//         set({
//           weeklyActivity: [],
//           monthlyActivity: [],
//           userStats: {
//             streakDays: 0,
//             monthlyWorkouts: 0,
//             totalCalories: 0,
//             totalMinutes: 0,
//             weeklyCalories: 0,
//             weeklyWorkouts: 0,
//             totalWorkouts: 0,
//           },
//         });
//         return [];
//       }
    
  
//     if (error || !sessions) {
//       console.error("Error fetching sessions:", error);
//       return [];
//     }

//     console.log(`📊 Fetched ${sessions.length} sessions:`);
//     sessions.forEach(s => console.log(
//       `- ${s.logged_at} (${new Date(s.logged_at).toLocaleDateString()}) ` + 
//       `Calories: ${s.calories_burned}`
//     ));
  
//     // Initialize data structures
//     let weeklyActivity: ActivityDay[] = [];
//     let monthlyActivity: ActivityDay[] = [];
//     let weeklyCalories = 0;
//     let weeklyWorkouts = 0;
//     let monthlyWorkouts = 0;
//     let monthlyCalories = 0;
//     let monthlyMinutes = 0;
//     const recentDates: string[] = [];
  
//     // Process sessions for weekly view
//     if (isWeeklyView) {
//       // Create a map for each day of the week
//       const weekMap: Record<string, { workouts: number; calories: number }> = {};
      
//       // Initialize all 7 days
//       for (let i = 0; i < 7; i++) {
//         const date = new Date(start);
//         date.setDate(date.getDate() + i);
//         const dateKey = date.toISOString().split('T')[0];
//         weekMap[dateKey] = { workouts: 0, calories: 0 };
//       }
  
//       // Process each session
//       sessions.forEach(session => {
//         const localDateKey = utcToLocalDateKey(session.logged_at);
        
//         if (weekMap[localDateKey]) {
//           weekMap[localDateKey].workouts += 1;
//           weekMap[localDateKey].calories += session.calories_burned || 0;
//           weeklyCalories += session.calories_burned || 0;
//           weeklyWorkouts += 1;
//         }
//       });
  
//       // Convert to weekly activity array
//       weeklyActivity = Object.entries(weekMap).map(([day, data]) => ({
//         day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
//         workouts: data.workouts,
//         calories: data.calories
//       }));
//     }
  
//     // Process sessions for monthly view
//     const monthMap: Record<string, { workouts: number; calories: number }> = {};
    
//     // Initialize all days in month
//     const daysInMonth = new Date(viewingYear, viewingMonth + 1, 0).getDate();
//     for (let i = 1; i <= daysInMonth; i++) {
//       const dateKey = new Date(viewingYear, viewingMonth, i).toISOString().split('T')[0];
//       monthMap[dateKey] = { workouts: 0, calories: 0 };
//     }
  
//     // Process each session
//     sessions.forEach(session => {
//       const sessionDate = new Date(session.logged_at);
//       const localDateKey = utcToLocalDateKey(session.logged_at);
      
//       if (monthMap[localDateKey]) {
//         monthMap[localDateKey].workouts += 1;
//         monthMap[localDateKey].calories += session.calories_burned || 0;
//         monthlyWorkouts += 1;
//         monthlyCalories += session.calories_burned || 0;
//         monthlyMinutes += Math.round((session.duration_sec || 0) / 60);
//       }
  
//       recentDates.push(sessionDate.toDateString());
//     });
  
//     // Convert to monthly activity array
//     monthlyActivity = Object.entries(monthMap).map(([day, data]) => ({
//       day,
//       workouts: data.workouts,
//       calories: data.calories
//     }));
  
//     // Calculate streak
//     const calculateStreak = (dates: string[]) => {
//       const unique = [...new Set(dates)];
//       let streak = 0;
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
  
//       for (let i = 0; i < 30; i++) {
//         const checkDate = new Date(today);
//         checkDate.setDate(checkDate.getDate() - i);
//         if (unique.includes(checkDate.toDateString())) streak++;
//         else break;
//       }
//       return streak;
//     };
  
//     set({
//       weeklyActivity,
//       monthlyActivity,
//       userStats: {
//         streakDays: calculateStreak(recentDates),
//         monthlyWorkouts,
//         totalCalories: monthlyCalories,
//         totalMinutes: monthlyMinutes,
//         weeklyCalories,
//         weeklyWorkouts,
//         totalWorkouts: sessions.length,
//       },
//     });
  
//     return sessions.map((s) => ({
//       muscles: [],
//       date: s.logged_at,
//       calories: s.calories_burned,
//     }));
//   },
// }));


// import { create } from 'zustand';
// import { supabase } from '@/src/supabaseClient';

// type ActivityDay = { day: string; workouts: number; calories: number };

// // Helper to convert UTC to local date string without time
// const utcToLocalDateKey = (dateString: string) => {
//   const date = new Date(dateString);
//   return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
// };

// // Helper to get all days in a month
// const getAllDaysInMonth = (year: number, month: number) => {
//   const date = new Date(year, month, 1);
//   const days = [];
  
//   while (date.getMonth() === month) {
//     days.push(new Date(date));
//     date.setDate(date.getDate() + 1);
//   }
  
//   return days;
// };

// interface StatsState {
//   weeklyActivity: ActivityDay[];
//   monthlyActivity: ActivityDay[];
//   userStats: {
//     streakDays: number;
//     monthlyWorkouts: number;
//     totalCalories: number;
//     totalMinutes: number;
//     weeklyCalories: number;
//     weeklyWorkouts: number;
//     totalWorkouts: number;
//   };
//   fetchStats: (input: string) => Promise<void>;
// }

// export const useStatsStore = create<StatsState>((set) => ({
//   weeklyActivity: [],
//   monthlyActivity: [],
//   userStats: {
//     streakDays: 0,
//     monthlyWorkouts: 0,
//     totalCalories: 0,
//     totalMinutes: 0,
//     weeklyCalories: 0,
//     weeklyWorkouts: 0,
//     totalWorkouts: 0
//   },

//   fetchStats: async (input) => {
//     console.log("⚙️ fetchStats input:", input);
//     const [userId, startStr, endStr] = input.split('|');
    
//     const start = new Date(startStr);
//     const end = new Date(endStr);
    
//     // Determine if we're viewing weekly or monthly data
//     const isWeeklyView = (end.getTime() - start.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    
//     // Get the month we're viewing (based on start date)
//     const viewingMonth = start.getMonth();
//     const viewingYear = start.getFullYear();
    
//     // Get all days in the viewed month
//     const allDaysInMonth = getAllDaysInMonth(viewingYear, viewingMonth);
//     const firstDayOfMonth = allDaysInMonth[0];
//     const lastDayOfMonth = allDaysInMonth[allDaysInMonth.length - 1];
//     lastDayOfMonth.setHours(23, 59, 59, 999);

//     // Fetch sessions for the requested period
//     const { data: sessions, error } = await supabase
//       .from('workout_sessions')
//       .select('id, calories_burned, logged_at, duration_sec')
//       .eq('user_id', userId)
//       .gte('logged_at', isWeeklyView ? start.toISOString() : firstDayOfMonth.toISOString())
//       .lte('logged_at', isWeeklyView ? end.toISOString() : lastDayOfMonth.toISOString());

//     if (error) {
//       console.error("Error fetching sessions:", error);
//       return;
//     }

//     // Initialize data structures
//     const weeklyMap: Record<string, { workouts: number; calories: number }> = {};
//     const monthMap: Record<string, { workouts: number; calories: number }> = {};
//     const weeklyLabels: string[] = [];
//     const monthLabels: string[] = [];

//     // Generate weekly data (if in weekly view)
//     if (isWeeklyView) {
//       for (let i = 0; i < 7; i++) {
//         const date = new Date(start);
//         date.setDate(date.getDate() + i);
//         const label = date.toLocaleDateString('en-US', { weekday: 'short' });
//         weeklyMap[label] = { workouts: 0, calories: 0 };
//         weeklyLabels.push(label);
//       }
//     }

//     // Generate monthly data structure
//     allDaysInMonth.forEach(day => {
//       const key = day.toISOString().split('T')[0];
//       monthMap[key] = { workouts: 0, calories: 0 };
//       monthLabels.push(key);
//     });

//     // Process all sessions
//     let weeklyCalories = 0;
//     let weeklyWorkouts = 0;
//     let monthlyWorkouts = 0;
//     let monthlyCalories = 0;
//     let monthlyMinutes = 0;
//     const recentDates: string[] = [];

//     sessions.forEach(session => {
//       const sessionDate = new Date(session.logged_at);
//       const localDateKey = utcToLocalDateKey(session.logged_at);
      
//       // Weekly stats
//       if (isWeeklyView) {
//         const day = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
//         if (weeklyMap[day]) {
//           weeklyMap[day].workouts += 1;
//           weeklyMap[day].calories += session.calories_burned || 0;
//         }
//         weeklyCalories += session.calories_burned || 0;
//         weeklyWorkouts += 1;
//       }

//       // Monthly stats
//       if (sessionDate.getMonth() === viewingMonth && 
//           sessionDate.getFullYear() === viewingYear) {
//         if (monthMap[localDateKey]) {
//           monthMap[localDateKey].workouts += 1;
//           monthMap[localDateKey].calories += session.calories_burned || 0;
//         }
//         monthlyWorkouts += 1;
//         monthlyCalories += session.calories_burned || 0;
//         monthlyMinutes += Math.round((session.duration_sec || 0) / 60);
//       }

//       // For streak calculation
//       recentDates.push(sessionDate.toDateString());
//     });

//     // Streak calculation
//     const calculateStreak = (dates: string[]) => {
//       const unique = [...new Set(dates)];
//       let streak = 0;
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       for (let i = 0; i < 30; i++) {
//         const checkDate = new Date(today);
//         checkDate.setDate(checkDate.getDate() - i);
//         if (unique.includes(checkDate.toDateString())) streak++;
//         else break;
//       }
//       return streak;
//     };

//     // Update state
//     set({
//       weeklyActivity: isWeeklyView 
//         ? weeklyLabels.map(day => ({
//             day,
//             workouts: weeklyMap[day].workouts,
//             calories: weeklyMap[day].calories,
//           }))
//         : [],
//       monthlyActivity: monthLabels.map(dateKey => ({
//         day: dateKey,
//         workouts: monthMap[dateKey].workouts,
//         calories: monthMap[dateKey].calories,
//       })),
//       userStats: {
//         streakDays: calculateStreak(recentDates),
//         monthlyWorkouts,
//         totalCalories: monthlyCalories,
//         totalMinutes: monthlyMinutes,
//         weeklyCalories,
//         weeklyWorkouts,
//         totalWorkouts: sessions.length,
//       },
//     });
//   },
// }));

// import { create } from 'zustand'
// import { supabase } from '@/src/supabaseClient'

// type WeeklyDay = { day: string; workouts: number; calories: number }

// // Helper to convert UTC to local date string without time
// const utcToLocalDateKey = (dateString: string) => {
//   const date = new Date(dateString);
//   return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
// };

// // Helper to get start/end of month in local time
// const getLocalMonthRange = (date: Date) => {
//   const start = new Date(date.getFullYear(), date.getMonth(), 1);
//   const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
//   end.setHours(23, 59, 59, 999);
//   return { start, end };
// };

// interface StatsState {
//   weeklyActivity: WeeklyDay[]
//   monthlyActivity: WeeklyDay[]
//   userStats: {
//     streakDays: number
//     monthlyWorkouts: number
//     totalCalories: number
//     totalMinutes: number
//     weeklyCalories: number
//     weeklyWorkouts: number
//     totalWorkouts: number
//   }
//   fetchStats: (userId: string) => Promise<void>
// }

// export const useStatsStore = create<StatsState>((set) => ({
//   weeklyActivity: [],
//   monthlyActivity: [],
//   userStats: {
//     streakDays: 0,
//     monthlyWorkouts: 0,
//     totalCalories: 0,
//     totalMinutes: 0,
//     weeklyCalories: 0,
//     weeklyWorkouts: 0,
//     totalWorkouts: 0
//   },

// fetchStats: async (input) => {
//   console.log("⚙️ fetchStats input:", input);
//   const [userId, startStr, endStr] = input.split('|');
  
//   const start = new Date(startStr);
//   const end = new Date(endStr);
  
//   // Get proper month boundaries in local time
//   const { start: startOfMonth, end: endOfMonth } = getLocalMonthRange(start);
  
//   // Fetch sessions for the requested period
//   const { data: sessions, error } = await supabase
//     .from('workout_sessions')
//     .select('id, calories_burned, logged_at, duration_sec')
//     .eq('user_id', userId)
//     .gte('logged_at', start.toISOString())
//     .lte('logged_at', end.toISOString());

//   if (error) {
//     console.error("Error fetching sessions:", error);
//     return;
//   }

//   // Weekly calculations (for the current view period)
//   const weeklyCalories = sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0);
//   const weeklyWorkouts = sessions.length;

//   // Monthly calculations (only for the currently selected month)
//   const monthlySessions = sessions.filter(s => {
//     const sessionDate = new Date(s.logged_at);
//     const sessionMonth = sessionDate.getMonth();
//     const sessionYear = sessionDate.getFullYear();
//     return sessionMonth === startOfMonth.getMonth() && 
//            sessionYear === startOfMonth.getFullYear();
//   });

//   const monthlyWorkouts = monthlySessions.length;
//   const monthlyCalories = monthlySessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0);
//   const monthlyMinutes = monthlySessions.reduce((sum, s) => sum + Math.round((s.duration_sec || 0) / 60), 0);

//   // Generate weekly activity data (unchanged)
//   const weeklyMap: Record<string, { workouts: number; calories: number }> = {};
//   const dayLabels: string[] = [];

//   for (let i = 0; i < 7; i++) {
//     const date = new Date(start);
//     date.setDate(date.getDate() + i);
//     const label = date.toLocaleDateString('en-US', { weekday: 'short' });
//     weeklyMap[label] = { workouts: 0, calories: 0 };
//     dayLabels.push(label);
//   }

//   sessions.forEach((s) => {
//     const date = new Date(s.logged_at);
//     const day = date.toLocaleDateString('en-US', { weekday: 'short' });
//     if (weeklyMap[day]) {
//       weeklyMap[day].workouts += 1;
//       weeklyMap[day].calories += s.calories_burned || 0;
//     }
//   });
//   const getAllDaysInMonth = (year: number, month: number) => {
//     const date = new Date(year, month, 1);
//     const days = [];
    
//     while (date.getMonth() === month) {
//       days.push(new Date(date));
//       date.setDate(date.getDate() + 1);
//     }
    
//     return days;
//   };
//   const weeklyActivity = dayLabels.map(day => ({
//     day,
//     workouts: weeklyMap[day].workouts,
//     calories: weeklyMap[day].calories,
//   }));

//   // Generate monthly activity data (fixed)
//   const monthMap: Record<string, { workouts: number; calories: number }> = {};
//   const monthLabels: string[] = [];

//   // Initialize all days in month (fixed)
//   const daysInMonth = endOfMonth.getDate();
//   for (let i = 1; i <= daysInMonth; i++) {
//     const date = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i);
//     const key = date.toISOString().split('T')[0];
//     monthMap[key] = { workouts: 0, calories: 0 };
//     monthLabels.push(key);
//   }

//   // Populate with actual data
//   sessions.forEach(s => {
//     const dayKey = utcToLocalDateKey(s.logged_at);
//     if (monthMap[dayKey]) {
//       monthMap[dayKey].workouts += 1;
//       monthMap[dayKey].calories += s.calories_burned || 0;
//     }
//   });

//   const monthlyActivity = monthLabels.map(dateKey => ({
//     day: dateKey,
//     workouts: monthMap[dateKey].workouts,
//     calories: monthMap[dateKey].calories,
//   }));

//   // Streak calculation (unchanged)
//   const { data: allSessions } = await supabase
//     .from('workout_sessions')
//     .select('logged_at')
//     .eq('user_id', userId)
//     .order('logged_at', { ascending: false });

//   const calculateStreak = (dates: string[]) => {
//     const unique = [...new Set(dates)];
//     let streak = 0;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     for (let i = 0; i < 30; i++) {
//       const checkDate = new Date(today);
//       checkDate.setDate(checkDate.getDate() - i);
//       if (unique.includes(checkDate.toDateString())) streak++;
//       else break;
//     }
//     return streak;
//   };

//   const recentDates = allSessions?.map(s => new Date(s.logged_at).toDateString()) || [];

//   // Update state with proper monthly stats
//   set({
//     weeklyActivity,
//     monthlyActivity,
//     userStats: {
//       streakDays: calculateStreak(recentDates),
//       monthlyWorkouts,
//       totalCalories: monthlyCalories,
//       totalMinutes: monthlyMinutes,
//       weeklyCalories,
//       weeklyWorkouts,
//       totalWorkouts: allSessions?.length || 0,
//     },
//   });
// },

  
// }))


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
