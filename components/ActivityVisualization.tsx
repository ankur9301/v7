"use client"

import React, { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Modal, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, BarChart2 } from "lucide-react-native"
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Rect, Line } from "react-native-svg"
import { useUserStore } from "@/store/useUserStore"
import { useStatsStore } from "@/src/stores/userStatsStore"
import WeeklyGraph from '@/components/WeeklyGraph'
import ModernMonthlyGraph from '@/components/ModernMonthlyGraph'
import { fetchMuscleExercises } from '@/lib/fetchCategoryExercise'
import { calculateMuscleDistribution, muscleCategoryMap } from '@/utils/calculateMuscleDistribution'

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
  id: string // Unique identifier for the workout session
  muscles: string[] // like ['Back', 'Biceps']
  date: string
  calories?: number
  exercises?: Array<{
    sets: number
    reps: number
    muscle_group: string | null
  }>
}

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

  useEffect(() => {
    if (chartView === "monthly") {
      // Sync the year from yearOffset to selectedYear
      setSelectedYear(() => new Date().getFullYear() + yearOffset);
    }
  }, [chartView, yearOffset]);

  useEffect(() => {
    setViewingYear(new Date().getFullYear() + yearOffset)
  }, [yearOffset])

  // Handle month navigation
  useEffect(() => {
    if (chartView === "monthly") {
      // Fetch data when month or year changes in monthly view
      const fetchMonthData = async () => {
        setIsLoading(true);
        try {
          const startOfMonth = new Date(selectedYear, selectedMonth, 1);
          const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

          // Clear stale monthly activity BEFORE fetch to prevent showing wrong data
          useStatsStore.setState({ 
            monthlyActivity: [], 
            userStats: { 
              ...useStatsStore.getState().userStats, 
              monthlyWorkouts: 0, 
              totalCalories: 0, 
              totalMinutes: 0 
            } 
          });

          if (user) {
            // Always re-fetch when month/year changes
            const fetchedSessions = await fetchStats(`${user.id}|${startOfMonth.toISOString()}|${endOfMonth.toISOString()}`);

            // Get session IDs from sessions returned by fetchStats
            const sessionIds = fetchedSessions.map((s) => s.id);

            try {
              // Fetch and calculate muscle data
              const enrichedExercises = await fetchMuscleExercises(sessionIds);
              const exercisesForDistribution = enrichedExercises.map(exercise => ({
                sets: exercise.sets || 0,
                reps: exercise.reps || 0,
                muscle_group: exercise.muscle_group || null
              }));
              
              if (exercisesForDistribution.length > 0) {
                const summary = calculateMuscleDistribution(exercisesForDistribution);
                setMuscleSummary(summary);
              } else {
                setMuscleSummary([]);
              }
            } catch (error) {
              console.error("Error fetching muscle exercises:", error);
              setMuscleSummary([]);
            }
          }
        } catch (err) {
          console.error(err);
          setMuscleSummary([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMonthData();
    }
  }, [selectedMonth, selectedYear, chartView, user]);

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
    const weeks: Record<number, { workouts: number, calories: number }> = {}

    dailyStats.forEach(({ day, workouts, calories }) => {
      // parse as local
      const [Y, M, D] = day.split("-").map(Number)
      const dt = new Date(Y, M - 1, D)

      const w = getWeekNumberInMonth(dt)
      if (!weeks[w]) weeks[w] = { workouts: 0, calories: 0 }
      weeks[w].workouts += workouts
      weeks[w].calories += calories
    })

    return Object.entries(weeks)
      .sort(([a], [b]) => +a - +b)
      .map(([week, { workouts, calories }]) => ({
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

  const handleMonthSelect = async ({ month, year }: { month: number; year: number }) => {
    setIsLoading(true)
    try {
      const startOfMonth = new Date(year, month, 1)
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

      // Clear stale monthly activity BEFORE fetch to prevent showing wrong data
      useStatsStore.setState({ monthlyActivity: [], userStats: { ...useStatsStore.getState().userStats, monthlyWorkouts: 0, totalCalories: 0, totalMinutes: 0 } })

      if (user) {
        // Always re-fetch, even if selecting same month again
        const fetchedSessions = await fetchStats(`${user.id}|${startOfMonth.toISOString()}|${endOfMonth.toISOString()}`)

        // Get session IDs from sessions returned by fetchStats
        const sessionIds = fetchedSessions.map((s) => s.id)

        try {
          // Fetch and calculate muscle data
          const enrichedExercises = await fetchMuscleExercises(sessionIds)
          const exercisesForDistribution = enrichedExercises.map(exercise => ({
            sets: exercise.sets || 0,
            reps: exercise.reps || 0,
            muscle_group: exercise.muscle_group || null
          }));
          if (exercisesForDistribution.length > 0) {
            const summary = calculateMuscleDistribution(exercisesForDistribution)
            setMuscleSummary(summary)
          } else {
            setMuscleSummary([])
          }
        } catch (error) {
          console.error("Error fetching muscle exercises:", error)
          setMuscleSummary([])
        }

        // Forcefully update selected month/year after data is fetched
        setSelectedMonth(() => month)
        setSelectedYear(() => year)
        setShowMonthDetails(true)
      } else {
        console.error("User is null")
      }
    } catch (err) {
      console.error(err)
      setMuscleSummary([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Valid weekly data:', validWeeklyData);
    console.log('Valid monthly data:', validMonthlyData);
  }, [validWeeklyData, validMonthlyData]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.chartHeader}>
          <View style={styles.dateSelector}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                if (chartView === "weekly") {
                  setWeekOffset((prev) => prev - 1)
                } else {
                  setSelectedMonth((prev) => {
                    if (prev === 0) {
                      setSelectedYear((y) => y - 1)
                      return 11
                    }
                    return prev - 1
                  })
                }
              }}
            >
              <ChevronLeft size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateText} onPress={() => setShowCalendar(true)}>
              <Text style={[styles.currentDate, { color: colors.text }]}>{getCurrentMonthYear()}</Text>
              <Calendar size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                if (chartView === "weekly") {
                  setWeekOffset((prev) => prev + 1)
                } else {
                  setSelectedMonth((prev) => {
                    if (prev === 11) {
                      setSelectedYear((y) => y + 1)
                      return 0
                    }
                    return prev + 1
                  })
                }
              }}
            >
              <ChevronRight size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.viewSelectorButton}
            onPress={() => setShowViewSelector(!showViewSelector)}
          >
            {chartView === "weekly" ? (
              <BarChart2 size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
            ) : (
              <TrendingUp size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? "#FF9500" : "#6366F1"} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Loading activity data...</Text>
        </View>
      </View>
    );
  }

  if (!validWeeklyData.length && !validMonthlyData.length) {
    return (
      <View style={styles.container}>
        <View style={styles.chartHeader}>
          <View style={styles.dateSelector}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                if (chartView === "weekly") {
                  setWeekOffset((prev) => prev - 1)
                } else {
                  setSelectedMonth((prev) => {
                    if (prev === 0) {
                      setSelectedYear((y) => y - 1)
                      return 11
                    }
                    return prev - 1
                  })
                }
              }}
            >
              <ChevronLeft size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateText} onPress={() => setShowCalendar(true)}>
              <Text style={[styles.currentDate, { color: colors.text }]}>{getCurrentMonthYear()}</Text>
              <Calendar size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                if (chartView === "weekly") {
                  setWeekOffset((prev) => prev + 1)
                } else {
                  setSelectedMonth((prev) => {
                    if (prev === 11) {
                      setSelectedYear((y) => y + 1)
                      return 0
                    }
                    return prev + 1
                  })
                }
              }}
            >
              <ChevronRight size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.viewSelectorButton}
            onPress={() => setShowViewSelector(!showViewSelector)}
          >
            {chartView === "weekly" ? (
              <BarChart2 size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
            ) : (
              <TrendingUp size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.noDataMessage}>
          <Text style={{ color: colors.text, textAlign: 'center', marginVertical: 10 }}>
            No activity data available for this period
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Calories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Minutes</Text>
          </View>
        </View>
      </View>
    );
  }

  const renderWeeklyChart = () => {
    return (
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
    );
  }

  const renderMonthlyChart = () => {
    return (
      <Animated.View
        style={[
          styles.chartWrapper,
          { opacity: opacityAnimation, transform: [{ scale: scaleAnimation }] },
        ]}
      >
        <ModernMonthlyGraph
          monthlyActivity={monthlyActivity}
          isDarkMode={isDarkMode}
          colors={colors}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      </Animated.View>
    );
  }

  const renderMonthDetailsModal = () => {
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
                    {userStats.monthlyWorkouts || 0}
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
                    {userStats.totalCalories || 0}
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
                    {userStats.totalMinutes || 0}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Minutes</Text>
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Types</Text>
                <View style={styles.workoutTypesContainer}>
                  {muscleSummary && muscleSummary.length > 0 ? (
                    muscleSummary.map((type, index) => (
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
                    ))
                  ) : (
                    <Text style={{ color: colors.secondaryText, textAlign: 'center', padding: 10 }}>
                      No workout type data available
                    </Text>
                  )}
                </View>
              </View>

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
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleRow}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Activity</Text>

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

        <View style={styles.dateNavigation}>
          <TouchableOpacity
            style={styles.dateNavigationButton}
            onPress={() => {
              if (chartView === "weekly") {
                setWeekOffset((w) => w - 1)
              } else {
                // In monthly view, go to previous month
                setSelectedMonth(prev => {
                  if (prev === 0) {
                    setSelectedYear(y => y - 1);
                    return 11;
                  }
                  return prev - 1;
                });
              }
            }}
          >
            <ChevronLeft size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.currentPeriod}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={[styles.currentPeriodText, { color: colors.text }]}>
              {chartView === "weekly" 
                ? getCurrentMonthYear() 
                : `${monthNames[selectedMonth]} ${selectedYear}`}
            </Text>
            <Calendar size={14} color={isDarkMode ? "#FF9500" : "#6366F1"} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateNavigationButton}
            onPress={() => {
              if (chartView === "weekly") {
                setWeekOffset((w) => w + 1)
              } else {
                // In monthly view, go to next month if not in future
                const currentDate = new Date();
                const isCurrentYearAndMonth = 
                  selectedYear === currentDate.getFullYear() && 
                  selectedMonth === currentDate.getMonth();
                  
                if (isCurrentYearAndMonth) return; // Don't allow going to future months
                
                setSelectedMonth(prev => {
                  if (prev === 11) {
                    setSelectedYear(y => y + 1);
                    return 0;
                  }
                  return prev + 1;
                });
              }
            }}
            disabled={chartView === "monthly" && 
              selectedYear === new Date().getFullYear() && 
              selectedMonth === new Date().getMonth()}
          >
            <ChevronRight
              size={16}
              color={
                (chartView === "monthly" && 
                selectedYear === new Date().getFullYear() && 
                selectedMonth === new Date().getMonth())
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

      <View style={styles.chartContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </View>
        ) : chartView === "weekly" ? renderWeeklyChart() : renderMonthlyChart()}
      </View>

      <View style={styles.statsRow}>
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

      {renderMonthSelector()}

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
  },
  achievementDesc: {
    fontSize: 12,
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
  arrowButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 16,
    borderRadius: 12,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentDate: {
    fontSize: 14,
    fontWeight: "600",
  },
  noDataMessage: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  }
})
export default CompactActivityChart
