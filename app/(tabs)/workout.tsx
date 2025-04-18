// app/(tabs)/workout.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions, Animated, Easing, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../components/SearchBar';
import FilterButtons from '../../components/FilterButtons';
import DialogBox from '../../components/DialogBox';
import WorkoutCard from '../../components/WorkoutCard';
import WorkoutInfo from '../../components/WorkoutInfo';
import { workouts as allWorkouts, bodyParts, categories } from '../../constants/data';
import { Workout } from '../../types/types';
import { generateWorkoutPlan } from '../../utils/generate_workout';
import { useRouter } from 'expo-router';
import { WorkoutContext } from '../../context/WorkoutContext';
import { StatusBar } from 'expo-status-bar';

// Constants
const TIMES = ['30 Min', '45 Min', '60 Min', '90 Min', '120 Min'];
const MUSCLES = ['Abs', 'Back', 'Biceps', 'Chest', 'Glutes', 'Hamstrings', 'Quadriceps', 'Shoulders', 'Triceps', 'Lower Back'];
const EQUIPMENTS = ['Barbell', 'Cable', 'Dumbbell', 'Machine', 'Bodyweight'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
type DialogType = 'time' | 'muscles' | 'equipment' | 'level' | null;

const WorkoutScreen: React.FC = () => {
  const router = useRouter();
  const { setWorkoutPlan } = useContext(WorkoutContext);
  const windowWidth = Dimensions.get('window').width;
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  
  // State Variables
  const [visibleDialog, setVisibleDialog] = useState<DialogType>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(allWorkouts);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isFilterActive =
    !!selectedTime || selectedMuscles.length > 0 || selectedEquipment.length > 0 || !!selectedLevel;

  const clearAllFilters = () => {
    setSelectedTime(null);
    setSelectedMuscles([]);
    setSelectedEquipment([]);
    setSelectedLevel(null);
    setSearchQuery('');
    setWorkoutPlan([]);
  };

  const openDialog = (type: DialogType) => {
    setVisibleDialog(type);
  };
  
  const handleTimeSelect = (option: string) => {
    if (option === selectedTime) {
      setSelectedTime(null);
    } else {
      setSelectedTime(option);
    }
    setVisibleDialog(null);
  };

  const handleMultiSelect = (option: string, selectedArray: string[], setSelectedFn: Function) => {
    if (selectedArray.includes(option)) {
      setSelectedFn(selectedArray.filter((item: string) => item !== option));
    } else {
      setSelectedFn([...selectedArray, option]);
    }
  };

  const handleCloseDialog = () => setVisibleDialog(null);
  const handleSearch = (query: string) => setSearchQuery(query);

  const getTimeLabel = () => (selectedTime ? selectedTime : 'Time');
  const getLevelLabel = () => (selectedLevel ? selectedLevel : 'Level');
  
  const getMuscleLabel = () => {
    if (selectedMuscles.length === 0) return 'Muscles';
    if (selectedMuscles.length === 1) return selectedMuscles[0];
    return `Muscles (${selectedMuscles.length})`;
  };
  
  const getEquipmentLabel = () => {
    if (selectedEquipment.length === 0) return 'Equipment';
    if (selectedEquipment.length === 1) return selectedEquipment[0];
    return `Equip. (${selectedEquipment.length})`;
  };

  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true);
      let filtered = allWorkouts;
      
      if (selectedMuscles.length > 0) {
        filtered = filtered.filter(workout => selectedMuscles.includes(workout.muscle));
      }
      
      if (selectedEquipment.length > 0) {
        filtered = filtered.filter(workout => selectedEquipment.includes(workout.category));
      }
      
      if (selectedLevel) {
        filtered = filtered.filter(workout => workout.level === selectedLevel);
      }
      
      if (selectedTime) {
        try {
          const plan = generateWorkoutPlan({
            selectedTime,
            selectedMuscles,
            selectedEquipment,
            searchQuery,
            allWorkouts,
            bodyParts,
          });
          
          setFilteredWorkouts(plan);
          setCurrentWorkoutPlan(plan);
          setWorkoutPlan(plan);
          setIsLoading(false);
          return;
        } catch (error: any) {
          setFilteredWorkouts([]);
          setCurrentWorkoutPlan([]);
          setWorkoutPlan([]);
          Alert.alert('Error', error.message);
          setIsLoading(false);
          return;
        }
      }
      
      if (searchQuery.trim() !== '') {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(workout => workout.name.toLowerCase().includes(lowerCaseQuery));
      }
      
      setFilteredWorkouts(filtered);
      setWorkoutPlan(filtered);
      setIsLoading(false);
    };
    
    applyFilters();
  }, [selectedMuscles, selectedEquipment, selectedTime, searchQuery, selectedLevel]);

  const handleStartWorkout = () => {
    if (currentWorkoutPlan.length > 0) {
      router.push('/subScreen/WorkingOut');
    } else {
      Alert.alert('No Workout Plan', 'Please generate a workout plan before starting.');
    }
  };

  const handleWorkoutPress = (workout: Workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedWorkout(null);
  };

  const renderContent = () => (
    <>
      {/* Filters Section */}
      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>Filter Workouts</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollView}
        >
          <FilterButtons
            onTimePress={() => openDialog('time')}
            onMusclesPress={() => openDialog('muscles')}
            onEquipmentPress={() => openDialog('equipment')}
            onLevelPress={() => openDialog('level')}
            timeLabel={getTimeLabel()}
            muscleLabel={getMuscleLabel()}
            equipmentLabel={getEquipmentLabel()}
            levelLabel={getLevelLabel()}
            isFilterActive={isFilterActive}
            onClearAllPress={clearAllFilters}
            enabledFilters={['time', 'muscles', 'equipment', 'level']}
          />
        </ScrollView>
      </View>
      
      {/* Results Section */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>
            {isLoading ? 'Loading Workouts...' : `Recommended Workouts (${filteredWorkouts.length})`}
          </Text>
          {isFilterActive && (
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <WorkoutCard 
          data={filteredWorkouts} 
          onPress={handleWorkoutPress} 
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search workouts..."
        />
      </Animated.View>
      
      {/* Main Content - Using FlatList to avoid VirtualizedList warning */}
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
      />
      
      {/* Start Workout Button - Floating */}
      {isFilterActive && (
        <Animated.View 
          style={[
            styles.startButtonContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.startButton}
            activeOpacity={0.8} 
            onPress={handleStartWorkout}
          >
            <LinearGradient
              colors={['#6E45E2', '#88D3CE']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="play" size={22} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.startButtonText}>Start Workout</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{currentWorkoutPlan.length}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Dialog Boxes */}
      <DialogBox
        visible={visibleDialog === 'muscles'}
        options={MUSCLES}
        onClose={handleCloseDialog}
        onSelect={(option) => handleMultiSelect(option, selectedMuscles, setSelectedMuscles)}
        selectedOptions={selectedMuscles}
        multiple={true}
        title="Select Target Muscles"
      />
      
      <DialogBox
        visible={visibleDialog === 'equipment'}
        options={EQUIPMENTS}
        onClose={handleCloseDialog}
        onSelect={(option) => handleMultiSelect(option, selectedEquipment, setSelectedEquipment)}
        selectedOptions={selectedEquipment}
        multiple={true}
        title="Select Equipment"
      />
      
      <DialogBox
        visible={visibleDialog === 'time'}
        options={TIMES}
        onClose={handleCloseDialog}
        onSelect={(option) => handleTimeSelect(option)}
        selectedOptions={selectedTime ? [selectedTime] : []}
        multiple={false}
        title="Workout Duration"
      />
      
      <DialogBox
        visible={visibleDialog === 'level'}
        options={LEVELS}
        onClose={handleCloseDialog}
        onSelect={(option) => {
          setSelectedLevel(option);
          setVisibleDialog(null);
        }}
        selectedOptions={selectedLevel ? [selectedLevel] : []}
        multiple={false}
        title="Select Difficulty Level"
      />
      
      {/* Workout Modal */}
      <WorkoutInfo
        visible={modalVisible}
        workout={selectedWorkout}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  filtersSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  filtersScrollView: {
    paddingRight: 24,
  },
  resultsSection: {
    paddingHorizontal: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    color: '#6E45E2',
    fontWeight: '500',
    fontSize: 14,
  },
  startButtonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  startButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6E45E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default WorkoutScreen;






// // app/(tabs)/workout.tsx

// import React, { useState, useEffect, useContext } from 'react';
// import { View, Alert, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import SearchBar from '../../components/SearchBar';
// import FilterButtons from '../../components/FilterButtons';
// import DialogBox from '../../components/DialogBox';
// import WorkoutCard from '../../components/WorkoutCard';
// // import WorkoutModal from '../../components/WorkoutModal'; // Import WorkoutModal
// import WorkoutInfo from '../../components/WorkoutInfo'; // Import WorkoutModal
// import { workouts as allWorkouts, bodyParts, categories } from '../../constants/data';
// import { Workout } from '../../types/types';
// import { generateWorkoutPlan } from '../../utils/generate_workout';
// import { useRouter } from 'expo-router';
// import { WorkoutContext } from '../../context/WorkoutContext';
// import WorkingOut from '../subScreen/WorkingOut';



// const TIMES = ['30 Min', '45 Min', '60 Min', '90 Min', '120 Min'];
// const MUSCLES = ['Abs', 'Back', 'Biceps', 'Chest', 'Glutes', 'Hamstrings', 'Quadriceps', 'Shoulders', 'Triceps', 'Lower Back'];
// const EQUIPMENTS = ['Barbell', 'Cable', 'Dumbbell', 'Machine', 'Bodyweight'];
// const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// type DialogType = 'time' | 'muscles' | 'equipment' | 'level' | null;

// const SavedScreen: React.FC = () => {
//   const router = useRouter();
//   const { setWorkoutPlan } = useContext(WorkoutContext);

//   // State Variables
//   const [visibleDialog, setVisibleDialog] = useState<DialogType>(null);
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
//   const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
//   const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
//   const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
//   const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(allWorkouts);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<Workout[]>([]);

//   // New State for Modal
//   const [addModalVisible, setAddModalVisible] = useState<boolean>(false);

//   // New State for Workout Modal
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

//   const isFilterActive =
//     !!selectedTime || selectedMuscles.length > 0 || selectedEquipment.length > 0 || !!selectedLevel;

//   const clearAllFilters = () => {
//     setSelectedTime(null);
//     setSelectedMuscles([]);
//     setSelectedEquipment([]);
//     setSelectedLevel(null);
//     setSearchQuery('');
//     setWorkoutPlan([]); // Clear workout plan in context
//   };

//   const openDialog = (type: DialogType) => setVisibleDialog(type);


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
//     // Function to apply all filters and search query
//     const applyFilters = () => {
//       let filtered = allWorkouts;

//       // Apply Muscles Filter
//       if (selectedMuscles.length > 0) {
//         filtered = filtered.filter(workout => selectedMuscles.includes(workout.muscle));
//       }

//       // Apply Equipment Filter
//       if (selectedEquipment.length > 0) {
//         filtered = filtered.filter(workout => selectedEquipment.includes(workout.category));
//       }

//       // Apply Level Filter
//       if (selectedLevel) {
//         filtered = filtered.filter(workout => workout.level === selectedLevel);
//       }

//       // Apply Time Filter
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
//           console.log('Workout plan set:', plan);
//           return; // Exit early as workout plan is set
//         } catch (error: any) {
//           setFilteredWorkouts([]);
//           setCurrentWorkoutPlan([]);
//           setWorkoutPlan([]);
//           Alert.alert('Error', error.message);
//           return;
//         }
//       }

//       // Apply Search Query
//       if (searchQuery.trim() !== '') {
//         const lowerCaseQuery = searchQuery.toLowerCase();
//         filtered = filtered.filter(workout => workout.name.toLowerCase().includes(lowerCaseQuery));
//       }

//       setFilteredWorkouts(filtered);
//       setWorkoutPlan(filtered);
//       console.log('Filtered workouts set:', filtered);
//     };

//     applyFilters();
//   }, [selectedMuscles, selectedEquipment, selectedTime, searchQuery, selectedLevel]);

//   const handleStartWorkout = () => {
//     if (currentWorkoutPlan.length > 0) {
//       router.push('/subScreen/WorkingOut'); // Navigate without passing params
//     } else {
//       Alert.alert('No Workout Plan', 'Please generate a workout plan before starting.');
//     }
//   };

//   // New Handler for Workout Card Press
//   const handleWorkoutPress = (workout: Workout) => {
//     setSelectedWorkout(workout);
//     setModalVisible(true);
//   };

//   // Handler to close the modal
//   const handleModalClose = () => {
//     setModalVisible(false);
//     setSelectedWorkout(null);
//   };

//   // Handler to open Add Exercise Modal
//   const handleAddExercisePress = () => {
//     setAddModalVisible(true);
//   };

//   // Handler to close Add Exercise Modal
//   const handleAddExerciseModalClose = () => {
//     setAddModalVisible(false);
//   };

//   // Handler for selecting workouts from AddExerciseModal
//   const handleSelectWorkouts = (selectedWorkouts: Workout[]) => {
//     // Add selected workouts to the current workout plan
//     const newWorkouts = [...currentWorkoutPlan, ...selectedWorkouts];
//     setCurrentWorkoutPlan(newWorkouts);
//     setWorkoutPlan(newWorkouts);
//     Alert.alert('Workouts Added', `${selectedWorkouts.length} workout(s) added to your plan.`);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>

//       {/* Scrollable Filter Section */}
//       <View style={{ height: 60, paddingHorizontal: 8, marginBottom: 8 }}>
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{
//             alignItems: 'center',
//           }}
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
//             enabledFilters={['time','muscles', 'equipment', 'level']} // Exclude 'timerr
//           />
//         </ScrollView>
//       </View>
//       {/* Search Bar */}
//       <SearchBar 
//         value={searchQuery}
//         onChangeText={handleSearch}
//         placeholder="Search workouts..."
//       />

      

//       {/* Workout Card */}
//       <View style={{ flex: 1 }}>
//         <WorkoutCard data={filteredWorkouts} onPress={handleWorkoutPress} />
//       </View>

//       {isFilterActive && (
//         <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
//           <Text style={styles.startButtonText}>Start Workout</Text>
//         </TouchableOpacity>
//       )}

//       {/* Add Exercise Button */}
//       {/* <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercisePress}>
//         <Text style={styles.addExerciseButtonText}>Add Exercises</Text>
//       </TouchableOpacity> */}

//       {/* Dialog Boxes */}
//       <DialogBox
//         visible={visibleDialog === 'muscles'}
//         options={MUSCLES}
//         onClose={handleCloseDialog}
//         onSelect={(option) =>
//           handleMultiSelect(option, selectedMuscles, setSelectedMuscles)
//         }
//         selectedOptions={selectedMuscles}
//         multiple={true}
//       />

//       <DialogBox
//         visible={visibleDialog === 'equipment'}
//         options={EQUIPMENTS}
//         onClose={handleCloseDialog}
//         onSelect={(option) =>
//           handleMultiSelect(option, selectedEquipment, setSelectedEquipment)
//         }
//         selectedOptions={selectedEquipment}
//         multiple={true}
//       />

//       <DialogBox
//         visible={visibleDialog === 'time'}
//         options={TIMES}
//         onClose={handleCloseDialog}
//         onSelect={(option) => handleTimeSelect(option)}
//         selectedOptions={selectedTime ? [selectedTime] : []}
//         multiple={false}
//       />

//       <DialogBox
//         visible={visibleDialog === 'level'}
//         options={['Beginner', 'Intermediate', 'Advanced']}
//         onClose={handleCloseDialog}
//         onSelect={(option) => {
//           setSelectedLevel(option);
//           setVisibleDialog(null);
//         }}
//         selectedOptions={selectedLevel ? [selectedLevel] : []}
//         multiple={false}
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
//   startButton: {
//     position: 'absolute',
//     bottom: 20, 
//     alignSelf: 'center',
//     backgroundColor: '#2563eb',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 30,
//     elevation: 5,
//   },
//   startButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   // addExerciseButton: {
//   //   position: 'absolute',
//   //   bottom: 20,
//   //   alignSelf: 'center',
//   //   backgroundColor: '#10B981',
//   //   paddingHorizontal: 20,
//   //   paddingVertical: 12,
//   //   borderRadius: 30,
//   //   elevation: 5,
//   // },
//   addExerciseButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default SavedScreen;



// // app/(tabs)/workout.tsx

// import React, { useState, useEffect, useContext } from 'react';
// import { View, Alert, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import SearchBar from '../../components/SearchBar';
// import FilterButtons from '../../components/FilterButtons';
// import DialogBox from '../../components/DialogBox';
// import WorkoutCard from '../../components/WorkoutCard';
// import WorkoutModal from '../../components/WorkoutModal'; // Import WorkoutModal
// import WorkoutInfo from '../../components/WorkoutInfo'; // Import WorkoutModal
// import { workouts as allWorkouts, bodyParts, categories } from '../../constants/data';
// import { Workout } from '../../types/types';
// import { generateWorkoutPlan } from '../../utils/generate_workout';
// import { useRouter } from 'expo-router';
// import { WorkoutContext } from '../../context/WorkoutContext';

// const TIMES = ['30 Min', '45 Min', '60 Min', '90 Min', '120 Min'];
// const MUSCLES = ['Abs', 'Back', 'Biceps', 'Chest', 'Glutes', 'Hamstrings', 'Quadriceps', 'Shoulders', 'Triceps', 'Lower Back'];
// const EQUIPMENTS = ['Barbell', 'Cable', 'Dumbbell', 'Machine', 'Bodyweight'];
// const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// type DialogType = 'time' | 'muscles' | 'equipment' | 'level' | null;

// const SavedScreen: React.FC = () => {
//   const router = useRouter();
//   const { setWorkoutPlan } = useContext(WorkoutContext);

//   // State Variables
//   const [visibleDialog, setVisibleDialog] = useState<DialogType>(null);
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
//   const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
//   const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
//   const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
//   const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(allWorkouts);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<Workout[]>([]);

//   // New State for Modal
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

//   const isFilterActive =
//     !!selectedTime || selectedMuscles.length > 0 || selectedEquipment.length > 0 || !!selectedLevel;

//   const clearAllFilters = () => {
//     setSelectedTime(null);
//     setSelectedMuscles([]);
//     setSelectedEquipment([]);
//     setSelectedLevel(null);
//     setSearchQuery('');
//     setWorkoutPlan([]); // Clear workout plan in context
//   };

//   const openDialog = (type: DialogType) => setVisibleDialog(type);
  

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
//     // Function to apply all filters and search query
//     const applyFilters = () => {
//       let filtered = allWorkouts;

//       // Apply Muscles Filter
//       if (selectedMuscles.length > 0) {
//         filtered = filtered.filter(workout => selectedMuscles.includes(workout.muscle));
//       }

//       // Apply Equipment Filter
//       if (selectedEquipment.length > 0) {
//         filtered = filtered.filter(workout => selectedEquipment.includes(workout.category));
//       }

//       // Apply Level Filter
//       if (selectedLevel) {
//         filtered = filtered.filter(workout => workout.level === selectedLevel);
//       }

//       // Apply Time Filter
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
//           console.log('Workout plan set:', plan);
//           return; // Exit early as workout plan is set
//         } catch (error: any) {
//           setFilteredWorkouts([]);
//           setCurrentWorkoutPlan([]);
//           setWorkoutPlan([]);
//           Alert.alert('Error', error.message);
//           return;
//         }
//       }

//       // Apply Search Query
//       if (searchQuery.trim() !== '') {
//         const lowerCaseQuery = searchQuery.toLowerCase();
//         filtered = filtered.filter(workout => workout.name.toLowerCase().includes(lowerCaseQuery));
//       }

//       setFilteredWorkouts(filtered);
//       setWorkoutPlan(filtered);
//       console.log('Filtered workouts set:', filtered);
//     };

//     applyFilters();
//   }, [selectedMuscles, selectedEquipment, selectedTime, searchQuery, selectedLevel]);

//   const handleStartWorkout = () => {
//     if (currentWorkoutPlan.length > 0) {
//       router.push('/subScreen/WorkingOut'); // Navigate without passing params
//     } else {
//       Alert.alert('No Workout Plan', 'Please generate a workout plan before starting.');
//     }
//   };

//   // New Handler for Workout Card Press
//   const handleWorkoutPress = (workout: Workout) => {
//     setSelectedWorkout(workout);
//     setModalVisible(true);
//   };

//   // Handler to close the modal
//   const handleModalClose = () => {
//     setModalVisible(false);
//     setSelectedWorkout(null);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       {/* Search Bar */}
//       <SearchBar 
//         value={searchQuery}
//         onChangeText={handleSearch}
//         placeholder="Search workouts..."
//       />

//       {/* Scrollable Filter Section */}
//       <View style={{ height: 60, paddingHorizontal: 8, marginBottom: 8 }}>
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{
//             alignItems: 'center',
//           }}
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
//             enabledFilters={['time','muscles', 'equipment', 'level']} // Exclude 'timerr
//           />
//         </ScrollView>
//       </View>

//       {/* Workout Card */}
//       <View style={{ flex: 1 }}>
//         <WorkoutCard data={filteredWorkouts} onPress={handleWorkoutPress} />
//       </View>

//       {isFilterActive && (
//         <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
//           <Text style={styles.startButtonText}>Start Workout</Text>
//         </TouchableOpacity>
//       )}


//       {/* Dialog Boxes */}
//       <DialogBox
//         visible={visibleDialog === 'muscles'}
//         options={MUSCLES}
//         onClose={handleCloseDialog}
//         onSelect={(option) =>
//           handleMultiSelect(option, selectedMuscles, setSelectedMuscles)
//         }
//         selectedOptions={selectedMuscles}
//         multiple={true}
//       />

//       <DialogBox
//         visible={visibleDialog === 'equipment'}
//         options={EQUIPMENTS}
//         onClose={handleCloseDialog}
//         onSelect={(option) =>
//           handleMultiSelect(option, selectedEquipment, setSelectedEquipment)
//         }
//         selectedOptions={selectedEquipment}
//         multiple={true}
//       />

//       <DialogBox
//         visible={visibleDialog === 'time'}
//         options={TIMES}
//         onClose={handleCloseDialog}
//         onSelect={(option) => handleTimeSelect(option)}
//         selectedOptions={selectedTime ? [selectedTime] : []}
//         multiple={false}
//       />

//       <DialogBox
//         visible={visibleDialog === 'level'}
//         options={['Beginner', 'Intermediate', 'Advanced']}
//         onClose={handleCloseDialog}
//         onSelect={(option) => {
//           setSelectedLevel(option);
//           setVisibleDialog(null);
//         }}
//         selectedOptions={selectedLevel ? [selectedLevel] : []}
//         multiple={false}
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
//   startButton: {
//     position: 'absolute',
//     bottom: 20, // Adjusted for better spacing
//     alignSelf: 'center',
//     backgroundColor: '#2563eb',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 30,
//     elevation: 5,
//   },
//   startButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default SavedScreen;