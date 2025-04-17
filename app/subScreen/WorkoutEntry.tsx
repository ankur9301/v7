// components/WorkoutInfo.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Workout } from "../../types/types";
import { getWorkoutVideo } from "../../utils/videoHelper";
import { Ionicons } from "@expo/vector-icons";

interface WorkoutInfoProps {
  visible: boolean;
  workout: Workout | null;
  onClose: () => void;
}

const WorkoutInfo: React.FC<WorkoutInfoProps> = ({ visible, workout, onClose }) => {
  const [activeTab, setActiveTab] = useState("About"); // Tracks the selected tabclear
  
  const videoRef = useRef<Video | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <View style={styles.aboutSection}>
            {workout && getWorkoutVideo(workout.name) && (
              <Video
                ref={videoRef}
                source={getWorkoutVideo(workout.name)}
                style={styles.workoutVideo}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
              />
            )}
            <Text style={styles.sectionHeader}>Instructions</Text>
            <Text style={styles.sectionText}>
              Perform this exercise with proper form. Focus on controlled movements and ensure you're engaging the targeted muscles. Always start with a light weight to avoid injury.
            </Text>
          </View>
        );
      case "History":
        return (
          <View style={styles.historySection}>
            <Text style={styles.sectionHeader}>Workout History</Text>
            <Text style={styles.sectionText}>
              - Last performed: 01/15/2025 {"\n"}
              - Best performance: 3 sets, 12 reps @ 50 lbs {"\n"}
              - Logged 8 times in the past month
            </Text>
          </View>
        );
      case "Charts":
        return (
          <View style={styles.chartsSection}>
            <Text style={styles.sectionHeader}>Progress Charts</Text>
            <Text style={styles.sectionText}>
              Your strength for this exercise has increased by 15% over the past 3 months.
            </Text>
            {/* You can add chart components here using libraries like Victory or react-native-chart-kit */}
          </View>
        );
      case "PRs":
        return (
          <View style={styles.prsSection}>
            <Text style={styles.sectionHeader}>Personal Records</Text>
            <Text style={styles.sectionText}>
              - Max Weight: 60 lbs {"\n"}
              - Max Reps: 15 {"\n"}
              - Max Sets: 4
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {["About", "History", "Charts", "PRs"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.actionButton,
                  activeTab === tab && styles.activeActionButton,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    activeTab === tab && styles.activeActionButtonText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dynamic Content */}
          <ScrollView style={styles.contentContainer}>{renderContent()}</ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "95%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  activeActionButton: {
    backgroundColor: "#4caf50",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#333",
  },
  activeActionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
  },
  workoutVideo: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  aboutSection: {
    marginBottom: 20,
  },
  historySection: {
    marginBottom: 20,
  },
  chartsSection: {
    marginBottom: 20,
  },
  prsSection: {
    marginBottom: 20,
  },
});

export default WorkoutInfo;


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

// const WorkoutEntry: React.FC = () => {
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
//         placeholder="Search Workouts to add..."
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

// export default WorkoutEntry;