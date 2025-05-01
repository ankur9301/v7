"use client"

import React, { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Modal, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, BarChart2 } from "lucide-react-native"
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Rect, Line } from "react-native-svg"
import { useUserStore } from "@/store/useUserStore"
import { useStatsStore } from "@/src/stores/userStatsStore"
import WeeklyGraph from '@/components/WeeklyGraph'


const { width } = Dimensions.get("window")

// Full day names for reference
const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// At the top with other type definitions



// Month names
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

type ActivityDay = {
  day: string
  workouts: number
  calories: number
}

const defaultActivityDay: ActivityDay = {
    day: '',
    workouts: 0,
    calories: 0
  };

type UserStats = {
  streakDays: number
  monthlyWorkouts: number
  totalCalories: number
  totalMinutes: number
  weeklyCalories: number
  weeklyWorkouts: number
  totalWorkouts: number
}

type WorkoutSession = {
    muscles: string[] // like ['Back', 'Biceps']
    date: string
    calories?: number
  }
  





const muscleCategoryMap: Record<string, "Push" | "Pull" | "Legs" | "Core" | null> = {
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
  


  const calculateMuscleDistribution = (sessions: { muscles: string[] }[]) => {
    const categoryCount: Record<"Push" | "Pull" | "Legs" | "Core", number> = {
      Push: 0,
      Pull: 0,
      Legs: 0,
      Core: 0,
    }
  
    sessions.forEach((session) => {
      const uniqueCategories = new Set<string>()
      session.muscles.forEach((muscle) => {
        const category = muscleCategoryMap[muscle]
        if (category) uniqueCategories.add(category)
      })
  
      uniqueCategories.forEach((cat) => {
        categoryCount[cat as keyof typeof categoryCount] += 1
      })
    })
  
    const total = Object.values(categoryCount).reduce((sum, val) => sum + val, 0)
  
    return Object.entries(categoryCount).map(([type, count]) => ({
      type,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
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
  

  
// Mock data for month-to-month comparison
// In a real app, this would come from your API
const yearlyActivityData = [
  { month: 0, name: "Jan", workouts: 12, calories: 4500, minutes: 360 },
  { month: 1, name: "Feb", workouts: 15, calories: 5200, minutes: 420 },
  { month: 2, name: "Mar", workouts: 10, calories: 3800, minutes: 300 },
  { month: 3, name: "Apr", workouts: 18, calories: 6100, minutes: 480 },
  { month: 4, name: "May", workouts: 20, calories: 7200, minutes: 540 },
  { month: 5, name: "Jun", workouts: 16, calories: 5800, minutes: 420 },
  { month: 6, name: "Jul", workouts: 22, calories: 8000, minutes: 600 },
  { month: 7, name: "Aug", workouts: 18, calories: 6500, minutes: 480 },
  { month: 8, name: "Sep", workouts: 14, calories: 5000, minutes: 360 },
  { month: 9, name: "Oct", workouts: 16, calories: 5800, minutes: 420 },
  { month: 10, name: "Nov", workouts: 12, calories: 4200, minutes: 300 },
  { month: 11, name: "Dec", workouts: 8, calories: 3000, minutes: 240 },
]

// Mock data for workout trends within a month


interface CompactActivityChartProps {
  isDarkMode: boolean
  colors: any
  chartView: "weekly" | "monthly"
  setChartView: (view: "weekly" | "monthly") => void
  weekOffset: number
  setWeekOffset: (callback: (prev: number) => number) => void
  selectedMonth: number
  setSelectedMonth: (callback: (prev: number) => number) => void
  selectedYear: number
  setSelectedYear: (callback: (prev: number) => number) => void
  showViewSelector: boolean
  setShowViewSelector: (show: boolean) => void
  weeklyActivity: ActivityDay[]
  monthlyActivity: ActivityDay[]
  userStats: UserStats
  getCurrentMonthYear: () => string
}

const CompactActivityChart: React.FC<CompactActivityChartProps> = ({
  isDarkMode,
  colors,
  chartView,
  setChartView,
  weekOffset,
  setWeekOffset,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  showViewSelector,
  setShowViewSelector,
  weeklyActivity,
  monthlyActivity,
  userStats,
  getCurrentMonthYear,
}) => {
    

    const validWeeklyData = weeklyActivity.filter(d => 
        d && typeof d.calories === 'number' && !isNaN(d.calories)
      ) || [defaultActivityDay];
    
      const validMonthlyData = monthlyActivity.filter(d =>
        d && typeof d.calories === 'number' && !isNaN(d.calories)
      ) || [defaultActivityDay];

  // Animation values
  const opacityAnimation = useRef(new Animated.Value(0)).current
  const scaleAnimation = useRef(new Animated.Value(0.95)).current

  // State for calendar visibility and month details
  const [showCalendar, setShowCalendar] = useState(false)
  const [showMonthDetails, setShowMonthDetails] = useState(false)
//   const [selectedMonthData, setSelectedMonthData] = useState<any>(null)
  const [yearOffset, setYearOffset] = useState(0)
  const [viewingYear, setViewingYear] = useState(new Date().getFullYear())

  const user = useUserStore((state) => state.user)
const fetchStats = useStatsStore((state) => state.fetchStats)
const [muscleSummary, setMuscleSummary] = useState<
  { type: string; percentage: number; color: string }[]
>([])

const [isLoading, setIsLoading] = useState(false);



  // Animate chart on mount and when data changes

  useEffect(() => {
    // Don't animate if loading or no data
    if (isLoading || (weeklyActivity.length === 0 && monthlyActivity.length === 0)) {
      return;
    }
  
    Animated.parallel([
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [weeklyActivity, monthlyActivity, chartView, isLoading]);

  // Update viewing year when year offset changes
  useEffect(() => {
    setViewingYear(new Date().getFullYear() + yearOffset)
  }, [yearOffset])

  // Updated generateAreaPath function
  function generateAreaPath(data: ActivityDay[]) {
    const w = width - 60;
    const h = 120;
  
    // Default empty path (flat line at bottom)
    if (!data || data.length === 0) {
      return `M 0 ${h} L ${w} ${h} Z`;
    }
  
    // Filter and validate data
    const validData = data
      .filter(d => d && typeof d.calories === 'number' && !isNaN(d.calories))
      .map(d => ({ ...d, calories: Math.max(0, d.calories) }));
  
    if (validData.length === 0) {
      return `M 0 ${h} L ${w} ${h} Z`;
    }
  
    // Calculate max with fallback
    const maxCal = Math.max(100, ...validData.map(d => d.calories));
  
    let path = `M 0 ${h}`;
    
    validData.forEach((d, i) => {
      const x = (w / Math.max(1, validData.length - 1)) * i;
      const y = h - (d.calories / maxCal) * h;
      path += ` L ${x} ${y}`;
    });
  
    path += ` L ${w} ${h} Z`;
    return path;
  }
// Fixed function for calculating weekly progress in a month
function calculateWeeklyProgressInMonth(
    dailyStats: ActivityDay[],
    year: number,
    month: number
  ) {
    const weeks: Record<number,{workouts:number,calories:number}> = {}
  
    dailyStats.forEach(({ day, workouts, calories }) => {
      // parse as local
      const [Y,M,D] = day.split("-").map(Number)
      const dt = new Date(Y, M-1, D)
  
      const w = getWeekNumberInMonth(dt)
      if (!weeks[w]) weeks[w] = { workouts: 0, calories: 0 }
      weeks[w].workouts  += workouts
      weeks[w].calories  += calories
    })
  
    return Object.entries(weeks)
      .sort(([a],[b]) => +a - +b)
      .map(([week,{workouts,calories}]) => ({
        week: `Week ${week}`,
        workouts,
        calories
      }))
  }
  
  // Helper function to get week number in month
/**
 * Given a Date, returns 1-based week number within its month,
 * taking into account which weekday the month started on.
 */
function getWeekNumberInMonth(date: Date): number {
    // Day-of-week of the first of the month: 0=Sun…6=Sat
    const firstDow = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
    // Offset the day of month by that, then integer-divide by 7
    // +1 to make it 1-based
    return Math.floor((date.getDate() + firstDow - 1) / 7) + 1
  }
  
  // Generate path for the line chart (weekly view)
  function generateLinePath(data: ActivityDay[]) {
    const w = width - 60;
    const h = 120;
  
    if (!data || data.length === 0) {
      return `M 0 ${h} L ${w} ${h}`;
    }
  
    // Filter out any invalid entries
    const validData = data.filter(d => 
      d && typeof d.calories === 'number' && !isNaN(d.calories)
    );
    
    // If no valid data remains, return a flat line
    if (validData.length === 0) {
      return `M 0 ${h} L ${w} ${h}`;
    }
  
    // Calculate max safely
    const caloriesValues = validData.map(d => Math.max(0, d.calories || 0));
    const maxCal = Math.max(100, ...caloriesValues);
  
    let path = "";
    
    validData.forEach((d, i) => {
      const x = (w / Math.max(1, validData.length - 1)) * i;
      // Ensure we handle potential null/undefined values
      const calorieValue = Math.max(0, d.calories || 0);
      const rawY = h - (calorieValue / maxCal) * h;
      const y = Math.max(0, Math.min(h, rawY));
      
      // Use M for the first point, L for subsequent points
      if (i === 0) {
        path = `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
  
    // If there was only one point, create a small horizontal line
    if (validData.length === 1) {
      const x = w / 2;
      const y = h - (validData[0].calories / maxCal) * h;
      path += ` L ${x + 1} ${y}`;
    }
    
    return path;
  }
  

  // Generate data points for the line chart (weekly view)
  const generateDataPoints = (data: ActivityDay[]) => {
    if (!data || data.length === 0) return [];
  
    // Filter out any invalid entries
    const validData = data.filter(d => 
      d && typeof d.calories === 'number' && !isNaN(d.calories)
    );
    
    if (validData.length === 0) return [];
  
    const caloriesValues = validData.map(d => Math.max(0, d.calories || 0));
    const maxCalories = Math.max(...caloriesValues, 100);
    const chartWidth = width - 60;
    const chartHeight = 120;
    const pointWidth = chartWidth / Math.max(1, validData.length - 1);
  
    return validData.map((day, index) => {
      const x = index * pointWidth;
      const calorieValue = Math.max(0, day.calories || 0);
      const y = chartHeight - (calorieValue / maxCalories) * chartHeight;
      return { 
        x, 
        y, 
        value: calorieValue, 
        workouts: day.workouts || 0 
      };
    });
  }

  
// const handleMonthSelect = async (monthData: any) => {
//     setIsLoading(true); // Start loading
//     const selectedDate = new Date(monthData.year, monthData.month, 1);
//     const startOfMonth = new Date(selectedDate);
//     const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
//     endOfMonth.setHours(23, 59, 59, 999);
  
//     if (user?.id) {
//       const input = `${user.id}|${startOfMonth.toISOString()}|${endOfMonth.toISOString()}`;
//       try {
//         const sessions = await fetchStats(input);
//         const categorized = calculateMuscleDistribution(sessions);
//         setMuscleSummary(categorized);
//       } finally {
//         setIsLoading(false); // End loading
//       }
//     }
  
//     setSelectedMonth(() => monthData.month);
//     setShowMonthDetails(true);
//   };

const handleMonthSelect = async ({ month, year }: { month: number; year: number }) => {
    setIsLoading(true)
    try {
      const startOfMonth = new Date(year, month, 1)
      const endOfMonth   = new Date(year, month+1, 0, 23,59,59,999)
  
      // 1️⃣ fetchStats will `set({... monthlyActivity, userStats})`
      if (user) {
        await fetchStats(`${user.id}|${startOfMonth.toISOString()}|${endOfMonth.toISOString()}`)
      } else {
        console.error("User is null");
      }
  
      // 2️⃣ only once the store is updated, update your local modal state
      setSelectedMonth(() => month)
      setShowMonthDetails(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  
  

  // Render weekly chart with modern 

  // Add this AFTER all your hooks but BEFORE renderWeeklyChart
  useEffect(() => {
    console.log('Valid weekly data:', validWeeklyData);
    console.log('Valid monthly data:', validMonthlyData);
  }, [validWeeklyData, validMonthlyData]);

  // Early return for empty data
  if (!validWeeklyData.length && !validMonthlyData.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.text }}>
          {isLoading ? 'Loading...' : 'No activity data available'}
        </Text>
        {isLoading && <ActivityIndicator color={isDarkMode ? "#FF9500" : "#6366F1"} />}
      </View>
    );
  }


const renderWeeklyChart = () => (
  <Animated.View
    style={[
      styles.chartWrapper,
      { opacity: opacityAnimation, transform: [{ scale: scaleAnimation }] },
    ]}
  >
    <WeeklyGraph
      weeklyActivity={validWeeklyData}
      isDarkMode={isDarkMode}
      colors={colors}
    />
  </Animated.View>
)


  // Render monthly chart with year view (showing all months)
  const renderMonthlyChart = () => {
    // Filter data for current viewing year
    const yearData = yearlyActivityData.map((month) => ({
      ...month,
      // Simulate different data for different years
      workouts: month.workouts * (1 + yearOffset * 0.2),
      calories: month.calories * (1 + yearOffset * 0.2),
      minutes: month.minutes * (1 + yearOffset * 0.2),
    }))

    const maxCalories = Math.max(...yearData.map((month) => month.calories), 100)
    const maxWorkouts = Math.max(...yearData.map((month) => month.workouts), 5)

    const barWidth = 20
    const barGap = 8
    const chartWidth = width - 60
    const chartHeight = 120
    const monthWidth = chartWidth / 12

    return (
      <Animated.View
        style={[
          styles.chartWrapper,
          {
            opacity: opacityAnimation,
            transform: [{ scale: scaleAnimation }],
          },
        ]}
      >
        

        <ScrollView
  horizontal={false} // turn off horizontal scroll
  contentContainerStyle={{ paddingBottom: 4 }}
  showsHorizontalScrollIndicator={false}
>

          

          {/* Month labels */}
          <View style={styles.monthGrid}>
  {yearData.map((month, index) => {
    const isSelected = selectedMonth === month.month

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.monthCell,
          isSelected && {
            backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
            borderRadius: 10,
          },
        ]}
        onPress={() => {
            setSelectedMonth(() => month.month)
            setSelectedYear(() => viewingYear)
            handleMonthSelect({ ...month, year: viewingYear })
          }}
          
      >
        <Text
          style={[
            styles.monthText,
            {
              color:
                month.month === new Date().getMonth() && viewingYear === new Date().getFullYear()
                  ? isDarkMode
                    ? "#FF9500"
                    : "#6366F1"
                  : colors.secondaryText,
              fontWeight: isSelected ? "600" : "400",
            },
          ]}
        >
          {month.name.slice(0, 3)}
        </Text>
        {month.workouts > 0 && (
          <View style={[styles.workoutDot, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]} />
        )}
      </TouchableOpacity>
    )
  })}
</View>

        </ScrollView>

     
      </Animated.View>
    )
  }

  // Render month details modal
  const renderMonthDetailsModal = () => {
    console.log("🔄 Rendering month details for:", monthNames[selectedMonth], selectedYear);
    console.log("📊 Monthly activity data:", monthlyActivity);
    console.log("📈 User stats:", userStats);
  
    // if (!selectedMonthData) return null

    const monthName = monthNames[selectedMonth]


    return (
      <Modal
        visible={showMonthDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMonthDetails(false)}
      >
        <View style={styles.monthDetailsOverlay}>
          <View
            style={[
              styles.monthDetailsContainer,
              {
                backgroundColor: isDarkMode ? "#1F2937" : "#fff",
                borderColor: isDarkMode ? "#374151" : "#E5E7EB",
              },
            ]}
          >
            <View style={styles.monthDetailsHeader}>
            <Text style={[styles.monthDetailsTitle, { color: colors.text }]}>
  {monthNames[selectedMonth]} {selectedYear}
</Text>

              <TouchableOpacity style={styles.closeButton} onPress={() => setShowMonthDetails(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.monthDetailsContent}>
              {/* Month Summary */}
              <View style={styles.monthSummary}>
                <View
                  style={[
                    styles.summaryItem,
                    {
                      backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.05)",
                    },
                  ]}
                >
                  <Ionicons name="barbell" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
  {userStats.monthlyWorkouts}
</Text>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Workouts</Text>
                </View>

                <View
                  style={[
                    styles.summaryItem,
                    {
                      backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.05)",
                    },
                  ]}
                >
                  <Ionicons name="flame" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
  {userStats.totalCalories}
</Text>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Calories</Text>
                </View>

                <View
                  style={[
                    styles.summaryItem,
                    {
                      backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.05)",
                    },
                  ]}
                >
                  <Ionicons name="time" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
  {userStats.totalMinutes}
</Text>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Minutes</Text>
                </View>
              </View>

              {/* Workout Types */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Types</Text>
                <View style={styles.workoutTypesContainer}>
            
                  {muscleSummary.map((type, index) => (
  <View key={index} style={styles.workoutTypeItem}>
    <View style={styles.workoutTypeHeader}>
      <View style={[styles.workoutTypeColor, { backgroundColor: type.color }]} />
      <Text style={[styles.workoutTypeName, { color: colors.text }]}>{type.type}</Text>
      <Text style={[styles.workoutTypePercentage, { color: colors.secondaryText }]}>{type.percentage}%</Text>
    </View>
    <View style={styles.workoutTypeProgressContainer}>
      <View
        style={[
          styles.workoutTypeProgressBg,
          { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" },
        ]}
      >
        <View
          style={[
            styles.workoutTypeProgress,
            { width: `${type.percentage}%`, backgroundColor: type.color },
          ]}
        />
      </View>
    </View>
  </View>
))}

                </View>
              </View>

              {/* Weekly Progress */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Progress</Text>
                <View style={styles.weeklyProgressContainer}>
                {calculateWeeklyProgressInMonth(monthlyActivity, selectedYear, selectedMonth).map((week, index) => (
  <View
    key={index}
    style={[
      styles.weeklyProgressItem,
      {
        backgroundColor: isDarkMode
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)",
      },
    ]}
  >
    <Text style={[styles.weeklyProgressWeek, { color: colors.text }]}>
      {week.week}
    </Text>
    <View style={styles.weeklyProgressStats}>
      <View style={styles.weeklyProgressStat}>
        <Ionicons
          name="barbell"
          size={16}
          color={isDarkMode ? "#FF9500" : "#6366F1"}
        />
        <Text style={[styles.weeklyProgressValue, { color: colors.text }]}>
          {week.workouts}
        </Text>
      </View>
      <View style={styles.weeklyProgressStat}>
        <Ionicons
          name="flame"
          size={16}
          color={isDarkMode ? "#FF9500" : "#6366F1"}
        />
        <Text style={[styles.weeklyProgressValue, { color: colors.text }]}>
          {week.calories}
        </Text>
      </View>
    </View>
  </View>
))}

                </View>
              </View>

              {/* Achievements */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
                <View style={styles.achievementsContainer}>
                  <View
                    style={[
                      styles.achievementItem,
                      {
                        backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.05)",
                      },
                    ]}
                  >
                    <Ionicons name="trophy" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                    <Text style={[styles.achievementTitle, { color: colors.text }]}>Most Active Month</Text>
                    <Text style={[styles.achievementDesc, { color: colors.secondaryText }]}>
                    {userStats.monthlyWorkouts > 15 ? "You crushed it!" : "Keep pushing!"}

                    </Text>
                  </View>

                  <View
                    style={[
                      styles.achievementItem,
                      {
                        backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.05)",
                      },
                    ]}
                  >
                    <Ionicons name="trending-up" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                    <Text style={[styles.achievementTitle, { color: colors.text }]}>Consistency</Text>
                    <Text style={[styles.achievementDesc, { color: colors.secondaryText }]}>
                    {userStats.monthlyWorkouts > 12 ? "Great consistency!" : "Work on consistency"}

                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeMonthDetailsButton, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
              onPress={() => setShowMonthDetails(false)}
            >
              <Text style={styles.closeMonthDetailsButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  // Render month selector modal
  const renderMonthSelector = () => {
    return (
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity style={styles.calendarModalOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <View
            style={[
              styles.calendarModal,
              {
                backgroundColor: isDarkMode ? "#1F2937" : "#fff",
                borderColor: isDarkMode ? "#374151" : "#E5E7EB",
              },
            ]}
          >
            <Text style={[styles.calendarTitle, { color: colors.text }]}>Select Month</Text>

            <View style={styles.yearSelector}>
              <TouchableOpacity onPress={() => setSelectedYear((prev) => prev - 1)}>
                <ChevronLeft size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
              </TouchableOpacity>
              <Text style={[styles.yearText, { color: colors.text }]}>{selectedYear}</Text>
              <TouchableOpacity
                onPress={() => setSelectedYear((prev) => prev + 1)}
                disabled={selectedYear >= new Date().getFullYear()}
              >
                <ChevronRight
                  size={20}
                  color={
                    selectedYear >= new Date().getFullYear() ? colors.secondaryText : isDarkMode ? "#FF9500" : "#6366F1"
                  }
                />
              </TouchableOpacity>
            </View>

            <View style={styles.monthsGrid}>
              {monthNames.map((month, index) => {
                const isCurrentMonth = selectedYear === new Date().getFullYear() && index === new Date().getMonth()
                const isFutureMonth = selectedYear === new Date().getFullYear() && index > new Date().getMonth()
                const isSelected = index === selectedMonth && !isFutureMonth

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthItem,
                      isSelected && {
                        backgroundColor: isDarkMode ? "#FF9500" : "#6366F1",
                      },
                      isFutureMonth && { opacity: 0.5 },
                    ]}
                    onPress={() => {
                      if (!isFutureMonth) {
                        setSelectedMonth(() => index)
                        setSelectedYear(() => selectedYear)
                        setShowCalendar(false)
                      }
                    }}
                    disabled={isFutureMonth}
                  >
                    <Text
                      style={[
                        styles.monthItemText,
                        {
                          color: isSelected ? "#fff" : colors.text,
                        },
                      ]}
                    >
                      {month.substring(0, 3)}
                      {isCurrentMonth && <Text style={styles.currentMonthDot}>•</Text>}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <TouchableOpacity
              style={[styles.closeCalendarButton, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeCalendarButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  return (
    <View>
      {/* Compact Header with View Selector */}
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleRow}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Activity</Text>

          {/* View Selector */}
          <View style={styles.viewSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.viewSelectorButton,
                chartView === "weekly" && {
                  backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
                },
              ]}
              onPress={() => setChartView("weekly")}
            >
              <Text
                style={{
                  color: chartView === "weekly" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
                  fontSize: 12,
                  fontWeight: chartView === "weekly" ? "600" : "400",
                }}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewSelectorButton,
                chartView === "monthly" && {
                  backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
                },
              ]}
              onPress={() => setChartView("monthly")}
            >
              <Text
                style={{
                  color: chartView === "monthly" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
                  fontSize: 12,
                  fontWeight: chartView === "monthly" ? "600" : "400",
                }}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity
            style={styles.dateNavigationButton}
            onPress={() => {
              if (chartView === "weekly") {
                setWeekOffset((w) => w - 1)
              } else {
                setYearOffset((y) => y - 1)
              }
            }}
          >
            <ChevronLeft size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </TouchableOpacity>

          <View style={styles.currentPeriod}>
            <Text style={[styles.currentPeriodText, { color: colors.text }]}>
                {chartView === "weekly" ? getCurrentMonthYear() : viewingYear}
            </Text>
            </View>


          <TouchableOpacity
            style={styles.dateNavigationButton}
            onPress={() => {
              if (chartView === "weekly") {
                setWeekOffset((w) => w + 1)
              } else {
                if (viewingYear < new Date().getFullYear()) {
                  setYearOffset((y) => y + 1)
                }
              }
            }}
            disabled={chartView === "monthly" && viewingYear >= new Date().getFullYear()}
          >
            <ChevronRight
              size={16}
              color={
                chartView === "monthly" && viewingYear >= new Date().getFullYear()
                  ? isDarkMode
                    ? "rgba(255, 149, 0, 0.3)"
                    : "rgba(99, 102, 241, 0.3)"
                  : isDarkMode
                    ? "#FF9500"
                    : "#6366F1"
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart Visualization */}
      {/* <View style={styles.chartContainer}>{chartView === "weekly" ? renderWeeklyChart() : renderMonthlyChart()}</View> */}
      <View style={styles.chartContainer}>
  {isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={isDarkMode ? "#FF9500" : "#6366F1"} />
    </View>
  ) : chartView === "weekly" ? renderWeeklyChart() : renderMonthlyChart()}
</View>

      {/* Compact Stats Row */}
      <View style={styles.statsRow}>
        {/* Streak */}
        <View
          style={[
            styles.statItem,
            {
              backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.05)",
            },
          ]}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="flame" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: colors.text }]}>{userStats.streakDays}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>day streak</Text>
          </View>
        </View>

        {/* Workouts */}
        <View
          style={[
            styles.statItem,
            {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
            },
          ]}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="barbell" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {chartView === "weekly" ? userStats.weeklyWorkouts : userStats.monthlyWorkouts}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>workouts</Text>
          </View>
        </View>

        {/* Calories */}
        <View
          style={[
            styles.statItem,
            {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
            },
          ]}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="flame-outline" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {chartView === "weekly" ? userStats.weeklyCalories : userStats.totalCalories}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>cal</Text>
          </View>
        </View>

        {/* Minutes */}
        <View
          style={[
            styles.statItem,
            {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
            },
          ]}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="time" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: colors.text }]}>{userStats.totalMinutes}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>min</Text>
          </View>
        </View>
      </View>

      {/* Month Selector Modal */}
      {renderMonthSelector()}

      {/* Month Details Modal */}
      {renderMonthDetailsModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  chartHeader: {
    marginBottom: 12,
  },
  chartTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewSelectorContainer: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
  },
  viewSelectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dateNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateNavigationButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  currentPeriod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currentPeriodText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chartContainer: {
    marginBottom: 12,
  },
  chartWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  chartTypeSelector: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
    paddingRight: 8,
  },
  chartTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  svgContainer: {
    height: 120,
    marginBottom: 4,
  },
  monthlyScrollContainer: {
    paddingBottom: 4,
  },
  dayLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  dayLabelWrapper: {
    alignItems: "center",
    position: "relative",
  },
  dayText: {
    fontSize: 11,
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  monthLabelsContainer: {
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  monthLabelWrapper: {
    alignItems: "center",
    paddingVertical: 4,
  },
  monthLabelText: {
    fontSize: 11,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
  },
  weekLabelWrapper: {
    alignItems: "center",
  },
  weekText: {
    fontSize: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    width: (width - 75) / 4,
  },
  statIconContainer: {
    marginRight: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 10,
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarModal: {
    width: width - 60,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  yearText: {
    fontSize: 16,
    fontWeight: "600",
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  monthItem: {
    width: (width - 100) / 3,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 8,
  },
  monthItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  currentMonthDot: {
    marginLeft: 4,
    fontSize: 14,
  },
  closeCalendarButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeCalendarButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Month details modal styles
  monthDetailsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  monthDetailsContainer: {
    width: width - 40,
    maxHeight: "80%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  monthDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  monthDetailsTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  monthDetailsContent: {
    padding: 16,
  },
  monthSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryItem: {
    width: (width - 80) / 3,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  workoutTypesContainer: {
    gap: 12,
  },
  workoutTypeItem: {
    gap: 4,
  },
  workoutTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutTypeColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  workoutTypeName: {
    flex: 1,
    fontSize: 14,
  },
  workoutTypePercentage: {
    fontSize: 14,
  },
  workoutTypeProgressContainer: {
    marginTop: 4,
  },
  workoutTypeProgressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  workoutTypeProgress: {
    height: "100%",
    borderRadius: 3,
  },
  weeklyProgressContainer: {
    gap: 8,
  },
  weeklyProgressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  weeklyProgressWeek: {
    fontSize: 14,
    fontWeight: "500",
  },
  weeklyProgressStats: {
    flexDirection: "row",
    gap: 16,
  },
  weeklyProgressStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  weeklyProgressValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  achievementsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  achievementItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 12,
    textAlign: "center",
  },
  closeMonthDetailsButton: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeMonthDetailsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    rowGap: 10,
  },
  monthCell: {
    width: (width - 80) / 6, // 6 months per row
    alignItems: "center",
    paddingVertical: 6,
  },
  monthText: {
    fontSize: 11,
    textAlign: "center",
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },

})

export default CompactActivityChart



// "use client"

// import React, { useEffect, useRef, useState } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Dimensions,
//   Animated,
//   type ViewStyle,
// } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native"
// import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Rect } from "react-native-svg"

// const { width } = Dimensions.get("window")

// // Full day names for reference
// const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// // Month names
// const monthNames = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ]

// type ActivityDay = {
//   day: string
//   workouts: number
//   calories: number
// }

// type UserStats = {
//   streakDays: number
//   monthlyWorkouts: number
//   totalCalories: number
//   totalMinutes: number
//   weeklyCalories: number
//   weeklyWorkouts: number
//   totalWorkouts: number
// }

// interface EnhancedActivityChartProps {
//   isDarkMode: boolean
//   colors: any
//   chartView: "weekly" | "monthly"
//   setChartView: (view: "weekly" | "monthly") => void
//   weekOffset: number
//   setWeekOffset: (callback: (prev: number) => number) => void
//   selectedMonth: number
//   setSelectedMonth: (callback: (prev: number) => number) => void
//   selectedYear: number
//   setSelectedYear: (callback: (prev: number) => number) => void
//   showViewSelector: boolean
//   setShowViewSelector: (show: boolean) => void
//   weeklyActivity: ActivityDay[]
//   monthlyActivity: ActivityDay[]
//   userStats: UserStats
//   getCurrentMonthYear: () => string
// }

// const EnhancedActivityChart: React.FC<EnhancedActivityChartProps> = ({
//   isDarkMode,
//   colors,
//   chartView,
//   setChartView,
//   weekOffset,
//   setWeekOffset,
//   selectedMonth,
//   setSelectedMonth,
//   selectedYear,
//   setSelectedYear,
//   showViewSelector,
//   setShowViewSelector,
//   weeklyActivity,
//   monthlyActivity,
//   userStats,
//   getCurrentMonthYear,
// }) => {
//   // Animation values for bars
//   const barAnimations = useRef<Animated.Value[]>([]).current
//   const opacityAnimation = useRef(new Animated.Value(0)).current
//   const scaleAnimation = useRef(new Animated.Value(0.9)).current

//   // State for calendar visibility
//   const [showCalendar, setShowCalendar] = useState(false)

//   // Initialize animations
//   useEffect(() => {
//     if (!weeklyActivity || weeklyActivity.length === 0) return

//     // Initialize animation values if needed
//     if (barAnimations.length === 0) {
//       for (let i = 0; i < weeklyActivity.length; i++) {
//         barAnimations.push(new Animated.Value(0))
//       }
//     }

//     const maxCalories = Math.max(...weeklyActivity.map((day) => day.calories || 0), 100)

//     // Create animation sequence
//     const animations = weeklyActivity.map((day, index) => {
//       const targetHeight = day.calories > 0 ? (day.calories / maxCalories) * 150 : 5

//       return Animated.timing(barAnimations[index], {
//         toValue: targetHeight,
//         duration: 800,
//         delay: index * 50,
//         useNativeDriver: false,
//       })
//     })

//     // Animate the entire chart in
//     Animated.parallel([
//       Animated.timing(opacityAnimation, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnimation, {
//         toValue: 1,
//         friction: 8,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//       Animated.parallel(animations),
//     ]).start()
//   }, [weeklyActivity, chartView])

//   // Generate path for the area chart
//   const generateAreaPath = (data: ActivityDay[]) => {
//     if (!data || data.length === 0) return ""

//     const maxCalories = Math.max(...data.map((day) => day.calories || 0), 100)
//     const chartWidth = width - 80
//     const chartHeight = 150
//     const pointWidth = chartWidth / (data.length - 1)

//     let path = `M 0 ${chartHeight - (data[0].calories / maxCalories) * chartHeight} `

//     data.forEach((day, index) => {
//       if (index > 0) {
//         const x = index * pointWidth
//         const y = chartHeight - (day.calories / maxCalories) * chartHeight
//         path += `L ${x} ${y} `
//       }
//     })

//     // Complete the path to create a closed shape for filling
//     path += `L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`

//     return path
//   }

//   // Generate path for the line chart
//   const generateLinePath = (data: ActivityDay[]) => {
//     if (!data || data.length === 0) return ""

//     const maxCalories = Math.max(...data.map((day) => day.calories || 0), 100)
//     const chartWidth = width - 80
//     const chartHeight = 150
//     const pointWidth = chartWidth / (data.length - 1)

//     let path = `M 0 ${chartHeight - (data[0].calories / maxCalories) * chartHeight} `

//     data.forEach((day, index) => {
//       if (index > 0) {
//         const x = index * pointWidth
//         const y = chartHeight - (day.calories / maxCalories) * chartHeight
//         path += `L ${x} ${y} `
//       }
//     })

//     return path
//   }

//   // Generate data points for the line chart
//   const generateDataPoints = (data: ActivityDay[]) => {
//     if (!data || data.length === 0) return []

//     const maxCalories = Math.max(...data.map((day) => day.calories || 0), 100)
//     const chartWidth = width - 80
//     const chartHeight = 150
//     const pointWidth = chartWidth / (data.length - 1)

//     return data.map((day, index) => {
//       const x = index * pointWidth
//       const y = chartHeight - (day.calories / maxCalories) * chartHeight
//       return { x, y, value: day.calories, workouts: day.workouts }
//     })
//   }

//   // Calculate streak progress percentage
//   const streakProgress = Math.min((userStats.streakDays / 30) * 100, 100)

//   // Render weekly chart with modern design
//   const renderWeeklyChart = () => {
//     const dataPoints = generateDataPoints(weeklyActivity)
//     const maxCalories = Math.max(...weeklyActivity.map((day) => day.calories || 0), 100)

//     return (
//       <Animated.View
//         style={[
//           styles.chartWrapper,
//           {
//             opacity: opacityAnimation,
//             transform: [{ scale: scaleAnimation }],
//           },
//         ]}
//       >
//         <View style={styles.chartLabels}>
//           <Text style={[styles.chartLabel, { color: colors.secondaryText }]}>Calories</Text>
//           <Text style={[styles.chartLabel, { color: colors.secondaryText }]}>Workouts</Text>
//         </View>

//         <View style={styles.weeklyChartContainer}>
//           {/* SVG Area Chart */}
//           <View style={styles.svgContainer}>
//             <Svg height="150" width={width - 80}>
//               <Defs>
//                 <SvgGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
//                   <Stop offset="0" stopColor={isDarkMode ? "rgba(255, 149, 0, 0.6)" : "rgba(99, 102, 241, 0.6)"} />
//                   <Stop offset="1" stopColor={isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.1)"} />
//                 </SvgGradient>
//                 <SvgGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
//                   <Stop offset="0" stopColor={isDarkMode ? "#FF9500" : "#6366F1"} />
//                   <Stop offset="1" stopColor={isDarkMode ? "#FF9500" : "#818CF8"} />
//                 </SvgGradient>
//               </Defs>

//               {/* Grid lines */}
//               {[0, 1, 2, 3].map((i) => (
//                 <Rect
//                   key={`grid-${i}`}
//                   x="0"
//                   y={i * 50}
//                   width={width - 80}
//                   height="1"
//                   fill={isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}
//                 />
//               ))}

//               {/* Area fill */}
//               <Path d={generateAreaPath(weeklyActivity)} fill="url(#areaGradient)" />

//               {/* Line stroke */}
//               <Path d={generateLinePath(weeklyActivity)} stroke="url(#lineGradient)" strokeWidth="3" fill="none" />

//               {/* Data points */}
//               {dataPoints.map((point, index) => (
//                 <React.Fragment key={index}>
//                   <Circle
//                     cx={point.x}
//                     cy={point.y}
//                     r="6"
//                     fill={isDarkMode ? "#1F1F1F" : "#FFFFFF"}
//                     stroke={isDarkMode ? "#FF9500" : "#6366F1"}
//                     strokeWidth="3"
//                   />
//                   {point.workouts > 0 && (
//                     <Circle cx={point.x} cy={point.y} r="3" fill={isDarkMode ? "#FF9500" : "#6366F1"} />
//                   )}
//                 </React.Fragment>
//               ))}
//             </Svg>
//           </View>

//           {/* Day labels */}
//           <View style={styles.dayLabelsContainer}>
//             {weeklyActivity.map((day, index) => (
//               <View key={index} style={styles.dayLabelWrapper}>
//                 <View
//                   style={[
//                     styles.dayLabelContainer,
//                     {
//                       backgroundColor:
//                         day.workouts > 0
//                           ? isDarkMode
//                             ? "rgba(255, 149, 0, 0.2)"
//                             : "rgba(99, 102, 241, 0.1)"
//                           : "transparent",
//                       borderColor: isDarkMode ? "#333" : "#e5e7eb",
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.dayText,
//                       {
//                         color: day.workouts > 0 ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
//                       },
//                     ]}
//                   >
//                     {fullDayNames[index].substring(0, 3)}
//                   </Text>
//                 </View>
//                 {day.workouts > 0 && (
//                   <View style={[styles.workoutBadge, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]}>
//                     <Text style={styles.workoutBadgeText}>{day.workouts}</Text>
//                   </View>
//                 )}
//               </View>
//             ))}
//           </View>
//         </View>
//       </Animated.View>
//     )
//   }

//   // Render monthly chart with modern design
//   const renderMonthlyChart = () => {
//     return (
//       <Animated.View
//         style={[
//           styles.chartWrapper,
//           {
//             opacity: opacityAnimation,
//             transform: [{ scale: scaleAnimation }],
//           },
//         ]}
//       >
//         <View style={styles.chartLabels}>
//           <Text style={[styles.chartLabel, { color: colors.secondaryText }]}>Calories</Text>
//           <Text style={[styles.chartLabel, { color: colors.secondaryText }]}>Workouts</Text>
//         </View>

//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.monthlyChartScrollContent}
//         >
//           <View style={styles.monthlyChartContainer}>
//             {/* Calendar grid background */}
//             <View style={styles.calendarGrid}>
//               {Array.from({ length: 5 }).map((_, rowIndex) => (
//                 <View key={`row-${rowIndex}`} style={styles.calendarRow}>
//                   {Array.from({ length: 7 }).map((_, colIndex) => (
//                     <View
//                       key={`cell-${rowIndex}-${colIndex}`}
//                       style={[
//                         styles.calendarCell,
//                         {
//                           backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
//                         },
//                       ]}
//                     />
//                   ))}
//                 </View>
//               ))}
//             </View>

//             {/* Activity hexagons */}
//             <View style={styles.activityHexagons}>
//               {monthlyActivity.map((dayData, index) => {
//                 const date = new Date(dayData.day)
//                 const isToday = date.toDateString() === new Date().toDateString()
//                 const maxCal = Math.max(...monthlyActivity.map((d) => d.calories)) || 1
//                 const intensity = dayData.calories > 0 ? dayData.calories / maxCal : 0
//                 const size = 24 + intensity * 12

//                 // Calculate position based on date
//                 const dayOfMonth = date.getDate()
//                 const dayOfWeek = date.getDay()
//                 const weekOfMonth = Math.floor((dayOfMonth - 1) / 7)

//                 return (
//                   <View
//                     key={dayData.day}
//                     style={[
//                       styles.hexagonWrapper,
//                       {
//                         left: dayOfWeek * 40 + 10,
//                         top: weekOfMonth * 40 + 10,
//                       } as ViewStyle,
//                     ]}
//                   >
//                     <View
//                       style={[
//                         styles.hexagon,
//                         {
//                           width: size,
//                           height: size,
//                           backgroundColor:
//                             dayData.workouts > 0
//                               ? isDarkMode
//                                 ? `rgba(255, 149, 0, ${0.3 + intensity * 0.7})`
//                                 : `rgba(99, 102, 241, ${0.3 + intensity * 0.7})`
//                               : isDarkMode
//                                 ? "rgba(255, 255, 255, 0.05)"
//                                 : "rgba(0, 0, 0, 0.05)",
//                           borderColor: isToday ? (isDarkMode ? "#FF9500" : "#6366F1") : "transparent",
//                         } as ViewStyle,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.hexagonText,
//                           {
//                             color: dayData.workouts > 0 ? (isDarkMode ? "#FFFFFF" : "#FFFFFF") : colors.secondaryText,
//                             fontSize: 10 + (dayData.workouts > 0 ? 2 : 0),
//                           },
//                         ]}
//                       >
//                         {dayOfMonth}
//                       </Text>
//                       {dayData.workouts > 0 && (
//                         <View style={styles.workoutDot}>
//                           <Text style={styles.workoutDotText}>{dayData.workouts}</Text>
//                         </View>
//                       )}
//                     </View>
//                   </View>
//                 )
//               })}
//             </View>
//           </View>
//         </ScrollView>

//         {/* Month legend */}
//         <View style={styles.monthLegend}>
//           <View style={styles.legendItem}>
//             <View
//               style={[
//                 styles.legendColor,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.3)" : "rgba(99, 102, 241, 0.3)",
//                 },
//               ]}
//             />
//             <Text style={[styles.legendText, { color: colors.secondaryText }]}>Low</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View
//               style={[
//                 styles.legendColor,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.6)" : "rgba(99, 102, 241, 0.6)",
//                 },
//               ]}
//             />
//             <Text style={[styles.legendText, { color: colors.secondaryText }]}>Medium</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View
//               style={[
//                 styles.legendColor,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.9)" : "rgba(99, 102, 241, 0.9)",
//                 },
//               ]}
//             />
//             <Text style={[styles.legendText, { color: colors.secondaryText }]}>High</Text>
//           </View>
//         </View>
//       </Animated.View>
//     )
//   }

//   return (
//     <View>
//       {/* Chart Header with View Selector */}
//       <View style={styles.chartHeader}>
//         <View style={styles.chartTitleContainer}>
//           <Text style={[styles.dashboardTitle, { color: colors.text }]}>Activity</Text>

//           {/* View Selector Dropdown */}
//           <TouchableOpacity
//             style={[styles.viewSelector, { borderColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
//             onPress={() => setShowViewSelector(!showViewSelector)}
//           >
//             <Text style={{ color: isDarkMode ? "#FF9500" : "#6366F1" }}>
//               {chartView === "weekly" ? "Weekly" : "Monthly"}
//             </Text>
//             <ChevronDown size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />

//             {/* Dropdown Menu */}
//             {showViewSelector && (
//               <View
//                 style={[
//                   styles.viewDropdown,
//                   {
//                     backgroundColor: isDarkMode ? "#1F2937" : "#fff",
//                     borderColor: isDarkMode ? "#374151" : "#E5E7EB",
//                   },
//                 ]}
//               >
//                 <TouchableOpacity
//                   style={[
//                     styles.dropdownItem,
//                     chartView === "weekly" && {
//                       backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.1)",
//                     },
//                   ]}
//                   onPress={() => {
//                     setChartView("weekly")
//                     setShowViewSelector(false)
//                   }}
//                 >
//                   <Text style={{ color: isDarkMode ? "#FF9500" : "#6366F1" }}>Weekly</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[
//                     styles.dropdownItem,
//                     chartView === "monthly" && {
//                       backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.1)",
//                     },
//                   ]}
//                   onPress={() => {
//                     setChartView("monthly")
//                     setShowViewSelector(false)
//                   }}
//                 >
//                   <Text style={{ color: isDarkMode ? "#FF9500" : "#6366F1" }}>Monthly</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Date Navigation */}
//         <View style={styles.dateNavigation}>
//           {/* ← Previous */}
//           <TouchableOpacity
//             style={styles.dateNavigationButton}
//             onPress={() => {
//               if (chartView === "weekly") {
//                 setWeekOffset((w) => w - 1)
//               } else {
//                 // back one month
//                 if (selectedMonth > 0) {
//                   setSelectedMonth((m) => m - 1)
//                 } else {
//                   setSelectedYear((y) => y - 1)
//                   setSelectedMonth(() => 11)
//                 }
//               }
//             }}
//           >
//             <ChevronLeft size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//           </TouchableOpacity>

//           {/* center label + calendar toggle */}
//           <TouchableOpacity
//             style={styles.currentPeriod}
//             onPress={() => chartView === "monthly" && setShowCalendar(true)}
//           >
//             <Text style={[styles.currentPeriodText, { color: colors.text }]}>{getCurrentMonthYear()}</Text>
//             {chartView === "monthly" && <Calendar size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />}
//           </TouchableOpacity>

//           {/* → Next */}
//           <TouchableOpacity
//             style={styles.dateNavigationButton}
//             onPress={() => {
//               if (chartView === "weekly") {
//                 setWeekOffset((w) => w + 1)
//               } else {
//                 // forward one month
//                 if (selectedMonth < 11) {
//                   setSelectedMonth((m) => m + 1)
//                 } else {
//                   setSelectedYear((y) => y + 1)
//                   setSelectedMonth(() => 0)
//                 }
//               }
//             }}
//           >
//             <ChevronRight size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Chart Visualization */}
//       <View style={styles.chartContainer}>{chartView === "weekly" ? renderWeeklyChart() : renderMonthlyChart()}</View>

//       {/* Stats Cards */}
//       <View style={styles.statsCardsContainer}>
//         {/* Streak Card */}
//         <View
//           style={[
//             styles.statCard,
//             {
//               backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.05)",
//               borderColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.2)",
//             },
//           ]}
//         >
//           <View style={styles.statCardHeader}>
//             <Ionicons name="flame" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.statCardTitle, { color: colors.secondaryText }]}>Streak</Text>
//           </View>
//           <Text style={[styles.statCardValue, { color: colors.text }]}>{userStats.streakDays}</Text>
//           <Text style={[styles.statCardLabel, { color: colors.secondaryText }]}>days</Text>
//           <View style={styles.progressBarContainer}>
//             <View
//               style={[
//                 styles.progressBar,
//                 { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.progressFill,
//                   {
//                     width: `${streakProgress}%`,
//                     backgroundColor: isDarkMode ? "#FF9500" : "#6366F1",
//                   },
//                 ]}
//               />
//             </View>
//           </View>
//         </View>

//         {/* Workouts Card */}
//         <View
//           style={[
//             styles.statCard,
//             {
//               backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
//               borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//             },
//           ]}
//         >
//           <View style={styles.statCardHeader}>
//             <Ionicons name="barbell" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.statCardTitle, { color: colors.secondaryText }]}>Workouts</Text>
//           </View>
//           <Text style={[styles.statCardValue, { color: colors.text }]}>
//             {chartView === "weekly" ? userStats.weeklyWorkouts : userStats.monthlyWorkouts}
//           </Text>
//           <Text style={[styles.statCardLabel, { color: colors.secondaryText }]}>
//             {chartView === "weekly" ? "this week" : "this month"}
//           </Text>
//         </View>

//         {/* Calories Card */}
//         <View
//           style={[
//             styles.statCard,
//             {
//               backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
//               borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//             },
//           ]}
//         >
//           <View style={styles.statCardHeader}>
//             <Ionicons name="flame-outline" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.statCardTitle, { color: colors.secondaryText }]}>Calories</Text>
//           </View>
//           <Text style={[styles.statCardValue, { color: colors.text }]}>
//             {chartView === "weekly" ? userStats.weeklyCalories : userStats.totalCalories}
//           </Text>
//           <Text style={[styles.statCardLabel, { color: colors.secondaryText }]}>burned</Text>
//         </View>

//         {/* Minutes Card */}
//         <View
//           style={[
//             styles.statCard,
//             {
//               backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
//               borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//             },
//           ]}
//         >
//           <View style={styles.statCardHeader}>
//             <Ionicons name="time" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.statCardTitle, { color: colors.secondaryText }]}>Time</Text>
//           </View>
//           <Text style={[styles.statCardValue, { color: colors.text }]}>{userStats.totalMinutes}</Text>
//           <Text style={[styles.statCardLabel, { color: colors.secondaryText }]}>minutes</Text>
//         </View>
//       </View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   chartHeader: {
//     marginBottom: 20,
//   },
//   chartTitleContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   dashboardTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//   },
//   viewSelector: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     position: "relative",
//   },
//   viewDropdown: {
//     position: "absolute",
//     top: 40,
//     right: 0,
//     width: 120,
//     borderRadius: 12,
//     borderWidth: 1,
//     overflow: "hidden",
//     zIndex: 10,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//   },
//   dropdownItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     alignItems: "center",
//   },
//   dateNavigation: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   dateNavigationButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   currentPeriod: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//   },
//   currentPeriodText: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   chartContainer: {
//     marginBottom: 20,
//   },
//   chartWrapper: {
//     borderRadius: 16,
//     overflow: "hidden",
//   },
//   chartLabels: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 10,
//     marginBottom: 8,
//   },
//   chartLabel: {
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   weeklyChartContainer: {
//     height: 200,
//     position: "relative",
//   },
//   svgContainer: {
//     height: 150,
//     marginBottom: 10,
//   },
//   dayLabelsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 10,
//   },
//   dayLabelWrapper: {
//     alignItems: "center",
//     position: "relative",
//   },
//   dayLabelContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   dayText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   workoutBadge: {
//     position: "absolute",
//     top: -8,
//     right: -8,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   workoutBadgeText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "700",
//   },
//   monthlyChartScrollContent: {
//     paddingBottom: 10,
//   },
//   monthlyChartContainer: {
//     height: 220,
//     width: 300,
//     position: "relative",
//   },
//   calendarGrid: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   calendarRow: {
//     flexDirection: "row",
//     height: 40,
//   },
//   calendarCell: {
//     width: 40,
//     height: 40,
//     borderRadius: 4,
//     margin: 1,
//   },
//   activityHexagons: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   hexagonWrapper: {
//     position: "absolute",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   hexagon: {
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 2,
//   },
//   hexagonText: {
//     fontWeight: "600",
//   },
//   workoutDot: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   workoutDotText: {
//     fontSize: 8,
//     fontWeight: "700",
//     color: "#000",
//   },
//   monthLegend: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 10,
//     gap: 16,
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   legendColor: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//   },
//   legendText: {
//     fontSize: 12,
//   },
//   statsCardsContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     marginTop: 10,
//   },
//   statCard: {
//     width: (width - 60) / 2,
//     padding: 12,
//     borderRadius: 16,
//     borderWidth: 1,
//   },
//   statCardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginBottom: 8,
//   },
//   statCardTitle: {
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   statCardValue: {
//     fontSize: 24,
//     fontWeight: "700",
//   },
//   statCardLabel: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   progressBarContainer: {
//     marginTop: 8,
//   },
//   progressBar: {
//     height: 4,
//     borderRadius: 2,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     borderRadius: 2,
//   },
// })

// export default EnhancedActivityChart


// "use client"

// import React, { useEffect, useRef, useState } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Dimensions,
//   Animated,
//   type ViewStyle,
// } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native"
// import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Rect } from "react-native-svg"

// const { width } = Dimensions.get("window")

// // Full day names for reference
// const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// // Month names
// const monthNames = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ]

// type ActivityDay = {
//   day: string
//   workouts: number
//   calories: number
// }

// type UserStats = {
//   streakDays: number
//   monthlyWorkouts: number
//   totalCalories: number
//   totalMinutes: number
//   weeklyCalories: number
//   weeklyWorkouts: number
//   totalWorkouts: number
// }

// interface EnhancedActivityChartProps {
//   isDarkMode: boolean
//   colors: any
//   chartView: "weekly" | "monthly"
//   setChartView: (view: "weekly" | "monthly") => void
//   weekOffset: number
//   setWeekOffset: (callback: (prev: number) => number) => void
//   selectedMonth: number
//   setSelectedMonth: (callback: (prev: number) => number) => void
//   selectedYear: number
//   setSelectedYear: (callback: (prev: number) => number) => void
//   showViewSelector: boolean
//   setShowViewSelector: (show: boolean) => void
//   weeklyActivity: ActivityDay[]
//   monthlyActivity: ActivityDay[]
//   userStats: UserStats
//   getCurrentMonthYear: () => string
// }

// const EnhancedActivityChart: React.FC<EnhancedActivityChartProps> = ({
//   isDarkMode,
//   colors,
//   chartView,
//   setChartView,
//   weekOffset,
//   setWeekOffset,
//   selectedMonth,
//   setSelectedMonth,
//   selectedYear,
//   setSelectedYear,
//   showViewSelector,
//   setShowViewSelector,
//   weeklyActivity,
//   monthlyActivity,
//   userStats,
//   getCurrentMonthYear,
// }) => {
//   // Animation values for bars
//   const barAnimations = useRef<Animated.Value[]>([]).current
//   const opacityAnimation = useRef(new Animated.Value(0)).current
//   const scaleAnimation = useRef(new Animated.Value(0.9)).current

//   // State for calendar visibility
//   const [showCalendar, setShowCalendar] = useState(false)

//   // Initialize animations
//   useEffect(() => {
//     if (!weeklyActivity || weeklyActivity.length === 0) return

//     // Initialize animation values if needed
//     if (barAnimations.length === 0) {
//       for (let i = 0; i < weeklyActivity.length; i++) {
//         barAnimations.push(new Animated.Value(0))
//       }
//     }

//     const maxCalories = Math.max(...weeklyActivity.map((day) => day.calories || 0), 100)

//     // Create animation sequence
//     const animations = weeklyActivity.map((day, index) => {
//       const targetHeight = day.calories > 0 ? (day.calories / maxCalories) * 150 : 5

//       return Animated.timing(barAnimations[index], {
//         toValue: targetHeight,
//         duration: 800,
//         delay: index * 50,
//         useNativeDriver: false,
//       })
//     })

//     // Animate the entire chart in
//     Animated.parallel([
//       Animated.timing(opacityAnimation, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnimation, {
//         toValue: 1,
//         friction: 8,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//       Animated.parallel(animations),
//     ]).start()
//   }, [weeklyActivity, chartView])

//   // Generate path for the area chart
//   const generateAreaPath = (data: ActivityDay[]) => {
//     if (!data || data.length === 0) return ""

//     const maxCalories = Math.max(...data.map((day) => day.calories || 0), 100)
//     const chartWidth = width - 80
//     const chartHeight = 150
//     const pointWidth = chartWidth / (data.length - 1)

//     let path = `M 0 ${chartHeight - (data[0].calories / maxCalories) * chartHeight} `

//     data.forEach((day, index) => {
//       if (index > 0) {
//         const x = index * pointWidth
//         const y = chartHeight - (day.calories / maxCalories) * chartHeight
//         path += `L ${x} ${y} `
//       }
//     })

//     // Complete the path to create a closed shape for filling
//     path += `L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`

//     return path
//   }

//   // Generate path for the line chart
//   const generateLinePath = (data: ActivityDay[]) => {
//     if (!data || data.length === 0) return ""

//     const maxCalories = Math.max(...data.map((day) => day.calories || 0), 100)
//     const chartWidth = width - 80
//     const chartHeight = 150
//     const pointWidth = chartWidth / (data.length - 1)

//     let path = `M 0 ${chartHeight - (data[0].calories / maxCalories) * chartHeight} `

//     data.forEach((day, index) => {
//       if (index > 0) {
//         const x = index * pointWidth
//         const y = chartHeight - (day.calories / maxCalories) * chartHeight
//         path += `L ${x} ${y} `
//       }
//     })

//     return path
//   }

//   // Generate data points for the line chart
//   const generateDataPoints = (data: ActivityDay[]) => {
//     if (!data || data.length === 0) return []

//     const maxCalories = Math.max(...data.map((day) => day.calories || 0), 100)
//     const chartWidth = width - 80
//     const chartHeight = 150
//     const pointWidth = chartWidth / (data.length - 1)

//     return data.map((day, index) => {
//       const x = index * pointWidth
//       const y = chartHeight - (day.calories / maxCalories) * chartHeight
//       return { x, y, value: day.calories, workouts: day.workouts }
//     })
//   }

//   // Calculate streak progress percentage
//   const streakProgress = Math.min((userStats.streakDays / 30) * 100, 100)

//   // Render weekly chart with modern design
//   const renderWeeklyChart = () => {
//     const dataPoints = generateDataPoints(weeklyActivity)
//     const maxCalories = Math.max(...weeklyActivity.map((day) => day.calories || 0), 100)

//     return (
//       <Animated.View
//         style={[
//           styles.chartWrapper,
//           {
//             opacity: opacityAnimation,
//             transform: [{ scale: scaleAnimation }],
//           },
//         ]}
//       >
//         <View style={styles.chartLabels}>
//           <Text style={[styles.chartLabel, { color: colors.secondaryText }]}>Calories</Text>
//           <Text style={[styles.chartLabel, { color: colors.secondaryText }]}>Workouts</Text>
//         </View>

//         <View style={styles.weeklyChartContainer}>
//           {/* SVG Area Chart */}
//           <View style={styles.svgContainer}>
//             <Svg height="150" width={width - 80}>
//               <Defs>
//                 <SvgGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
//                   <Stop offset="0" stopColor={isDarkMode ? "rgba(255, 149, 0, 0.6)" : "rgba(99, 102, 241, 0.6)"} />
//                   <Stop offset="1" stopColor={isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.1)"} />
//                 </SvgGradient>
//                 <SvgGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
//                   <Stop offset="0" stopColor={isDarkMode ? "#FF9500" : "#6366F1"} />
//                   <Stop offset="1" stopColor={isDarkMode ? "#FF9500" : "#818CF8"} />
//                 </SvgGradient>
//               </Defs>

//               {/* Grid lines */}
//               {[0, 1, 2, 3].map((i) => (
//                 <Rect
//                   key={`grid-${i}`}
//                   x="0"
//                   y={i * 50}
//                   width={width - 80}
//                   height="1"
//                   fill={isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}
//                 />
//               ))}

//               {/* Area fill */}
//               <Path d={generateAreaPath(weeklyActivity)} fill="url(#areaGradient)" />

//               {/* Line stroke */}
//               <Path d={generateLinePath(weeklyActivity)} stroke="url(#lineGradient)" strokeWidth="3" fill="none" />

//               {/* Data points */}
//               {dataPoints.map((point, index) => (
//                 <React.Fragment key={index}>
//                   <Circle
//                     cx={point.x}
//                     cy={point.y}
//                     r="6"
//                     fill={isDarkMode ? "#1F1F1F" : "#FFFFFF"}
//                     stroke={isDarkMode ? "#FF9500" : "#6366F1"}
//                     strokeWidth="3"
//                   />
//                   {point.workouts > 0 && (
//                     <Circle cx={point.x} cy={point.y} r="3" fill={isDarkMode ? "#FF9500" : "#6366F1"} />
//                   )}
//                 </React.Fragment>
//               ))}
//             </Svg>
//           </View>

//           {/* Day labels */}
//           <View style={styles.dayLabelsContainer}>
//             {weeklyActivity.map((day, index) => (
//               <View key={index} style={styles.dayLabelWrapper}>
//                 <View
//                   style={[
//                     styles.dayLabelContainer,
//                     {
//                       backgroundColor:
//                         day.workouts > 0
//                           ? isDarkMode
//                             ? "rgba(255, 149, 0, 0.2)"
//                             : "rgba(99, 102, 241, 0.1)"
//                           : "transparent",
//                       borderColor: isDarkMode ? "#333" : "#e5e7eb",
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.dayText,
//                       {
//                         color: day.workouts > 0 ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
//                       },
//                     ]}
//                   >
//                     {fullDayNames[index].substring(0, 3)}
//                   </Text>
//                 </View>
//                 {day.workouts > 0 && (
//                   <View style={[styles.workoutBadge, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]}>
//                     <Text style={styles.workoutBadgeText}>{day.workouts}</Text>
//                   </View>
//                 )}
//               </View>
//             ))}
//           </View>
//         </View>
//       </Animated.View>
//     )
//   }

//   // Render monthly chart with modern design
//   const renderMonthlyChart = () => {
//     return (
//       <Animated.View
//         style={[
//           styles.chartWrapper,
//           {
//             opacity: opacityAnimation,
//             transform: [{ scale: scaleAnimation }],
//           },
//         ]}
//       >
//         <View style={styles.chartLabels}>
//           <Text style={[styles.chartLabel, { color: colors.secondaryText }]}>Calories</Text>
//           <Text style={[styles.chartLabel, { color: colors.secondaryText }]}>Workouts</Text>
//         </View>

//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.monthlyChartScrollContent}
//         >
//           <View style={styles.monthlyChartContainer}>
//             {/* Calendar grid background */}
//             <View style={styles.calendarGrid}>
//               {Array.from({ length: 5 }).map((_, rowIndex) => (
//                 <View key={`row-${rowIndex}`} style={styles.calendarRow}>
//                   {Array.from({ length: 7 }).map((_, colIndex) => (
//                     <View
//                       key={`cell-${rowIndex}-${colIndex}`}
//                       style={[
//                         styles.calendarCell,
//                         {
//                           backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
//                         },
//                       ]}
//                     />
//                   ))}
//                 </View>
//               ))}
//             </View>

//             {/* Activity hexagons */}
//             <View style={styles.activityHexagons}>
//               {monthlyActivity.map((dayData, index) => {
//                 const date = new Date(dayData.day)
//                 const isToday = date.toDateString() === new Date().toDateString()
//                 const maxCal = Math.max(...monthlyActivity.map((d) => d.calories)) || 1
//                 const intensity = dayData.calories > 0 ? dayData.calories / maxCal : 0
//                 const size = 24 + intensity * 12

//                 // Calculate position based on date
//                 const dayOfMonth = date.getDate()
//                 const dayOfWeek = date.getDay()
//                 const weekOfMonth = Math.floor((dayOfMonth - 1) / 7)

//                 return (
//                   <View
//                     key={dayData.day}
//                     style={[
//                       styles.hexagonWrapper,
//                       {
//                         left: dayOfWeek * 40 + 10,
//                         top: weekOfMonth * 40 + 10,
//                       } as ViewStyle,
//                     ]}
//                   >
//                     <View
//                       style={[
//                         styles.hexagon,
//                         {
//                           width: size,
//                           height: size,
//                           backgroundColor:
//                             dayData.workouts > 0
//                               ? isDarkMode
//                                 ? `rgba(255, 149, 0, ${0.3 + intensity * 0.7})`
//                                 : `rgba(99, 102, 241, ${0.3 + intensity * 0.7})`
//                               : isDarkMode
//                                 ? "rgba(255, 255, 255, 0.05)"
//                                 : "rgba(0, 0, 0, 0.05)",
//                           borderColor: isToday ? (isDarkMode ? "#FF9500" : "#6366F1") : "transparent",
//                         } as ViewStyle,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.hexagonText,
//                           {
//                             color: dayData.workouts > 0 ? (isDarkMode ? "#FFFFFF" : "#FFFFFF") : colors.secondaryText,
//                             fontSize: 10 + (dayData.workouts > 0 ? 2 : 0),
//                           },
//                         ]}
//                       >
//                         {dayOfMonth}
//                       </Text>
//                       {dayData.workouts > 0 && (
//                         <View style={styles.workoutDot}>
//                           <Text style={styles.workoutDotText}>{dayData.workouts}</Text>
//                         </View>
//                       )}
//                     </View>
//                   </View>
//                 )
//               })}
//             </View>
//           </View>
//         </ScrollView>

//         {/* Month legend */}
//         <View style={styles.monthLegend}>
//           <View style={styles.legendItem}>
//             <View
//               style={[
//                 styles.legendColor,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.3)" : "rgba(99, 102, 241, 0.3)",
//                 },
//               ]}
//             />
//             <Text style={[styles.legendText, { color: colors.secondaryText }]}>Low</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View
//               style={[
//                 styles.legendColor,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.6)" : "rgba(99, 102, 241, 0.6)",
//                 },
//               ]}
//             />
//             <Text style={[styles.legendText, { color: colors.secondaryText }]}>Medium</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View
//               style={[
//                 styles.legendColor,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.9)" : "rgba(99, 102, 241, 0.9)",
//                 },
//               ]}
//             />
//             <Text style={[styles.legendText, { color: colors.secondaryText }]}>High</Text>
//           </View>
//         </View>
//       </Animated.View>
//     )
//   }

//   return (
//     <View>
//       {/* Chart Header with View Selector */}
//       <View style={styles.chartHeader}>
//         <View style={styles.chartTitleContainer}>
//           <Text style={[styles.dashboardTitle, { color: colors.text }]}>Activity</Text>

//           {/* View Selector Dropdown */}
//           <TouchableOpacity
//             style={[styles.viewSelector, { borderColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
//             onPress={() => setShowViewSelector(!showViewSelector)}
//           >
//             <Text style={{ color: isDarkMode ? "#FF9500" : "#6366F1" }}>
//               {chartView === "weekly" ? "Weekly" : "Monthly"}
//             </Text>
//             <ChevronDown size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />

//             {/* Dropdown Menu */}
//             {showViewSelector && (
//               <View
//                 style={[
//                   styles.viewDropdown,
//                   {
//                     backgroundColor: isDarkMode ? "#1F2937" : "#fff",
//                     borderColor: isDarkMode ? "#374151" : "#E5E7EB",
//                   },
//                 ]}
//               >
//                 <TouchableOpacity
//                   style={[
//                     styles.dropdownItem,
//                     chartView === "weekly" && {
//                       backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.1)",
//                     },
//                   ]}
//                   onPress={() => {
//                     setChartView("weekly")
//                     setShowViewSelector(false)
//                   }}
//                 >
//                   <Text style={{ color: isDarkMode ? "#FF9500" : "#6366F1" }}>Weekly</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[
//                     styles.dropdownItem,
//                     chartView === "monthly" && {
//                       backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.1)",
//                     },
//                   ]}
//                   onPress={() => {
//                     setChartView("monthly")
//                     setShowViewSelector(false)
//                   }}
//                 >
//                   <Text style={{ color: isDarkMode ? "#FF9500" : "#6366F1" }}>Monthly</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Date Navigation */}
//         <View style={styles.dateNavigation}>
//           {/* ← Previous */}
//           <TouchableOpacity
//             style={styles.dateNavigationButton}
//             onPress={() => {
//               if (chartView === "weekly") {
//                 setWeekOffset((w) => w - 1)
//               } else {
//                 // back one month
//                 if (selectedMonth > 0) {
//                   setSelectedMonth((m) => m - 1)
//                 } else {
//                   setSelectedYear((y) => y - 1)
//                   setSelectedMonth(() => 11)
//                 }
//               }
//             }}
//           >
//             <ChevronLeft size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//           </TouchableOpacity>

//           {/* center label + calendar toggle */}
//           <TouchableOpacity
//             style={styles.currentPeriod}
//             onPress={() => chartView === "monthly" && setShowCalendar(true)}
//           >
//             <Text style={[styles.currentPeriodText, { color: colors.text }]}>{getCurrentMonthYear()}</Text>
//             {chartView === "monthly" && <Calendar size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />}
//           </TouchableOpacity>

//           {/* → Next */}
//           <TouchableOpacity
//             style={styles.dateNavigationButton}
//             onPress={() => {
//               if (chartView === "weekly") {
//                 setWeekOffset((w) => w + 1)
//               } else {
//                 // forward one month
//                 if (selectedMonth < 11) {
//                   setSelectedMonth((m) => m + 1)
//                 } else {
//                   setSelectedYear((y) => y + 1)
//                   setSelectedMonth(() => 0)
//                 }
//               }
//             }}
//           >
//             <ChevronRight size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Chart Visualization */}
//       <View style={styles.chartContainer}>{chartView === "weekly" ? renderWeeklyChart() : renderMonthlyChart()}</View>

//       {/* Stats Cards */}
//       <View style={styles.statsCardsContainer}>
//         {/* Streak Card */}
//         <View
//           style={[
//             styles.statCard,
//             {
//               backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.1)" : "rgba(99, 102, 241, 0.05)",
//               borderColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.2)",
//             },
//           ]}
//         >
//           <View style={styles.statCardHeader}>
//             <Ionicons name="flame" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.statCardTitle, { color: colors.secondaryText }]}>Streak</Text>
//           </View>
//           <Text style={[styles.statCardValue, { color: colors.text }]}>{userStats.streakDays}</Text>
//           <Text style={[styles.statCardLabel, { color: colors.secondaryText }]}>days</Text>
//           <View style={styles.progressBarContainer}>
//             <View
//               style={[
//                 styles.progressBar,
//                 { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.progressFill,
//                   {
//                     width: `${streakProgress}%`,
//                     backgroundColor: isDarkMode ? "#FF9500" : "#6366F1",
//                   },
//                 ]}
//               />
//             </View>
//           </View>
//         </View>

//         {/* Workouts Card */}
//         <View
//           style={[
//             styles.statCard,
//             {
//               backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
//               borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//             },
//           ]}
//         >
//           <View style={styles.statCardHeader}>
//             <Ionicons name="barbell" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.statCardTitle, { color: colors.secondaryText }]}>Workouts</Text>
//           </View>
//           <Text style={[styles.statCardValue, { color: colors.text }]}>
//             {chartView === "weekly" ? userStats.weeklyWorkouts : userStats.monthlyWorkouts}
//           </Text>
//           <Text style={[styles.statCardLabel, { color: colors.secondaryText }]}>
//             {chartView === "weekly" ? "this week" : "this month"}
//           </Text>
//         </View>

//         {/* Calories Card */}
//         <View
//           style={[
//             styles.statCard,
//             {
//               backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
//               borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//             },
//           ]}
//         >
//           <View style={styles.statCardHeader}>
//             <Ionicons name="flame-outline" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.statCardTitle, { color: colors.secondaryText }]}>Calories</Text>
//           </View>
//           <Text style={[styles.statCardValue, { color: colors.text }]}>
//             {chartView === "weekly" ? userStats.weeklyCalories : userStats.totalCalories}
//           </Text>
//           <Text style={[styles.statCardLabel, { color: colors.secondaryText }]}>burned</Text>
//         </View>

//         {/* Minutes Card */}
//         <View
//           style={[
//             styles.statCard,
//             {
//               backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
//               borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//             },
//           ]}
//         >
//           <View style={styles.statCardHeader}>
//             <Ionicons name="time" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.statCardTitle, { color: colors.secondaryText }]}>Time</Text>
//           </View>
//           <Text style={[styles.statCardValue, { color: colors.text }]}>{userStats.totalMinutes}</Text>
//           <Text style={[styles.statCardLabel, { color: colors.secondaryText }]}>minutes</Text>
//         </View>
//       </View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   chartHeader: {
//     marginBottom: 20,
//   },
//   chartTitleContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   dashboardTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//   },
//   viewSelector: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     position: "relative",
//   },
//   viewDropdown: {
//     position: "absolute",
//     top: 40,
//     right: 0,
//     width: 120,
//     borderRadius: 12,
//     borderWidth: 1,
//     overflow: "hidden",
//     zIndex: 10,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//   },
//   dropdownItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     alignItems: "center",
//   },
//   dateNavigation: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   dateNavigationButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   currentPeriod: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//   },
//   currentPeriodText: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   chartContainer: {
//     marginBottom: 20,
//   },
//   chartWrapper: {
//     borderRadius: 16,
//     overflow: "hidden",
//   },
//   chartLabels: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 10,
//     marginBottom: 8,
//   },
//   chartLabel: {
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   weeklyChartContainer: {
//     height: 200,
//     position: "relative",
//   },
//   svgContainer: {
//     height: 150,
//     marginBottom: 10,
//   },
//   dayLabelsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 10,
//   },
//   dayLabelWrapper: {
//     alignItems: "center",
//     position: "relative",
//   },
//   dayLabelContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   dayText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   workoutBadge: {
//     position: "absolute",
//     top: -8,
//     right: -8,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   workoutBadgeText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "700",
//   },
//   monthlyChartScrollContent: {
//     paddingBottom: 10,
//   },
//   monthlyChartContainer: {
//     height: 220,
//     width: 300,
//     position: "relative",
//   },
//   calendarGrid: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   calendarRow: {
//     flexDirection: "row",
//     height: 40,
//   },
//   calendarCell: {
//     width: 40,
//     height: 40,
//     borderRadius: 4,
//     margin: 1,
//   },
//   activityHexagons: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   hexagonWrapper: {
//     position: "absolute",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   hexagon: {
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 2,
//   },
//   hexagonText: {
//     fontWeight: "600",
//   },
//   workoutDot: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   workoutDotText: {
//     fontSize: 8,
//     fontWeight: "700",
//     color: "#000",
//   },
//   monthLegend: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 10,
//     gap: 16,
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   legendColor: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//   },
//   legendText: {
//     fontSize: 12,
//   },
//   statsCardsContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     marginTop: 10,
//   },
//   statCard: {
//     width: (width - 60) / 2,
//     padding: 12,
//     borderRadius: 16,
//     borderWidth: 1,
//   },
//   statCardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginBottom: 8,
//   },
//   statCardTitle: {
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   statCardValue: {
//     fontSize: 24,
//     fontWeight: "700",
//   },
//   statCardLabel: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   progressBarContainer: {
//     marginTop: 8,
//   },
//   progressBar: {
//     height: 4,
//     borderRadius: 2,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     borderRadius: 2,
//   },
// })

// export default EnhancedActivityChart
