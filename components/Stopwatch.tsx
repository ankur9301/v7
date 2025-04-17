// components/Stopwatch.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity, Modal
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Play, Pause } from 'lucide-react-native'; // Import icons
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabaseClient';
import { useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';

const Stopwatch: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true); // Starts running automatically
  const [time, setTime] = useState(0); // Time in seconds
  const [modalVisible, setModalVisible] = useState(false); // Modal state
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const glowAnimation = useRef(new Animated.Value(1)).current;

  // Start the stopwatch
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  // Stop the stopwatch
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Toggle timer on tap
  const toggleTimer = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
    setIsRunning((prev) => !prev);
    triggerGlowEffect();
  };

  // Start the timer automatically on mount
  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
    };
  }, []);

  // Animate progress circle
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (time % 3600) / 3600, // Assuming max time displayed in 1-hour cycles
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [time]);

  // Glow effect animation
  const triggerGlowEffect = () => {
    Animated.sequence([
      Animated.timing(glowAnimation, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
  };

  // Handle Log Workout Button Press
  // const handleLogWorkoutPress = () => {
  //   setModalVisible(false);
  //   router.push('/workout'); // Navigate to SavedScreen
  // };

  const handleLogWorkoutPress = async () => {
    // ✅ Get logged-in user correctly
    const { data: userData, error: userError } = await supabase.auth.getUser();
  
    if (userError || !userData?.user) {
      console.error("❌ No user found, cannot log workout.");
      alert("⚠️ You must be logged in to log a workout.");
      return;
    }
  
    try {
      const { error } = await supabase.from("workouts").insert([
        {
          user_id: userData.user.id, // ✅ Correct user ID
          workout_name: "Custom Workout",
          duration: time, // Store workout time
          logged_at: new Date(), // Store timestamp
        },
      ]);
  
      if (error) {
        console.error("❌ Error logging workout:", error.message);
        alert("⚠️ Workout log failed: " + error.message);
      } else {
        console.log("✅ Workout logged successfully!");
        alert("🎉 Workout logged successfully!");
        setTime(0); // Reset stopwatch
        setModalVisible(false);
        router.push('/workout'); // Navigate to SavedScreen
      }
    } catch (err) {
      console.error("🚨 Unexpected Error:", err);
      alert("⚠️ An unexpected error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Stopwatch */}
      <TouchableOpacity onPress={toggleTimer} activeOpacity={0.8}>
        <Svg width="150" height="150" viewBox="0 0 150 150">
          <Circle cx="75" cy="75" r="70" stroke="#d1d5db" strokeWidth="10" fill="none" />
          <AnimatedCircle
            cx="75"
            cy="75"
            r="70"
            stroke="#2563eb"
            strokeWidth="10"
            fill="none"
            strokeDasharray={"440"} // Circumference of the circle
            strokeDashoffset={animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [440, 0], // Animate from full to empty
            })}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Pause/Play Button */}
        <TouchableOpacity onPress={toggleTimer} style={styles.iconButton}>
          {isRunning ? (
            <Pause color="#fff" size={32} />
          ) : (
            <Play color="#fff" size={32} />
          )}
        </TouchableOpacity>

        {/* Stop Button */}
        <TouchableOpacity onPress={handleStopPress} style={styles.iconButton}>
          <View style={styles.innerSquare} />
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Finish and Log your Workout?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resumeButton]}
                onPress={handleResumePress}
              >
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logWorkoutButton]}
                onPress={handleLogWorkoutPress}
              >
                <Text style={styles.logWorkoutButtonText}>Log Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  timerText: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    marginHorizontal: 16,
    width: 60, // Uniform size for both buttons
    height: 60,
    borderRadius: 30, // Circular shape
    backgroundColor: '#2563eb', // Blue background for consistency
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  innerSquare: {
    width: 25, // Inner square size
    height: 25,
    borderRadius: 6, // Slightly rounded corners
    backgroundColor: '#fff', // White color for the inner square
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButton: {
    backgroundColor: '#e0f2fe',
  },
  resumeButtonText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  logWorkoutButton: {
    backgroundColor: '#ef4444',
  },
  logWorkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default Stopwatch;
