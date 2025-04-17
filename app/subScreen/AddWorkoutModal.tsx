import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Video, ResizeMode } from "expo-av";
import { Workout } from "../../types/types";
import { getWorkoutVideo } from "../../utils/videoHelper";
import { Ionicons } from "@expo/vector-icons";

interface WorkoutModalProps {
  visible: boolean;
  workout: Workout | null;
  onClose: () => void;
}

interface Set {
  reps: string;
  weight: string;
  logged: boolean;
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose }) => {
  const [sets, setSets] = useState<Set[]>([
    { reps: "12", weight: "10", logged: false },
    { reps: "10", weight: "15", logged: false },
    { reps: "8", weight: "20", logged: false },
  ]);

  const videoRef = useRef<Video | null>(null);
  const swipeableRefs = useRef<(Swipeable | null)[]>([]);
  const outlineAnimations = useRef<Animated.Value[]>([]);

  // Initialize animations for each set
  React.useEffect(() => {
    outlineAnimations.current = sets.map(() => new Animated.Value(0));
  }, [sets.length]);

  const addSet = () => {
    setSets([...sets, { reps: "6", weight: "0", logged: false }]);
    outlineAnimations.current.push(new Animated.Value(0));
  };

  const updateSet = (index: number, field: "reps" | "weight", value: string) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const toggleLog = (index: number) => {
    const newSets = [...sets];
    newSets[index].logged = !newSets[index].logged;

    // Animate border when toggling logged state
    Animated.timing(outlineAnimations.current[index], {
      toValue: newSets[index].logged ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setSets(newSets);
  };

  const handleSwipeLog = (index: number) => {
    swipeableRefs.current[index]?.close();

    Animated.timing(outlineAnimations.current[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      const newSets = [...sets];
      newSets[index].logged = true;
      setSets(newSets);
    }, 300);
  };

  const handleSwipeDelete = (index: number) => {
    swipeableRefs.current[index]?.close();

    setTimeout(() => {
      const newSets = sets.filter((_, i) => i !== index);
      setSets(newSets);
      outlineAnimations.current = outlineAnimations.current.filter((_, i) => i !== index);
      swipeableRefs.current = swipeableRefs.current.filter((_, i) => i !== index);
    }, 300);
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, index: number) => (
    <View style={styles.leftSwipeAction}>
      <Text style={styles.leftSwipeText}>Set Logged</Text>
    </View>
  );

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, index: number) => (
    <View style={styles.rightSwipeAction}>
      <Text style={styles.rightSwipeText}>Set Deleted</Text>
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
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

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

          {workout && (
            <Text style={styles.workoutName}>{workout.name}</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Rest Timer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Replace</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>More</Text>
            </TouchableOpacity>
          </View>

         
    

          <ScrollView style={styles.setsContainer}>
            {sets.map((set, index) => (
              <Swipeable
                key={index}
                ref={(ref) => (swipeableRefs.current[index] = ref)}
                renderLeftActions={(progress) => renderLeftActions(progress, index)}
                renderRightActions={(progress) => renderRightActions(progress, index)}
                overshootLeft={false}
                overshootRight={false}
                onSwipeableLeftOpen={() => handleSwipeLog(index)}
                onSwipeableRightOpen={() => handleSwipeDelete(index)}
              >
                <Animated.View
                  style={[
                    styles.setRow,
                    {
                      borderWidth: outlineAnimations.current[index]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 2],
                      }),
                      borderColor: set.logged ? "#4caf50" : "transparent",
                    },
                  ]}
                >
                  <View style={styles.setIndicator}>
                    <TouchableOpacity
                      style={[
                        styles.circleIndicator,
                        set.logged && styles.circleIndicatorLogged,
                      ]}
                      onPress={() => toggleLog(index)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={set.reps}
                      onChangeText={(text) => updateSet(index, "reps", text)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Weight (lb)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={set.weight}
                      onChangeText={(text) => updateSet(index, "weight", text)}
                    />
                  </View>
                </Animated.View>
              </Swipeable>
            ))}
            <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
              <Ionicons name="add-circle-outline" size={24} color="#ff4081" />
              <Text style={styles.addSetButtonText}>Add Set</Text>
            </TouchableOpacity>
          </ScrollView>
          
           {/*Complete Workout Button */}
         
           <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Complete Workout</Text>
            </TouchableOpacity>
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
  workoutVideo: {
    width: "100%",
    height: "40%",
    borderRadius: 10,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#02BFFF",
    width: "50%",
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "25%",
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  setsContainer: {
    flex: 1,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 70,
    width: "100%",
    marginBottom: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 1,
  },
  setIndicator: {
    width: 30,
    alignItems: "center",
  },
  circleIndicator: {
    width: 16,
    height: 16,
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4caf50",
    backgroundColor: "transparent",
  },
  circleIndicatorLogged: {
    backgroundColor: "#4caf50",
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addSetButtonText: {
    marginLeft: 5,
    color: "#ff4081",
    fontSize: 16,
  },
  leftSwipeAction: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4caf50",
    borderRadius: 10,
    height: 70,
    width: 70,
    flex: 1,
  },
  leftSwipeText: {
    color: "#fff",
    fontWeight: "600",
  },
  rightSwipeAction: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff5252",
    borderRadius: 10,
    height: 70,
    width: 70,
    flex: 1,
  },
  rightSwipeText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default WorkoutModal;


// // components/WorkoutModal.tsx
// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Animated,
// } from "react-native";
// import { Swipeable } from "react-native-gesture-handler";
// import { Video, ResizeMode } from "expo-av";
// import { Workout } from "../types/types";
// import { getWorkoutVideo } from "../utils/videoHelper";
// import { Ionicons } from "@expo/vector-icons";

// interface WorkoutModalProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
// }

// interface Set {
//   reps: string;
//   weight: string;
//   logged: boolean;
// }

// const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose }) => {
//   const [sets, setSets] = useState<Set[]>([
//     { reps: "12", weight: "10", logged: false },
//     { reps: "10", weight: "15", logged: false },
//     { reps: "8", weight: "20", logged: false },
//   ]);

//   const videoRef = useRef<Video | null>(null);
//   const swipeableRefs = useRef<(Swipeable | null)[]>([]);
//   const outlineAnimations = useRef<Animated.Value[]>([]);

//   // Initialize animations for each set
//   React.useEffect(() => {
//     outlineAnimations.current = sets.map(() => new Animated.Value(0));
//   }, [sets.length]);

//   const addSet = () => {
//     setSets([...sets, { reps: "6", weight: "0", logged: false }]);
//     outlineAnimations.current.push(new Animated.Value(0));
//   };

//   const updateSet = (index: number, field: "reps" | "weight", value: string) => {
//     const newSets = [...sets];
//     newSets[index][field] = value;
//     setSets(newSets);
//   };

//   const removeSet = (index: number) => {
//     swipeableRefs.current[index]?.close();
    
//     setTimeout(() => {
//       const newSets = sets.filter((_, i) => i !== index);
//       setSets(newSets);
//       outlineAnimations.current = outlineAnimations.current.filter((_, i) => i !== index);
//       swipeableRefs.current = swipeableRefs.current.filter((_, i) => i !== index);
//     }, 200);
//   };

//   const logRep = (index: number) => {
//     swipeableRefs.current[index]?.close();

//     Animated.sequence([
//       Animated.timing(outlineAnimations.current[index], {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//     ]).start();

//     setTimeout(() => {
//       const newSets = [...sets];
//       newSets[index].logged = true;
//       setSets(newSets);
//     }, 200);
//   };

//   const logAllSets = () => {
//     // Close all open swipeables first
//     swipeableRefs.current.forEach(ref => ref?.close());

//     // Create array of animation sequences
//     const animations = outlineAnimations.current.map((anim, index) => 
//       Animated.sequence([
//         Animated.delay(index * 100), // Stagger the animations
//         Animated.timing(anim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: false,
//         })
//       ])
//     );

//     // Run all animations in parallel
//     Animated.parallel(animations).start();

//     // Update all sets to logged status with a slight delay
//     setTimeout(() => {
//       const newSets = sets.map(set => ({ ...set, logged: true }));
//       setSets(newSets);
//     }, 200);
//   };

//   const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, index: number) => (
//     <TouchableOpacity
//       style={styles.logButton}
//       onPress={() => logRep(index)}
//     >
//       <Ionicons name="checkmark-done-outline" size={24} color="#000" />
//       <Text style={styles.actionText}>Log</Text>
//     </TouchableOpacity>
//   );

//   const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, index: number) => (
//     <TouchableOpacity
//       style={styles.deleteButton}
//       onPress={() => removeSet(index)}
//     >
//       <Ionicons name="trash-outline" size={24} color="#fff" />
//       <Text style={styles.actionText}>Delete</Text>
//     </TouchableOpacity>
//   );

//   const isAllSetsLogged = sets.every(set => set.logged);

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//             <Ionicons name="close" size={24} color="#333" />
//           </TouchableOpacity>

//           {workout && getWorkoutVideo(workout.name) && (
//             <Video
//               ref={videoRef}
//               source={getWorkoutVideo(workout.name)}
//               style={styles.workoutVideo}
//               resizeMode={ResizeMode.COVER}
//               shouldPlay
//               isLooping
//             />
//           )}

//           {workout && (
//             <Text style={styles.workoutName}>{workout.name}</Text>
//           )}

//           <View style={styles.actionButtons}>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Rest Timer</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>History</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Replace</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>More</Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.setsContainer}>
//             {sets.map((set, index) => (
//               <Swipeable
//                 key={index}
//                 ref={ref => swipeableRefs.current[index] = ref}
//                 renderLeftActions={(progress) => renderLeftActions(progress, index)}
//                 renderRightActions={(progress) => renderRightActions(progress, index)}
//                 overshootLeft={false}
//                 overshootRight={false}
//               >
//                 <Animated.View
//                   style={[
//                     styles.setRow,
//                     {
//                       borderWidth: outlineAnimations.current[index]?.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0, 2]
//                       }),
//                       borderColor: set.logged ? "#4caf50" : "transparent",
//                     }
//                   ]}
//                 >
//                   <View style={styles.setIndicator}>
//                     <Text style={styles.setNumber}>{index + 1}</Text>
//                   </View>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Reps</Text>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="number-pad"
//                       value={set.reps}
//                       onChangeText={(text) => updateSet(index, "reps", text)}
//                     />
//                   </View>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Weight (lb)</Text>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="number-pad"
//                       value={set.weight}
//                       onChangeText={(text) => updateSet(index, "weight", text)}
//                     />
//                   </View>
//                 </Animated.View>
//               </Swipeable>
//             ))}
//             <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
//               <Ionicons name="add-circle-outline" size={24} color="#ff4081" />
//               <Text style={styles.addSetButtonText}>Add Set</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <TouchableOpacity 
//             style={[
//               styles.logAllButton,
//               isAllSetsLogged && styles.logAllButtonDisabled
//             ]}
//             onPress={logAllSets}
//             disabled={isAllSetsLogged}
//           >
//             <Text style={styles.logAllButtonText}>
//               {isAllSetsLogged ? 'All Sets Logged' : 'Log All'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };


// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     height: "95%",
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 40,
//     paddingHorizontal: 20,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 15,
//     right: 20,
//   },
//   workoutVideo: {
//     width: "100%",
//     height: "40%",
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   workoutName: {
//     fontSize: 24,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//   },
//   actionButton: {
//     backgroundColor: "#f0f0f0",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 15,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   setsContainer: {
//     flex: 1,
//   },
//   setRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     elevation: 1,
//   },
//   setIndicator: {
//     width: 30,
//     alignItems: "center",
//   },
//   setNumber: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   inputContainer: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   inputLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   logButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 70,
//     height: 63,
//     // backgroundColor: "#4caf50",
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//     marginRight: 5,
//   },
//   deleteButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 70,
//     height: 63,
//     backgroundColor: "#ff5252",
//     borderRadius: 8,
//     marginLeft: 5,
//   },
//   actionText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 2,
//   },
//   addSetButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   addSetButtonText: {
//     marginLeft: 5,
//     color: "#ff4081",
//     fontSize: 16,
//   },
//   logAllButton: {
//     backgroundColor: "#02BFFF",
//     paddingVertical: 15,
//     borderRadius: 25,
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   logAllButtonDisabled: {
//     backgroundColor: "#ccc",
//   },
//   logAllButtonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//   },
// });


// export default WorkoutModal;






// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Animated,
// } from "react-native";
// import { Swipeable } from "react-native-gesture-handler";
// import { Video, ResizeMode } from "expo-av";
// import { Workout } from "../types/types";
// import { getWorkoutVideo } from "../utils/videoHelper";
// import { Ionicons } from "@expo/vector-icons";

// interface WorkoutModalProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
// }

// interface Set {
//   reps: string;
//   weight: string;
//   logged: boolean;
// }

// const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose }) => {
//   const [sets, setSets] = useState<Set[]>([
//     { reps: "12", weight: "10", logged: false },
//     { reps: "10", weight: "15", logged: false },
//     { reps: "8", weight: "20", logged: false },
//   ]);

//   const videoRef = useRef<Video | null>(null);
//   const swipeableRefs = useRef<(Swipeable | null)[]>([]);
//   const outlineAnimations = useRef<Animated.Value[]>([]);

//   // Initialize animations for each set
//   React.useEffect(() => {
//     outlineAnimations.current = sets.map(() => new Animated.Value(0));
//   }, [sets.length]);

//   const addSet = () => {
//     setSets([...sets, { reps: "6", weight: "0", logged: false }]);
//     outlineAnimations.current.push(new Animated.Value(0));
//   };

//   const updateSet = (index: number, field: "reps" | "weight", value: string) => {
//     const newSets = [...sets];
//     newSets[index][field] = value;
//     setSets(newSets);
//   };

//   const removeSet = (index: number) => {
//     swipeableRefs.current[index]?.close();
    
//     setTimeout(() => {
//       const newSets = sets.filter((_, i) => i !== index);
//       setSets(newSets);
//       outlineAnimations.current = outlineAnimations.current.filter((_, i) => i !== index);
//       swipeableRefs.current = swipeableRefs.current.filter((_, i) => i !== index);
//     }, 200);
//   };

//   const logRep = (index: number) => {
//     swipeableRefs.current[index]?.close();

//     Animated.sequence([
//       Animated.timing(outlineAnimations.current[index], {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//     ]).start();

//     setTimeout(() => {
//       const newSets = [...sets];
//       newSets[index].logged = true;
//       setSets(newSets);
//     }, 200);
//   };

//   const logAllSets = () => {
//     // Close all open swipeables first
//     swipeableRefs.current.forEach(ref => ref?.close());

//     // Create array of animation sequences
//     const animations = outlineAnimations.current.map((anim, index) => 
//       Animated.sequence([
//         Animated.delay(index * 100), // Stagger the animations
//         Animated.timing(anim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: false,
//         })
//       ])
//     );

//     // Run all animations in parallel
//     Animated.parallel(animations).start();

//     // Update all sets to logged status with a slight delay
//     setTimeout(() => {
//       const newSets = sets.map(set => ({ ...set, logged: true }));
//       setSets(newSets);
//     }, 200);
//   };

//   const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, index: number) => (
//     <TouchableOpacity
//       style={styles.logButton}
//       onPress={() => logRep(index)}
//     >
//       <Ionicons name="checkmark-done-outline" size={24} color="#fff" />
//       <Text style={styles.actionText}>Log</Text>
//     </TouchableOpacity>
//   );

//   const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, index: number) => (
//     <TouchableOpacity
//       style={styles.deleteButton}
//       onPress={() => removeSet(index)}
//     >
//       <Ionicons name="trash-outline" size={24} color="#fff" />
//       <Text style={styles.actionText}>Delete</Text>
//     </TouchableOpacity>
//   );

//   const isAllSetsLogged = sets.every(set => set.logged);

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//             <Ionicons name="close" size={24} color="#333" />
//           </TouchableOpacity>

//           {workout && getWorkoutVideo(workout.name) && (
//             <Video
//               ref={videoRef}
//               source={getWorkoutVideo(workout.name)}
//               style={styles.workoutVideo}
//               resizeMode={ResizeMode.COVER}
//               shouldPlay
//               isLooping
//             />
//           )}

//           {workout && (
//             <Text style={styles.workoutName}>{workout.name}</Text>
//           )}

//           <View style={styles.actionButtons}>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Rest Timer</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>History</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Replace</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>More</Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.setsContainer}>
//             {sets.map((set, index) => (
//               <Swipeable
//                 key={index}
//                 ref={ref => swipeableRefs.current[index] = ref}
//                 renderLeftActions={(progress) => renderLeftActions(progress, index)}
//                 renderRightActions={(progress) => renderRightActions(progress, index)}
//                 overshootLeft={false}
//                 overshootRight={false}
//               >
//                 <Animated.View
//                   style={[
//                     styles.setRow,
//                     {
//                       borderWidth: outlineAnimations.current[index]?.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0, 2]
//                       }),
//                       borderColor: set.logged ? "#4caf50" : "transparent",
//                     }
//                   ]}
//                 >
//                   <View style={styles.setIndicator}>
//                     <Text style={styles.setNumber}>{index + 1}</Text>
//                   </View>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Reps</Text>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="number-pad"
//                       value={set.reps}
//                       onChangeText={(text) => updateSet(index, "reps", text)}
//                     />
//                   </View>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Weight (lb)</Text>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="number-pad"
//                       value={set.weight}
//                       onChangeText={(text) => updateSet(index, "weight", text)}
//                     />
//                   </View>
//                 </Animated.View>
//               </Swipeable>
//             ))}
//             <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
//               <Ionicons name="add-circle-outline" size={24} color="#ff4081" />
//               <Text style={styles.addSetButtonText}>Add Set</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <TouchableOpacity 
//             style={[
//               styles.logAllButton,
//               isAllSetsLogged && styles.logAllButtonDisabled
//             ]}
//             onPress={logAllSets}
//             disabled={isAllSetsLogged}
//           >
//             <Text style={styles.logAllButtonText}>
//               {isAllSetsLogged ? 'All Sets Logged' : 'Log All'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };


// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     height: "95%",
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 40,
//     paddingHorizontal: 20,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 15,
//     right: 20,
//   },
//   workoutVideo: {
//     width: "100%",
//     height: "40%",
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   workoutName: {
//     fontSize: 24,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//   },
//   actionButton: {
//     backgroundColor: "#f0f0f0",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 15,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   setsContainer: {
//     flex: 1,
//   },
//   setRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     elevation: 1,
//   },
//   setIndicator: {
//     width: 30,
//     alignItems: "center",
//   },
//   setNumber: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   inputContainer: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   inputLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   logButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 70,
//     height: 63,
//     backgroundColor: "#4caf50",
//     borderRadius: 8,
//     marginRight: 5,
//   },
//   deleteButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 70,
//     height: 63,
//     backgroundColor: "#ff5252",
//     borderRadius: 8,
//     marginLeft: 5,
//   },
//   actionText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 2,
//   },
//   addSetButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   addSetButtonText: {
//     marginLeft: 5,
//     color: "#ff4081",
//     fontSize: 16,
//   },
//   logAllButton: {
//     backgroundColor: "#02BFFF",
//     paddingVertical: 15,
//     borderRadius: 25,
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   logAllButtonDisabled: {
//     backgroundColor: "#ccc",
//   },
//   logAllButtonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//   },
// });


// export default WorkoutModal;




// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
// } from "react-native";
// import { Swipeable } from "react-native-gesture-handler";
// import { Video, ResizeMode } from "expo-av";
// import { Workout } from "../types/types";
// import { getWorkoutVideo } from "../utils/videoHelper";
// import { Ionicons } from "@expo/vector-icons";

// interface WorkoutModalProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
// }

// interface Set {
//   reps: string;
//   weight: string;
// }

// const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose }) => {
//   const [sets, setSets] = useState<Set[]>([
//     { reps: "6", weight: "0" },
//     { reps: "6", weight: "0" },
//     { reps: "6", weight: "0" },
//   ]);

//   const videoRef = useRef<Video | null>(null);

//   const addSet = () => {
//     setSets([...sets, { reps: "6", weight: "0" }]);
//   };

//   const updateSet = (index: number, field: "reps" | "weight", value: string) => {
//     const newSets = [...sets];
//     newSets[index][field] = value;
//     setSets(newSets);
//   };

//   const removeSet = (index: number) => {
//     const newSets = sets.filter((_, i) => i !== index);
//     setSets(newSets);
//   };

//   const logRep = (index: number) => {
//     alert(`Reps logged for Set ${index + 1}!`);
//     // Additional logic for logging reps can be added here
//   };

//   // Render Left Action (Log Rep)
//   const renderLeftActions = (index: number) => (
//     <TouchableOpacity
//       style={styles.logButton}
//       onPress={() => logRep(index)}
//     >
//       <Ionicons name="checkmark-done-outline" size={24} color="#fff" />
//       <Text style={styles.actionText}>Log</Text>
//     </TouchableOpacity>
//   );

//   // Render Right Action (Delete Set)
//   const renderRightActions = (index: number) => (
//     <TouchableOpacity
//       style={styles.deleteButton}
//       onPress={() => removeSet(index)}
//     >
//       <Ionicons name="trash-outline" size={24} color="#fff" />
//       <Text style={styles.actionText}>Delete</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           {/* Close Button */}
//           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//             <Ionicons name="close" size={24} color="#333" />
//           </TouchableOpacity>

//           {/* Video Section */}
//           {workout && getWorkoutVideo(workout.name) && (
//             <Video
//               ref={videoRef}
//               source={getWorkoutVideo(workout.name)}
//               style={styles.workoutVideo}
//               resizeMode={ResizeMode.COVER}
//               shouldPlay
//               isLooping
//             />
//           )}

//           {/* Workout Name */}
//           {workout && (
//             <Text style={styles.workoutName}>{workout.name}</Text>
//           )}

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Rest Timer</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>History</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Replace</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>More</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Sets and Reps Section */}
//           <ScrollView style={styles.setsContainer}>
//             {sets.map((set, index) => (
//               <Swipeable
//                 key={index}
//                 renderLeftActions={() => renderLeftActions(index)}
//                 renderRightActions={() => renderRightActions(index)}
//               >
//                 <View style={styles.setRow}>
//                   <View style={styles.setIndicator}>
//                     <Text style={styles.setNumber}>{index + 1}</Text>
//                   </View>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Reps</Text>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="number-pad"
//                       value={set.reps}
//                       onChangeText={(text) => updateSet(index, "reps", text)}
//                     />
//                   </View>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Weight (lb)</Text>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="number-pad"
//                       value={set.weight}
//                       onChangeText={(text) => updateSet(index, "weight", text)}
//                     />
//                   </View>
//                 </View>
//               </Swipeable>
//             ))}
//             <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
//               <Ionicons name="add-circle-outline" size={24} color="#ff4081" />
//               <Text style={styles.addSetButtonText}>Add Set</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           {/* Start Workout Button */}
//           <TouchableOpacity style={styles.startWorkoutButton}>
//             <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     height: "95%",
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 40,
//     paddingHorizontal: 20,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 15,
//     right: 20,
//   },
//   workoutVideo: {
//     width: "100%",
//     height: "40%",
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   workoutName: {
//     fontSize: 24,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//   },
//   actionButton: {
//     backgroundColor: "#f0f0f0",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 15,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   setsContainer: {
//     flex: 1,
//   },
//   setRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     elevation: 1,
//   },
//   setIndicator: {
//     width: 30,
//     alignItems: "center",
//   },
//   setNumber: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   inputContainer: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   inputLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   logButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 70,
//     height: 63,
//     backgroundColor: "#4caf50",
//     borderRadius: 8,
//     marginRight: 5,
//   },
//   deleteButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 70,
//     height: 63,
//     backgroundColor: "#ff5252",
//     borderRadius: 8,
//     marginLeft: 5,
//   },
//   actionText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 2,
//   },
//   addSetButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   addSetButtonText: {
//     marginLeft: 5,
//     color: "#ff4081",
//     fontSize: 16,
//   },
//   startWorkoutButton: {
//     backgroundColor: "#ff4081",
//     paddingVertical: 15,
//     borderRadius: 25,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   startWorkoutButtonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//   },
// });

// export default WorkoutModal;




// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
// } from 'react-native';
// import { Swipeable } from 'react-native-gesture-handler';

// import { Video, ResizeMode } from 'expo-av';
// import { Workout } from '../types/types';
// import { getWorkoutVideo } from '../utils/videoHelper';
// import { Ionicons } from '@expo/vector-icons';

// interface WorkoutModalProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
// }

// interface Set {
//   reps: string;
//   weight: string;
// }

// const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose }) => {
//   const [sets, setSets] = useState<Set[]>([
//     { reps: '6', weight: '0' },
//     { reps: '6', weight: '0' },
//     { reps: '6', weight: '0' },
//   ]);

//   const videoRef = useRef<Video | null>(null);

//   const addSet = () => {
//     setSets([...sets, { reps: '6', weight: '0' }]);
//   };

//   const updateSet = (index: number, field: 'reps' | 'weight', value: string) => {
//     const newSets = [...sets];
//     newSets[index][field] = value;
//     setSets(newSets);
//   };

//   const removeSet = (index: number) => {
//     const newSets = sets.filter((_, i) => i !== index);
//     setSets(newSets);
//   };

//   const renderRightActions = (index: number) => (
//     <TouchableOpacity
//       style={styles.deleteButton}
//       onPress={() => removeSet(index)}
//     >
//       <Ionicons name="trash" size={24} color="#fff" />
//       <Text style={styles.deleteText}>Delete</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//             <Ionicons name="close" size={24} color="#333" />
//           </TouchableOpacity>

//           {workout && getWorkoutVideo(workout.name) && (
//             <Video
//               ref={videoRef}
//               source={getWorkoutVideo(workout.name)}
//               style={styles.workoutVideo}
//               resizeMode={ResizeMode.COVER}
//               shouldPlay
//               isLooping
//             />
//           )}

//           {workout && <Text style={styles.workoutName}>{workout.name}</Text>}

//           <View style={styles.actionButtons}>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Rest Timer</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>History</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Replace</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>More</Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.setsContainer}>
//             {sets.map((set, index) => (
//               <Swipeable key={index} renderRightActions={() => renderRightActions(index)}>
//                 <View style={styles.setRow}>
//                   <View style={styles.setIndicator}>
//                     <Text style={styles.setNumber}>{index + 1}</Text>
//                   </View>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Reps</Text>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="number-pad"
//                       value={set.reps}
//                       onChangeText={(text) => updateSet(index, 'reps', text)}
//                     />
//                   </View>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Weight (lb)</Text>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="number-pad"
//                       value={set.weight}
//                       onChangeText={(text) => updateSet(index, 'weight', text)}
//                     />
//                   </View>
//                 </View>
//               </Swipeable>
//             ))}
//             <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
//               <Ionicons name="add-circle-outline" size={24} color="#ff4081" />
//               <Text style={styles.addSetButtonText}>Add Set</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <TouchableOpacity style={styles.startWorkoutButton}>
//             <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
//           </TouchableOpacity>
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
//   modalContainer: {
//     height: '95%',
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 40,
//     paddingHorizontal: 20,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     right: 20,
//   },
//   workoutVideo: {
//     width: '100%',
//     height: '40%',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   workoutName: {
//     fontSize: 24,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//   },
//   actionButton: {
//     backgroundColor: '#f0f0f0',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 15,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   setsContainer: {
//     flex: 1,
//   },
//   setRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     // height: 70,
//     marginBottom: 15,
//     backgroundColor: '#f9f9f9',
//     padding: 10,
//     borderRadius: 8,
//   },
//   setIndicator: {
//     width: 30,
//     alignItems: 'center',
//   },
//   setNumber: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   inputLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   deleteButton: {
//     backgroundColor: '#ff5252',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 65,
//     height: 72,
//     borderRadius: 8,
//   },
//   deleteText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   addSetButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   addSetButtonText: {
//     marginLeft: 5,
//     color: '#ff4081',
//     fontSize: 16,
//   },
//   startWorkoutButton: {
//     backgroundColor: '#ff4081',
//     paddingVertical: 15,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   startWorkoutButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//   },
// });

// export default WorkoutModal;




// import React, { useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   Modal, 
//   TouchableOpacity, 
//   ScrollView, 
//   TextInput 
// } from 'react-native';
// import { Swipeable } from 'react-native-gesture-handler';
// import { Video, ResizeMode } from 'expo-av'; // Import Video and ResizeMode
// import { Workout } from '../types/types';
// import { getWorkoutVideo } from '../utils/videoHelper'; // Import video helper
// import { Ionicons } from '@expo/vector-icons';

// interface WorkoutModalProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
// }

// interface Set {
//   reps: string;
//   weight: string;
// }

// const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose }) => {
//   const [sets, setSets] = useState<Set[]>([
//     { reps: '6', weight: '0' },
//     { reps: '6', weight: '0' },
//     { reps: '6', weight: '0' },
//   ]);

//   const videoRef = useRef<Video | null>(null);

//   const addSet = () => {
//     setSets([...sets, { reps: '6', weight: '0' }]);
//   };

//   const updateSet = (index: number, field: 'reps' | 'weight', value: string) => {
//     const newSets = [...sets];
//     newSets[index][field] = value;
//     setSets(newSets);
//   };
  
//   const removeSet = (index: number) => {
//     const newSets = sets.filter((_, i) => i !== index);
//     setSets(newSets); // Update sets state
//   }

//   const renderRightActions = (index:number) => {
//     <TouchableOpacity 
//     style = {styles.deleteButtons}
//     onPress= {() => removeSet(index)} 
//     >
//     <Ionicons name="trash" size={24} color="#fff" />

//     </TouchableOpacity>

//   }

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           {/* Close Button */}
//           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//             <Ionicons name="close" size={24} color="#333" />
//           </TouchableOpacity>

//           {/* Video Section */}
//           {workout && getWorkoutVideo(workout.name) && (
//             <Video
//               ref={videoRef}
//               source={getWorkoutVideo(workout.name)}
//               style={styles.workoutVideo}
//               resizeMode={ResizeMode.COVER}
//               shouldPlay
//               isLooping // Enable infinite loop
//             />
//           )}

//           {/* Workout Name */}
//           {workout && (
//             <Text style={styles.workoutName}>{workout.name}</Text>
//           )}

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Rest Timer</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>History</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>Replace</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Text style={styles.actionButtonText}>More</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Sets and Reps Section */}
//           <ScrollView style={styles.setsContainer}>
//             {sets.map((set, index) => (
//               <View key={index} style={styles.setRow}>
//                 <View style={styles.setIndicator}>
//                   <Text style={styles.setNumber}>{index + 1}</Text>
//                 </View>
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Reps</Text>
//                   <TextInput
//                     style={styles.input}
//                     keyboardType="number-pad"
//                     value={set.reps}
//                     onChangeText={(text) => updateSet(index, 'reps', text)}
//                   />
//                 </View>
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Weight (lb)</Text>
//                   <TextInput
//                     style={styles.input}
//                     keyboardType="number-pad"
//                     value={set.weight}
//                     onChangeText={(text) => updateSet(index, 'weight', text)}
//                   />
//                 </View>
//                 <TouchableOpacity style={styles.lockIcon}>
//                   <Ionicons name="lock-closed-outline" size={20} color="#666" />
//                 </TouchableOpacity>
//               </View>
//             ))}
//             <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
//               <Ionicons name="add-circle-outline" size={24} color="#ff4081" />
//               <Text style={styles.addSetButtonText}>Add Set</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           {/* Start Workout Button */}
//           <TouchableOpacity style={styles.startWorkoutButton}>
//             <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     height: '95%',
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 40,
//     paddingHorizontal: 20,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 15,
//     right: 20,
//   },
//   workoutVideo: {
//     width: '100%',
//     height: '40%',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   workoutName: {
//     fontSize: 24,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//   },
//   actionButton: {
//     backgroundColor: '#f0f0f0',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 15,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   setsContainer: {
//     flex: 1,
//   },
//   setRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   setIndicator: {
//     width: 30,
//     alignItems: 'center',
//   },
//   setNumber: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   inputLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   deleteButtons: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 70,
//     backgroundColor: '#ff5252',
//     borderRadius: 8,
//   },
//   lockIcon: {
//     padding: 5,
//   },
//   addSetButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   addSetButtonText: {
//     marginLeft: 5,
//     color: '#ff4081',
//     fontSize: 16,
//   },
//   startWorkoutButton: {
//     backgroundColor: '#ff4081',
//     paddingVertical: 15,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   startWorkoutButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//   },
// });

// export default WorkoutModal;







// // // components/WorkoutModal.tsx

// // import React, { useState } from 'react';
// // import { 
// //   View, 
// //   Text, 
// //   StyleSheet, 
// //   Modal, 
// //   TouchableOpacity, 
// //   Image, 
// //   TextInput, 
// //   ScrollView 
// // } from 'react-native';
// // import { Workout } from '../types/types';
// // import { getWorkoutImage} from '../utils/imageHelper';
// // import { getWorkoutVideo } from '../utils/videoHelper'; // Import the new helper
// // import { Ionicons } from '@expo/vector-icons'; // For icons

// // interface WorkoutModalProps {
// //   visible: boolean;
// //   workout: Workout | null;
// //   onClose: () => void;
// // }

// // interface Set {
// //   reps: string;
// //   weight: string;
// // }

// // const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose }) => {
// //   const [sets, setSets] = useState<Set[]>([
// //     { reps: '6', weight: '0' },
// //     { reps: '6', weight: '0' },
// //     { reps: '6', weight: '0' },
// //   ]);

// //   const addSet = () => {
// //     setSets([...sets, { reps: '6', weight: '0' }]);
// //   };

// //   const updateSet = (index: number, field: 'reps' | 'weight', value: string) => {
// //     const newSets = [...sets];
// //     newSets[index][field] = value;
// //     setSets(newSets);
// //   };

// //   return (
// //     <Modal
// //       visible={visible}
// //       animationType="slide"
// //       transparent={true}
// //       onRequestClose={onClose}
// //     >
// //       <View style={styles.modalOverlay}>
// //         <View style={styles.modalContainer}>
// //           {/* Close Button */}
// //           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
// //             <Ionicons name="close" size={24} color="#333" />
// //           </TouchableOpacity>

// //           {/* Image Section */}
// //           {workout && (
// //             <Image 
// //               source={getWorkoutVideo(workout.name)} 
// //               style={styles.workoutImage} 
// //               resizeMode="cover" 
// //             />
// //           )}

// //           {/* Workout Name */}
// //           {workout && (
// //             <Text style={styles.workoutName}>{workout.name}</Text>
// //           )}

// //           {/* Action Buttons */}
// //           <View style={styles.actionButtons}>
// //             <TouchableOpacity style={styles.actionButton}>
// //               <Text style={styles.actionButtonText}>Rest Timer</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity style={styles.actionButton}>
// //               <Text style={styles.actionButtonText}>History</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity style={styles.actionButton}>
// //               <Text style={styles.actionButtonText}>Replace</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity style={styles.actionButton}>
// //               <Text style={styles.actionButtonText}>More</Text>
// //             </TouchableOpacity>
// //           </View>

// //           {/* Sets and Reps Section */}
// //           <ScrollView style={styles.setsContainer}>
// //             {sets.map((set, index) => (
// //               <View key={index} style={styles.setRow}>
// //                 {/* Set Indicator */}
// //                 <View style={styles.setIndicator}>
// //                   <Text style={styles.setNumber}>{index + 1}</Text>
// //                 </View>

// //                 {/* Reps Input */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Reps</Text>
// //                   <TextInput
// //                     style={styles.input}
// //                     keyboardType="number-pad"
// //                     value={set.reps}
// //                     onChangeText={(text) => updateSet(index, 'reps', text)}
// //                   />
// //                 </View>

// //                 {/* Weight Input */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Weight (lb)</Text>
// //                   <TextInput
// //                     style={styles.input}
// //                     keyboardType="number-pad"
// //                     value={set.weight}
// //                     onChangeText={(text) => updateSet(index, 'weight', text)}
// //                   />
// //                 </View>

// //                 {/* Lock Icon (Optional) */}
// //                 <TouchableOpacity style={styles.lockIcon}>
// //                   <Ionicons name="lock-closed-outline" size={20} color="#666" />
// //                 </TouchableOpacity>
// //               </View>
// //             ))}

// //             {/* Add Set Button */}
// //             <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
// //               <Ionicons name="add-circle-outline" size={24} color="#ff4081" />
// //               <Text style={styles.addSetButtonText}>Add Set</Text>
// //             </TouchableOpacity>
// //           </ScrollView>

// //           {/* Start Workout Button */}
// //           <TouchableOpacity style={styles.startWorkoutButton}>
// //             <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
// //     justifyContent: 'flex-end',
// //   },
// //   modalContainer: {
// //     height: '95%',
// //     backgroundColor: '#fff',
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     paddingTop: 40, // Increased to accommodate close button
// //     paddingHorizontal: 20,
// //   },
// //   closeButton: {
// //     position: 'absolute',
// //     top: 15,
// //     right: 20,
// //     zIndex: 1,
// //   },
// //   workoutImage: {
// //     width: '100%',
// //     height: '30%', // 30% of modal height
// //     borderRadius: 10,
// //     marginBottom: 10,
// //   },
// //   workoutName: {
// //     fontSize: 24,
// //     fontWeight: '700',
// //     textAlign: 'center',
// //     marginBottom: 10,
// //   },
// //   actionButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     marginBottom: 20,
// //   },
// //   actionButton: {
// //     backgroundColor: '#f0f0f0',
// //     paddingVertical: 6,
// //     paddingHorizontal: 12,
// //     borderRadius: 15,
// //   },
// //   actionButtonText: {
// //     fontSize: 14,
// //     color: '#333',
// //   },
// //   setsContainer: {
// //     flex: 1,
// //     marginBottom: 20,
// //   },
// //   setRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 15,
// //   },
// //   setIndicator: {
// //     width: 30,
// //     alignItems: 'center',
// //   },
// //   setNumber: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   inputContainer: {
// //     flex: 1,
// //     marginHorizontal: 10,
// //   },
// //   inputLabel: {
// //     fontSize: 12,
// //     color: '#666',
// //     marginBottom: 4,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     borderRadius: 8,
// //     paddingHorizontal: 10,
// //     paddingVertical: 8,
// //     fontSize: 16,
// //     color: '#333',
// //   },
// //   lockIcon: {
// //     padding: 5,
// //   },
// //   addSetButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginTop: 10,
// //   },
// //   addSetButtonText: {
// //     color: '#ff4081',
// //     fontSize: 16,
// //     marginLeft: 5,
// //   },
// //   startWorkoutButton: {
// //     backgroundColor: '#ff4081',
// //     paddingVertical: 15,
// //     borderRadius: 25,
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   startWorkoutButtonText: {
// //     color: '#fff',
// //     fontSize: 18,
// //     fontWeight: '700',
// //   },
// // });

// // export default WorkoutModal;
