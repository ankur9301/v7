import React, { useState, useRef } from "react";
import {
  View,
  FlatList,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { Workout } from "../types/types";
import { getWorkoutImage } from "../utils/imageHelper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface WorkoutCardProps {
  data: Workout[];
  onPress?: (workout: Workout) => void;
  selectedWorkouts?: number[];
  multipleSelection?: boolean;
  showMenu?: boolean;
  onAddNote?: (workout: Workout) => void;
  onReplaceExercise?: (workout: Workout) => void;
  onRemoveExercise?: (workout: Workout) => void;
  isDarkMode?: boolean;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  data,
  onPress,
  selectedWorkouts = [],
  multipleSelection = false,
  showMenu = false,
  onAddNote,
  onReplaceExercise,
  onRemoveExercise,
  isDarkMode = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handleMenuPress = (workout: Workout, event: any) => {
    event.stopPropagation(); // Prevent triggering workout modal when clicking the menu

    const dotsIconRef = event.target;
    dotsIconRef.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      const screenHeight = Dimensions.get('window').height;
      const menuHeight = 160;
      const spaceBelow = screenHeight - pageY - height;
      
      if (spaceBelow < menuHeight && pageY > menuHeight) {
        setMenuPosition({
          top: pageY - menuHeight,
          right: Dimensions.get('window').width - (pageX + width),
        });
      } else {
        setMenuPosition({
          top: pageY + height,
          right: Dimensions.get('window').width - (pageX + width),
        });
      }
    });
    
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const handleMenuOptionPress = (action: 'note' | 'replace' | 'remove') => {
    if (!selectedWorkout) return;
    
    // Add haptic feedback here
    
    switch (action) {
      case 'note':
        onAddNote?.(selectedWorkout);
        break;
      case 'replace':
        onReplaceExercise?.(selectedWorkout);
        break;
      case 'remove':
        onRemoveExercise?.(selectedWorkout);
        break;
    }
    setModalVisible(false);
  };
  
  const handleCardPress = (workout: Workout) => {
    // Animate card press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    onPress?.(workout);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="barbell-outline" size={60} color={isDarkMode ? "#444" : "#ccc"} />
      <Text style={[styles.emptyText, { color: isDarkMode ? "#ccc" : "#6b7280" }]}>No workouts found</Text>
      <Text style={[styles.emptySubtext, { color: isDarkMode ? "#999" : "#9ca3af" }]}>Try adjusting your filters</Text>
    </View>
  );

  return (
    <>
      {data.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedWorkouts?.includes(Number(item.id));
            return (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  onPress={() => handleCardPress(item)}
                  activeOpacity={0.9}
                  style={styles.cardContainer}
                >
                  <View style={[
                    styles.card, 
                    isSelected && styles.cardSelected,
                    { backgroundColor: isDarkMode ? '#111' : 'white' }
                  ]}>
                    <Image
                      source={getWorkoutImage(item.name)}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <View style={styles.info}>
                      <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#1f2937' }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.tagContainer}>
                        <View style={[styles.tag, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(67, 97, 238, 0.08)' }]}>
                          <Ionicons name="body-outline" size={12} color={isDarkMode ? "#FF9500" : "#4361ee"} style={styles.tagIcon} />
                          <Text style={[styles.tagText, { color: isDarkMode ? "#FF9500" : "#4361ee" }]}>{item.muscle}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(67, 97, 238, 0.08)' }]}>
                          <Ionicons name="barbell-outline" size={12} color={isDarkMode ? "#FF9500" : "#4361ee"} style={styles.tagIcon} />
                          <Text style={[styles.tagText, { color: isDarkMode ? "#FF9500" : "#4361ee" }]}>{item.category}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(67, 97, 238, 0.08)' }]}>
                          <Ionicons name="star-outline" size={12} color={isDarkMode ? "#FF9500" : "#4361ee"} style={styles.tagIcon} />
                          <Text style={[styles.tagText, { color: isDarkMode ? "#FF9500" : "#4361ee" }]}>{item.level}</Text>
                        </View>
                      </View>
                    </View>
                    {showMenu ? (
                      <TouchableOpacity
                        style={[styles.menuIcon, { backgroundColor: isDarkMode ? '#222' : '#f3f4f6' }]}
                        onPress={(event) => handleMenuPress(item, event)}
                      >
                        <Ionicons name="ellipsis-vertical" size={20} color={isDarkMode ? "#999" : "#6b7280"} />
                      </TouchableOpacity>
                    ) : item.isCustom && onRemoveExercise ? (
                      <TouchableOpacity
                        style={[styles.menuIcon, { backgroundColor: isDarkMode ? '#222' : '#f3f4f6' }]}
                        onPress={() => {
                          Alert.alert(
                            "Delete Custom Exercise",
                            `Are you sure you want to delete "${item.name}"?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                onPress: () => onRemoveExercise?.(item),
                                style: "destructive",
                              },
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash-outline" size={20} color={isDarkMode ? "#f87171" : "#ef4444"} />
                      </TouchableOpacity>
                    ) : null}



                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {modalVisible && selectedWorkout && (
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          >
            <View style={[
              styles.menuContent,
              {
                position: 'absolute',
                top: menuPosition.top,
                right: menuPosition.right,
                backgroundColor: isDarkMode ? '#2B3036' : '#2B3036',
              }
            ]}>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => handleMenuOptionPress('note')}
              >
                <Ionicons name="create-outline" size={20} color="#fff" style={styles.menuOptionIcon} />
                <Text style={styles.menuOptionText}>Add a Note</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => handleMenuOptionPress('replace')}
              >
                <Ionicons name="swap-horizontal-outline" size={20} color="#fff" style={styles.menuOptionIcon} />
                <Text style={styles.menuOptionText}>Replace Exercise</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => handleMenuOptionPress('remove')}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" style={styles.menuOptionIcon} />
                <Text style={styles.menuOptionText}>Remove Exercise</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuContent: {
    width: 220,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuOptionIcon: {
    marginRight: 12,
  },
  menuOptionText: {
    fontSize: 16,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default WorkoutCard;

// import React, { useState, useRef } from "react";
// import {
//   View,
//   FlatList,
//   Image,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Dimensions,
//   Animated,
// } from "react-native";
// import { Workout } from "../types/types";
// import { getWorkoutImage } from "../utils/imageHelper";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";

// const { width } = Dimensions.get("window");

// interface WorkoutCardProps {
//   data: Workout[];
//   onPress?: (workout: Workout) => void;
//   selectedWorkouts?: number[];
//   multipleSelection?: boolean;
//   showMenu?: boolean;
//   onAddNote?: (workout: Workout) => void;
//   onReplaceExercise?: (workout: Workout) => void;
//   onRemoveExercise?: (workout: Workout) => void;
// }

// const WorkoutCard: React.FC<WorkoutCardProps> = ({
//   data,
//   onPress,
//   selectedWorkouts = [],
//   multipleSelection = false,
//   showMenu = false,
//   onAddNote,
//   onReplaceExercise,
//   onRemoveExercise,
// }) => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
//   const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  
//   const scaleAnim = useRef(new Animated.Value(1)).current;
  
//   const handleMenuPress = (workout: Workout, event: any) => {
//     event.stopPropagation(); // Prevent triggering workout modal when clicking the menu

//     const dotsIconRef = event.target;
//     dotsIconRef.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
//       const screenHeight = Dimensions.get('window').height;
//       const menuHeight = 160;
//       const spaceBelow = screenHeight - pageY - height;
      
//       if (spaceBelow < menuHeight && pageY > menuHeight) {
//         setMenuPosition({
//           top: pageY - menuHeight,
//           right: Dimensions.get('window').width - (pageX + width),
//         });
//       } else {
//         setMenuPosition({
//           top: pageY + height,
//           right: Dimensions.get('window').width - (pageX + width),
//         });
//       }
//     });
    
//     setSelectedWorkout(workout);
//     setModalVisible(true);
//   };

//   const handleMenuOptionPress = (action: 'note' | 'replace' | 'remove') => {
//     if (!selectedWorkout) return;
    
//     // Add haptic feedback here
    
//     switch (action) {
//       case 'note':
//         onAddNote?.(selectedWorkout);
//         break;
//       case 'replace':
//         onReplaceExercise?.(selectedWorkout);
//         break;
//       case 'remove':
//         onRemoveExercise?.(selectedWorkout);
//         break;
//     }
//     setModalVisible(false);
//   };
  
//   const handleCardPress = (workout: Workout) => {
//     // Animate card press
//     Animated.sequence([
//       Animated.timing(scaleAnim, {
//         toValue: 0.95,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       })
//     ]).start();
    
//     onPress?.(workout);
//   };

//   const renderEmptyState = () => (
//     <View style={styles.emptyContainer}>
//       <Ionicons name="barbell-outline" size={60} color="#ccc" />
//       <Text style={styles.emptyText}>No workouts found</Text>
//       <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
//     </View>
//   );

//   return (
//     <>
//       {data.length === 0 ? (
//         renderEmptyState()
//       ) : (
//         <FlatList
//           data={data}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => {
//             const isSelected = selectedWorkouts?.includes(item.id);
//             return (
//               <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//                 <TouchableOpacity
//                   onPress={() => handleCardPress(item)}
//                   activeOpacity={0.9}
//                   style={styles.cardContainer}
//                 >
//                   <View style={[styles.card, isSelected && styles.cardSelected]}>
//                     <Image
//                       source={getWorkoutImage(item.name)}
//                       style={styles.image}
//                       resizeMode="cover"
//                     />
//                     <View style={styles.info}>
//                       <Text style={styles.name} numberOfLines={1}>
//                         {item.name}
//                       </Text>
//                       <View style={styles.tagContainer}>
//                         <View style={styles.tag}>
//                           <Ionicons name="body-outline" size={12} color="#4361ee" style={styles.tagIcon} />
//                           <Text style={styles.tagText}>{item.muscle}</Text>
//                         </View>
//                         <View style={styles.tag}>
//                           <Ionicons name="barbell-outline" size={12} color="#4361ee" style={styles.tagIcon} />
//                           <Text style={styles.tagText}>{item.category}</Text>
//                         </View>
//                         <View style={styles.tag}>
//                           <Ionicons name="star-outline" size={12} color="#4361ee" style={styles.tagIcon} />
//                           <Text style={styles.tagText}>{item.level}</Text>
//                         </View>
//                       </View>
//                     </View>
//                     {showMenu && (
//                       <TouchableOpacity
//                         style={styles.menuIcon}
//                         onPress={(event) => handleMenuPress(item, event)}
//                       >
//                         <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
//                       </TouchableOpacity>
//                     )}
//                     {isSelected && (
//                       <View style={styles.selectedIndicator}>
//                         <Ionicons name="checkmark-circle" size={24} color="#10B981" />
//                       </View>
//                     )}
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             );
//           }}
//           contentContainerStyle={styles.list}
//           showsVerticalScrollIndicator={false}
//         />
//       )}

//       {modalVisible && selectedWorkout && (
//         <Modal
//           animationType="fade"
//           transparent
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <TouchableOpacity 
//             style={styles.modalOverlay} 
//             activeOpacity={1} 
//             onPress={() => setModalVisible(false)}
//           >
//             <View style={[
//               styles.menuContent,
//               {
//                 position: 'absolute',
//                 top: menuPosition.top,
//                 right: menuPosition.right,
//               }
//             ]}>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('note')}
//               >
//                 <Ionicons name="create-outline" size={20} color="#fff" style={styles.menuOptionIcon} />
//                 <Text style={styles.menuOptionText}>Add a Note</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('replace')}
//               >
//                 <Ionicons name="swap-horizontal-outline" size={20} color="#fff" style={styles.menuOptionIcon} />
//                 <Text style={styles.menuOptionText}>Replace Exercise</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('remove')}
//               >
//                 <Ionicons name="trash-outline" size={20} color="#fff" style={styles.menuOptionIcon} />
//                 <Text style={styles.menuOptionText}>Remove Exercise</Text>
//               </TouchableOpacity>
//             </View>
//           </TouchableOpacity>
//         </Modal>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   list: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   cardContainer: {
//     marginBottom: 16,
//   },
//   card: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     alignItems: 'center',
//     padding: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     position: 'relative',
//   },
//   cardSelected: {
//     borderWidth: 2,
//     borderColor: '#10B981',
//     backgroundColor: 'rgba(16, 185, 129, 0.05)',
//   },
//   image: {
//     width: 70,
//     height: 70,
//     borderRadius: 10,
//     marginRight: 12,
//   },
//   info: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 6,
//     color: '#1f2937',
//   },
//   tagContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   tag: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(67, 97, 238, 0.08)',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginRight: 6,
//     marginBottom: 4,
//   },
//   tagIcon: {
//     marginRight: 4,
//   },
//   tagText: {
//     fontSize: 12,
//     color: '#4361ee',
//     fontWeight: '500',
//   },
//   menuIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#f3f4f6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   selectedIndicator: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//   },
//   menuContent: {
//     width: 220,
//     backgroundColor: '#2B3036',
//     borderRadius: 12,
//     paddingVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   menuOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   menuOptionIcon: {
//     marginRight: 12,
//   },
//   menuOptionText: {
//     fontSize: 16,
//     color: 'white',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#6b7280',
//     marginTop: 16,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#9ca3af',
//     marginTop: 8,
//   },
// });

// export default WorkoutCard;


// import React, { useState, useRef } from "react";
// import {
//   View,
//   FlatList,
//   Image,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Dimensions,
// } from "react-native";
// import { Workout } from "../types/types";
// import { getWorkoutImage } from "../utils/imageHelper";
// import { Entypo } from "@expo/vector-icons";

// const SCREEN_HEIGHT = Dimensions.get("window").height;

// interface WorkoutCardProps {
//   data: Workout[];
//   onPress?: (workout: Workout) => void;
//   selectedWorkouts?: number[];
//   multipleSelection?: boolean;
//   showMenu?: boolean;
//   onAddNote?: (workout: Workout) => void;
//   onReplaceExercise?: (workout: Workout) => void;
//   onRemoveExercise?: (workout: Workout) => void;
// }

// const WorkoutCard: React.FC<WorkoutCardProps> = ({
//   data,
//   onPress,
//   selectedWorkouts = [],
//   multipleSelection = false,
//   showMenu = false,
//   onAddNote,
//   onReplaceExercise,
//   onRemoveExercise,
// }) => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
//   const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
//   const [menuDirection, setMenuDirection] = useState<'down' | 'up'>('down');

//   const handleMenuPress = (workout: Workout, event: any) => {
//     event.stopPropagation(); // Prevent triggering workout modal when clicking the menu

//     const dotsIconRef = event.target;
//     dotsIconRef.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
//       const screenHeight = Dimensions.get('window').height;
//       const menuHeight = 144;
//       const spaceBelow = screenHeight - pageY - height;
      
//       if (spaceBelow < menuHeight && pageY > menuHeight) {
//         setMenuDirection('up');
//         setMenuPosition({
//           top: pageY - menuHeight,
//           right: Dimensions.get('window').width - (pageX + width),
//         });
//       } else {
//         setMenuDirection('down');
//         setMenuPosition({
//           top: pageY + height,
//           right: Dimensions.get('window').width - (pageX + width),
//         });
//       }
//     });
    
//     setSelectedWorkout(workout);
//     setModalVisible(true);
//   };

//   const handleMenuOptionPress = (action: 'note' | 'replace' | 'remove') => {
//     if (!selectedWorkout) return;
//     switch (action) {
//       case 'note':
//         onAddNote?.(selectedWorkout);
//         break;
//       case 'replace':
//         onReplaceExercise?.(selectedWorkout);
//         break;
//       case 'remove':
//         onRemoveExercise?.(selectedWorkout);
//         break;
//     }
//     setModalVisible(false);
//   };

//   return (
//     <>
//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => {
//           const isSelected = selectedWorkouts.includes(item.id);
//           return (
//             <TouchableOpacity
//               onPress={() => onPress?.(item)} // Open WorkoutModal on press
//               activeOpacity={0.8}
//               style={styles.cardContainer}
//             >
//               <View style={[styles.card, isSelected && styles.cardSelected]}>
//                 <Image
//                   source={getWorkoutImage(item.name)}
//                   style={styles.image}
//                   resizeMode="cover"
//                 />
//                 <View style={styles.info}>
//                   <Text style={styles.name} numberOfLines={1}>
//                     {item.name}
//                   </Text>
//                   <Text style={styles.detail}>
//                     {item.muscle} • {item.category}
//                   </Text>
//                 </View>
//                 {showMenu && (
//                   <TouchableOpacity
//                     style={styles.menuIcon}
//                     onPress={(event) => handleMenuPress(item, event)}
//                   >
//                     <Entypo name="dots-three-horizontal" size={24} color="#6b7280" />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </TouchableOpacity>
//           );
//         }}
//         contentContainerStyle={styles.list}
//       />

//       {modalVisible && selectedWorkout && (
//         <Modal
//           animationType="none"
//           transparent
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <TouchableOpacity 
//             style={styles.modalOverlay} 
//             activeOpacity={1} 
//             onPress={() => setModalVisible(false)}
//           >
//             <View style={[
//               styles.menuContent,
//               {
//                 position: 'absolute',
//                 top: menuPosition.top,
//                 right: menuPosition.right,
//               }
//             ]}>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('note')}
//               >
//                 <Text style={styles.menuOptionText}>Add a Note</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('replace')}
//               >
//                 <Text style={styles.menuOptionText}>Replace Exercise</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('remove')}
//               >
//                 <Text style={styles.menuOptionText}>Remove Exercise</Text>
//               </TouchableOpacity>
//             </View>
//           </TouchableOpacity>
//         </Modal>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   list: {
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//   },
//   cardContainer: {
//     marginBottom: 12,
//   },
//   card: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderRadius: 8,
//     alignItems: 'center',
//     padding: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//     position: 'relative',
//   },
//   cardSelected: {
//     borderWidth: 2,
//     borderColor: '#10B981',
//     backgroundColor: '#E6FFFA',
//   },
//   image: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 12,
//   },
//   info: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 4,
//     color: '#1f2937',
//   },
//   detail: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   menuIcon: {
//     marginLeft: 12,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   menuContent: {
//     width: 200,
//     backgroundColor: '#2B3036',
//     borderRadius: 8,
//     paddingVertical: 8,
//   },
//   menuOption: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   menuOptionText: {
//     fontSize: 16,
//     color: 'white',
//   },
// });

// export default WorkoutCard;





// import React from 'react';
// import { View, FlatList, Image, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
// import { Workout } from '../types/types';
// import { getWorkoutImage } from '../utils/imageHelper';
// import { MaterialIcons, Entypo } from '@expo/vector-icons';

// interface WorkoutCardProps {
//   data: Workout[];
//   onPress?: (workout: Workout) => void;
//   selectedWorkouts?: number[];
//   multipleSelection?: boolean;
//   showMenu?: boolean;
//   onAddNote?: (workout: Workout) => void;
//   onReplaceExercise?: (workout: Workout) => void;
//   onRemoveExercise?: (workout: Workout) => void;
// }

// const WorkoutCard: React.FC<WorkoutCardProps> = ({
//   data,
//   onPress,
//   selectedWorkouts = [],
//   multipleSelection = false,
//   showMenu = false,
//   onAddNote,
//   onReplaceExercise,
//   onRemoveExercise,
// }) => {
//   const [modalVisible, setModalVisible] = React.useState(false);
//   const [selectedWorkout, setSelectedWorkout] = React.useState<Workout | null>(null);
//   const [menuPosition, setMenuPosition] = React.useState({ top: 0, right: 0 });
//   const [menuDirection, setMenuDirection] = React.useState<'down' | 'up'>('down');

//   const handleMenuPress = (workout: Workout, event: any) => {
//     const dotsIconRef = event.target;
//     dotsIconRef.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
//       const screenHeight = Dimensions.get('window').height;
//       const menuHeight = 144; // Approximate height of menu (48px per option)
//       const spaceBelow = screenHeight - pageY - height;
      
//       if (spaceBelow < menuHeight && pageY > menuHeight) {
//         // Show menu upward if there's not enough space below but enough space above
//         setMenuDirection('up');
//         setMenuPosition({
//           top: pageY - menuHeight,
//           right: Dimensions.get('window').width - (pageX + width),
//         });
//       } else {
//         // Show menu downward
//         setMenuDirection('down');
//         setMenuPosition({
//           top: pageY + height,
//           right: Dimensions.get('window').width - (pageX + width),
//         });
//       }
//     });
    
//     setSelectedWorkout(workout);
//     setModalVisible(true);
//   };

//   const handleMenuOptionPress = (action: 'note' | 'replace' | 'remove') => {
//     if (!selectedWorkout) return;
//     switch (action) {
//       case 'note':
//         onAddNote?.(selectedWorkout);
//         break;
//       case 'replace':
//         onReplaceExercise?.(selectedWorkout);
//         break;
//       case 'remove':
//         onRemoveExercise?.(selectedWorkout);
//         break;
//     }
//     setModalVisible(false);
//   };

//   const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

//   return (
//     <>
//       <FlatList
//         data={sortedData}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => {
//           const isSelected = selectedWorkouts.includes(item.id);
//           return (
//             <TouchableOpacity
//               onPress={() => onPress?.(item)}
//               activeOpacity={0.8}
//               style={styles.cardContainer}
//             >
//               <View style={[styles.card, isSelected && styles.cardSelected]}>
//                 <Image
//                   source={getWorkoutImage(item.name)}
//                   style={styles.image}
//                   resizeMode="cover"
//                 />
//                 <View style={styles.info}>
//                   <Text style={styles.name} numberOfLines={1}>
//                     {item.name}
//                   </Text>
//                   <Text style={styles.detail}>
//                     {item.muscle} • {item.category}
//                   </Text>
//                 </View>
//                 {showMenu && (
//                   <TouchableOpacity
//                     style={styles.menuIcon}
//                     onPress={(event) => handleMenuPress(item, event)}
//                   >
//                     <Entypo name="dots-three-horizontal" size={24} color="#6b7280" />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </TouchableOpacity>
//           );
//         }}
//         contentContainerStyle={styles.list}
//       />

//       {/* Menu Modal */}
//       {modalVisible && selectedWorkout && (
//         <Modal
//           animationType="none"
//           transparent
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <TouchableOpacity 
//             style={styles.modalOverlay} 
//             activeOpacity={1} 
//             onPress={() => setModalVisible(false)}
//           >
//             <View style={[
//               styles.menuContent,
//               {
//                 position: 'absolute',
//                 top: menuPosition.top,
//                 right: menuPosition.right,
//                 transform: [{ translateY: menuDirection === 'up' ? 0 : 0 }]
//               }
//             ]}>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('note')}
//               >
//                 <Text style={styles.menuOptionText}>Add a Note</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('replace')}
//               >
//                 <Text style={styles.menuOptionText}>Replace Exercise</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={() => handleMenuOptionPress('remove')}
//               >
//                 <Text style={styles.menuOptionText}>Remove Exercise</Text>
//               </TouchableOpacity>
//             </View>
//           </TouchableOpacity>
//         </Modal>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   list: {
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//   },
//   cardContainer: {
//     marginBottom: 12,
//   },
//   card: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderRadius: 8,
//     alignItems: 'center',
//     padding: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//     position: 'relative',
//   },
//   cardSelected: {
//     borderWidth: 2,
//     borderColor: '#10B981',
//     backgroundColor: '#E6FFFA',
//   },
//   image: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 12,
//   },
//   info: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 4,
//     color: '#1f2937',
//   },
//   detail: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   menuIcon: {
//     marginLeft: 12,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   menuContent: {
//     width: 200,
//     backgroundColor: '#2B3036',
//     borderRadius: 8,
//     paddingVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   menuOption: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   menuOptionText: {
//     fontSize: 16,
//     color: 'white',
//   },
// });

// export default WorkoutCard;



// // components/WorkoutCard.tsx

// import { View, FlatList, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import React from 'react';
// import { Workout } from '../types/types';
// import { getWorkoutImage } from '../utils/imageHelper';

// interface WorkoutCardProps {
//   data: Workout[];
//   onPress?: (workout: Workout) => void; // Optional onPress prop
// }

// const WorkoutCard: React.FC<WorkoutCardProps> = ({ data, onPress }) => {
//   // Sort data alphabetically by workout name
//   const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

//   return (
//     <FlatList
//       data={sortedData}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={({ item }) => (
//         <TouchableOpacity onPress={() => onPress && onPress(item)} activeOpacity={0.7}>
//           <View style={styles.card}>
//             <Image
//               source={getWorkoutImage(item.name)}
//               style={styles.image}
//               resizeMode="cover"
//             />
//             <View style={styles.info}>
//               <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
//               <Text style={styles.detail}>{item.muscle} • {item.category}</Text>
//             </View>
//           </View>
//         </TouchableOpacity>
//       )}
//       contentContainerStyle={styles.list}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   list: {
//     padding: 8,
//   },
//   card: {
//     backgroundColor: 'white',
//     marginHorizontal: 4,
//     marginVertical: 4,
//     borderRadius: 8,
//     flexDirection: 'row',
//     height: 68,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   image: {
//     width: 50,
//     height: 50,
//     borderRadius: 8,
//     marginHorizontal: 10,
//     overflow: 'hidden',
//   },
//   info: {
//     flex: 1,
//     marginRight: 10,
//   },
//   name: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   detail: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 2,
//   },
// });

// export default WorkoutCard;
