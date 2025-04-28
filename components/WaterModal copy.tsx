// "use client"

// import type React from "react"
// import { useState, useEffect, useRef, memo } from "react"
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Easing,
//   Dimensions,
//   StatusBar,
//   ScrollView,
//   Platform,
// } from "react-native"
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
// import { LinearGradient } from "expo-linear-gradient"
// import { useTheme, lightTheme, darkTheme } from "@/context/ThemeContext"
// import * as Haptics from "expo-haptics"

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

// interface GlassOption {
//   id: string
//   name: string
//   icon: string
//   ml: number
//   oz: number
// }

// type UnitType = "ml" | "oz" | "cups"

// interface WaterModalProps {
//   visible: boolean
//   onClose: () => void
//   initialValue?: number
//   onSave?: (data: { amount: number; unit: UnitType; goal: number }) => void
// }

// const WaterModal: React.FC<WaterModalProps> = ({ visible, onClose, initialValue = 0, onSave }) => {
//   const { isDarkMode } = useTheme()
//   const colors = isDarkMode ? darkTheme : lightTheme

//   const glassOptions: GlassOption[] = [
//     { id: "small", name: "Small", icon: "cup", ml: 150, oz: 5 },
//     { id: "medium", name: "Medium", icon: "glass-mug-variant", ml: 250, oz: 8 },
//     { id: "large", name: "Large", icon: "glass-tulip", ml: 350, oz: 12 },
//     { id: "bottle", name: "Bottle", icon: "bottle-soda", ml: 500, oz: 17 },
//   ]

//   const [selectedGlassIndex, setSelectedGlassIndex] = useState(1)
//   const [glassQuantity, setGlassQuantity] = useState(1)
//   const [waterAmount, setWaterAmount] = useState(initialValue)
//   const [unitType, setUnitType] = useState<UnitType>("ml")
//   const [waterGoal, setWaterGoal] = useState(2000)
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false)
//   const [showWaterAddedIndicator, setShowWaterAddedIndicator] = useState(false)
//   const [lastAddedAmount, setLastAddedAmount] = useState(0)

//   // Animation values
//   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
//   const fadeAnim = useRef(new Animated.Value(0)).current
//   const progressAnim = useRef(new Animated.Value(0)).current
//   const settingsSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
//   const waterRippleAnim = useRef(new Animated.Value(0)).current
//   const addButtonScale = useRef(new Animated.Value(1)).current
//   const waveAnim1 = useRef(new Animated.Value(0)).current
//   const waveAnim2 = useRef(new Animated.Value(0)).current
//   const glowAnim = useRef(new Animated.Value(0)).current
//   const resetButtonAnim = useRef(new Animated.Value(1)).current
//   const emojiFloatAnim = useRef(new Animated.Value(0)).current
//   const emojiRotateAnim = useRef(new Animated.Value(0)).current
//   const emojiScaleAnim = useRef(new Animated.Value(1)).current
//   const waterAddedAnim = useRef(new Animated.Value(0)).current
//   const bubbleAnims = useRef(
//     Array(8)
//       .fill(0)
//       .map(() => new Animated.Value(0)),
//   ).current
//   const particleAnims = useRef(
//     Array(12)
//       .fill(0)
//       .map(() => ({
//         x: new Animated.Value(0),
//         y: new Animated.Value(0),
//         scale: new Animated.Value(0),
//         opacity: new Animated.Value(0),
//       })),
//   ).current
//   const glassScrollRef = useRef<ScrollView>(null)

//   const getProgressPercentage = () => Math.min((waterAmount / waterGoal) * 100, 100)

//   const formatAmount = (amount: number) => {
//     switch (unitType) {
//       case "ml":
//         return `${amount} ml`
//       case "oz":
//         return `${(amount / 29.574).toFixed(1)} oz`
//       case "cups":
//         return `${(amount / 250).toFixed(1)} cups`
//     }
//   }

//   const formatGoal = () => {
//     switch (unitType) {
//       case "ml":
//         return `${waterGoal} ml`
//       case "oz":
//         return `${(waterGoal / 29.574).toFixed(1)} oz`
//       case "cups":
//         return `${(waterGoal / 250).toFixed(1)} cups`
//     }
//   }

//   const getSelectedGlassVolume = () => {
//     const selectedGlass = glassOptions[selectedGlassIndex]
//     switch (unitType) {
//       case "ml":
//         return selectedGlass.ml
//       case "oz":
//         return selectedGlass.oz
//       case "cups":
//         return selectedGlass.ml / 250
//     }
//   }

//   useEffect(() => {
//     if (visible) {
//       // Main modal animations
//       Animated.parallel([
//         Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
//         Animated.spring(slideAnim, { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
//       ]).start()

//       // Wave animations
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(waveAnim1, {
//             toValue: 1,
//             duration: 4000,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//           Animated.timing(waveAnim1, {
//             toValue: 0,
//             duration: 4000,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//         ]),
//       ).start()

//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(waveAnim2, {
//             toValue: 1,
//             duration: 3000,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//           Animated.timing(waveAnim2, {
//             toValue: 0,
//             duration: 3000,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//         ]),
//       ).start()

//       // Glow animation
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
//           Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
//         ]),
//       ).start()

//       // Emoji animations
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(emojiFloatAnim, {
//             toValue: -10,
//             duration: 1500,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//           Animated.timing(emojiFloatAnim, {
//             toValue: 0,
//             duration: 1500,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//         ]),
//       ).start()

//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(emojiRotateAnim, {
//             toValue: 1,
//             duration: 3000,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//           Animated.timing(emojiRotateAnim, {
//             toValue: 0,
//             duration: 3000,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//         ]),
//       ).start()

//       // Bubble animations
//       bubbleAnims.forEach((anim, index) => {
//         Animated.loop(
//           Animated.sequence([
//             Animated.timing(anim, {
//               toValue: 1,
//               duration: 2000 + index * 500,
//               delay: index * 300,
//               easing: Easing.inOut(Easing.sin),
//               useNativeDriver: true,
//             }),
//             Animated.timing(anim, {
//               toValue: 0,
//               duration: 0,
//               useNativeDriver: true,
//             }),
//           ]),
//         ).start()
//       })
//     }
//   }, [visible])

//   useEffect(() => {
//     Animated.timing(progressAnim, {
//       toValue: getProgressPercentage() / 100,
//       duration: 800,
//       useNativeDriver: false,
//       easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
//     }).start()

//     // Animate emoji scale based on progress
//     Animated.spring(emojiScaleAnim, {
//       toValue: 1 + getProgressPercentage() / 200, // Subtle scale increase with progress
//       friction: 8,
//       tension: 40,
//       useNativeDriver: true,
//     }).start()
//   }, [waterAmount, waterGoal])

//   const closeModal = () => {
//     if (isSettingsOpen) {
//       closeSettings()
//       return
//     }
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 400, useNativeDriver: true }),
//     ]).start(() => {
//       if (onSave) onSave({ amount: waterAmount, unit: unitType, goal: waterGoal })
//       onClose()
//     })
//   }

//   const openSettings = () => {
//     Animated.spring(settingsSlideAnim, {
//       toValue: 0,
//       tension: 100,
//       friction: 10,
//       useNativeDriver: true,
//     }).start(() => setIsSettingsOpen(true))
//     if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
//   }

//   const closeSettings = () => {
//     Animated.timing(settingsSlideAnim, {
//       toValue: SCREEN_HEIGHT,
//       duration: 400,
//       useNativeDriver: true,
//     }).start(() => setIsSettingsOpen(false))
//   }

//   const handleAdd = () => {
//     const selectedGlass = glassOptions[selectedGlassIndex]
//     const addAmount =
//       unitType === "ml" ? selectedGlass.ml : unitType === "oz" ? selectedGlass.oz : selectedGlass.ml / 250
//     const mlEquivalent = unitType === "ml" ? addAmount : unitType === "oz" ? addAmount * 29.574 : addAmount * 250
//     const amountToAdd = mlEquivalent * glassQuantity

//     setWaterAmount((prev) => prev + amountToAdd)
//     setLastAddedAmount(amountToAdd)
//     triggerWaterRipple()
//     animateAddButton()
//     showAddedWaterIndicator()
//     animateParticles()

//     // Animate emoji on add
//     Animated.sequence([
//       Animated.timing(emojiScaleAnim, {
//         toValue: 1.5,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.spring(emojiScaleAnim, {
//         toValue: 1 + getProgressPercentage() / 200,
//         friction: 3,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//     ]).start()

//     if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
//   }

//   const showAddedWaterIndicator = () => {
//     setShowWaterAddedIndicator(true)
//     waterAddedAnim.setValue(0)

//     Animated.sequence([
//       Animated.timing(waterAddedAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//       Animated.delay(1000),
//       Animated.timing(waterAddedAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       setShowWaterAddedIndicator(false)
//     })
//   }

//   const animateParticles = () => {
//     particleAnims.forEach((particle, index) => {
//       particle.x.setValue(0)
//       particle.y.setValue(0)
//       particle.scale.setValue(0)
//       particle.opacity.setValue(0)

//       const angle = (index / particleAnims.length) * Math.PI * 2
//       const distance = 50 + Math.random() * 50

//       Animated.sequence([
//         Animated.parallel([
//           Animated.timing(particle.opacity, {
//             toValue: 1,
//             duration: 200,
//             useNativeDriver: true,
//           }),
//           Animated.timing(particle.scale, {
//             toValue: 0.5 + Math.random() * 0.5,
//             duration: 200,
//             useNativeDriver: true,
//           }),
//         ]),
//         Animated.parallel([
//           Animated.timing(particle.x, {
//             toValue: Math.cos(angle) * distance,
//             duration: 1000,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//           }),
//           Animated.timing(particle.y, {
//             toValue: Math.sin(angle) * distance - 50, // Upward bias
//             duration: 1000,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//           }),
//           Animated.timing(particle.opacity, {
//             toValue: 0,
//             duration: 1000,
//             delay: 200,
//             useNativeDriver: true,
//           }),
//         ]),
//       ]).start()
//     })
//   }

//   const handleReset = () => {
//     // Reset water amount animation
//     Animated.sequence([
//       Animated.timing(resetButtonAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
//       Animated.spring(resetButtonAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
//     ]).start()

//     // Animate water level going down
//     Animated.timing(progressAnim, {
//       toValue: 0,
//       duration: 600,
//       useNativeDriver: false,
//       easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
//     }).start(() => {
//       setWaterAmount(0)
//       if (Platform.OS === "ios") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
//     })

//     // Reset emoji scale
//     Animated.timing(emojiScaleAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start()
//   }

//   const triggerWaterRipple = () => {
//     waterRippleAnim.setValue(0)
//     Animated.timing(waterRippleAnim, {
//       toValue: 1,
//       duration: 1200,
//       useNativeDriver: true,
//       easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
//     }).start()
//   }

//   const animateAddButton = () => {
//     addButtonScale.setValue(1)
//     Animated.sequence([
//       Animated.timing(addButtonScale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
//       Animated.spring(addButtonScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
//     ]).start()
//   }

//   const animateQuantityChange = (increment: boolean) => {
//     const scale = increment ? 1.2 : 0.8
//     const anim = new Animated.Value(1)
//     Animated.sequence([
//       Animated.timing(anim, { toValue: scale, duration: 100, useNativeDriver: true }),
//       Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
//     ]).start()
//     return anim
//   }

//   // Enhanced ripple effect with better animation
//   const rippleScale = waterRippleAnim.interpolate({
//     inputRange: [0, 0.4, 1],
//     outputRange: [0.4, 1.5, 2.5],
//   })

//   const rippleOpacity = waterRippleAnim.interpolate({
//     inputRange: [0, 0.4, 0.8, 1],
//     outputRange: [0.6, 0.4, 0.2, 0],
//   })

//   // Wave animations
//   const wave1Offset = waveAnim1.interpolate({
//     inputRange: [0, 1],
//     outputRange: [-20, 20],
//   })

//   const wave2Offset = waveAnim2.interpolate({
//     inputRange: [0, 1],
//     outputRange: [20, -20],
//   })

//   const glowOpacity = glowAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.2, 0.5],
//   })

//   // Emoji rotation animation
//   const emojiRotation = emojiRotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["-5deg", "5deg"],
//   })

//   // Water added indicator animation
//   const waterAddedTranslateY = waterAddedAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [20, 0],
//   })

//   const getMotivationalContent = () => {
//     const percentage = getProgressPercentage()
//     if (percentage === 0) return { text: "Let's Hydrate!", emoji: "💧" }
//     if (percentage < 25) return { text: "Great Start!", emoji: "🥤" }
//     if (percentage < 50) return { text: "You're Rocking It!", emoji: "💦" }
//     if (percentage < 75) return { text: "Keep Flowing!", emoji: "🌊" }
//     if (percentage < 95) return { text: "So Close!", emoji: "🏊‍♂️" }
//     return { text: "Hydration Hero!", emoji: "🎉" }
//   }

//   const motivationalContent = getMotivationalContent()

//   // Enhanced glass option selection - scroll to center the selected glass
//   const handleGlassSelect = (index: number) => {
//     setSelectedGlassIndex(index)
//     if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

//     // Scroll to center the selected glass
//     if (glassScrollRef.current) {
//       const itemWidth = 80 // Width + margin
//       const offset = index * itemWidth - SCREEN_WIDTH / 2 + itemWidth / 2
//       glassScrollRef.current.scrollTo({ x: Math.max(0, offset), animated: true })
//     }
//   }

//   return (
//     <Modal visible={visible} transparent animationType="none">
//       <StatusBar backgroundColor="rgba(0, 0, 0, 0.7)" barStyle="light-content" />
//       <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
//         <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={closeModal} />

//         <Animated.View
//           style={[
//             styles.modalContent,
//             {
//               transform: [{ translateY: slideAnim }],
//               borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//               backgroundColor: isDarkMode ? "rgba(18, 24, 38, 0.95)" : "rgba(255, 255, 255, 0.95)",
//             },
//           ]}
//         >
//           <View style={styles.handleBarContainer}>
//             <View style={[styles.handleBar, { backgroundColor: isDarkMode ? "#3A4366" : "#D1D5DB" }]} />
//           </View>

//           <View style={styles.header}>
//             <Text style={[styles.title, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>Hydration Tracker</Text>
//             <View style={styles.headerButtons}>
//               <Animated.View style={{ transform: [{ scale: resetButtonAnim }], marginRight: 10 }}>
//                 <TouchableOpacity
//                   style={[
//                     styles.resetButton,
//                     {
//                       backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)",
//                       borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
//                     },
//                   ]}
//                   onPress={handleReset}
//                 >
//                   <Ionicons name="refresh" size={16} color={isDarkMode ? "#8B5CF6" : "#6366F1"} />
//                   <Text style={[styles.resetText, { color: isDarkMode ? "#8B5CF6" : "#6366F1" }]}>Reset</Text>
//                 </TouchableOpacity>
//               </Animated.View>
//               <TouchableOpacity
//                 style={[
//                   styles.iconButton,
//                   {
//                     backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)",
//                   },
//                 ]}
//                 onPress={openSettings}
//               >
//                 <Ionicons name="settings-outline" size={22} color={isDarkMode ? "#8B5CF6" : "#6366F1"} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           <View style={styles.mainContent}>
//             <View style={styles.waterVisualizationContainer}>
//               <View
//                 style={[
//                   styles.waterGlassContainer,
//                   {
//                     backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
//                     borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
//                     shadowColor: isDarkMode ? "#6366F1" : "#6366F1",
//                   },
//                 ]}
//               >
//                 {/* Water fill */}
//                 <Animated.View
//                   style={[
//                     styles.waterFill,
//                     {
//                       height: progressAnim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: ["0%", "100%"],
//                       }),
//                       backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)",
//                     },
//                   ]}
//                 >
//                   {/* Wave 1 */}
//                   <Animated.View
//                     style={[
//                       styles.waterWave,
//                       {
//                         backgroundColor: isDarkMode ? "#6366F1" : "#818CF8",
//                         transform: [{ translateX: wave1Offset }],
//                         opacity: 0.7,
//                       },
//                     ]}
//                   />

//                   {/* Wave 2 */}
//                   <Animated.View
//                     style={[
//                       styles.waterWave,
//                       {
//                         backgroundColor: isDarkMode ? "#ffff" : "#6366F1",
//                         transform: [{ translateX: wave2Offset }],
//                         top: 0.1,
//                         opacity: 0.9,
//                       },
//                     ]}
//                   />

//                   {/* Bubbles */}
//                   {bubbleAnims.map((anim, index) => (
//                     <Animated.View
//                       key={index}
//                       style={[
//                         styles.bubble,
//                         {
//                           left: 10 + (index % 4) * 30,
//                           transform: [
//                             {
//                               translateY: anim.interpolate({
//                                 inputRange: [0, 1],
//                                 outputRange: [120, -20],
//                               }),
//                             },
//                             {
//                               scale: anim.interpolate({
//                                 inputRange: [0, 0.5, 1],
//                                 outputRange: [0.5, 1, 0.8],
//                               }),
//                             },
//                           ],
//                           opacity: anim.interpolate({
//                             inputRange: [0, 0.2, 0.8, 1],
//                             outputRange: [0, 1, 0.8, 0],
//                           }),
//                         },
//                       ]}
//                     />
//                   ))}
//                 </Animated.View>

//                 {/* Ripple effect */}
//                 <Animated.View
//                   style={[
//                     styles.rippleEffect,
//                     {
//                       transform: [{ scale: rippleScale }],
//                       opacity: rippleOpacity,
//                       backgroundColor: isDarkMode ? "#6366F1" : "#818CF8",
//                     },
//                   ]}
//                 />

//                 {/* Centered emoji with animations */}
//                 <Animated.Text
//                   style={[
//                     styles.waterEmoji,
//                     {
//                       transform: [{ translateY: emojiFloatAnim }, { rotate: emojiRotation }, { scale: emojiScaleAnim }],
//                     },
//                   ]}
//                 >
//                   {motivationalContent.emoji}
//                 </Animated.Text>

//                 {/* Water level markers */}
//                 <View style={styles.waterLevelMarkers}>
//                   {[0.25, 0.5, 0.75, 1].map((level, index) => (
//                     <View
//                       key={index}
//                       style={[
//                         styles.waterLevelMarker,
//                         {
//                           bottom: `${level * 100}%`,
//                           borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(99, 102, 241, 0.3)",
//                         },
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.waterLevelText,
//                           {
//                             color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(99, 102, 241, 0.6)",
//                             opacity: getProgressPercentage() / 100 >= level ? 1 : 0.3,
//                           },
//                         ]}
//                       >
//                         {Math.round(level * 100)}%
//                       </Text>
//                     </View>
//                   ))}
//                 </View>

//                 {/* Particles for water add animation */}
//                 {particleAnims.map((particle, index) => (
//                   <Animated.View
//                     key={`particle-${index}`}
//                     style={[
//                       styles.particle,
//                       {
//                         backgroundColor: isDarkMode
//                           ? index % 3 === 0
//                             ? "#8B5CF6"
//                             : index % 3 === 1
//                               ? "#6366F1"
//                               : "#818CF8"
//                           : index % 3 === 0
//                             ? "#6366F1"
//                             : index % 3 === 1
//                               ? "#818CF8"
//                               : "#A5B4FC",
//                         transform: [{ translateX: particle.x }, { translateY: particle.y }, { scale: particle.scale }],
//                         opacity: particle.opacity,
//                       },
//                     ]}
//                   />
//                 ))}
//               </View>

//               {/* Water added indicator */}
//               {showWaterAddedIndicator && (
//                 <Animated.View
//                   style={[
//                     styles.waterAddedIndicator,
//                     {
//                       transform: [{ translateY: waterAddedTranslateY }],
//                       opacity: waterAddedAnim,
//                       backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)",
//                       borderColor: isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.waterAddedText,
//                       {
//                         color: isDarkMode ? "#8B5CF6" : "#6366F1",
//                       },
//                     ]}
//                   >
//                     +{formatAmount(lastAddedAmount)}
//                   </Text>
//                 </Animated.View>
//               )}
//             </View>

//             <View style={styles.progressInfoContainer}>
//               <Text
//                 style={[
//                   styles.motivationalText,
//                   {
//                     color: isDarkMode ? "#8B5CF6" : "#6366F1",
//                   },
//                 ]}
//               >
//                 {motivationalContent.text}
//               </Text>

//               <View style={styles.quantityDisplay}>
//                 <View style={styles.quantityRow}>
//                   <Text
//                     style={[
//                       styles.currentQuantity,
//                       {
//                         color: isDarkMode ? "#F3F4F6" : "#111827",
//                       },
//                     ]}
//                   >
//                     {formatAmount(waterAmount)}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.goalQuantity,
//                       {
//                         color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(17, 24, 39, 0.6)",
//                       },
//                     ]}
//                   >
//                     / {formatGoal()}
//                   </Text>
//                 </View>

//                 <View style={styles.percentageRow}>
//                   <View
//                     style={[
//                       styles.progressBarContainer,
//                       {
//                         backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.1)",
//                       },
//                     ]}
//                   >
//                     <Animated.View
//                       style={[
//                         styles.progressBarFill,
//                         {
//                           width: progressAnim.interpolate({
//                             inputRange: [0, 1],
//                             outputRange: ["0%", "100%"],
//                           }),
//                           backgroundColor: isDarkMode ? "#6366F1" : "#6366F1",
//                         },
//                       ]}
//                     >
//                       <Animated.View
//                         style={[
//                           styles.progressGlow,
//                           {
//                             opacity: glowOpacity,
//                             backgroundColor: isDarkMode ? "#8B5CF6" : "#818CF8",
//                           },
//                         ]}
//                       />
//                     </Animated.View>
//                   </View>
//                   <Text
//                     style={[
//                       styles.percentageText,
//                       {
//                         color: isDarkMode ? "#8B5CF6" : "#6366F1",
//                       },
//                     ]}
//                   >
//                     {Math.round(getProgressPercentage())}%
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>

//           <Text
//             style={[
//               styles.sectionTitle,
//               {
//                 color: isDarkMode ? "#F3F4F6" : "#111827",
//                 marginTop: 16,
//                 marginBottom: 8,
//               },
//             ]}
//           >
//             Select Container
//           </Text>

//           <ScrollView
//             ref={glassScrollRef}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.glassScrollContainer}
//           >
//             {glassOptions.map((glass, index) => (
//               <TouchableOpacity
//                 key={glass.id}
//                 style={[
//                   styles.glassOption,
//                   {
//                     backgroundColor: isDarkMode
//                       ? index === selectedGlassIndex
//                         ? "rgba(99, 102, 241, 0.2)"
//                         : "rgba(30, 41, 59, 0.5)"
//                       : index === selectedGlassIndex
//                         ? "rgba(99, 102, 241, 0.1)"
//                         : "rgba(255, 255, 255, 0.8)",
//                     borderColor:
//                       index === selectedGlassIndex
//                         ? isDarkMode
//                           ? "#6366F1"
//                           : "#6366F1"
//                         : isDarkMode
//                           ? "rgba(255, 255, 255, 0.1)"
//                           : "rgba(0, 0, 0, 0.05)",
//                     transform: [{ scale: index === selectedGlassIndex ? 1.05 : 1 }],
//                   },
//                 ]}
//                 onPress={() => handleGlassSelect(index)}
//               >
//                 <MaterialCommunityIcons
//                   name={glass.icon as any}
//                   size={28}
//                   color={
//                     index === selectedGlassIndex
//                       ? isDarkMode
//                         ? "#8B5CF6"
//                         : "#6366F1"
//                       : isDarkMode
//                         ? "#9CA3AF"
//                         : "#6B7280"
//                   }
//                 />
//                 <Text
//                   style={[
//                     styles.glassName,
//                     {
//                       color:
//                         index === selectedGlassIndex
//                           ? isDarkMode
//                             ? "#8B5CF6"
//                             : "#6366F1"
//                           : isDarkMode
//                             ? "#E5E7EB"
//                             : "#374151",
//                     },
//                   ]}
//                 >
//                   {glass.name}
//                 </Text>
//                 <Text
//                   style={[
//                     styles.glassVolume,
//                     {
//                       color: isDarkMode ? "#9CA3AF" : "#6B7280",
//                     },
//                   ]}
//                 >
//                   {unitType === "ml"
//                     ? `${glass.ml} ml`
//                     : unitType === "oz"
//                       ? `${glass.oz} oz`
//                       : `${(glass.ml / 250).toFixed(1)} cups`}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           <View style={styles.quantitySelector}>
//             <TouchableOpacity
//               style={[
//                 styles.quantityButton,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
//                   borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//                 },
//               ]}
//               onPress={() => {
//                 setGlassQuantity((prev) => Math.max(1, prev - 1))
//                 if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
//               }}
//             >
//               <Ionicons name="remove" size={20} color={isDarkMode ? "#8B5CF6" : "#6366F1"} />
//             </TouchableOpacity>
//             <Animated.Text
//               style={[
//                 styles.quantityText,
//                 {
//                   color: isDarkMode ? "#F3F4F6" : "#111827",
//                   transform: [{ scale: animateQuantityChange(glassQuantity > 1) }],
//                 },
//               ]}
//             >
//               {glassQuantity}
//             </Animated.Text>
//             <TouchableOpacity
//               style={[
//                 styles.quantityButton,
//                 {
//                   backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
//                   borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//                 },
//               ]}
//               onPress={() => {
//                 setGlassQuantity((prev) => prev + 1)
//                 if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
//               }}
//             >
//               <Ionicons name="add" size={20} color={isDarkMode ? "#8B5CF6" : "#6366F1"} />
//             </TouchableOpacity>
//           </View>

//           <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
//             <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
//               <LinearGradient
//                 colors={isDarkMode ? ["#8B5CF6", "#6366F1", "#4F46E5"] : ["#818CF8", "#6366F1", "#4F46E5"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
//               />
//               {/* <Animated.View style={[styles.addButtonRipple, { opacity: waterRippleAnim }]} /> */}
//               <Text style={styles.addButtonText}>Add Water</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </Animated.View>

//         <Animated.View
//           style={[
//             styles.settingsPanel,
//             {
//               transform: [{ translateY: settingsSlideAnim }],
//               borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//               backgroundColor: isDarkMode ? "rgba(18, 24, 38, 0.95)" : "rgba(255, 255, 255, 0.95)",
//             },
//           ]}
//         >
//           <View style={styles.handleBarContainer}>
//             <View style={[styles.handleBar, { backgroundColor: isDarkMode ? "#3A4366" : "#D1D5DB" }]} />
//           </View>

//           <View style={styles.settingsHeader}>
//             <Text style={[styles.title, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>Settings</Text>
//             <TouchableOpacity
//               style={[
//                 styles.iconButton,
//                 { backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)" },
//               ]}
//               onPress={closeSettings}
//             >
//               <Ionicons name="close" size={22} color={isDarkMode ? "#8B5CF6" : "#6366F1"} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.settingsSection}>
//             <Text style={[styles.settingTitle, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>Units</Text>
//             <View style={styles.unitsContainer}>
//               {(["ml", "oz", "cups"] as UnitType[]).map((unit) => (
//                 <TouchableOpacity
//                   key={unit}
//                   style={[
//                     styles.unitOption,
//                     {
//                       backgroundColor:
//                         unitType === unit
//                           ? isDarkMode
//                             ? "rgba(99, 102, 241, 0.2)"
//                             : "rgba(99, 102, 241, 0.1)"
//                           : isDarkMode
//                             ? "rgba(30, 41, 59, 0.5)"
//                             : "rgba(255, 255, 255, 0.8)",
//                       borderColor:
//                         unitType === unit
//                           ? isDarkMode
//                             ? "#6366F1"
//                             : "#6366F1"
//                           : isDarkMode
//                             ? "rgba(255, 255, 255, 0.1)"
//                             : "rgba(0, 0, 0, 0.05)",
//                     },
//                   ]}
//                   onPress={() => {
//                     setUnitType(unit)
//                     if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
//                   }}
//                 >
//                   <Text
//                     style={[
//                       styles.unitText,
//                       {
//                         color:
//                           unitType === unit ? (isDarkMode ? "#8B5CF6" : "#6366F1") : isDarkMode ? "#E5E7EB" : "#374151",
//                       },
//                     ]}
//                   >
//                     {unit.toUpperCase()}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           <View style={styles.settingsSection}>
//             <Text style={[styles.settingTitle, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>Daily Goal</Text>
//             <View style={styles.goalContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.goalButton,
//                   {
//                     backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
//                     borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//                   },
//                 ]}
//                 onPress={() => setWaterGoal((prev) => Math.max(100, prev - 100))}
//               >
//                 <Ionicons name="remove" size={20} color={isDarkMode ? "#8B5CF6" : "#6366F1"} />
//               </TouchableOpacity>
//               <Text style={[styles.goalText, { color: isDarkMode ? "#F3F4F6" : "#111827" }]}>
//                 {unitType === "ml"
//                   ? waterGoal
//                   : unitType === "oz"
//                     ? (waterGoal / 29.574).toFixed(1)
//                     : (waterGoal / 250).toFixed(1)}{" "}
//                 {unitType}
//               </Text>
//               <TouchableOpacity
//                 style={[
//                   styles.goalButton,
//                   {
//                     backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
//                     borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
//                   },
//                 ]}
//                 onPress={() => setWaterGoal((prev) => prev + 100)}
//               >
//                 <Ionicons name="add" size={20} color={isDarkMode ? "#8B5CF6" : "#6366F1"} />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.presetGoals}>
//               {[1500, 2000, 2500, 3000].map((goal) => (
//                 <TouchableOpacity
//                   key={goal}
//                   style={[
//                     styles.presetGoal,
//                     {
//                       backgroundColor:
//                         waterGoal === goal
//                           ? isDarkMode
//                             ? "rgba(99, 102, 241, 0.2)"
//                             : "rgba(99, 102, 241, 0.1)"
//                           : isDarkMode
//                             ? "rgba(30, 41, 59, 0.5)"
//                             : "rgba(255, 255, 255, 0.8)",
//                       borderColor:
//                         waterGoal === goal
//                           ? isDarkMode
//                             ? "#6366F1"
//                             : "#6366F1"
//                           : isDarkMode
//                             ? "rgba(255, 255, 255, 0.1)"
//                             : "rgba(0, 0, 0, 0.05)",
//                     },
//                   ]}
//                   onPress={() => setWaterGoal(goal)}
//                 >
//                   <Text
//                     style={[
//                       styles.presetGoalText,
//                       {
//                         color:
//                           waterGoal === goal
//                             ? isDarkMode
//                               ? "#8B5CF6"
//                               : "#6366F1"
//                             : isDarkMode
//                               ? "#E5E7EB"
//                               : "#374151",
//                       },
//                     ]}
//                   >
//                     {goal / 1000}L
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           <TouchableOpacity style={styles.applyButton} onPress={closeSettings}>
//             <LinearGradient
//               colors={isDarkMode ? ["#8B5CF6", "#6366F1", "#4F46E5"] : ["#818CF8", "#6366F1", "#4F46E5"]}
//               style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
              
//             />
//             <Text style={styles.applyButtonText}>Apply</Text>
//           </TouchableOpacity>
//         </Animated.View>
//       </Animated.View>
//     </Modal>
//   )
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     justifyContent: "flex-end",
//   },
//   dismissArea: {
//     flex: 1,
//   },
//   modalContent: {
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     padding: 20,
//     borderWidth: 1,
//     borderBottomWidth: 0,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   handleBarContainer: {
//     alignItems: "center",
//     paddingVertical: 8,
//   },
//   handleBar: {
//     width: 40,
//     height: 4,
//     borderRadius: 2,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   headerButtons: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   resetButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderRadius: 16,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   resetText: {
//     fontSize: 12,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   iconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//   },
//   mainContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   waterVisualizationContainer: {
//     width: "40%",
//     alignItems: "center",
//     position: "relative",
//   },
//   waterGlassContainer: {
//     width: 120,
//     height: 180,
//     borderRadius: 24,
//     borderWidth: 1,
//     overflow: "hidden",
//     justifyContent: "flex-end",
//     position: "relative",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//   },
//   waterFill: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     overflow: "hidden",
//   },
//   waterWave: {
//     position: "absolute",
//     height: 5,
//     width: 200,
//     borderRadius: 15,
//     bottom: -10,
//     left: -40,
//   },
//   bubble: {
//     position: "absolute",
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "rgba(255, 255, 255, 0.7)",
//   },
//   rippleEffect: {
//     position: "absolute",
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     bottom: "50%",
//     alignSelf: "center",
//   },
//   waterEmoji: {
//     fontSize: 32,
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: [{ translateX: -16 }, { translateY: -16 }],
//   },
//   waterLevelMarkers: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//   },
//   waterLevelMarker: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     borderTopWidth: 1,
//     borderStyle: "dashed",
//   },
//   waterLevelText: {
//     position: "absolute",
//     right: 5,
//     top: -10,
//     fontSize: 10,
//     fontWeight: "600",
//   },
//   particle: {
//     position: "absolute",
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     bottom: "50%",
//     left: "50%",
//   },
//   waterAddedIndicator: {
//     position: "absolute",
//     top: -40,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//   },
//   waterAddedText: {
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   progressInfoContainer: {
//     width: "55%",
//     paddingLeft: 10,
//   },
//   motivationalText: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 12,
//   },
//   quantityDisplay: {
//     marginBottom: 10,
//   },
//   quantityRow: {
//     flexDirection: "row",
//     alignItems: "baseline",
//     marginBottom: 8,
//   },
//   currentQuantity: {
//     fontSize: 28,
//     fontWeight: "700",
//   },
//   goalQuantity: {
//     fontSize: 16,
//     marginLeft: 4,
//   },
//   percentageRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   progressBarContainer: {
//     flex: 1,
//     height: 12,
//     borderRadius: 6,
//     overflow: "hidden",
//     marginRight: 10,
//   },
//   progressBarFill: {
//     height: "100%",
//     borderRadius: 6,
//   },
//   progressGlow: {
//     position: "absolute",
//     top: -5,
//     left: -5,
//     right: -5,
//     bottom: -5,
//     borderRadius: 6,
//   },
//   percentageText: {
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   glassScrollContainer: {
//     paddingVertical: 12,
//     paddingHorizontal: 4,
//   },
//   glassOption: {
//     width: 80,
//     padding: 12,
//     borderRadius: 16,
//     borderWidth: 1,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     marginHorizontal: 6,
//   },
//   glassName: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginTop: 6,
//   },
//   glassVolume: {
//     fontSize: 11,
//     marginTop: 2,
//   },
//   quantitySelector: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 16,
//   },
//   quantityButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     borderWidth: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   quantityText: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginHorizontal: 16,
//   },
//   addButton: {
//     borderRadius: 24,
//     height: 56,
//     justifyContent: "center",
//     alignItems: "center",
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   addButtonRipple: {
//     position: "absolute",
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: "rgba(255, 255, 255, 0.3)",
//   },
//   addButtonText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   settingsPanel: {
//     position: "absolute",
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     padding: 20,
//     borderWidth: 1,
//     borderBottomWidth: 0,
//     width: "100%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   settingsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   settingsSection: {
//     marginBottom: 24,
//   },
//   settingTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 12,
//   },
//   unitsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   unitOption: {
//     flex: 1,
//     marginHorizontal: 6,
//     paddingVertical: 12,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   unitText: {
//     fontWeight: "600",
//   },
//   goalContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 16,
//   },
//   goalButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     borderWidth: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   goalText: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginHorizontal: 16,
//     width: 120,
//     textAlign: "center",
//   },
//   presetGoals: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   presetGoal: {
//     flex: 1,
//     marginHorizontal: 6,
//     paddingVertical: 12,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   presetGoalText: {
//     fontWeight: "600",
//   },
//   applyButton: {
//     borderRadius: 24,
//     height: 56,
//     justifyContent: "center",
//     alignItems: "center",
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   applyButtonText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//   },
// })

// export default memo(WaterModal)


// // import React, { useState, useEffect, useRef, memo } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Animated,
// //   Easing,
// //   Dimensions,
// //   StatusBar,
// //   ScrollView,
// //   Platform,
// // } from 'react-native';
// // import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// // import * as Haptics from 'expo-haptics';

// // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // interface GlassOption {
// //   id: string;
// //   name: string;
// //   icon: string;
// //   ml: number;
// //   oz: number;
// // }

// // type UnitType = 'ml' | 'oz' | 'cups';

// // interface WaterModalProps {
// //   visible: boolean;
// //   onClose: () => void;
// //   initialValue?: number;
// //   onSave?: (data: { amount: number; unit: UnitType; goal: number }) => void;
// // }

// // const WaterModal: React.FC<WaterModalProps> = ({
// //   visible,
// //   onClose,
// //   initialValue = 0,
// //   onSave,
// // }) => {
// //   const { isDarkMode } = useTheme();
// //   const colors = isDarkMode ? darkTheme : lightTheme;

// //   const glassOptions: GlassOption[] = [
// //     { id: 'small', name: 'Small', icon: 'cup', ml: 150, oz: 5 },
// //     { id: 'medium', name: 'Medium', icon: 'glass-mug-variant', ml: 250, oz: 8 },
// //     { id: 'large', name: 'Large', icon: 'glass-tulip', ml: 350, oz: 12 },
// //     { id: 'bottle', name: 'Bottle', icon: 'bottle-soda', ml: 500, oz: 17 },
// //   ];

// //   const [selectedGlassIndex, setSelectedGlassIndex] = useState(1);
// //   const [glassQuantity, setGlassQuantity] = useState(1);
// //   const [waterAmount, setWaterAmount] = useState(initialValue);
// //   const [unitType, setUnitType] = useState<UnitType>('ml');
// //   const [waterGoal, setWaterGoal] = useState(2000);
// //   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

// //   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const progressAnim = useRef(new Animated.Value(0)).current;
// //   const settingsSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const waterRippleAnim = useRef(new Animated.Value(0)).current;
// //   const addButtonScale = useRef(new Animated.Value(1)).current;
// //   const waveAnim = useRef(new Animated.Value(0)).current;
// //   const glowAnim = useRef(new Animated.Value(0)).current;
// //   const resetButtonAnim = useRef(new Animated.Value(1)).current;
// //   const glassScrollRef = useRef<ScrollView>(null);

// //   const getProgressPercentage = () => Math.min((waterAmount / waterGoal) * 100, 100);

// //   const formatAmount = (amount: number) => {
// //     switch (unitType) {
// //       case 'ml': return `${amount} ml`;
// //       case 'oz': return `${(amount / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(amount / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const formatGoal = () => {
// //     switch (unitType) {
// //       case 'ml': return `${waterGoal} ml`;
// //       case 'oz': return `${(waterGoal / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(waterGoal / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const getSelectedGlassVolume = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     switch (unitType) {
// //       case 'ml': return selectedGlass.ml;
// //       case 'oz': return selectedGlass.oz;
// //       case 'cups': return selectedGlass.ml / 250;
// //     }
// //   };

// //   useEffect(() => {
// //     if (visible) {
// //       Animated.parallel([
// //         Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
// //         Animated.spring(slideAnim, { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
// //       ]).start();
      
// //       // Enhanced wave animation
// //       Animated.loop(
// //         Animated.timing(waveAnim, {
// //           toValue: 1,
// //           duration: 3000,
// //           easing: Easing.inOut(Easing.sin),
// //           useNativeDriver: true,
// //         })
// //       ).start();
      
// //       // Enhanced glow animation
// //       Animated.loop(
// //         Animated.sequence([
// //           Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
// //           Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
// //         ])
// //       ).start();
// //     }
// //   }, [visible]);

// //   useEffect(() => {
// //     Animated.timing(progressAnim, {
// //       toValue: getProgressPercentage() / 100,
// //       duration: 800,
// //       useNativeDriver: false,
// //       easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
// //     }).start();
// //   }, [waterAmount, waterGoal]);

// //   const closeModal = () => {
// //     if (isSettingsOpen) {
// //       closeSettings();
// //       return;
// //     }
// //     Animated.parallel([
// //       Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
// //       Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 400, useNativeDriver: true }),
// //     ]).start(() => {
// //       if (onSave) onSave({ amount: waterAmount, unit: unitType, goal: waterGoal });
// //       onClose();
// //     });
// //   };

// //   const openSettings = () => {
// //     Animated.spring(settingsSlideAnim, {
// //       toValue: 0,
// //       tension: 100,
// //       friction: 10,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(true));
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
// //   };

// //   const closeSettings = () => {
// //     Animated.timing(settingsSlideAnim, {
// //       toValue: SCREEN_HEIGHT,
// //       duration: 400,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(false));
// //   };

// //   const handleAdd = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     const addAmount = unitType === 'ml' ? selectedGlass.ml :
// //                      unitType === 'oz' ? selectedGlass.oz :
// //                      selectedGlass.ml / 250;
// //     const mlEquivalent = unitType === 'ml' ? addAmount :
// //                         unitType === 'oz' ? addAmount * 29.574 :
// //                         addAmount * 250;
// //     setWaterAmount(prev => prev + mlEquivalent * glassQuantity);
// //     triggerWaterRipple();
// //     animateAddButton();
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
// //   };

// //   const handleReset = () => {
// //     // Reset water amount animation
// //     Animated.sequence([
// //       Animated.timing(resetButtonAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
// //       Animated.spring(resetButtonAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
// //     ]).start();
    
// //     // Animate water level going down
// //     Animated.timing(progressAnim, {
// //       toValue: 0,
// //       duration: 600,
// //       useNativeDriver: false,
// //       easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
// //     }).start(() => {
// //       setWaterAmount(0);
// //       if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
// //     });
// //   };

// //   const triggerWaterRipple = () => {
// //     waterRippleAnim.setValue(0);
// //     Animated.timing(waterRippleAnim, {
// //       toValue: 1,
// //       duration: 1200, // Extended animation duration
// //       useNativeDriver: true,
// //       easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
// //     }).start();
// //   };

// //   const animateAddButton = () => {
// //     addButtonScale.setValue(1);
// //     Animated.sequence([
// //       Animated.timing(addButtonScale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
// //       Animated.spring(addButtonScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
// //     ]).start();
// //   };

// //   const animateQuantityChange = (increment: boolean) => {
// //     const scale = increment ? 1.2 : 0.8;
// //     const anim = new Animated.Value(1);
// //     Animated.sequence([
// //       Animated.timing(anim, { toValue: scale, duration: 100, useNativeDriver: true }),
// //       Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
// //     ]).start();
// //     return anim;
// //   };

// //   // Enhanced ripple effect with better animation
// //   const rippleScale = waterRippleAnim.interpolate({
// //     inputRange: [0, 0.4, 1],
// //     outputRange: [0.4, 1.5, 2.5],
// //   });

// //   const rippleOpacity = waterRippleAnim.interpolate({
// //     inputRange: [0, 0.4, 0.8, 1],
// //     outputRange: [0.6, 0.4, 0.2, 0],
// //   });

// //   // Enhanced wave animation
// //   const waveOffset = waveAnim.interpolate({
// //     inputRange: [0, 0.5, 1],
// //     outputRange: [0, 15, 0],
// //   });

// //   const glowOpacity = glowAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0.2, 0.5],
// //   });

// //   const getMotivationalContent = () => {
// //     const percentage = getProgressPercentage();
// //     if (percentage === 0) return { text: "Let's Hydrate!", emoji: "💧" };
// //     if (percentage < 25) return { text: "Great Start!", emoji: "🥤" };
// //     if (percentage < 50) return { text: "You're Rocking It!", emoji: "💦" };
// //     if (percentage < 75) return { text: "Keep Flowing!", emoji: "🌊" };
// //     if (percentage < 95) return { text: "So Close!", emoji: "🏊‍♂️" };
// //     return { text: "Hydration Hero!", emoji: "🎉" };
// //   };

// //   const motivationalContent = getMotivationalContent();

// //   // Enhanced glass option selection - scroll to center the selected glass
// //   const handleGlassSelect = (index: number) => {
// //     setSelectedGlassIndex(index);
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
// //     // Scroll to center the selected glass
// //     if (glassScrollRef.current) {
// //       const itemWidth = 80; // Width + margin
// //       const offset = index * itemWidth - (SCREEN_WIDTH / 2) + (itemWidth / 2);
// //       glassScrollRef.current.scrollTo({ x: Math.max(0, offset), animated: true });
// //     }
// //   };

// //   return (
// //     <Modal visible={visible} transparent animationType="none">
// //       <StatusBar backgroundColor="rgba(0, 0, 0, 0.7)" barStyle="light-content" />
// //       <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
// //         <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={closeModal} />
        
// //         <Animated.View style={[
// //           styles.modalContent,
// //           { 
// //             transform: [{ translateY: slideAnim }],
// //             borderColor: colors.border,
// //           }
// //         ]}>
// //           <LinearGradient
// //             colors={isDarkMode ? ['#1C2526', '#2E3A3B'] : ['#E6E8FA', '#D1D5F8']}
// //             style={StyleSheet.absoluteFill}
// //           />
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.header}>
// //             <Text style={[styles.title, { color: colors.text }]}>Hydration Hub</Text>
// //             <View style={styles.headerButtons}>
// //               <Animated.View style={{ transform: [{ scale: resetButtonAnim }], marginRight: 10 }}>
// //                 <TouchableOpacity 
// //                   style={[styles.resetButton, { borderColor: colors.border }]}
// //                   onPress={handleReset}
// //                 >
// //                   <Ionicons name="refresh" size={16} color={colors.text} />
// //                   <Text style={[styles.resetText, { color: colors.text }]}>Reset</Text>
// //                 </TouchableOpacity>
// //               </Animated.View>
// //               <TouchableOpacity onPress={openSettings}>
// //                 <Ionicons name="settings-outline" size={22} color={colors.text} />
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           <View style={styles.progressContainer}>
// //             <LinearGradient
// //               colors={isDarkMode 
// //                 ? ['#2E3A3B', '#1C2526'] 
// //                 : ['#E6E8FA', '#D1D5F8']}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //               style={styles.progressGradient}
// //             >
// //               <Animated.View style={[styles.waveBackground, { transform: [{ translateY: waveOffset }] }]} />
// //               <View style={styles.waterVisualization}>
// //                 <View style={[styles.waterContainer, { borderColor: colors.border, shadowColor: colors.text }]}>
// //                   <Animated.View style={[
// //                     styles.waterFill,
// //                     { height: progressAnim.interpolate({
// //                         inputRange: [0, 1],
// //                         outputRange: ['0%', '100%']
// //                       }) 
// //                     }
// //                   ]}>
// //                     <LinearGradient
// //                       colors={isDarkMode ? ['#FF9500', '#FF6B00', '#FF3D00'] : ['#6366F1', '#4F46E5', '#4338CA']}
// //                       style={StyleSheet.absoluteFill}
// //                     />
// //                   </Animated.View>
// //                   <Animated.View style={[
// //                     styles.rippleEffect,
// //                     {
// //                       transform: [{ scale: rippleScale }],
// //                       opacity: rippleOpacity,
// //                       backgroundColor: isDarkMode ? '#FF9500' : '#6366F1',
// //                     }
// //                   ]} />
// //                   <Text style={[styles.waterEmoji]}>{motivationalContent.emoji}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.progressInfo}>
// //                 <Text style={[styles.motivationalText, { color: colors.text }]}>
// //                   {motivationalContent.text}
// //                 </Text>
// //                 <Text style={[styles.progressMetrics, { color: colors.secondaryText }]}>
// //                   {formatAmount(waterAmount)} / {formatGoal()}
// //                 </Text>
// //                 <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#3A4647' : '#D1D5F8' }]}>
// //                   <Animated.View style={[
// //                     styles.progressFill,
// //                     { 
// //                       width: progressAnim.interpolate({
// //                         inputRange: [0, 1],
// //                         outputRange: ['0%', '100%'],
// //                       }),
// //                     }
// //                   ]}>
// //                     <LinearGradient
// //                       colors={isDarkMode ? ['#FF9500', '#FF6B00', '#FF3D00'] : ['#6366F1', '#4F46E5', '#4338CA']}
// //                       style={StyleSheet.absoluteFill}
// //                     />
// //                     <Animated.View style={[styles.progressGlow, { opacity: glowOpacity }]} />
// //                   </Animated.View>
// //                 </View>
// //               </View>
// //             </LinearGradient>
// //           </View>

// //           <View style={styles.glassSelection}>
// //             <View style={styles.glassGridContainer}>
// //               {glassOptions.map((glass, index) => (
// //                 <TouchableOpacity
// //                   key={glass.id}
// //                   style={[
// //                     styles.glassOption,
// //                     { 
// //                       backgroundColor: isDarkMode ? '#2E3A3B' : '#E6E8FA',
// //                       borderColor: index === selectedGlassIndex ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.border,
// //                       transform: [{ scale: index === selectedGlassIndex ? 1.05 : 1 }],
// //                     }
// //                   ]}
// //                   onPress={() => handleGlassSelect(index)}
// //                 >
// //                   <MaterialCommunityIcons 
// //                     name={glass.icon as any} 
// //                     size={24} 
// //                     color={index === selectedGlassIndex ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.text} 
// //                   />
// //                   <Text style={[styles.glassName, { color: colors.text }]}>{glass.name}</Text>
// //                   <Text style={[styles.glassVolume, { color: colors.secondaryText }]}>
// //                     {unitType === 'ml' ? `${glass.ml} ml` : 
// //                      unitType === 'oz' ? `${glass.oz} oz` : 
// //                      `${(glass.ml / 250).toFixed(1)} cups`}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>

// //             <View style={styles.quantitySelector}>
// //               <TouchableOpacity 
// //                 style={[styles.quantityButton, { borderColor: colors.border }]} 
// //                 onPress={() => {
// //                   setGlassQuantity(prev => Math.max(1, prev - 1));
// //                   if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
// //                 }}
// //               >
// //                 <Ionicons name="remove" size={20} color={colors.text} />
// //               </TouchableOpacity>
// //               <Animated.Text style={[styles.quantityText, { color: colors.text, transform: [{ scale: animateQuantityChange(glassQuantity > 1) }] }]}>
// //                 {glassQuantity}
// //               </Animated.Text>
// //               <TouchableOpacity 
// //                 style={[styles.quantityButton, { borderColor: colors.border }]} 
// //                 onPress={() => {
// //                   setGlassQuantity(prev => prev + 1);
// //                   if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
// //                 }}
// //               >
// //                 <Ionicons name="add" size= {20} color={colors.text} />
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
// //             <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
// //               <LinearGradient
// //                 colors={isDarkMode ? ['#FF9500', '#FF6B00', '#FF3D00'] : ['#6366F1', '#4F46E5', '#4338CA']}
// //                 style={StyleSheet.absoluteFill}
// //                 start={{ x: 0, y: 0 }}
// //                 end={{ x: 1, y: 1 }}
// //               />
// //               <Animated.View style={[styles.addButtonRipple, { opacity: waterRippleAnim }]} />
// //               <Text style={[styles.addButtonText]}>Add Water</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         </Animated.View>

// //         <Animated.View style={[
// //           styles.settingsPanel,
// //           { 
// //             transform: [{ translateY: settingsSlideAnim }],
// //             borderColor: colors.border,
// //           }
// //         ]}>
// //           <LinearGradient
// //             colors={isDarkMode ? ['#1C2526', '#2E3A3B'] : ['#E6E8FA', '#D1D5F8']}
// //             style={StyleSheet.absoluteFill}
// //           />
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.settingsHeader}>
// //             <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
// //             <TouchableOpacity onPress={closeSettings}>
// //               <Ionicons name="close" size={22} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Units</Text>
// //             <View style={styles.unitsContainer}>
// //               {(['ml', 'oz', 'cups'] as UnitType[]).map(unit => (
// //                 <TouchableOpacity
// //                   key={unit}
// //                   style={[
// //                     styles.unitOption,
// //                     { 
// //                       backgroundColor: unitType === unit ? (isDarkMode ? '#3A4647' : '#D1D5F8') : isDarkMode ? '#2E3A3B' : '#E6E8FA',
// //                       borderColor: unitType === unit ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.border,
// //                     }
// //                   ]}
// //                   onPress={() => {
// //                     setUnitType(unit);
// //                     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //                   }}
// //                 >
// //                   <Text style={[styles.unitText, { color: unitType === unit ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.text }]}>
// //                     {unit.toUpperCase()}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Goal</Text>
// //             <View style={styles.goalContainer}>
// //               <TouchableOpacity 
// //                 style={[styles.goalButton, { borderColor: colors.border }]} 
// //                 onPress={() => setWaterGoal(prev => Math.max(100, prev - 100))}
// //               >
// //                 <Ionicons name="remove" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
// //               </TouchableOpacity>
// //               <Text style={[styles.goalText, { color: colors.text }]}>
// //                 {unitType === 'ml' ? waterGoal : 
// //                  unitType === 'oz' ? (waterGoal / 29.574).toFixed(1) : 
// //                  (waterGoal / 250).toFixed(1)} {unitType}
// //               </Text>
// //               <TouchableOpacity 
// //                 style={[styles.goalButton, { borderColor: colors.border }]} 
// //                 onPress={() => setWaterGoal(prev => prev + 100)}
// //               >
// //                 <Ionicons name="add" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
// //               </TouchableOpacity>
// //             </View>
// //             <View style={styles.presetGoals}>
// //               {[1500, 2000, 2500, 3000].map(goal => (
// //                 <TouchableOpacity
// //                   key={goal}
// //                   style={[
// //                     styles.presetGoal,
// //                     { 
// //                       backgroundColor: waterGoal === goal ? (isDarkMode ? '#3A4647' : '#D1D5F8') : isDarkMode ? '#2E3A3B' : '#E6E8FA',
// //                       borderColor: waterGoal === goal ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.border,
// //                     }
// //                   ]}
// //                   onPress={() => setWaterGoal(goal)}
// //                 >
// //                   <Text style={[styles.presetGoalText, { color: colors.text }]}>{goal / 1000}L</Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <TouchableOpacity style={styles.applyButton} onPress={closeSettings}>
// //             <LinearGradient
// //               colors={isDarkMode ? ['#FF9500', '#FF6B00', '#FF3D00'] : ['#6366F1', '#4F46E5', '#4338CA']}
// //               style={StyleSheet.absoluteFill}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //             />
// //             <Text style={[styles.applyButtonText]}>Apply</Text>
// //           </TouchableOpacity>
// //         </Animated.View>
// //       </Animated.View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0, 0, 0, 0.7)',
// //     justifyContent: 'flex-end',
// //   },
// //   dismissArea: {
// //     flex: 1,
// //   },
// //   modalContent: {
// //     borderTopLeftRadius: 28,
// //     borderTopRightRadius: 28,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -4 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 12,
// //     elevation: 8,
// //   },
// //   handleBarContainer: {
// //     alignItems: 'center',
// //     paddingVertical: 8,
// //   },
// //   handleBar: {
// //     width: 40,
// //     height: 4,
// //     borderRadius: 2,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   headerButtons: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   resetButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderRadius: 16,
// //     paddingHorizontal: 10,
// //     paddingVertical: 5,
// //     backgroundColor: 'rgba(255, 255, 255, 0.1)',
// //   },
// //   resetText: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     marginLeft: 4,
// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: '700',
// //   },
// //   progressContainer: {
// //     borderRadius: 16,
// //     overflow: 'hidden',
// //     marginBottom: 16,
// //     position: 'relative',
// //   },
// //   progressGradient: {
// //     padding: 16,
// //   },
// //   waveBackground: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     height: '100%',
// //     backgroundColor: 'rgba(255, 255, 255, 0.05)',
// //     borderRadius: 16,
// //   },
// //   waterVisualization: {
// //     alignItems: 'center',
// //     marginRight: 16,
// //   },
// //   waterContainer: {
// //     width: 80,
// //     height: 120,
// //     borderRadius: 16,
// //     borderWidth: 2,
// //     overflow: 'hidden',
// //     justifyContent: 'flex-end',
// //     position: 'relative',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 8,
// //   },
// //   waterFill: {
// //     position: 'absolute',
// //     bottom: 0,
// //     width: '100%',
// //   },
// //   rippleEffect: {
// //     position: 'absolute',
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     bottom: '50%',
// //     alignSelf: 'center',
// //   },
// //   waterEmoji: {
// //     fontSize: 24,
// //     position: 'absolute',
// //     top: '50%',
// //     left: '50%',
// //     transform: [{ translateX: -12 }, { translateY: -12 }],
// //   },
// //   progressInfo: {
// //     flex: 1,
// //   },
// //   motivationalText: {
// //     fontSize: 16,
// //     fontWeight: '700',
// //     marginBottom: 8,
// //   },
// //   progressMetrics: {
// //     fontSize: 13,
// //     marginBottom: 8,
// //   },
// //   progressBar: {
// //     height: 10,
// //     borderRadius: 5,
// //     overflow: 'hidden',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //   },
// //   progressFill: {
// //     height: '100%',
// //     borderRadius: 5,
// //     overflow: 'hidden',
// //     position: 'relative',
// //   },
// //   progressGlow: {
// //     position: 'absolute',
// //     top: -10,
// //     left: -10,
// //     right: -10,
// //     bottom: -10,
// //     backgroundColor: 'rgba(255, 255, 255, 0.3)',
// //     borderRadius: 5,
// //   },
// //   glassSelection: {
// //     marginBottom: 16,
// //   },
// //   glassGridContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     paddingVertical: 8,
// //   },
// //   glassOption: {
// //     width: 70,
// //     padding: 10,
// //     borderRadius: 16,
// //     borderWidth: 1.5,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //   },
// //   glassName: {
// //     fontSize: 13,
// //     fontWeight: '600',
// //     marginTop: 4,
// //   },
// //   glassVolume: {
// //     fontSize: 10,
// //     marginTop: 2,
// //   },
// //   quantitySelector: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginTop: 16,
// //   },
// //   quantityButton: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //     borderWidth: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(255, 255, 255, 0.1)',
// //   },
// //   quantityText: {
// //     fontSize: 18,
// //     fontWeight: '600',
// //     marginHorizontal: 16,
// //   },
// //   addButton: {
// //     borderRadius: 24,
// //     height: 56,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     overflow: 'hidden',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 8,
// //     elevation: 8,
// //   },
// //   addButtonRipple: {
// //     position: 'absolute',
// //     width: 100,
// //     height: 100,
// //     borderRadius: 50,
// //     backgroundColor: 'rgba(255, 255, 255, 0.3)',
// //   },
// //   addButtonText: {
// //     color: '#FFFFFF',
// //     fontSize: 18,
// //     fontWeight: '700',
// //   },
// //   settingsPanel: {
// //     position: 'absolute',
// //     borderTopLeftRadius: 28,
// //     borderTopRightRadius: 28,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     width: '100%',
// //     backgroundColor: '#FFF',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -4 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 12,
// //     elevation: 8,
// //   },
// //   settingsHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 24,
// //   },
// //   settingsSection: {
// //     marginBottom: 24,
// //   },
// //   settingTitle: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 12,
// //   },
// //   unitsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //   },
// //   unitOption: {
// //     flex: 1,
// //     marginHorizontal: 6,
// //     paddingVertical: 10,
// //     borderRadius: 16,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     borderWidth: 1.5,
// //   },
// //   unitText: {
// //     fontWeight: '600',
// //   },
// //   goalContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginBottom: 16,
// //   },
// //   goalButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(255, 255, 255, 0.1)',
// //   },
// //   goalText: {
// //     fontSize: 18,
// //     fontWeight: '600',
// //     marginHorizontal: 16,
// //     width: 100,
// //     textAlign: 'center',
// //   },
// //   presetGoals: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //   },
// //   presetGoal: {
// //     flex: 1,
// //     marginHorizontal: 6,
// //     paddingVertical: 10,
// //     borderRadius: 16,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     borderWidth: 1.5,
// //   },
// //   presetGoalText: {
// //     fontWeight: '600',
// //   },
// //   applyButton: {
// //     borderRadius: 24,
// //     height: 56,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     overflow: 'hidden',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 8,
// //     elevation: 8,
// //   },
// //   applyButtonText: {
// //     color: '#FFFFFF',
// //     fontSize: 18,
// //     fontWeight: '700',
// //   }
// // });

// // export default memo(WaterModal);

// // import React, { useState, useEffect, useRef, memo } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Animated,
// //   Easing,
// //   Dimensions,
// //   StatusBar,
// //   Platform,
// // } from 'react-native';
// // import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// // import * as Haptics from 'expo-haptics';

// // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // interface GlassOption {
// //   id: string;
// //   name: string;
// //   icon: string;
// //   ml: number;
// //   oz: number;
// // }

// // type UnitType = 'ml' | 'oz' | 'cups';

// // interface WaterModalProps {
// //   visible: boolean;
// //   onClose: () => void;
// //   initialValue?: number;
// //   onSave?: (data: { amount: number; unit: UnitType; goal: number }) => void;
// // }

// // const WaterModal: React.FC<WaterModalProps> = ({
// //   visible,
// //   onClose,
// //   initialValue = 0,
// //   onSave,
// // }) => {
// //   const { isDarkMode } = useTheme();
// //   const colors = isDarkMode ? darkTheme : lightTheme;

// //   const glassOptions: GlassOption[] = [
// //     { id: 'small', name: 'Small', icon: 'cup', ml: 150, oz: 5 },
// //     { id: 'medium', name: 'Medium', icon: 'glass-mug-variant', ml: 250, oz: 8 },
// //     { id: 'large', name: 'Large', icon: 'glass-tulip', ml: 350, oz: 12 },
// //     { id: 'bottle', name: 'Bottle', icon: 'bottle-soda', ml: 500, oz: 17 },
// //   ];

// //   const [selectedGlassIndex, setSelectedGlassIndex] = useState(1);
// //   const [glassQuantity, setGlassQuantity] = useState(1);
// //   const [waterAmount, setWaterAmount] = useState(initialValue);
// //   const [unitType, setUnitType] = useState<UnitType>('ml');
// //   const [waterGoal, setWaterGoal] = useState(2000);
// //   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

// //   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const progressAnim = useRef(new Animated.Value(0)).current;
// //   const settingsSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const waterRippleAnim = useRef(new Animated.Value(0)).current;
// //   const addButtonScale = useRef(new Animated.Value(1)).current;
// //   const resetButtonScale = useRef(new Animated.Value(1)).current;
// //   const waveAnim = useRef(new Animated.Value(0)).current;
// //   const glowAnim = useRef(new Animated.Value(0)).current;
// //   const sparkleAnim = useRef(new Animated.Value(0)).current;

// //   const glassScaleAnims = glassOptions.map(() => useRef(new Animated.Value(1)).current);

// //   const getProgressPercentage = () => Math.min((waterAmount / waterGoal) * 100, 100);

// //   const formatAmount = (amount: number) => {
// //     switch (unitType) {
// //       case 'ml': return `${amount} ml`;
// //       case 'oz': return `${(amount / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(amount / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const formatGoal = () => {
// //     switch (unitType) {
// //       case 'ml': return `${waterGoal} ml`;
// //       case 'oz': return `${(waterGoal / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(waterGoal / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const getSelectedGlassVolume = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     switch (unitType) {
// //       case 'ml': return selectedGlass.ml;
// //       case 'oz': return selectedGlass.oz;
// //       case 'cups': return selectedGlass.ml / 250;
// //     }
// //   };

// //   useEffect(() => {
// //     if (visible) {
// //       Animated.parallel([
// //         Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
// //         Animated.spring(slideAnim, { toValue: 0, tension: 120, friction: 8, useNativeDriver: true }),
// //       ]).start();
// //       Animated.loop(
// //         Animated.timing(waveAnim, {
// //           toValue: 1,
// //           duration: 2500,
// //           easing: Easing.sin,
// //           useNativeDriver: true,
// //         })
// //       ).start();
// //       Animated.loop(
// //         Animated.sequence([
// //           Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
// //           Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
// //         ])
// //       ).start();
// //       Animated.loop(
// //         Animated.sequence([
// //           Animated.timing(sparkleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
// //           Animated.timing(sparkleAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
// //         ])
// //       ).start();
// //     }
// //   }, [visible]);

// //   useEffect(() => {
// //     Animated.timing(progressAnim, {
// //       toValue: getProgressPercentage() / 100,
// //       duration: 1000,
// //       useNativeDriver: false,
// //       easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
// //     }).start();
// //   }, [waterAmount, waterGoal]);

// //   const closeModal = () => {
// //     if (isSettingsOpen) {
// //       closeSettings();
// //       return;
// //     }
// //     Animated.parallel([
// //       Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
// //       Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 500, useNativeDriver: true }),
// //     ]).start(() => {
// //       if (onSave) onSave({ amount: waterAmount, unit: unitType, goal: waterGoal });
// //       onClose();
// //     });
// //   };

// //   const openSettings = () => {
// //     Animated.spring(settingsSlideAnim, {
// //       toValue: 0,
// //       tension: 120,
// //       friction: 8,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(true));
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //   };

// //   const closeSettings = () => {
// //     Animated.timing(settingsSlideAnim, {
// //       toValue: SCREEN_HEIGHT,
// //       duration: 500,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(false));
// //   };

// //   const handleReset = () => {
// //     setWaterAmount(0);
// //     Animated.sequence([
// //       Animated.timing(resetButtonScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
// //       Animated.timing(resetButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
// //     ]).start();
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
// //   };

// //   const handleAdd = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     const addAmount = unitType === 'ml' ? selectedGlass.ml :
// //                      unitType === 'oz' ? selectedGlass.oz :
// //                      selectedGlass.ml / 250;
// //     const mlEquivalent = unitType === 'ml' ? addAmount :
// //                         unitType === 'oz' ? addAmount * 29.574 :
// //                         addAmount * 250;
// //     setWaterAmount(prev => prev + mlEquivalent * glassQuantity);
// //     triggerWaterRipple();
// //     animateAddButton();
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
// //   };

// //   const triggerWaterRipple = () => {
// //     waterRippleAnim.setValue(0);
// //     Animated.timing(waterRippleAnim, {
// //       toValue: 1,
// //       duration: 1000,
// //       useNativeDriver: true,
// //       easing: Easing.out(Easing.bezier(0.4, 0, 0.2, 1)),
// //     }).start();
// //   };

// //   const animateAddButton = () => {
// //     addButtonScale.setValue(1);
// //     Animated.sequence([
// //       Animated.timing(addButtonScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
// //       Animated.timing(addButtonScale, { toValue: 1, duration: 150, useNativeDriver: true }),
// //     ]).start();
// //   };

// //   const animateGlassSelection = (index: number) => {
// //     glassScaleAnims[index].setValue(0.8);
// //     Animated.spring(glassScaleAnims[index], {
// //       toValue: 1,
// //       tension: 150,
// //       friction: 6,
// //       useNativeDriver: true,
// //     }).start();
// //   };

// //   const animateQuantityChange = (increment: boolean) => {
// //     const scale = increment ? 1.3 : 0.7;
// //     const anim = new Animated.Value(1);
// //     Animated.sequence([
// //       Animated.timing(anim, { toValue: scale, duration: 120, useNativeDriver: true }),
// //       Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
// //     ]).start();
// //     return anim;
// //   };

// //   const rippleScale = waterRippleAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0.3, 3],
// //   });

// //   const rippleOpacity = waterRippleAnim.interpolate({
// //     inputRange: [0, 0.6, 1],
// //     outputRange: [0.7, 0.4, 0],
// //   });

// //   const waveOffset = waveAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0, 8],
// //   });

// //   const glowOpacity = glowAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0.15, 0.45],
// //   });

// //   const sparkleOpacity = sparkleAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0, 1],
// //   });

// //   const getMotivationalContent = () => {
// //     const percentage = getProgressPercentage();
// //     if (percentage === 0) return { text: "Let's Hydrate!", emoji: "💧" };
// //     if (percentage < 25) return { text: "Great Start!", emoji: "🥤" };
// //     if (percentage < 50) return { text: "You're Rocking It!", emoji: "💦" };
// //     if (percentage < 75) return { text: "Keep Flowing!", emoji: "🌊" };
// //     if (percentage < 95) return { text: "So Close!", emoji: "🏊‍♂️" };
// //     return { text: "Hydration Hero!", emoji: "🎉" };
// //   };

// //   const motivationalContent = getMotivationalContent();

// //   return (
// //     <Modal visible={visible} transparent animationType="none">
// //       <StatusBar backgroundColor="rgba(0, 0, 0, 0.8)" barStyle="light-content" />
// //       <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
// //         <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={closeModal} />
        
// //         <Animated.View style={[
// //           styles.modalContent,
// //           { transform: [{ translateY: slideAnim }], borderColor: colors.border },
// //         ]}>
// //           <LinearGradient
// //             colors={isDarkMode ? ['#12161A', '#1E2529'] : ['#E8EBFF', '#D4D8FF']}
// //             style={StyleSheet.absoluteFill}
// //           />
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.header}>
// //             <Animated.View style={{ transform: [{ scale: resetButtonScale }] }}>
// //               <TouchableOpacity onPress={handleReset}>
// //                 <Ionicons name="refresh-outline" size={22} color={colors.text} />
// //               </TouchableOpacity>
// //             </Animated.View>
// //             <Text style={[styles.title, { color: colors.text }]}>Hydration Hub</Text>
// //             <TouchableOpacity onPress={openSettings}>
// //               <Ionicons name="settings-outline" size={22} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.progressContainer}>
// //             <LinearGradient
// //               colors={isDarkMode ? ['#1E2529', '#12161A'] : ['#E8EBFF', '#D4D8FF']}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //               style={styles.progressGradient}
// //             >
// //               <Animated.View style={[styles.waveBackground, { transform: [{ translateY: waveOffset }] }]} />
// //               <View style={styles.waterVisualization}>
// //                 <View style={[styles.waterContainer, { borderColor: colors.border, shadowColor: colors.text }]}>
// //                   <Animated.View style={[styles.waterFill, { height: `${getProgressPercentage()}%` }]}>
// //                     <LinearGradient
// //                       colors={isDarkMode ? ['#FF8A00', '#FF6200', '#FF3800'] : ['#5B5FE8', '#464AE0', '#3A3DD8']}
// //                       style={StyleSheet.absoluteFill}
// //                     />
// //                   </Animated.View>
// //                   <Animated.View style={[
// //                     styles.rippleEffect,
// //                     {
// //                       transform: [{ scale: rippleScale }],
// //                       opacity: rippleOpacity,
// //                       backgroundColor: isDarkMode ? '#FF8A00' : '#5B5FE8',
// //                     }
// //                   ]} />
// //                   <Text style={[styles.waterEmoji]}>{motivationalContent.emoji}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.progressInfo}>
// //                 <Text style={[styles.motivationalText, { color: colors.text }]}>
// //                   {motivationalContent.text}
// //                 </Text>
// //                 <Text style={[styles.progressMetrics, { color: colors.secondaryText }]}>
// //                   {formatAmount(waterAmount)} / {formatGoal()}
// //                 </Text>
// //                 <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#2A3236' : '#D4D8FF' }]}>
// //                   <Animated.View style={[
// //                     styles.progressFill,
// //                     {
// //                       width: progressAnim.interpolate({
// //                         inputRange: [0, 1],
// //                         outputRange: ['0%', '100%'],
// //                       }),
// //                     }
// //                   ]}>
// //                     <LinearGradient
// //                       colors={isDarkMode ? ['#FF8A00', '#FF6200', '#FF3800'] : ['#5B5FE8', '#464AE0', '#3A3DD8']}
// //                       style={StyleSheet.absoluteFill}
// //                     />
// //                     <Animated.View style={[styles.progressGlow, { opacity: glowOpacity }]} />
// //                     <Animated.View style={[styles.sparkleEffect, { opacity: sparkleOpacity }]} />
// //                   </Animated.View>
// //                 </View>
// //               </View>
// //             </LinearGradient>
// //           </View>

// //           <View style={styles.glassSelection}>
// //             <View style={styles.glassOptions}>
// //               {glassOptions.map((glass, index) => (
// //                 <Animated.View
// //                   key={glass.id}
// //                   style={{ transform: [{ scale: glassScaleAnims[index] }] }}
// //                 >
// //                   <TouchableOpacity
// //                     style={[
// //                       styles.glassOption,
// //                       {
// //                         backgroundColor: isDarkMode ? '#1E2529' : '#E8EBFF',
// //                         borderColor: index === selectedGlassIndex ? (isDarkMode ? '#FF8A00' : '#5B5FE8') : colors.border,
// //                       }
// //                     ]}
// //                     onPress={() => {
// //                       setSelectedGlassIndex(index);
// //                       animateGlassSelection(index);
// //                       if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //                     }}
// //                   >
// //                     <MaterialCommunityIcons
// //                       name={glass.icon as any}
// //                       size={22}
// //                       color={index === selectedGlassIndex ? (isDarkMode ? '#FF8A00' : '#5B5FE8') : colors.text}
// //                     />
// //                     <Text style={[styles.glassName, { color: colors.text }]}>{glass.name}</Text>
// //                     <Text style={[styles.glassVolume, { color: colors.secondaryText }]}>
// //                       {unitType === 'ml' ? `${glass.ml} ml` :
// //                        unitType === 'oz' ? `${glass.oz} oz` :
// //                        `${(glass.ml / 250).toFixed(1)} cups`}
// //                     </Text>
// //                   </TouchableOpacity>
// //                 </Animated.View>
// //               ))}
// //             </View>

// //             <View style={styles.quantitySelector}>
// //               <TouchableOpacity
// //                 style={[styles.quantityButton, { borderColor: colors.border }]}
// //                 onPress={() => {
// //                   setGlassQuantity(prev => Math.max(1, prev - 1));
// //                   if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
// //                 }}
// //               >
// //                 <Ionicons name="remove" size={18} color={colors.text} />
// //               </TouchableOpacity>
// //               <Animated.Text style={[styles.quantityText, { color: colors.text, transform: [{ scale: animateQuantityChange(glassQuantity > 1) }] }]}>
// //                 {glassQuantity}
// //               </Animated.Text>
// //               <TouchableOpacity
// //                 style={[styles.quantityButton, { borderColor: colors.border }]}
// //                 onPress={() => {
// //                   setGlassQuantity(prev => prev + 1);
// //                   if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
// //                 }}
// //               >
// //                 <Ionicons name="add" size={18} color={colors.text} />
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
// //             <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
// //               <LinearGradient
// //                 colors={isDarkMode ? ['#FF8A00', '#FF6200', '#FF3800'] : ['#5B5FE8', '#464AE0', '#3A3DD8']}
// //                 style={StyleSheet.absoluteFill}
// //                 start={{ x: 0, y: 0 }}
// //                 end={{ x: 1, y: 1 }}
// //               />
// //               <Animated.View style={[styles.addButtonRipple, { opacity: waterRippleAnim }]} />
// //               <Text style={[styles.addButtonText]}>Add Water</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         </Animated.View>

// //         <Animated.View style={[
// //           styles.settingsPanel,
// //           { transform: [{ translateY: settingsSlideAnim }], borderColor: colors.border },
// //         ]}>
// //           <LinearGradient
// //             colors={isDarkMode ? ['#12161A', '#1E2529'] : ['#E8EBFF', '#D4D8FF']}
// //             style={StyleSheet.absoluteFill}
// //           />
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.settingsHeader}>
// //             <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
// //             <TouchableOpacity onPress={closeSettings}>
// //               <Ionicons name="close" size={22} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Units</Text>
// //             <View style={styles.unitsContainer}>
// //               {(['ml', 'oz', 'cups'] as UnitType[]).map(unit => (
// //                 <TouchableOpacity
// //                   key={unit}
// //                   style={[
// //                     styles.unitOption,
// //                     {
// //                       backgroundColor: unitType === unit ? (isDarkMode ? '#2A3236' : '#D4D8FF') : isDarkMode ? '#1E2529' : '#E8EBFF',
// //                       borderColor: unitType === unit ? (isDarkMode ? '#FF8A00' : '#5B5FE8') : colors.border,
// //                     }
// //                   ]}
// //                   onPress={() => {
// //                     setUnitType(unit);
// //                     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //                   }}
// //                 >
// //                   <Text style={[styles.unitText, { color: unitType === unit ? (isDarkMode ? '#FF8A00' : '#5B5FE8') : colors.text }]}>
// //                     {unit.toUpperCase()}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Goal</Text>
// //             <View style={styles.goalContainer}>
// //               <TouchableOpacity
// //                 style={[styles.goalButton, { borderColor: colors.border }]}
// //                 onPress={() => setWaterGoal(prev => Math.max(100, prev - 100))}
// //               >
// //                 <Ionicons name="remove" size={18} color={isDarkMode ? '#FF8A00' : '#5B5FE8'} />
// //               </TouchableOpacity>
// //               <Text style={[styles.goalText, { color: colors.text }]}>
// //                 {unitType === 'ml' ? waterGoal :
// //                  unitType === 'oz' ? (waterGoal / 29.574).toFixed(1) :
// //                  (waterGoal / 250).toFixed(1)} {unitType}
// //               </Text>
// //               <TouchableOpacity
// //                 style={[styles.goalButton, { borderColor: colors.border }]}
// //                 onPress={() => setWaterGoal(prev => prev + 100)}
// //               >
// //                 <Ionicons name="add" size={18} color={isDarkMode ? '#FF8A00' : '#5B5FE8'} />
// //               </TouchableOpacity>
// //             </View>
// //             <View style={styles.presetGoals}>
// //               {[1500, 2000, 2500, 3000].map(goal => (
// //                 <TouchableOpacity
// //                   key={goal}
// //                   style={[
// //                     styles.presetGoal,
// //                     {
// //                       backgroundColor: waterGoal === goal ? (isDarkMode ? '#2A3236' : '#D4D8FF') : isDarkMode ? '#1E2529' : '#E8EBFF',
// //                       borderColor: waterGoal === goal ? (isDarkMode ? '#FF8A00' : '#5B5FE8') : colors.border,
// //                     }
// //                   ]}
// //                   onPress={() => setWaterGoal(goal)}
// //                 >
// //                   <Text style={[styles.presetGoalText, { color: colors.text }]}>{goal / 1000}L</Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <TouchableOpacity style={styles.applyButton} onPress={closeSettings}>
// //             <LinearGradient
// //               colors={isDarkMode ? ['#FF8A00', '#FF6200', '#FF3800'] : ['#5B5FE8', '#464AE0', '#3A3DD8']}
// //               style={StyleSheet.absoluteFill}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //             />
// //             <Text style={[styles.applyButtonText]}>Apply</Text>
// //           </TouchableOpacity>
// //         </Animated.View>
// //       </Animated.View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0, 0, 0, 0.8)',
// //     justifyContent: 'flex-end',
// //   },
// //   dismissArea: {
// //     flex: 1,
// //   },
// //   modalContent: {
// //     borderTopLeftRadius: 32,
// //     borderTopRightRadius: 32,
// //     padding: 20,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -6 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 14,
// //     elevation: 10,
// //   },
// //   handleBarContainer: {
// //     alignItems: 'center',
// //     paddingVertical: 8,
// //   },
// //   handleBar: {
// //     width: 48,
// //     height: 5,
// //     borderRadius: 2.5,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   title: {
// //     fontSize: 22,
// //     fontWeight: '800',
// //     letterSpacing: 0.5,
// //   },
// //   progressContainer: {
// //     borderRadius: 20,
// //     overflow: 'hidden',
// //     marginBottom: 20,
// //     position: 'relative',
// //     backgroundColor: 'rgba(0, 0, 0, 0.05)',
// //   },
// //   progressGradient: {
// //     padding: 16,
// //   },
// //   waveBackground: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     height: '100%',
// //     backgroundColor: 'rgba(255, 255, 255, 0.03)',
// //     borderRadius: 20,
// //   },
// //   waterVisualization: {
// //     alignItems: 'center',
// //     marginRight: 16,
// //   },
// //   waterContainer: {
// //     width: 90,
// //     height: 140,
// //     borderRadius: 20,
// //     borderWidth: 2,
// //     overflow: 'hidden',
// //     justifyContent: 'flex-end',
// //     position: 'relative',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 10,
// //   },
// //   waterFill: {
// //     position: 'absolute',
// //     bottom: 0,
// //     width: '100%',
// //   },
// //   rippleEffect: {
// //     position: 'absolute',
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //     bottom: '50%',
// //     alignSelf: 'center',
// //   },
// //   waterEmoji: {
// //     fontSize: 28,
// //     position: 'absolute',
// //     top: '50%',
// //     left: '50%',
// //     transform: [{ translateX: -14 }, { translateY: -14 }],
// //   },
// //   progressInfo: {
// //     flex: 1,
// //   },
// //   motivationalText: {
// //     fontSize: 18,
// //     fontWeight: '800',
// //     marginBottom: 10,
// //     letterSpacing: 0.3,
// //   },
// //   progressMetrics: {
// //     fontSize: 14,
// //     marginBottom: 10,
// //     fontWeight: '600',
// //   },
// //   progressBar: {
// //     height: 12,
// //     borderRadius: 6,
// //     overflow: 'hidden',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 3 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 6,
// //   },
// //   progressFill: {
// //     height: '100%',
// //     borderRadius: 6,
// //     overflow: 'hidden',
// //     position: 'relative',
// //   },
// //   progressGlow: {
// //     position: 'absolute',
// //     top: -12,
// //     left: -12,
// //     right: -12,
// //     bottom: -12,
// //     backgroundColor: 'rgba(255, 255, 255, 0.4)',
// //     borderRadius: 6,
// //   },
// //   sparkleEffect: {
// //     position: 'absolute',
// //     top: 0,
// //     right: 0,
// //     width: 10,
// //     height: 10,
// //     backgroundColor: 'rgba(255, 255, 255, 0.8)',
// //     borderRadius: 5,
// //     shadowColor: '#FFF',
// //     shadowOffset: { width: 0, height: 0 },
// //     shadowOpacity: 0.8,
// //     shadowRadius: 4,
// //   },
// //   glassSelection: {
// //     marginBottom: 20,
// //   },
// //   glassOptions: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     paddingVertical: 10,
// //   },
// //   glassOption: {
// //     width: (SCREEN_WIDTH - 80) / 4, // Equal width for 4 options with padding
// //     padding: 12,
// //     borderRadius: 18,
// //     borderWidth: 2,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 2, height: 2 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 6,
// //     elevation: 4,
// //   },
// //   glassName: {
// //     fontSize: 14,
// //     fontWeight: '700',
// //     marginTop: 6,
// //   },
// //   glassVolume: {
// //     fontSize: 12,
// //     marginTop: 4,
// //     fontWeight: '500',
// //   },
// //   quantitySelector: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: 16,
// //   },
// //   quantityButton: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     borderWidth: 2,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(255, 255, 255, 0.1)',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 1, height: 1 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //   },
// //   quantityText: {
// //     fontSize: 18,
// //     fontWeight: '800',
// //     marginHorizontal: 20,
// //   },
// //   addButton: {
// //     borderRadius: 32,
// //     paddingVertical: 16,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.4,
// //     shadowRadius: 10,
// //     elevation: 12,
// //     overflow: 'hidden',
// //   },
// //   addButtonRipple: {
// //     position: 'absolute',
// //     width: '100%',
// //     height: '100%',
// //     backgroundColor: 'rgba(255, 255, 255, 0.25)',
// //     borderRadius: 32,
// //   },
// //   addButtonText: {
// //     color: '#fff',
// //     fontSize: 17,
// //     fontWeight: '800',
// //     letterSpacing: 0.5,
// //   },
// //   settingsPanel: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     borderTopLeftRadius: 32,
// //     borderTopRightRadius: 32,
// //     padding: 20,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -6 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 14,
// //     elevation: 10,
// //   },
// //   settingsHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   settingsSection: {
// //     marginBottom: 20,
// //   },
// //   settingTitle: {
// //     fontSize: 17,
// //     fontWeight: '800',
// //     marginBottom: 12,
// //   },
// //   unitsContainer: {
// //     flexDirection: 'row',
// //     gap: 12,
// //   },
// //   unitOption: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     borderRadius: 16,
// //     borderWidth: 2,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 1, height: 1 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //   },
// //   unitText: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //   },
// //   goalContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: 16,
// //   },
// //   goalButton: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     borderWidth: 2,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(255, 255, 255, 0.1)',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 1, height: 1 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //   },
// //   goalText: {
// //     fontSize: 17,
// //     fontWeight: '800',
// //   },
// //   presetGoals: {
// //     flexDirection: 'row',
// //     gap: 12,
// //   },
// //   presetGoal: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     borderRadius: 16,
// //     borderWidth: 2,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 1, height: 1 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //   },
// //   presetGoalText: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //   },
// //   applyButton: {
// //     borderRadius: 32,
// //     paddingVertical: 16,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.4,
// //     shadowRadius: 10,
// //     elevation: 12,
// //   },
// //   applyButtonText: {
// //     color: '#fff',
// //     fontSize: 17,
// //     fontWeight: '800',
// //     letterSpacing: 0.5,
// //   },
// // });

// // export default memo(WaterModal);

// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Animated,
// //   Easing,
// //   Dimensions,
// //   StatusBar,
// //   ScrollView,
// //   Platform,
// // } from 'react-native';
// // import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// // import * as Haptics from 'expo-haptics';

// // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // interface GlassOption {
// //   id: string;
// //   name: string;
// //   icon: string;
// //   ml: number;
// //   oz: number;
// // }

// // type UnitType = 'ml' | 'oz' | 'cups';

// // interface WaterModalProps {
// //   visible: boolean;
// //   onClose: () => void;
// //   initialValue?: number;
// //   onSave?: (data: { amount: number; unit: UnitType; goal: number }) => void;
// // }

// // const WaterModal: React.FC<WaterModalProps> = ({
// //   visible,
// //   onClose,
// //   initialValue = 0,
// //   onSave,
// // }) => {
// //   const { isDarkMode } = useTheme();
// //   const colors = isDarkMode ? darkTheme : lightTheme;

// //   const glassOptions: GlassOption[] = [
// //     { id: 'small', name: 'Small', icon: 'cup', ml: 150, oz: 5 },
// //     { id: 'medium', name: 'Medium', icon: 'glass-mug-variant', ml: 250, oz: 8 },
// //     { id: 'large', name: 'Large', icon: 'glass-tulip', ml: 350, oz: 12 },
// //     { id: 'bottle', name: 'Bottle', icon: 'bottle-soda', ml: 500, oz: 17 },
// //   ];

// //   const [selectedGlassIndex, setSelectedGlassIndex] = useState(1);
// //   const [glassQuantity, setGlassQuantity] = useState(1);
// //   const [waterAmount, setWaterAmount] = useState(initialValue);
// //   const [unitType, setUnitType] = useState<UnitType>('ml');
// //   const [waterGoal, setWaterGoal] = useState(2000);
// //   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

// //   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const progressAnim = useRef(new Animated.Value(0)).current;
// //   const settingsSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const waterRippleAnim = useRef(new Animated.Value(0)).current;
// //   const addButtonScale = useRef(new Animated.Value(1)).current;

// //   const getProgressPercentage = () => Math.min((waterAmount / waterGoal) * 100, 100);

// //   const formatAmount = (amount: number) => {
// //     switch (unitType) {
// //       case 'ml': return `${amount} ml`;
// //       case 'oz': return `${(amount / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(amount / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const formatGoal = () => {
// //     switch (unitType) {
// //       case 'ml': return `${waterGoal} ml`;
// //       case 'oz': return `${(waterGoal / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(waterGoal / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const getSelectedGlassVolume = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     switch (unitType) {
// //       case 'ml': return selectedGlass.ml;
// //       case 'oz': return selectedGlass.oz;
// //       case 'cups': return selectedGlass.ml / 250;
// //     }
// //   };

// //   useEffect(() => {
// //     if (visible) {
// //       Animated.parallel([
// //         Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
// //         Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
// //       ]).start();
// //     }
// //   }, [visible]);

// //   useEffect(() => {
// //     Animated.timing(progressAnim, {
// //       toValue: getProgressPercentage() / 100,
// //       duration: 600,
// //       useNativeDriver: false,
// //       easing: Easing.out(Easing.bezier(0.25, 0.1, 0.25, 1)),
// //     }).start();
// //   }, [waterAmount, waterGoal]);

// //   const closeModal = () => {
// //     if (isSettingsOpen) {
// //       closeSettings();
// //       return;
// //     }
// //     Animated.parallel([
// //       Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
// //       Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }),
// //     ]).start(() => {
// //       if (onSave) onSave({ amount: waterAmount, unit: unitType, goal: waterGoal });
// //       onClose();
// //     });
// //   };

// //   const openSettings = () => {
// //     Animated.spring(settingsSlideAnim, {
// //       toValue: 0,
// //       tension: 80,
// //       friction: 12,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(true));
// //   };

// //   const closeSettings = () => {
// //     Animated.timing(settingsSlideAnim, {
// //       toValue: SCREEN_HEIGHT,
// //       duration: 300,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(false));
// //   };

// //   const handleAdd = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     const addAmount = unitType === 'ml' ? selectedGlass.ml :
// //                      unitType === 'oz' ? selectedGlass.oz :
// //                      selectedGlass.ml / 250;
// //     const mlEquivalent = unitType === 'ml' ? addAmount :
// //                         unitType === 'oz' ? addAmount * 29.574 :
// //                         addAmount * 250;
// //     setWaterAmount(prev => prev + mlEquivalent * glassQuantity);
// //     triggerWaterRipple();
// //     animateAddButton();
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //   };

// //   const triggerWaterRipple = () => {
// //     waterRippleAnim.setValue(0);
// //     Animated.timing(waterRippleAnim, {
// //       toValue: 1,
// //       duration: 600,
// //       useNativeDriver: true,
// //       easing: Easing.out(Easing.ease),
// //     }).start();
// //   };

// //   const animateAddButton = () => {
// //     addButtonScale.setValue(1);
// //     Animated.sequence([
// //       Animated.timing(addButtonScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
// //       Animated.timing(addButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
// //     ]).start();
// //   };

// //   const width = (progression: number) => {
// //     return progressAnim.interpolate({
// //       inputRange: [0, 1],
// //       outputRange: ['0%', '100%'],
// //     });
// //   };

// //   const rippleScale = waterRippleAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0.5, 2],
// //   });

// //   const rippleOpacity = waterRippleAnim.interpolate({
// //     inputRange: [0, 0.8, 1],
// //     outputRange: [0.5, 0.2, 0],
// //   });

// //   const getMotivationalContent = () => {
// //     const percentage = getProgressPercentage();
// //     if (percentage === 0) return { text: "Start Hydrating!", emoji: "💧" };
// //     if (percentage < 25) return { text: "Nice Start!", emoji: "🥤" };
// //     if (percentage < 50) return { text: "Keep It Up!", emoji: "💦" };
// //     if (percentage < 75) return { text: "Great Progress!", emoji: "🌊" };
// //     if (percentage < 95) return { text: "Almost There!", emoji: "🏊" };
// //     return { text: "Goal Smashed!", emoji: "🎉" };
// //   };

// //   const motivationalContent = getMotivationalContent();

// //   return (
// //     <Modal visible={visible} transparent animationType="none">
// //       <StatusBar backgroundColor="rgba(0, 0, 0, 0.6)" barStyle="light-content" />
// //       <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
// //         <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={closeModal} />
        
// //         <Animated.View style={[
// //           styles.modalContent,
// //           { 
// //             backgroundColor: colors.card,
// //             transform: [{ translateY: slideAnim }],
// //             borderColor: colors.border
// //           }
// //         ]}>
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.header}>
// //             <Text style={[styles.title, { color: colors.text }]}>Hydration</Text>
// //             <TouchableOpacity onPress={openSettings}>
// //               <Ionicons name="settings-outline" size={20} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.progressContainer}>
// //             <LinearGradient
// //               colors={isDarkMode 
// //                 ? ['rgba(255, 149, 0, 0.1)', 'rgba(0, 0, 0, 0)'] 
// //                 : ['rgba(99, 102, 241, 0.1)', 'rgba(255, 255, 255, 0)']}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //               style={styles.progressGradient}
// //             >
// //               <View style={styles.waterVisualization}>
// //                 <View style={[styles.waterContainer, { borderColor: colors.border }]}>
// //                   <Animated.View style={[
// //                     styles.waterFill,
// //                     { height: `${getProgressPercentage()}%` }
// //                   ]}>
// //                     <LinearGradient
// //                       colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //                       style={StyleSheet.absoluteFill}
// //                     />
// //                   </Animated.View>
// //                   <Animated.View style={[
// //                     styles.rippleEffect,
// //                     {
// //                       transform: [{ scale: rippleScale }],
// //                       opacity: rippleOpacity,
// //                       backgroundColor: isDarkMode ? '#FF9500' : '#6366F1',
// //                     }
// //                   ]} />
// //                   <Text style={styles.waterEmoji}>{motivationalContent.emoji}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.progressInfo}>
// //                 <Text style={[styles.motivationalText, { color: colors.text }]}>
// //                   {motivationalContent.text}
// //                 </Text>
// //                 <Text style={[styles.progressMetrics, { color: colors.text }]}>
// //                   {formatAmount(waterAmount)} / {formatGoal()}
// //                 </Text>
// //                 <View style={styles.progressBar}>
// //                   <Animated.View style={[
// //                     styles.progressFill,
// //                     { 
// //                       width: progressAnim.interpolate({
// //                         inputRange: [0, 1],
// //                         outputRange: ['0%', '100%'],
// //                       }),
// //                       backgroundColor: isDarkMode ? '#FF9500' : '#6366F1'
// //                     }
// //                   ]} />
// //                 </View>
// //               </View>
// //             </LinearGradient>
// //           </View>

// //           <View style={styles.glassSelection}>
// //             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.glassOptions}>
// //               {glassOptions.map((glass, index) => (
// //                 <TouchableOpacity
// //                   key={glass.id}
// //                   style={[
// //                     styles.glassOption,
// //                     { 
// //                       backgroundColor: index === selectedGlassIndex ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setSelectedGlassIndex(index)}
// //                 >
// //                   <MaterialCommunityIcons 
// //                     name={glass.icon as any} 
// //                     size={24} 
// //                     color={index === selectedGlassIndex ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.text} 
// //                   />
// //                   <Text style={[styles.glassName, { color: colors.text }]}>{glass.name}</Text>
// //                   <Text style={[styles.glassVolume, { color: colors.secondaryText }]}>
// //                     {unitType === 'ml' ? `${glass.ml} ml` : 
// //                      unitType === 'oz' ? `${glass.oz} oz` : 
// //                      `${(glass.ml / 250).toFixed(1)} cups`}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>

// //             <View style={styles.quantitySelector}>
// //               <TouchableOpacity 
// //                 style={[styles.quantityButton, { borderColor: colors.border }]} 
// //                 onPress={() => setGlassQuantity(prev => Math.max(1, prev - 1))}
// //               >
// //                 <Ionicons name="remove" size={20} color={colors.text} />
// //               </TouchableOpacity>
// //               <Text style={[styles.quantityText, { color: colors.text }]}>{glassQuantity}</Text>
// //               <TouchableOpacity 
// //                 style={[styles.quantityButton, { borderColor: colors.border }]} 
// //                 onPress={() => setGlassQuantity(prev => prev + 1)}
// //               >
// //                 <Ionicons name="add" size={20} color={colors.text} />
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
// //             <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
// //               <LinearGradient
// //                 colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //                 style={StyleSheet.absoluteFill}
// //                 start={{ x: 0, y: 0 }}
// //                 end={{ x: 1, y: 1 }}
// //               />
// //               <Text style={styles.addButtonText}>Add Water</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         </Animated.View>

// //         <Animated.View style={[
// //           styles.settingsPanel,
// //           { 
// //             backgroundColor: colors.card,
// //             transform: [{ translateY: settingsSlideAnim }],
// //             borderColor: colors.border
// //           }
// //         ]}>
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.settingsHeader}>
// //             <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
// //             <TouchableOpacity onPress={closeSettings}>
// //               <Ionicons name="close" size={20} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Units</Text>
// //             <View style={styles.unitsContainer}>
// //               {(['ml', 'oz', 'cups'] as UnitType[]).map(unit => (
// //                 <TouchableOpacity
// //                   key={unit}
// //                   style={[
// //                     styles.unitOption,
// //                     { 
// //                       backgroundColor: unitType === unit ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setUnitType(unit)}
// //                 >
// //                   <Text style={[styles.unitText, { color: unitType === unit ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.text }]}>
// //                     {unit.toUpperCase()}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Goal</Text>
// //             <View style={styles.goalContainer}>
// //               <TouchableOpacity 
// //                 style={[styles.goalButton, { borderColor: colors.border }]} 
// //                 onPress={() => setWaterGoal(prev => Math.max(100, prev - 100))}
// //               >
// //                 <Ionicons name="remove" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
// //               </TouchableOpacity>
// //               <Text style={[styles.goalText, { color: colors.text }]}>
// //                 {unitType === 'ml' ? waterGoal : 
// //                  unitType === 'oz' ? (waterGoal / 29.574).toFixed(1) : 
// //                  (waterGoal / 250).toFixed(1)} {unitType}
// //               </Text>
// //               <TouchableOpacity 
// //                 style={[styles.goalButton, { borderColor: colors.border }]} 
// //                 onPress={() => setWaterGoal(prev => prev + 100)}
// //               >
// //                 <Ionicons name="add" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
// //               </TouchableOpacity>
// //             </View>
// //             <View style={styles.presetGoals}>
// //               {[1500, 2000, 2500, 3000].map(goal => (
// //                 <TouchableOpacity
// //                   key={goal}
// //                   style={[
// //                     styles.presetGoal,
// //                     { 
// //                       backgroundColor: waterGoal === goal ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setWaterGoal(goal)}
// //                 >
// //                   <Text style={[styles.presetGoalText, { color: colors.text }]}>{goal / 1000}L</Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <TouchableOpacity style={styles.applyButton} onPress={closeSettings}>
// //             <LinearGradient
// //               colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //               style={StyleSheet.absoluteFill}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //             />
// //             <Text style={styles.applyButtonText}>Apply</Text>
// //           </TouchableOpacity>
// //         </Animated.View>
// //       </Animated.View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.6)',
// //     justifyContent: 'flex-end',
// //   },
// //   dismissArea: {
// //     flex: 1,
// //   },
// //   modalContent: {
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 5,
// //   },
// //   handleBarContainer: {
// //     alignItems: 'center',
// //     paddingVertical: 8,
// //   },
// //   handleBar: {
// //     width: 40,
// //     height: 4,
// //     borderRadius: 2,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: '700',
// //   },
// //   progressContainer: {
// //     borderRadius: 16,
// //     overflow: 'hidden',
// //     marginBottom: 16,
// //   },
// //   progressGradient: {
// //     padding: 16,
// //   },
// //   waterVisualization: {
// //     alignItems: 'center',
// //     marginRight: 16,
// //   },
// //   waterContainer: {
// //     width: 80,
// //     height: 120,
// //     borderRadius: 16,
// //     borderWidth: 2,
// //     overflow: 'hidden',
// //     justifyContent: 'flex-end',
// //     position: 'relative',
// //   },
// //   waterFill: {
// //     position: 'absolute',
// //     bottom: 0,
// //     width: '100%',
// //   },
// //   rippleEffect: {
// //     position: 'absolute',
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     bottom: '50%',
// //     alignSelf: 'center',
// //   },
// //   waterEmoji: {
// //     fontSize: 24,
// //     position: 'absolute',
// //     top: '50%',
// //     transform: [{ translateY: -12 }],
// //   },
// //   progressInfo: {
// //     flex: 1,
// //   },
// //   motivationalText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 8,
// //   },
// //   progressMetrics: {
// //     fontSize: 14,
// //     marginBottom: 8,
// //   },
// //   progressBar: {
// //     height: 6,
// //     backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //     borderRadius: 3,
// //     overflow: 'hidden',
// //   },
// //   progressFill: {
// //     height: '100%',
// //     borderRadius: 3,
// //   },
// //   glassSelection: {
// //     marginBottom: 16,
// //   },
// //   glassOptions: {
// //     paddingVertical: 8,
// //   },
// //   glassOption: {
// //     width: 80,
// //     padding: 12,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //     marginRight: 12,
// //   },
// //   glassName: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     marginTop: 4,
// //   },
// //   glassVolume: {
// //     fontSize: 12,
// //     marginTop: 2,
// //   },
// //   quantitySelector: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: 12,
// //   },
// //   quantityButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   quantityText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginHorizontal: 16,
// //   },
// //   addButton: {
// //     borderRadius: 12,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   addButtonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   settingsPanel: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 5,
// //   },
// //   settingsHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   settingsSection: {
// //     marginBottom: 16,
// //   },
// //   settingTitle: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 8,
// //   },
// //   unitsContainer: {
// //     flexDirection: 'row',
// //     gap: 8,
// //   },
// //   unitOption: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //   },
// //   unitText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //   },
// //   goalContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: 12,
// //   },
// //   goalButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   goalText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   presetGoals: {
// //     flexDirection: 'row',
// //     gap: 8,
// //   },
// //   presetGoal: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //   },
// //   presetGoalText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //   },
// //   applyButton: {
// //     borderRadius: 12,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   applyButtonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// // });

// // export default WaterModal;
// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Animated,
// //   Easing,
// //   Dimensions,
// //   StatusBar,
// //   ScrollView,
// //   Platform,
// // } from 'react-native';
// // import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// // import * as Haptics from 'expo-haptics';

// // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // interface GlassOption {
// //   id: string;
// //   name: string;
// //   icon: string;
// //   ml: number;
// //   oz: number;
// // }

// // type UnitType = 'ml' | 'oz' | 'cups';

// // interface WaterModalProps {
// //   visible: boolean;
// //   onClose: () => void;
// //   initialValue?: number;
// //   onSave?: (data: { amount: number; unit: UnitType; goal: number }) => void;
// // }

// // const WaterModal: React.FC<WaterModalProps> = ({
// //   visible,
// //   onClose,
// //   initialValue = 0,
// //   onSave,
// // }) => {
// //   const { isDarkMode } = useTheme();
// //   const colors = isDarkMode ? darkTheme : lightTheme;

// //   const glassOptions: GlassOption[] = [
// //     { id: 'small', name: 'Small', icon: 'cup', ml: 150, oz: 5 },
// //     { id: 'medium', name: 'Medium', icon: 'glass-mug-variant', ml: 250, oz: 8 },
// //     { id: 'large', name: 'Large', icon: 'glass-tulip', ml: 350, oz: 12 },
// //     { id: 'bottle', name: 'Bottle', icon: 'bottle-soda', ml: 500, oz: 17 },
// //   ];

// //   const [selectedGlassIndex, setSelectedGlassIndex] = useState(1);
// //   const [glassQuantity, setGlassQuantity] = useState(1);
// //   const [waterAmount, setWaterAmount] = useState(initialValue);
// //   const [unitType, setUnitType] = useState<UnitType>('ml');
// //   const [waterGoal, setWaterGoal] = useState(2000);
// //   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

// //   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const progressAnim = useRef(new Animated.Value(0)).current;
// //   const settingsSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const waterRippleAnim = useRef(new Animated.Value(0)).current;
// //   const addButtonScale = useRef(new Animated.Value(1)).current;

// //   const getProgressPercentage = () => Math.min((waterAmount / waterGoal) * 100, 100);

// //   const formatAmount = (amount: number) => {
// //     switch (unitType) {
// //       case 'ml': return `${amount} ml`;
// //       case 'oz': return `${(amount / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(amount / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const formatGoal = () => {
// //     switch (unitType) {
// //       case 'ml': return `${waterGoal} ml`;
// //       case 'oz': return `${(waterGoal / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(waterGoal / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const getSelectedGlassVolume = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     switch (unitType) {
// //       case 'ml': return selectedGlass.ml;
// //       case 'oz': return selectedGlass.oz;
// //       case 'cups': return selectedGlass.ml / 250;
// //     }
// //   };

// //   useEffect(() => {
// //     if (visible) {
// //       Animated.parallel([
// //         Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
// //         Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
// //       ]).start();
// //     }
// //   }, [visible]);

// //   useEffect(() => {
// //     Animated.timing(progressAnim, {
// //       toValue: getProgressPercentage() / 100,
// //       duration: 600,
// //       useNativeDriver: false,
// //       easing: Easing.out(Easing.bezier(0.25, 0.1, 0.25, 1)),
// //     }).start();
// //   }, [waterAmount, waterGoal]);

// //   const closeModal = () => {
// //     if (isSettingsOpen) {
// //       closeSettings();
// //       return;
// //     }
// //     Animated.parallel([
// //       Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
// //       Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }),
// //     ]).start(() => {
// //       if (onSave) onSave({ amount: waterAmount, unit: unitType, goal: waterGoal });
// //       onClose();
// //     });
// //   };

// //   const openSettings = () => {
// //     Animated.spring(settingsSlideAnim, {
// //       toValue: 0,
// //       tension: 80,
// //       friction: 12,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(true));
// //   };

// //   const closeSettings = () => {
// //     Animated.timing(settingsSlideAnim, {
// //       toValue: SCREEN_HEIGHT,
// //       duration: 300,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(false));
// //   };

// //   const handleAdd = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     const addAmount = unitType === 'ml' ? selectedGlass.ml :
// //                      unitType === 'oz' ? selectedGlass.oz :
// //                      selectedGlass.ml / 250;
// //     const mlEquivalent = unitType === 'ml' ? addAmount :
// //                         unitType === 'oz' ? addAmount * 29.574 :
// //                         addAmount * 250;
// //     setWaterAmount(prev => prev + mlEquivalent * glassQuantity);
// //     triggerWaterRipple();
// //     animateAddButton();
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //   };

// //   const triggerWaterRipple = () => {
// //     waterRippleAnim.setValue(0);
// //     Animated.timing(waterRippleAnim, {
// //       toValue: 1,
// //       duration: 600,
// //       useNativeDriver: true,
// //       easing: Easing.out(Easing.ease),
// //     }).start();
// //   };

// //   const animateAddButton = () => {
// //     addButtonScale.setValue(1);
// //     Animated.sequence([
// //       Animated.timing(addButtonScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
// //       Animated.timing(addButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
// //     ]).start();
// //   };

// //   const width = (progression: number) => {
// //     return progressAnim.interpolate({
// //       inputRange: [0, 1],
// //       outputRange: ['0%', '100%'],
// //     });
// //   };

// //   const rippleScale = waterRippleAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0.5, 2],
// //   });

// //   const rippleOpacity = waterRippleAnim.interpolate({
// //     inputRange: [0, 0.8, 1],
// //     outputRange: [0.5, 0.2, 0],
// //   });

// //   const getMotivationalContent = () => {
// //     const percentage = getProgressPercentage();
// //     if (percentage === 0) return { text: "Start Hydrating!", emoji: "💧" };
// //     if (percentage < 25) return { text: "Nice Start!", emoji: "🥤" };
// //     if (percentage < 50) return { text: "Keep It Up!", emoji: "💦" };
// //     if (percentage < 75) return { text: "Great Progress!", emoji: "🌊" };
// //     if (percentage < 95) return { text: "Almost There!", emoji: "🏊" };
// //     return { text: "Goal Smashed!", emoji: "🎉" };
// //   };

// //   const motivationalContent = getMotivationalContent();

// //   return (
// //     <Modal visible={visible} transparent animationType="none">
// //       <StatusBar backgroundColor="rgba(0, 0, 0, 0.6)" barStyle="light-content" />
// //       <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
// //         <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={closeModal} />
        
// //         <Animated.View style={[
// //           styles.modalContent,
// //           { 
// //             backgroundColor: colors.card,
// //             transform: [{ translateY: slideAnim }],
// //             borderColor: colors.border
// //           }
// //         ]}>
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.header}>
// //             <Text style={[styles.title, { color: colors.text }]}>Hydration</Text>
// //             <TouchableOpacity onPress={openSettings}>
// //               <Ionicons name="settings-outline" size={20} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.progressContainer}>
// //             <LinearGradient
// //               colors={isDarkMode 
// //                 ? ['rgba(255, 149, 0, 0.1)', 'rgba(0, 0, 0, 0)'] 
// //                 : ['rgba(99, 102, 241, 0.1)', 'rgba(255, 255, 255, 0)']}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //               style={styles.progressGradient}
// //             >
// //               <View style={styles.waterVisualization}>
// //                 <View style={[styles.waterContainer, { borderColor: colors.border }]}>
// //                   <Animated.View style={[
// //                     styles.waterFill,
// //                     { height: `${getProgressPercentage()}%` }
// //                   ]}>
// //                     <LinearGradient
// //                       colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //                       style={StyleSheet.absoluteFill}
// //                     />
// //                   </Animated.View>
// //                   <Animated.View style={[
// //                     styles.rippleEffect,
// //                     {
// //                       transform: [{ scale: rippleScale }],
// //                       opacity: rippleOpacity,
// //                       backgroundColor: isDarkMode ? '#FF9500' : '#6366F1',
// //                     }
// //                   ]} />
// //                   <Text style={styles.waterEmoji}>{motivationalContent.emoji}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.progressInfo}>
// //                 <Text style={[styles.motivationalText, { color: colors.text }]}>
// //                   {motivationalContent.text}
// //                 </Text>
// //                 <Text style={[styles.progressMetrics, { color: colors.text }]}>
// //                   {formatAmount(waterAmount)} / {formatGoal()}
// //                 </Text>
// //                 <View style={styles.progressBar}>
// //                   <Animated.View style={[
// //                     styles.progressFill,
// //                     { 
// //                       width: progressAnim.interpolate({
// //                         inputRange: [0, 1],
// //                         outputRange: ['0%', '100%'],
// //                       }),
// //                       backgroundColor: isDarkMode ? '#FF9500' : '#6366F1'
// //                     }
// //                   ]} />
// //                 </View>
// //               </View>
// //             </LinearGradient>
// //           </View>

// //           <View style={styles.glassSelection}>
// //             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.glassOptions}>
// //               {glassOptions.map((glass, index) => (
// //                 <TouchableOpacity
// //                   key={glass.id}
// //                   style={[
// //                     styles.glassOption,
// //                     { 
// //                       backgroundColor: index === selectedGlassIndex ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setSelectedGlassIndex(index)}
// //                 >
// //                   <MaterialCommunityIcons 
// //                     name={glass.icon as any} 
// //                     size={24} 
// //                     color={index === selectedGlassIndex ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.text} 
// //                   />
// //                   <Text style={[styles.glassName, { color: colors.text }]}>{glass.name}</Text>
// //                   <Text style={[styles.glassVolume, { color: colors.secondaryText }]}>
// //                     {unitType === 'ml' ? `${glass.ml} ml` : 
// //                      unitType === 'oz' ? `${glass.oz} oz` : 
// //                      `${(glass.ml / 250).toFixed(1)} cups`}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>

// //             <View style={styles.quantitySelector}>
// //               <TouchableOpacity 
// //                 style={[styles.quantityButton, { borderColor: colors.border }]} 
// //                 onPress={() => setGlassQuantity(prev => Math.max(1, prev - 1))}
// //               >
// //                 <Ionicons name="remove" size={20} color={colors.text} />
// //               </TouchableOpacity>
// //               <Text style={[styles.quantityText, { color: colors.text }]}>{glassQuantity}</Text>
// //               <TouchableOpacity 
// //                 style={[styles.quantityButton, { borderColor: colors.border }]} 
// //                 onPress={() => setGlassQuantity(prev => prev + 1)}
// //               >
// //                 <Ionicons name="add" size={20} color={colors.text} />
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
// //             <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
// //               <LinearGradient
// //                 colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //                 style={StyleSheet.absoluteFill}
// //                 start={{ x: 0, y: 0 }}
// //                 end={{ x: 1, y: 1 }}
// //               />
// //               <Text style={styles.addButtonText}>Add Water</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         </Animated.View>

// //         <Animated.View style={[
// //           styles.settingsPanel,
// //           { 
// //             backgroundColor: colors.card,
// //             transform: [{ translateY: settingsSlideAnim }],
// //             borderColor: colors.border
// //           }
// //         ]}>
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.settingsHeader}>
// //             <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
// //             <TouchableOpacity onPress={closeSettings}>
// //               <Ionicons name="close" size={20} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Units</Text>
// //             <View style={styles.unitsContainer}>
// //               {(['ml', 'oz', 'cups'] as UnitType[]).map(unit => (
// //                 <TouchableOpacity
// //                   key={unit}
// //                   style={[
// //                     styles.unitOption,
// //                     { 
// //                       backgroundColor: unitType === unit ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setUnitType(unit)}
// //                 >
// //                   <Text style={[styles.unitText, { color: unitType === unit ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.text }]}>
// //                     {unit.toUpperCase()}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Goal</Text>
// //             <View style={styles.goalContainer}>
// //               <TouchableOpacity 
// //                 style={[styles.goalButton, { borderColor: colors.border }]} 
// //                 onPress={() => setWaterGoal(prev => Math.max(100, prev - 100))}
// //               >
// //                 <Ionicons name="remove" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
// //               </TouchableOpacity>
// //               <Text style={[styles.goalText, { color: colors.text }]}>
// //                 {unitType === 'ml' ? waterGoal : 
// //                  unitType === 'oz' ? (waterGoal / 29.574).toFixed(1) : 
// //                  (waterGoal / 250).toFixed(1)} {unitType}
// //               </Text>
// //               <TouchableOpacity 
// //                 style={[styles.goalButton, { borderColor: colors.border }]} 
// //                 onPress={() => setWaterGoal(prev => prev + 100)}
// //               >
// //                 <Ionicons name="add" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
// //               </TouchableOpacity>
// //             </View>
// //             <View style={styles.presetGoals}>
// //               {[1500, 2000, 2500, 3000].map(goal => (
// //                 <TouchableOpacity
// //                   key={goal}
// //                   style={[
// //                     styles.presetGoal,
// //                     { 
// //                       backgroundColor: waterGoal === goal ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setWaterGoal(goal)}
// //                 >
// //                   <Text style={[styles.presetGoalText, { color: colors.text }]}>{goal / 1000}L</Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <TouchableOpacity style={styles.applyButton} onPress={closeSettings}>
// //             <LinearGradient
// //               colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //               style={StyleSheet.absoluteFill}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //             />
// //             <Text style={styles.applyButtonText}>Apply</Text>
// //           </TouchableOpacity>
// //         </Animated.View>
// //       </Animated.View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.6)',
// //     justifyContent: 'flex-end',
// //   },
// //   dismissArea: {
// //     flex: 1,
// //   },
// //   modalContent: {
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 5,
// //   },
// //   handleBarContainer: {
// //     alignItems: 'center',
// //     paddingVertical: 8,
// //   },
// //   handleBar: {
// //     width: 40,
// //     height: 4,
// //     borderRadius: 2,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: '700',
// //   },
// //   progressContainer: {
// //     borderRadius: 16,
// //     overflow: 'hidden',
// //     marginBottom: 16,
// //   },
// //   progressGradient: {
// //     padding: 16,
// //   },
// //   waterVisualization: {
// //     alignItems: 'center',
// //     marginRight: 16,
// //   },
// //   waterContainer: {
// //     width: 80,
// //     height: 120,
// //     borderRadius: 16,
// //     borderWidth: 2,
// //     overflow: 'hidden',
// //     justifyContent: 'flex-end',
// //     position: 'relative',
// //   },
// //   waterFill: {
// //     position: 'absolute',
// //     bottom: 0,
// //     width: '100%',
// //   },
// //   rippleEffect: {
// //     position: 'absolute',
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     bottom: '50%',
// //     alignSelf: 'center',
// //   },
// //   waterEmoji: {
// //     fontSize: 24,
// //     position: 'absolute',
// //     top: '50%',
// //     transform: [{ translateY: -12 }],
// //   },
// //   progressInfo: {
// //     flex: 1,
// //   },
// //   motivationalText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 8,
// //   },
// //   progressMetrics: {
// //     fontSize: 14,
// //     marginBottom: 8,
// //   },
// //   progressBar: {
// //     height: 6,
// //     backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //     borderRadius: 3,
// //     overflow: 'hidden',
// //   },
// //   progressFill: {
// //     height: '100%',
// //     borderRadius: 3,
// //   },
// //   glassSelection: {
// //     marginBottom: 16,
// //   },
// //   glassOptions: {
// //     paddingVertical: 8,
// //   },
// //   glassOption: {
// //     width: 80,
// //     padding: 12,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //     marginRight: 12,
// //   },
// //   glassName: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     marginTop: 4,
// //   },
// //   glassVolume: {
// //     fontSize: 12,
// //     marginTop: 2,
// //   },
// //   quantitySelector: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: 12,
// //   },
// //   quantityButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   quantityText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginHorizontal: 16,
// //   },
// //   addButton: {
// //     borderRadius: 12,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   addButtonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   settingsPanel: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 5,
// //   },
// //   settingsHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   settingsSection: {
// //     marginBottom: 16,
// //   },
// //   settingTitle: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 8,
// //   },
// //   unitsContainer: {
// //     flexDirection: 'row',
// //     gap: 8,
// //   },
// //   unitOption: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //   },
// //   unitText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //   },
// //   goalContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: 12,
// //   },
// //   goalButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   goalText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   presetGoals: {
// //     flexDirection: 'row',
// //     gap: 8,
// //   },
// //   presetGoal: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //   },
// //   presetGoalText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //   },
// //   applyButton: {
// //     borderRadius: 12,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   applyButtonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// // });

// // export default WaterModal;


// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Animated,
// //   Easing,
// //   Dimensions,
// //   StatusBar,
// //   ScrollView,
// //   Platform,
// // } from 'react-native';
// // import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// // import * as Haptics from 'expo-haptics';

// // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // interface GlassOption {
// //   id: string;
// //   name: string;
// //   icon: string;
// //   ml: number;
// //   oz: number;
// // }

// // type UnitType = 'ml' | 'oz' | 'cups';

// // interface WaterModalProps {
// //   visible: boolean;
// //   onClose: () => void;
// //   initialValue?: number;
// //   onSave?: (data: { amount: number; unit: UnitType; goal: number }) => void;
// // }

// // const WaterModal: React.FC<WaterModalProps> = ({
// //   visible,
// //   onClose,
// //   initialValue = 0,
// //   onSave,
// // }) => {
// //   const { isDarkMode } = useTheme();
// //   const colors = isDarkMode ? darkTheme : lightTheme;

// //   const glassOptions: GlassOption[] = [
// //     { id: 'small', name: 'Small', icon: 'cup', ml: 150, oz: 5 },
// //     { id: 'medium', name: 'Medium', icon: 'glass-mug-variant', ml: 250, oz: 8 },
// //     { id: 'large', name: 'Large', icon: 'glass-tulip', ml: 350, oz: 12 },
// //     { id: 'bottle', name: 'Bottle', icon: 'bottle-soda', ml: 500, oz: 17 },
// //   ];

// //   const [selectedGlassIndex, setSelectedGlassIndex] = useState(1);
// //   const [glassQuantity, setGlassQuantity] = useState(1);
// //   const [waterAmount, setWaterAmount] = useState(initialValue);
// //   const [unitType, setUnitType] = useState<UnitType>('ml');
// //   const [waterGoal, setWaterGoal] = useState(2000);
// //   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

// //   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const progressAnim = useRef(new Animated.Value(0)).current;
// //   const settingsSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const waterRippleAnim = useRef(new Animated.Value(0)).current;
// //   const addButtonScale = useRef(new Animated.Value(1)).current;

// //   const getProgressPercentage = () => Math.min((waterAmount / waterGoal) * 100, 100);

// //   const formatAmount = (amount: number) => {
// //     switch (unitType) {
// //       case 'ml': return `${amount} ml`;
// //       case 'oz': return `${(amount / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(amount / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const formatGoal = () => {
// //     switch (unitType) {
// //       case 'ml': return `${waterGoal} ml`;
// //       case 'oz': return `${(waterGoal / 29.574).toFixed(1)} oz`;
// //       case 'cups': return `${(waterGoal / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   const getSelectedGlassVolume = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     switch (unitType) {
// //       case 'ml': return selectedGlass.ml;
// //       case 'oz': return selectedGlass.oz;
// //       case 'cups': return selectedGlass.ml / 250;
// //     }
// //   };

// //   useEffect(() => {
// //     if (visible) {
// //       Animated.parallel([
// //         Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
// //         Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
// //       ]).start();
// //     }
// //   }, [visible]);

// //   useEffect(() => {
// //     Animated.timing(progressAnim, {
// //       toValue: getProgressPercentage() / 100,
// //       duration: 600,
// //       useNativeDriver: false,
// //       easing: Easing.out(Easing.bezier(0.25, 0.1, 0.25, 1)),
// //     }).start();
// //   }, [waterAmount, waterGoal]);

// //   const closeModal = () => {
// //     if (isSettingsOpen) {
// //       closeSettings();
// //       return;
// //     }
// //     Animated.parallel([
// //       Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
// //       Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }),
// //     ]).start(() => {
// //       if (onSave) onSave({ amount: waterAmount, unit: unitType, goal: waterGoal });
// //       onClose();
// //     });
// //   };

// //   const openSettings = () => {
// //     Animated.spring(settingsSlideAnim, {
// //       toValue: 0,
// //       tension: 80,
// //       friction: 12,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(true));
// //   };

// //   const closeSettings = () => {
// //     Animated.timing(settingsSlideAnim, {
// //       toValue: SCREEN_HEIGHT,
// //       duration: 300,
// //       useNativeDriver: true,
// //     }).start(() => setIsSettingsOpen(false));
// //   };

// //   const handleAdd = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     const addAmount = unitType === 'ml' ? selectedGlass.ml :
// //                      unitType === 'oz' ? selectedGlass.oz :
// //                      selectedGlass.ml / 250;
// //     const mlEquivalent = unitType === 'ml' ? addAmount :
// //                         unitType === 'oz' ? addAmount * 29.574 :
// //                         addAmount * 250;
// //     setWaterAmount(prev => prev + mlEquivalent * glassQuantity);
// //     triggerWaterRipple();
// //     animateAddButton();
// //     if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //   };

// //   const triggerWaterRipple = () => {
// //     waterRippleAnim.setValue(0);
// //     Animated.timing(waterRippleAnim, {
// //       toValue: 1,
// //       duration: 600,
// //       useNativeDriver: true,
// //       easing: Easing.out(Easing.ease),
// //     }).start();
// //   };

// //   const animateAddButton = () => {
// //     addButtonScale.setValue(1);
// //     Animated.sequence([
// //       Animated.timing(addButtonScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
// //       Animated.timing(addButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
// //     ]).start();
// //   };

// //   const width = (progression: number) => {
// //     return progressAnim.interpolate({
// //       inputRange: [0, 1],
// //       outputRange: ['0%', '100%'],
// //     });
// //   };

// //   const rippleScale = waterRippleAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0.5, 2],
// //   });

// //   const rippleOpacity = waterRippleAnim.interpolate({
// //     inputRange: [0, 0.8, 1],
// //     outputRange: [0.5, 0.2, 0],
// //   });

// //   const getMotivationalContent = () => {
// //     const percentage = getProgressPercentage();
// //     if (percentage === 0) return { text: "Start Hydrating!", emoji: "💧" };
// //     if (percentage < 25) return { text: "Nice Start!", emoji: "🥤" };
// //     if (percentage < 50) return { text: "Keep It Up!", emoji: "💦" };
// //     if (percentage < 75) return { text: "Great Progress!", emoji: "🌊" };
// //     if (percentage < 95) return { text: "Almost There!", emoji: "🏊" };
// //     return { text: "Goal Smashed!", emoji: "🎉" };
// //   };

// //   const motivationalContent = getMotivationalContent();

// //   return (
// //     <Modal visible={visible} transparent animationType="none">
// //       <StatusBar backgroundColor="rgba(0, 0, 0, 0.6)" barStyle="light-content" />
// //       <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
// //         <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={closeModal} />
        
// //         <Animated.View style={[
// //           styles.modalContent,
// //           { 
// //             backgroundColor: colors.card,
// //             transform: [{ translateY: slideAnim }],
// //             borderColor: colors.border
// //           }
// //         ]}>
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.header}>
// //             <Text style={[styles.title, { color: colors.text }]}>Hydration</Text>
// //             <TouchableOpacity onPress={openSettings}>
// //               <Ionicons name="settings-outline" size={20} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.progressContainer}>
// //             <LinearGradient
// //               colors={isDarkMode 
// //                 ? ['rgba(255, 149, 0, 0.1)', 'rgba(0, 0, 0, 0)'] 
// //                 : ['rgba(99, 102, 241, 0.1)', 'rgba(255, 255, 255, 0)']}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //               style={styles.progressGradient}
// //             >
// //               <View style={styles.waterVisualization}>
// //                 <View style={[styles.waterContainer, { borderColor: colors.border }]}>
// //                   <Animated.View style={[
// //                     styles.waterFill,
// //                     { height: `${getProgressPercentage()}%` }
// //                   ]}>
// //                     <LinearGradient
// //                       colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //                       style={StyleSheet.absoluteFill}
// //                     />
// //                   </Animated.View>
// //                   <Animated.View style={[
// //                     styles.rippleEffect,
// //                     {
// //                       transform: [{ scale: rippleScale }],
// //                       opacity: rippleOpacity,
// //                       backgroundColor: isDarkMode ? '#FF9500' : '#6366F1',
// //                     }
// //                   ]} />
// //                   <Text style={styles.waterEmoji}>{motivationalContent.emoji}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.progressInfo}>
// //                 <Text style={[styles.motivationalText, { color: colors.text }]}>
// //                   {motivationalContent.text}
// //                 </Text>
// //                 <Text style={[styles.progressMetrics, { color: colors.text }]}>
// //                   {formatAmount(waterAmount)} / {formatGoal()}
// //                 </Text>
// //                 <View style={styles.progressBar}>
// //                   <Animated.View style={[
// //                     styles.progressFill,
// //                     { 
// //                       width: progressAnim.interpolate({
// //                         inputRange: [0, 1],
// //                         outputRange: ['0%', '100%'],
// //                       }),
// //                       backgroundColor: isDarkMode ? '#FF9500' : '#6366F1'
// //                     }
// //                   ]} />
// //                 </View>
// //               </View>
// //             </LinearGradient>
// //           </View>

// //           <View style={styles.glassSelection}>
// //             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.glassOptions}>
// //               {glassOptions.map((glass, index) => (
// //                 <TouchableOpacity
// //                   key={glass.id}
// //                   style={[
// //                     styles.glassOption,
// //                     { 
// //                       backgroundColor: index === selectedGlassIndex ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setSelectedGlassIndex(index)}
// //                 >
// //                   <MaterialCommunityIcons 
// //                     name={glass.icon as any} 
// //                     size={24} 
// //                     color={index === selectedGlassIndex ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.text} 
// //                   />
// //                   <Text style={[styles.glassName, { color: colors.text }]}>{glass.name}</Text>
// //                   <Text style={[styles.glassVolume, { color: colors.secondaryText }]}>
// //                     {unitType === 'ml' ? `${glass.ml} ml` : 
// //                      unitType === 'oz' ? `${glass.oz} oz` : 
// //                      `${(glass.ml / 250).toFixed(1)} cups`}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>

// //             <View style={styles.quantitySelector}>
// //               <TouchableOpacity 
// //                 style={[styles.quantityButton, { borderColor: colors.border }]} 
// //                 onPress={() => setGlassQuantity(prev => Math.max(1, prev - 1))}
// //               >
// //                 <Ionicons name="remove" size={20} color={colors.text} />
// //               </TouchableOpacity>
// //               <Text style={[styles.quantityText, { color: colors.text }]}>{glassQuantity}</Text>
// //               <TouchableOpacity 
// //                 style={[styles.quantityButton, { borderColor: colors.border }]} 
// //                 onPress={() => setGlassQuantity(prev => prev + 1)}
// //               >
// //                 <Ionicons name="add" size={20} color={colors.text} />
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
// //             <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
// //               <LinearGradient
// //                 colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //                 style={StyleSheet.absoluteFill}
// //                 start={{ x: 0, y: 0 }}
// //                 end={{ x: 1, y: 1 }}
// //               />
// //               <Text style={styles.addButtonText}>Add Water</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         </Animated.View>

// //         <Animated.View style={[
// //           styles.settingsPanel,
// //           { 
// //             backgroundColor: colors.card,
// //             transform: [{ translateY: settingsSlideAnim }],
// //             borderColor: colors.border
// //           }
// //         ]}>
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
// //           </View>

// //           <View style={styles.settingsHeader}>
// //             <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
// //             <TouchableOpacity onPress={closeSettings}>
// //               <Ionicons name="close" size={20} color={colors.text} />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Units</Text>
// //             <View style={styles.unitsContainer}>
// //               {(['ml', 'oz', 'cups'] as UnitType[]).map(unit => (
// //                 <TouchableOpacity
// //                   key={unit}
// //                   style={[
// //                     styles.unitOption,
// //                     { 
// //                       backgroundColor: unitType === unit ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setUnitType(unit)}
// //                 >
// //                   <Text style={[styles.unitText, { color: unitType === unit ? (isDarkMode ? '#FF9500' : '#6366F1') : colors.text }]}>
// //                     {unit.toUpperCase()}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Goal</Text>
// //             <View style={styles.goalContainer}>
// //               <TouchableOpacity 
// //                 style={[styles.goalButton, { borderColor: colors.border }]} 
// //                 onPress={() => setWaterGoal(prev => Math.max(100, prev - 100))}
// //               >
// //                 <Ionicons name="remove" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
// //               </TouchableOpacity>
// //               <Text style={[styles.goalText, { color: colors.text }]}>
// //                 {unitType === 'ml' ? waterGoal : 
// //                  unitType === 'oz' ? (waterGoal / 29.574).toFixed(1) : 
// //                  (waterGoal / 250).toFixed(1)} {unitType}
// //               </Text>
// //               <TouchableOpacity 
// //                 style={[styles.goalButton, { borderColor: colors.border }]} 
// //                 onPress={() => setWaterGoal(prev => prev + 100)}
// //               >
// //                 <Ionicons name="add" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
// //               </TouchableOpacity>
// //             </View>
// //             <View style={styles.presetGoals}>
// //               {[1500, 2000, 2500, 3000].map(goal => (
// //                 <TouchableOpacity
// //                   key={goal}
// //                   style={[
// //                     styles.presetGoal,
// //                     { 
// //                       backgroundColor: waterGoal === goal ? (isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.2)') : colors.card,
// //                       borderColor: colors.border
// //                     }
// //                   ]}
// //                   onPress={() => setWaterGoal(goal)}
// //                 >
// //                   <Text style={[styles.presetGoalText, { color: colors.text }]}>{goal / 1000}L</Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>

// //           <TouchableOpacity style={styles.applyButton} onPress={closeSettings}>
// //             <LinearGradient
// //               colors={isDarkMode ? ['#FF9500', '#FF6B00'] : ['#6366F1', '#4F46E5']}
// //               style={StyleSheet.absoluteFill}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 1 }}
// //             />
// //             <Text style={styles.applyButtonText}>Apply</Text>
// //           </TouchableOpacity>
// //         </Animated.View>
// //       </Animated.View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.6)',
// //     justifyContent: 'flex-end',
// //   },
// //   dismissArea: {
// //     flex: 1,
// //   },
// //   modalContent: {
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 5,
// //   },
// //   handleBarContainer: {
// //     alignItems: 'center',
// //     paddingVertical: 8,
// //   },
// //   handleBar: {
// //     width: 40,
// //     height: 4,
// //     borderRadius: 2,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: '700',
// //   },
// //   progressContainer: {
// //     borderRadius: 16,
// //     overflow: 'hidden',
// //     marginBottom: 16,
// //   },
// //   progressGradient: {
// //     padding: 16,
// //   },
// //   waterVisualization: {
// //     alignItems: 'center',
// //     marginRight: 16,
// //   },
// //   waterContainer: {
// //     width: 80,
// //     height: 120,
// //     borderRadius: 16,
// //     borderWidth: 2,
// //     overflow: 'hidden',
// //     justifyContent: 'flex-end',
// //     position: 'relative',
// //   },
// //   waterFill: {
// //     position: 'absolute',
// //     bottom: 0,
// //     width: '100%',
// //   },
// //   rippleEffect: {
// //     position: 'absolute',
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     bottom: '50%',
// //     alignSelf: 'center',
// //   },
// //   waterEmoji: {
// //     fontSize: 24,
// //     position: 'absolute',
// //     top: '50%',
// //     transform: [{ translateY: -12 }],
// //   },
// //   progressInfo: {
// //     flex: 1,
// //   },
// //   motivationalText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 8,
// //   },
// //   progressMetrics: {
// //     fontSize: 14,
// //     marginBottom: 8,
// //   },
// //   progressBar: {
// //     height: 6,
// //     backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //     borderRadius: 3,
// //     overflow: 'hidden',
// //   },
// //   progressFill: {
// //     height: '100%',
// //     borderRadius: 3,
// //   },
// //   glassSelection: {
// //     marginBottom: 16,
// //   },
// //   glassOptions: {
// //     paddingVertical: 8,
// //   },
// //   glassOption: {
// //     width: 80,
// //     padding: 12,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //     marginRight: 12,
// //   },
// //   glassName: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     marginTop: 4,
// //   },
// //   glassVolume: {
// //     fontSize: 12,
// //     marginTop: 2,
// //   },
// //   quantitySelector: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: 12,
// //   },
// //   quantityButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   quantityText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginHorizontal: 16,
// //   },
// //   addButton: {
// //     borderRadius: 12,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   addButtonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   settingsPanel: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderBottomWidth: 0,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 5,
// //   },
// //   settingsHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   settingsSection: {
// //     marginBottom: 16,
// //   },
// //   settingTitle: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 8,
// //   },
// //   unitsContainer: {
// //     flexDirection: 'row',
// //     gap: 8,
// //   },
// //   unitOption: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //   },
// //   unitText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //   },
// //   goalContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: 12,
// //   },
// //   goalButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     borderWidth: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   goalText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   presetGoals: {
// //     flexDirection: 'row',
// //     gap: 8,
// //   },
// //   presetGoal: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     alignItems: 'center',
// //   },
// //   presetGoalText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //   },
// //   applyButton: {
// //     borderRadius: 12,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   applyButtonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// // });

// // export default WaterModal;

// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Animated,
// //   Easing,
// //   Dimensions,
// //   StatusBar,
// //   ScrollView,
// //   PanResponder,
// //   Platform,
// //   Vibration,
// // } from 'react-native';
// // import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// // import * as Haptics from 'expo-haptics';

// // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // // Define standard glass sizes and their volumes
// // interface GlassOption {
// //   id: string;
// //   name: string;
// //   icon: string;
// //   ml: number;
// //   oz: number;
// // }

// // // Define unit type for tracking water consumption
// // type UnitType = 'ml' | 'oz' | 'cups';

// // interface WaterModalProps {
// //   visible: boolean;
// //   onClose: () => void;
// //   initialValue?: number;
// //   onSave?: (data: { amount: number; unit: UnitType; goal: number }) => void;
// // }

// // const WaterModal: React.FC<WaterModalProps> = ({
// //   visible,
// //   onClose,
// //   initialValue = 0,
// //   onSave,
// // }) => {
// //   const { isDarkMode } = useTheme();
// //   const colors = isDarkMode ? darkTheme : lightTheme;
  
// //   // Glass size options
// //   const glassOptions: GlassOption[] = [
// //     { id: 'small', name: 'Small', icon: 'cup', ml: 150, oz: 5 },
// //     { id: 'medium', name: 'Medium', icon: 'glass-mug-variant', ml: 250, oz: 8 },
// //     { id: 'large', name: 'Large', icon: 'glass-tulip', ml: 350, oz: 12 },
// //     { id: 'bottle', name: 'Bottle', icon: 'bottle-soda', ml: 500, oz: 17 },
// //     { id: 'xl-bottle', name: 'Large Bottle', icon: 'bottle-soda-classic', ml: 750, oz: 25 },
// //   ];

// //   // States
// //   const [selectedGlassIndex, setSelectedGlassIndex] = useState(1); // Default to medium glass
// //   const [waterAmount, setWaterAmount] = useState(initialValue);
// //   const [unitType, setUnitType] = useState<UnitType>('ml');
// //   const [waterGoal, setWaterGoal] = useState(2000); // Default 2000ml (2L)
// //   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
// //   const [isAddingWater, setIsAddingWater] = useState(false);
  
// //   // Animation values
// //   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const progressAnim = useRef(new Animated.Value(0)).current;
// //   const settingsSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
// //   const waterRippleAnim = useRef(new Animated.Value(0)).current;
// //   const waveAnim = useRef(new Animated.Value(0)).current;
// //   const addButtonScale = useRef(new Animated.Value(1)).current;
// //   const removeButtonScale = useRef(new Animated.Value(1)).current;
// //   const shakeAnim = useRef(new Animated.Value(0)).current;
  
// //   // Calculate progress percentage
// //   const getProgressPercentage = () => {
// //     return Math.min((waterAmount / waterGoal) * 100, 100);
// //   };
  
// //   // Format amount based on unit type
// //   const formatAmount = (amount: number) => {
// //     switch (unitType) {
// //       case 'ml':
// //         return `${amount} ml`;
// //       case 'oz':
// //         return `${(amount / 29.574).toFixed(1)} oz`;
// //       case 'cups':
// //         return `${(amount / 250).toFixed(1)} cups`;
// //     }
// //   };
  
// //   // Convert goal based on unit type
// //   const formatGoal = () => {
// //     switch (unitType) {
// //       case 'ml':
// //         return `${waterGoal} ml`;
// //       case 'oz':
// //         return `${(waterGoal / 29.574).toFixed(1)} oz`;
// //       case 'cups':
// //         return `${(waterGoal / 250).toFixed(1)} cups`;
// //     }
// //   };

// //   // Get selected glass volume based on unit type
// //   const getSelectedGlassVolume = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     switch (unitType) {
// //       case 'ml':
// //         return selectedGlass.ml;
// //       case 'oz':
// //         return selectedGlass.oz;
// //       case 'cups':
// //         return selectedGlass.ml / 250;
// //     }
// //   };
  
// //   // Pan responder for draggable modal
// //   const panResponder = useRef(
// //     PanResponder.create({
// //       onStartShouldSetPanResponder: () => true,
// //       onPanResponderMove: (_, gestureState) => {
// //         if (gestureState.dy > 0) {
// //           slideAnim.setValue(gestureState.dy);
// //         }
// //       },
// //       onPanResponderRelease: (_, gestureState) => {
// //         if (gestureState.dy > 100) {
// //           // Close the modal if dragged down more than 100
// //           closeModal();
// //         } else {
// //           // Snap back to position
// //           Animated.spring(slideAnim, {
// //             toValue: 0,
// //             useNativeDriver: true,
// //             bounciness: 10,
// //           }).start();
// //         }
// //       },
// //     })
// //   ).current;

// //   // Animations for water ripple effect
// //   const triggerWaterRipple = () => {
// //     waterRippleAnim.setValue(0);
// //     Animated.timing(waterRippleAnim, {
// //       toValue: 1,
// //       duration: 800,
// //       useNativeDriver: true,
// //       easing: Easing.out(Easing.ease),
// //     }).start();
// //   };

// //   // Animation for water waves
// //   useEffect(() => {
// //     Animated.loop(
// //       Animated.timing(waveAnim, {
// //         toValue: 1,
// //         duration: 2000,
// //         useNativeDriver: true,
// //         easing: Easing.inOut(Easing.sin),
// //       })
// //     ).start();
// //   }, []);

// //   // Show modal animation
// //   useEffect(() => {
// //     if (visible) {
// //       showModal();
// //     }
// //   }, [visible]);

// //   // Update progress animation
// //   useEffect(() => {
// //     Animated.timing(progressAnim, {
// //       toValue: getProgressPercentage() / 100,
// //       duration: 600,
// //       useNativeDriver: false,
// //       easing: Easing.out(Easing.bezier(0.25, 0.1, 0.25, 1)),
// //     }).start();
// //   }, [waterAmount, waterGoal]);

// //   // Show modal with animation
// //   const showModal = () => {
// //     slideAnim.setValue(SCREEN_HEIGHT);
// //     fadeAnim.setValue(0);
    
// //     Animated.parallel([
// //       Animated.timing(fadeAnim, {
// //         toValue: 1,
// //         duration: 300,
// //         useNativeDriver: true,
// //       }),
// //       Animated.spring(slideAnim, {
// //         toValue: 0,
// //         useNativeDriver: true,
// //         tension: 70,
// //         friction: 12,
// //       }),
// //     ]).start();
// //   };

// //   // Close modal with animation
// //   const closeModal = () => {
// //     if (isSettingsOpen) {
// //       closeSettings();
// //       return;
// //     }

// //     Animated.parallel([
// //       Animated.timing(fadeAnim, {
// //         toValue: 0,
// //         duration: 200,
// //         useNativeDriver: true,
// //       }),
// //       Animated.timing(slideAnim, {
// //         toValue: SCREEN_HEIGHT,
// //         duration: 300,
// //         useNativeDriver: true,
// //         easing: Easing.in(Easing.ease),
// //       }),
// //     ]).start(() => {
// //       if (onSave) {
// //         onSave({ amount: waterAmount, unit: unitType, goal: waterGoal });
// //       }
// //       onClose();
// //     });
// //   };

// //   // Open settings panel
// //   const openSettings = () => {
// //     settingsSlideAnim.setValue(SCREEN_HEIGHT);
    
// //     Animated.spring(settingsSlideAnim, {
// //       toValue: 0,
// //       useNativeDriver: true,
// //       tension: 70,
// //       friction: 12,
// //     }).start(() => {
// //       setIsSettingsOpen(true);
// //     });
// //   };

// //   // Close settings panel
// //   const closeSettings = () => {
// //     Animated.timing(settingsSlideAnim, {
// //       toValue: SCREEN_HEIGHT,
// //       duration: 300,
// //       useNativeDriver: true,
// //       easing: Easing.in(Easing.ease),
// //     }).start(() => {
// //       setIsSettingsOpen(false);
// //     });
// //   };

// //   // Handle adding water
// //   const handleAdd = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     let addAmount;
    
// //     switch (unitType) {
// //       case 'ml':
// //         addAmount = selectedGlass.ml;
// //         break;
// //       case 'oz':
// //         addAmount = selectedGlass.oz;
// //         break;
// //       case 'cups':
// //         addAmount = selectedGlass.ml / 250;
// //         break;
// //     }
    
// //     // Convert to ml for storage if not already in ml
// //     const mlEquivalent = unitType === 'ml' 
// //       ? addAmount 
// //       : unitType === 'oz' 
// //         ? addAmount * 29.574 
// //         : addAmount * 250;
    
// //     setWaterAmount(prev => prev + mlEquivalent);
    
// //     // Trigger animations and haptic feedback
// //     triggerWaterRipple();
// //     animateAddButton();
// //     triggerHapticFeedback('success');
    
// //     // Show water adding animation
// //     setIsAddingWater(true);
// //     setTimeout(() => setIsAddingWater(false), 800);
// //   };

// //   // Handle removing water
// //   const handleRemove = () => {
// //     const selectedGlass = glassOptions[selectedGlassIndex];
// //     let removeAmount;
    
// //     switch (unitType) {
// //       case 'ml':
// //         removeAmount = selectedGlass.ml;
// //         break;
// //       case 'oz':
// //         removeAmount = selectedGlass.oz;
// //         break;
// //       case 'cups':
// //         removeAmount = selectedGlass.ml / 250;
// //         break;
// //     }
    
// //     // Convert to ml for storage if not already in ml
// //     const mlEquivalent = unitType === 'ml' 
// //       ? removeAmount 
// //       : unitType === 'oz' 
// //         ? removeAmount * 29.574 
// //         : removeAmount * 250;
    
// //     if (waterAmount >= mlEquivalent) {
// //       setWaterAmount(prev => prev - mlEquivalent);
// //       animateRemoveButton();
// //       triggerHapticFeedback('warning');
// //     } else if (waterAmount > 0) {
// //       setWaterAmount(0);
// //       animateRemoveButton();
// //       triggerHapticFeedback('warning');
// //     } else {
// //       // Shake animation if already at zero
// //       shakeAnimation();
// //       triggerHapticFeedback('error');
// //     }
// //   };

// //   // Handle changing the unit type
// //   const handleUnitChange = (newUnit: UnitType) => {
// //     setUnitType(newUnit);
// //   };

// //   // Adjust water goal
// //   const adjustWaterGoal = (amount: number) => {
// //     let newGoal = waterGoal + amount;
// //     if (newGoal < 100) newGoal = 100; // Minimum goal
// //     setWaterGoal(newGoal);
// //   };

// //   // Trigger haptic feedback
// //   const triggerHapticFeedback = (type: 'success' | 'warning' | 'error') => {
// //     if (Platform.OS === 'ios') {
// //       switch (type) {
// //         case 'success':
// //           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// //           break;
// //         case 'warning':
// //           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
// //           break;
// //         case 'error':
// //           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
// //           break;
// //       }
// //     } else {
// //       // Android feedback
// //       Vibration.vibrate(80);
// //     }
// //   };

// //   // Animation for the add button
// //   const animateAddButton = () => {
// //     addButtonScale.setValue(1);
// //     Animated.sequence([
// //       Animated.timing(addButtonScale, {
// //         toValue: 1.3,
// //         duration: 150,
// //         useNativeDriver: true,
// //         easing: Easing.out(Easing.back(1.5)),
// //       }),
// //       Animated.timing(addButtonScale, {
// //         toValue: 1,
// //         duration: 150,
// //         useNativeDriver: true,
// //         easing: Easing.in(Easing.ease),
// //       }),
// //     ]).start();
// //   };

// //   // Animation for the remove button
// //   const animateRemoveButton = () => {
// //     removeButtonScale.setValue(1);
// //     Animated.sequence([
// //       Animated.timing(removeButtonScale, {
// //         toValue: 1.3,
// //         duration: 150,
// //         useNativeDriver: true,
// //         easing: Easing.out(Easing.back(1.5)),
// //       }),
// //       Animated.timing(removeButtonScale, {
// //         toValue: 1,
// //         duration: 150,
// //         useNativeDriver: true,
// //         easing: Easing.in(Easing.ease),
// //       }),
// //     ]).start();
// //   };

// //   // Shake animation for empty state
// //   const shakeAnimation = () => {
// //     shakeAnim.setValue(0);
// //     Animated.sequence([
// //       Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
// //       Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
// //       Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
// //       Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
// //       Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
// //     ]).start();
// //   };

// //   // Convert progress value to width for animation
// //   const width = progressAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: ['0%', '100%'],
// //   });

// //   // Ripple scale interpolation
// //   const rippleScale = waterRippleAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [0.5, 2.5],
// //   });

// //   const rippleOpacity = waterRippleAnim.interpolate({
// //     inputRange: [0, 0.8, 1],
// //     outputRange: [0.6, 0.2, 0],
// //   });

// //   // Wave animation interpolation
// //   const waveTranslate = waveAnim.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [-50, 50],
// //   });

// //   // Get motivation text and emoji based on progress
// //   const getMotivationalContent = () => {
// //     const percentage = getProgressPercentage();
    
// //     if (percentage === 0) return { text: "Time to hydrate!", emoji: "💧" };
// //     if (percentage < 25) return { text: "Good start!", emoji: "🥛" };
// //     if (percentage < 50) return { text: "Keep it going!", emoji: "🚰" };
// //     if (percentage < 75) return { text: "You're doing great!", emoji: "🌊" };
// //     if (percentage < 95) return { text: "Almost there!", emoji: "🏊‍♂️" };
// //     return { text: "Goal achieved! Awesome!", emoji: "🎉" };
// //   };

// //   const motivationalContent = getMotivationalContent();
  
// //   // Theme colors
// //   const primaryColor = isDarkMode ? '#4FACFE' : '#5E72EB';
// //   const secondaryColor = isDarkMode ? '#00F2FE' : '#FF9190';
// //   const accentColor = isDarkMode ? '#00F2FE' : '#4A6CF7';
// //   const backgroundColor = isDarkMode ? '#111827' : '#FFFFFF';
// //   const cardColor = isDarkMode ? '#1F2937' : '#F3F4F6';
// //   const textColor = isDarkMode ? '#F9FAFB' : '#1F2937';
// //   const subtextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
// //   const borderColor = isDarkMode ? '#374151' : '#E5E7EB';

// //   return (
// //     <Modal visible={visible} transparent animationType="none">
// //       <StatusBar backgroundColor="rgba(0, 0, 0, 0.6)" barStyle="light-content" />
      
// //       <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
// //         <TouchableOpacity 
// //           style={styles.dismissArea} 
// //           activeOpacity={1} 
// //           onPress={closeModal}
// //         />
        
// //         {/* Main Modal */}
// //         <Animated.View 
// //           style={[
// //             styles.modalContent,
// //             { 
// //               backgroundColor,
// //               transform: [{ translateY: slideAnim }],
// //               borderColor: borderColor,
// //             }
// //           ]}
// //         >
// //           {/* Handle Bar */}
// //           <View style={styles.handleBarContainer} {...panResponder.panHandlers}>
// //             <View style={[styles.handleBar, { backgroundColor: borderColor }]} />
// //           </View>
          
// //           {/* Header */}
// //           <View style={styles.header}>
// //             <TouchableOpacity 
// //               onPress={openSettings}
// //               style={styles.settingsButton}
// //             >
// //               <Ionicons name="settings-outline" size={24} color={textColor} />
// //             </TouchableOpacity>
            
// //             <Text style={[styles.title, { color: textColor }]}>Hydration Tracker</Text>
            
// //             <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
// //               <Ionicons name="close" size={24} color={textColor} />
// //             </TouchableOpacity>
// //           </View>
          
// //           {/* Water Visualization */}
// //           <View style={styles.waterVisualization}>
// //             <View style={[styles.waterContainer, { borderColor }]}>
// //               {/* Water fill animation */}
// //               <Animated.View 
// //                 style={[
// //                   styles.waterFill,
// //                   { 
// //                     height: `${getProgressPercentage()}%`,
// //                   }
// //                 ]}
// //               >
// //                 <LinearGradient
// //                   colors={[secondaryColor, primaryColor]}
// //                   style={StyleSheet.absoluteFill}
// //                   start={{ x: 0, y: 0 }}
// //                   end={{ x: 1, y: 1 }}
// //                 />
                
// //                 {/* Water wave effect */}
// //                 <Animated.View 
// //                   style={[
// //                     styles.waterWave,
// //                     { 
// //                       transform: [{ translateX: waveTranslate }],
// //                       backgroundColor: 'rgba(255,255,255,0.3)',
// //                     }
// //                   ]}
// //                 />
// //               </Animated.View>
              
// //               {/* Ripple effect when adding water */}
// //               {isAddingWater && (
// //                 <Animated.View
// //                   style={[
// //                     styles.rippleEffect,
// //                     {
// //                       transform: [{ scale: rippleScale }],
// //                       opacity: rippleOpacity,
// //                       backgroundColor: primaryColor,
// //                     }
// //                   ]}
// //                 />
// //               )}
              
// //               {/* Emoji for current progress */}
// //               <Text style={styles.waterEmoji}>{motivationalContent.emoji}</Text>
// //             </View>
// //           </View>
          
// //           {/* Progress Info */}
// //           <View style={styles.progressInfo}>
// //             <Text style={[styles.motivationalText, { color: textColor }]}>
// //               {motivationalContent.text}
// //             </Text>
            
// //             <Text style={[styles.progressMetrics, { color: textColor }]}>
// //               {formatAmount(waterAmount)} of {formatGoal()}
// //             </Text>
            
// //             <Text style={[styles.progressPercentage, { color: accentColor }]}>
// //               {Math.round(getProgressPercentage())}% Complete
// //             </Text>
// //           </View>
          
// //           {/* Progress Bar */}
// //           <View style={styles.progressBarContainer}>
// //             <View style={[styles.progressBackground, { backgroundColor: cardColor }]}>
// //               <Animated.View style={[styles.progressFill, { width }]}>
// //                 <LinearGradient
// //                   colors={[primaryColor, secondaryColor]}
// //                   start={{ x: 0, y: 0 }}
// //                   end={{ x: 1, y: 0 }}
// //                   style={StyleSheet.absoluteFill}
// //                 />
// //               </Animated.View>
// //             </View>
// //           </View>
          
// //           {/* Glass Size Selection */}
// //           <Text style={[styles.sectionTitle, { color: textColor }]}>Glass Size</Text>
// //           <ScrollView 
// //             horizontal 
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.glassOptionsContainer}
// //           >
// //             {glassOptions.map((glass, index) => (
// //               <TouchableOpacity
// //                 key={glass.id}
// //                 style={[
// //                   styles.glassOption,
// //                   { 
// //                     backgroundColor: index === selectedGlassIndex ? primaryColor : cardColor,
// //                     borderColor: borderColor,
// //                   }
// //                 ]}
// //                 onPress={() => setSelectedGlassIndex(index)}
// //               >
// //                 <MaterialCommunityIcons 
// //                   name={glass.icon as any} 
// //                   size={28} 
// //                   color={index === selectedGlassIndex ? '#FFFFFF' : textColor} 
// //                 />
// //                 <Text 
// //                   style={[
// //                     styles.glassName,
// //                     { color: index === selectedGlassIndex ? '#FFFFFF' : textColor }
// //                   ]}
// //                 >
// //                   {glass.name}
// //                 </Text>
// //                 <Text 
// //                   style={[
// //                     styles.glassVolume,
// //                     { color: index === selectedGlassIndex ? '#FFFFFF' : subtextColor }
// //                   ]}
// //                 >
// //                   {unitType === 'ml' ? `${glass.ml} ml` : 
// //                    unitType === 'oz' ? `${glass.oz} oz` : 
// //                    `${(glass.ml / 250).toFixed(1)} cups`}
// //                 </Text>
// //               </TouchableOpacity>
// //             ))}
// //           </ScrollView>
          
// //           {/* Add/Remove Buttons */}
// //           <View style={styles.actionButtonsContainer}>
// //             <Animated.View style={{ transform: [{ scale: removeButtonScale }] }}>
// //               <TouchableOpacity
// //                 style={[
// //                   styles.actionButton,
// //                   styles.removeButton,
// //                   { 
// //                     backgroundColor: cardColor,
// //                     borderColor: isDarkMode ? '#EF4444' : '#F87171',
// //                     transform: [{ translateX: shakeAnim }]
// //                   }
// //                 ]}
// //                 onPress={handleRemove}
// //               >
// //                 <Ionicons name="remove" size={32} color={isDarkMode ? '#EF4444' : '#F87171'} />
// //               </TouchableOpacity>
// //             </Animated.View>
            
// //             <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
// //               <TouchableOpacity
// //                 style={[
// //                   styles.actionButton,
// //                   styles.addButton,
// //                   { 
// //                     backgroundColor: primaryColor,
// //                     shadowColor: primaryColor,
// //                   }
// //                 ]}
// //                 onPress={handleAdd}
// //               >
// //                 <LinearGradient
// //                   colors={[primaryColor, secondaryColor]}
// //                   style={[StyleSheet.absoluteFill, { borderRadius: 35 }]}
// //                   start={{ x: 0, y: 0 }}
// //                   end={{ x: 1, y: 1 }}
// //                 />
// //                 <Ionicons name="add" size={32} color="#FFFFFF" />
// //               </TouchableOpacity>
// //             </Animated.View>
// //           </View>
// //         </Animated.View>
        
// //         {/* Settings Panel */}
// //         <Animated.View 
// //           style={[
// //             styles.settingsPanel,
// //             { 
// //               backgroundColor,
// //               transform: [{ translateY: settingsSlideAnim }],
// //               borderColor: borderColor,
// //             }
// //           ]}
// //         >
// //           <View style={styles.handleBarContainer}>
// //             <View style={[styles.handleBar, { backgroundColor: borderColor }]} />
// //           </View>
          
// //           <View style={styles.settingsHeader}>
// //             <Text style={[styles.title, { color: textColor }]}>Settings</Text>
// //             <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
// //               <Ionicons name="arrow-back" size={24} color={textColor} />
// //             </TouchableOpacity>
// //           </View>
          
// //           {/* Units Selection */}
// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: textColor }]}>Measurement Units</Text>
// //             <View style={styles.unitsContainer}>
// //               {(['ml', 'oz', 'cups'] as UnitType[]).map((unit) => (
// //                 <TouchableOpacity
// //                   key={unit}
// //                   style={[
// //                     styles.unitOption,
// //                     { 
// //                       backgroundColor: unitType === unit ? primaryColor : cardColor,
// //                       borderColor: borderColor,
// //                     }
// //                   ]}
// //                   onPress={() => handleUnitChange(unit)}
// //                 >
// //                   <Text 
// //                     style={{ 
// //                       color: unitType === unit ? '#FFFFFF' : textColor,
// //                       fontWeight: '600',
// //                     }}
// //                   >
// //                     {unit.toUpperCase()}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           </View>
          
// //           {/* Daily Goal Setting */}
// //           <View style={styles.settingsSection}>
// //             <Text style={[styles.settingTitle, { color: textColor }]}>Daily Goal</Text>
// //             <View style={[styles.goalAdjuster, { backgroundColor: cardColor, borderColor }]}>
// //               <TouchableOpacity 
// //                 style={styles.goalButton} 
// //                 onPress={() => adjustWaterGoal(-100)}
// //               >
// //                 <Ionicons name="remove" size={24} color={primaryColor} />
// //               </TouchableOpacity>
              
// //               <View style={styles.goalValueContainer}>
// //                 <Text style={[styles.goalValue, { color: textColor }]}>
// //                   {unitType === 'ml' ? waterGoal : 
// //                    unitType === 'oz' ? (waterGoal / 29.574).toFixed(1) : 
// //                    (waterGoal / 250).toFixed(1)}
// //                 </Text>
// //                 <Text style={[styles.goalUnit, { color: subtextColor }]}>
// //                   {unitType.toUpperCase()}
// //                 </Text>
// //               </View>
              
// //               <TouchableOpacity 
// //                 style={styles.goalButton} 
// //                 onPress={() => adjustWaterGoal(100)}
// //               >
// //                 <Ionicons name="add" size={24} color={primaryColor} />
// //               </TouchableOpacity>
// //             </View>
            
// //             {/* Common goals presets */}
// //             <View style={styles.presetGoalsContainer}>
// //               <TouchableOpacity 
// //                 style={[styles.presetGoal, { backgroundColor: cardColor, borderColor }]}
// //                 onPress={() => setWaterGoal(1500)}
// //               >
// //                 <Text style={{ color: textColor }}>1.5L</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity 
// //                 style={[styles.presetGoal, { backgroundColor: cardColor, borderColor }]}
// //                 onPress={() => setWaterGoal(2000)}
// //               >
// //                 <Text style={{ color: textColor }}>2L</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity 
// //                 style={[styles.presetGoal, { backgroundColor: cardColor, borderColor }]}
// //                 onPress={() => setWaterGoal(2500)}
// //               >
// //                 <Text style={{ color: textColor }}>2.5L</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity 
// //                 style={[styles.presetGoal, { backgroundColor: cardColor, borderColor }]}
// //                 onPress={() => setWaterGoal(3000)}
// //               >
// //                 <Text style={{ color: textColor }}>3L</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
          
// //           {/* Reset Progress */}
// //           <TouchableOpacity 
// //             style={[styles.resetButton, { borderColor: '#EF4444' }]}
// //             onPress={() => setWaterAmount(0)}
// //           >
// //             <Ionicons name="refresh" size={18} color="#EF4444" />
// //             <Text style={{ color: '#EF4444', marginLeft: 8, fontWeight: '600' }}>
// //               Reset Today's Progress
// //             </Text>
// //           </TouchableOpacity>
          
// //           {/* Apply Button */}
// //           <TouchableOpacity 
// //             style={[styles.applyButton]}
// //             onPress={closeSettings}
// //           >
// //             <LinearGradient
// //               colors={[primaryColor, secondaryColor]}
// //               style={StyleSheet.absoluteFill}
// //               start={{ x: 0, y: 0 }}
// //               end={{ x: 1, y: 0 }}
              
// //             />
// //             <Text style={styles.applyButtonText}>Apply Changes</Text>
// //           </TouchableOpacity>
// //         </Animated.View>
// //       </Animated.View>
// //     </Modal>
// //   );
// // };


// // const styles = StyleSheet.create({
// //     overlay: {
// //       flex: 1,
// //       backgroundColor: 'rgba(0,0,0,0.6)',
// //       justifyContent: 'flex-end',
// //     },
// //     dismissArea: {
// //       flex: 1,
// //     },
// //     modalContent: {
// //       borderTopLeftRadius: 28,
// //       borderTopRightRadius: 28,
// //       padding: 24,
// //       borderWidth: 1,
// //       borderBottomWidth: 0,
// //       shadowColor: "#000",
// //       shadowOffset: {
// //         width: 0,
// //         height: -5,
// //       },
// //       shadowOpacity: 0.1,
// //       shadowRadius: 10,
// //       elevation: 20,
// //     },
// //     handleBarContainer: {
// //       width: '100%',
// //       alignItems: 'center',
// //       paddingVertical: 12,
// //       marginTop: -8,
// //     },
// //     handleBar: {
// //       width: 40,
// //       height: 5,
// //       borderRadius: 3,
// //     },
// //     header: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       alignItems: 'center',
// //       marginBottom: 20,
// //     },
// //     title: {
// //       fontSize: 22,
// //       fontWeight: '700',
// //     },
// //     settingsButton: {
// //       padding: 8,
// //     },
// //     closeButton: {
// //       padding: 8,
// //     },
// //     waterVisualization: {
// //       alignItems: 'center',
// //       marginBottom: 24,
// //       height: 180,
// //     },
// //     waterContainer: {
// //       width: 120,
// //       height: 180,
// //       borderRadius: 20,
// //       borderWidth: 3,
// //       overflow: 'hidden',
// //       justifyContent: 'flex-end',
// //       alignItems: 'center',
// //       position: 'relative',
// //     },
// //     waterFill: {
// //       position: 'absolute',
// //       bottom: 0,
// //       width: '100%',
// //       borderTopLeftRadius: 10,
// //       borderTopRightRadius: 10,
// //       overflow: 'hidden',
// //     },
// //     waterWave: {
// //       position: 'absolute',
// //       top: -10,
// //       left: -50,
// //       width: 200,
// //       height: 20,
// //       borderRadius: 100,
// //     },
// //     waterEmoji: {
// //       fontSize: 32,
// //       position: 'absolute',
// //       top: '40%',
// //       zIndex: 10,
// //     },
// //     rippleEffect: {
// //       position: 'absolute',
// //       width: 50,
// //       height: 50,
// //       borderRadius: 25,
// //       bottom: '50%',
// //       alignSelf: 'center',
// //     },
// //     progressInfo: {
// //       alignItems: 'center',
// //       marginBottom: 16,
// //     },
// //     motivationalText: {
// //       fontSize: 18,
// //       fontWeight: '600',
// //       marginBottom: 8,
// //     },
// //     progressMetrics: {
// //       fontSize: 16,
// //       marginBottom: 4,
// //     },
// //     progressPercentage: {
// //       fontSize: 14,
// //       fontWeight: '600',
// //     },
// //     progressBarContainer: {
// //       width: '100%',
// //       marginBottom: 20,
// //     },
// //     progressBackground: {
// //       width: '100%',
// //       height: 12,
// //       borderRadius: 6,
// //       overflow: 'hidden',
// //     },
// //     progressFill: {
// //       height: '100%',
// //       borderRadius: 6,
// //     },
// //     sectionTitle: {
// //       fontSize: 16,
// //       fontWeight: '600',
// //       marginBottom: 12,
// //     },
// //     glassOptionsContainer: {
// //       paddingVertical: 8,
// //       paddingHorizontal: 4,
// //       marginBottom: 20,
// //     },
// //     glassOption: {
// //       width: 95,
// //       height: 95,
// //       borderRadius: 16,
// //       borderWidth: 1,
// //       padding: 12,
// //       marginRight: 12,
// //       alignItems: 'center',
// //       justifyContent: 'center',
// //     },
// //     glassName: {
// //       fontSize: 14,
// //       fontWeight: '600',
// //       marginTop: 8,
// //       textAlign: 'center',
// //     },
// //     glassVolume: {
// //       fontSize: 12,
// //       marginTop: 2,
// //       textAlign: 'center',
// //     },
// //     actionButtonsContainer: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       paddingHorizontal: 30,
// //       marginBottom: 20,
// //     },
// //     actionButton: {
// //       width: 70,
// //       height: 70,
// //       borderRadius: 35,
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //       shadowOffset: {
// //         width: 0,
// //         height: 4,
// //       },
// //       shadowOpacity: 0.3,
// //       shadowRadius: 6,
// //       elevation: 8,
// //     },
// //     removeButton: {
// //       borderWidth: 2,
// //     },
// //     addButton: {
// //       shadowColor: '#4FACFE',
// //     },
// //     settingsPanel: {
// //       position: 'absolute',
// //       bottom: 0,
// //       left: 0,
// //       right: 0,
// //       borderTopLeftRadius: 28,
// //       borderTopRightRadius: 28,
// //       padding: 24,
// //       borderWidth: 1,
// //       borderBottomWidth: 0,
// //       shadowColor: "#000",
// //       shadowOffset: {
// //         width: 0,
// //         height: -5,
// //       },
// //       shadowOpacity: 0.1,
// //       shadowRadius: 10,
// //       elevation: 20,
// //     },
// //     settingsHeader: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       alignItems: 'center',
// //       marginBottom: 24,
// //     },
// //     settingsSection: {
// //       marginBottom: 24,
// //     },
// //     settingTitle: {
// //       fontSize: 16,
// //       fontWeight: '600',
// //       marginBottom: 12,
// //     },
// //     unitsContainer: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       marginBottom: 8,
// //     },
// //     unitOption: {
// //       flex: 1,
// //       paddingVertical: 12,
// //       alignItems: 'center',
// //       justifyContent: 'center',
// //       borderRadius: 12,
// //       marginHorizontal: 5,
// //       borderWidth: 1,
// //     },
// //     goalAdjuster: {
// //       flexDirection: 'row',
// //       alignItems: 'center',
// //       borderRadius: 12,
// //       borderWidth: 1,
// //       overflow: 'hidden',
// //     },
// //     goalButton: {
// //       padding: 16,
// //       alignItems: 'center',
// //       justifyContent: 'center',
// //     },
// //     goalValueContainer: {
// //       flex: 1,
// //       flexDirection: 'row',
// //       justifyContent: 'center',
// //       alignItems: 'baseline',
// //     },
// //     goalValue: {
// //       fontSize: 24,
// //       fontWeight: '600',
// //     },
// //     goalUnit: {
// //       fontSize: 14,
// //       marginLeft: 4,
// //     },
// //     presetGoalsContainer: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       marginTop: 12,
// //     },
// //     presetGoal: {
// //       paddingVertical: 10,
// //       paddingHorizontal: 16,
// //       borderRadius: 10,
// //       borderWidth: 1,
// //     },
// //     resetButton: {
// //       flexDirection: 'row',
// //       alignItems: 'center',
// //       justifyContent: 'center',
// //       paddingVertical: 12,
// //       marginBottom: 16,
// //       borderWidth: 1,
// //       borderRadius: 12,
// //     },
// //     applyButton: {
// //       paddingVertical: 16,
// //       borderRadius: 12,
// //       alignItems: 'center',
// //       justifyContent: 'center',
// //       shadowColor: "#000",
// //       shadowOffset: {
// //         width: 0,
// //         height: 2,
// //       },
// //       shadowOpacity: 0.2,
// //       shadowRadius: 4,
// //       elevation: 5,
// //     },
// //     applyButtonText: {
// //       color: '#FFFFFF',
// //       fontWeight: '600',
// //       fontSize: 16,
// //     }
// //   });

// // export default WaterModal;