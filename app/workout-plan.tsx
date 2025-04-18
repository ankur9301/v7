import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WorkoutContext } from '../context/WorkoutContext';
import { useContext } from 'react';
import { workouts } from '../constants/data';

const { width } = Dimensions.get('window');

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  category: string;
  level: string;
  image: string;
  sets?: number;
  reps?: string;
  weight?: number;
}

interface WorkoutDay {
  day: number;
  title: string;
  exercises: Exercise[];
  isCompleted: boolean;
  duration: string;
  calories: number;
}

// Sample workout plans data
const workoutPlans = {
  '1': {
    id: '1',
    title: '30-Day Strength',
    description: 'Build muscle and strength with this comprehensive plan',
    duration: '30 days',
    level: 'Intermediate',
    workoutsCount: 24,
    progress: 0.45,
    image: require('../assets/images/placeholder.jpg'),
    days: Array.from({ length: 30 }, (_, i) => {
      // Generate different workouts for different days
      const dayType = i % 5;
      let title, exercises;
      
      switch(dayType) {
        case 0: // Chest & Triceps
          title = 'Chest & Triceps';
          exercises = workouts.filter(w => 
            (w.muscle === 'Chest' || w.muscle === 'Triceps') && 
            w.category !== 'Pre_warmup' && 
            w.category !== 'Post_warmup'
          ).slice(0, 6);
          break;
        case 1: // Back & Biceps
          title = 'Back & Biceps';
          exercises = workouts.filter(w => 
            (w.muscle === 'Back' || w.muscle === 'Biceps') && 
            w.category !== 'Pre_warmup' && 
            w.category !== 'Post_warmup'
          ).slice(0, 6);
          break;
        case 2: // Legs & Core
          title = 'Legs & Core';
          exercises = workouts.filter(w => 
            (w.muscle === 'Legs' || w.muscle === 'Core' || w.muscle === 'Hamstrings') && 
            w.category !== 'Pre_warmup' && 
            w.category !== 'Post_warmup'
          ).slice(0, 6);
          break;
        case 3: // Shoulders & Arms
          title = 'Shoulders & Arms';
          exercises = workouts.filter(w => 
            (w.muscle === 'Shoulders' || w.muscle === 'Biceps' || w.muscle === 'Triceps') && 
            w.category !== 'Pre_warmup' && 
            w.category !== 'Post_warmup'
          ).slice(0, 6);
          break;
        case 4: // Rest Day or Light Cardio
          title = 'Active Recovery';
          exercises = workouts.filter(w => 
            w.level === 'Beginner' && 
            (w.category === 'Bodyweight' || w.category === 'Pre_warmup')
          ).slice(0, 3);
          break;
        default:
          title = 'Full Body';
          exercises = workouts.filter(w => 
            w.category !== 'Pre_warmup' && 
            w.category !== 'Post_warmup'
          ).slice(0, 6);
      }
      
      // Add sets, reps, and weight to exercises
      const exercisesWithDetails = exercises.map(ex => ({
        ...ex,
        sets: Math.floor(Math.random() * 2) + 3, // 3-4 sets
        reps: `${Math.floor(Math.random() * 4) + 8}-${Math.floor(Math.random() * 4) + 10}`, // 8-12 reps
        weight: dayType === 4 ? 0 : Math.floor(Math.random() * 20) + 10 // 10-30 kg (except for rest day)
      }));
      
      return {
        day: i + 1,
        title,
        exercises: exercisesWithDetails,
        isCompleted: i < 13, // First 13 days are completed
        duration: `${Math.floor(Math.random() * 20) + 30} min`, // 30-50 min
        calories: Math.floor(Math.random() * 200) + 200 // 200-400 calories
      };
    })
  },
  '2': {
    id: '2',
    title: 'Fat Burn Challenge',
    description: 'High intensity workouts to maximize calorie burn',
    duration: '21 days',
    level: 'Advanced',
    workoutsCount: 18,
    progress: 0.2,
    image: require('../assets/images/placeholder.jpg'),
    days: [] // Similar structure as above
  },
  '3': {
    id: '3',
    title: 'Beginner Fitness',
    description: 'Perfect for those just starting their fitness journey',
    duration: '14 days',
    level: 'Beginner',
    workoutsCount: 12,
    progress: 0.8,
    image: require('../assets/images/placeholder.jpg'),
    days: [] // Similar structure as above
  }
};

const WorkoutPlanScreen = () => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  const router = useRouter();
  const { setWorkoutPlan } = useContext(WorkoutContext);
  const params = useLocalSearchParams();
  const planId = params.id as string || '1';
  
  const [plan, setPlan] = useState(workoutPlans[planId as keyof typeof workoutPlans]);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  
  useEffect(() => {
    // Set the plan based on the ID from params
    setPlan(workoutPlans[planId as keyof typeof workoutPlans]);
  }, [planId]);
  
  const handleDayPress = (day: WorkoutDay) => {
    setSelectedDay(day);
    setShowDayDetails(true);
  };
  
  const handleStartDay = () => {
    if (selectedDay) {
      // Set the workout plan in context
      setWorkoutPlan(selectedDay.exercises);
      
      // Navigate to the WorkingOut screen
      router.push('/subScreen/WorkingOut');
    }
  };
  
  const renderDayItem = ({ item }: { item: WorkoutDay }) => (
    <TouchableOpacity 
      style={[
        styles.dayCard,
        { 
          backgroundColor: colors.card,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: colors.border,
          opacity: item.isCompleted ? 0.8 : 1
        }
      ]}
      onPress={() => handleDayPress(item)}
    >
      <View style={styles.dayCardHeader}>
        <View style={[
          styles.dayBadge,
          { 
            backgroundColor: isDarkMode 
              ? (item.isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 149, 0, 0.2)')
              : (item.isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)')
          }
        ]}>
          <Text style={[
            styles.dayBadgeText,
            { 
              color: isDarkMode 
                ? (item.isCompleted ? '#10B981' : '#FF9500')
                : (item.isCompleted ? '#10B981' : '#6366F1')
            }
          ]}>Day {item.day}</Text>
        </View>
        
        {item.isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={isDarkMode ? "#10B981" : "#10B981"} 
            />
          </View>
        )}
      </View>
      
      <Text style={[styles.dayCardTitle, { color: colors.text }]}>{item.title}</Text>
      
      <View style={styles.dayCardDetails}>
        <View style={styles.dayCardDetail}>
          <Ionicons 
            name="barbell-outline" 
            size={16} 
            color={isDarkMode ? "#FF9500" : "#6366F1"} 
          />
          <Text style={[styles.dayCardDetailText, { color: colors.secondaryText }]}>
            {item.exercises.length} exercises
          </Text>
        </View>
        <View style={styles.dayCardDetail}>
          <Ionicons 
            name="time-outline" 
            size={16} 
            color={isDarkMode ? "#FF9500" : "#6366F1"} 
          />
          <Text style={[styles.dayCardDetailText, { color: colors.secondaryText }]}>
            {item.duration}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View style={[
      styles.exerciseItem,
      { 
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
        borderWidth: isDarkMode ? 1 : 0,
        borderColor: colors.border
      }
    ]}>
      <View style={styles.exerciseImageContainer}>
        <Image 
          source={require(`../assets/images/placeholder.jpg`)} 
          style={styles.exerciseImage} 
        />
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.exerciseTags}>
          <View style={[
            styles.exerciseTag,
            { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)' }
          ]}>
            <Text style={[
              styles.exerciseTagText,
              { color: isDarkMode ? '#FF9500' : '#6366F1' }
            ]}>{item.muscle}</Text>
          </View>
          <View style={[
            styles.exerciseTag,
            { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)' }
          ]}>
            <Text style={[
              styles.exerciseTagText,
              { color: isDarkMode ? '#FF9500' : '#6366F1' }
            ]}>{item.level}</Text>
          </View>
        </View>
      </View>
      <View style={styles.exerciseDetails}>
        <Text style={[styles.exerciseDetailText, { color: colors.secondaryText }]}>
          {item.sets} sets
        </Text>
        <Text style={[styles.exerciseDetailText, { color: colors.secondaryText }]}>
          {item.reps} reps
        </Text>
        {(item.weight ?? 0) > 0 && (
          <Text style={[styles.exerciseDetailText, { color: colors.secondaryText }]}>
            {item.weight} kg
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[
            styles.backButton,
            { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)' }
          ]}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? "#fff" : "#6366F1"} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{plan.title}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Plan Overview */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.planOverviewCard,
          { 
            backgroundColor: colors.card,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: colors.border
          }
        ]}>
          <Image source={plan.image} style={styles.planImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.planImageOverlay}
          >
            <View style={styles.planStats}>
              <View style={styles.planStat}>
                <Ionicons name="calendar-outline" size={16} color="#fff" />
                <Text style={styles.planStatText}>{plan.duration}</Text>
              </View>
              <View style={styles.planStat}>
                <Ionicons name="fitness-outline" size={16} color="#fff" />
                <Text style={styles.planStatText}>{plan.level}</Text>
              </View>
              <View style={styles.planStat}>
                <Ionicons name="barbell-outline" size={16} color="#fff" />
                <Text style={styles.planStatText}>{plan.workoutsCount} workouts</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <Text style={[styles.planDescription, { color: colors.secondaryText }]}>
          {plan.description}
        </Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Your Progress</Text>
            <Text style={[styles.progressPercentage, { color: isDarkMode ? '#FF9500' : '#6366F1' }]}>
              {Math.round(plan.progress * 100)}%
            </Text>
          </View>
          
          <View style={[
            styles.progressBar,
            { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }
          ]}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${plan.progress * 100}%`,
                  backgroundColor: isDarkMode ? '#FF9500' : '#6366F1'
                }
              ]} 
            />
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Schedule</Text>
        
        <FlatList
          data={plan.days}
          renderItem={renderDayItem}
          keyExtractor={(item) => item.day.toString()}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.daysGrid}
        />
      </ScrollView>
      
      {/* Day Details Modal */}
      {selectedDay && (
        <Modal
          visible={showDayDetails}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDayDetails(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer,
              { 
                backgroundColor: colors.background,
                borderTopWidth: isDarkMode ? 1 : 0,
                borderTopColor: colors.border
              }
            ]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setShowDayDetails(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Day {selectedDay.day}: {selectedDay.title}
                </Text>
                <View style={{ width: 40 }} />
              </View>
              
              <View style={styles.dayStats}>
                <View style={[
                  styles.dayStat,
                  { 
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                    borderWidth: isDarkMode ? 1 : 0,
                    borderColor: colors.border
                  }
                ]}>
                  <Ionicons 
                    name="time" 
                    size={20} 
                    color={isDarkMode ? "#FF9500" : "#6366F1"} 
                    style={styles.dayStatIcon} 
                  />
                  <Text style={[styles.dayStatValue, { color: colors.text }]}>{selectedDay.duration}</Text>
                  <Text style={[styles.dayStatLabel, { color: colors.secondaryText }]}>Duration</Text>
                </View>
                
                <View style={[
                  styles.dayStat,
                  { 
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                    borderWidth: isDarkMode ? 1 : 0,
                    borderColor: colors.border
                  }
                ]}>
                  <Ionicons 
                    name="flame" 
                    size={20} 
                    color={isDarkMode ? "#FF9500" : "#6366F1"} 
                    style={styles.dayStatIcon} 
                  />
                  <Text style={[styles.dayStatValue, { color: colors.text }]}>{selectedDay.calories}</Text>
                  <Text style={[styles.dayStatLabel, { color: colors.secondaryText }]}>Calories</Text>
                </View>
                
                <View style={[
                  styles.dayStat,
                  { 
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                    borderWidth: isDarkMode ? 1 : 0,
                    borderColor: colors.border
                  }
                ]}>
                  <Ionicons 
                    name="barbell" 
                    size={20} 
                    color={isDarkMode ? "#FF9500" : "#6366F1"} 
                    style={styles.dayStatIcon} 
                  />
                  <Text style={[styles.dayStatValue, { color: colors.text }]}>{selectedDay.exercises.length}</Text>
                  <Text style={[styles.dayStatLabel, { color: colors.secondaryText }]}>Exercises</Text>
                </View>
              </View>
              
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Exercises</Text>
              
              <FlatList
                data={selectedDay.exercises}
                renderItem={renderExerciseItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.exercisesList}
                showsVerticalScrollIndicator={false}
              />
              
              <TouchableOpacity 
                style={[
                  styles.startButton,
                  { 
                    backgroundColor: selectedDay.isCompleted 
                      ? (isDarkMode ? '#10B981' : '#10B981') 
                      : (isDarkMode ? '#FF9500' : '#6366F1')
                  }
                ]}
                onPress={handleStartDay}
              >
                <Text style={styles.startButtonText}>
                  {selectedDay.isCompleted ? 'Repeat Workout' : 'Start Workout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// Import Modal component
import { Modal } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  planOverviewCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    marginBottom: 16,
  },
  planImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  planImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    height: '50%',
    justifyContent: 'flex-end',
  },
  planStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  planStatText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  planDescription: {
    marginHorizontal: 20,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  daysGrid: {
    paddingHorizontal: 12,
  },
  dayCard: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayCardDetails: {
    flexDirection: 'column',
    gap: 4,
  },
  dayCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCardDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayStat: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  dayStatIcon: {
    marginBottom: 8,
  },
  dayStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  exercisesList: {
    paddingBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontWeight: '500',
  },
  exerciseDetails: {
    alignItems: 'flex-end',
  },
  exerciseDetailText: {
    fontSize: 12,
    marginBottom: 2,
  },
  startButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutPlanScreen;