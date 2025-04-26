// app/(tabs)/workout.tsx
// import React, { useState, useEffect, useContext } from 'react';
import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions, Animated, Easing, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../components/SearchBar';
import FilterButtons from '../../components/FilterButtons';
import DialogBox from '../../components/DialogBox';
import WorkoutCard from '../../components/WorkoutCard';
// import WorkoutInfo from '../../components/WorkoutInfoModal';
import { workouts as allWorkouts, bodyParts, categories } from '../../constants/data';
import { Workout } from '../../types/types';
import { generateWorkoutPlan } from '../../utils/generate_workout';
import { useRouter } from 'expo-router';
import { WorkoutContext } from '../../context/WorkoutContext';
import { StatusBar } from 'expo-status-bar';
import { useTheme, lightTheme, darkTheme } from '../../context/ThemeContext';
import WorkoutInfoModal from '../../components/WorkoutInfoModal';
import CreateExerciseModal from '../../components/CreateExerciseModal'; 
import { supabase } from '@/src/supabaseClient'; 
import { useUserProfile } from '@/hooks/useUserProfile'; 
import { addExerciseToSupabase, fetchCustomExercisesFromSupabase, getCachedCustomExercises } from '@/lib/exerciseService';
import { useWorkoutStore } from '@/src/stores/useWorkoutStore'
import { useWorkoutFilterStore } from '@/src/stores/useWorkoutFilterStore';
import { useWorkoutDataStore } from '@/src/stores/useWorkoutDataStore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getNextCustomId } from '@/utils/customIdTracker';
import { RefreshControl } from 'react-native';


// Constants
const TIMES = ['30 Min', '45 Min', '60 Min', '90 Min', '120 Min'];
const MUSCLES = ['Abs', 'Back', 'Biceps', 'Chest', 'Glutes', 'Hamstrings', 'Quadriceps', 'Shoulders', 'Triceps', 'Lower Back'];
const EQUIPMENTS = ['Barbell', 'Cable', 'Dumbbell', 'Machine', 'Bodyweight'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
type DialogType = 'time' | 'muscles' | 'equipment' | 'level' | null;

const WorkoutScreen: React.FC = () => {
  const router = useRouter();
  const { plan: currentWorkoutPlan, setPlan,startTimer } = useWorkoutStore();
  // const { setWorkoutPlan } = useContext(WorkoutContext);

  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  
  const windowWidth = Dimensions.get('window').width;
  const { userData } = useUserProfile();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);


  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  
  // State Variables
  const [visibleDialog, setVisibleDialog] = useState<DialogType>(null);

  // const [selectedTime, setSelectedTime] = useState<string | null>(null);
  // const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  // const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  // const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  // const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(allWorkouts);
  // const [allAvailableWorkouts, setAllAvailableWorkouts] = useState<Workout[]>([...allWorkouts]);
  // const [searchQuery, setSearchQuery] = useState('');
  const {
    selectedTime,
    selectedMuscles,
    selectedEquipment,
    selectedLevel,
    searchQuery,
    setTime,
    setMuscles,
    setEquipment,
    setLevel,
    setSearchQuery,
    resetFilters,
  } = useWorkoutFilterStore();
  
  
  const {
    allAvailableWorkouts,
    filteredWorkouts,
    setAllAvailableWorkouts,
    setFilteredWorkouts,
    resetWorkouts
  } = useWorkoutDataStore();
  

  // const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<Workout[]>([]);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useFocusEffect(
    useCallback(() => {
      // This runs when the Workout screen gains focus (i.e., when you return from WorkingOut)
      resetFilters();
      setPlan([]);
    }, [])
  );
  
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


  useEffect(() => {
    const loadCustom = async () => {
      const fromDB = await fetchCustomExercisesFromSupabase();
      const combined = [...allWorkouts, ...fromDB];
      setAllAvailableWorkouts(combined);
      setFilteredWorkouts(combined);

    };
    loadCustom();
  }, []);
  
 
  const syncFromSupabase = async () => {
    setIsLoading(true);
    try {
      const fromDB = await fetchCustomExercisesFromSupabase();
      const combined = [...allWorkouts, ...fromDB];
      setAllAvailableWorkouts(combined);
      setFilteredWorkouts(combined);
    } catch (err) {
      Alert.alert("Sync Error", "Failed to fetch workouts from database.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const isFilterActive =
    !!selectedTime || selectedMuscles.length > 0 || selectedEquipment.length > 0 || !!selectedLevel;


  const clearAllFilters = () => {
    resetFilters();
    setPlan([]);
  };
  

  const openDialog = (type: DialogType) => {
    setVisibleDialog(type);
  };
  

  const handleTimeSelect = (option: string) => {
    setTime(option === selectedTime ? null : option);
    setVisibleDialog(null);
  };
  


  const handleMultiSelect = (option: string, selectedArray: string[], setSelectedFn: Function) => {
    if (selectedArray.includes(option)) {
      setSelectedFn(selectedArray.filter((item) => item !== option));
    } else {
      setSelectedFn([...selectedArray, option]);
    }
  };
  

  const handleCloseDialog = () => setVisibleDialog(null);
  // const handleSearch = (query: string) => setSearchQuery(query);
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
      // let filtered = allWorkouts;
      let filtered = allAvailableWorkouts;

      
      if (selectedMuscles.length > 0) {
        filtered = filtered.filter(workout => workout.muscle && selectedMuscles.includes(workout.muscle));
      }
      
      if (selectedEquipment.length > 0) {
        filtered = filtered.filter(workout => selectedEquipment.includes(workout.category ?? ''));
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
            allWorkouts: allAvailableWorkouts, 
            bodyParts,
          });
          
          
          setFilteredWorkouts(plan);
          // setCurrentWorkoutPlan(plan);
          // setWorkoutPlan(plan);
          setPlan(plan);
          setIsLoading(false);
          return;
        } catch (error: any) {
          setFilteredWorkouts([]);
          // setCurrentWorkoutPlan([]);
          // setWorkoutPlan([]);
          setPlan([]);
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
      // setWorkoutPlan(filtered);
      setPlan(filtered);
      setIsLoading(false);
    };
    
    applyFilters();
  }, [selectedMuscles, selectedEquipment, selectedTime, searchQuery, selectedLevel]);

  // const handleStartWorkout = () => {
  //   if (isNavigating) return;
  //   if (currentWorkoutPlan.length > 0) {
  //     // setTimeout(() => startTimer(), 500);
  //     startTimer();
  //     router.push('/subScreen/WorkingOut');
      
  //   } else {
  //     Alert.alert('No Workout Plan', 'Please generate a workout plan before starting.');
  //   }
  // };

  const handleStartWorkout = () => {
    if (isNavigating) return;
    setIsNavigating(true);  // Prevent further clicks
    
    if (currentWorkoutPlan.length > 0) {
      startTimer();
      router.push('/subScreen/WorkingOut');
      
      // Reset flag after a delay (for safety)
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    } else {
      Alert.alert('No Workout Plan', 'Please generate a workout plan before starting.');
      setIsNavigating(false);  // Reset immediately if showing alert
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
  

  const handleCreateExercise = async (exercise: { name: string; muscle: string; category: string; level: string }) => {
    try {
      const newId = getNextCustomId();
  
      const savedExercise = await addExerciseToSupabase({
        ...exercise,
        id: newId, // ✅ override with unique ID starting at 200
      });
  
      const customExercise = { ...savedExercise, id: newId, isCustom: true };
  
      setAllAvailableWorkouts([...allAvailableWorkouts, customExercise]);
      setFilteredWorkouts([...filteredWorkouts, customExercise]);
      setPlan([...currentWorkoutPlan, customExercise]);
  
      Alert.alert('Success', 'New exercise created!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not create exercise.');
    }
  };

  const handleDeleteExercise = async (workout: Workout) => {
    try {
      // Remove from Supabase
      await supabase
        .from('custom_exercises')
        .delete()
        .eq('id', workout.id);
  
      // Remove from state
      const updatedList = allAvailableWorkouts.filter(w => w.id !== workout.id);
      setAllAvailableWorkouts(updatedList);
      setFilteredWorkouts(allAvailableWorkouts.filter((w: Workout) => w.id !== workout.id));
      // setWorkoutPlan(allAvailableWorkouts.filter((w: Workout) => w.id !== workout.id));
      setPlan(updatedList);
  
      Alert.alert("Deleted", `${workout.name} has been removed.`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete workout.");
    }
  };
  
  

  const renderContent = () => (
    <>
      {/* Filters Section */}
      <View style={styles.filtersSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Filter Workouts</Text>
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
            isDarkMode={isDarkMode}
          />
        </ScrollView>
      </View>
      
      {/* Results Section */}
{/* Results Section */}
<View style={styles.resultsSection}>
  <View style={styles.resultsHeader}>
    {/* header text: loading → non-filter “Your Workouts” → filter “Recommended Workouts” */}
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {isLoading
        ? 'Loading Workouts...'
        : !isFilterActive
          ? `Your Workouts (${filteredWorkouts.length})`
          : `Recommended Workouts (${filteredWorkouts.length})`
      }
    </Text>

    {/* only show the “+” button when NOT filtering */}
    {!isFilterActive && (
      <TouchableOpacity onPress={() => setShowCreateModal(true)}>
        <Ionicons
          name="add-circle-outline"
          size={26}
          color={colors.accent}
        />
      </TouchableOpacity>
    )}
  </View>

  <WorkoutCard
    data={filteredWorkouts}
    onPress={handleWorkoutPress}
    onRemoveExercise={handleDeleteExercise}
    isDarkMode={isDarkMode}
  />
</View>

      {/* <View style={styles.resultsSection}>
   

        <View style={styles.resultsHeader}>
      
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isLoading ? 'Loading Workouts...' : `Recommended Workouts (${filteredWorkouts.length})`}
          </Text>


          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        
            <TouchableOpacity onPress={() => setShowCreateModal(true)}>
              <Ionicons name="add-circle-outline" size={26} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        
        <WorkoutCard 
          data={filteredWorkouts} 
          onPress={handleWorkoutPress}
          onRemoveExercise={handleDeleteExercise} // 🆕
          isDarkMode={isDarkMode}
        />

      </View> */}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar as any} />
      
      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.card,
            shadowColor: isDarkMode ? '#000' : '#000',
          }
        ]}
      >
        {/* <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search workouts..."
          isDarkMode={isDarkMode}
        /> */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search workouts..."
          isDarkMode={isDarkMode}
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
        // refreshing={isLoading}
        // onRefresh={syncFromSupabase}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={syncFromSupabase}
            tintColor={isDarkMode ? "#FF9500" : "#6366F1"} // Optional: spinner color
          />
        }
        
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
              colors={isDarkMode ? ['#FF9500', '#FF5500'] : ['#6E45E2', '#88D3CE']}
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
        // onSelect={(option) => handleMultiSelect(option, selectedMuscles, setSelectedMuscles)}
        onSelect={(option) => {
          if (selectedMuscles.includes(option)) {
            setMuscles(selectedMuscles.filter(m => m !== option));
          } else {
            setMuscles([...selectedMuscles, option]);
          }
        }}
        
        selectedOptions={selectedMuscles}
        multiple={true}
        title="Select Target Muscles"
        isDarkMode={isDarkMode}
      />
      
      <DialogBox
        visible={visibleDialog === 'equipment'}
        options={EQUIPMENTS}
        onClose={handleCloseDialog}
        // onSelect={(option) => handleMultiSelect(option, selectedEquipment, setSelectedEquipment)}
        onSelect={(option) => {
          if (selectedEquipment.includes(option)) {
            setEquipment(selectedEquipment.filter(e => e !== option));
          } else {
            setEquipment([...selectedEquipment, option]);
          }
        }}
        
        
        selectedOptions={selectedEquipment}
        multiple={true}
        title="Select Equipment"
        isDarkMode={isDarkMode}
      />
      
      <DialogBox
        visible={visibleDialog === 'time'}
        options={TIMES}
        onClose={handleCloseDialog}
        onSelect={(option) => handleTimeSelect(option)}
        selectedOptions={selectedTime ? [selectedTime] : []}
        multiple={false}
        title="Workout Duration"
        isDarkMode={isDarkMode}
      />
      
      <DialogBox
        visible={visibleDialog === 'level'}
        options={LEVELS}
        onClose={handleCloseDialog}
        onSelect={(option) => {
          setLevel(option);
          setVisibleDialog(null);
        }}
        selectedOptions={selectedLevel ? [selectedLevel] : []}
        multiple={false}
        title="Select Difficulty Level"
        isDarkMode={isDarkMode}
      />
      
      {/* Workout Modal */}
      <WorkoutInfoModal
        visible={modalVisible}
        workout={selectedWorkout}
        onClose={handleModalClose}
        isDarkMode={isDarkMode}
      />

<CreateExerciseModal
  visible={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onSubmit={handleCreateExercise}
/>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
//       <StatusBar style="dark" />
      
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
//               colors={['#6E45E2', '#88D3CE']}
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
//     backgroundColor: '#FFFFFF',
//   },
//   searchContainer: {
//     paddingHorizontal: 24,
//     paddingTop: 16,
//     paddingBottom: 12,
//     backgroundColor: '#FFFFFF',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
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
//     color: '#2D3748',
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
//     color: '#6E45E2',
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
//     shadowColor: '#6E45E2',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.2,
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