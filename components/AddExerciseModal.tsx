"use client"

import type React from "react"
import { useState } from "react"
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import type { Workout } from "../types/types"

interface AddExerciseModalProps {
  visible: boolean
  onClose: () => void
  workouts: Workout[]
  onSelectWorkout: (selectedWorkouts: Workout[]) => void
  multipleSelection: boolean
}

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  visible,
  onClose,
  workouts,
  onSelectWorkout,
  multipleSelection,
}) => {
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const handleWorkoutSelection = (workout: Workout) => {
    if (multipleSelection) {
      // Check if workout is already selected
      const isSelected = selectedWorkouts.some((w) => w.id === workout.id)

      if (isSelected) {
        // Remove from selection
        setSelectedWorkouts(selectedWorkouts.filter((w) => w.id !== workout.id))
      } else {
        // Add to selection
        setSelectedWorkouts([...selectedWorkouts, workout])
      }
    } else {
      // Single selection mode
      setSelectedWorkouts([workout])
    }
  }

  const handleConfirm = () => {
    onSelectWorkout(selectedWorkouts)
    setSelectedWorkouts([])
    setSearchQuery("")
  }

  const handleCancel = () => {
    setSelectedWorkouts([])
    setSearchQuery("")
    onClose()
  }

  const filteredWorkouts = searchQuery
    ? workouts.filter(
        (workout) =>
          workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (workout.muscle && workout.muscle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (workout.category && workout.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (workout.level && workout.level.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : workouts

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <BlurView intensity={30} tint="dark" style={styles.blurView}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{multipleSelection ? "Select Exercises" : "Replace Exercise"}</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredWorkouts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedWorkouts.some((w) => w.id === item.id)
                return (
                  <TouchableOpacity
                    style={[styles.workoutItem, isSelected && styles.selectedWorkoutItem]}
                    onPress={() => handleWorkoutSelection(item)}
                  >
                    <View style={styles.workoutImageContainer}>
                      <Image
                        source={item.imageUrl || item.image || require("../assets/images/placeholder.jpg")}
                        style={styles.workoutImage}
                      />
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{item.name}</Text>
                      <View style={styles.workoutTags}>
                        <View style={styles.workoutTag}>
                          <Text style={styles.workoutTagText}>{item.muscle || item.category || "General"}</Text>
                        </View>
                        <View style={styles.workoutTag}>
                          <Text style={styles.workoutTagText}>{item.level || "All Levels"}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.checkboxContainer}>
                      {isSelected ? (
                        <View style={styles.checkboxSelected}>
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        </View>
                      ) : (
                        <View style={styles.checkbox} />
                      )}
                    </View>
                  </TouchableOpacity>
                )
              }}
              contentContainerStyle={styles.workoutList}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.confirmButton, selectedWorkouts.length === 0 && styles.disabledButton]}
                onPress={handleConfirm}
                disabled={selectedWorkouts.length === 0}
              >
                <Text style={styles.confirmButtonText}>
                  {multipleSelection
                    ? `Add ${selectedWorkouts.length} Exercise${selectedWorkouts.length !== 1 ? "s" : ""}`
                    : "Replace Exercise"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  blurView: {
    flex: 1,
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(30, 30, 30, 0.9)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  workoutList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  workoutItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  selectedWorkoutItem: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.5)",
  },
  workoutImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  workoutImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  workoutTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  workoutTag: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  workoutTagText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  checkboxContainer: {
    marginLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  checkboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  confirmButton: {
    backgroundColor: "#6366F1",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(99, 102, 241, 0.5)",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default AddExerciseModal


// import React, { useState, useEffect } from 'react';
// import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import WorkoutCard from './WorkoutCard'; // Import the updated WorkoutCard
// import SearchBar from './SearchBar'; // Import SearchBar component
// import { Workout } from '../types/types';
// import { MaterialIcons } from '@expo/vector-icons'; // For close icon
// import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

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
//   multipleSelection = true,
// }) => {
//   const { isDarkMode } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;
  
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
//         <View style={[
//           styles.modalContent,
//           { 
//             backgroundColor: colors.background,
//             borderTopWidth: isDarkMode ? 1 : 0,
//             borderTopColor: colors.border
//           }
//         ]}>
//           {/* Header */}
//           <View style={styles.header}>
//             <Text style={[styles.modalTitle, { color: colors.text }]}>Select Exercises</Text>
//             <TouchableOpacity onPress={onClose}>
//               <MaterialIcons name="close" size={24} color={colors.secondaryText} />
//             </TouchableOpacity>
//           </View>

//           {/* Search Bar */}
//           <SearchBar
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholder="Search exercises..."
//             isDarkMode={isDarkMode}
//           />

//           {/* Workout List */}
//           <WorkoutCard
//             data={filteredWorkouts} // Pass filtered workouts
//             onPress={handleWorkoutPress}
//             selectedWorkouts={selectedWorkoutIds}
//             multipleSelection={multipleSelection}
//             isDarkMode={isDarkMode}
//           />

//           {/* Footer Buttons */}
//           <View style={styles.footer}>
//             {multipleSelection && selectedWorkoutIds.length > 0 && (
//               <TouchableOpacity
//                 style={[
//                   styles.button, 
//                   styles.clearButton,
//                   { backgroundColor: isDarkMode ? 'rgba(248, 113, 113, 0.2)' : '#F87171' }
//                 ]}
//                 onPress={handleClearSelection}
//               >
//                 <Text style={[
//                   styles.clearButtonText,
//                   { color: isDarkMode ? '#FCA5A5' : '#fff' }
//                 ]}>Clear Selection</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               style={[
//                 styles.button, 
//                 styles.doneButton,
//                 { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#10B981' }
//               ]}
//               onPress={handleDone}
//             >
//               <Text style={[
//                 styles.doneButtonText,
//                 { color: isDarkMode ? '#6EE7B7' : '#fff' }
//               ]}>Done</Text>
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
//   doneButton: {},
//   doneButtonText: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   clearButton: {},
//   clearButtonText: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default AddExerciseModal;




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
//   multipleSelection = true,
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



// import React from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { Workout } from '../types/types';

// interface AddExerciseModalProps {
//   visible: boolean;
//   onClose: () => void;
//   exercises: Workout[]; // Accept a list of workouts as a prop
// }

// const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ visible, onClose }) => {
    
//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Welcome to Add Exercise!</Text>
//           {/* Add additional modal content here */}

//           <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
//             <Text style={styles.closeModalButtonText}>Close</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'flex-end', // Align modal at the bottom
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//   },
//   modalContent: {
//     width: '100%',
//     height: '90%', // Cover 90% of the screen height
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20, // Rounded top corners
//     borderTopRightRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 }, // Adjust shadow for top appearance
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 10,
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
//     alignSelf: 'center',
//   },
//   closeModalButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default AddExerciseModal;
