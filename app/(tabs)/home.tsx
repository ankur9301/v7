"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  Animated,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { useTheme, lightTheme, darkTheme } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import { workouts } from "@/constants/data"
import WorkoutDetailsModal from "@/components/WorkoutDetailsModal"
import { useUserStore } from "@/store/useUserStore"
import { useStatsStore } from "@/src/stores/userStatsStore"
import { Footprints, GlassWater } from "lucide-react-native"
import AdvancedActivityChart from "@/components/ActivityVisualization"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.7

// Sample data for featured workout plans
const featuredPlans = [
  {
    id: "1",
    title: "30-Day Strength",
    description: "Build muscle and strength with this comprehensive plan",
    duration: "30 days",
    level: "Intermediate",
    workoutsCount: 24,
    progress: 0.45,
    image: require("@/assets/images/placeholder.jpg"),
  },
  {
    id: "2",
    title: "Fat Burn Challenge",
    description: "High intensity workouts to maximize calorie burn",
    duration: "21 days",
    level: "Advanced",
    workoutsCount: 18,
    progress: 0.2,
    image: require("@/assets/images/placeholder.jpg"),
  },
  {
    id: "3",
    title: "Beginner Fitness",
    description: "Perfect for those just starting their fitness journey",
    duration: "14 days",
    level: "Beginner",
    workoutsCount: 12,
    progress: 0.8,
    image: require("@/assets/images/placeholder.jpg"),
  },
]

// Sample data for popular workouts with predefined exercises
const popularWorkouts = [
  {
    id: "1",
    title: "Shoulder Flex Stability",
    level: "Beginner",
    duration: "55 min",
    totalCalories: 320,
    image: require("@/assets/images/placeholder.jpg"),
    exercises: workouts
      .filter(
        (w) =>
          w.muscle === "Shoulders" &&
          w.level === "Beginner" &&
          w.category !== "Pre_warmup" &&
          w.category !== "Post_warmup",
      )
      .slice(0, 6),
  },
  {
    id: "2",
    title: "Full Body Burn",
    level: "Intermediate",
    duration: "45 min",
    totalCalories: 380,
    image: require("@/assets/images/placeholder.jpg"),
    exercises: workouts
      .filter((w) => w.level === "Intermediate" && w.category !== "Pre_warmup" && w.category !== "Post_warmup")
      .slice(0, 8),
  },
  {
    id: "3",
    title: "Core Crusher",
    level: "Advanced",
    duration: "30 min",
    totalCalories: 250,
    image: require("@/assets/images/placeholder.jpg"),
    exercises: workouts
      .filter((w) => w.muscle === "Core" && w.category !== "Pre_warmup" && w.category !== "Post_warmup")
      .slice(0, 5),
  },
  {
    id: "4",
    title: "Leg Day Challenge",
    level: "Intermediate",
    duration: "60 min",
    totalCalories: 420,
    image: require("@/assets/images/placeholder.jpg"),
    exercises: workouts
      .filter(
        (w) =>
          (w.muscle === "Legs" || w.muscle === "Hamstrings") &&
          w.category !== "Pre_warmup" &&
          w.category !== "Post_warmup",
      )
      .slice(0, 7),
  },
]

// Category data
const categories = [
  { id: "1", name: "All" },
  { id: "2", name: "Chest" },
  { id: "3", name: "Back" },
  { id: "4", name: "Arms" },
  { id: "5", name: "Shoulders" },
  { id: "6", name: "Legs" },
  { id: "7", name: "Core" },
]

// Full day names for reference
const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const HomeScreen = () => {
  const { isDarkMode } = useTheme()
  const colors = isDarkMode ? darkTheme : lightTheme
  const router = useRouter()
  const { user } = useUserStore()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [scrollY] = useState(new Animated.Value(0))
  const [waterModalVisible, setWaterModalVisible] = useState(false)

  // State for workout modal
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState(null)

  // Chart view options
  const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly")
  const [weekOffset, setWeekOffset] = useState(0)

  const [showViewSelector, setShowViewSelector] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { fetchStats, weeklyActivity, monthlyActivity, userStats } = useStatsStore()

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

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay() // 0 = Sunday
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const getWeekRange = (offset: number) => {
    const now = new Date()
    now.setDate(now.getDate() + offset * 7)
    const start = getStartOfWeek(now)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { start, end }
  }

  const getSpecificMonth = (year: number, month: number) => {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    return { start, end, month, year }
  }

  // Get the current month and year for display
  const getCurrentMonthYear = () => {
    if (chartView === "weekly") {
      const { start, end } = getWeekRange(weekOffset)
      // e.g. "Apr 27 – May 3"
      const fmt = (d: Date) => `${d.getDate()} ${monthNames[d.getMonth()].substring(0, 3)}`
      return `${fmt(start)} – ${fmt(end)}`
    }
    // always show the real month/year you've chosen
    return `${monthNames[selectedMonth]} ${selectedYear}`
  }

  useEffect(() => {
    if (!user?.id) return

    if (chartView === "weekly") {
      const { start, end } = getWeekRange(weekOffset)
      fetchStats(`${user.id}|${start.toISOString()}|${end.toISOString()}`)
    } else {
      // always use selectedMonth/Year
      const { start, end } = getSpecificMonth(selectedYear, selectedMonth)
      fetchStats(`${user.id}|${start.toISOString()}|${end.toISOString()}`)
    }
  }, [user, chartView, weekOffset, selectedMonth, selectedYear, fetchStats])

  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  // Handle workout card press
  const handleWorkoutPress = (workout: React.SetStateAction<null>) => {
    setSelectedWorkout(workout)
    setModalVisible(true)
  }

  // Handle featured plan press
  const handlePlanPress = (plan: { id: any }) => {
    router.push({
      pathname: "/workout-plan",
      params: { id: plan.id },
    })
  }

  // Render category item
  const renderCategoryItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        {
          backgroundColor: isDarkMode
            ? selectedCategory === item.name
              ? "#FF9500"
              : "rgba(255, 255, 255, 0.1)"
            : selectedCategory === item.name
              ? "#6366F1"
              : "rgba(99, 102, 241, 0.1)",
        },
      ]}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Text
        style={[
          styles.categoryText,
          {
            color: selectedCategory === item.name ? (isDarkMode ? "#000" : "#fff") : isDarkMode ? "#fff" : "#6366F1",
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  // Render featured plan card
  const renderFeaturedPlanCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.featuredCard,
        {
          backgroundColor: colors.card,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handlePlanPress(item)}
    >
      <Image source={item.image} style={styles.featuredCardImage} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.featuredCardOverlay}>
        <View style={styles.featuredCardContent}>
          <View style={styles.featuredCardHeader}>
            <Text style={styles.featuredCardTitle}>{item.title}</Text>
            <View style={styles.featuredCardBadge}>
              <Text style={styles.featuredCardBadgeText}>{item.level}</Text>
            </View>
          </View>

          <Text style={styles.featuredCardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.featuredCardFooter}>
            <View style={styles.featuredCardStats}>
              <View style={styles.featuredCardStat}>
                <Ionicons name="calendar-outline" size={14} color="#fff" />
                <Text style={styles.featuredCardStatText}>{item.duration}</Text>
              </View>
              <View style={styles.featuredCardStat}>
                <Ionicons name="barbell-outline" size={14} color="#fff" />
                <Text style={styles.featuredCardStatText}>{item.workoutsCount} workouts</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.progress * 100}%`,
                      backgroundColor: isDarkMode ? "#FF9500" : "#6366F1",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )

  // Render workout card
  const renderWorkoutCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.workoutCard,
        {
          backgroundColor: colors.card,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleWorkoutPress(item)}
    >
      <Image source={item.image} style={styles.workoutImage} />
      <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={styles.workoutInfoContainer}>
        <View style={styles.workoutInfo}>
          <Text style={[styles.workoutTitle, { color: isDarkMode ? "#fff" : "#1f2937" }]}>{item.title}</Text>
          <View style={styles.workoutDetails}>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.3)" : "rgba(99, 102, 241, 0.2)" },
              ]}
            >
              <Text style={[styles.levelText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>{item.level}</Text>
            </View>
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={14} color={isDarkMode ? "#FF9500" : "#6366F1"} />
              <Text style={[styles.durationText, { color: isDarkMode ? "#fff" : "#1f2937" }]}>{item.duration}</Text>
            </View>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  )
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Animated Header Background */}
      <Animated.View
        style={[
          styles.headerBackground,
          {
            opacity: headerOpacity,
            backgroundColor: colors.background,
          },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={user?.avatar_url ? { uri: user.avatar_url } : require("@/assets/images/placeholder.jpg")}
            style={[styles.avatar, { borderColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
          />

          <View style={styles.userTextContainer}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.username || "Welcome!"}</Text>
            <Text style={[styles.userStatus, { color: colors.secondaryText }]}>Get Ready 🔥</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={[
              styles.menuButton,
              { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.1)" },
            ]}
            onPress={() => router.push("/subScreen/JogTracker")}
          >
            <Footprints size={24} color={isDarkMode ? "#fff" : "#6366F1"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => router.push("/subScreen/hydrationTrackerScreen")}>
            <GlassWater size={24} color={isDarkMode ? "#fff" : "#6366F1"} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Dashboard Card - More Compact */}
        <View
          style={[
            styles.dashboardCard,
            {
              backgroundColor: isDarkMode ? "#111" : "#fff",
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border,
            },
          ]}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(255, 149, 0, 0.1)", "rgba(0, 0, 0, 0)"]
                : ["rgba(99, 102, 241, 0.1)", "rgba(255, 255, 255, 0)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dashboardGradient}
          >
            {/* Advanced Activity Chart Component */}
            <AdvancedActivityChart
              isDarkMode={isDarkMode}
              colors={colors}
              chartView={chartView}
              setChartView={setChartView}
              weekOffset={weekOffset}
              setWeekOffset={setWeekOffset}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              showViewSelector={showViewSelector}
              setShowViewSelector={setShowViewSelector}
              weeklyActivity={weeklyActivity}
              monthlyActivity={monthlyActivity}
              userStats={userStats}
              getCurrentMonthYear={getCurrentMonthYear}
            />
          </LinearGradient>
        </View>

        {/* Featured Plans */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Plans</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredPlans}
            renderItem={renderFeaturedPlanCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            snapToInterval={width - 48}
            decelerationRate="fast"
            snapToAlignment="center"
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Popular Workouts */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Workouts</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularWorkouts}
            renderItem={renderWorkoutCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.workoutsList}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            snapToAlignment="center"
          />
        </View>
      </Animated.ScrollView>

      {/* Workout Details Modal */}
      <WorkoutDetailsModal visible={modalVisible} onClose={() => setModalVisible(false)} workout={selectedWorkout} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
  },
  userTextContainer: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
  },
  userStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  dashboardCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dashboardGradient: {
    padding: 16, // Reduced padding for more compact look
    borderRadius: 20,
  },
  featuredSection: {
    marginTop: 24, // Reduced margin
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18, // Slightly smaller
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  featuredList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  featuredCard: {
    width: width - 48,
    height: 200, // Slightly reduced height
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredCardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    justifyContent: "flex-end",
    padding: 16,
  },
  featuredCardContent: {
    justifyContent: "flex-end",
  },
  featuredCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  featuredCardTitle: {
    color: "#fff",
    fontSize: 20, // Slightly smaller
    fontWeight: "700",
    flex: 1,
  },
  featuredCardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredCardBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  featuredCardDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 16,
  },
  featuredCardFooter: {
    gap: 12,
  },
  featuredCardStats: {
    flexDirection: "row",
    gap: 16,
  },
  featuredCardStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featuredCardStatText: {
    color: "#fff",
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  categoriesSection: {
    marginTop: 24, // Reduced margin
    paddingHorizontal: 20,
  },
  categoriesList: {
    paddingVertical: 12, // Reduced padding
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  popularSection: {
    marginTop: 16, // Reduced margin
  },
  workoutsList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  workoutCard: {
    width: CARD_WIDTH,
    height: 180, // Reduced height
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  workoutInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  workoutInfo: {
    padding: 16,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  workoutDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 12,
    marginLeft: 4,
  },
})

export default HomeScreen

