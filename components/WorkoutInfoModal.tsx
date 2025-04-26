import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Workout } from "../types/types";
import { getWorkoutVideo } from "../utils/videoHelper";
import { getWorkoutImage } from "../utils/imageHelper";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { useTheme, lightTheme, darkTheme } from "../context/ThemeContext";
import { fetchLogsForExercise } from "@/lib/exerciseService";
import { LinearGradient } from "expo-linear-gradient";
import { Target } from "lucide-react-native";


const { width } = Dimensions.get("window");

interface WorkoutInfoProps {
  visible: boolean;
  workout: Workout | null;
  onClose: () => void;
  isDarkMode?: boolean;
}

const WorkoutInfoModal: React.FC<WorkoutInfoProps> = ({ visible, workout, onClose }) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  
  const [activeTab, setActiveTab] = useState("About");
  const videoRef = useRef<Video | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const tabPositions = useRef<{ [key: string]: { width: number; x: number } }>({}).current;
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [groupedSessions, setGroupedSessions] = useState<Record<string, any[]>>({});
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [targetModalVisible, setTargetModalVisible] = useState(false);

  

  useEffect(() => {
    const loadLogs = async () => {
      if (!workout?.name) return;
      try {
        setLoadingLogs(true);
        const logs = await fetchLogsForExercise(workout.name);
        setExerciseLogs(logs);
        
        const groupedBySession = logs.reduce((acc, log) => {
          const sessionKey = log.session_id || "unknown_session";
          if (!acc[sessionKey]) acc[sessionKey] = [];
          acc[sessionKey].push(log);
          return acc;
        }, {} as Record<string, any[]>);
        
        setGroupedSessions(groupedBySession);
        
        
      } catch (err) {
        console.error("Log fetch error:", err);
      } finally {
        setLoadingLogs(false);
      }
    };
  
    loadLogs();
  }, [workout]);
  
  // Sample data for 
  const weights = exerciseLogs.map(log => log.weight || 0);
  const reps = exerciseLogs.map(log => log.reps || 0);
  const sets = exerciseLogs.map(log => log.sets || 0);
  const dates = Array.from(
    new Set(
      exerciseLogs.map((log) =>
        new Date(log.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      )
    )
  ).slice(-6); // only keep last 6

  const sessionMap: Record<string, { logs: any[]; date: string }> = {};

  exerciseLogs.forEach(log => {
    const sessionId = log.session_id;
    if (!sessionMap[sessionId]) {
      sessionMap[sessionId] = { logs: [], date: log.logged_at };
    }
    sessionMap[sessionId].logs.push(log);
  });
  
  // Sort sessions by date ASC (oldest first)
  const sortedSessions = Object.entries(sessionMap).sort(
    (a, b) => new Date(a[1].date).getTime() - new Date(b[1].date).getTime()
  );
  
  // Extract labels and average weights
  const sessionLabels = sortedSessions.map((_, i) => `S${i + 1}`);
  const sessionWeights = sortedSessions.map(([_, session]) => {
    const weights = session.logs.map(log => log.weight || 0);
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
    return Math.round(avg);
  });
  
  


const prs = {
  maxWeight: Math.max(...weights, 0),
  maxReps: Math.max(...reps, 0),
  maxSets: Math.max(...Object.values(groupedSessions).map(s => s.length), 0),
};

  
  const chartData = {
    labels: sessionLabels.slice(-6),
    datasets: [
      {
        data: sessionWeights.slice(-6),
        color: (opacity = 1) =>
          isDarkMode ? `rgba(255, 149, 0, ${opacity})` : `rgba(67, 97, 238, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };
  

  <LineChart
  data={chartData}
  width={width - 64}
  height={220}
  chartConfig={{
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDarkMode ? `rgba(255, 149, 0, ${opacity})` : `rgba(67, 97, 238, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDarkMode ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: isDarkMode ? "#FF9500" : "#4361ee",
    },
    propsForBackgroundLines: {
      stroke: isDarkMode ? "#333" : "#ddd",
      strokeDasharray: "", // solid line
    },
  }}
  bezier
  style={styles.chart}
/>


  // const chartData = {
  //   labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  //   datasets: [
  //     {
  //       data: [20, 45, 28, 80, 99, 43],
  //       color: (opacity = 1) => isDarkMode ? `rgba(255, 149, 0, ${opacity})` : `rgba(67, 97, 238, ${opacity})`,
  //       strokeWidth: 2
  //     }
  //   ]
  // };
  
  // Sample workout history data
  // const workoutHistory = [
  //   { date: "2023-04-15", sets: 3, reps: 12, weight: 50 },
  //   { date: "2023-04-08", sets: 3, reps: 10, weight: 45 },
  //   { date: "2023-04-01", sets: 3, reps: 8, weight: 40 },
  // ];
  
  // Sample personal records
  // const personalRecords = [
  //   { type: "Max Weight", value: "60 lbs", date: "2023-03-15" },
  //   { type: "Max Reps", value: "15", date: "2023-02-22" },
  //   { type: "Max Sets", value: "4", date: "2023-04-01" },
  // ];

  useEffect(() => {
    if (activeTab && tabPositions[activeTab]) {
      Animated.parallel([
        Animated.spring(indicatorPosition, {
          toValue: tabPositions[activeTab].x,
          useNativeDriver: false,
          friction: 8,
        }),
        Animated.spring(indicatorWidth, {
          toValue: tabPositions[activeTab].width,
          useNativeDriver: false,
          friction: 8,
        })
      ]).start();
    }
  }, [activeTab, tabPositions]);

  const measureTab = (tabName: string, event: any) => {
    const { width, x } = event.nativeEvent.layout;
    tabPositions[tabName] = { width, x };
    
    if (activeTab === tabName && !tabPositions[activeTab]) {
      indicatorPosition.setValue(x);
      indicatorWidth.setValue(width);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <View style={styles.aboutSection}>
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
            
            <View style={[
              styles.infoCard, 
              { 
                backgroundColor: colors.card,
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: colors.border
              }
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>
                  Instructions
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,149,0,0.1)' : 'rgba(67,97,238,0.1)',
                    borderRadius: 20,
                    padding: 6,
                  }}
                  onPress={() => setTargetModalVisible(true)}
                >
                  <Target
                    size={20} 
                    color={isDarkMode ? "#FF9500" : "#4361ee"} 
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionText, { color: colors.secondaryText }]}>
                Perform this exercise with proper form. Focus on controlled movements and ensure you're engaging the targeted muscles. Always start with a light weight to avoid injury.
              </Text>
              
              <View style={styles.muscleGroups}>
                <Text style={[styles.muscleGroupsTitle, { color: colors.text }]}>Muscle Groups:</Text>
                <View style={styles.muscleTagsContainer}>
                  <View style={[
                    styles.muscleTag, 
                    { 
                      backgroundColor: isDarkMode 
                        ? 'rgba(255, 149, 0, 0.2)' 
                        : 'rgba(67, 97, 238, 0.08)' 
                    }
                  ]}>
                    <Text style={[
                      styles.muscleTagText, 
                      { color: isDarkMode ? '#FF9500' : '#4361ee' }
                    ]}>{workout?.muscle}</Text>
                  </View>
                  <View style={[
                    styles.muscleTag, 
                    { 
                      backgroundColor: isDarkMode 
                        ? 'rgba(255, 149, 0, 0.2)' 
                        : 'rgba(67, 97, 238, 0.08)' 
                    }
                  ]}>
                    <Text style={[
                      styles.muscleTagText, 
                      { color: isDarkMode ? '#FF9500' : '#4361ee' }
                    ]}>Secondary Muscles</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.equipmentSection}>
                <Text style={[styles.equipmentTitle, { color: colors.text }]}>Equipment:</Text>
                <View style={[
                  styles.equipmentTag, 
                  { 
                    backgroundColor: isDarkMode 
                      ? 'rgba(255, 149, 0, 0.2)' 
                      : 'rgba(67, 97, 238, 0.08)' 
                  }
                ]}>
                  <Ionicons 
                    name="barbell-outline" 
                    size={16} 
                    color={isDarkMode ? "#FF9500" : "#4361ee"} 
                    style={styles.equipmentIcon} 
                  />
                  <Text style={[
                    styles.equipmentText, 
                    { color: isDarkMode ? '#FF9500' : '#4361ee' }
                  ]}>{workout?.category}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case "History":
        return (
          <View style={styles.historySection}>
            <View style={[
              styles.infoCard, 
              { 
                backgroundColor: colors.card,
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: colors.border
              }
            ]}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Workout History</Text>
              
              {/* {workoutHistory.map((session, index) => (
                <View key={index} style={[
                  styles.historyItem,
                  { borderBottomColor: colors.border }
                ]}>
                  <View style={styles.historyDate}>
                    <Ionicons 
                      name="calendar-outline" 
                      size={16} 
                      color={isDarkMode ? "#FF9500" : "#4361ee"} 
                    />
                    <Text style={[
                      styles.historyDateText, 
                      { color: isDarkMode ? "#FF9500" : "#4361ee" }
                    ]}>{session.date}</Text>
                  </View>
                  <View style={styles.historyDetails}>
                    <View style={styles.historyDetail}>
                      <Text style={[styles.historyDetailLabel, { color: colors.secondaryText }]}>Sets</Text>
                      <Text style={[styles.historyDetailValue, { color: colors.text }]}>{session.sets}</Text>
                    </View>
                    <View style={styles.historyDetail}>
                      <Text style={[styles.historyDetailLabel, { color: colors.secondaryText }]}>Reps</Text>
                      <Text style={[styles.historyDetailValue, { color: colors.text }]}>{session.reps}</Text>
                    </View>
                    <View style={styles.historyDetail}>
                      <Text style={[styles.historyDetailLabel, { color: colors.secondaryText }]}>Weight</Text>
                      <Text style={[styles.historyDetailValue, { color: colors.text }]}>{session.weight} lbs</Text>
                    </View>
                  </View>
                </View>
              ))} */}

{Object.entries(groupedSessions).map(([sessionId, sessionLogs], index) => {
  const totalSets = sessionLogs.length;
  const avgWeight =
    sessionLogs.reduce((sum, s) => sum + (s.weight || 0), 0) / totalSets;
  const isExpanded = expandedSessions[sessionId];
  const sessionDate = new Date(sessionLogs[0].logged_at).toLocaleDateString();

  return (
    <TouchableOpacity
      key={sessionId}
      activeOpacity={0.9}
      onPress={() =>
        setExpandedSessions((prev) => ({
          ...prev,
          [sessionId]: !prev[sessionId],
        }))
      }
      style={{
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={
          isDarkMode
            ? ["rgba(255,149,0,0.08)", "rgba(255,85,0,0.04)"]
            : ["rgba(99,102,241,0.08)", "rgba(139,92,246,0.03)"]
        }
        style={{ padding: 16, backgroundColor: colors.card }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
              Session Date
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {sessionDate}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
              Total Sets
            </Text>
            <Text
              style={{
                color: isDarkMode ? "#FF9500" : "#6366F1",
                fontSize: 16,
                fontWeight: "700",
                marginTop: 2,
              }}
            >
              {totalSets}
            </Text>
          </View>
        </View>

        {/* Mini chart line */}
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Avg. Weight</Text>
          <Text style={{ color: colors.text, fontWeight: "600" }}>{Math.round(avgWeight)} lbs</Text>
        </View>

        {/* Expandable details */}
        {isExpanded && (
          <View style={{ marginTop: 12 }}>
            {sessionLogs.map((log, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: isDarkMode
                    ? "rgba(255,149,0,0.06)"
                    : "rgba(99,102,241,0.06)",
                }}
              >
                <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
                  Set {i + 1}
                </Text>
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {log.reps} reps @ {log.weight} lbs
                </Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
})}



              
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={[
                  styles.viewAllButtonText, 
                  { color: isDarkMode ? "#FF9500" : "#4361ee" }
                ]}>View All History</Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color={isDarkMode ? "#FF9500" : "#4361ee"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      case "Charts":
        return (
          <View style={styles.chartsSection}>
            <View style={[
              styles.infoCard, 
              { 
                backgroundColor: colors.card,
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: colors.border
              }
            ]}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Progress Charts</Text>
              <Text style={[styles.chartSubtitle, { color: colors.secondaryText }]}>Weight Progression (lbs)</Text>
              
              <LineChart
                data={chartData}
                width={width - 64}
                height={220}
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => isDarkMode 
                    ? `rgba(255, 149, 0, ${opacity})` 
                    : `rgba(67, 97, 238, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: isDarkMode ? "#FF9500" : "#4361ee"
                  }
                }}
                bezier
                style={styles.chart}
              />
              
              {/* <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>+15%</Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Strength Gain</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>60 lbs</Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Max Weight</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>8</Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
                </View>
              </View> */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {((weights.at(-1) ?? 0) - (weights[0] ?? 0)) > 0 ? `+${((weights.at(-1) ?? 0) - (weights[0] ?? 0))} lbs` : "No Gain"}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Strength Gain</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{prs.maxWeight} lbs</Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Max Weight</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{Object.keys(groupedSessions).length}</Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
                </View>
              </View>

            </View>
          </View>
        );
      case "PRs":
        return (
          <View style={styles.prsSection}>
            <View style={[
              styles.infoCard, 
              { 
                backgroundColor: colors.card,
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: colors.border
              }
            ]}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Personal Records</Text>
              
              {/* {personalRecords.map((record, index) => (
                <View key={index} style={[
                  styles.prItem,
                  { borderBottomColor: colors.border }
                ]}>
                  <View style={styles.prBadge}>
                    <Ionicons name="trophy" size={20} color="#FFD700" />
                  </View>
                  <View style={styles.prInfo}>
                    <Text style={[styles.prType, { color: colors.text }]}>{record.type}</Text>
                    <Text style={[styles.prDate, { color: colors.secondaryText }]}>Achieved on {record.date}</Text>
                  </View>
                  <Text style={[
                    styles.prValue, 
                    { color: isDarkMode ? "#FF9500" : "#4361ee" }
                  ]}>{record.value}</Text>
                </View>
              ))} */}
              <View style={[styles.prItem, { borderBottomColor: colors.border }]}>
  <View style={styles.prBadge}>
    <Ionicons name="trophy" size={20} color="#FFD700" />
  </View>
  <View style={styles.prInfo}>
    <Text style={[styles.prType, { color: colors.text }]}>Max Weight</Text>
    <Text style={[styles.prDate, { color: colors.secondaryText }]}>Based on your logs</Text>
  </View>
  <Text style={[styles.prValue, { color: isDarkMode ? "#FF9500" : "#4361ee" }]}>
    {prs.maxWeight} lbs
  </Text>
</View>

<View style={[styles.prItem, { borderBottomColor: colors.border }]}>
  <View style={styles.prBadge}>
    <Ionicons name="trophy" size={20} color="#FFD700" />
  </View>
  <View style={styles.prInfo}>
    <Text style={[styles.prType, { color: colors.text }]}>Max Reps</Text>
    <Text style={[styles.prDate, { color: colors.secondaryText }]}>Based on your logs</Text>
  </View>
  <Text style={[styles.prValue, { color: isDarkMode ? "#FF9500" : "#4361ee" }]}>
    {prs.maxReps}
  </Text>
</View>

<View style={[styles.prItem, { borderBottomColor: colors.border }]}>
  <View style={styles.prBadge}>
    <Ionicons name="trophy" size={20} color="#FFD700" />
  </View>
  <View style={styles.prInfo}>
    <Text style={[styles.prType, { color: colors.text }]}>Max Sets</Text>
    <Text style={[styles.prDate, { color: colors.secondaryText }]}>Based on your logs</Text>
  </View>
  <Text style={[styles.prValue, { color: isDarkMode ? "#FF9500" : "#4361ee" }]}>
    {prs.maxSets}
  </Text>
</View>

              
              <TouchableOpacity style={[
                styles.newPrButton,
                { 
                  backgroundColor: isDarkMode 
                    ? 'rgba(255, 149, 0, 0.2)' 
                    : 'rgba(67, 97, 238, 0.08)' 
                }
              ]}>
                <Ionicons 
                  name="add-circle-outline" 
                  size={20} 
                  color={isDarkMode ? "#FF9500" : "#4361ee"} 
                />
                <Text style={[
                  styles.newPrButtonText, 
                  { color: isDarkMode ? "#FF9500" : "#4361ee" }
                ]}>Add New PR</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          { 
            backgroundColor: colors.background,
            borderTopWidth: isDarkMode ? 1 : 0,
            borderTopColor: colors.border
          }
        ]}>
          {/* Header with workout name */}
          <View style={styles.header}>
            <Text style={[styles.workoutTitle, { color: colors.text }]}>{workout?.name}</Text>
            <TouchableOpacity 
              style={[
                styles.closeButton, 
                { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
              ]} 
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={[
            styles.tabContainer,
            { 
              backgroundColor: colors.card,
              borderBottomColor: colors.border
            }
          ]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScrollContent}
            >
              {["About", "History", "Charts", "PRs",].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={styles.tab}
                  onPress={() => setActiveTab(tab)}
                  onLayout={(event) => measureTab(tab, event)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: colors.secondaryText },
                      activeTab === tab && { 
                        color: isDarkMode ? "#FF9500" : "#4361ee",
                        fontWeight: '600'
                      },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
              <Animated.View 
                style={[
                  styles.tabIndicator, 
                  { 
                    left: indicatorPosition,
                    width: indicatorWidth,
                    backgroundColor: isDarkMode ? "#FF9500" : "#4361ee"
                  }
                ]} 
              />
            </ScrollView>
          </View>

          {/* Dynamic Content */}
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        </View>
      </View>

      <Modal
  visible={targetModalVisible}
  animationType="fade"
  transparent={true}
  onRequestClose={() => setTargetModalVisible(false)}
>
  <View style={{
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)', // darker background
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    
    {/* Image container */}
    <View style={{
      width: "95%",  // slightly wider
      height: "85%", // slightly taller
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      <Image 
        source={workout ? getWorkoutImage(workout.name) : require('../assets/target_muscles/sample.png')}
        style={{
          width: "100%",
          height: "100%",
        }}
        resizeMode="contain"
      />

      {/* Exit (X) Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: 8,
          borderRadius: 20,
        }}
        onPress={() => setTargetModalVisible(false)}
      >
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>
    </View>

  </View>
</Modal>

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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tabScrollContent: {
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  workoutVideo: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  workoutImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  muscleGroups: {
    marginBottom: 16,
  },
  muscleGroupsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  muscleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  muscleTagText: {
    fontWeight: '500',
    fontSize: 14,
  },
  equipmentSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  equipmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  equipmentIcon: {
    marginRight: 6,
  },
  equipmentText: {
    fontWeight: '500',
    fontSize: 14,
  },
  aboutSection: {
    marginTop: 16,
  },
  historySection: {
    marginTop: 16,
  },
  historyItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDateText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  historyDetails: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
  justifyContent: 'flex-start',
},

  historyDetail: {
    alignItems: 'center',
  },
  historyDetailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  historyDetailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  chartsSection: {
    marginTop: 16,
  },
  chartSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  prsSection: {
    marginTop: 16,
  },
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  prBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prInfo: {
    flex: 1,
  },
  prType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  prDate: {
    fontSize: 12,
  },
  prValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  newPrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  newPrButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  
});

export default WorkoutInfoModal;

// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   Animated,
//   Dimensions,
//   Image,
// } from "react-native";
// import { Video, ResizeMode } from "expo-av";
// import { Workout } from "../types/types";
// import { getWorkoutVideo } from "../utils/videoHelper";
// import { getWorkoutImage } from "../utils/imageHelper";
// import { Ionicons } from "@expo/vector-icons";
// import { LineChart } from "react-native-chart-kit";

// const { width } = Dimensions.get("window");

// interface WorkoutInfoProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
//   isDarkMode?: boolean;
// }

// const WorkoutInfoModal: React.FC<WorkoutInfoProps> = ({ visible, workout, onClose }) => {
//   const [activeTab, setActiveTab] = useState("About");
//   const videoRef = useRef<Video | null>(null);
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const tabPositions = useRef<{ [key: string]: { width: number; x: number } }>({}).current;
//   const indicatorPosition = useRef(new Animated.Value(0)).current;
//   const indicatorWidth = useRef(new Animated.Value(0)).current;
  
//   // Sample data for charts
//   const chartData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         data: [20, 45, 28, 80, 99, 43],
//         color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
//         strokeWidth: 2
//       }
//     ]
//   };
  
//   // Sample workout history data
//   const workoutHistory = [
//     { date: "2023-04-15", sets: 3, reps: 12, weight: 50 },
//     { date: "2023-04-08", sets: 3, reps: 10, weight: 45 },
//     { date: "2023-04-01", sets: 3, reps: 8, weight: 40 },
//   ];
  
//   // Sample personal records
//   const personalRecords = [
//     { type: "Max Weight", value: "60 lbs", date: "2023-03-15" },
//     { type: "Max Reps", value: "15", date: "2023-02-22" },
//     { type: "Max Sets", value: "4", date: "2023-04-01" },
//   ];

//   useEffect(() => {
//     if (activeTab && tabPositions[activeTab]) {
//       Animated.parallel([
//         Animated.spring(indicatorPosition, {
//           toValue: tabPositions[activeTab].x,
//           useNativeDriver: false,
//           friction: 8,
//         }),
//         Animated.spring(indicatorWidth, {
//           toValue: tabPositions[activeTab].width,
//           useNativeDriver: false,
//           friction: 8,
//         })
//       ]).start();
//     }
//   }, [activeTab, tabPositions]);

//   const measureTab = (tabName: string, event: any) => {
//     const { width, x } = event.nativeEvent.layout;
//     tabPositions[tabName] = { width, x };
    
//     if (activeTab === tabName && !tabPositions[activeTab]) {
//       indicatorPosition.setValue(x);
//       indicatorWidth.setValue(width);
//     }
//   };

//   const renderContent = () => {
//     switch (activeTab) {
//       case "About":
//         return (
//           <View style={styles.aboutSection}>
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
            
//             <View style={styles.infoCard}>
//               <Text style={styles.sectionHeader}>Instructions</Text>
//               <Text style={styles.sectionText}>
//                 Perform this exercise with proper form. Focus on controlled movements and ensure you're engaging the targeted muscles. Always start with a light weight to avoid injury.
//               </Text>
              
//               <View style={styles.muscleGroups}>
//                 <Text style={styles.muscleGroupsTitle}>Muscle Groups:</Text>
//                 <View style={styles.muscleTagsContainer}>
//                   <View style={styles.muscleTag}>
//                     <Text style={styles.muscleTagText}>{workout?.muscle}</Text>
//                   </View>
//                   <View style={styles.muscleTag}>
//                     <Text style={styles.muscleTagText}>Secondary Muscles</Text>
//                   </View>
//                 </View>
//               </View>
              
//               <View style={styles.equipmentSection}>
//                 <Text style={styles.equipmentTitle}>Equipment:</Text>
//                 <View style={styles.equipmentTag}>
//                   <Ionicons name="barbell-outline" size={16} color="#4361ee" style={styles.equipmentIcon} />
//                   <Text style={styles.equipmentText}>{workout?.category}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         );
//       case "History":
//         return (
//           <View style={styles.historySection}>
//             <View style={styles.infoCard}>
//               <Text style={styles.sectionHeader}>Workout History</Text>
              
//               {workoutHistory.map((session, index) => (
//                 <View key={index} style={styles.historyItem}>
//                   <View style={styles.historyDate}>
//                     <Ionicons name="calendar-outline" size={16} color="#4361ee" />
//                     <Text style={styles.historyDateText}>{session.date}</Text>
//                   </View>
//                   <View style={styles.historyDetails}>
//                     <View style={styles.historyDetail}>
//                       <Text style={styles.historyDetailLabel}>Sets</Text>
//                       <Text style={styles.historyDetailValue}>{session.sets}</Text>
//                     </View>
//                     <View style={styles.historyDetail}>
//                       <Text style={styles.historyDetailLabel}>Reps</Text>
//                       <Text style={styles.historyDetailValue}>{session.reps}</Text>
//                     </View>
//                     <View style={styles.historyDetail}>
//                       <Text style={styles.historyDetailLabel}>Weight</Text>
//                       <Text style={styles.historyDetailValue}>{session.weight} lbs</Text>
//                     </View>
//                   </View>
//                 </View>
//               ))}
              
//               <TouchableOpacity style={styles.viewAllButton}>
//                 <Text style={styles.viewAllButtonText}>View All History</Text>
//                 <Ionicons name="arrow-forward" size={16} color="#4361ee" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         );
//       case "Charts":
//         return (
//           <View style={styles.chartsSection}>
//             <View style={styles.infoCard}>
//               <Text style={styles.sectionHeader}>Progress Charts</Text>
//               <Text style={styles.chartSubtitle}>Weight Progression (lbs)</Text>
              
//               <LineChart
//                 data={chartData}
//                 width={width - 64}
//                 height={220}
//                 chartConfig={{
//                   backgroundColor: "#ffffff",
//                   backgroundGradientFrom: "#ffffff",
//                   backgroundGradientTo: "#ffffff",
//                   decimalPlaces: 0,
//                   color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
//                   labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   style: {
//                     borderRadius: 16
//                   },
//                   propsForDots: {
//                     r: "6",
//                     strokeWidth: "2",
//                     stroke: "#4361ee"
//                   }
//                 }}
//                 bezier
//                 style={styles.chart}
//               />
              
//               <View style={styles.statsRow}>
//                 <View style={styles.statItem}>
//                   <Text style={styles.statValue}>+15%</Text>
//                   <Text style={styles.statLabel}>Strength Gain</Text>
//                 </View>
//                 <View style={styles.statItem}>
//                   <Text style={styles.statValue}>60 lbs</Text>
//                   <Text style={styles.statLabel}>Max Weight</Text>
//                 </View>
//                 <View style={styles.statItem}>
//                   <Text style={styles.statValue}>8</Text>
//                   <Text style={styles.statLabel}>Workouts</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         );
//       case "PRs":
//         return (
//           <View style={styles.prsSection}>
//             <View style={styles.infoCard}>
//               <Text style={styles.sectionHeader}>Personal Records</Text>
              
//               {personalRecords.map((record, index) => (
//                 <View key={index} style={styles.prItem}>
//                   <View style={styles.prBadge}>
//                     <Ionicons name="trophy" size={20} color="#FFD700" />
//                   </View>
//                   <View style={styles.prInfo}>
//                     <Text style={styles.prType}>{record.type}</Text>
//                     <Text style={styles.prDate}>Achieved on {record.date}</Text>
//                   </View>
//                   <Text style={styles.prValue}>{record.value}</Text>
//                 </View>
//               ))}
              
//               <TouchableOpacity style={styles.newPrButton}>
//                 <Ionicons name="add-circle-outline" size={20} color="#4361ee" />
//                 <Text style={styles.newPrButtonText}>Add New PR</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           {/* Header with workout name */}
//           <View style={styles.header}>
//             <Text style={styles.workoutTitle}>{workout?.name}</Text>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Ionicons name="close" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>

//           {/* Tab Navigation */}
//           <View style={styles.tabContainer}>
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.tabScrollContent}
//             >
//               {["About", "History", "Charts", "PRs"].map((tab) => (
//                 <TouchableOpacity
//                   key={tab}
//                   style={styles.tab}
//                   onPress={() => setActiveTab(tab)}
//                   onLayout={(event) => measureTab(tab, event)}
//                 >
//                   <Text
//                     style={[
//                       styles.tabText,
//                       activeTab === tab && styles.activeTabText,
//                     ]}
//                   >
//                     {tab}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//               <Animated.View 
//                 style={[
//                   styles.tabIndicator, 
//                   { 
//                     left: indicatorPosition,
//                     width: indicatorWidth 
//                   }
//                 ]} 
//               />
//             </ScrollView>
//           </View>

//           {/* Dynamic Content */}
//           <ScrollView 
//             style={styles.contentContainer}
//             showsVerticalScrollIndicator={false}
//           >
//             {renderContent()}
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
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 10,
//   },
//   workoutTitle: {
//     fontSize: 20,
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
//   tabContainer: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   tabScrollContent: {
//     paddingVertical: 12,
//   },
//   tab: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   tabText: {
//     fontSize: 16,
//     color: "#6b7280",
//     fontWeight: "500",
//   },
//   activeTabText: {
//     color: "#4361ee",
//     fontWeight: "600",
//   },
//   tabIndicator: {
//     position: 'absolute',
//     bottom: 0,
//     height: 3,
//     backgroundColor: '#4361ee',
//     borderTopLeftRadius: 3,
//     borderTopRightRadius: 3,
//   },
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingBottom: 24,
//   },
//   workoutVideo: {
//     width: "100%",
//     height: 250,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   workoutImage: {
//     width: "100%",
//     height: 250,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   infoCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: 12,
//   },
//   sectionText: {
//     fontSize: 15,
//     color: "#555",
//     lineHeight: 22,
//     marginBottom: 16,
//   },
//   muscleGroups: {
//     marginBottom: 16,
//   },
//   muscleGroupsTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 8,
//   },
//   muscleTagsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   muscleTag: {
//     backgroundColor: 'rgba(67, 97, 238, 0.08)',
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   muscleTagText: {
//     color: '#4361ee',
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   equipmentSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   equipmentTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     marginRight: 8,
//   },
//   equipmentTag: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(67, 97, 238, 0.08)',
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   equipmentIcon: {
//     marginRight: 6,
//   },
//   equipmentText: {
//     color: '#4361ee',
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   aboutSection: {
//     marginTop: 16,
//   },
//   historySection: {
//     marginTop: 16,
//   },
//   historyItem: {
//     marginBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     paddingBottom: 16,
//   },
//   historyDate: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   historyDateText: {
//     fontSize: 14,
//     color: '#4361ee',
//     fontWeight: '500',
//     marginLeft: 6,
//   },
//   historyDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   historyDetail: {
//     alignItems: 'center',
//   },
//   historyDetailLabel: {
//     fontSize: 12,
//     color: '#6b7280',
//     marginBottom: 4,
//   },
//   historyDetailValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   viewAllButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//   },
//   viewAllButtonText: {
//     fontSize: 14,
//     color: '#4361ee',
//     fontWeight: '600',
//     marginRight: 6,
//   },
//   chartsSection: {
//     marginTop: 16,
//   },
//   chartSubtitle: {
//     fontSize: 14,
//     color: '#6b7280',
//     marginBottom: 16,
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 16,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   statItem: {
//     alignItems: 'center',
//   },
//   statValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#333',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#6b7280',
//   },
//   prsSection: {
//     marginTop: 16,
//   },
//   prItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   prBadge: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 215, 0, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   prInfo: {
//     flex: 1,
//   },
//   prType: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   prDate: {
//     fontSize: 12,
//     color: '#6b7280',
//   },
//   prValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#4361ee',
//   },
//   newPrButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     backgroundColor: 'rgba(67, 97, 238, 0.08)',
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   newPrButtonText: {
//     fontSize: 14,
//     color: '#4361ee',
//     fontWeight: '600',
//     marginLeft: 6,
//   },
// });

// export default WorkoutInfoModal;

// // components/WorkoutInfo.tsx
// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { Video, ResizeMode } from "expo-av";
// import { Workout } from "../types/types";
// import { getWorkoutVideo } from "../utils/videoHelper";
// import { Ionicons } from "@expo/vector-icons";

// interface WorkoutInfoProps {
//   visible: boolean;
//   workout: Workout | null;
//   onClose: () => void;
// }

// const WorkoutInfo: React.FC<WorkoutInfoProps> = ({ visible, workout, onClose }) => {
//   const [activeTab, setActiveTab] = useState("About"); // Tracks the selected tab
//   const videoRef = useRef<Video | null>(null);

//   const renderContent = () => {
//     switch (activeTab) {
//       case "About":
//         return (
//           <View style={styles.aboutSection}>
//             {workout && getWorkoutVideo(workout.name) && (
//               <Video
//                 ref={videoRef}
//                 source={getWorkoutVideo(workout.name)}
//                 style={styles.workoutVideo}
//                 resizeMode={ResizeMode.COVER}
//                 shouldPlay
//                 isLooping
//               />
//             )}
//             <Text style={styles.sectionHeader}>Instructions</Text>
//             <Text style={styles.sectionText}>
//               Perform this exercise with proper form. Focus on controlled movements and ensure you're engaging the targeted muscles. Always start with a light weight to avoid injury.
//             </Text>
//           </View>
//         );
//       case "History":
//         return (
//           <View style={styles.historySection}>
//             <Text style={styles.sectionHeader}>Workout History</Text>
//             <Text style={styles.sectionText}>
//               - Last performed: 01/15/2025 {"\n"}
//               - Best performance: 3 sets, 12 reps @ 50 lbs {"\n"}
//               - Logged 8 times in the past month
//             </Text>
//           </View>
//         );
//       case "Charts":
//         return (
//           <View style={styles.chartsSection}>
//             <Text style={styles.sectionHeader}>Progress Charts</Text>
//             <Text style={styles.sectionText}>
//               Your strength for this exercise has increased by 15% over the past 3 months.
//             </Text>
//             {/* You can add chart components here using libraries like Victory or react-native-chart-kit */}
//           </View>
//         );
//       case "PRs":
//         return (
//           <View style={styles.prsSection}>
//             <Text style={styles.sectionHeader}>Personal Records</Text>
//             <Text style={styles.sectionText}>
//               - Max Weight: 60 lbs {"\n"}
//               - Max Reps: 15 {"\n"}
//               - Max Sets: 4
//             </Text>
//           </View>
//         );
//       default:
//         return null;
//     }
//   };

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

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             {["About", "History", "Charts", "PRs"].map((tab) => (
//               <TouchableOpacity
//                 key={tab}
//                 style={[
//                   styles.actionButton,
//                   activeTab === tab && styles.activeActionButton,
//                 ]}
//                 onPress={() => setActiveTab(tab)}
//               >
//                 <Text
//                   style={[
//                     styles.actionButtonText,
//                     activeTab === tab && styles.activeActionButtonText,
//                   ]}
//                 >
//                   {tab}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Dynamic Content */}
//           <ScrollView style={styles.contentContainer}>{renderContent()}</ScrollView>
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
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//   },
//   actionButton: {
//     backgroundColor: "#f0f0f0",
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 15,
//   },
//   activeActionButton: {
//     backgroundColor: "#4caf50",
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   activeActionButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   workoutVideo: {
//     width: "100%",
//     height: 250,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 10,
//   },
//   sectionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
//   aboutSection: {
//     marginBottom: 20,
//   },
//   historySection: {
//     marginBottom: 20,
//   },
//   chartsSection: {
//     marginBottom: 20,
//   },
//   prsSection: {
//     marginBottom: 20,
//   },
// });

// export default WorkoutInfo;
