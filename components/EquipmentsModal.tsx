// import React, { useState, useEffect } from 'react';
// import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import WorkoutCard from './WorkoutCard'; // Import the updated WorkoutCard
// import SearchBar from './SearchBar'; // Import SearchBar component
// import { Workout } from '../types/types';
// import { MaterialIcons } from '@expo/vector-icons'; // For close icon

// interface AddExerciseModalProps {
//   visible: boolean;
//   onClose: () => void;
//   workouts: Workout[];
//   onSelectWorkout: (selectedWorkouts: Workout[]) => void;
//   multipleSelection?: boolean; // Enable single or multiple selection
// }

// const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
//   visible,
//   onClose,
//   workouts,
//   onSelectWorkout,
//   multipleSelection= true,
// }) => {
//   const [searchQuery, setSearchQuery] = useState<string>(''); // Search query state
//   const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(workouts); // Filtered workouts
//   const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<number[]>([]);

//   // Reset state when modal is closed
//   useEffect(() => {
//     if (!visible) {
//       setSelectedWorkoutIds([]);
//     }
//   }, [visible]);

//   // Filter workouts whenever the search query changes
//   useEffect(() => {
//     const lowerCaseQuery = searchQuery.toLowerCase();
//     const filtered = workouts.filter((workout) =>
//       workout.name.toLowerCase().includes(lowerCaseQuery)
//     );
//     setFilteredWorkouts(filtered);
//   }, [searchQuery, workouts]);

//   const handleWorkoutPress = (workout: Workout) => {
//     if (multipleSelection) {
//       if (selectedWorkoutIds.includes(workout.id)) {
//         setSelectedWorkoutIds(selectedWorkoutIds.filter((id) => id !== workout.id));
//       } else {
//         setSelectedWorkoutIds([...selectedWorkoutIds, workout.id]);
//       }
//     } else {
//       setSelectedWorkoutIds(
//         selectedWorkoutIds.includes(workout.id) ? [] : [workout.id]
//       );
//     }
//   };

//   const handleDone = () => {
//     const selectedWorkouts = workouts.filter((workout) =>
//       selectedWorkoutIds.includes(workout.id)
//     );

//     if (selectedWorkouts.length === 0) {
//       Alert.alert('No Selection', 'Please select at least one workout.');
//       return;
//     }

//     onSelectWorkout(selectedWorkouts);
//     onClose();
//   };

//   const handleClearSelection = () => {
//     setSelectedWorkoutIds([]);
//   };

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <Text style={styles.modalTitle}>Select Exercises</Text>
//             <TouchableOpacity onPress={onClose}>
//               <MaterialIcons name="close" size={24} color="#6b7280" />
//             </TouchableOpacity>
//           </View>

//           {/* Search Bar */}
//           <SearchBar
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholder="Search exercises..."
//           />

//           {/* Workout List */}
//           <WorkoutCard
//             data={filteredWorkouts} // Pass filtered workouts
//             onPress={handleWorkoutPress}
//             selectedWorkouts={selectedWorkoutIds}
//             multipleSelection={multipleSelection}
//           />

//           {/* Footer Buttons */}
//           <View style={styles.footer}>
//             {multipleSelection && selectedWorkoutIds.length > 0 && (
//               <TouchableOpacity
//                 style={[styles.button, styles.clearButton]}
//                 onPress={handleClearSelection}
//               >
//                 <Text style={styles.clearButtonText}>Clear Selection</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               style={[styles.button, styles.doneButton]}
//               onPress={handleDone}
//             >
//               <Text style={styles.doneButtonText}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     width: '100%',
//     height: '80%',
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1f2937',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 20,
//     paddingHorizontal: 16,
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 12,
//     marginHorizontal: 8,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   doneButton: {
//     backgroundColor: '#10B981',
//   },
//   doneButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   clearButton: {
//     backgroundColor: '#F87171',
//   },
//   clearButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default AddExerciseModal;

