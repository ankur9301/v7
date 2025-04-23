"use client"

import { useState, useContext, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  Image,
  Animated,
  Platform,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, lightTheme, darkTheme } from "@/context/ThemeContext"
import { WorkoutContext } from "@/context/WorkoutContext"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import AddExerciseModal from "@/components/AddExerciseModal"
import { workouts as allWorkouts } from "@/constants/data"
import type { Workout, WorkoutHistory, WorkoutTemplate } from "@/types/types"
import * as Haptics from "expo-haptics"

const { width } = Dimensions.get("window")

// Sample data for workout history
const workoutHistoryData: WorkoutHistory[] = [
  {
    id: "h1",
    date: "Today, 10:30 AM",
    title: "Morning Workout",
    duration: "45 min",
    calories: 320,
    workouts: [
      {
        id: "w1",
        name: "Push-ups",
        muscle: "Chest",
        level: "Beginner",
        sets: 3,
        reps: "12-15",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w2",
        name: "Squats",
        muscle: "Legs",
        level: "Beginner",
        sets: 4,
        reps: "10-12",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w3",
        name: "Plank",
        muscle: "Core",
        level: "Beginner",
        sets: 3,
        reps: "30 sec",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
    ],
  },
  {
    id: "h2",
    date: "Yesterday, 6:15 PM",
    title: "Evening Cardio",
    duration: "30 min",
    calories: 280,
    workouts: [
      {
        id: "w4",
        name: "Jumping Jacks",
        muscle: "Full Body",
        level: "Beginner",
        sets: 3,
        reps: "45 sec",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w5",
        name: "Mountain Climbers",
        muscle: "Core",
        level: "Intermediate",
        sets: 3,
        reps: "30 sec",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w6",
        name: "Burpees",
        muscle: "Full Body",
        level: "Advanced",
        sets: 3,
        reps: "10-12",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
    ],
  },
  {
    id: "h3",
    date: "May 15, 2023, 8:00 AM",
    title: "Full Body Workout",
    duration: "60 min",
    calories: 420,
    workouts: [
      {
        id: "w7",
        name: "Deadlifts",
        muscle: "Back",
        level: "Intermediate",
        sets: 4,
        reps: "8-10",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w8",
        name: "Bench Press",
        muscle: "Chest",
        level: "Intermediate",
        sets: 4,
        reps: "8-10",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w9",
        name: "Pull-ups",
        muscle: "Back",
        level: "Advanced",
        sets: 3,
        reps: "8-10",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w10",
        name: "Shoulder Press",
        muscle: "Shoulders",
        level: "Intermediate",
        sets: 3,
        reps: "10-12",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
    ],
  },
]

// Sample data for saved templates
const savedTemplatesData: WorkoutTemplate[] = [
  {
    id: "t1",
    title: "Upper Body Blast",
    workouts: [
      {
        id: "w11",
        name: "Bench Press",
        muscle: "Chest",
        level: "Intermediate",
        sets: 4,
        reps: "8-10",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w12",
        name: "Shoulder Press",
        muscle: "Shoulders",
        level: "Intermediate",
        sets: 3,
        reps: "10-12",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w13",
        name: "Bicep Curls",
        muscle: "Arms",
        level: "Beginner",
        sets: 3,
        reps: "12-15",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w14",
        name: "Tricep Extensions",
        muscle: "Arms",
        level: "Beginner",
        sets: 3,
        reps: "12-15",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
    ],
  },
  {
    id: "t2",
    title: "Leg Day",
    workouts: [
      {
        id: "w15",
        name: "Squats",
        muscle: "Legs",
        level: "Intermediate",
        sets: 4,
        reps: "8-10",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w16",
        name: "Lunges",
        muscle: "Legs",
        level: "Intermediate",
        sets: 3,
        reps: "10 each leg",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w17",
        name: "Leg Press",
        muscle: "Legs",
        level: "Intermediate",
        sets: 3,
        reps: "12-15",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w18",
        name: "Calf Raises",
        muscle: "Legs",
        level: "Beginner",
        sets: 4,
        reps: "15-20",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
    ],
  },
  {
    id: "t3",
    title: "Quick HIIT",
    workouts: [
      {
        id: "w19",
        name: "Burpees",
        muscle: "Full Body",
        level: "Advanced",
        sets: 4,
        reps: "45 sec",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w20",
        name: "Mountain Climbers",
        muscle: "Core",
        level: "Intermediate",
        sets: 4,
        reps: "45 sec",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w21",
        name: "Jumping Jacks",
        muscle: "Full Body",
        level: "Beginner",
        sets: 4,
        reps: "45 sec",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
      {
        id: "w22",
        name: "High Knees",
        muscle: "Legs",
        level: "Intermediate",
        sets: 4,
        reps: "45 sec",
        imageUrl: require("@/assets/images/placeholder.jpg"),
      },
    ],
  },
]

const WorkoutHistoryScreen = () => {
  const { isDarkMode } = useTheme()
  const colors = isDarkMode ? darkTheme : lightTheme
  const router = useRouter()
  const { setWorkoutPlan } = useContext(WorkoutContext)

  const [activeTab, setActiveTab] = useState("history") // 'history' or 'templates'
  const [selectedItem, setSelectedItem] = useState<WorkoutHistory | WorkoutTemplate | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Workout[]>([])

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Start workout with selected workouts
  const handleStartWorkout = (workouts: Workout[]) => {
    // Convert workouts to the format expected by WorkoutContext
    const formattedWorkouts = workouts.map((workout) => ({
      ...workout,
      id: typeof workout.id === "string" ? workout.id : String(workout.id),
      category: workout.muscle || workout.category || "",
      image: workout.imageUrl || workout.image || null,
    }))

    setWorkoutPlan(formattedWorkouts)
    setDetailModalVisible(false)

    // Provide haptic feedback
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }

    router.push("/subScreen/WorkingOut")
  }

  // Create new template with selected workouts
  const handleCreateTemplate = (selectedWorkouts: Workout[]) => {
    setNewTemplate(selectedWorkouts)
    setAddExerciseModalVisible(false)

    // Here you would normally save the template to your database
    // For now, we'll just show a success message and provide haptic feedback
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }

    // Create a new template object
    const newTemplateObj: WorkoutTemplate = {
      id: `t${Date.now()}`,
      title: `Custom Template ${savedTemplatesData.length + 1}`,
      workouts: selectedWorkouts,
    }

    // In a real app, you would save this to your database
    alert(`New template "${newTemplateObj.title}" created with ${selectedWorkouts.length} exercises!`)
  }

  const renderHistoryItem = ({ item, index }: { item: WorkoutHistory; index: number }) => {
    // Calculate animation delay based on index
    const animationDelay = index * 100

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.historyCard,
            {
              backgroundColor: colors.card,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border,
            },
          ]}
          onPress={() => {
            setSelectedItem(item)
            setDetailModalVisible(true)

            // Provide haptic feedback
            if (Platform.OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
          }}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(255,149,0,0.15)", "rgba(255,85,0,0.05)"]
                : ["rgba(139,92,246,0.15)", "rgba(99,102,241,0.05)"]
            }
            style={styles.cardGradient}
          >
            <View style={styles.historyCardHeader}>
  <Text style={[styles.historyCardTitle, { color: colors.text }]}>
    {item.title}
  </Text>
  <View style={styles.historyCardActions}>
    <View
      style={[
        styles.durationBadge,
        {
          backgroundColor: isDarkMode
            ? "rgba(255, 149, 0, 0.2)"
            : "rgba(99, 102, 241, 0.1)",
        },
      ]}
    >
      <Ionicons name="barbell-outline" size={14} color={isDarkMode ? "#FF9500" : "#6366F1"} />
      <Text style={[styles.durationText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
        {item.workouts.length} exercises
      </Text>
    </View>
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={() => {
        // Delete this template
        if (Platform.OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
      }}
    >
      <Ionicons name="trash-outline" size={16} color={isDarkMode ? "#ef4444" : "#dc2626"} />
    </TouchableOpacity>
  </View>
</View>

            <View style={styles.historyCardStats}>
              <View style={styles.historyCardStat}>
                <Ionicons name="flame-outline" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                <Text style={[styles.historyCardStatText, { color: colors.secondaryText }]}>
                  {item.calories} calories
                </Text>
              </View>
              <View style={styles.historyCardStat}>
                <Ionicons name="barbell-outline" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                <Text style={[styles.historyCardStatText, { color: colors.secondaryText }]}>
                  {item.workouts.length} exercises
                </Text>
              </View>
            </View>

            <View style={styles.workoutPreview}>
              {item.workouts.slice(0, 3).map((workout, index) => (
                <View
                  key={workout.id.toString()}
                  style={[
                    styles.workoutPreviewItem,
                    {
                      backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#f9fafb",
                      borderWidth: isDarkMode ? 1 : 0,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.workoutPreviewText, { color: colors.text }]} numberOfLines={1}>
                    {index + 1}. {workout.name}
                  </Text>
                </View>
              ))}
              {item.workouts.length > 3 && (
                <View
                  style={[
                    styles.workoutPreviewItem,
                    {
                      backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
                      borderWidth: 0,
                    },
                  ]}
                >
                  <Text style={[styles.workoutPreviewText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
                    +{item.workouts.length - 3} more
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.startHistoryButton,
                { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
              ]}
              onPress={() => handleStartWorkout(item.workouts)}
            >
              <Ionicons name="play" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
              <Text style={[styles.startHistoryButtonText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
                Start Workout
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderTemplateItem = ({ item, index }: { item: WorkoutTemplate; index: number }) => {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.historyCard, // Reuse historyCard style
            {
              backgroundColor: colors.card,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border,
            },
          ]}
          onPress={() => {
            setSelectedItem(item)
            setDetailModalVisible(true)
            if (Platform.OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
          }}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(255,149,0,0.15)", "rgba(255,85,0,0.05)"]
                : ["rgba(139,92,246,0.15)", "rgba(99,102,241,0.05)"]
            }
            style={styles.cardGradient}
          >
<View style={styles.historyCardHeader}>
  <Text style={[styles.historyCardTitle, { color: colors.text }]}>
    {item.title}
  </Text>
  <View style={styles.historyCardActions}>
    <View
      style={[
        styles.durationBadge,
        {
          backgroundColor: isDarkMode
            ? "rgba(255, 149, 0, 0.2)"
            : "rgba(99, 102, 241, 0.1)",
        },
      ]}
    >
      <Ionicons name="barbell-outline" size={14} color={isDarkMode ? "#FF9500" : "#6366F1"} />
      <Text style={[styles.durationText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
        {item.workouts.length} exercises
      </Text>
    </View>
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={() => {
        // Delete this template
        if (Platform.OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
      }}
    >
      <Ionicons name="trash-outline" size={16} color={isDarkMode ? "#ef4444" : "#dc2626"} />
    </TouchableOpacity>
  </View>
</View>
  
            <View style={styles.workoutPreview}>
              {item.workouts.slice(0, 3).map((workout, index) => (
                <View
                  key={workout.id.toString()}
                  style={[
                    styles.workoutPreviewItem,
                    {
                      backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#f9fafb",
                      borderWidth: isDarkMode ? 1 : 0,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.workoutPreviewText, { color: colors.text }]} numberOfLines={1}>
                    {index + 1}. {workout.name}
                  </Text>
                </View>
              ))}
  
              {item.workouts.length > 3 && (
                <View
                  style={[
                    styles.workoutPreviewItem,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(255, 149, 0, 0.2)"
                        : "rgba(99, 102, 241, 0.1)",
                      borderWidth: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.workoutPreviewText,
                      { color: isDarkMode ? "#FF9500" : "#6366F1" },
                    ]}
                  >
                    +{item.workouts.length - 3} more
                  </Text>
                </View>
              )}
            </View>
  
            <TouchableOpacity
              style={[
                styles.startHistoryButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255, 149, 0, 0.2)"
                    : "rgba(99, 102, 241, 0.1)",
                },
              ]}
              onPress={() => handleStartWorkout(item.workouts)}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
              <Text
                style={[
                  styles.startHistoryButtonText,
                  { color: isDarkMode ? "#FF9500" : "#6366F1" },
                ]}
              >
                Start Workout
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }
  

  const renderCreateTemplateCard = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.createTemplateCard,
          {
            backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#F9FAFB",
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(99, 102, 241, 0.3)",
          },
        ]}
        onPress={() => {
          setAddExerciseModalVisible(true)

          // Provide haptic feedback
          if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.createTemplateContent}>
          <View
            style={[
              styles.createTemplateIconContainer,
              { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
            ]}
          >
            <Ionicons name="add" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </View>
          <Text style={[styles.createTemplateText, { color: colors.text }]}>Create New Template</Text>
          <Text style={[styles.createTemplateSubtext, { color: colors.secondaryText }]}>
            Build a custom workout routine
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>

      {/* Tabs */}
      {/* Replace your current tab section with this */}
<View style={styles.sectionHeader}>
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === "history" && [
          styles.activeTab,
          { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
        ],
      ]}
      onPress={() => {
        setActiveTab("history")
        if (Platform.OS === "ios") {
          Haptics.selectionAsync()
        }
      }}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="time-outline" 
        size={18} 
        color={activeTab === "history" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText} 
      />
      <Text
        style={[
          styles.tabText,
          {
            color: activeTab === "history" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
          },
        ]}
      >
        History
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === "templates" && [
          styles.activeTab,
          { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
        ],
      ]}
      onPress={() => {
        setActiveTab("templates")
        if (Platform.OS === "ios") {
          Haptics.selectionAsync()
        }
      }}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="bookmark-outline" 
        size={18} 
        color={activeTab === "templates" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText} 
      />
      <Text
        style={[
          styles.tabText,
          {
            color: activeTab === "templates" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
          },
        ]}
      >
        Templates
      </Text>
    </TouchableOpacity>
  </View>
  
  {/* Section title with clear button */}
  <View style={styles.sectionTitleRow}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {activeTab === "history" ? "Recent Workouts" : "Saved Templates"}
    </Text>
    
    {((activeTab === "history" && workoutHistoryData.length > 0) || 
      (activeTab === "templates" && savedTemplatesData.length > 1)) && (
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => {
          // Implement delete functionality
          if (Platform.OS === "ios") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          }
          Alert.alert(
            activeTab === "history" ? "Clear Workout History" : "Delete All Templates",
            activeTab === "history" 
              ? "Are you sure you want to clear all workout history?" 
              : "Are you sure you want to delete all workout templates?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              { 
                text: "Delete", 
                style: "destructive",
                onPress: () => {
                  // Handle deletion
                }
              }
            ]
          );
        }}
      >
        <Text style={[styles.clearButtonText, { color: isDarkMode ? "#ef4444" : "#dc2626" }]}>
          {activeTab === "history" ? "Clear All" : "Delete All"}
        </Text>
      </TouchableOpacity>
    )}
  </View>
</View>
      {/* <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "history" && [
              styles.activeTab,
              { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
            ],
          ]}
          onPress={() => {
            setActiveTab("history")
            if (Platform.OS === "ios") {
              Haptics.selectionAsync()
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="time-outline" 
            size={18} 
            color={activeTab === "history" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText} 
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "history" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
              },
            ]}
          >
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "templates" && [
              styles.activeTab,
              { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
            ],
          ]}
          onPress={() => {
            setActiveTab("templates")
            if (Platform.OS === "ios") {
              Haptics.selectionAsync()
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="bookmark-outline" 
            size={18} 
            color={activeTab === "templates" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText} 
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "templates" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
              }, 
            ]}
          >
            Templates
          </Text>
        </TouchableOpacity>
</View> */}


 
      {/* Content */}
      {activeTab === "history" ? (
        <FlatList
          data={workoutHistoryData}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
        />
      ) : (
        <FlatList
          data={savedTemplatesData}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderCreateTemplateCard}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
        />
      )}

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={styles.blurView}>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: colors.background,
                  borderWidth: isDarkMode ? 1 : 0,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setDetailModalVisible(false)

                    // Provide haptic feedback
                    if (Platform.OS === "ios") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedItem?.title}</Text>
                <View style={{ width: 40 }} />
              </View>

              {selectedItem && (
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  {"date" in selectedItem && "calories" in selectedItem && (
                    <View style={styles.modalInfoSection}>
                      <Text style={[styles.modalInfoTitle, { color: colors.secondaryText }]}>{selectedItem.date}</Text>
                      <View style={styles.modalStats}>
                        <View
                          style={[
                            styles.modalStat,
                            {
                              backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#F9FAFB",
                              borderWidth: isDarkMode ? 1 : 0,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons name="time" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                          <Text style={[styles.modalStatValue, { color: colors.text }]}>{selectedItem.duration}</Text>
                          <Text style={[styles.modalStatLabel, { color: colors.secondaryText }]}>Duration</Text>
                        </View>

                        <View
                          style={[
                            styles.modalStat,
                            {
                              backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#F9FAFB",
                              borderWidth: isDarkMode ? 1 : 0,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons name="flame" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                          <Text style={[styles.modalStatValue, { color: colors.text }]}>{selectedItem.calories}</Text>
                          <Text style={[styles.modalStatLabel, { color: colors.secondaryText }]}>Calories</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <Text style={[styles.exercisesTitle, { color: colors.text }]}>Exercises</Text>

                  {/* Using WorkoutCard to display exercises */}
                  {selectedItem.workouts.map((workout, index) => (
                    <View key={workout.id.toString()} style={styles.workoutCardContainer}>
                      <View
                        style={[
                          styles.exerciseItem,
                          {
                            backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#F9FAFB",
                            borderWidth: isDarkMode ? 1 : 0,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.exerciseImageContainer}>
                          <Image source={workout.imageUrl || workout.image} style={styles.exerciseImage} />
                        </View>
                        <View style={styles.exerciseInfo}>
                          <Text style={[styles.exerciseName, { color: colors.text }]}>{workout.name}</Text>
                          <View style={styles.exerciseTags}>
                            <View
                              style={[
                                styles.exerciseTag,
                                { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
                              ]}
                            >
                              <Text style={[styles.exerciseTagText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
                                {workout.muscle || workout.category || "General"}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.exerciseTag,
                                { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
                              ]}
                            >
                              <Text style={[styles.exerciseTagText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
                                {workout.level || "All Levels"}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.exerciseDetails}>
                          <Text style={[styles.exerciseDetailText, { color: colors.secondaryText }]}>
                            {workout.sets || "-"} sets
                          </Text>
                          <Text style={[styles.exerciseDetailText, { color: colors.secondaryText }]}>
                            {workout.reps || "-"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
                    onPress={() => handleStartWorkout(selectedItem.workouts)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.startButtonText}>Start Workout</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Add Exercise Modal for creating templates */}
      <AddExerciseModal
        visible={addExerciseModalVisible}
        onClose={() => setAddExerciseModalVisible(false)}
        workouts={allWorkouts}
        onSelectWorkout={handleCreateTemplate}
        multipleSelection={true}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // backButton: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "rgba(255,255,255,0.2)",
  // },
  headerTitle: {
    fontSize: 24,
    alignContent: "center",
    alignItems: "center",
    fontWeight: "700",
    color: "#fff",
  },
// Update the tabContainer style
tabContainer: {
  flexDirection: "row",
  paddingHorizontal: 20,
  marginVertical: 16,
  alignItems: "center", // Make sure tabs are vertically centered
},

// Update the tab style
tab: {
  flexDirection: "row",
  alignItems: "center", // Center icon and text vertically
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  marginRight: 12,
},

// Update tabText to align properly with icon
tabText: {
  fontSize: 16,
  fontWeight: "600",
  marginLeft: 4, // Add consistent spacing from icon
},
  activeTab: {
    borderRadius: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  historyCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardGradient: {
    padding: 16,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  historyCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  historyCardDate: {
    fontSize: 14,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  historyCardStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  historyCardStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  historyCardStatText: {
    fontSize: 14,
    marginLeft: 4,
  },
  workoutPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 12,
  },
  workoutPreviewItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  workoutPreviewText: {
    fontSize: 12,
    fontWeight: "500",
  },
  startHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 12,
  },
  startHistoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  templateCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    height: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  templateGradient: {
    flex: 1,
    padding: 16,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  templateStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  templateStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  templateStatText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 4,
  },
  templateWorkouts: {
    flex: 1,
  },
  templateWorkoutItem: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  templateWorkoutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  startTemplateButton: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  startTemplateIcon: {
    marginRight: 6,
  },
  startTemplateButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  createTemplateCard: {
    borderRadius: 16,
    marginBottom: 16,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  createTemplateContent: {
    alignItems: "center",
  },
  createTemplateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  createTemplateText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  createTemplateSubtext: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 24,
  },
  blurView: {
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
    height: "80%",
  },
  modalContainer: {
    flex: 1,
    borderRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalInfoSection: {
    marginBottom: 24,
  },
  modalInfoTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalStat: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 4,
  },
  modalStatLabel: {
    fontSize: 12,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  workoutCardContainer: {
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  exerciseImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  exerciseTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  exerciseTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  exerciseDetails: {
    alignItems: "flex-end",
  },
  exerciseDetailText: {
    fontSize: 12,
    marginBottom: 2,
  },
  startButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
    flexDirection: "row",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  tabIcon: {
    marginRight: 6,
  },
  headerActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: -8, // Pull slightly higher to reduce gap after tabs
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  // Update deleteAllButton to look more consistent
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  
  // Make text consistent
  deleteAllText: {
    fontSize: 14,
    fontWeight: '600', 
    marginLeft: 6,
  },
  historyCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
  },
  // Removed duplicate definition
 
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  clearButton: {
    padding: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

export default WorkoutHistoryScreen



// "use client"

// import { useState, useContext } from "react"
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal, ScrollView, Image } from "react-native"
// import { SafeAreaView } from "react-native-safe-area-context"
// import { Ionicons } from "@expo/vector-icons"
// import { useTheme, lightTheme, darkTheme } from "@/context/ThemeContext"
// import { WorkoutContext } from "@/context/WorkoutContext"
// import { useRouter } from "expo-router"
// import { LinearGradient } from "expo-linear-gradient"
// import { BlurView } from "expo-blur"
// import AddExerciseModal from "@/components/AddExerciseModal"
// import { workouts as allWorkouts } from "@/constants/data"

// const { width } = Dimensions.get("window")

// // Sample data for workout history
// const workoutHistoryData = [
//   {
//     id: "h1",
//     date: "Today, 10:30 AM",
//     title: "Morning Workout",
//     duration: "45 min",
//     calories: 320,
//     workouts: [
//       {
//         id: "w1",
//         name: "Push-ups",
//         muscle: "Chest",
//         level: "Beginner",
//         sets: 3,
//         reps: "12-15",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w2",
//         name: "Squats",
//         muscle: "Legs",
//         level: "Beginner",
//         sets: 4,
//         reps: "10-12",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w3",
//         name: "Plank",
//         muscle: "Core",
//         level: "Beginner",
//         sets: 3,
//         reps: "30 sec",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//     ],
//   },
//   {
//     id: "h2",
//     date: "Yesterday, 6:15 PM",
//     title: "Evening Cardio",
//     duration: "30 min",
//     calories: 280,
//     workouts: [
//       {
//         id: "w4",
//         name: "Jumping Jacks",
//         muscle: "Full Body",
//         level: "Beginner",
//         sets: 3,
//         reps: "45 sec",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w5",
//         name: "Mountain Climbers",
//         muscle: "Core",
//         level: "Intermediate",
//         sets: 3,
//         reps: "30 sec",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w6",
//         name: "Burpees",
//         muscle: "Full Body",
//         level: "Advanced",
//         sets: 3,
//         reps: "10-12",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//     ],
//   },
//   {
//     id: "h3",
//     date: "May 15, 2023, 8:00 AM",
//     title: "Full Body Workout",
//     duration: "60 min",
//     calories: 420,
//     workouts: [
//       {
//         id: "w7",
//         name: "Deadlifts",
//         muscle: "Back",
//         level: "Intermediate",
//         sets: 4,
//         reps: "8-10",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w8",
//         name: "Bench Press",
//         muscle: "Chest",
//         level: "Intermediate",
//         sets: 4,
//         reps: "8-10",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w9",
//         name: "Pull-ups",
//         muscle: "Back",
//         level: "Advanced",
//         sets: 3,
//         reps: "8-10",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w10",
//         name: "Shoulder Press",
//         muscle: "Shoulders",
//         level: "Intermediate",
//         sets: 3,
//         reps: "10-12",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//     ],
//   },
// ]

// // Sample data for saved templates
// const savedTemplatesData = [
//   {
//     id: "t1",
//     title: "Upper Body Blast",
//     workouts: [
//       {
//         id: "w11",
//         name: "Bench Press",
//         muscle: "Chest",
//         level: "Intermediate",
//         sets: 4,
//         reps: "8-10",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w12",
//         name: "Shoulder Press",
//         muscle: "Shoulders",
//         level: "Intermediate",
//         sets: 3,
//         reps: "10-12",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w13",
//         name: "Bicep Curls",
//         muscle: "Arms",
//         level: "Beginner",
//         sets: 3,
//         reps: "12-15",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w14",
//         name: "Tricep Extensions",
//         muscle: "Arms",
//         level: "Beginner",
//         sets: 3,
//         reps: "12-15",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//     ],
//   },
//   {
//     id: "t2",
//     title: "Leg Day",
//     workouts: [
//       {
//         id: "w15",
//         name: "Squats",
//         muscle: "Legs",
//         level: "Intermediate",
//         sets: 4,
//         reps: "8-10",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w16",
//         name: "Lunges",
//         muscle: "Legs",
//         level: "Intermediate",
//         sets: 3,
//         reps: "10 each leg",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w17",
//         name: "Leg Press",
//         muscle: "Legs",
//         level: "Intermediate",
//         sets: 3,
//         reps: "12-15",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w18",
//         name: "Calf Raises",
//         muscle: "Legs",
//         level: "Beginner",
//         sets: 4,
//         reps: "15-20",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//     ],
//   },
//   {
//     id: "t3",
//     title: "Quick HIIT",
//     workouts: [
//       {
//         id: "w19",
//         name: "Burpees",
//         muscle: "Full Body",
//         level: "Advanced",
//         sets: 4,
//         reps: "45 sec",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w20",
//         name: "Mountain Climbers",
//         muscle: "Core",
//         level: "Intermediate",
//         sets: 4,
//         reps: "45 sec",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w21",
//         name: "Jumping Jacks",
//         muscle: "Full Body",
//         level: "Beginner",
//         sets: 4,
//         reps: "45 sec",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//       {
//         id: "w22",
//         name: "High Knees",
//         muscle: "Legs",
//         level: "Intermediate",
//         sets: 4,
//         reps: "45 sec",
//         imageUrl: require("../assets/images/placeholder.jpg"),
//       },
//     ],
//   },
// ]

// const WorkoutHistoryScreen = () => {
//   const { isDarkMode } = useTheme()
//   const colors = isDarkMode ? darkTheme : lightTheme
//   const router = useRouter()
//   const { setWorkoutPlan } = useContext(WorkoutContext)

//   const [activeTab, setActiveTab] = useState("history") // 'history' or 'templates'
//   const [selectedItem, setSelectedItem] = useState<{ workouts: any[]; title: string; date?: string; duration?: string; calories?: number } | null>(null)
//   const [detailModalVisible, setDetailModalVisible] = useState(false)
//   const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false)
//   const [newTemplate, setNewTemplate] = useState<{ id: string; name: string; muscle: string; level: string; sets: number; reps: string; imageUrl: any }[]>([])

//   // Start workout with selected workouts
//   const handleStartWorkout = (workouts: { id: string; name: string; muscle: string; level: string; sets: number; reps: string; imageUrl: any }[]) => {
//     setWorkoutPlan(
//       workouts.map((workout) => ({
//         ...workout,
//         id: Number(workout.id), // Ensure id is a number
//         category: workout.muscle, // Assuming 'muscle' maps to 'category'
//         image: workout.imageUrl, // Assuming 'imageUrl' maps to 'image'
//       }))
//     )
//     setDetailModalVisible(false)
//     router.push("/subScreen/WorkingOut")
//   }

//   // Create new template with selected workouts
//   const handleCreateTemplate = (selectedWorkouts: { id: string; name: string; muscle: string; level: string; sets: number; reps: string; imageUrl: any }[]) => {
//     setNewTemplate(selectedWorkouts)
//     setAddExerciseModalVisible(false)
//     // Here you would normally save the template to your database
//     // For now, we'll just show a success message
//     alert(`New template created with ${selectedWorkouts.length} exercises!`)
//   }

//   const renderHistoryItem = ({ item }: { item: { id: string; date: string; title: string; duration: string; calories: number; workouts: { id: string; name: string; muscle: string; level: string; sets: number; reps: string; imageUrl: any }[] } }) => (
//     <TouchableOpacity
//       style={[
//         styles.historyCard,
//         {
//           backgroundColor: colors.card,
//           borderWidth: isDarkMode ? 1 : 0,
//           borderColor: colors.border,
//         },
//       ]}
//       onPress={() => {
//         setSelectedItem(item)
//         setDetailModalVisible(true)
//       }}
//     >
//       <LinearGradient
//         colors={
//           isDarkMode
//             ? ["rgba(255,149,0,0.1)", "rgba(255,85,0,0.05)"]
//             : ["rgba(139,92,246,0.1)", "rgba(99,102,241,0.05)"]
//         }
//         style={styles.cardGradient}
//       >
//         <View style={styles.historyCardHeader}>
//           <View>
//             <Text style={[styles.historyCardTitle, { color: colors.text }]}>{item.title}</Text>
//             <Text style={[styles.historyCardDate, { color: colors.secondaryText }]}>{item.date}</Text>
//           </View>
//           <View
//             style={[
//               styles.durationBadge,
//               { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
//             ]}
//           >
//             <Ionicons name="time-outline" size={14} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.durationText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>{item.duration}</Text>
//           </View>
//         </View>

//         <View style={styles.historyCardStats}>
//           <View style={styles.historyCardStat}>
//             <Ionicons name="flame-outline" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.historyCardStatText, { color: colors.secondaryText }]}>{item.calories} calories</Text>
//           </View>
//           <View style={styles.historyCardStat}>
//             <Ionicons name="barbell-outline" size={16} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//             <Text style={[styles.historyCardStatText, { color: colors.secondaryText }]}>
//               {item.workouts.length} exercises
//             </Text>
//           </View>
//         </View>

//         <View style={styles.workoutPreview}>
//           {item.workouts.slice(0, 3).map((workout, index) => (
//             <View
//               key={workout.id}
//               style={[
//                 styles.workoutPreviewItem,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#f9fafb",
//                   borderWidth: isDarkMode ? 1 : 0,
//                   borderColor: colors.border,
//                 },
//               ]}
//             >
//               <Text style={[styles.workoutPreviewText, { color: colors.text }]} numberOfLines={1}>
//                 {index + 1}. {workout.name}
//               </Text>
//             </View>
//           ))}
//           {item.workouts.length > 3 && (
//             <View
//               style={[
//                 styles.workoutPreviewItem,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
//                   borderWidth: 0,
//                 },
//               ]}
//             >
//               <Text style={[styles.workoutPreviewText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
//                 +{item.workouts.length - 3} more
//               </Text>
//             </View>
//           )}
//         </View>
//       </LinearGradient>
//     </TouchableOpacity>
//   )

//   const renderTemplateItem = ({ item }: { item: { id: string; title: string; workouts: { id: string; name: string; muscle: string; level: string; sets: number; reps: string; imageUrl: any }[] } }) => (
//     <TouchableOpacity
//       style={[
//         styles.templateCard,
//         {
//           backgroundColor: colors.card,
//           borderWidth: isDarkMode ? 1 : 0,
//           borderColor: colors.border,
//         },
//       ]}
//       onPress={() => {
//         setSelectedItem(item)
//         setDetailModalVisible(true)
//       }}
//     >
//       <LinearGradient
//         colors={isDarkMode ? ["#FF9500", "#FF5500"] : ["#8B5CF6", "#6366F1"]}
//         style={styles.templateGradient}
//       >
//         <View style={styles.templateContent}>
//           <Text style={styles.templateTitle}>{item.title}</Text>
//           <View style={styles.templateStats}>
//             <View style={styles.templateStat}>
//               <Ionicons name="barbell-outline" size={16} color="#fff" />
//               <Text style={styles.templateStatText}>{item.workouts.length} exercises</Text>
//             </View>
//           </View>

//           <View style={styles.templateWorkouts}>
//             {item.workouts.slice(0, 3).map((workout, index) => (
//               <View key={workout.id} style={styles.templateWorkoutItem}>
//                 <Text style={styles.templateWorkoutText} numberOfLines={1}>
//                   {index + 1}. {workout.name}
//                 </Text>
//               </View>
//             ))}
//             {item.workouts.length > 3 && (
//               <View style={styles.templateWorkoutItem}>
//                 <Text style={styles.templateWorkoutText}>+{item.workouts.length - 3} more</Text>
//               </View>
//             )}
//           </View>

//           <TouchableOpacity style={styles.startTemplateButton} onPress={() => handleStartWorkout(item.workouts)}>
//             <Text style={styles.startTemplateButtonText}>Start Workout</Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>
//     </TouchableOpacity>
//   )

//   const renderCreateTemplateCard = () => (
//     <TouchableOpacity
//       style={[
//         styles.createTemplateCard,
//         {
//           backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#F9FAFB",
//           borderWidth: 1,
//           borderStyle: "dashed",
//           borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(99, 102, 241, 0.3)",
//         },
//       ]}
//       onPress={() => setAddExerciseModalVisible(true)}
//     >
//       <View style={styles.createTemplateContent}>
//         <View
//           style={[
//             styles.createTemplateIconContainer,
//             { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
//           ]}
//         >
//           <Ionicons name="add" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//         </View>
//         <Text style={[styles.createTemplateText, { color: colors.text }]}>Create New Template</Text>
//         <Text style={[styles.createTemplateSubtext, { color: colors.secondaryText }]}>
//           Build a custom workout routine
//         </Text>
//       </View>
//     </TouchableOpacity>
//   )

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
//       {/* Header with Gradient */}
//       <LinearGradient
//         colors={isDarkMode ? ["#FF9500", "#FF5500"] : ["#8B5CF6", "#6366F1", "#3B82F6"]}
//         style={styles.header}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Workout History</Text>
//         <View style={{ width: 40 }} />
//       </LinearGradient>

//       {/* Tabs */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[
//             styles.tab,
//             activeTab === "history" && [
//               styles.activeTab,
//               { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
//             ],
//           ]}
//           onPress={() => setActiveTab("history")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               {
//                 color: activeTab === "history" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
//               },
//             ]}
//           >
//             History
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.tab,
//             activeTab === "templates" && [
//               styles.activeTab,
//               { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
//             ],
//           ]}
//           onPress={() => setActiveTab("templates")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               {
//                 color: activeTab === "templates" ? (isDarkMode ? "#FF9500" : "#6366F1") : colors.secondaryText,
//               },
//             ]}
//           >
//             Templates
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Content */}
//       {activeTab === "history" ? (
//         <FlatList
//           data={workoutHistoryData}
//           renderItem={renderHistoryItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <FlatList
//           data={savedTemplatesData}
//           renderItem={renderTemplateItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ListHeaderComponent={renderCreateTemplateCard}
//         />
//       )}

//       {/* Detail Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={detailModalVisible}
//         onRequestClose={() => setDetailModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <BlurView intensity={30} tint="dark" style={styles.blurView}>
//             <View
//               style={[
//                 styles.modalContainer,
//                 {
//                   backgroundColor: colors.background,
//                   borderWidth: isDarkMode ? 1 : 0,
//                   borderColor: colors.border,
//                 },
//               ]}
//             >
//               <View style={styles.modalHeader}>
//                 <TouchableOpacity style={styles.closeButton} onPress={() => setDetailModalVisible(false)}>
//                   <Ionicons name="close" size={24} color={colors.text} />
//                 </TouchableOpacity>
//                 <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedItem?.title}</Text>
//                 <View style={{ width: 40 }} />
//               </View>

//               {selectedItem && (
//                 <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
//                   {activeTab === "history" && (
//                     <View style={styles.modalInfoSection}>
//                       <Text style={[styles.modalInfoTitle, { color: colors.secondaryText }]}>{selectedItem.date}</Text>
//                       <View style={styles.modalStats}>
//                         <View
//                           style={[
//                             styles.modalStat,
//                             {
//                               backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#F9FAFB",
//                               borderWidth: isDarkMode ? 1 : 0,
//                               borderColor: colors.border,
//                             },
//                           ]}
//                         >
//                           <Ionicons name="time" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//                           <Text style={[styles.modalStatValue, { color: colors.text }]}>{selectedItem.duration}</Text>
//                           <Text style={[styles.modalStatLabel, { color: colors.secondaryText }]}>Duration</Text>
//                         </View>

//                         <View
//                           style={[
//                             styles.modalStat,
//                             {
//                               backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#F9FAFB",
//                               borderWidth: isDarkMode ? 1 : 0,
//                               borderColor: colors.border,
//                             },
//                           ]}
//                         >
//                           <Ionicons name="flame" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
//                           <Text style={[styles.modalStatValue, { color: colors.text }]}>{selectedItem.calories}</Text>
//                           <Text style={[styles.modalStatLabel, { color: colors.secondaryText }]}>Calories</Text>
//                         </View>
//                       </View>
//                     </View>
//                   )}

//                   <Text style={[styles.exercisesTitle, { color: colors.text }]}>Exercises</Text>

//                   {/* Using WorkoutCard to display exercises */}
//                   {selectedItem.workouts.map((workout) => (
//                     <View key={workout.id} style={styles.workoutCardContainer}>
//                       <View
//                         style={[
//                           styles.exerciseItem,
//                           {
//                             backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.5)" : "#F9FAFB",
//                             borderWidth: isDarkMode ? 1 : 0,
//                             borderColor: colors.border,
//                           },
//                         ]}
//                       >
//                         <View style={styles.exerciseImageContainer}>
//                           <Image source={workout.imageUrl} style={styles.exerciseImage} />
//                         </View>
//                         <View style={styles.exerciseInfo}>
//                           <Text style={[styles.exerciseName, { color: colors.text }]}>{workout.name}</Text>
//                           <View style={styles.exerciseTags}>
//                             <View
//                               style={[
//                                 styles.exerciseTag,
//                                 { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
//                               ]}
//                             >
//                               <Text style={[styles.exerciseTagText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
//                                 {workout.muscle}
//                               </Text>
//                             </View>
//                             <View
//                               style={[
//                                 styles.exerciseTag,
//                                 { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)" },
//                               ]}
//                             >
//                               <Text style={[styles.exerciseTagText, { color: isDarkMode ? "#FF9500" : "#6366F1" }]}>
//                                 {workout.level}
//                               </Text>
//                             </View>
//                           </View>
//                         </View>
//                         <View style={styles.exerciseDetails}>
//                           <Text style={[styles.exerciseDetailText, { color: colors.secondaryText }]}>
//                             {workout.sets} sets
//                           </Text>
//                           <Text style={[styles.exerciseDetailText, { color: colors.secondaryText }]}>
//                             {workout.reps}
//                           </Text>
//                         </View>
//                       </View>
//                     </View>
//                   ))}

//                   <TouchableOpacity
//                     style={[styles.startButton, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
//                     onPress={() => handleStartWorkout(selectedItem.workouts)}
//                   >
//                     <Text style={styles.startButtonText}>Start Workout</Text>
//                   </TouchableOpacity>
//                 </ScrollView>
//               )}
//             </View>
//           </BlurView>
//         </View>
//       </Modal>

//       {/* Add Exercise Modal for creating templates */}
//       <AddExerciseModal
//         visible={addExerciseModalVisible}
//         onClose={() => setAddExerciseModalVisible(false)}
//         workouts={allWorkouts}
//         onSelectWorkout={handleCreateTemplate}
//         multipleSelection={true}
//       />
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.2)",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   tabContainer: {
//     flexDirection: "row",
//     paddingHorizontal: 20,
//     marginVertical: 16,
//   },
//   tab: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   activeTab: {
//     borderRadius: 20,
//   },
//   tabText: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   listContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 24,
//   },
//   historyCard: {
//     borderRadius: 16,
//     marginBottom: 16,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardGradient: {
//     padding: 16,
//   },
//   historyCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 12,
//   },
//   historyCardTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   historyCardDate: {
//     fontSize: 14,
//   },
//   durationBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   durationText: {
//     fontSize: 12,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   historyCardStats: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 12,
//   },
//   historyCardStat: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   historyCardStatText: {
//     fontSize: 14,
//     marginLeft: 4,
//   },
//   workoutPreview: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 8,
//   },
//   workoutPreviewItem: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   workoutPreviewText: {
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   templateCard: {
//     borderRadius: 16,
//     marginBottom: 16,
//     overflow: "hidden",
//     height: 220,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   templateGradient: {
//     flex: 1,
//     padding: 16,
//   },
//   templateContent: {
//     flex: 1,
//   },
//   templateTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 8,
//   },
//   templateStats: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 12,
//   },
//   templateStat: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   templateStatText: {
//     fontSize: 14,
//     color: "rgba(255, 255, 255, 0.8)",
//     marginLeft: 4,
//   },
//   templateWorkouts: {
//     flex: 1,
//   },
//   templateWorkoutItem: {
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//     marginBottom: 8,
//   },
//   templateWorkoutText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   startTemplateButton: {
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   startTemplateButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   createTemplateCard: {
//     borderRadius: 16,
//     marginBottom: 16,
//     height: 120,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   createTemplateContent: {
//     alignItems: "center",
//   },
//   createTemplateIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   createTemplateText: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   createTemplateSubtext: {
//     fontSize: 14,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     padding: 24,
//   },
//   blurView: {
//     borderRadius: 24,
//     overflow: "hidden",
//     width: "100%",
//     height: "80%",
//   },
//   modalContainer: {
//     flex: 1,
//     borderRadius: 24,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(0, 0, 0, 0.1)",
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   modalContent: {
//     flex: 1,
//     padding: 16,
//   },
//   modalInfoSection: {
//     marginBottom: 24,
//   },
//   modalInfoTitle: {
//     fontSize: 16,
//     marginBottom: 16,
//   },
//   modalStats: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   modalStat: {
//     flex: 1,
//     alignItems: "center",
//     padding: 12,
//     borderRadius: 16,
//     marginHorizontal: 4,
//   },
//   modalStatValue: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginVertical: 4,
//   },
//   modalStatLabel: {
//     fontSize: 12,
//   },
//   exercisesTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 16,
//   },
//   workoutCardContainer: {
//     marginBottom: 12,
//   },
//   exerciseItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     borderRadius: 12,
//   },
//   exerciseImageContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     overflow: "hidden",
//     marginRight: 12,
//   },
//   exerciseImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   exerciseInfo: {
//     flex: 1,
//   },
//   exerciseName: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   exerciseTags: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   exerciseTag: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//     marginRight: 6,
//     marginBottom: 4,
//   },
//   exerciseTagText: {
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   exerciseDetails: {
//     alignItems: "flex-end",
//   },
//   exerciseDetailText: {
//     fontSize: 12,
//     marginBottom: 2,
//   },
//   startButton: {
//     height: 56,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 24,
//     marginBottom: 16,
//   },
//   startButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// })

// export default WorkoutHistoryScreen



// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';
// import { supabase } from '../../utils/supabaseClient';

// const WorkoutHistory: React.FC = () => {
//   const [workouts, setWorkouts] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchWorkouts = async () => {
//       const { data, error } = await supabase
//         .from('workouts')
//         .select('*')
//         .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
//         .order('logged_at', { ascending: false });

//       if (error) console.error('Error fetching workouts:', error.message);
//       else setWorkouts(data);
//     };

//     fetchWorkouts();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Workout History</Text>
//       <FlatList
//         data={workouts}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.workoutItem}>
//             <Text style={styles.workoutName}>{item.workout_name}</Text>
//             <Text>Duration: {item.duration}s</Text>
//             <Text>{new Date(item.logged_at).toLocaleString()}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   workoutItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   workoutName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default WorkoutHistory;