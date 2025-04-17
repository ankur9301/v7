import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutContext } from '../../context/WorkoutContext'; 
import { Workout } from '../../types/types';
import { useRouter } from 'expo-router';
import Stopwatch from '../../components/Stopwatch';
import WorkoutCard from '../../components/WorkoutCard';
import WorkoutModal from '../../components/WorkoutModal';
import AddExerciseModal from '../../components/AddExerciseModal';
import { workouts as allWorkouts } from '../../constants/data';

const { height } = Dimensions.get('window');

const WorkingOut: React.FC = () => {
  const { workoutPlan, setWorkoutPlan } = useContext(WorkoutContext);
  const router = useRouter();
  const workout_count = workoutPlan.length;
  
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [workoutToReplace, setWorkoutToReplace] = useState<Workout | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  /** Remove Workout */
  const handleRemoveExercise = (workout: Workout) => {
    Alert.alert(
      "Confirm Removal",
      `Are you sure you want to remove ${workout.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          onPress: () => {
            setWorkoutPlan(workoutPlan.filter(w => w.id !== workout.id));
            Alert.alert("Workout Removed", `${workout.name} has been removed.`);
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
    Alert.alert("Workout Replaced", `${workoutToReplace.name} has been replaced.`);
  };

  if (workoutPlan.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>No workout plan found. Please generate a workout plan first.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Exit Button */}
      <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
        <Text style={styles.exitButtonText}>X</Text>
      </TouchableOpacity>

      {/* Stopwatch Section */}
      <View style={styles.stopwatchContainer}>
        <Stopwatch />
      </View>

      {/* Workout List Section */}
      <View style={styles.listContainer}>
        <Text style={styles.title}>{workout_count} exercises</Text>
        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        
        {/* Workout Cards with Menu */}
        <WorkoutCard
          data={workoutPlan}
          showMenu={true}
          onPress={(workout) => {
            setSelectedWorkout(workout);
            setModalVisible(true);
          }}
          onAddNote={(workout) => console.log(`Adding note for ${workout.name}`)}
          onReplaceExercise={handleReplaceExercise}
          onRemoveExercise={handleRemoveExercise}
        />
      </View>

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
        onSelectWorkout={(selected) => setWorkoutPlan([...workoutPlan, ...selected])}
        multipleSelection={true}
      />

      {/* Replace Exercise Modal */}
      <AddExerciseModal
        visible={replaceModalVisible}
        onClose={() => setReplaceModalVisible(false)}
        workouts={allWorkouts}
        onSelectWorkout={handleReplaceWorkoutSelection}
        multipleSelection={false} // Only allow replacing with one workout
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc', 
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: '#ef4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  addButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    lineHeight: 24,
  },
  stopwatchContainer: {
    height: height * 0.25, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1, 
    paddingHorizontal:8,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 8,
    textAlign: 'left',
    color: '#1f2937',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
});

export default WorkingOut;

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