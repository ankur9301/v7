"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
  SafeAreaView,
  Animated,
} from "react-native"
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps"
import * as Location from "expo-location"
import { Pedometer } from "expo-sensors"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTheme, lightTheme, darkTheme } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
const { width, height } = Dimensions.get("window")

// Custom map style
const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#c8e6c9",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#c9c9c9",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#b2ebf2",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
]

// Dark map style
const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#212121",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#212121",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        color: "#757575",
      },
      {
        visibility: "simplified",
      },
    ],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "administrative.neighborhood",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.business",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#181818",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#1b5e20",
      },
      {
        lightness: 50,
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1b1b1b",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#2c2c2c",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#8a8a8a",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#373737",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#3c3c3c",
      },
    ],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [
      {
        color: "#4e4e4e",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "transit",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#000000",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#0288d1",
      },
      {
        lightness: 25,
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#3d3d3d",
      },
    ],
  },
]

function haversine(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371 // Earth radius in km
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Format time in MM:SS format
function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

// Convert km to miles
function kmToMiles(km: number) {
  return km * 0.621371
}

// Calculate calories burned based on steps and distance
function calculateCalories(steps: number, distanceKm: number): number {
  // Basic formula: ~100 calories per mile at moderate pace
  const caloriesFromDistance = distanceKm * 0.621371 * 100

  // Add calories from steps (rough estimate)
  const caloriesFromSteps = steps * 0.04

  // Average the two methods for a more balanced estimate
  return Math.round((caloriesFromDistance + caloriesFromSteps) / 2)
}

export default function JogTracker() {
  const { isDarkMode } = useTheme()
  const colors = isDarkMode ? darkTheme : lightTheme
  const mapRef = useRef<MapView | null>(null)
  const [route, setRoute] = useState<{ latitude: number; longitude: number; altitude: number }[]>([])
  const [watcher, setWatcher] = useState<Location.LocationSubscription | null>(null)
  const [steps, setSteps] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [tracking, setTracking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; altitude: number } | null>(null)
  const [initialRegion, setInitialRegion] = useState<{
    latitude: number
    longitude: number
    latitudeDelta: number
    longitudeDelta: number
  } | null>(null)
  const [distance, setDistance] = useState(0)
  const [calories, setCalories] = useState(0)
  const [pace, setPace] = useState("--:--")
  const [elevation, setElevation] = useState(0)
  const [showMusicControls, setShowMusicControls] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(16)
  const router = useRouter()
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(100)).current

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (tracking && !paused && startTime) {
      timer = setInterval(() => {
        const newElapsed = Date.now() - startTime
        setElapsed(newElapsed)

        // Update pace every second
        if (distance > 0) {
          const paceMinPerKm = newElapsed / 60000 / distance
          const paceMinutes = Math.floor(paceMinPerKm)
          const paceSeconds = Math.floor((paceMinPerKm - paceMinutes) * 60)
          setPace(`${paceMinutes}:${paceSeconds.toString().padStart(2, "0")}`)
        }

        // Update calories
        const timeMinutes = newElapsed / 60000
        setCalories(calculateCalories(steps, distance))
      }, 1000)
    }
    return () => {
      if (timer !== null) {
        clearInterval(timer)
      }
    }
  }, [tracking, paused, startTime, distance, steps])

  // Step counter
  useEffect(() => {
    const sub = Pedometer.watchStepCount((r) => {
      if (tracking && !paused) setSteps((s) => s + r.steps)
    })
    return () => sub.remove()
  }, [tracking, paused])

  // Initial location & center
  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location access is required for tracking your jog.")
        return
      }

      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        })

        const p = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          altitude: loc.coords.altitude || 0,
        }

        setCurrentLocation(p)
        setElevation(Math.round(p.altitude * 3.28084)) // Convert meters to feet

        const region = {
          latitude: p.latitude,
          longitude: p.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }

        setInitialRegion(region)

        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 500)
        }
      } catch (error) {
        Alert.alert("Error", "Failed to get your location. Please try again.")
        console.error(error)
      }
    })()
  }, [])

  // Animate UI elements on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const start = async () => {
    if (tracking && !paused) return

    if (paused) {
      // Resume from pause
      setStartTime(Date.now() - elapsed)
      setPaused(false)
      return
    }

    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission needed", "Location access is required for tracking your jog.")
      return
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      })

      const p = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        altitude: loc.coords.altitude || 0,
      }

      setCurrentLocation(p)
      setRoute([p])
      setStartTime(Date.now())
      setElapsed(0)
      setSteps(0)
      setDistance(0)
      setCalories(0)
      setPace("--:--")
      setElevation(Math.round(p.altitude * 3.28084)) // Convert meters to feet
      setTracking(true)
      setPaused(false)

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        (l) => {
          if (paused) return

          const pt = {
            latitude: l.coords.latitude,
            longitude: l.coords.longitude,
            altitude: l.coords.altitude || 0,
          }

          setCurrentLocation(pt)
          setElevation(Math.round(pt.altitude * 3.28084)) // Convert meters to feet

          setRoute((r) => {
            const newRoute = [...r, pt]

            // Calculate new distance
            if (r.length > 0) {
              const lastPoint = r[r.length - 1]
              const segmentDistance = haversine(lastPoint, pt)
              setDistance((prevDistance) => {
                const newDistance = prevDistance + segmentDistance
                return newDistance
              })
            }

            return newRoute
          })

          if (mapRef.current) {
            mapRef.current.animateCamera(
              {
                center: pt,
                zoom: zoomLevel,
              },
              { duration: 500 },
            )
          }
        },
      )

      setWatcher(sub)
    } catch (error) {
      Alert.alert("Error", "Failed to start tracking. Please try again.")
      console.error(error)
    }
  }

  const pause = () => {
    setPaused(true)
  }

//   const stop = () => {
//     Alert.alert(
//       "End Workout",
//       "Are you sure you want to end this workout?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "End Workout",
//           style: "destructive",
//           onPress: () => {
//             if (watcher) watcher.remove()
//             setTracking(false)
//             setPaused(false)
//           },
//         },
//       ],
//       { cancelable: true },
//     )
//   }
const stop = () => {
    if (watcher) watcher.remove()
    setTracking(false)
    setPaused(false)
  }


  function handleExit() {
    Alert.alert(
      "Exit Run",
      "Are you sure you want to exit? Your run data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            stop()        // stop watching and reset
            router.back() // navigate back
          },
        },
      ],
      { cancelable: true }
    )
  }

  const centerOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: currentLocation,
          zoom: zoomLevel,
        },
        { duration: 500 },
      )
    }
  }

  const changeZoom = (delta: number) => {
    const newZoom = Math.max(10, Math.min(20, zoomLevel + delta))
    setZoomLevel(newZoom)

    if (currentLocation && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: currentLocation,
          zoom: newZoom,
        },
        { duration: 300 },
      )
    }
  }

  // Convert distance to miles for display
  const distanceMiles = kmToMiles(distance).toFixed(2)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Map View */}
      {initialRegion && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation
          showsCompass={false}
          rotateEnabled={true}
          customMapStyle={isDarkMode ? darkMapStyle : mapStyle}
          showsMyLocationButton={false}
          followsUserLocation={tracking && !paused}
        >
          {route.length > 1 && (
            <Polyline
              coordinates={route}
              strokeWidth={5}
              strokeColor={isDarkMode ? "#FF9500" : "#6366F1"}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapView>
      )}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[
            styles.mapControlButton,
            { backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)" },
          ]}
          onPress={centerOnUser}
        >
          <MaterialIcons name="my-location" size={22} color={isDarkMode ? "#FF9500" : "#6366F1"} />
        </TouchableOpacity>

        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={[
              styles.mapControlButton,
              { backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)" },
            ]}
            onPress={() => changeZoom(1)}
          >
            <Ionicons name="add" size={22} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mapControlButton,
              { backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)" },
            ]}
            onPress={() => changeZoom(-1)}
          >
            <Ionicons name="remove" size={22} color={isDarkMode ? "#FF9500" : "#6366F1"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Panel */}
      <Animated.View
        style={[
          styles.statsPanel,
          {
            backgroundColor: isDarkMode ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.95)",
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.pageIndicator}>
          {[1, 2, 3].map((page) => (
            <TouchableOpacity key={page} onPress={() => setCurrentPage(page)} style={styles.pageIndicatorDot}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      currentPage === page ? (isDarkMode ? "#FF9500" : "#6366F1") : isDarkMode ? "#555" : "#D1D5DB",
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {currentPage === 1 && (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{distanceMiles}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>miles</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{pace}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Avg. Pace</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(elapsed)}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Time</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{calories}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Calories</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{elevation}ft</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Elevation</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{steps}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Steps</Text>
              </View>
            </View>
          </View>
        )}

        {currentPage === 2 && (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{steps}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Steps</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(steps / (elapsed / 60000))}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Steps/min</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>--</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Heart Rate</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>--</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Cadence</Text>
              </View>
            </View>
          </View>
        )}

        {currentPage === 3 && (
          <View style={styles.musicControls}>
            <View style={styles.musicControlsRow}>
              <TouchableOpacity style={styles.musicButton}>
                <Ionicons name="musical-note" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.musicButton}>
                <Ionicons name="play-skip-back" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.musicPlayButton}>
                <Ionicons name="play" size={28} color={isDarkMode ? "#000" : "#fff"} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.musicButton}>
                <Ionicons name="play-skip-forward" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.musicButton}>
                <Ionicons name="shuffle" size={24} color={isDarkMode ? "#FF9500" : "#6366F1"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.nowPlayingText, { color: colors.secondaryText }]}>No music playing</Text>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          {!tracking ? (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: isDarkMode ? "#FF9500" : "#10B981" }]}
              onPress={start}
            >
              <Ionicons name="play" size={32} color="#fff" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={[styles.controlButton, { backgroundColor: "#000" }]} onPress={stop}>
                <Ionicons name="square" size={24} color="#fff" />
              </TouchableOpacity>

              {paused ? (
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: isDarkMode ? "#FF9500" : "#10B981" }]}
                  onPress={start}
                >
                  <Ionicons name="play" size={32} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
                  onPress={pause}
                >
                  <Ionicons name="pause" size={32} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
              style={styles.controlButton}
              onPress={handleExit}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 60 : 40,
    alignItems: "center",
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomControls: {
    alignItems: "center",
  },
  statsPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  pageIndicatorDot: {
    padding: 8, // Larger touch target
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  statsGrid: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  musicControls: {
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  musicControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  musicButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  musicPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nowPlayingText: {
    fontSize: 14,
    fontWeight: "500",
  },
})


// // jog-tracker.tsx
// "use client"

// import { useState, useRef, useEffect } from "react"
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   Alert,
//   StatusBar,
//   Platform,
//   SafeAreaView,
//   ActivityIndicator,
// } from "react-native"
// import MapView, {
//   Polyline,
//   PROVIDER_DEFAULT,
//   type Region,
//   type MapStyleElement,
//   LatLng,
// } from "react-native-maps"
// import * as Location from "expo-location"
// import { Pedometer } from "expo-sensors"
// import { Ionicons, MaterialIcons } from "@expo/vector-icons"

// const { width, height } = Dimensions.get("window")

// // … your mapStyle & formatTime helpers …

// const mapStyle: MapStyleElement[] = [
//   {
//     elementType: "geometry",
//     stylers: [{ color: "#ebe3cd" }],
//   },
//   {
//     elementType: "labels.text.fill",
//     stylers: [{ color: "#523735" }],
//   },
//   {
//     elementType: "labels.text.stroke",
//     stylers: [{ color: "#f5f1e6" }],
//   },
//   // Add more styles as needed
// ];

// // Haversine formula to calculate distance between two points
// function haversine(a: LatLng, b: LatLng): number {
//   const toRad = (x: number) => (x * Math.PI) / 180
//   const R = 6371 // Earth's radius in km
//   const dLat = toRad(b.latitude - a.latitude)
//   const dLon = toRad(b.longitude - a.longitude)
//   const lat1 = toRad(a.latitude)
//   const lat2 = toRad(b.latitude)

//   const h =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
//   return 2 * R * Math.asin(Math.sqrt(h))
// }

// export default function JogTracker() {
//   const mapRef = useRef<MapView>(null)

//   const [route, setRoute] = useState<LatLng[]>([])
//   const [watcher, setWatcher] = useState<any>(null)
//   const [steps, setSteps] = useState(0)
//   const [startTime, setStartTime] = useState<number|null>(null)
//   const [elapsed, setElapsed] = useState(0)
//   const [tracking, setTracking] = useState(false)

//   // Our “region” state drives both initialRegion & animateToRegion
//   const [region, setRegion] = useState<Region|null>(null)

//   // Timer
//   useEffect(() => {
//     if (!tracking || startTime === null) return
//     const id = setInterval(
//       () => setElapsed(Date.now() - startTime),
//       1000
//     )
//     return () => clearInterval(id)
//   }, [tracking, startTime])

//   // Step counter
//   useEffect(() => {
//     const sub = Pedometer.watchStepCount(r => {
//       if (tracking) setSteps(s => s + r.steps)
//     })
//     return () => sub.remove()
//   }, [tracking])

//   // Get permission + initial location
//   useEffect(() => {
//     ;(async () => {
//       const { status } =
//         await Location.requestForegroundPermissionsAsync()
//       if (status !== "granted") {
//         Alert.alert("Location required", "We need your location to track your run.")
//         return
//       }

//       const loc = await Location.getCurrentPositionAsync({})
//       const initial: Region = {
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       }
//       setRegion(initial)
//       setRoute([{ latitude: initial.latitude, longitude: initial.longitude }])
//     })()
//   }, [])

//   // Start tracking
//   const start = async () => {
//     if (tracking || !region) return

//     const { status } =
//       await Location.requestForegroundPermissionsAsync()
//     if (status !== "granted") return

//     const loc = await Location.getCurrentPositionAsync({})
//     const p: LatLng = {
//       latitude: loc.coords.latitude,
//       longitude: loc.coords.longitude,
//     }
//     setRoute([p])
//     setStartTime(Date.now())
//     setElapsed(0)
//     setSteps(0)
//     setTracking(true)

//     const sub = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.BestForNavigation,
//         distanceInterval: 1,
//       },
//       l => {
//         const pt: LatLng = {
//           latitude: l.coords.latitude,
//           longitude: l.coords.longitude,
//         }
//         setRoute(r => [...r, pt])
//         const newRegion: Region = {
//           ...region,
//           latitude: pt.latitude,
//           longitude: pt.longitude,
//         }
//         setRegion(newRegion)
//         mapRef.current?.animateToRegion(newRegion, 500)
//       }
//     )
//     setWatcher(sub)
//   }

//   // Stop tracking
//   const stop = () => {
//     watcher?.remove()
//     setTracking(false)
//   }

//   // Recenter on last known region
//   const centerOnUser = () => {
//     if (region) {
//       mapRef.current?.animateToRegion(region, 500)
//     }
//   }

//   // Stats
//   const km = route.reduce((sum, _, i, a) =>
//     i > 0 ? sum + haversine(a[i-1], a[i]) : 0
//   , 0)
//   const mins = elapsed / 60000
//   const pace = km > 0 ? (mins / km).toFixed(2) : "0.00"
//   const calories = Math.round(km * 65) // rough

//   // Wait for initial region before rendering map
//   if (!region) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#ff5722"/>
//       </SafeAreaView>
//     )
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content"/>

//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         provider={PROVIDER_DEFAULT}
//         showsUserLocation
//         showsCompass={false}
//         rotateEnabled={true}
//         customMapStyle={mapStyle}
//         initialRegion={region}
//       >
//         {route.length > 1 && (
//           <Polyline
//             coordinates={route}
//             strokeWidth={5}
//             strokeColor="#ff5722"
//             lineCap="round"
//             lineJoin="round"
//           />
//         )}
//       </MapView>

//       {/* … your Stats Panel & Buttons (no change) … */}
//       <View style={styles.statsContainer}>
//         {/* ... same as before ... */}
//       </View>

//       <View style={styles.actionContainer}>
//         <TouchableOpacity
//           style={styles.locationButton}
//           onPress={centerOnUser}
//         >
//           <MaterialIcons
//             name="my-location"
//             size={24}
//             color="#fff"
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.mainButton,
//             { backgroundColor: tracking ? "#f44336" : "#00c853" }
//           ]}
//           onPress={tracking ? stop : start}
//         >
//           <Ionicons
//             name={tracking ? "pause" : "play"}
//             size={32}
//             color="#fff"
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.closeButton}
//           onPress={() =>
//             Alert.alert(
//               "Exit Run",
//               "Are you sure you want to end this run?",
//               [
//                 { text: "Cancel", style: "cancel" },
//                 { text: "End Run", style: "destructive", onPress: stop }
//               ]
//             )
//           }
//         >
//           <Ionicons name="close" size={24} color="#fff"/>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   )
// }

// // … your existing StyleSheet (no changes) …

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   map: {
//     flex: 1,
//     width,
//     height,
//   },
//   statsContainer: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 60 : 40,
//     alignSelf: "center",
//     backgroundColor: "rgba(255,255,255,0.9)",
//     borderRadius: 12,
//     padding: 16,
//     width: width * 0.9,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   statsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   statBox: {
//     flex: 1,
//     alignItems: "center",
//     paddingHorizontal: 8,
//   },
//   statValue: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#212121",
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#757575",
//     marginTop: 4,
//     fontWeight: "500",
//   },
//   actionContainer: {
//     position: "absolute",
//     bottom: 40,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 24,
//   },
//   mainButton: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: "#00c853",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.27,
//     shadowRadius: 4.65,
//     elevation: 6,
//   },
//   locationButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: "#212121",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   closeButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: "#212121",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
// })

// // jog-tracker.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View, Text, TouchableOpacity,
//   StyleSheet, Dimensions, Alert
// } from 'react-native';
// import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
// import * as Location from 'expo-location';
// import { Pedometer } from 'expo-sensors';
// import { Ionicons } from '@expo/vector-icons';

// const { width, height } = Dimensions.get('window');

// function haversine(a: any, b: any) {
//   const toRad = (x: number) => x * Math.PI / 180;
//   const R = 6371;
//   const dLat = toRad(b.latitude - a.latitude);
//   const dLon = toRad(b.longitude - a.longitude);
//   const lat1 = toRad(a.latitude), lat2 = toRad(b.latitude);
//   const h = Math.sin(dLat/2)**2 +
//             Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
//   return 2 * R * Math.asin(Math.sqrt(h));
// }

// export default function JogTracker() {
//   const mapRef = useRef<MapView>(null);
//   const [route, setRoute] = useState<{latitude:number,longitude:number}[]>([]);
//   const [watcher, setWatcher] = useState<any>(null);
//   const [steps, setSteps] = useState(0);
//   const [startTime, setStartTime] = useState<number|null>(null);
//   const [elapsed, setElapsed] = useState(0);
//   const [tracking, setTracking] = useState(false);

//   // Timer
//   useEffect(() => {
//     let timer: any;
//     if (tracking && startTime) {
//       timer = setInterval(() => setElapsed(Date.now() - startTime), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [tracking, startTime]);

//   // Step counter
//   useEffect(() => {
//     const sub = Pedometer.watchStepCount(r => {
//       if (tracking) setSteps(s => s + r.steps);
//     });
//     return () => sub.remove();
//   }, [tracking]);

//   // Initial location & center
//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission needed', 'Location access is required.');
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       const p = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
//       mapRef.current?.animateCamera({ center: p, zoom: 16 }, { duration: 1000 });
//       setRoute([p]);
//     })();
//   }, []);

//   const start = async () => {
//     if (tracking) return;
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') return;
//     const loc = await Location.getCurrentPositionAsync({});
//     const p = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
//     setRoute([p]);
//     setStartTime(Date.now());
//     setElapsed(0);
//     setSteps(0);
//     setTracking(true);

//     const sub = await Location.watchPositionAsync(
//       { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1 },
//       l => {
//         const pt = { latitude: l.coords.latitude, longitude: l.coords.longitude };
//         setRoute(r => [...r, pt]);
//         mapRef.current?.animateCamera({ center: pt }, { duration: 500 });
//       }
//     );
//     setWatcher(sub);
//   };

//   const stop = () => {
//     watcher?.remove();
//     setTracking(false);
//   };

//   // Calculate stats
//   const km = route.reduce((sum, _, i, a) =>
//     i>0 ? sum + haversine(a[i-1], a[i]) : 0
//   , 0);
//   const mins = elapsed / 60000;
//   const pace = km>0 ? (mins/km).toFixed(2) : '0.00';

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         provider={PROVIDER_DEFAULT}
//         showsUserLocation
//       >
//         {route.length>1 && (
//           <Polyline coordinates={route} strokeWidth={4} strokeColor="#6366F1"/>
//         )}
//       </MapView>

//       <View style={styles.stats}>
//         <Text style={styles.stat}>{km.toFixed(2)} km</Text>
//         <Text style={styles.stat}>{Math.floor(elapsed/1000)} s</Text>
//         <Text style={styles.stat}>{steps} steps</Text>
//         <Text style={styles.stat}>{pace} min/km</Text>
//       </View>

//       <TouchableOpacity
//         style={[styles.fab, { backgroundColor: tracking?'#999':'#6366F1' }]}
//         onPress={tracking? stop : start}
//       >
//         <Ionicons name={tracking?'pause':'play'} size={28} color="#fff"/>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex:1 },
//   map: { flex:1, width, height },
//   stats: {
//     position:'absolute',top:40,alignSelf:'center',
//     backgroundColor:'rgba(255,255,255,0.8)',padding:12,borderRadius:8
//   },
//   stat: { fontSize:14,fontWeight:'600',marginVertical:2 },
//   fab: {
//     position:'absolute',bottom:40,alignSelf:'center',
//     width:64,height:64,borderRadius:32,
//     justifyContent:'center',alignItems:'center',
//     shadowColor:'#000',shadowOffset:{width:0,height:2},
//     shadowOpacity:0.3,shadowRadius:4,elevation:5
//   }
// });





// import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
// import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// import { Ionicons } from '@expo/vector-icons';
// import React, { useRef, useEffect, useState } from 'react';
// import MapboxGL from '@react-native-mapbox-gl/maps';
// import { MAPBOX_TOKEN } from '@env';

// // TODO: set your Mapbox access token (or via environment variables)
// // MapboxGL.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN');
// MapboxGL.setAccessToken(MAPBOX_TOKEN);

// const { width, height } = Dimensions.get('window');

// const JogTracker: React.FC = () => {
//   const { isDarkMode } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>      
//       {/* Map View */}
//       <MapboxGL.MapView
//         styleURL={MapboxGL.StyleURL.Street}
//         style={styles.map}
//         compassEnabled={true}
//         logoEnabled={false}
//         pitchEnabled={false}
//         rotateEnabled={false}
//       >
//         <MapboxGL.Camera
//           zoomLevel={14}
//           followUserLocation={true}
//           followUserMode={MapboxGL.UserTrackingModes.Follow}
//         />
//         <MapboxGL.UserLocation visible={true} />
//       </MapboxGL.MapView>

//       {/* Start Button */}
//       <TouchableOpacity
//         style={[styles.startButton, { backgroundColor: isDarkMode ? '#FF9500' : '#6366F1' }]}
//         onPress={() => {
//           // TODO: handle start tracking
//           console.log('Start pressed');
//         }}
//       >
//         <Ionicons name="play" size={28} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//     width,
//     height,
//   },
//   startButton: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
// });

// export default JogTracker;
