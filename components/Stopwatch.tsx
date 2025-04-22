import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  Dimensions,
  Easing,
  Platform,
  TextInput
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/supabaseClient';
import { BlurView } from 'expo-blur';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
import { useWorkoutModalStore } from "@/src/stores/useWorkoutModalStore";
import { useWorkoutStore } from '@/src/stores/useWorkoutStore';

const { width } = Dimensions.get('window');
// Reduced circle size to make the stopwatch more compact
const CIRCLE_SIZE = Math.min(width * 0.4, 150); // 40% of screen width, max 150px
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * (CIRCLE_RADIUS - 10); // Reduced stroke width

interface StopwatchProps {
  isDarkMode?: boolean;
}

const Stopwatch: React.FC<StopwatchProps> = ({ isDarkMode = false }) => {
  const { theme } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  
  const [isRunning, setIsRunning] = useState(true);
  // const [time, setTime] = useState(0);
  // const [calories, setCalories] = useState(0);
  const {
    elapsed: time,
    calories,
    updateTimer,
    resetSession
  } = useWorkoutStore();
  
  const timeRef = useRef(time); 

  const [modalVisible, setModalVisible] = useState(false);

  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const [workoutName, setWorkoutName] = useState('');

  const router = useRouter();

  // Calculate calories burned (rough estimate)
  // useEffect(() => {
  //   // Assuming average person burns ~10 calories per minute during moderate exercise
  //   const caloriesPerSecond = 10 / 60;
  //   setStopwatchData(time, Math.round(time * caloriesPerSecond));
  // }, [time]);

  // Start the stopwatch
  // const startTimer = () => {
  //   // intervalRef.current = setInterval(() => {
  //   //   // setTime((prevTime) => prevTime + 1);
  //   //   setStopwatchData(time + 1, Math.round((time + 1) * (10 / 60))); // update both time and calories

  //   // }, 1000);
  //   intervalRef.current = setInterval(() => {
  //     const currentTime = activeWorkout?.stopwatchDuration || 0;
  //     const newTime = currentTime + 1;
  //     const newCalories = Math.round(newTime * (10 / 60));
  //     setStopwatchData(newTime, newCalories); // Zustand update
  //   }, 1000);
    
    
    
  //   // Start pulse animation
  //   startPulseAnimation();
  // };


  let tick = 0; // counter to track intervals (scoped outside useEffect)

  const startTimer = () => {
    if (intervalRef.current) return;
  
    intervalRef.current = setInterval(() => {
      const updatedTime = timeRef.current + 1;
      timeRef.current = updatedTime;            // ✅ keep the ref up-to-date
      updateTimer(updatedTime);                 // ✅ update Zustand
  
      if (updatedTime % 10 === 0) {
        console.log(`[Zustand Stopwatch] ⏱ ${updatedTime}s | 🔥 ${Math.round((updatedTime * 10) / 60)} cal`);
      }
    }, 1000);
  
    startPulseAnimation();
  };
  

  // Stop the stopwatch
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    
    // Stop pulse animation
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Toggle timer on tap
  const toggleTimer = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
    setIsRunning((prev) => !prev);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Start the timer automatically on mount
  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
    };
  }, []);

  // Pulse animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: time % 3600,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [time]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Handle Stop Button Press
  const handleStopPress = () => {
    setModalVisible(true);
  };

  // Handle Resume Button Press
  const handleResumePress = () => {
    setModalVisible(false);
    if (!isRunning) {
      startTimer();
      setIsRunning(true);
    }
  };

  // Handle Log Workout Button Press
  const handleLogWorkoutPress = async () => {
    stopTimer(); 
    if (!workoutName.trim()) {
      alert("Please enter a workout name.");
      return;
    }
  
    const { data: userData, error: userError } = await supabase.auth.getUser();
  
    if (userError || !userData?.user) {
      alert("You must be logged in to log a workout.");
      return;
    }
  
    try {
      const { error } = await supabase.from("workouts").insert([
        {
          user_id: userData.user.id,
          workout_name: workoutName.trim(),
          duration: time,
          calories_burned: calories,
          logged_at: new Date(),
        },
      ]);
  
      if (error) {
        alert("Workout log failed: " + error.message);
      } else {
        alert("Workout logged successfully!");
        updateTimer(0); // ✅ resets both elapsed and calories

        setModalVisible(false);
        setWorkoutName(""); // Reset field
        router.push("/workout"); // Go to history
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    }
  };
  

  // Calculate stroke dashoffset for progress circle
  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 3600], // 1 hour max
    outputRange: [CIRCLE_CIRCUMFERENCE, 0],
  });

  // Calculate workout metrics
  const workoutMinutes = Math.floor(time / 60);
  useEffect(() => {
    timeRef.current = time;
  }, [time]);
  
  return (
    <View style={styles.container}>
      {/* Stopwatch - Vertical Layout */}
      <View style={styles.verticalContainer}>
        {/* Timer Circle */}
        <Animated.View 
          style={[
            styles.stopwatchContainer,
            { transform: [{ scale: pulseAnimation }] }
          ]}
        >
          <TouchableOpacity 
            onPress={toggleTimer} 
            activeOpacity={0.9}
            style={styles.stopwatchTouchable}
          >
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
              <Defs>
                <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={isDarkMode ? "#FF9500" : "#8B5CF6"} />
                  <Stop offset="100%" stopColor={isDarkMode ? "#FF5500" : "#3B82F6"} />
                </LinearGradient>
              </Defs>
              
              {/* Background Circle */}
              <Circle
                cx={CIRCLE_RADIUS}
                cy={CIRCLE_RADIUS}
                r={CIRCLE_RADIUS - 10}
                stroke={isDarkMode ? "#333" : "#E5E7EB"}
                strokeWidth={8}
                fill="transparent"
              />
              
              {/* Progress Circle */}
              <AnimatedCircle
                cx={CIRCLE_RADIUS}
                cy={CIRCLE_RADIUS}
                r={CIRCLE_RADIUS - 10}
                stroke="url(#grad)"
                strokeWidth={8}
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                rotation="-90"
                origin={`${CIRCLE_RADIUS}, ${CIRCLE_RADIUS}`}
              />
            </Svg>
            
            <View style={styles.timeDisplay}>
              <MaskedView
                maskElement={
                  <Text style={styles.timeText}>{formatTime(time)}</Text>
                }
              >
                <ExpoLinearGradient
                  colors={isDarkMode ? ['#FF9500', '#FF5500'] : ['#8B5CF6', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </MaskedView>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[
            styles.statItem, 
            { 
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#F9FAFB',
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }
          ]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{workoutMinutes}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Min</Text>
          </View>
          <View style={[
            styles.statItem, 
            { 
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#F9FAFB',
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }
          ]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{calories}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Cal</Text>
          </View>
        </View>
        
        {/* Controls Row */}
        <View style={styles.controlsRow}>
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.controlButton, styles.pauseButton]} 
              onPress={toggleTimer}
            >
              <ExpoLinearGradient
                colors={isDarkMode ? ['#FF9500', '#FF5500'] : ['#8B5CF6', '#3B82F6']}
                style={styles.buttonGradient}
              >
                <Ionicons 
                  name={isRunning ? "pause" : "play"} 
                  size={22} 
                  color="#fff" 
                />
              </ExpoLinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]} 
              onPress={handleStopPress}
            >
              <ExpoLinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.buttonGradient}
              >
                <Ionicons name="stop" size={22} color="#fff" />
              </ExpoLinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={styles.blurView}>
            <View style={[
              styles.modalContainer, 
              { 
                backgroundColor: isDarkMode ? colors.card : '#fff',
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: colors.border
              }
            ]}>
              <View style={styles.modalHandle} />
              
              <Text style={[styles.modalTitle, { color: colors.text }]}>Finish Workout?</Text>
              
              <View style={styles.workoutSummary}>
                <View style={[
                  styles.summaryItem,
                  { 
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#F9FAFB',
                    borderWidth: isDarkMode ? 1 : 0,
                    borderColor: colors.border
                  }
                ]}>
                  <ExpoLinearGradient
                    colors={isDarkMode ? ['#FF9500', '#FF5500'] : ['#8B5CF6', '#3B82F6']}
                    style={styles.summaryIconContainer}
                  >
                    <Ionicons name="time-outline" size={24} color="#fff" />
                  </ExpoLinearGradient>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{formatTime(time)}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Duration</Text>
                </View>
                
                <View style={[
                  styles.summaryItem,
                  { 
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#F9FAFB',
                    borderWidth: isDarkMode ? 1 : 0,
                    borderColor: colors.border
                  }
                ]}>
                  <ExpoLinearGradient
                    colors={isDarkMode ? ['#FF9500', '#FF5500'] : ['#F97316', '#F59E0B']}
                    style={styles.summaryIconContainer}
                  >
                    <Ionicons name="flame-outline" size={24} color="#fff" />
                  </ExpoLinearGradient>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{calories}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Calories</Text>
                </View>
              </View>
              
              {/* Workout name input ABOVE buttons */}
<TextInput
  style={[
    styles.templateNameInput,
    {
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#F9FAFB',
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: colors.border,
      color: colors.text,
    }
  ]}
  placeholder="Enter workout name"
  placeholderTextColor={colors.secondaryText}
  value={workoutName}
  onChangeText={setWorkoutName}
/>

{/* Buttons grouped below the input */}
<View style={styles.modalButtons}>
  <TouchableOpacity
    style={[
      styles.modalButton,
      styles.resumeButton,
      { backgroundColor: isDarkMode ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF' },
    ]}
    onPress={handleResumePress}
  >
    <Text
      style={[
        styles.resumeButtonText,
        { color: isDarkMode ? '#818CF8' : '#4F46E5' },
      ]}
    >
      Resume
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.modalButton, styles.logWorkoutButton]}
    onPress={handleLogWorkoutPress}
  >
    <ExpoLinearGradient
      colors={isDarkMode ? ['#FF9500', '#FF5500'] : ['#8B5CF6', '#3B82F6']}
      style={styles.logButtonGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={styles.logWorkoutButtonText}>Log Workout</Text>
    </ExpoLinearGradient>
  </TouchableOpacity>
</View>

            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  templateNameInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginVertical: 8,
  },
  verticalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stopwatchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stopwatchTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#4F46E5',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurView: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  workoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  summaryItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    width: '45%',
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resumeButton: {
    backgroundColor: '#EEF2FF',
  },
  resumeButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  logWorkoutButton: {
    backgroundColor: '#4F46E5',
  },
  logButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logWorkoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default Stopwatch;

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
//   Modal,
//   Dimensions,
//   Easing,
//   Platform
// } from 'react-native';
// import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { supabase } from '../utils/supabaseClient';
// import { BlurView } from 'expo-blur';
// import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
// import MaskedView from '@react-native-masked-view/masked-view';

// const { width } = Dimensions.get('window');
// // Reduced circle size to make the stopwatch more compact
// const CIRCLE_SIZE = Math.min(width * 0.4, 150); // 40% of screen width, max 150px
// const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
// const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * (CIRCLE_RADIUS - 10); // Reduced stroke width

// const Stopwatch: React.FC = () => {
//   const [isRunning, setIsRunning] = useState(true);
//   const [time, setTime] = useState(0);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [calories, setCalories] = useState(0);
  
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const progressAnimation = useRef(new Animated.Value(0)).current;
//   const pulseAnimation = useRef(new Animated.Value(1)).current;
//   const buttonScaleAnim = useRef(new Animated.Value(1)).current;
//   const router = useRouter();

//   // Calculate calories burned (rough estimate)
//   useEffect(() => {
//     // Assuming average person burns ~10 calories per minute during moderate exercise
//     const caloriesPerSecond = 10 / 60;
//     setCalories(Math.round(time * caloriesPerSecond));
//   }, [time]);

//   // Start the stopwatch
//   const startTimer = () => {
//     intervalRef.current = setInterval(() => {
//       setTime((prevTime) => prevTime + 1);
//     }, 1000);
    
//     // Start pulse animation
//     startPulseAnimation();
//   };

//   // Stop the stopwatch
//   const stopTimer = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
    
//     // Stop pulse animation
//     Animated.timing(pulseAnimation, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   };

//   // Toggle timer on tap
//   const toggleTimer = () => {
//     if (isRunning) {
//       stopTimer();
//     } else {
//       startTimer();
//     }
//     setIsRunning((prev) => !prev);
    
//     // Button press animation
//     Animated.sequence([
//       Animated.timing(buttonScaleAnim, {
//         toValue: 0.95,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(buttonScaleAnim, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   // Start the timer automatically on mount
//   useEffect(() => {
//     startTimer();
//     return () => {
//       stopTimer();
//     };
//   }, []);

//   // Pulse animation
//   const startPulseAnimation = () => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnimation, {
//           toValue: 1.05,
//           duration: 1000,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnimation, {
//           toValue: 1,
//           duration: 1000,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   };

//   // Update progress animation
//   useEffect(() => {
//     Animated.timing(progressAnimation, {
//       toValue: time % 3600,
//       duration: 500,
//       useNativeDriver: false,
//     }).start();
//   }, [time]);

//   // Format time as HH:MM:SS
//   const formatTime = (seconds: number) => {
//     const hrs = Math.floor(seconds / 3600)
//       .toString()
//       .padStart(2, '0');
//     const mins = Math.floor((seconds % 3600) / 60)
//       .toString()
//       .padStart(2, '0');
//     const secs = (seconds % 60).toString().padStart(2, '0');
//     return `${hrs}:${mins}:${secs}`;
//   };

//   // Handle Stop Button Press
//   const handleStopPress = () => {
//     setModalVisible(true);
//     stopTimer();
//   };

//   // Handle Resume Button Press
//   const handleResumePress = () => {
//     setModalVisible(false);
//     if (!isRunning) {
//       startTimer();
//       setIsRunning(true);
//     }
//   };

//   // Handle Log Workout Button Press
//   const handleLogWorkoutPress = async () => {
//     // Get logged-in user
//     const { data: userData, error: userError } = await supabase.auth.getUser();
  
//     if (userError || !userData?.user) {
//       console.error("No user found, cannot log workout.");
//       alert("You must be logged in to log a workout.");
//       return;
//     }
  
//     try {
//       const { error } = await supabase.from("workouts").insert([
//         {
//           user_id: userData.user.id,
//           workout_name: "Custom Workout",
//           duration: time,
//           calories_burned: calories,
//           logged_at: new Date(),
//         },
//       ]);
  
//       if (error) {
//         console.error("Error logging workout:", error.message);
//         alert("Workout log failed: " + error.message);
//       } else {
//         console.log("Workout logged successfully!");
//         alert("Workout logged successfully!");
//         setTime(0);
//         setModalVisible(false);
//         router.push('/workout');
//       }
//     } catch (err) {
//       console.error("Unexpected Error:", err);
//       alert("An unexpected error occurred.");
//     }
//   };

//   // Calculate stroke dashoffset for progress circle
//   const strokeDashoffset = progressAnimation.interpolate({
//     inputRange: [0, 3600], // 1 hour max
//     outputRange: [CIRCLE_CIRCUMFERENCE, 0],
//   });

//   // Calculate workout metrics
//   const workoutMinutes = Math.floor(time / 60);
  
//   return (
//     <View style={styles.container}>
//       {/* Stopwatch - Vertical Layout */}
//       <View style={styles.verticalContainer}>
//         {/* Timer Circle */}
//         <Animated.View 
//           style={[
//             styles.stopwatchContainer,
//             { transform: [{ scale: pulseAnimation }] }
//           ]}
//         >
//           <TouchableOpacity 
//             onPress={toggleTimer} 
//             activeOpacity={0.9}
//             style={styles.stopwatchTouchable}
//           >
//             <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
//               <Defs>
//                 <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
//                   <Stop offset="0%" stopColor="#8B5CF6" />
//                   <Stop offset="100%" stopColor="#3B82F6" />
//                 </LinearGradient>
//               </Defs>
              
//               {/* Background Circle */}
//               <Circle
//                 cx={CIRCLE_RADIUS}
//                 cy={CIRCLE_RADIUS}
//                 r={CIRCLE_RADIUS - 10}
//                 stroke="#E5E7EB"
//                 strokeWidth={8}
//                 fill="transparent"
//               />
              
//               {/* Progress Circle */}
//               <AnimatedCircle
//                 cx={CIRCLE_RADIUS}
//                 cy={CIRCLE_RADIUS}
//                 r={CIRCLE_RADIUS - 10}
//                 stroke="url(#grad)"
//                 strokeWidth={8}
//                 strokeLinecap="round"
//                 fill="transparent"
//                 strokeDasharray={CIRCLE_CIRCUMFERENCE}
//                 strokeDashoffset={strokeDashoffset}
//                 rotation="-90"
//                 origin={`${CIRCLE_RADIUS}, ${CIRCLE_RADIUS}`}
//               />
//             </Svg>
            
//             <View style={styles.timeDisplay}>
//               <MaskedView
//                 maskElement={
//                   <Text style={styles.timeText}>{formatTime(time)}</Text>
//                 }
//               >
//                 <ExpoLinearGradient
//                   colors={['#8B5CF6', '#3B82F6']}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                   style={{ flex: 1 }}
//                 />
//               </MaskedView>
//             </View>
//           </TouchableOpacity>
//         </Animated.View>

//         {/* Stats Row */}
//         <View style={styles.statsRow}>
//           <View style={styles.statItem}>
//             <Text style={styles.statValue}>{workoutMinutes}</Text>
//             <Text style={styles.statLabel}>Min</Text>
//           </View>
//           <View style={styles.statItem}>
//             <Text style={styles.statValue}>{calories}</Text>
//             <Text style={styles.statLabel}>Cal</Text>
//           </View>
//         </View>
        
//         {/* Controls Row */}
//         <View style={styles.controlsRow}>
//           <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
//             <TouchableOpacity 
//               style={[styles.controlButton, styles.pauseButton]} 
//               onPress={toggleTimer}
//             >
//               <ExpoLinearGradient
//                 colors={['#8B5CF6', '#3B82F6']}
//                 style={styles.buttonGradient}
//               >
//                 <Ionicons 
//                   name={isRunning ? "pause" : "play"} 
//                   size={22} 
//                   color="#fff" 
//                 />
//               </ExpoLinearGradient>
//             </TouchableOpacity>
//           </Animated.View>
          
//           <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
//             <TouchableOpacity 
//               style={[styles.controlButton, styles.stopButton]} 
//               onPress={handleStopPress}
//             >
//               <ExpoLinearGradient
//                 colors={['#EF4444', '#DC2626']}
//                 style={styles.buttonGradient}
//               >
//                 <Ionicons name="stop" size={22} color="#fff" />
//               </ExpoLinearGradient>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </View>

//       {/* Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <BlurView intensity={30} tint="dark" style={styles.blurView}>
//             <View style={styles.modalContainer}>
//               <View style={styles.modalHandle} />
              
//               <Text style={styles.modalTitle}>Finish Workout?</Text>
              
//               <View style={styles.workoutSummary}>
//                 <View style={styles.summaryItem}>
//                   <ExpoLinearGradient
//                     colors={['#8B5CF6', '#3B82F6']}
//                     style={styles.summaryIconContainer}
//                   >
//                     <Ionicons name="time-outline" size={24} color="#fff" />
//                   </ExpoLinearGradient>
//                   <Text style={styles.summaryValue}>{formatTime(time)}</Text>
//                   <Text style={styles.summaryLabel}>Duration</Text>
//                 </View>
                
//                 <View style={styles.summaryItem}>
//                   <ExpoLinearGradient
//                     colors={['#F97316', '#F59E0B']}
//                     style={styles.summaryIconContainer}
//                   >
//                     <Ionicons name="flame-outline" size={24} color="#fff" />
//                   </ExpoLinearGradient>
//                   <Text style={styles.summaryValue}>{calories}</Text>
//                   <Text style={styles.summaryLabel}>Calories</Text>
//                 </View>
//               </View>
              
//               <View style={styles.modalButtons}>
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.resumeButton]}
//                   onPress={handleResumePress}
//                 >
//                   <Text style={styles.resumeButtonText}>Resume</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.logWorkoutButton]}
//                   onPress={handleLogWorkoutPress}
//                 >
//                   <ExpoLinearGradient
//                     colors={['#8B5CF6', '#3B82F6']}
//                     style={styles.logButtonGradient}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 0 }}
//                   >
//                     <Text style={styles.logWorkoutButtonText}>Log Workout</Text>
//                   </ExpoLinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </BlurView>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//   },
//   verticalContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//   },
//   stopwatchContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   stopwatchTouchable: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   timeDisplay: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   timeText: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1F2937',
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   statItem: {
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     marginHorizontal: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   statValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1F2937',
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   controlsRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   controlButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 8,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   buttonGradient: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   pauseButton: {
//     backgroundColor: '#4F46E5',
//   },
//   stopButton: {
//     backgroundColor: '#EF4444',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   blurView: {
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     overflow: 'hidden',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 24,
//     alignItems: 'center',
//   },
//   modalHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: '#D1D5DB',
//     borderRadius: 3,
//     marginBottom: 24,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 24,
//   },
//   workoutSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//     marginBottom: 32,
//   },
//   summaryItem: {
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     padding: 16,
//     borderRadius: 16,
//     width: '45%',
//   },
//   summaryIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   summaryValue: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginTop: 8,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   modalButton: {
//     flex: 1,
//     marginHorizontal: 8,
//     height: 56,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     overflow: 'hidden',
//   },
//   resumeButton: {
//     backgroundColor: '#EEF2FF',
//   },
//   resumeButtonText: {
//     color: '#4F46E5',
//     fontWeight: '700',
//     fontSize: 16,
//   },
//   logWorkoutButton: {
//     backgroundColor: '#4F46E5',
//   },
//   logButtonGradient: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logWorkoutButtonText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16,
//   },
// });

// const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// export default Stopwatch;




// // components/Stopwatch.tsx

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity, Modal
// } from 'react-native';
// import Svg, { Circle } from 'react-native-svg';
// import { Play, Pause } from 'lucide-react-native'; // Import icons
// import { useRouter } from 'expo-router';
// import { supabase } from '../utils/supabaseClient';
// import { useContext } from 'react';
// import { WorkoutContext } from '../context/WorkoutContext';

// const Stopwatch: React.FC = () => {
//   const [isRunning, setIsRunning] = useState(true); // Starts running automatically
//   const [time, setTime] = useState(0); // Time in seconds
//   const [modalVisible, setModalVisible] = useState(false); // Modal state
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const animatedValue = useRef(new Animated.Value(0)).current;
//   const router = useRouter();
//   const glowAnimation = useRef(new Animated.Value(1)).current;

//   // Start the stopwatch
//   const startTimer = () => {
//     intervalRef.current = setInterval(() => {
//       setTime((prevTime) => prevTime + 1);
//     }, 1000);
//   };

//   // Stop the stopwatch
//   const stopTimer = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   };

//   // Toggle timer on tap
//   const toggleTimer = () => {
//     if (isRunning) {
//       stopTimer();
//     } else {
//       startTimer();
//     }
//     setIsRunning((prev) => !prev);
//     triggerGlowEffect();
//   };

//   // Start the timer automatically on mount
//   useEffect(() => {
//     startTimer();
//     return () => {
//       stopTimer();
//     };
//   }, []);

//   // Animate progress circle
//   useEffect(() => {
//     Animated.timing(animatedValue, {
//       toValue: (time % 3600) / 3600, // Assuming max time displayed in 1-hour cycles
//       duration: 1000,
//       useNativeDriver: false,
//     }).start();
//   }, [time]);

//   // Glow effect animation
//   const triggerGlowEffect = () => {
//     Animated.sequence([
//       Animated.timing(glowAnimation, {
//         toValue: 1.5,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//       Animated.timing(glowAnimation, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   // Format time as HH:MM:SS
//   const formatTime = (seconds: number) => {
//     const hrs = Math.floor(seconds / 3600)
//       .toString()
//       .padStart(2, '0');
//     const mins = Math.floor((seconds % 3600) / 60)
//       .toString()
//       .padStart(2, '0');
//     const secs = (seconds % 60).toString().padStart(2, '0');
//     return `${hrs}:${mins}:${secs}`;
//   };

//   // Handle Stop Button Press
//   const handleStopPress = () => {
//     setModalVisible(true);
//   };

//   // Handle Resume Button Press
//   const handleResumePress = () => {
//     setModalVisible(false);
//   };

//   // Handle Log Workout Button Press
//   // const handleLogWorkoutPress = () => {
//   //   setModalVisible(false);
//   //   router.push('/workout'); // Navigate to SavedScreen
//   // };

//   const handleLogWorkoutPress = async () => {
//     // ✅ Get logged-in user correctly
//     const { data: userData, error: userError } = await supabase.auth.getUser();
  
//     if (userError || !userData?.user) {
//       console.error("❌ No user found, cannot log workout.");
//       alert("⚠️ You must be logged in to log a workout.");
//       return;
//     }
  
//     try {
//       const { error } = await supabase.from("workouts").insert([
//         {
//           user_id: userData.user.id, // ✅ Correct user ID
//           workout_name: "Custom Workout",
//           duration: time, // Store workout time
//           logged_at: new Date(), // Store timestamp
//         },
//       ]);
  
//       if (error) {
//         console.error("❌ Error logging workout:", error.message);
//         alert("⚠️ Workout log failed: " + error.message);
//       } else {
//         console.log("✅ Workout logged successfully!");
//         alert("🎉 Workout logged successfully!");
//         setTime(0); // Reset stopwatch
//         setModalVisible(false);
//         router.push('/workout'); // Navigate to SavedScreen
//       }
//     } catch (err) {
//       console.error("🚨 Unexpected Error:", err);
//       alert("⚠️ An unexpected error occurred.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Stopwatch */}
//       <TouchableOpacity onPress={toggleTimer} activeOpacity={0.8}>
//         <Svg width="150" height="150" viewBox="0 0 150 150">
//           <Circle cx="75" cy="75" r="70" stroke="#d1d5db" strokeWidth="10" fill="none" />
//           <AnimatedCircle
//             cx="75"
//             cy="75"
//             r="70"
//             stroke="#2563eb"
//             strokeWidth="10"
//             fill="none"
//             strokeDasharray={"440"} // Circumference of the circle
//             strokeDashoffset={animatedValue.interpolate({
//               inputRange: [0, 1],
//               outputRange: [440, 0], // Animate from full to empty
//             })}
//             strokeLinecap="round"
//           />
//         </Svg>
//         <Text style={styles.timerText}>{formatTime(time)}</Text>
//       </TouchableOpacity>

//       {/* Buttons */}
//       <View style={styles.buttonsContainer}>
//         {/* Pause/Play Button */}
//         <TouchableOpacity onPress={toggleTimer} style={styles.iconButton}>
//           {isRunning ? (
//             <Pause color="#fff" size={32} />
//           ) : (
//             <Play color="#fff" size={32} />
//           )}
//         </TouchableOpacity>

//         {/* Stop Button */}
//         <TouchableOpacity onPress={handleStopPress} style={styles.iconButton}>
//           <View style={styles.innerSquare} />
//         </TouchableOpacity>
//       </View>

//       {/* Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Finish and Log your Workout?</Text>
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.resumeButton]}
//                 onPress={handleResumePress}
//               >
//                 <Text style={styles.resumeButtonText}>Resume</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.logWorkoutButton]}
//                 onPress={handleLogWorkoutPress}
//               >
//                 <Text style={styles.logWorkoutButtonText}>Log Workout</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 16,
//   },
//   timerText: {
//     position: 'absolute',
//     top: '35%',
//     alignSelf: 'center',
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1f2937',
//   },
//   buttonsContainer: {
//     flexDirection: 'row',
//     marginTop: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   iconButton: {
//     marginHorizontal: 16,
//     width: 60, // Uniform size for both buttons
//     height: 60,
//     borderRadius: 30, // Circular shape
//     backgroundColor: '#2563eb', // Blue background for consistency
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   innerSquare: {
//     width: 25, // Inner square size
//     height: 25,
//     borderRadius: 6, // Slightly rounded corners
//     backgroundColor: '#fff', // White color for the inner square
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#1f2937',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   modalButton: {
//     flex: 1,
//     marginHorizontal: 8,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   resumeButton: {
//     backgroundColor: '#e0f2fe',
//   },
//   resumeButtonText: {
//     color: '#2563eb',
//     fontWeight: 'bold',
//   },
//   logWorkoutButton: {
//     backgroundColor: '#ef4444',
//   },
//   logWorkoutButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// export default Stopwatch;
