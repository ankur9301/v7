import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  Image,
} from "react-native";
// Replace with Reanimated Swipeable
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Video, ResizeMode } from "expo-av";
import { Workout } from "../types/types";
import { getWorkoutVideo } from "../utils/videoHelper";
import { getWorkoutImage } from "../utils/imageHelper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, lightTheme, darkTheme } from "../context/ThemeContext";
import { useWorkoutModalStore } from "@/src/stores/useWorkoutModalStore";
import { useWorkoutStore } from "@/src/stores/useWorkoutStore";

const { width } = Dimensions.get("window");

interface WorkoutModalProps {
  visible: boolean;
  workout: Workout | null;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface Set {
  id: string;
  reps: string;
  weight: string;
  logged: boolean;
  timestamp?: number;
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose, isDarkMode = false }) => {
  const { theme } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  
  const {
    logs,
    addSet,
    updateSet,
    toggleLog,
    removeSet,
    logSet,
  } = useWorkoutStore();
  
  const workoutId = workout?.id || "";
  const sets = workoutId ? logs[workoutId] || [] : [];
  
  const [notes, setNotes] = useState<string>("");
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
  const videoRef = useRef<Video | null>(null);
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});
  const outlineAnimations = useRef<Animated.Value[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
  const updateNotes = (text: string) => {
    setNotes(text);
  };
  
  // Format timer as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load saved state when modal opens
  // useEffect(() => {
  //   if (!workoutId) return;
  
  //   const existingSets = logs[workoutId];
  //   if (!existingSets || existingSets.length === 0) {
  //     const defaultSets = [
  //       { reps: "12", weight: "10" },
  //       { reps: "10", weight: "15" },
  //       { reps: "8", weight: "20" },
  //     ];
  
  //     defaultSets.forEach(() => {
  //       useWorkoutStore.getState().addSet(String(workoutId));
  //     });
  //   }
  
  //   return () => {
  //     if (timerInterval.current) {
  //       clearInterval(timerInterval.current);
  //     }
  //   };
  // }, [visible, workoutId]);

  
  useEffect(() => {
    if (!workoutId) return;
  
    const existingSets = useWorkoutStore.getState().logs[workoutId];
  
    // ❗Only add default sets if NO entry for this workout exists in the store
    if (existingSets === undefined) {
      const defaultSets = [
        { reps: "12", weight: "10" },
        { reps: "10", weight: "15" },
        { reps: "8", weight: "20" },
      ];
  
      defaultSets.forEach(() => {
        useWorkoutStore.getState().addSet(String(workoutId));
      });
    }
  
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [visible, workoutId]);
  
  
  
  useEffect(() => {
    if (outlineAnimations.current.length !== sets.length) {
      outlineAnimations.current = sets.map(() => new Animated.Value(0));
    }
  }, [sets.length]);
  
  // Timer functions
  const startTimer = () => {
    setIsTimerRunning(true);
    timerInterval.current = setInterval(() => {
      setRestTimer(prev => prev + 1);
    }, 1000);
  };
  
  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  };
  
  const resetTimer = () => {
    setRestTimer(0);
    setIsTimerRunning(false);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  };

  const handleSwipeLog = (index: number) => {
    if (!workoutId) return;
    if (swipeableRefs.current[sets[index].id]) {
      swipeableRefs.current[sets[index].id]?.close();
    }
    useWorkoutStore.getState().toggleLog(String(workoutId), sets[index].id);
    resetTimer();
    startTimer();
  };
  
  const handleSwipeDelete = (index: number) => {
    if (!workoutId) return;
    if (swipeableRefs.current[sets[index].id]) {
      swipeableRefs.current[sets[index].id]?.close();
    }

    setTimeout(() => {
      useWorkoutStore.getState().removeSet(String(workoutId), sets[index].id);
      // Update animations array
      const newAnimations = [...outlineAnimations.current];
      newAnimations.splice(index, 1);
      outlineAnimations.current = newAnimations;
    }, 300);
  };
  
  const renderLeftActions = () => {
    return (
      <View style={styles.leftSwipeAction}>
        <Ionicons name="checkmark" size={24} color="#fff" />
        <Text style={styles.leftSwipeText}>Log</Text>
      </View>
    );
  };
  
  const renderRightActions = () => {
    return (
      <View style={styles.rightSwipeAction}>
        <Ionicons name="trash" size={24} color="#fff" />
        <Text style={styles.rightSwipeText}>Delete</Text>
      </View>
    );
  };

  // Early return as a complete component
  if (!visible) {
    return null;
  }

  return (
    <Modal visible={true} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          { 
            backgroundColor: colors.background,
            borderTopWidth: isDarkMode ? 1 : 0,
            borderTopColor: colors.border
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[
                styles.closeButton, 
                { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
              ]} 
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{workout?.name}</Text>
            <TouchableOpacity 
              style={[
                styles.moreButton, 
                { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
              ]}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Workout Media */}
          <View style={styles.mediaContainer}>
            {workout && getWorkoutVideo(workout.name) ? (
              <Video
                ref={videoRef}
                source={getWorkoutVideo(workout.name)}
                style={styles.workoutVideo}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
              />
            ) : (
              <Image 
                source={workout ? getWorkoutImage(workout.name) : require('../assets/images/placeholder.jpg')}
                style={styles.workoutImage}
                resizeMode="cover"
              />
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.mediaOverlay}
            >
              <View style={styles.workoutInfo}>
                <View style={styles.workoutCategory}>
                  <Text style={styles.workoutCategoryText}>{workout?.category}</Text>
                </View>
                <View style={styles.workoutLevel}>
                  <Text style={styles.workoutLevelText}>{workout?.level}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Rest Timer */}
          <View style={[
            styles.timerContainer,
            { 
              backgroundColor: colors.card,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }
          ]}>
            <View style={styles.timerDisplay}>
              <Text style={[styles.timerText, { color: colors.text }]}>{formatTime(restTimer)}</Text>
              <Text style={[styles.timerLabel, { color: colors.secondaryText }]}>Rest Timer</Text>
            </View>
            
            <View style={styles.timerControls}>
              {isTimerRunning ? (
                <TouchableOpacity 
                  style={[
                    styles.timerButton,
                    { backgroundColor: isDarkMode ? '#FF9500' : '#4361ee' }
                  ]} 
                  onPress={pauseTimer}
                >
                  <Ionicons name="pause" size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.timerButton,
                    { backgroundColor: isDarkMode ? '#FF9500' : '#4361ee' }
                  ]} 
                  onPress={startTimer}
                >
                  <Ionicons name="play" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.timerButton,
                  { backgroundColor: isDarkMode ? '#FF9500' : '#4361ee' }
                ]} 
                onPress={resetTimer}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { 
                  backgroundColor: isDarkMode 
                    ? 'rgba(255, 149, 0, 0.2)' 
                    : 'rgba(67, 97, 238, 0.08)' 
                }
              ]}
              onPress={() => setShowNotes(!showNotes)}
            >
              <Ionicons 
                name="create-outline" 
                size={20} 
                color={isDarkMode ? "#FF9500" : "#4361ee"} 
              />
              <Text style={[
                styles.actionButtonText,
                { color: isDarkMode ? "#FF9500" : "#4361ee" }
              ]}>Notes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { 
                  backgroundColor: isDarkMode 
                    ? 'rgba(255, 149, 0, 0.2)' 
                    : 'rgba(67, 97, 238, 0.08)' 
                }
              ]}
            >
              <Ionicons 
                name="time-outline" 
                size={20} 
                color={isDarkMode ? "#FF9500" : "#4361ee"} 
              />
              <Text style={[
                styles.actionButtonText,
                { color: isDarkMode ? "#FF9500" : "#4361ee" }
              ]}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { 
                  backgroundColor: isDarkMode 
                    ? 'rgba(255, 149, 0, 0.2)' 
                    : 'rgba(67, 97, 238, 0.08)' 
                }
              ]}
            >
              <Ionicons 
                name="swap-horizontal-outline" 
                size={20} 
                color={isDarkMode ? "#FF9500" : "#4361ee"} 
              />
              <Text style={[
                styles.actionButtonText,
                { color: isDarkMode ? "#FF9500" : "#4361ee" }
              ]}>Replace</Text>
            </TouchableOpacity>
          </View>
          
          {/* Notes Section */}
          {showNotes && (
            <View style={styles.notesContainer}>
              <TextInput
                style={[
                  styles.notesInput,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                placeholder="Add notes about this exercise..."
                placeholderTextColor={colors.secondaryText}
                multiline
                value={notes}
                onChangeText={updateNotes}
              />
            </View>
          )}

          {/* Sets Section */}
          <View style={styles.setsHeader}>
            <Text style={[styles.setsTitle, { color: colors.text }]}>Sets</Text>
            <Text style={[styles.setsSubtitle, { color: colors.secondaryText }]}>
              {sets.filter(set => set.logged).length} of {sets.length} completed
            </Text>
          </View>
          
          <ScrollView style={styles.setsContainer}>
            {sets.map((set, index) => (
              <Swipeable
                key={set.id}
                ref={(ref) => {
                  swipeableRefs.current[set.id] = ref;
                }}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                onSwipeableLeftOpen={() => handleSwipeLog(index)}
                onSwipeableRightOpen={() => handleSwipeDelete(index)}
              >
                <Animated.View
                  style={[
                    styles.setRow,
                    {
                      borderWidth: outlineAnimations.current[index] ? 
                        outlineAnimations.current[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 2],
                        }) : 0,
                      borderColor: set.logged ? "#4caf50" : "transparent",
                      backgroundColor: isDarkMode 
                        ? (set.logged ? "rgba(76, 175, 80, 0.1)" : 'rgba(31, 41, 55, 0.5)')
                        : (set.logged ? "rgba(76, 175, 80, 0.05)" : '#F5F5F5'),
                    },
                  ]}
                >
                  <View style={styles.setIndicator}>
                    <TouchableOpacity
                      style={[styles.circleIndicator, set.logged && styles.circleIndicatorLogged]}
                      onPress={() => workoutId && toggleLog(String(workoutId), set.id)}
                    >
                      {set.logged && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </TouchableOpacity>
                    <Text style={[styles.setNumber, { color: colors.secondaryText }]}>Set {index + 1}</Text>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Reps</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text
                        }
                      ]}
                      keyboardType="number-pad"
                      value={set.reps}
                      onChangeText={(text) => workoutId && updateSet(String(workoutId), set.id, "reps", text)}
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Weight (lb)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text
                        }
                      ]}
                      keyboardType="number-pad"
                      value={set.weight}
                      onChangeText={(text) => workoutId && updateSet(String(workoutId), set.id, "weight", text)}
                    />
                  </View>
                  
                  {set.logged && set.timestamp && (
                    <View style={styles.timeStamp}>
                      <Text style={[styles.timeStampText, { color: colors.secondaryText }]}>
                        {new Date(set.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </Swipeable>
            ))}
            
            <TouchableOpacity 
              style={[
                styles.addSetButton,
                { 
                  backgroundColor: isDarkMode 
                    ? 'rgba(255, 149, 0, 0.2)' 
                    : 'rgba(67, 97, 238, 0.08)' 
                }
              ]} 
              onPress={() => workoutId && addSet(String(workoutId))}
            >
              <Ionicons 
                name="add-circle-outline" 
                size={24} 
                color={isDarkMode ? "#FF9500" : "#4361ee"} 
              />
              <Text style={[
                styles.addSetButtonText,
                { color: isDarkMode ? "#FF9500" : "#4361ee" }
              ]}>Add Set</Text>
            </TouchableOpacity>
            
            <View style={styles.swipeHint}>
              <Ionicons 
                name="swap-horizontal" 
                size={16} 
                color={colors.secondaryText} 
              />
              <Text style={[styles.swipeHintText, { color: colors.secondaryText }]}>
                Swipe left to log, right to delete
              </Text>
            </View>
          </ScrollView>
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
    height: "94%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    height: 250,
    position: 'relative',
    overflow: "hidden",
  },
  workoutVideo: {
    width: "100%",
    height: "100%",
  },
  workoutImage: {
    width: "100%",
    height: "100%",
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: 16,
  },
  workoutInfo: {
    flexDirection: 'row',
  },
  workoutCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  workoutCategoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  workoutLevel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  workoutLevelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  timerLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  timerControls: {
    flexDirection: 'row',
  },
  timerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  notesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  notesInput: {
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  setsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  setsSubtitle: {
    fontSize: 14,
  },
  setsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    width: "100%",
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
  },
  setIndicator: {
    width: 60,
    alignItems: "center",
  },
  circleIndicator: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4caf50",
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  circleIndicatorLogged: {
    backgroundColor: "#4caf50",
  },
  setNumber: {
    fontSize: 12,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 6,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  timeStamp: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  timeStampText: {
    fontSize: 10,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  addSetButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  swipeHintText: {
    fontSize: 12,
    marginLeft: 6,
  },
  leftSwipeAction: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4caf50",
    borderRadius: 12,
    height: 80,
    width: 80,
    flex: 1,
  },
  leftSwipeText: {
    color: "#fff",
    fontWeight: "600",
    marginTop: 4,
  },
  rightSwipeAction: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff5252",
    borderRadius: 12,
    height: 80,
    width: 80,
    flex: 1,
  },
  rightSwipeText: {
    color: "#fff",
    fontWeight: "600",
    marginTop: 4,
  },
});

export default WorkoutModal;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Animated,
//   Dimensions,
//   Image,
// } from "react-native";
// import Swipeable from 'react-native-gesture-handler/Swipeable';
// import { Video, ResizeMode } from "expo-av";
// import { Workout } from "../types/types";
// import { getWorkoutVideo } from "../utils/videoHelper";
// import { getWorkoutImage } from "../utils/imageHelper";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LinearGradient } from "expo-linear-gradient";
// import { useTheme, lightTheme, darkTheme } from "../context/ThemeContext";
// import { useWorkoutModalStore } from "@/src/stores/useWorkoutModalStore";
// import { useWorkoutStore } from "@/src/stores/useWorkoutStore";

// const { width } = Dimensions.get("window");

// interface WorkoutModalProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
//   isDarkMode?: boolean;
// }

// interface Set {
//   id: string;
//   reps: string;
//   weight: string;
//   logged: boolean;
//   timestamp?: number;
// }

// const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose, isDarkMode = false }) => {
//   const updateNotes = (text: string) => {
//     setNotes(text);
//   };
  
//   // if (!visible) return null; // Ensure it returns a valid ReactNode when not visible
//   if (!visible) {
//     return <View />; // Return a minimal placeholder instead of `null`
//   }  
//   const { theme } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;
  
//   // const [sets, setSets] = useState<Set[]>([]);
//   const {
//     logs,
//     addSet,
//     updateSet,
//     toggleLog,
//     removeSet,
//     logSet,
//   } = useWorkoutStore();
  
//   const workoutId = workout?.id;
//   const sets = workoutId ? logs[workoutId] || [] : [];
  
//   const [notes, setNotes] = useState<string>("");
//   const [showNotes, setShowNotes] = useState<boolean>(false);
//   const [restTimer, setRestTimer] = useState<number>(0);
//   const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
//   const videoRef = useRef<Video | null>(null);
//   // const swipeableRefs = useRef<(Swipeable | null)[]>([]);
//   const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

//   const outlineAnimations = useRef<Animated.Value[]>([]);
//   const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
//   // Format timer as MM:SS
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Load saved state when modal opens
//   useEffect(() => {
//     if (!workoutId) return;
  
//     const existingSets = logs[workoutId];
//     if (!existingSets || existingSets.length === 0) {
//       const defaultSets = [
//         { reps: "12", weight: "10" },
//         { reps: "10", weight: "15" },
//         { reps: "8", weight: "20" },
//       ];
  
//       defaultSets.forEach((set) => {
//         useWorkoutStore.getState().addSet(String(workoutId));
//       });
//     }
  
//     return () => {
//       if (timerInterval.current) {
//         clearInterval(timerInterval.current);
//       }
//     };
//   }, [visible, workoutId]);
  
//   // useEffect(() => {
//   //   outlineAnimations.current = sets.map(() => new Animated.Value(0));
//   // }, [sets.length]);
//   useEffect(() => {
//     if (outlineAnimations.current.length !== sets.length) {
//       outlineAnimations.current = sets.map(() => new Animated.Value(0));
//     }
//   }, [sets.length]);
  
  
//   // Timer functions
//   const startTimer = () => {
//     setIsTimerRunning(true);
//     timerInterval.current = setInterval(() => {
//       setRestTimer(prev => prev + 1);
//     }, 1000);
//   };
  
//   const pauseTimer = () => {
//     setIsTimerRunning(false);
//     if (timerInterval.current) {
//       clearInterval(timerInterval.current);
//     }
//   };
  
//   const resetTimer = () => {
//     setRestTimer(0);
//     setIsTimerRunning(false);
//     if (timerInterval.current) {
//       clearInterval(timerInterval.current);
//     }
//   };



  

 

//   const handleSwipeLog = (index: number) => {
//     if (!workoutId) return;
//     swipeableRefs.current[index]?.close();
//     useWorkoutStore.getState().toggleLog(String(workoutId), String(sets[index].id));
//     resetTimer();
//     startTimer();
//   };
  
//   const handleSwipeDelete = (index: number) => {
//     if (!workoutId) return;
//     // swipeableRefs.current[index]?.close();
//     swipeableRefs.current[sets[index].id]?.close();

//     setTimeout(() => {
//       useWorkoutStore.getState().removeSet(String(workoutId), String(sets[index].id));
//       outlineAnimations.current = outlineAnimations.current.filter((_, i) => i !== index);
//       swipeableRefs.current = swipeableRefs.current.filter((_, i) => i !== index);
//     }, 300);
//   };

  
  
  
//   const renderLeftActions = () => {
//     return (
//       <View style={styles.leftSwipeAction}>
//         <Ionicons name="checkmark" size={24} color="#fff" />
//         <Text style={styles.leftSwipeText}>Log</Text>
//       </View>
//     );
//   };
  
//   const renderRightActions = () => {
//     return (
//       <View style={styles.rightSwipeAction}>
//         <Ionicons name="trash" size={24} color="#fff" />
//         <Text style={styles.rightSwipeText}>Delete</Text>
//       </View>
//     );
//   };
//   useEffect(() => {
//     if (workoutId) {
//       console.log(`[Zustand Logs for Workout ${workoutId}]`, logs[workoutId]);
//     }
//   }, [workoutId ? logs[workoutId] : undefined]);
  

//   return (
//     <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
//       <View style={styles.modalOverlay}>
//         <View style={[
//           styles.modalContainer,
//           { 
//             backgroundColor: colors.background,
//             borderTopWidth: isDarkMode ? 1 : 0,
//             borderTopColor: colors.border
//           }
//         ]}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity 
//               style={[
//                 styles.closeButton, 
//                 { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
//               ]} 
//               onPress={onClose}
//             >
//               <Ionicons name="close" size={24} color={colors.text} />
//             </TouchableOpacity>
//             <Text style={[styles.headerTitle, { color: colors.text }]}>{workout?.name}</Text>
//             <TouchableOpacity 
//               style={[
//                 styles.moreButton, 
//                 { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
//               ]}
//             >
//               <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
//             </TouchableOpacity>
//           </View>

//           {/* Workout Media */}
//           <View style={styles.mediaContainer}>
//             {workout && getWorkoutVideo(workout.name) ? (
//               <Video
//                 ref={videoRef}
//                 source={getWorkoutVideo(workout.name)}
//                 style={styles.workoutVideo}
//                 resizeMode={ResizeMode.COVER}
//                 shouldPlay
//                 isLooping
//               />
//             ) : (
//               <Image 
//                 source={workout ? getWorkoutImage(workout.name) : require('../assets/images/placeholder.jpg')}
//                 style={styles.workoutImage}
//                 resizeMode="cover"
//               />
//             )}
            
//             <LinearGradient
//               colors={['transparent', 'rgba(0,0,0,0.7)']}
//               style={styles.mediaOverlay}
//             >
//               <View style={styles.workoutInfo}>
//                 <View style={styles.workoutCategory}>
//                   <Text style={styles.workoutCategoryText}>{workout?.category}</Text>
//                 </View>
//                 <View style={styles.workoutLevel}>
//                   <Text style={styles.workoutLevelText}>{workout?.level}</Text>
//                 </View>
//               </View>
//             </LinearGradient>
//           </View>

//           {/* Rest Timer */}
//           <View style={[
//             styles.timerContainer,
//             { 
//               backgroundColor: colors.card,
//               borderWidth: isDarkMode ? 1 : 0,
//               borderColor: colors.border
//             }
//           ]}>
//             <View style={styles.timerDisplay}>
//               <Text style={[styles.timerText, { color: colors.text }]}>{formatTime(restTimer)}</Text>
//               <Text style={[styles.timerLabel, { color: colors.secondaryText }]}>Rest Timer</Text>
//             </View>
            
//             <View style={styles.timerControls}>
//               {isTimerRunning ? (
//                 <TouchableOpacity 
//                   style={[
//                     styles.timerButton,
//                     { backgroundColor: isDarkMode ? '#FF9500' : '#4361ee' }
//                   ]} 
//                   onPress={pauseTimer}
//                 >
//                   <Ionicons name="pause" size={20} color="#fff" />
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity 
//                   style={[
//                     styles.timerButton,
//                     { backgroundColor: isDarkMode ? '#FF9500' : '#4361ee' }
//                   ]} 
//                   onPress={startTimer}
//                 >
//                   <Ionicons name="play" size={20} color="#fff" />
//                 </TouchableOpacity>
//               )}
              
//               <TouchableOpacity 
//                 style={[
//                   styles.timerButton,
//                   { backgroundColor: isDarkMode ? '#FF9500' : '#4361ee' }
//                 ]} 
//                 onPress={resetTimer}
//               >
//                 <Ionicons name="refresh" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             <TouchableOpacity 
//               style={[
//                 styles.actionButton,
//                 { 
//                   backgroundColor: isDarkMode 
//                     ? 'rgba(255, 149, 0, 0.2)' 
//                     : 'rgba(67, 97, 238, 0.08)' 
//                 }
//               ]}
//               onPress={() => setShowNotes(!showNotes)}
//             >
//               <Ionicons 
//                 name="create-outline" 
//                 size={20} 
//                 color={isDarkMode ? "#FF9500" : "#4361ee"} 
//               />
//               <Text style={[
//                 styles.actionButtonText,
//                 { color: isDarkMode ? "#FF9500" : "#4361ee" }
//               ]}>Notes</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[
//                 styles.actionButton,
//                 { 
//                   backgroundColor: isDarkMode 
//                     ? 'rgba(255, 149, 0, 0.2)' 
//                     : 'rgba(67, 97, 238, 0.08)' 
//                 }
//               ]}
//             >
//               <Ionicons 
//                 name="time-outline" 
//                 size={20} 
//                 color={isDarkMode ? "#FF9500" : "#4361ee"} 
//               />
//               <Text style={[
//                 styles.actionButtonText,
//                 { color: isDarkMode ? "#FF9500" : "#4361ee" }
//               ]}>History</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[
//                 styles.actionButton,
//                 { 
//                   backgroundColor: isDarkMode 
//                     ? 'rgba(255, 149, 0, 0.2)' 
//                     : 'rgba(67, 97, 238, 0.08)' 
//                 }
//               ]}
//             >
//               <Ionicons 
//                 name="swap-horizontal-outline" 
//                 size={20} 
//                 color={isDarkMode ? "#FF9500" : "#4361ee"} 
//               />
//               <Text style={[
//                 styles.actionButtonText,
//                 { color: isDarkMode ? "#FF9500" : "#4361ee" }
//               ]}>Replace</Text>
//             </TouchableOpacity>
//           </View>
          
//           {/* Notes Section */}
//           {showNotes && (
//             <View style={styles.notesContainer}>
//               <TextInput
//                 style={[
//                   styles.notesInput,
//                   { 
//                     backgroundColor: colors.card,
//                     borderColor: colors.border,
//                     color: colors.text
//                   }
//                 ]}
//                 placeholder="Add notes about this exercise..."
//                 placeholderTextColor={colors.secondaryText}
//                 multiline
//                 value={notes}
//                 onChangeText={updateNotes}
//               />
//             </View>
//           )}

//           {/* Sets Section */}
//           <View style={styles.setsHeader}>
//             <Text style={[styles.setsTitle, { color: colors.text }]}>Sets</Text>
//             <Text style={[styles.setsSubtitle, { color: colors.secondaryText }]}>
//               {sets.filter(set => set.logged).length} of {sets.length} completed
//             </Text>
//           </View>
          
//           <ScrollView style={styles.setsContainer}>
//             {sets.map((set, index) => (
//               <Swipeable
//                 key={set.id}
//                 // ref={(ref) => (swipeableRefs.current[index] = ref)}
//                 ref={(ref) => {
//                   if (ref) {
//                     swipeableRefs.current[set.id] = ref;
//                   }
//                 }}
                
                
//                 renderLeftActions={renderLeftActions}
//                 renderRightActions={renderRightActions}
//                 onSwipeableLeftOpen={() => handleSwipeLog(index)}
//                 onSwipeableRightOpen={() => handleSwipeDelete(index)}
//               >
//                 <Animated.View
//                   style={[
//                     styles.setRow,
//                     {
//                       borderWidth: outlineAnimations.current[index]?.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0, 2],
//                       }),
//                       borderColor: set.logged ? "#4caf50" : "transparent",
//                       backgroundColor: isDarkMode 
//                         ? (set.logged ? "rgba(76, 175, 80, 0.1)" : 'rgba(31, 41, 55, 0.5)')
//                         : (set.logged ? "rgba(76, 175, 80, 0.05)" : '#F5F5F5'),
//                     },
//                   ]}
//                 >
//                   <View style={styles.setIndicator}>
//                     <TouchableOpacity
//                       style={[styles.circleIndicator, set.logged && styles.circleIndicatorLogged]}
//                       // onPress={() => toggleLog(index)}
//                       onPress={() => workoutId && toggleLog(String(workoutId), sets[index].id)}

//                     >
//                       {set.logged && <Ionicons name="checkmark" size={12} color="#fff" />}
//                     </TouchableOpacity>
//                     <Text style={[styles.setNumber, { color: colors.secondaryText }]}>Set {index + 1}</Text>
//                   </View>
                  
//                   <View style={styles.inputContainer}>
//                     <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Reps</Text>
//                     <TextInput
//                       style={[
//                         styles.input,
//                         { 
//                           backgroundColor: colors.card,
//                           borderColor: colors.border,
//                           color: colors.text
//                         }
//                       ]}
//                       keyboardType="number-pad"
//                       value={set.reps}
//                       // onChangeText={(text) => updateSet(index, "reps", text)}
//                       onChangeText={(text) => workoutId && updateSet(String(workoutId), sets[index].id, "reps", text)}

//                     />
//                   </View>
                  
//                   <View style={styles.inputContainer}>
//                     <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Weight (lb)</Text>
//                     <TextInput
//                       style={[
//                         styles.input,
//                         { 
//                           backgroundColor: colors.card,
//                           borderColor: colors.border,
//                           color: colors.text
//                         }
//                       ]}
//                       keyboardType="number-pad"
//                       value={set.weight}
//                       onChangeText={(text) => workoutId && updateSet(String(workoutId), sets[index].id, "weight", text)}
//                     />
//                   </View>
                  
//                   {set.logged && set.timestamp && (
//                     <View style={styles.timeStamp}>
//                       <Text style={[styles.timeStampText, { color: colors.secondaryText }]}>
//                         {new Date(set.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </Text>
//                     </View>
//                   )}
//                 </Animated.View>
//               </Swipeable>
//             ))}
            
//             <TouchableOpacity 
//               style={[
//                 styles.addSetButton,
//                 { 
//                   backgroundColor: isDarkMode 
//                     ? 'rgba(255, 149, 0, 0.2)' 
//                     : 'rgba(67, 97, 238, 0.08)' 
//                 }
//               ]} 
//               onPress={() => workoutId && addSet(String(workoutId))}

//             >
//               <Ionicons 
//                 name="add-circle-outline" 
//                 size={24} 
//                 color={isDarkMode ? "#FF9500" : "#4361ee"} 
//               />
//               <Text style={[
//                 styles.addSetButtonText,
//                 { color: isDarkMode ? "#FF9500" : "#4361ee" }
//               ]}>Add Set</Text>
//             </TouchableOpacity>
            
//             <View style={styles.swipeHint}>
//               <Ionicons 
//                 name="swap-horizontal" 
//                 size={16} 
//                 color={colors.secondaryText} 
//               />
//               <Text style={[styles.swipeHintText, { color: colors.secondaryText }]}>
//                 Swipe left to log, right to delete
//               </Text>
//             </View>
//           </ScrollView>
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
//     height: "94%",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   closeButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   moreButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   mediaContainer: {
//     height: 200,
//     position: 'relative',
//   },
//   workoutVideo: {
//     width: "100%",
//     height: "100%",
//   },
//   workoutImage: {
//     width: "100%",
//     height: "100%",
//   },
//   mediaOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 80,
//     justifyContent: 'flex-end',
//     padding: 16,
//   },
//   workoutInfo: {
//     flexDirection: 'row',
//   },
//   workoutCategory: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginRight: 8,
//   },
//   workoutCategoryText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   workoutLevel: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   workoutLevelText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   timerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 12,
//     margin: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   timerDisplay: {
//     alignItems: 'center',
//   },
//   timerText: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   timerLabel: {
//     fontSize: 12,
//     marginTop: 4,
//   },
//   timerControls: {
//     flexDirection: 'row',
//   },
//   timerButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   notesContainer: {
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   notesInput: {
//     borderRadius: 12,
//     padding: 12,
//     height: 100,
//     textAlignVertical: 'top',
//     borderWidth: 1,
//   },
//   setsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     marginBottom: 8,
//   },
//   setsTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   setsSubtitle: {
//     fontSize: 14,
//   },
//   setsContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   setRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     height: 80,
//     width: "100%",
//     marginBottom: 12,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     elevation: 1,
//   },
//   setIndicator: {
//     width: 60,
//     alignItems: "center",
//   },
//   circleIndicator: {
//     width: 24,
//     height: 24,
//     justifyContent: "center",
//     alignItems: 'center',
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#4caf50",
//     backgroundColor: "transparent",
//     marginBottom: 4,
//   },
//   circleIndicatorLogged: {
//     backgroundColor: "#4caf50",
//   },
//   setNumber: {
//     fontSize: 12,
//   },
//   inputContainer: {
//     flex: 1,
//     marginHorizontal: 6,
//   },
//   inputLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   timeStamp: {
//     position: 'absolute',
//     bottom: 8,
//     right: 12,
//   },
//   timeStampText: {
//     fontSize: 10,
//   },
//   addSetButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 12,
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   addSetButtonText: {
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   swipeHint: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 24,
//   },
//   swipeHintText: {
//     fontSize: 12,
//     marginLeft: 6,
//   },
//   leftSwipeAction: {
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#4caf50",
//     borderRadius: 12,
//     height: 80,
//     width: 80,
//     flex: 1,
//   },
//   leftSwipeText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginTop: 4,
//   },
//   rightSwipeAction: {
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#ff5252",
//     borderRadius: 12,
//     height: 80,
//     width: 80,
//     flex: 1,
//   },
//   rightSwipeText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginTop: 4,
//   },
// });

// export default WorkoutModal;


// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Animated,
//   Dimensions,
//   Image,
// } from "react-native";
// import { Swipeable } from "react-native-gesture-handler";
// import { Video, ResizeMode } from "expo-av";
// import { Workout } from "../types/types";
// import { getWorkoutVideo } from "../utils/videoHelper";
// import { getWorkoutImage } from "../utils/imageHelper";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LinearGradient } from "expo-linear-gradient";

// const { width } = Dimensions.get("window");

// interface WorkoutModalProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
//   isDarkMode?: boolean;
// }

// interface Set {
//   id: string;
//   reps: string;
//   weight: string;
//   logged: boolean;
//   timestamp?: number;
// }

// const WorkoutModal: React.FC<WorkoutModalProps> = ({ visible, workout, onClose }) => {
//   const [sets, setSets] = useState<Set[]>([]);
//   const [notes, setNotes] = useState<string>("");
//   const [showNotes, setShowNotes] = useState<boolean>(false);
//   const [restTimer, setRestTimer] = useState<number>(0);
//   const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
//   const videoRef = useRef<Video | null>(null);
//   const swipeableRefs = useRef<(Swipeable | null)[]>([]);
//   const outlineAnimations = useRef<Animated.Value[]>([]);
//   const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
//   // Format timer as MM:SS
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Load saved state when modal opens
//   useEffect(() => {
//     if (workout) {
//       const loadWorkoutState = async () => {
//         try {
//           const savedSets = await AsyncStorage.getItem(`workout_${workout.id}_sets`);
//           const savedNotes = await AsyncStorage.getItem(`workout_${workout.id}_notes`);
          
//           if (savedSets) {
//             setSets(JSON.parse(savedSets));
//           } else {
//             // Default sets
//             const initialSets = [
//               { id: '1', reps: "12", weight: "10", logged: false },
//               { id: '2', reps: "10", weight: "15", logged: false },
//               { id: '3', reps: "8", weight: "20", logged: false },
//             ];
//             setSets(initialSets);
//             await AsyncStorage.setItem(`workout_${workout.id}_sets`, JSON.stringify(initialSets));
//           }
          
//           if (savedNotes) {
//             setNotes(savedNotes);
//           }
//         } catch (error) {
//           console.error("Error loading workout state:", error);
//         }
//       };
      
//       loadWorkoutState();
//     }
    
//     return () => {
//       if (timerInterval.current) {
//         clearInterval(timerInterval.current);
//       }
//     };
//   }, [visible, workout]);

//   useEffect(() => {
//     outlineAnimations.current = sets.map(() => new Animated.Value(0));
//   }, [sets.length]);
  
//   // Timer functions
//   const startTimer = () => {
//     setIsTimerRunning(true);
//     timerInterval.current = setInterval(() => {
//       setRestTimer(prev => prev + 1);
//     }, 1000);
//   };
  
//   const pauseTimer = () => {
//     setIsTimerRunning(false);
//     if (timerInterval.current) {
//       clearInterval(timerInterval.current);
//     }
//   };
  
//   const resetTimer = () => {
//     setRestTimer(0);
//     setIsTimerRunning(false);
//     if (timerInterval.current) {
//       clearInterval(timerInterval.current);
//     }
//   };

//   // Save state when a set is logged
//   const saveWorkoutState = async (updatedSets: Set[], updatedNotes?: string) => {
//     if (workout) {
//       try {
//         await AsyncStorage.setItem(`workout_${workout.id}_sets`, JSON.stringify(updatedSets));
//         if (updatedNotes !== undefined) {
//           await AsyncStorage.setItem(`workout_${workout.id}_notes`, updatedNotes);
//         }
//       } catch (error) {
//         console.error("Error saving workout state:", error);
//       }
//     }
//   };

//   const addSet = async () => {
//     const newSet = { 
//       id: Date.now().toString(), 
//       reps: "8", 
//       weight: "0", 
//       logged: false 
//     };
//     const newSets = [...sets, newSet];
//     setSets(newSets);
//     await saveWorkoutState(newSets);
//     outlineAnimations.current.push(new Animated.Value(0));
//   };

//   const updateSet = async (index: number, field: "reps" | "weight", value: string) => {
//     const newSets = sets.map((set, i) =>
//       i === index ? { ...set, [field]: value } : set
//     );
//     setSets(newSets);
//     await saveWorkoutState(newSets);
//   };

//   const toggleLog = async (index: number) => {
//     const newSets = sets.map((set, i) =>
//       i === index ? { 
//         ...set, 
//         logged: !set.logged,
//         timestamp: !set.logged ? Date.now() : undefined
//       } : set
//     );
//     setSets(newSets);
//     await saveWorkoutState(newSets);

//     // Animate only the tapped item
//     Animated.timing(outlineAnimations.current[index], {
//       toValue: newSets[index].logged ? 1 : 0,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
    
//     // Reset timer when a set is logged
//     if (newSets[index].logged) {
//       resetTimer();
//       startTimer();
//     }
//   };

//   const handleSwipeLog = async (index: number) => {
//     swipeableRefs.current[index]?.close();

//     Animated.timing(outlineAnimations.current[index], {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();

//     const newSets = sets.map((set, i) =>
//       i === index ? { ...set, logged: true, timestamp: Date.now() } : set
//     );
//     setSets(newSets);
//     await saveWorkoutState(newSets);
    
//     // Reset timer when a set is logged
//     resetTimer();
//     startTimer();
//   };

//   const handleSwipeDelete = async (index: number) => {
//     swipeableRefs.current[index]?.close();

//     setTimeout(async () => {
//       const newSets = sets.filter((_, i) => i !== index);
//       setSets(newSets);
//       await saveWorkoutState(newSets);
//       outlineAnimations.current = outlineAnimations.current.filter((_, i) => i !== index);
//       swipeableRefs.current = swipeableRefs.current.filter((_, i) => i !== index);
//     }, 300);
//   };
  
//   const updateNotes = async (text: string) => {
//     setNotes(text);
//     await saveWorkoutState(sets, text);
//   };
  
//   const renderLeftActions = () => {
//     return (
//       <View style={styles.leftSwipeAction}>
//         <Ionicons name="checkmark" size={24} color="#fff" />
//         <Text style={styles.leftSwipeText}>Log</Text>
//       </View>
//     );
//   };
  
//   const renderRightActions = () => {
//     return (
//       <View style={styles.rightSwipeAction}>
//         <Ionicons name="trash" size={24} color="#fff" />
//         <Text style={styles.rightSwipeText}>Delete</Text>
//       </View>
//     );
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Ionicons name="close" size={24} color="#333" />
//             </TouchableOpacity>
//             <Text style={styles.headerTitle}>{workout?.name}</Text>
//             <TouchableOpacity style={styles.moreButton}>
//               <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>

//           {/* Workout Media */}
//           <View style={styles.mediaContainer}>
//             {workout && getWorkoutVideo(workout.name) ? (
//               <Video
//                 ref={videoRef}
//                 source={getWorkoutVideo(workout.name)}
//                 style={styles.workoutVideo}
//                 resizeMode={ResizeMode.COVER}
//                 shouldPlay
//                 isLooping
//               />
//             ) : (
//               <Image 
//                 source={workout ? getWorkoutImage(workout.name) : require('../assets/images/placeholder.jpg')}
//                 style={styles.workoutImage}
//                 resizeMode="cover"
//               />
//             )}
            
//             <LinearGradient
//               colors={['transparent', 'rgba(0,0,0,0.7)']}
//               style={styles.mediaOverlay}
//             >
//               <View style={styles.workoutInfo}>
//                 <View style={styles.workoutCategory}>
//                   <Text style={styles.workoutCategoryText}>{workout?.category}</Text>
//                 </View>
//                 <View style={styles.workoutLevel}>
//                   <Text style={styles.workoutLevelText}>{workout?.level}</Text>
//                 </View>
//               </View>
//             </LinearGradient>
//           </View>

//           {/* Rest Timer */}
//           <View style={styles.timerContainer}>
//             <View style={styles.timerDisplay}>
//               <Text style={styles.timerText}>{formatTime(restTimer)}</Text>
//               <Text style={styles.timerLabel}>Rest Timer</Text>
//             </View>
            
//             <View style={styles.timerControls}>
//               {isTimerRunning ? (
//                 <TouchableOpacity style={styles.timerButton} onPress={pauseTimer}>
//                   <Ionicons name="pause" size={20} color="#fff" />
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity style={styles.timerButton} onPress={startTimer}>
//                   <Ionicons name="play" size={20} color="#fff" />
//                 </TouchableOpacity>
//               )}
              
//               <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
//                 <Ionicons name="refresh" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             <TouchableOpacity 
//               style={styles.actionButton}
//               onPress={() => setShowNotes(!showNotes)}
//             >
//               <Ionicons name="create-outline" size={20} color="#4361ee" />
//               <Text style={styles.actionButtonText}>Notes</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity style={styles.actionButton}>
//               <Ionicons name="time-outline" size={20} color="#4361ee" />
//               <Text style={styles.actionButtonText}>History</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity style={styles.actionButton}>
//               <Ionicons name="swap-horizontal-outline" size={20} color="#4361ee" />
//               <Text style={styles.actionButtonText}>Replace</Text>
//             </TouchableOpacity>
//           </View>
          
//           {/* Notes Section */}
//           {showNotes && (
//             <View style={styles.notesContainer}>
//               <TextInput
//                 style={styles.notesInput}
//                 placeholder="Add notes about this exercise..."
//                 multiline
//                 value={notes}
//                 onChangeText={updateNotes}
//               />
//             </View>
//           )}

//           {/* Sets Section */}
//           <View style={styles.setsHeader}>
//             <Text style={styles.setsTitle}>Sets</Text>
//             <Text style={styles.setsSubtitle}>
//               {sets.filter(set => set.logged).length} of {sets.length} completed
//             </Text>
//           </View>
          
//           <ScrollView style={styles.setsContainer}>
//             {sets.map((set, index) => (
//               <Swipeable
//                 key={set.id}
//                 ref={(ref) => (swipeableRefs.current[index] = ref)}
//                 renderLeftActions={renderLeftActions}
//                 renderRightActions={renderRightActions}
//                 onSwipeableLeftOpen={() => handleSwipeLog(index)}
//                 onSwipeableRightOpen={() => handleSwipeDelete(index)}
//               >
//                 <Animated.View
//                   style={[
//                     styles.setRow,
//                     {
//                       borderWidth: outlineAnimations.current[index]?.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0, 2],
//                       }),
//                       borderColor: set.logged ? "#4caf50" : "transparent",
//                       backgroundColor: set.logged ? "rgba(76, 175, 80, 0.05)" : "#F5F5F5",
//                     },
//                   ]}
//                 >
//                   <View style={styles.setIndicator}>
//                     <TouchableOpacity
//                       style={[styles.circleIndicator, set.logged && styles.circleIndicatorLogged]}
//                       onPress={() => toggleLog(index)}
//                     >
//                       {set.logged && <Ionicons name="checkmark" size={12} color="#fff" />}
//                     </TouchableOpacity>
//                     <Text style={styles.setNumber}>Set {index + 1}</Text>
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
                  
//                   {set.logged && set.timestamp && (
//                     <View style={styles.timeStamp}>
//                       <Text style={styles.timeStampText}>
//                         {new Date(set.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </Text>
//                     </View>
//                   )}
//                 </Animated.View>
//               </Swipeable>
//             ))}
            
//             <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
//               <Ionicons name="add-circle-outline" size={24} color="#4361ee" />
//               <Text style={styles.addSetButtonText}>Add Set</Text>
//             </TouchableOpacity>
            
//             <View style={styles.swipeHint}>
//               <Ionicons name="swap-horizontal" size={16} color="#94a3b8" />
//               <Text style={styles.swipeHintText}>Swipe left to log, right to delete</Text>
//             </View>
//           </ScrollView>
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
//     height: "94%",
//     backgroundColor: "#f8f9fa",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#333",
//   },
//   closeButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   moreButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   mediaContainer: {
//     height: 200,
//     position: 'relative',
//   },
//   workoutVideo: {
//     width: "100%",
//     height: "100%",
//   },
//   workoutImage: {
//     width: "100%",
//     height: "100%",
//   },
//   mediaOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 80,
//     justifyContent: 'flex-end',
//     padding: 16,
//   },
//   workoutInfo: {
//     flexDirection: 'row',
//   },
//   workoutCategory: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginRight: 8,
//   },
//   workoutCategoryText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   workoutLevel: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   workoutLevelText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   timerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 12,
//     margin: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   timerDisplay: {
//     alignItems: 'center',
//   },
//   timerText: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#333',
//   },
//   timerLabel: {
//     fontSize: 12,
//     color: '#6b7280',
//     marginTop: 4,
//   },
//   timerControls: {
//     flexDirection: 'row',
//   },
//   timerButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#4361ee',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(67, 97, 238, 0.08)',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: "#4361ee",
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   notesContainer: {
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   notesInput: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 12,
//     height: 100,
//     textAlignVertical: 'top',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   setsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     marginBottom: 8,
//   },
//   setsTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#333',
//   },
//   setsSubtitle: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   setsContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   setRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     height: 80,
//     width: "100%",
//     marginBottom: 12,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     elevation: 1,
//   },
//   setIndicator: {
//     width: 60,
//     alignItems: "center",
//   },
//   circleIndicator: {
//     width: 24,
//     height: 24,
//     justifyContent: "center",
//     alignItems: 'center',
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#4caf50",
//     backgroundColor: "transparent",
//     marginBottom: 4,
//   },
//   circleIndicatorLogged: {
//     backgroundColor: "#4caf50",
//   },
//   setNumber: {
//     fontSize: 12,
//     color: '#6b7280',
//   },
//   inputContainer: {
//     flex: 1,
//     marginHorizontal: 6,
//   },
//   inputLabel: {
//     fontSize: 12,
//     color: '#6b7280',
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     backgroundColor: '#fff',
//   },
//   timeStamp: {
//     position: 'absolute',
//     bottom: 8,
//     right: 12,
//   },
//   timeStampText: {
//     fontSize: 10,
//     color: '#6b7280',
//   },
//   addSetButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: 'center',
//     backgroundColor: 'rgba(67, 97, 238, 0.08)',
//     paddingVertical: 12,
//     borderRadius: 12,
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   addSetButtonText: {
//     marginLeft: 8,
//     color: "#4361ee",
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   swipeHint: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 24,
//   },
//   swipeHintText: {
//     fontSize: 12,
//     color: '#94a3b8',
//     marginLeft: 6,
//   },
//   leftSwipeAction: {
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#4caf50",
//     borderRadius: 12,
//     height: 80,
//     width: 80,
//     flex: 1,
//   },
//   leftSwipeText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginTop: 4,
//   },
//   rightSwipeAction: {
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#ff5252",
//     borderRadius: 12,
//     height: 80,
//     width: 80,
//     flex: 1,
//   },
//   rightSwipeText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginTop: 4,
//   },
// });

// export default WorkoutModal;




// import React, { useState, useEffect, useRef } from "react";
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
// import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ For persisting logged sets

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
//   const [sets, setSets] = useState<Set[]>([]);
//   const videoRef = useRef<Video | null>(null);
//   const swipeableRefs = useRef<(Swipeable | null)[]>([]);
//   const outlineAnimations = useRef<Animated.Value[]>([]);

//   // ✅ Load saved state when modal opens
//   useEffect(() => {
//     if (workout) {
//       const loadWorkoutState = async () => {
//         const savedSets = await AsyncStorage.getItem(`workout_${workout.name}`);
//         if (savedSets) {
//           setSets(JSON.parse(savedSets)); // Load saved workout sets
//         } else {
//           const initialSets = [
//             { reps: "12", weight: "10", logged: false },
//             { reps: "10", weight: "15", logged: false },
//             { reps: "8", weight: "20", logged: false },
//           ];
//           setSets(initialSets);
//           await AsyncStorage.setItem(`workout_${workout.name}`, JSON.stringify(initialSets));
//         }
//       };
//       loadWorkoutState();
//     }
//   }, [visible]);

//   useEffect(() => {
//     outlineAnimations.current = sets.map(() => new Animated.Value(0));
//   }, [sets.length]);

//   // ✅ Save state when a set is logged
//   const saveWorkoutState = async (updatedSets: Set[]) => {
//     if (workout) {
//       await AsyncStorage.setItem(`workout_${workout.name}`, JSON.stringify(updatedSets));
//     }
//   };

//   const addSet = async () => {
//     const newSets = [...sets, { reps: "6", weight: "0", logged: false }];
//     setSets(newSets);
//     await saveWorkoutState(newSets);
//     outlineAnimations.current.push(new Animated.Value(0));
//   };

//   const updateSet = async (index: number, field: "reps" | "weight", value: string) => {
//     const newSets = sets.map((set, i) =>
//       i === index ? { ...set, [field]: value } : set
//     );
//     setSets(newSets);
//     await saveWorkoutState(newSets);
//   };

//   const toggleLog = async (index: number) => {
//     const newSets = sets.map((set, i) =>
//       i === index ? { ...set, logged: !set.logged } : set
//     );
//     setSets(newSets);
//     await saveWorkoutState(newSets);

//     // ✅ Animate only the tapped item
//     Animated.timing(outlineAnimations.current[index], {
//       toValue: newSets[index].logged ? 1 : 0,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   };

//   const handleSwipeLog = async (index: number) => {
//     swipeableRefs.current[index]?.close();

//     Animated.timing(outlineAnimations.current[index], {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();

//     const newSets = sets.map((set, i) =>
//       i === index ? { ...set, logged: true } : set
//     );
//     setSets(newSets);
//     await saveWorkoutState(newSets);
//   };

//   const handleSwipeDelete = async (index: number) => {
//     swipeableRefs.current[index]?.close();

//     setTimeout(async () => {
//       const newSets = sets.filter((_, i) => i !== index);
//       setSets(newSets);
//       await saveWorkoutState(newSets);
//       outlineAnimations.current = outlineAnimations.current.filter((_, i) => i !== index);
//       swipeableRefs.current = swipeableRefs.current.filter((_, i) => i !== index);
//     }, 300);
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
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

//           {/* Sets Section */}
//           <ScrollView style={styles.setsContainer}>
//             {sets.map((set, index) => (
//               <Swipeable
//                 key={index}
//                 ref={(ref) => (swipeableRefs.current[index] = ref)}
//                 onSwipeableLeftOpen={() => handleSwipeLog(index)}
//                 onSwipeableRightOpen={() => handleSwipeDelete(index)}
//               >
//                 <Animated.View
//                   style={[
//                     styles.setRow,
//                     {
//                       borderWidth: outlineAnimations.current[index]?.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0, 2],
//                       }),
//                       borderColor: set.logged ? "#4caf50" : "transparent",
//                     },
//                   ]}
//                 >
//                   <View style={styles.setIndicator}>
//                     <TouchableOpacity
//                       style={[styles.circleIndicator, set.logged && styles.circleIndicatorLogged]}
//                       onPress={() => toggleLog(index)}
//                     />
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
//     height: "94%",
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
//   submitButton: {
//     backgroundColor: "#02BFFF",
//     width: "50%",
//     paddingVertical: 15,
//     paddingHorizontal: 12,
//     borderRadius: 9999,
//     alignItems: "center",
//     justifyContent: "center",
//     marginLeft: "25%",
//     marginBottom: 30,
//   },
//   submitButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "800",
//   },
//   setsContainer: {
//     flex: 1,
//   },
//   setRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     height: 70,
//     width: "100%",
//     marginBottom: 15,
//     backgroundColor: "#F5F5F5",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     elevation: 1,
//   },
//   setIndicator: {
//     width: 30,
//     alignItems: "center",
//   },
//   circleIndicator: {
//     width: 16,
//     height: 16,
//     justifyContent: "center",
//     borderRadius: 8,
//     borderWidth: 2,
//     borderColor: "#4caf50",
//     backgroundColor: "transparent",
//   },
//   circleIndicatorLogged: {
//     backgroundColor: "#4caf50",
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
//   leftSwipeAction: {
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#4caf50",
//     borderRadius: 10,
//     height: 70,
//     width: 70,
//     flex: 1,
//   },
//   leftSwipeText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   rightSwipeAction: {
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#ff5252",
//     borderRadius: 10,
//     height: 70,
//     width: 70,
//     flex: 1,
//   },
//   rightSwipeText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });

// export default WorkoutModal;







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
