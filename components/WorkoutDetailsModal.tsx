import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { WorkoutContext } from '../context/WorkoutContext';
import { useContext } from 'react';

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  category: string;
  level: string;
  image: string;
  sets?: number;
  reps?: number;
  weight?: number;
}

interface WorkoutDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  workout: {
    id: string;
    title: string;
    level: string;
    duration: string;
    exercises: Exercise[];
    totalCalories: number;
    image: any;
  } | null;
}

const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ visible, onClose, workout }) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  const router = useRouter();
  const { setWorkoutPlan } = useContext(WorkoutContext);
  
  if (!workout) return null;
  
  const handleStartWorkout = () => {
    // Set the workout plan in context
    setWorkoutPlan(workout.exercises);
    
    // Close the modal
    onClose();
    
    // Navigate to the WorkingOut screen
    router.push('/subScreen/WorkingOut');
  };
  
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
          {item.sets || 3} sets
        </Text>
        <Text style={[styles.exerciseDetailText, { color: colors.secondaryText }]}>
          {item.reps || '10-12'} reps
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
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
          {/* Header with image */}
          <View style={styles.headerImageContainer}>
            <Image source={workout.image} style={styles.headerImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.headerOverlay}
            >
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.workoutHeaderInfo}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <View style={styles.workoutHeaderDetails}>
                  <View style={styles.workoutHeaderDetail}>
                    <Ionicons name="time-outline" size={16} color="#fff" />
                    <Text style={styles.workoutHeaderDetailText}>{workout.duration}</Text>
                  </View>
                  <View style={styles.workoutHeaderDetail}>
                    <Ionicons name="flame-outline" size={16} color="#fff" />
                    <Text style={styles.workoutHeaderDetailText}>{workout.totalCalories} cal</Text>
                  </View>
                  <View style={styles.workoutHeaderDetail}>
                    <Ionicons name="barbell-outline" size={16} color="#fff" />
                    <Text style={styles.workoutHeaderDetailText}>{workout.exercises.length} exercises</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
          
          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercises</Text>
            
            <FlatList
              data={workout.exercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.exercisesList}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity 
              style={[
                styles.startButton,
                { backgroundColor: isDarkMode ? '#FF9500' : '#6366F1' }
              ]}
              onPress={handleStartWorkout}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  headerImageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    padding: 16,
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutHeaderInfo: {
    marginBottom: 16,
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  workoutHeaderDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workoutHeaderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  workoutHeaderDetailText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
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

export default WorkoutDetailsModal;