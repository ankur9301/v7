import React, { useContext, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  Animated,
  ScrollView,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { WorkoutContext } from '../../context/WorkoutContext'; 
import { Workout } from '../../types/types';
import { useRouter } from 'expo-router';
import Stopwatch from '../../components/Stopwatch';
import WorkoutCard from '../../components/WorkoutCard';
import WorkoutModal from '../../components/WorkoutModal';
import AddExerciseModal from '../../components/AddExerciseModal';
import { workouts as allWorkouts } from '../../constants/data';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { FlatList } from 'react-native';

const { width, height } = Dimensions.get('window');

const WorkingOut: React.FC = () => {
  const { workoutPlan, setWorkoutPlan } = useContext(WorkoutContext);
  const router = useRouter();
  const workout_count = workoutPlan.length;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [workoutToReplace, setWorkoutToReplace] = useState<Workout | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Animation on mount
  React.useEffect(() => {
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
    ]).start();
  }, []);

  /** Remove Workout */
  const handleRemoveExercise = (workout: Workout) => {
    Alert.alert(
      "Remove Exercise",
      `Are you sure you want to remove ${workout.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            setWorkoutPlan(workoutPlan.filter(w => w.id !== workout.id));
            
            // Animation for feedback
            const updatedPlan = workoutPlan.filter(w => w.id !== workout.id);
            setWorkoutPlan(updatedPlan);
            
            // Show toast or feedback
            if (Platform.OS === 'ios') {
              // Haptic feedback for iOS
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
          } 
        }
      ]
    );
  };

  /** Replace Workout */
  const handleReplaceExercise = (workout: Workout) => {
    setWorkoutToReplace(workout);
    setReplaceModalVisible(true);
  };

  /** Handle new workout selection for replacement */
  const handleReplaceWorkoutSelection = (selectedWorkouts: Workout[]) => {
    if (!workoutToReplace || selectedWorkouts.length === 0) return;

    const updatedPlan = workoutPlan.map(w =>
      w.id === workoutToReplace.id ? selectedWorkouts[0] : w
    );

    setWorkoutPlan(updatedPlan);
    setReplaceModalVisible(false);
    setWorkoutToReplace(null);
  };

  /** Handle exit confirmation */
  const handleExitPress = () => {
    setShowExitConfirm(true);
  };

  /** Handle exit confirmation */
  const handleConfirmExit = () => {
    router.back();
  };

  if (workoutPlan.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <LinearGradient
          colors={['#000000', '#1A1A1A']}
          style={styles.emptyGradient}
        >
          <Ionicons name="barbell-outline" size={64} color="rgba(255,149,0,0.3)" />
          <Text style={styles.emptyTitle}>No Workout Plan</Text>
          <Text style={styles.emptyMessage}>
            Please generate a workout plan first to start your session
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.back()}
          >
            <Text style={styles.emptyButtonText}>Go Back</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#000000', '#1A1A1A']}
        style={styles.header}
      >
        {/* Exit Button */}
        <TouchableOpacity 
          style={styles.exitButton} 
          onPress={handleExitPress}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Workout Session</Text>
        
        {/* Add Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stopwatch Section */}
      <View style={styles.stopwatchContainer}>
        <Stopwatch />
      </View>

      {/* Workout List Section */}
      <Animated.View 
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Your Exercises</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{workout_count}</Text>
          </View>
        </View>

        <FlatList
          data={workoutPlan}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          ListFooterComponent={<View style={{ height: 100 }} />}
          renderItem={({ item }) => (
            <WorkoutCard
              data={[item]} // assuming WorkoutCard accepts an array
              showMenu={true}
              onPress={() => {
                setSelectedWorkout(item);
                setModalVisible(true);
              }}
              onAddNote={() => console.log(`Adding note for ${item.name}`)}
              onReplaceExercise={handleReplaceExercise}
              onRemoveExercise={handleRemoveExercise}
            />
          )}
        />
      </Animated.View>

      {/* Workout Modal */}
      <WorkoutModal
        visible={modalVisible}
        workout={selectedWorkout}
        onClose={() => setModalVisible(false)}
      />
      
      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        workouts={allWorkouts}
        onSelectWorkout={(selected) => {
          setWorkoutPlan([...workoutPlan, ...selected]);
          setAddModalVisible(false);
        }}
        multipleSelection={true}
      />

      {/* Replace Exercise Modal */}
      <AddExerciseModal
        visible={replaceModalVisible}
        onClose={() => setReplaceModalVisible(false)}
        workouts={allWorkouts}
        onSelectWorkout={handleReplaceWorkoutSelection}
        multipleSelection={false}
      />
      
      {/* Exit Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showExitConfirm}
        onRequestClose={() => setShowExitConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.blurView}>
            <View style={styles.confirmModal}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF9500" style={styles.confirmIcon} />
              <Text style={styles.confirmTitle}>End Workout?</Text>
              <Text style={styles.confirmText}>
                Are you sure you want to end your current workout session? Your progress will be saved.
              </Text>
              
              <View style={styles.confirmButtons}>
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={() => setShowExitConfirm(false)}
                >
                  <Text style={styles.cancelButtonText}>Continue Workout</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.endButton]}
                  onPress={handleConfirmExit}
                >
                  <LinearGradient
                    colors={['#FF9500', '#FF5A00']}
                    style={styles.endButtonGradient}
                  >
                    <Text style={styles.endButtonText}>End Workout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: 'rgba(255,149,0,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FF9500',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopwatchContainer: {
    paddingVertical: 1,
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: 'rgba(255,149,0,0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  countText: {
    color: '#FF9500',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 24,
  },
  blurView: {
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
  },
  confirmModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  confirmIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'column',
    width: '100%',
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  endButton: {
    backgroundColor: '#FF9500',
  },
  endButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default WorkingOut;

// import React, { useState, useEffect, useContext } from 'react';
// import { View, Alert, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions, Animated, Easing, FlatList } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import SearchBar from '../../components/SearchBar';
// import FilterButtons from '../../components/FilterButtons';
// import DialogBox from '../../components/DialogBox';
// import WorkoutCard from '../../components/WorkoutCard';
// import WorkoutInfo from '../../components/WorkoutInfo';
// import { workouts as allWorkouts, bodyParts, categories } from '../../constants/data';
// import { Workout } from '../../types/types';
// import { generateWorkoutPlan } from '../../utils/generate_workout';
// import { useRouter } from 'expo-router';
// import { WorkoutContext } from '../../context/WorkoutContext';
// import { StatusBar } from 'expo-status-bar';
// import { BlurView } from 'expo-blur';

// // Constants
// const TIMES = ['30 Min', '45 Min', '60 Min', '90 Min', '120 Min'];
// const MUSCLES = ['Abs', 'Back', 'Biceps', 'Chest', 'Glutes', 'Hamstrings', 'Quadriceps', 'Shoulders', 'Triceps', 'Lower Back'];
// const EQUIPMENTS = ['Barbell', 'Cable', 'Dumbbell', 'Machine', 'Bodyweight'];
// const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
// type DialogType = 'time' | 'muscles' | 'equipment' | 'level' | null;

// const WorkoutScreen: React.FC = () => {
//   const router = useRouter();
//   const { setWorkoutPlan } = useContext(WorkoutContext);
//   const windowWidth = Dimensions.get('window').width;
  
//   // Animation values
//   const fadeAnim = useState(new Animated.Value(0))[0];
//   const slideAnim = useState(new Animated.Value(30))[0];
  
//   // State Variables
//   const [visibleDialog, setVisibleDialog] = useState<DialogType>(null);
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
//   const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
//   const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
//   const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
//   const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(allWorkouts);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<Workout[]>([]);
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   useEffect(() => {
//     // Animation on mount
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 500,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const isFilterActive =
//     !!selectedTime || selectedMuscles.length > 0 || selectedEquipment.length > 0 || !!selectedLevel;

//   const clearAllFilters = () => {
//     setSelectedTime(null);
//     setSelectedMuscles([]);
//     setSelectedEquipment([]);
//     setSelectedLevel(null);
//     setSearchQuery('');
//     setWorkoutPlan([]);
//   };

//   const openDialog = (type: DialogType) => {
//     setVisibleDialog(type);
//   };
  
//   const handleTimeSelect = (option: string) => {
//     if (option === selectedTime) {
//       setSelectedTime(null);
//     } else {
//       setSelectedTime(option);
//     }
//     setVisibleDialog(null);
//   };

//   const handleMultiSelect = (option: string, selectedArray: string[], setSelectedFn: Function) => {
//     if (selectedArray.includes(option)) {
//       setSelectedFn(selectedArray.filter((item: string) => item !== option));
//     } else {
//       setSelectedFn([...selectedArray, option]);
//     }
//   };

//   const handleCloseDialog = () => setVisibleDialog(null);
//   const handleSearch = (query: string) => setSearchQuery(query);

//   const getTimeLabel = () => (selectedTime ? selectedTime : 'Time');
//   const getLevelLabel = () => (selectedLevel ? selectedLevel : 'Level');
  
//   const getMuscleLabel = () => {
//     if (selectedMuscles.length === 0) return 'Muscles';
//     if (selectedMuscles.length === 1) return selectedMuscles[0];
//     return `Muscles (${selectedMuscles.length})`;
//   };
  
//   const getEquipmentLabel = () => {
//     if (selectedEquipment.length === 0) return 'Equipment';
//     if (selectedEquipment.length === 1) return selectedEquipment[0];
//     return `Equip. (${selectedEquipment.length})`;
//   };

//   useEffect(() => {
//     const applyFilters = async () => {
//       setIsLoading(true);
//       let filtered = allWorkouts;
      
//       if (selectedMuscles.length > 0) {
//         filtered = filtered.filter(workout => selectedMuscles.includes(workout.muscle));
//       }
      
//       if (selectedEquipment.length > 0) {
//         filtered = filtered.filter(workout => selectedEquipment.includes(workout.category));
//       }
      
//       if (selectedLevel) {
//         filtered = filtered.filter(workout => workout.level === selectedLevel);
//       }
      
//       if (selectedTime) {
//         try {
//           const plan = generateWorkoutPlan({
//             selectedTime,
//             selectedMuscles,
//             selectedEquipment,
//             searchQuery,
//             allWorkouts,
//             bodyParts,
//           });
          
//           setFilteredWorkouts(plan);
//           setCurrentWorkoutPlan(plan);
//           setWorkoutPlan(plan);
//           setIsLoading(false);
//           return;
//         } catch (error: any) {
//           setFilteredWorkouts([]);
//           setCurrentWorkoutPlan([]);
//           setWorkoutPlan([]);
//           Alert.alert('Error', error.message);
//           setIsLoading(false);
//           return;
//         }
//       }
      
//       if (searchQuery.trim() !== '') {
//         const lowerCaseQuery = searchQuery.toLowerCase();
//         filtered = filtered.filter(workout => workout.name.toLowerCase().includes(lowerCaseQuery));
//       }
      
//       setFilteredWorkouts(filtered);
//       setWorkoutPlan(filtered);
//       setIsLoading(false);
//     };
    
//     applyFilters();
//   }, [selectedMuscles, selectedEquipment, selectedTime, searchQuery, selectedLevel]);

//   const handleStartWorkout = () => {
//     if (currentWorkoutPlan.length > 0) {
//       router.push('/subScreen/WorkingOut');
//     } else {
//       Alert.alert('No Workout Plan', 'Please generate a workout plan before starting.');
//     }
//   };

//   const handleWorkoutPress = (workout: Workout) => {
//     setSelectedWorkout(workout);
//     setModalVisible(true);
//   };

//   const handleModalClose = () => {
//     setModalVisible(false);
//     setSelectedWorkout(null);
//   };

//   const renderContent = () => (
//     <>
//       {/* Filters Section */}
//       <View style={styles.filtersSection}>
//         <Text style={styles.sectionTitle}>Filter Workouts</Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.filtersScrollView}
//         >
//           <FilterButtons
//             onTimePress={() => openDialog('time')}
//             onMusclesPress={() => openDialog('muscles')}
//             onEquipmentPress={() => openDialog('equipment')}
//             onLevelPress={() => openDialog('level')}
//             timeLabel={getTimeLabel()}
//             muscleLabel={getMuscleLabel()}
//             equipmentLabel={getEquipmentLabel()}
//             levelLabel={getLevelLabel()}
//             isFilterActive={isFilterActive}
//             onClearAllPress={clearAllFilters}
//             enabledFilters={['time', 'muscles', 'equipment', 'level']}
//           />
//         </ScrollView>
//       </View>
      
//       {/* Results Section */}
//       <View style={styles.resultsSection}>
//         <View style={styles.resultsHeader}>
//           <Text style={styles.sectionTitle}>
//             {isLoading ? 'Loading Workouts...' : `Recommended Workouts (${filteredWorkouts.length})`}
//           </Text>
//           {isFilterActive && (
//             <TouchableOpacity onPress={clearAllFilters}>
//               <Text style={styles.clearText}>Clear all</Text>
//             </TouchableOpacity>
//           )}
//         </View>
        
//         <WorkoutCard 
//           data={filteredWorkouts} 
//           onPress={handleWorkoutPress} 
//         />
//       </View>
//     </>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="light" />
      
//       {/* Search Bar */}
//       <Animated.View 
//         style={[
//           styles.searchContainer,
//           { 
//             opacity: fadeAnim,
//             transform: [{ translateY: slideAnim }] 
//           }
//         ]}
//       >
//         <SearchBar
//           value={searchQuery}
//           onChangeText={handleSearch}
//           placeholder="Search workouts..."
//           darkMode={true}
//         />
//       </Animated.View>
      
//       {/* Main Content - Using FlatList to avoid VirtualizedList warning */}
//       <FlatList
//         data={[]}
//         renderItem={null}
//         ListHeaderComponent={renderContent}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         contentContainerStyle={styles.contentContainer}
//       />
      
//       {/* Start Workout Button - Floating */}
//       {isFilterActive && (
//         <Animated.View 
//           style={[
//             styles.startButtonContainer,
//             { 
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }] 
//             }
//           ]}
//         >
//           <TouchableOpacity 
//             style={styles.startButton}
//             activeOpacity={0.8} 
//             onPress={handleStartWorkout}
//           >
//             <LinearGradient
//               colors={['#FF9500', '#FF5A00']}
//               style={styles.buttonGradient}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//             >
//               <Ionicons name="play" size={22} color="#ffffff" style={styles.buttonIcon} />
//               <Text style={styles.startButtonText}>Start Workout</Text>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>{currentWorkoutPlan.length}</Text>
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>
//         </Animated.View>
//       )}
      
//       {/* Dialog Boxes */}
//       <DialogBox
//         visible={visibleDialog === 'muscles'}
//         options={MUSCLES}
//         onClose={handleCloseDialog}
//         onSelect={(option) => handleMultiSelect(option, selectedMuscles, setSelectedMuscles)}
//         selectedOptions={selectedMuscles}
//         multiple={true}
//         title="Select Target Muscles"
//       />
      
//       <DialogBox
//         visible={visibleDialog === 'equipment'}
//         options={EQUIPMENTS}
//         onClose={handleCloseDialog}
//         onSelect={(option) => handleMultiSelect(option, selectedEquipment, setSelectedEquipment)}
//         selectedOptions={selectedEquipment}
//         multiple={true}
//         title="Select Equipment"
//       />
      
//       <DialogBox
//         visible={visibleDialog === 'time'}
//         options={TIMES}
//         onClose={handleCloseDialog}
//         onSelect={(option) => handleTimeSelect(option)}
//         selectedOptions={selectedTime ? [selectedTime] : []}
//         multiple={false}
//         title="Workout Duration"
//       />
      
//       <DialogBox
//         visible={visibleDialog === 'level'}
//         options={LEVELS}
//         onClose={handleCloseDialog}
//         onSelect={(option) => {
//           setSelectedLevel(option);
//           setVisibleDialog(null);
//         }}
//         selectedOptions={selectedLevel ? [selectedLevel] : []}
//         multiple={false}
//         title="Select Difficulty Level"
//       />
      
//       {/* Workout Modal */}
//       <WorkoutInfo
//         visible={modalVisible}
//         workout={selectedWorkout}
//         onClose={handleModalClose}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   searchContainer: {
//     paddingHorizontal: 24,
//     paddingTop: 16,
//     paddingBottom: 12,
//     backgroundColor: '#000000',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     zIndex: 10,
//   },
//   contentContainer: {
//     paddingBottom: 100,
//   },
//   filtersSection: {
//     paddingHorizontal: 24,
//     marginBottom: 16,
//     marginTop: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     marginBottom: 12,
//   },
//   filtersScrollView: {
//     paddingRight: 24,
//   },
//   resultsSection: {
//     paddingHorizontal: 24,
//   },
//   resultsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   clearText: {
//     color: '#FF9500',
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   startButtonContainer: {
//     position: 'absolute',
//     bottom: 32,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },
//   startButton: {
//     width: '100%',
//     height: 60,
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: '#FF9500',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   buttonGradient: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//   },
//   buttonIcon: {
//     marginRight: 12,
//   },
//   startButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     fontSize: 18,
//   },
//   badge: {
//     position: 'absolute',
//     right: 24,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   badgeText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
// });

// export default WorkoutScreen;




// import React, { useContext, useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Alert, 
//   Dimensions,
//   Animated,
//   ScrollView,
//   Platform,
//   Modal
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { BlurView } from 'expo-blur';
// import { WorkoutContext } from '../../context/WorkoutContext'; 
// import { Workout } from '../../types/types';
// import { useRouter } from 'expo-router';
// import Stopwatch from '../../components/Stopwatch';
// import WorkoutCard from '../../components/WorkoutCard';
// import WorkoutModal from '../../components/WorkoutModal';
// import AddExerciseModal from '../../components/AddExerciseModal';
// import { workouts as allWorkouts } from '../../constants/data';
// import { StatusBar } from 'expo-status-bar';
// import * as Haptics from 'expo-haptics';
// import { FlatList } from 'react-native';

// const { width, height } = Dimensions.get('window');

// const WorkingOut: React.FC = () => {
//   const { workoutPlan, setWorkoutPlan } = useContext(WorkoutContext);
//   const router = useRouter();
//   const workout_count = workoutPlan.length;
  
//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(30)).current;
  
//   // Modal states
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [replaceModalVisible, setReplaceModalVisible] = useState(false);
//   const [workoutToReplace, setWorkoutToReplace] = useState<Workout | null>(null);
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
//   const [showExitConfirm, setShowExitConfirm] = useState(false);

//   // Animation on mount
//   React.useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   /** Remove Workout */
//   const handleRemoveExercise = (workout: Workout) => {
//     Alert.alert(
//       "Remove Exercise",
//       `Are you sure you want to remove ${workout.name}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Remove", 
//           style: "destructive",
//           onPress: () => {
//             setWorkoutPlan(workoutPlan.filter(w => w.id !== workout.id));
            
//             // Animation for feedback
//             const updatedPlan = workoutPlan.filter(w => w.id !== workout.id);
//             setWorkoutPlan(updatedPlan);
            
//             // Show toast or feedback
//             if (Platform.OS === 'ios') {
//               // Haptic feedback for iOS
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
//             }
//           } 
//         }
//       ]
//     );
//   };

//   /** Replace Workout */
//   const handleReplaceExercise = (workout: Workout) => {
//     setWorkoutToReplace(workout);
//     setReplaceModalVisible(true);
//   };

//   /** Handle new workout selection for replacement */
//   const handleReplaceWorkoutSelection = (selectedWorkouts: Workout[]) => {
//     if (!workoutToReplace || selectedWorkouts.length === 0) return;

//     const updatedPlan = workoutPlan.map(w =>
//       w.id === workoutToReplace.id ? selectedWorkouts[0] : w
//     );

//     setWorkoutPlan(updatedPlan);
//     setReplaceModalVisible(false);
//     setWorkoutToReplace(null);
//   };

//   /** Handle exit confirmation */
//   const handleExitPress = () => {
//     setShowExitConfirm(true);
//   };

//   /** Handle exit confirmation */
//   const handleConfirmExit = () => {
//     router.back();
//   };

//   if (workoutPlan.length === 0) {
//     return (
//       <SafeAreaView style={styles.emptyContainer}>
//         <LinearGradient
//           colors={['#8B5CF6', '#6366F1', '#3B82F6']}
//           style={styles.emptyGradient}
//         >
//           <Ionicons name="barbell-outline" size={64} color="rgba(255,255,255,0.3)" />
//           <Text style={styles.emptyTitle}>No Workout Plan</Text>
//           <Text style={styles.emptyMessage}>
//             Please generate a workout plan first to start your session
//           </Text>
//           <TouchableOpacity 
//             style={styles.emptyButton}
//             onPress={() => router.back()}
//           >
//             <Text style={styles.emptyButtonText}>Go Back</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar style="light" />
      
//       {/* Header with Gradient */}
//       <LinearGradient
//         colors={['#8B5CF6', '#6366F1', '#3B82F6']}
//         style={styles.header}
//       >
//         {/* Exit Button */}
//         <TouchableOpacity 
//           style={styles.exitButton} 
//           onPress={handleExitPress}
//         >
//           <Ionicons name="close" size={24} color="#fff" />
//         </TouchableOpacity>
        
//         <Text style={styles.headerTitle}>Workout Session</Text>
        
//         {/* Add Button */}
//         <TouchableOpacity 
//           style={styles.addButton} 
//           onPress={() => setAddModalVisible(true)}
//         >
//           <Ionicons name="add" size={24} color="#fff" />
//         </TouchableOpacity>
//       </LinearGradient>

//       {/* Stopwatch Section */}
//       <View style={styles.stopwatchContainer}>
//         <Stopwatch />
//       </View>

//       {/* Workout List Section */}
//       <Animated.View 
//         style={[
//           styles.listContainer,
//           {
//             opacity: fadeAnim,
//             transform: [{ translateY: slideAnim }]
//           }
//         ]}
//       >
//         <View style={styles.listHeader}>
//           <Text style={styles.listTitle}>Your Exercises</Text>
//           <View style={styles.countBadge}>
//             <Text style={styles.countText}>{workout_count}</Text>
//           </View>
//         </View>

//         <FlatList
//   data={workoutPlan}
//   keyExtractor={(item) => item.id.toString()}
//   showsVerticalScrollIndicator={false}
//   contentContainerStyle={styles.scrollContent}
//   ListFooterComponent={<View style={{ height: 100 }} />}
//   renderItem={({ item }) => (
//     <WorkoutCard
//       data={[item]} // assuming WorkoutCard accepts an array
//       showMenu={true}
//       onPress={() => {
//         setSelectedWorkout(item);
//         setModalVisible(true);
//       }}
//       onAddNote={() => console.log(`Adding note for ${item.name}`)}
//       onReplaceExercise={handleReplaceExercise}
//       onRemoveExercise={handleRemoveExercise}
//     />
//   )}
// />
        
//         {/* <ScrollView 
//           style={styles.scrollContainer}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//         >
          
//           <WorkoutCard
//             data={workoutPlan}
//             showMenu={true}
//             onPress={(workout) => {
//               setSelectedWorkout(workout);
//               setModalVisible(true);
//             }}
//             onAddNote={(workout) => console.log(`Adding note for ${workout.name}`)}
//             onReplaceExercise={handleReplaceExercise}
//             onRemoveExercise={handleRemoveExercise}
//           />
          

        
//         </ScrollView> */}
//       </Animated.View>

//       {/* Workout Modal */}
//       <WorkoutModal
//         visible={modalVisible}
//         workout={selectedWorkout}
//         onClose={() => setModalVisible(false)}
//       />
      
//       {/* Add Exercise Modal */}
//       <AddExerciseModal
//         visible={addModalVisible}
//         onClose={() => setAddModalVisible(false)}
//         workouts={allWorkouts}
//         onSelectWorkout={(selected) => {
//           setWorkoutPlan([...workoutPlan, ...selected]);
//           setAddModalVisible(false);
//         }}
//         multipleSelection={true}
//       />

//       {/* Replace Exercise Modal */}
//       <AddExerciseModal
//         visible={replaceModalVisible}
//         onClose={() => setReplaceModalVisible(false)}
//         workouts={allWorkouts}
//         onSelectWorkout={handleReplaceWorkoutSelection}
//         multipleSelection={false}
//       />
      
//       {/* Exit Confirmation Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={showExitConfirm}
//         onRequestClose={() => setShowExitConfirm(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <BlurView intensity={30} tint="dark" style={styles.blurView}>
//             <View style={styles.confirmModal}>
//               <Ionicons name="alert-circle-outline" size={48} color="#8B5CF6" style={styles.confirmIcon} />
//               <Text style={styles.confirmTitle}>End Workout?</Text>
//               <Text style={styles.confirmText}>
//                 Are you sure you want to end your current workout session? Your progress will be saved.
//               </Text>
              
//               <View style={styles.confirmButtons}>
//                 <TouchableOpacity 
//                   style={[styles.confirmButton, styles.cancelButton]}
//                   onPress={() => setShowExitConfirm(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Continue Workout</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={[styles.confirmButton, styles.endButton]}
//                   onPress={handleConfirmExit}
//                 >
//                   <LinearGradient
//                     colors={['#EF4444', '#DC2626']}
//                     style={styles.endButtonGradient}
//                   >
//                     <Text style={styles.endButtonText}>End Workout</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </BlurView>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   emptyContainer: {
//     flex: 1,
//   },
//   emptyGradient: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   emptyTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#fff',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyMessage: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.8)',
//     textAlign: 'center',
//     marginBottom: 32,
//   },
//   emptyButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//   },
//   emptyButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   exitButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   addButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   stopwatchContainer: {
//     paddingVertical: 1,
//     backgroundColor: '#fff',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   listContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//   },
//   listHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   listTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1F2937',
//   },
//   countBadge: {
//     backgroundColor: '#C7D2FE',
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   countText: {
//     color: '#4338CA',
//     fontWeight: '700',
//     fontSize: 14,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 24,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     padding: 24,
//   },
//   blurView: {
//     borderRadius: 24,
//     overflow: 'hidden',
//     width: '100%',
//   },
//   confirmModal: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 24,
//     alignItems: 'center',
//     width: '100%',
//   },
//   confirmIcon: {
//     marginBottom: 16,
//   },
//   confirmTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 8,
//   },
//   confirmText: {
//     fontSize: 16,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   confirmButtons: {
//     flexDirection: 'column',
//     width: '100%',
//   },
//   confirmButton: {
//     height: 56,
//     borderRadius: 16,
//     marginVertical: 8,
//     overflow: 'hidden',
//   },
//   cancelButton: {
//     backgroundColor: '#EEF2FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: '#4F46E5',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   endButton: {
//     backgroundColor: '#EF4444',
//   },
//   endButtonGradient: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   endButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default WorkingOut;



// import React, { useContext, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Alert, 
//   Dimensions
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { WorkoutContext } from '../../context/WorkoutContext'; 
// import { Workout } from '../../types/types';
// import { useRouter } from 'expo-router';
// import Stopwatch from '../../components/Stopwatch';
// import WorkoutCard from '../../components/WorkoutCard';
// import WorkoutModal from '../../components/WorkoutModal';
// import AddExerciseModal from '../../components/AddExerciseModal';
// import { workouts as allWorkouts } from '../../constants/data';

// const { height } = Dimensions.get('window');

// const WorkingOut: React.FC = () => {
//   const { workoutPlan, setWorkoutPlan } = useContext(WorkoutContext);
//   const router = useRouter();
//   const workout_count = workoutPlan.length;
  
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [replaceModalVisible, setReplaceModalVisible] = useState(false);
//   const [workoutToReplace, setWorkoutToReplace] = useState<Workout | null>(null);

//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

//   /** Remove Workout */
//   const handleRemoveExercise = (workout: Workout) => {
//     Alert.alert(
//       "Confirm Removal",
//       `Are you sure you want to remove ${workout.name}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Remove", 
//           onPress: () => {
//             setWorkoutPlan(workoutPlan.filter(w => w.id !== workout.id));
//             Alert.alert("Workout Removed", `${workout.name} has been removed.`);
//           } 
//         }
//       ]
//     );
//   };

//   /** Replace Workout */
//   const handleReplaceExercise = (workout: Workout) => {
//     setWorkoutToReplace(workout);
//     setReplaceModalVisible(true);
//   };

//   /** Handle new workout selection for replacement */
//   const handleReplaceWorkoutSelection = (selectedWorkouts: Workout[]) => {
//     if (!workoutToReplace || selectedWorkouts.length === 0) return;

//     const updatedPlan = workoutPlan.map(w =>
//       w.id === workoutToReplace.id ? selectedWorkouts[0] : w
//     );

//     setWorkoutPlan(updatedPlan);
//     setReplaceModalVisible(false);
//     setWorkoutToReplace(null);
//     Alert.alert("Workout Replaced", `${workoutToReplace.name} has been replaced.`);
//   };

//   if (workoutPlan.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.message}>No workout plan found. Please generate a workout plan first.</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* Exit Button */}
//       <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
//         <Text style={styles.exitButtonText}>X</Text>
//       </TouchableOpacity>

//       {/* Stopwatch Section */}
//       <View style={styles.stopwatchContainer}>
//         <Stopwatch />
//       </View>

//       {/* Workout List Section */}
//       <View style={styles.listContainer}>
//         <Text style={styles.title}>{workout_count} exercises</Text>
//         {/* Add Button */}
//         <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
//           <Text style={styles.addButtonText}>+</Text>
//         </TouchableOpacity>
        
//         {/* Workout Cards with Menu */}
//         <WorkoutCard
//           data={workoutPlan}
//           showMenu={true}
//           onPress={(workout) => {
//             setSelectedWorkout(workout);
//             setModalVisible(true);
//           }}
//           onAddNote={(workout) => console.log(`Adding note for ${workout.name}`)}
//           onReplaceExercise={handleReplaceExercise}
//           onRemoveExercise={handleRemoveExercise}
//         />
//       </View>

//       {/* Workout Modal */}
//       <WorkoutModal
//         visible={modalVisible}
//         workout={selectedWorkout}
//         onClose={() => setModalVisible(false)}
//       />
      
//       {/* Add Exercise Modal */}
//       <AddExerciseModal
//         visible={addModalVisible}
//         onClose={() => setAddModalVisible(false)}
//         workouts={allWorkouts}
//         onSelectWorkout={(selected) => setWorkoutPlan([...workoutPlan, ...selected])}
//         multipleSelection={true}
//       />

//       {/* Replace Exercise Modal */}
//       <AddExerciseModal
//         visible={replaceModalVisible}
//         onClose={() => setReplaceModalVisible(false)}
//         workouts={allWorkouts}
//         onSelectWorkout={handleReplaceWorkoutSelection}
//         multipleSelection={false} // Only allow replacing with one workout
//       />

//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f7fafc', 
//   },
//   exitButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//     backgroundColor: '#ef4444',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   exitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   addButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     zIndex: 10,
//     backgroundColor: '#10B981',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 24,
//     lineHeight: 24,
//   },
//   stopwatchContainer: {
//     height: height * 0.25, 
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContainer: {
//     flex: 1, 
//     paddingHorizontal:8,
//     paddingTop: 8,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginTop: 16,
//     marginBottom: 16,
//     marginLeft: 8,
//     textAlign: 'left',
//     color: '#1f2937',
//   },
//   message: {
//     fontSize: 18,
//     textAlign: 'center',
//     color: '#6b7280',
//     marginTop: 20,
//   },
// });

// export default WorkingOut;







// import React, { useContext, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Alert, 
//   Dimensions
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { WorkoutContext } from '../../context/WorkoutContext'; 
// import { Workout } from '../../types/types';
// import { useRouter } from 'expo-router';
// import Stopwatch from '../../components/Stopwatch';
// import WorkoutCard from '../../components/WorkoutCard';
// import WorkoutModal from '../../components/WorkoutModal';
// import AddExerciseModal from '../../components/AddExerciseModal';
// import { workouts as allWorkouts } from '../../constants/data';

// const { height } = Dimensions.get('window');

// const WorkingOut: React.FC = () => {
//   const { workoutPlan, setWorkoutPlan } = useContext(WorkoutContext);
//   const router = useRouter();
//   const workout_count = workoutPlan.length;
  
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [replaceModalVisible, setReplaceModalVisible] = useState(false);
//   const [workoutToReplace, setWorkoutToReplace] = useState<Workout | null>(null);

//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

//   /** Remove Workout */
//   const handleRemoveExercise = (workout: Workout) => {
//     Alert.alert(
//       "Confirm Removal",
//       `Are you sure you want to remove ${workout.name}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Remove", 
//           onPress: () => {
//             setWorkoutPlan(workoutPlan.filter(w => w.id !== workout.id));
//             Alert.alert("Workout Removed", `${workout.name} has been removed.`);
//           } 
//         }
//       ]
//     );
//   };

//   /** Replace Workout */
//   const handleReplaceExercise = (workout: Workout) => {
//     setWorkoutToReplace(workout);
//     setReplaceModalVisible(true);
//   };

//   /** Handle new workout selection for replacement */
//   const handleReplaceWorkoutSelection = (selectedWorkouts: Workout[]) => {
//     if (!workoutToReplace || selectedWorkouts.length === 0) return;

//     const updatedPlan = workoutPlan.map(w =>
//       w.id === workoutToReplace.id ? selectedWorkouts[0] : w
//     );

//     setWorkoutPlan(updatedPlan);
//     setReplaceModalVisible(false);
//     setWorkoutToReplace(null);
//     Alert.alert("Workout Replaced", `${workoutToReplace.name} has been replaced.`);
//   };

//   if (workoutPlan.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.message}>No workout plan found. Please generate a workout plan first.</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* Exit Button */}
//       <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
//         <Text style={styles.exitButtonText}>X</Text>
//       </TouchableOpacity>

//       {/* Stopwatch Section */}
//       <View style={styles.stopwatchContainer}>
//         <Stopwatch />
//       </View>

//       {/* Workout List Section */}
//       <View style={styles.listContainer}>
//         <Text style={styles.title}>{workout_count} exercises</Text>
//         {/* Add Button */}
//         <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
//           <Text style={styles.addButtonText}>+</Text>
//         </TouchableOpacity>
        
//         {/* Workout Cards with Menu */}
//         <WorkoutCard
//           data={workoutPlan}
//           showMenu={true}
//           onPress={(workout) => {
//             setSelectedWorkout(workout);
//             setModalVisible(true);
//           }}
//           onAddNote={(workout) => console.log(`Adding note for ${workout.name}`)}
//           onReplaceExercise={handleReplaceExercise}
//           onRemoveExercise={handleRemoveExercise}
//         />
//       </View>

//       {/* Workout Modal */}
//       <WorkoutModal
//         visible={modalVisible}
//         workout={selectedWorkout}
//         onClose={() => setModalVisible(false)}
//       />
      
//       {/* Add Exercise Modal */}
//       <AddExerciseModal
//         visible={addModalVisible}
//         onClose={() => setAddModalVisible(false)}
//         workouts={allWorkouts}
//         onSelectWorkout={(selected) => setWorkoutPlan([...workoutPlan, ...selected])}
//         multipleSelection={true}
//       />

//       {/* Replace Exercise Modal */}
//       <AddExerciseModal
//         visible={replaceModalVisible}
//         onClose={() => setReplaceModalVisible(false)}
//         workouts={allWorkouts}
//         onSelectWorkout={handleReplaceWorkoutSelection}
//         multipleSelection={false} // Only allow replacing with one workout
//       />

//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f7fafc', 
//   },
//   exitButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//     backgroundColor: '#ef4444',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   exitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   addButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     zIndex: 10,
//     backgroundColor: '#10B981',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 24,
//     lineHeight: 24,
//   },
//   stopwatchContainer: {
//     height: height * 0.25, 
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContainer: {
//     flex: 1, 
//     paddingHorizontal:8,
//     paddingTop: 8,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginTop: 16,
//     marginBottom: 16,
//     marginLeft: 8,
//     textAlign: 'left',
//     color: '#1f2937',
//   },
//   message: {
//     fontSize: 18,
//     textAlign: 'center',
//     color: '#6b7280',
//     marginTop: 20,
//   },
// });

// export default WorkingOut;



// // app/subScreen/WorkingOut.tsx

// import React, { useContext, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Alert, 
//   Dimensions, 
//   Modal 
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { WorkoutContext } from '../../context/WorkoutContext'; // Adjust the path as needed
// import { Workout } from '../../types/types';
// import { useRouter } from 'expo-router';
// import Stopwatch from '../../components/Stopwatch'; // Ensure correct path
// import WorkoutCard from '../../components/WorkoutCard'; // Import WorkoutCard
// import WorkoutModal from '../../components/WorkoutModal'; // Import WorkoutModal
// import AddExerciseModal from '../../components/AddExerciseModal'; // Import the refactored modal



// const { height } = Dimensions.get('window');

// const WorkingOut: React.FC = () => {
//   const { workoutPlan, setWorkoutPlan } = useContext(WorkoutContext);
//   const router = useRouter();
//   const workout_count = workoutPlan.length;
  
//   const [addModalVisible, setAddModalVisible] = useState(false);
  
//   // State for Workout Modal
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

//   const handleAddButtonPress = () => {
//     setAddModalVisible(true);
//     // router.push('./WorkoutEntry'); // Remove or comment out navigation
//   };

//   const handleCloseAddModal = () => {
//     setAddModalVisible(false);
//   };

//   const handleCompleteWorkout = (workout: Workout) => {
//     Alert.alert('Workout Completed', `You have completed ${workout.name}!`);
//     // Optionally, update the workoutPlan to mark as completed or remove
//     // For example:
//     // setWorkoutPlan(workoutPlan.filter(w => w.id !== workout.id));
//   };

//   // Handler for WorkoutCard Press
//   const handleWorkoutPress = (workout: Workout) => {
//     setSelectedWorkout(workout);
//     setModalVisible(true);
//   };

//   // Handler to close WorkoutModal
//   const handleModalClose = () => {
//     setModalVisible(false);
//     setSelectedWorkout(null);
//   };

//   // Handler to close AddExerciseModal
//   const handleAddExerciseModalClose = () => {
//     setAddModalVisible(false);
//   };
  
//   if (workoutPlan.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.message}>No workout plan found. Please generate a workout plan first.</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* Exit Button */}
//       <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
//         <Text style={styles.exitButtonText}>X</Text>
//       </TouchableOpacity>

//       {/* Stopwatch Section */}
//       <View style={styles.stopwatchContainer}>
//         <Stopwatch />
//       </View>

//       {/* Workout List Section */}
//       <View style={styles.listContainer}>
//         <Text style={styles.title}>{workout_count} exercises</Text>
//         {/* Add Button */}
//         <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
//           <Text style={styles.addButtonText}>+</Text>
//         </TouchableOpacity>
        
//         {/* Workout Cards */}
//         <WorkoutCard data={workoutPlan} onPress={handleWorkoutPress} />
//       </View>

//       {/* Workout Modal */}
//       <WorkoutModal
//         visible={modalVisible}
//         workout={selectedWorkout}
//         onClose={handleModalClose}
//       />
      
//       {/* Add Exercise Modal */}
//       {/* <Modal
//         animationType="slide"
//         transparent={true}
//         visible={addModalVisible}
//         onRequestClose={handleAddExerciseModalClose}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Welcome to Add Exercise!</Text>
          
//             <TouchableOpacity style={styles.closeModalButton} onPress={handleAddExerciseModalClose}>
//               <Text style={styles.closeModalButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal> */}

//      {/* Add Exercise Modal */}
//            <AddExerciseModal
//              visible={addModalVisible}
//              onClose={handleAddExerciseModalClose}
//              workouts={allWorkouts} // Pass all workouts or filtered as needed
//              onSelectWorkout={handleSelectWorkouts}
//              multipleSelection={true} // Set to false for single selection
//            />

//       {/* Start Workout Button (Optional) */}
//       {/* You might not need another Start Workout button here since the workout has already started */}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f7fafc', // Light background for contrast
//   },
//   exitButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//     backgroundColor: '#ef4444',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   exitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   addButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     zIndex: 10,
//     backgroundColor: '#10B981',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 24,
//     lineHeight: 24,
//   },
//   stopwatchContainer: {
//     height: height * 0.25, // 25% of the screen height
//     justifyContent: 'center',
//     alignItems: 'center',
//     // backgroundColor: '#e0f2fe', // Optional: Light blue background for the stopwatch section
//   },
//   listContainer: {
//     flex: 1, // Remaining 75% of the screen
//     paddingHorizontal:8,
//     paddingTop: 8,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginTop: 16,
//     marginBottom: 16,
//     marginLeft: 8,
//     textAlign: 'left',
//     color: '#1f2937',
//   },
//   message: {
//     fontSize: 18,
//     textAlign: 'center',
//     color: '#6b7280',
//     marginTop: 20,
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 10, // For Android shadow
//     shadowColor: '#000', // For iOS shadow
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#1f2937',
//   },
//   closeModalButton: {
//     marginTop: 20,
//     backgroundColor: '#10B981',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//   },
//   closeModalButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default WorkingOut;




// // app/subScreen/WorkingOut.tsx

// import React, { useContext, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Modal } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { WorkoutContext } from '../../context/WorkoutContext'; // Adjust the path as needed
// import { Workout } from '../../types/types';
// import { useRouter } from 'expo-router';
// import Stopwatch from '../../components/Stopwatch'; // Ensure correct path
// import WorkoutCard from '../../components/WorkoutCard'; // Import WorkoutCard
// import WorkoutModal from '../../components/WorkoutModal'; // Import WorkoutModal
// // import AddExerciseModal from '../../components/AddExerciseModal'; // Import WorkoutModal

// const { height } = Dimensions.get('window');

// const WorkingOut: React.FC = () => {
//   const { workoutPlan, setWorkoutPlan } = useContext(WorkoutContext);
//   const router = useRouter();
//   const workout_count = workoutPlan.length;
  
//   const [addModalVisible, setAddModalVisible] = useState(false);
  
//   // State for Workout Modal
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

//   const handleAddButtonPress = () => {
//     setAddModalVisible(true);
//     router.push('./AddExerciseModal');
//   };

//   const handleCloseAddModal = () => {
//     setAddModalVisible(false);
//   };

//   const handleCompleteWorkout = (workout: Workout) => {
//     Alert.alert('Workout Completed', `You have completed ${workout.name}!`);
//     // Optionally, update the workoutPlan to mark as completed or remove
//     // For example:
//     // setWorkoutPlan(workoutPlan.filter(w => w.id !== workout.id));
//   };

//   // Handler for WorkoutCard Press
//   const handleWorkoutPress = (workout: Workout) => {
//     setSelectedWorkout(workout);
//     setModalVisible(true);
//   };

//   // Handler to close WorkoutModal
//   const handleModalClose = () => {
//     setModalVisible(false);
//     setSelectedWorkout(null);
//   };

  
//   if (workoutPlan.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.message}>No workout plan found. Please generate a workout plan first.</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* Exit Button */}
//       <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
//         <Text style={styles.exitButtonText}>X</Text>
//       </TouchableOpacity>

//       {/* Stopwatch Section */}
//       <View style={styles.stopwatchContainer}>
//         <Stopwatch />
//       </View>

//       {/* Workout List Section */}
//       <View style={styles.listContainer}>
//         <Text style={styles.title}>{workout_count} exercises</Text>
//         {/* Add Button */}
//         <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
//           <Text style={styles.addButtonText}>+</Text>
//         </TouchableOpacity>
        
//         {/* Workout Cards */}
//         <WorkoutCard data={workoutPlan} onPress={handleWorkoutPress} />
//       </View>


//       {/* Add Exercises Modal */}
  

//       {/* Workout Modal */}
//       <WorkoutModal
//         visible={modalVisible}
//         workout={selectedWorkout}
//         onClose={handleModalClose}
//       />
      
//       {/* Start Workout Button (Optional) */}
//       {/* You might not need another Start Workout button here since the workout has already started */}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f7fafc', // Light background for contrast
//   },
//   exitButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//     backgroundColor: '#ef4444',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   exitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   addButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     zIndex: 10,
//     backgroundColor: '#10B981',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 24,
//     lineHeight: 24,
//   },
//   stopwatchContainer: {
//     height: height * 0.25, // 25% of the screen height
//     justifyContent: 'center',
//     alignItems: 'center',
//     // backgroundColor: '#e0f2fe', // Optional: Light blue background for the stopwatch section
//   },
//   listContainer: {
//     flex: 1, // Remaining 75% of the screen
//     paddingHorizontal:8,
//     paddingTop: 8,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginTop: 16,
//     marginBottom: 16,
//     marginLeft: 8,
//     textAlign: 'left',
//     color: '#1f2937',
//   },
//   message: {
//     fontSize: 18,
//     textAlign: 'center',
//     color: '#6b7280',
//     marginTop: 20,
//   },
// });

// export default WorkingOut; 