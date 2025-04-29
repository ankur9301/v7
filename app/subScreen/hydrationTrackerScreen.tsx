"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  RefreshControl,
} from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { useTheme, lightTheme, darkTheme } from "@/context/ThemeContext"
import * as Haptics from "expo-haptics"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useHydrationStore } from "@/src/stores/useHydrationStore";
import { getTodayDateString } from '@/utils/dateHelper'
import { supabase } from "@/src/supabaseClient"
import { useUserStore } from "@/store/useUserStore";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import HydrationChartModal from '@/components/hydrationChart';
import { Alert } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

interface GlassOption {
  id: string
  name: string
  icon: string
  ml: number
  oz: number
}

type UnitType = "ml" | "oz" | "cups"

const HydrationTrackerScreen: React.FC = () => {
  const navigation = useNavigation()
  const { isDarkMode } = useTheme()
  const colors = isDarkMode ? darkTheme : lightTheme
  const { user } = useUserStore(); // get the logged-in user
  const [isLoading, setIsLoading] = useState(false);
  const [isChartModalVisible, setIsChartModalVisible] = useState(false);

  const fetchHydrationData = async () => {
    if (!user || !user.id) {
      console.log("No user yet, skipping hydration fetch...");
      return;
    }
  
    setIsLoading(true);
  
    const todayDate = getTodayDateString();
  
    const { data, error } = await supabase
      .from("hydration_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayDate);
  
    if (error) {
      console.error("Error fetching hydration logs:", error);
      setIsLoading(false);
      return;
    }
  
    if (data && data.length > 0) {
      const totalAmount = data.reduce((sum, log) => sum + (log.amount_ml ?? 0), 0);
      setWaterAmount(totalAmount);
      setWaterGoal(data[0].goal_ml ?? 2000);
    } else {
      resetHydration();
    }
  
    setIsLoading(false);
  };
  
  
 

  useFocusEffect(
    useCallback(() => {
      if (!user || !user.id) return;
  
      const timeout = setTimeout(() => {
        fetchHydrationData();
      }, 300); // wait 300ms
  
      return () => clearTimeout(timeout);
    }, [user])
  );
  

  const glassOptions: GlassOption[] = [
    { id: "small", name: "Small", icon: "cup", ml: 150, oz: 5 },
    { id: "medium", name: "Medium", icon: "glass-mug-variant", ml: 250, oz: 8 },
    { id: "large", name: "Large", icon: "glass-tulip", ml: 350, oz: 12 },
    { id: "bottle", name: "Bottle", icon: "bottle-soda", ml: 500, oz: 17 },
  ]

  const [selectedGlassIndex, setSelectedGlassIndex] = useState(1)
  const [glassQuantity, setGlassQuantity] = useState(1)
  const [quantityInputValue, setQuantityInputValue] = useState("1")
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  // const [waterAmount, setWaterAmount] = useState(0)
  // const [unitType, setUnitType] = useState<UnitType>("ml")
  // const [waterGoal, setWaterGoal] = useState(2000)
  const {
    waterAmount,
    waterGoal,
    unitType,
    setWaterAmount,
    addWater,
    setWaterGoal,
    setUnitType,
    resetHydration,
  } = useHydrationStore();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showWaterAddedIndicator, setShowWaterAddedIndicator] = useState(false)
  const [lastAddedAmount, setLastAddedAmount] = useState(0)
  const [goalInputValue, setGoalInputValue] = useState("")
  const [isEditingGoal, setIsEditingGoal] = useState(false)

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current
  const waterRippleAnim = useRef(new Animated.Value(0)).current
  const addButtonScale = useRef(new Animated.Value(1)).current
  const waveAnim1 = useRef(new Animated.Value(0)).current
  const waveAnim2 = useRef(new Animated.Value(0)).current
  const waveAnim3 = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const resetButtonAnim = useRef(new Animated.Value(1)).current
  const emojiFloatAnim = useRef(new Animated.Value(0)).current
  const emojiRotateAnim = useRef(new Animated.Value(0)).current
  const emojiScaleAnim = useRef(new Animated.Value(1)).current
  const waterAddedAnim = useRef(new Animated.Value(0)).current
  const addButtonPulse = useRef(new Animated.Value(0)).current
  const bubbleAnims = useRef(
    Array(12)
      .fill(0)
      .map(() => new Animated.Value(0)),
  ).current
  const particleAnims = useRef(
    Array(15)
      .fill(0)
      .map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      })),
  ).current
  const glassScrollRef = useRef<ScrollView>(null)
  const quantityInputRef = useRef<TextInput>(null)
  const goalInputRef = useRef<TextInput>(null)

  const getProgressPercentage = () => Math.min((waterAmount / waterGoal) * 100, 100)

  const formatAmount = (amount: number) => {
    switch (unitType) {
      case "ml":
        return `${amount} ml`
      case "oz":
        return `${(amount / 29.574).toFixed(1)} oz`
      case "cups":
        return `${(amount / 250).toFixed(1)} cups`
    }
  }

  const formatGoal = () => {
    switch (unitType) {
      case "ml":
        return `${waterGoal} ml`
      case "oz":
        return `${(waterGoal / 29.574).toFixed(1)} oz`
      case "cups":
        return `${(waterGoal / 250).toFixed(1)} cups`
    }
  }

  const getSelectedGlassVolume = () => {
    const selectedGlass = glassOptions[selectedGlassIndex]
    switch (unitType) {
      case "ml":
        return selectedGlass.ml
      case "oz":
        return selectedGlass.oz
      case "cups":
        return selectedGlass.ml / 250
    }
  }

  // Get goal presets based on unit type
  const getGoalPresets = () => {
    switch (unitType) {
      case "ml":
        return [1000, 2000, 3000, 4000]
      case "oz":
        return [32, 64, 96, 128] // ~1L, 2L, 3L, 4L in oz
      case "cups":
        return [4, 8, 12, 16] // ~1L, 2L, 3L, 4L in cups
    }
  }

  // Format goal preset display
  const formatGoalPreset = (value: number) => {
    switch (unitType) {
      case "ml":
        return `${value / 1000}L`
      case "oz":
        return `${value} oz`
      case "cups":
        return `${value} cups`
    }
  }

  useEffect(() => {
    // Start animations when component mounts
    startAnimations()
  }, [])

  const startAnimations = () => {
    // Wave animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim1, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(waveAnim1, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim2, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(waveAnim2, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim3, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(waveAnim3, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start()

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ]),
    ).start()

    // Emoji animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiFloatAnim, {
          toValue: -10,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(emojiFloatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiRotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(emojiRotateAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start()

    // Bubble animations
    bubbleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + index * 500,
            delay: index * 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
      ).start()
    })

    // Add button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(addButtonPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(addButtonPulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start()
  }

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: getProgressPercentage() / 100,
      duration: 800,
      useNativeDriver: false,
      easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
    }).start()

    // Animate emoji scale based on progress
    Animated.spring(emojiScaleAnim, {
      toValue: 1 + getProgressPercentage() / 200, // Subtle scale increase with progress
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start()
  }, [waterAmount, waterGoal])

  // Update goal input value when unit type changes
  useEffect(() => {
    setGoalInputValue(
      unitType === "ml"
        ? waterGoal.toString()
        : unitType === "oz"
          ? (waterGoal / 29.574).toFixed(1)
          : (waterGoal / 250).toFixed(1),
    )
  }, [unitType, waterGoal])

  const openSettings = () => {
    setIsSettingsOpen(true)
    if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const closeSettings = () => {
    setIsSettingsOpen(false)
  }


  const handleAdd = async () => {
    const selectedGlass = glassOptions[selectedGlassIndex];
    const addAmount =
      unitType === "ml" ? selectedGlass.ml : unitType === "oz" ? selectedGlass.oz : selectedGlass.ml / 250;
    const mlEquivalent = unitType === "ml" ? addAmount : unitType === "oz" ? addAmount * 29.574 : addAmount * 250;
    const amountToAdd = mlEquivalent * glassQuantity;
  
    addWater(amountToAdd); 
    setLastAddedAmount(amountToAdd);
    triggerWaterRipple();
    animateAddButton();
    showAddedWaterIndicator();
    animateParticles();
  
    try {
      const todayDate = getTodayDateString();
      const { error } = await supabase
        .from("hydration_logs")
        .insert({
          user_id: user?.id ?? "",
          date: todayDate,
          amount_ml: Math.round(amountToAdd),
          goal_ml: waterGoal,
          unit: unitType,
          added_at: new Date().toISOString(), // Add timestamp when log was created
        });
  
      if (error) console.error("Error inserting hydration log:", error);
    } catch (err) {
      console.error("Unexpected error adding water:", err);
    }
  };
    

  const updateHydrationLog = async (fieldsToUpdate: Partial<{ goal_ml: number; amount_ml: number }>) => {

    try {
      const todayDate = getTodayDateString();
      const { data, error } = await supabase
        .from("hydration_logs")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .eq("date", todayDate)
        .single();
  
      if (data) {
        const { error: updateError } = await supabase
          .from("hydration_logs")
          .update(fieldsToUpdate)
          .eq("id", data.id);
  
        if (updateError) console.error("Error updating hydration log:", updateError);
      }
    } catch (err) {
      console.error("Unexpected error updating hydration log:", err);
    }
  };
  

  const showAddedWaterIndicator = () => {
    setShowWaterAddedIndicator(true)
    waterAddedAnim.setValue(0)

    Animated.sequence([
      Animated.timing(waterAddedAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.delay(1000),
      Animated.timing(waterAddedAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowWaterAddedIndicator(false)
    })
  }

  const animateParticles = () => {
    particleAnims.forEach((particle, index) => {
      particle.x.setValue(0)
      particle.y.setValue(0)
      particle.scale.setValue(0)
      particle.opacity.setValue(0)

      const angle = (index / particleAnims.length) * Math.PI * 2
      const distance = 50 + Math.random() * 50

      Animated.sequence([
        Animated.parallel([
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(particle.scale, {
            toValue: 0.5 + Math.random() * 0.5,
            duration: 200,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.cos(angle) * distance,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(particle.y, {
            toValue: Math.sin(angle) * distance - 50, // Upward bias
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1000,
            delay: 200,
            useNativeDriver: false,
          }),
        ]),
      ]).start()
    })
  }




const handleReset = () => {
  Alert.alert(
    "Reset Today's Data?",
    "This will clear all hydration logs for today. Are you sure?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes, Reset",
        style: "destructive",
        onPress: async () => {
          try {
            const todayDate = getTodayDateString();
            const { error } = await supabase
              .from("hydration_logs")
              .delete()
              .eq("user_id", user?.id ?? "")
              .eq("date", todayDate);

            if (error) {
              console.error("Error deleting hydration logs:", error);
            }
          } catch (err) {
            console.error("Unexpected error resetting hydration logs:", err);
          }

          Animated.sequence([
            Animated.timing(resetButtonAnim, { toValue: 0.8, duration: 150, useNativeDriver: false }),
            Animated.spring(resetButtonAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: false }),
          ]).start();

          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
            easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
          }).start(() => {
            resetHydration();
            if (Platform.OS === "ios") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          });

          Animated.timing(emojiScaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }).start();
        },
      },
    ],
    { cancelable: true }
  );
};

  

  const triggerWaterRipple = () => {
    waterRippleAnim.setValue(0)
    Animated.timing(waterRippleAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
      easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
    }).start()
  }

  const animateAddButton = () => {
    addButtonScale.setValue(1)
    Animated.sequence([
      Animated.timing(addButtonScale, { toValue: 1.15, duration: 150, useNativeDriver: false }),
      Animated.spring(addButtonScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: false }),
    ]).start()
  }

  const animateQuantityChange = (increment: boolean) => {
    const scale = increment ? 1.2 : 0.8
    const anim = new Animated.Value(1)
    Animated.sequence([
      Animated.timing(anim, { toValue: scale, duration: 100, useNativeDriver: false }),
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start()
    return anim
  }

  const handleQuantityInputChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, "")
    setQuantityInputValue(numericValue)
  }

  const handleQuantityInputBlur = () => {
    setIsEditingQuantity(false)
    const numValue = Number.parseInt(quantityInputValue, 10)
    if (!isNaN(numValue) && numValue > 0) {
      setGlassQuantity(numValue)
    } else {
      setQuantityInputValue(glassQuantity.toString())
    }
  }

  const handleGoalInputChange = (text: string) => {
    // Allow numbers and decimal point
    const numericValue = text.replace(/[^0-9.]/g, "")
    setGoalInputValue(numericValue)
  }



  const handleGoalInputBlur = async () => {
    setIsEditingGoal(false);
    const numValue = Number.parseFloat(goalInputValue);
    if (!isNaN(numValue) && numValue > 0) {
      let mlValue = numValue;
      if (unitType === "oz") {
        mlValue = numValue * 29.574;
      } else if (unitType === "cups") {
        mlValue = numValue * 250;
      }
      setWaterGoal(Math.round(mlValue));
      await updateHydrationLog({ goal_ml: Math.round(mlValue) }); // ✅ ADD this line
    } else {
      setGoalInputValue(
        unitType === "ml"
          ? waterGoal.toString()
          : unitType === "oz"
          ? (waterGoal / 29.574).toFixed(1)
          : (waterGoal / 250).toFixed(1)
      );
    }
  };
  
  // Enhanced ripple effect with better animation
  const rippleScale = waterRippleAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.4, 1.5, 2.5],
  })

  const rippleOpacity = waterRippleAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [0.6, 0.4, 0.2, 0],
  })

  // Wave animations - more subtle and realistic
  const wave1Offset = waveAnim1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-10, 0, -10],
  })

  const wave2Offset = waveAnim2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [5, 0, 5],
  })

  const wave3Offset = waveAnim3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-8, 2, -8],
  })

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  })

  // Emoji rotation animation
  const emojiRotation = emojiRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-5deg", "5deg"],
  })

  // Water added indicator animation
  const waterAddedTranslateY = waterAddedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  })

  // Add button glow animation
  const addButtonGlowOpacity = addButtonPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  })

  const getMotivationalContent = () => {
    const percentage = getProgressPercentage()
    if (percentage === 0) return { text: "Let's Hydrate!", emoji: "💧" }
    if (percentage < 25) return { text: "Great Start!", emoji: "🥤" }
    if (percentage < 50) return { text: "You're Rocking It!", emoji: "💦" }
    if (percentage < 75) return { text: "Keep Flowing!", emoji: "🌊" }
    if (percentage < 95) return { text: "So Close!", emoji: "🏊‍♂️" }
    return { text: "Hydration Hero!", emoji: "🎉" }
  }

  const motivationalContent = getMotivationalContent()

  // Enhanced glass option selection - scroll to center the selected glass
  const handleGlassSelect = (index: number) => {
    setSelectedGlassIndex(index)
    if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Scroll to center the selected glass
    if (glassScrollRef.current) {
      const itemWidth = 80 // Width + margin
      const offset = index * itemWidth - SCREEN_WIDTH / 2 + itemWidth / 2
      glassScrollRef.current.scrollTo({ x: Math.max(0, offset), animated: true })
    }
  }

  return (
    <SafeAreaView style={{ flex: 1,backgroundColor: colors.background
    }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            handleQuantityInputBlur()
            handleGoalInputBlur()
          }}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDarkMode ? "#1E293B" : "#E2E8F0" }]}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#F1F5F9" : "#0F172A"} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: isDarkMode ? "#F1F5F9" : "#0F172A" }]}>Hydration Tracker</Text>
              <View style={styles.headerButtons}>
                <Animated.View style={{ transform: [{ scale: resetButtonAnim }], marginRight: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.resetButton,
                      {
                        // backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)",
                        backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
                        borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
                      },
                    ]}
                    onPress={handleReset}
                  >
                    <Ionicons name="refresh" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                  </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    {
                      // backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)",
                      backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)"

                    },
                  ]}
                  onPress={openSettings}
                >
                  <Ionicons name="settings-outline" size={22} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.scrollContent, { paddingTop: 50 }]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={fetchHydrationData} // <-- reload hydration
                  tintColor={isDarkMode ? "#FF9500" : "#6366F1"}
                />
              }
            >
              <View style={styles.mainContent}>
                <View style={styles.waterVisualizationContainer}>
                  <View
                    style={[
                      styles.waterGlassContainer,
                      {
                        backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
                        borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
                        shadowColor: isDarkMode ? "#FF9500" : "#6366F1",
                      },
                    ]}
                  >
                    {/* Water fill */}
                    <Animated.View
                      style={[
                        styles.waterFill,
                        {
                          height: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                          // backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(79, 70, 229, 0.2)",
                          backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)"

                        },
                      ]}
                    >
                      {/* Wave 1 */}
                      <Animated.View
                        style={[
                          styles.waterWave,
                          {
                            backgroundColor: isDarkMode ? "#6366F1" : "#4F46E5",
                            transform: [{ translateX: wave1Offset }],
                            opacity: 0.8,
                            height: 1,
                            bottom: -5,
                          },
                        ]}
                      />

                      {/* Wave 2 */}
                      <Animated.View
                        style={[
                          styles.waterWave,
                          {
                            backgroundColor: isDarkMode ? "#4F46E5" : "#4338CA",
                            transform: [{ translateX: wave2Offset }],
                            top: 1,
                            opacity: 0.9,
                            height: 1,
                            bottom: 2,
                          },
                        ]}
                      />

                      {/* Bubbles */}
                      {bubbleAnims.map((anim, index) => (
                        <Animated.View
                          key={index}
                          style={[
                            styles.bubble,
                            {
                              left: 10 + (index % 6) * 20,
                              width: 6 + (index % 3) * 2,
                              height: 6 + (index % 3) * 2,
                              transform: [
                                {
                                  translateY: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [120, -20],
                                  }),
                                },
                                {
                                  scale: anim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0.5, 1, 0.8],
                                  }),
                                },
                              ],
                              opacity: anim.interpolate({
                                inputRange: [0, 0.2, 0.8, 1],
                                outputRange: [0, 1, 0.8, 0],
                              }),
                            },
                          ]}
                        />
                      ))}
                    </Animated.View>

                    {/* Ripple effect */}
                    <Animated.View
                      style={[
                        styles.rippleEffect,
                        {
                          transform: [{ scale: rippleScale }],
                          opacity: rippleOpacity,
                          backgroundColor: isDarkMode ? "#6366F1" : "#818CF8",
                        },
                      ]}
                    />

                    {/* Centered emoji with animations */}
                    <Animated.Text
                      style={[
                        styles.waterEmoji,
                        {
                          transform: [
                            { translateY: emojiFloatAnim },
                            { rotate: emojiRotation },
                            { scale: emojiScaleAnim },
                          ],
                        },
                      ]}
                    >
                      {motivationalContent.emoji}
                    </Animated.Text>

                    {/* Water level markers */}
                    <View style={styles.waterLevelMarkers}>
                      {[0.25, 0.5, 0.75, 1].map((level, index) => (
                        <View
                          key={index}
                          style={[
                            styles.waterLevelMarker,
                            {
                              bottom: `${level * 100}%`,
                              borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(99, 102, 241, 0.3)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.waterLevelText,
                              {
                                color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(99, 102, 241, 0.6)",
                                opacity: getProgressPercentage() / 100 >= level ? 1 : 0.3,
                              },
                            ]}
                          >
                            {Math.round(level * 100)}%
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Particles for water add animation */}
                    {particleAnims.map((particle, index) => (
                      <Animated.View
                        key={`particle-${index}`}
                        style={[
                          styles.particle,
                          {
                            backgroundColor: isDarkMode
                              ? index % 3 === 0
                                ? "#FF9500"
                                : index % 3 === 1
                                  ? "#6366F1"
                                  : "#818CF8"
                              : index % 3 === 0
                                ? "#6366F1"
                                : index % 3 === 1
                                  ? "#818CF8"
                                  : "#A5B4FC",
                            transform: [
                              { translateX: particle.x },
                              { translateY: particle.y },
                              { scale: particle.scale },
                            ],
                            opacity: particle.opacity,
                          },
                        ]}
                      />
                    ))}
                  </View>

                  {/* Water added indicator */}
                  {showWaterAddedIndicator && (
                    <Animated.View
                      style={[
                        styles.waterAddedIndicator,
                        {
                          transform: [{ translateY: waterAddedTranslateY }],
                          opacity: waterAddedAnim,
                          // backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)",
                          backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
                          borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.waterAddedText,
                          {
                            color: isDarkMode ? "#FF9500" : "#6366F1",
                          },
                        ]}
                      >
                        +{formatAmount(lastAddedAmount)}
                      </Text>
                    </Animated.View>
                  )}
                </View>

                <View style={styles.progressInfoContainer}>
                  <Text
                    style={[
                      styles.motivationalText,
                      {
                        color: isDarkMode ? "#FF9500" : "#6366F1",
                      },
                    ]}
                  >
                    {motivationalContent.text}
                  </Text>

                  <View style={styles.quantityDisplay}>
                    <View style={styles.quantityRow}>
                      <Text
                        style={[
                          styles.currentQuantity,
                          {
                            color: isDarkMode ? "#F3F4F6" : "#111827",
                          },
                        ]}
                      >
                        {formatAmount(waterAmount)}
                      </Text>
                      <Text
                        style={[
                          styles.goalQuantity,
                          {
                            color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(17, 24, 39, 0.6)",
                          },
                        ]}
                      >
                        / {formatGoal()}
                      </Text>
                    </View>

                    <View style={styles.percentageRow}>
                      <View
                        style={[
                          styles.progressBarContainer,
                          {
                            // backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.1)",
                            backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)"

                          },
                        ]}
                      >
                        <Animated.View
                          style={[
                            styles.progressBarFill,
                            {
                              width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                              }),
                              backgroundColor: isDarkMode ? "#FF9500" : "#6366F1",
                            },
                          ]}
                        >
                          <Animated.View
                            style={[
                              styles.progressGlow,
                              {
                                opacity: glowOpacity,
                                backgroundColor: isDarkMode ? "#FF9500" : "#818CF8",
                              },
                            ]}
                          />
                        </Animated.View>
                      </View>
                      <Text
                        style={[
                          styles.percentageText,
                          {
                            color: isDarkMode ? "#FF9500" : "#6366F1",
                          },
                        ]}
                      >
                        {Math.round(getProgressPercentage())}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDarkMode ? "#F3F4F6" : "#111827",
                    marginTop: 16,
                    marginBottom: 8,
                  },
                ]}
              >
                Select Container
              </Text>

              <ScrollView
                ref={glassScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.glassScrollContainer}
                >
                {glassOptions.map((glass, index) => (
                  <TouchableOpacity
                    key={glass.id}
                    style={[
                      styles.glassOption,
                      {
                        backgroundColor: isDarkMode
                          ? index === selectedGlassIndex
                            ? "rgba(99, 102, 241, 0.2)"
                            : "rgba(30, 41, 59, 0.5)"
                          : index === selectedGlassIndex
                            ? "rgba(99, 102, 241, 0.1)"
                            : "rgba(255, 255, 255, 0.8)",
                        borderColor:
                          index === selectedGlassIndex
                            ? isDarkMode
                              ? "#6366F1"
                              : "#6366F1"
                            : isDarkMode
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.05)",
                        transform: [{ scale: index === selectedGlassIndex ? 1.05 : 1 }],
                      },
                    ]}
                    onPress={() => handleGlassSelect(index)}
                  >
                    <MaterialCommunityIcons
                      name={glass.icon as any}
                      size={28}
                      color={
                        index === selectedGlassIndex
                          ? isDarkMode
                            ? "#FF9500"
                            : "#6366F1"
                          : isDarkMode
                            ? "#9CA3AF"
                            : "#6B7280"
                      }
                    />
                    <Text
                      style={[
                        styles.glassName,
                        {
                          color:
                            index === selectedGlassIndex
                              ? isDarkMode
                                ? "#FF9500"
                                : "#6366F1"
                              : isDarkMode
                                ? "#E5E7EB"
                                : "#374151",
                        },
                      ]}
                    >
                      {glass.name}
                    </Text>
                    <Text
                      style={[
                        styles.glassVolume,
                        {
                          color: isDarkMode ? "#9CA3AF" : "#6B7280",
                        },
                      ]}
                    >
                      {unitType === "ml"
                        ? `${glass.ml} ml`
                        : unitType === "oz"
                          ? `${glass.oz} oz`
                          : `${(glass.ml / 250).toFixed(1)} cups`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    {
                      backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                  onPress={() => {
                    const newQuantity = Math.max(1, glassQuantity - 1)
                    setGlassQuantity(newQuantity)
                    setQuantityInputValue(newQuantity.toString())
                    if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                  }}
                >
                  <Ionicons name="remove" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                </TouchableOpacity>

                {isEditingQuantity ? (
                  <TextInput
                    ref={quantityInputRef}
                    style={[
                      styles.quantityInput,
                      {
                        color: isDarkMode ? "#F3F4F6" : "#111827",
                        backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.9)",
                        borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
                      },
                    ]}
                    value={quantityInputValue}
                    onChangeText={handleQuantityInputChange}
                    onBlur={handleQuantityInputBlur}
                    keyboardType="number-pad"
                    autoFocus
                    selectTextOnFocus
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditingQuantity(true)
                      setTimeout(() => {
                        quantityInputRef.current?.focus()
                      }, 100)
                    }}
                  >
                    <Animated.View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        transform: [{ scale: animateQuantityChange(glassQuantity > 1) }],
                      }}
                    >
                      <Text
                        style={[
                          styles.quantityText,
                          {
                            color: isDarkMode ? "#F3F4F6" : "#111827",
                          },
                        ]}
                      >
                        {glassQuantity}
                      </Text>
                    </Animated.View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    {
                      backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                  onPress={() => {
                    const newQuantity = glassQuantity + 1
                    setGlassQuantity(newQuantity)
                    setQuantityInputValue(newQuantity.toString())
                    if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                  }}
                >
                  <Ionicons name="add" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                </TouchableOpacity>
              </View>

              {/* Today's Summary */}
              <View style={styles.summaryContainer}>
                {/* <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: isDarkMode ? "#F3F4F6" : "#111827",
                      marginBottom: 12,
                    },
                  ]}
                >
                  Today's Summary
                </Text>
                <TouchableOpacity
                        style={[
                          styles.historyButton,
                          {
                            backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
                          },
                        ]}
                        onPress={() => setIsChartModalVisible(true)}
                      >
                        <Ionicons name="analytics-outline" size={18} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                        <Text
                          style={[
                            styles.historyButtonText,
                            {
                              color: isDarkMode ? "#FF9500" : "#6366F1",
                            },
                          ]}
                        >
                          History
                        </Text>
                      </TouchableOpacity> */}
                      <View style={[styles.summaryHeader]}>
  <Text
    style={[
      styles.sectionTitle,
      {
        color: isDarkMode ? "#F3F4F6" : "#111827",
      },
    ]}
  >
    Today's Summary
  </Text>

  <TouchableOpacity
    style={[
      styles.historyIconButton,
      {
        backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)",
      },
    ]}
    onPress={() => setIsChartModalVisible(true)}
  >
    <Ionicons name="analytics-outline" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
  </TouchableOpacity>
</View>


                <View style={styles.summaryCards}>
                  <View
                    style={[
                      styles.summaryCard,
                      {
                        backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
                        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                      },
                    ]}
                  >
                    <Ionicons name="water-outline" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color: isDarkMode ? "#F3F4F6" : "#111827",
                        },
                      ]}
                    >
                      {formatAmount(waterAmount)}
                    </Text>
                    <Text
                      style={[
                        styles.summaryLabel,
                        {
                          color: isDarkMode ? "#9CA3AF" : "#6B7280",
                        },
                      ]}
                    >
                      Total Intake
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.summaryCard,
                      {
                        backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
                        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                      },
                    ]}
                  >
                    <Ionicons name="flag-outline" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color: isDarkMode ? "#F3F4F6" : "#111827",
                        },
                      ]}
                    >
                      {formatGoal()}
                    </Text>
                    <Text
                      style={[
                        styles.summaryLabel,
                        {
                          color: isDarkMode ? "#9CA3AF" : "#6B7280",
                        },
                      ]}
                    >
                      Daily Goal
                    </Text>
                  </View>
                </View>
              </View>
      
            </ScrollView>

            {/* Add Water Button */}
            <View style={styles.addButtonWrapper}>
              <Animated.View
                style={[
                  styles.addButtonContainer,
                  {
                    transform: [{ scale: addButtonScale }],
                    shadowOpacity: addButtonPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.6],
                    }),
                    shadowRadius: addButtonPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 16],
                    }),
                  },
                ]}
              >
                <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.8}>
                  <LinearGradient
                  
                    // colors={isDarkMode ? ["#A78BFA", "#FF9500", "#7C3AED"] : ["#A5B4FC", "#818CF8", "#6366F1"]}
                    colors={isDarkMode ? ["rgba(255, 149, 0, 0.7)", "rgba(255, 149, 0, 1)"] : ["rgba(99, 102, 241, 0.7)", "rgba(99, 102, 241, 1)"]}

                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                  />
                  <Animated.View
                    style={[
                      styles.addButtonGlow,
                      {
                        opacity: addButtonGlowOpacity,
                        backgroundColor: isDarkMode ? "#7C3AED" : "#6366F1",
                      },
                    ]}
                  />
                  <View style={styles.addButtonContent}>
                    <Ionicons name="water" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.addButtonText}>Add Water</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Settings Modal */}
            <Modal visible={isSettingsOpen} transparent animationType="fade" onRequestClose={closeSettings}>
              <TouchableWithoutFeedback onPress={closeSettings}>
                <View style={styles.modalOverlay}>
                  <BlurView
                    intensity={isDarkMode ? 40 : 30}
                    tint={isDarkMode ? "dark" : "light"}
                    style={StyleSheet.absoluteFill}
                  />
                  <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                    <View
                      style={[
                        styles.settingsContainer,
                        {
                          backgroundColor: isDarkMode ? "#1E293B" : "#FFFFFF",
                          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                        },
                      ]}
                    >
                      <View style={styles.settingsHeader}>
                        <Text style={[styles.settingsTitle, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>
                          Settings
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.closeButton,
//                             { backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)"
//  },
{backgroundColor: isDarkMode ? "rgba(255, 149, 0, 0.2)" : "rgba(99, 102, 241, 0.1)"},

                          ]}
                          onPress={closeSettings}
                        >
                          <Ionicons name="close" size={22} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.settingsSection}>
                        <Text style={[styles.settingTitle, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>Units</Text>
                        <View style={styles.unitsContainer}>
                          {(["ml", "oz", "cups"] as UnitType[]).map((unit) => (
                            <TouchableOpacity
                              key={unit}
                              style={[
                                styles.unitOption,
                                {
                                  backgroundColor:
                                    unitType === unit
                                      ? isDarkMode
                                        ? "rgba(99, 102, 241, 0.2)"
                                        : "rgba(99, 102, 241, 0.1)"
                                      : isDarkMode
                                        ? "rgba(30, 41, 59, 0.5)"
                                        : "rgba(255, 255, 255, 0.8)",
                                  borderColor:
                                    unitType === unit
                                      ? isDarkMode
                                        ? "#6366F1"
                                        : "#6366F1"
                                      : isDarkMode
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(0, 0, 0, 0.05)",
                                },
                              ]}
                              onPress={async () => {
                                const newUnit = unit;
                                setUnitType(newUnit);
                              
                      
                              
                                if (Platform.OS === "ios") {
                                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }
                              }}
                              
                              
                              
                            >
                              <Text
                                style={[
                                  styles.unitText,
                                  {
                                    color:
                                      unitType === unit
                                        ? isDarkMode
                                          ? "#FF9500"
                                          : "#6366F1"
                                        : isDarkMode
                                          ? "#E5E7EB"
                                          : "#374151",
                                  },
                                ]}
                              >
                                {unit.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={styles.settingsSection}>
                        <Text style={[styles.settingTitle, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>
                          Daily Goal
                        </Text>
                        <View style={styles.goalContainer}>
                          <TouchableOpacity
                            style={[
                              styles.goalButton,
                              {
                                backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
                                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                              },
                            ]}
                            onPress={() => {
                              const decrementAmount = unitType === "ml" ? 100 : unitType === "oz" ? 4 : 1
                              let newGoalValue: number

                              if (unitType === "ml") {
                                newGoalValue = Math.max(100, waterGoal - decrementAmount)
                                setWaterGoal(newGoalValue)
                                setGoalInputValue(newGoalValue.toString())
                              } else if (unitType === "oz") {
                                const currentOz = Number.parseFloat((waterGoal / 29.574).toFixed(1))
                                newGoalValue = Math.max(4, currentOz - decrementAmount)
                                setWaterGoal(Math.round(newGoalValue * 29.574))
                                setGoalInputValue(newGoalValue.toString())
                              } else {
                                const currentCups = Number.parseFloat((waterGoal / 250).toFixed(1))
                                newGoalValue = Math.max(1, currentCups - decrementAmount)
                                setWaterGoal(Math.round(newGoalValue * 250))
                                setGoalInputValue(newGoalValue.toString())
                              }
                            }}
                          >
                            <Ionicons name="remove" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                          </TouchableOpacity>

                          {isEditingGoal ? (
                            <TextInput
                              ref={goalInputRef}
                              style={[
                                styles.goalInput,
                                {
                                  color: isDarkMode ? "#F3F4F6" : "#111827",
                                  backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                  borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
                                },
                              ]}
                              value={goalInputValue}
                              onChangeText={handleGoalInputChange}
                              onBlur={handleGoalInputBlur}
                              keyboardType="decimal-pad"
                              autoFocus
                              selectTextOnFocus
                            />
                          ) : (
                            <TouchableOpacity
                              onPress={() => {
                                setIsEditingGoal(true)
                                setTimeout(() => {
                                  goalInputRef.current?.focus()
                                }, 100)
                              }}
                            >
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={[styles.goalText, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>
                                  {unitType === "ml"
                                    ? waterGoal
                                    : unitType === "oz"
                                      ? (waterGoal / 29.574).toFixed(1)
                                      : (waterGoal / 250).toFixed(1)}{" "}
                                  {unitType}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={[
                              styles.goalButton,
                              {
                                backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
                                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                              },
                            ]}
                            onPress={() => {
                              const incrementAmount = unitType === "ml" ? 100 : unitType === "oz" ? 4 : 1
                              let newGoalValue: number

                              if (unitType === "ml") {
                                newGoalValue = waterGoal + incrementAmount
                                setWaterGoal(newGoalValue)
                                setGoalInputValue(newGoalValue.toString())
                              } else if (unitType === "oz") {
                                const currentOz = Number.parseFloat((waterGoal / 29.574).toFixed(1))
                                newGoalValue = currentOz + incrementAmount
                                setWaterGoal(Math.round(newGoalValue * 29.574))
                                setGoalInputValue(newGoalValue.toString())
                              } else {
                                const currentCups = Number.parseFloat((waterGoal / 250).toFixed(1))
                                newGoalValue = currentCups + incrementAmount
                                setWaterGoal(Math.round(newGoalValue * 250))
                                setGoalInputValue(newGoalValue.toString())
                              }
                            }}
                          >
                            <Ionicons name="add" size={20} color={isDarkMode ? "#FF9500" : "#6366F1"} />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.presetGoals}>
                          {getGoalPresets().map((goal) => (
                            <TouchableOpacity
                              key={goal}
                              style={[
                                styles.presetGoal,
                                {
                                  backgroundColor:
                                    (unitType === "ml" && waterGoal === goal) ||
                                    (unitType === "oz" && Math.round(waterGoal / 29.574) === goal) ||
                                    (unitType === "cups" && Math.round(waterGoal / 250) === goal)
                                      ? isDarkMode
                                        ? "rgba(99, 102, 241, 0.2)"
                                        : "rgba(99, 102, 241, 0.1)"
                                      : isDarkMode
                                        ? "rgba(30, 41, 59, 0.5)"
                                        : "rgba(255, 255, 255, 0.8)",
                                  borderColor:
                                    (unitType === "ml" && waterGoal === goal) ||
                                    (unitType === "oz" && Math.round(waterGoal / 29.574) === goal) ||
                                    (unitType === "cups" && Math.round(waterGoal / 250) === goal)
                                      ? isDarkMode
                                        ? "#6366F1"
                                        : "#6366F1"
                                      : isDarkMode
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(0, 0, 0, 0.05)",
                                },
                              ]}
                              onPress={() => {
                                if (unitType === "ml") {
                                  setWaterGoal(goal)
                                  setGoalInputValue(goal.toString())
                                } else if (unitType === "oz") {
                                  setWaterGoal(Math.round(goal * 29.574))
                                  setGoalInputValue(goal.toString())
                                } else {
                                  setWaterGoal(Math.round(goal * 250))
                                  setGoalInputValue(goal.toString())
                                }
                              }}
                            >
                              <Text
                                style={[
                                  styles.presetGoalText,
                                  {
                                    color:
                                      (unitType === "ml" && waterGoal === goal) ||
                                      (unitType === "oz" && Math.round(waterGoal / 29.574) === goal) ||
                                      (unitType === "cups" && Math.round(waterGoal / 250) === goal)
                                        ? isDarkMode
                                          ? "#FF9500"
                                          : "#6366F1"
                                        : isDarkMode
                                          ? "#E5E7EB"
                                          : "#374151",
                                  },
                                ]}
                              >
                                {formatGoalPreset(goal)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* <TouchableOpacity
                        style={styles.applyButton}
                        onPress={() => {
                          handleQuantityInputBlur()
                          handleGoalInputBlur()
                          closeSettings()
                        }}
                      >
                        <LinearGradient
                          colors={isDarkMode ? ["#A78BFA", "#8B5CF6", "#7C3AED"] : ["#A5B4FC", "#818CF8", "#6366F1"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                        />
                        <Text style={styles.applyButtonText}>Apply</Text>
                      </TouchableOpacity> */}
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
            <HydrationChartModal
  isVisible={isChartModalVisible}
  onClose={() => setIsChartModalVisible(false)}
  initialView="daily"
/>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra padding for the add button
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  waterVisualizationContainer: {
    width: "40%",
    alignItems: "center",
    position: "relative",
  },
  waterGlassContainer: {
    width: 120,
    height: 180,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "relative",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    overflow: "hidden",
  },
  waterWave: {
    position: "absolute",
    width: 180,
    borderRadius: 10,
    left: -30,
  },
  bubble: {
    position: "absolute",
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  rippleEffect: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    bottom: "50%",
    alignSelf: "center",
  },
  waterEmoji: {
    fontSize: 32,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  waterLevelMarkers: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  waterLevelMarker: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
  },
  waterLevelText: {
    position: "absolute",
    right: 5,
    top: -10,
    fontSize: 10,
    fontWeight: "600",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    bottom: "50%",
    left: "50%",
  },
  waterAddedIndicator: {
    position: "absolute",
    top: -40,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  waterAddedText: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressInfoContainer: {
    width: "55%",
    paddingLeft: 10,
  },
  motivationalText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  quantityDisplay: {
    marginBottom: 10,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  currentQuantity: {
    fontSize: 28,
    fontWeight: "700",
  },
  goalQuantity: {
    fontSize: 16,
    marginLeft: 4,
  },
  percentageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginRight: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressGlow: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  glassScrollContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // ✅ even spacing between all items
    alignItems: "center",
    paddingHorizontal: 16, // ✅ nice left-right padding
    paddingVertical: 12, // ✅ vertical padding for the scroll view
  },
  
  glassOption: {
    width: 80,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 6,
    elevation: 2,
  },
  glassName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  glassVolume: {
    fontSize: 11,
    marginTop: 2,
  },
  quantitySelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 16,
  },
  quantityInput: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    width: 60,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  summaryContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  summaryCards: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  addButtonWrapper: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  addButtonContainer: {
    width: "100%",
    borderRadius: 24,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 32,
    opacity: 0.3,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    borderRadius: 24,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // settingsContainer: {
  //   width: "90%",
  //   maxWidth: 400,
  //   borderRadius: 24,
  //   padding: 20,
  //   borderWidth: 1,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 12,
  //   elevation: 8,
  // },

  settingsContainer: {
    width: "85%", // smaller width
    height: 380, // fixed height
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    justifyContent: "space-between", // nicely space items
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    // backgroundColor: isDarkMode ? "#1E293B" : "#FFFFFF",
    // borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  },
  
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
    height: 40,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  unitsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  unitOption: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unitText: {
    fontWeight: "600",
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  goalButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalText: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    width: 120,
    textAlign: "center",
  },
  goalInput: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    width: 120,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    marginHorizontal: 16,
  },
  presetGoals: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  presetGoal: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  presetGoalText: {
    fontWeight: "600",
  },
  applyButton: {
    borderRadius: 24,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  historyIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
})

export default HydrationTrackerScreen
