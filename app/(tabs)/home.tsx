import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome Home</Text>
    </View>
  )
}


export default home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text:{
    color:"black",
    fontSize:42,
    fontWeight:"bold",
    textAlign:"center",
  }
})























// import React from "react";
// import { SafeAreaView, Text, View, StyleSheet, ScrollView, Image } from "react-native";
// import Card from "@/components/card"; // Import your reusable Card component
// import { ProgressCircle } from "react-native-svg-charts";
// import { MaterialCommunityIcons, Feather } from "@expo/vector-icons"; // Icons

// const Home = () => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
        
//         {/* Header Section */}
//         <View style={styles.header}>
//           <View style={styles.userInfo}>
//             <Image 
//               source={{ uri: "https://randomuser.me/api/portraits/men/45.jpg" }} 
//               style={styles.avatar} 
//             />
//             <View>
//               <Text style={styles.welcomeText}>Welcome Back</Text>
//               <Text style={styles.username}>Nicolas Doflamingo 🤘</Text>
//             </View>
//           </View>
//           <View style={styles.notification}>
//             <Feather name="bell" size={24} color="black" />
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationCount}>9+</Text>
//             </View>
//           </View>
//         </View>

//         {/* Workout Progress Card */}
//         <Card cardStyle={styles.workoutCard}>
//           <View style={styles.workoutContent}>
//             <View>
//               <Text style={styles.workoutTitle}>Workout Progress</Text>
//               <Text style={styles.workoutSubtitle}>12 Exercises left</Text>
//             </View>
//             <ProgressCircle 
//               style={{ height: 50, width: 50 }}
//               progress={0.65}
//               progressColor={"#42d392"}
//             />
//           </View>
//         </Card>

//         {/* Today's Activity Section */}
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>Today's Activity</Text>
//           <Feather name="edit" size={18} color="black" />
//         </View>

//         <View style={styles.activityContainer}>
//           {/* Calories Burned Card */}
//           <Card cardStyle={styles.caloriesCard}>
//             <View style={styles.caloriesContent}>
//               <MaterialCommunityIcons name="weight-lifter" size={32} color="white" />
//               <Text style={styles.caloriesText}>1.350 Calories</Text>
//             </View>
//           </Card>

//           {/* Activity List */}
//           <View style={styles.activityList}>
//             <ActivityItem name="Push-ups" muscle="Biceps, triceps, shoulders" reps="15 x3" color="#ff8800" />
//             <ActivityItem name="Squads" muscle="Calves, legs, thighs" reps="25 x3" color="#4caf50" />
//             <ActivityItem name="Lunges" muscle="Calves, hamstrings, glutes" reps="15 x3" color="#3f51b5" />
//           </View>
//         </View>

//         {/* Overall Status Section */}
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>Overall Status</Text>
//           <Text style={styles.seeMore}>See more →</Text>
//         </View>

//         <View style={styles.statusContainer}>
//           <StatusCard title="Calories Loss" value="12.182 Kcal" progress={0.37} icon="fire" />
//           <StatusCard title="Weight Loss" value="10.7 Kg" progress={0.80} icon="dumbbell" />
//         </View>

//       </ScrollView>

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <Feather name="home" size={28} color="black" />
//         <Feather name="search" size={28} color="gray" />
//         <Feather name="bar-chart-2" size={28} color="gray" />
//         <Feather name="settings" size={28} color="gray" />
//       </View>

//     </SafeAreaView>
//   );
// };

// /* Activity Item Component */
// const ActivityItem = ({ name, muscle, reps, color }) => (
//   <Card cardStyle={styles.activityCard}>
//     <View style={styles.activityContent}>
//       <View style={[styles.activityColor, { backgroundColor: color }]} />
//       <View>
//         <Text style={styles.activityTitle}>{name}</Text>
//         <Text style={styles.activitySubtitle}>{muscle}</Text>
//       </View>
//       <Text style={styles.activityReps}>{reps}</Text>
//     </View>
//   </Card>
// );

// /* Status Card Component */
// const StatusCard = ({ title, value, progress, icon }) => (
//   <Card cardStyle={styles.statusCard}>
//     <View style={styles.statusContent}>
//       <MaterialCommunityIcons name={icon} size={24} color="black" />
//       <View>
//         <Text style={styles.statusTitle}>{title}</Text>
//         <Text style={styles.statusValue}>{value}</Text>
//       </View>
//       <ProgressCircle style={{ height: 40, width: 40 }} progress={progress} progressColor={"#4caf50"} />
//     </View>
//   </Card>
// );

// /* Styles */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 20 },
  
//   /* Header */
//   header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 },
//   userInfo: { flexDirection: "row", alignItems: "center" },
//   avatar: { width: 45, height: 45, borderRadius: 50, marginRight: 10 },
//   welcomeText: { fontSize: 14, color: "#888" },
//   username: { fontSize: 16, fontWeight: "bold" },
//   notification: { position: "relative" },
//   notificationBadge: { position: "absolute", top: -4, right: -4, backgroundColor: "#d32f2f", borderRadius: 10, paddingHorizontal: 6 },
//   notificationCount: { color: "white", fontSize: 12 },

//   /* Workout Progress */
//   workoutCard: { backgroundColor: "#070B10", padding: 20, borderRadius: 10, marginTop: 10 },
//   workoutContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   workoutTitle: { fontSize: 18, color: "#fff", fontWeight: "bold" },
//   workoutSubtitle: { fontSize: 14, color: "#ccc" },

//   /* Sections */
//   sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 15 },
//   sectionTitle: { fontSize: 18, fontWeight: "bold" },
//   seeMore: { fontSize: 14, color: "#888" },

//   /* Activity Section */
//   activityContainer: { flexDirection: "row", gap: 10 },
//   caloriesCard: { backgroundColor: "#B71C1C", borderRadius: 10, padding: 20 },
//   caloriesContent: { flexDirection: "row", alignItems: "center" },
//   caloriesText: { color: "white", fontSize: 18, fontWeight: "bold", marginLeft: 10 },

//   /* Overall Status */
//   statusContainer: { flexDirection: "row", justifyContent: "space-between" },
//   statusCard: { backgroundColor: "white", width: "48%", padding: 15, borderRadius: 10 },
//   statusContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   statusTitle: { fontSize: 14, color: "#333" },
//   statusValue: { fontSize: 16, fontWeight: "bold" },

//   /* Bottom Navigation */
//   bottomNav: { flexDirection: "row", justifyContent: "space-around", padding: 15, backgroundColor: "white", borderTopWidth: 1, borderColor: "#ddd" },
// });

// export default Home;



// import React, { useContext, useEffect } from "react";
// import { View, Text, ActivityIndicator } from "react-native";
// import { useRouter } from "expo-router";
// import { AuthContext } from "../../context/AuthContext";

// const HomeScreen: React.FC = () => {
//   const { user } = useContext(AuthContext);
//   const router = useRouter();

//   useEffect(() => {
//     console.log("Checking user:", user);
//     if (!user) {
//       router.replace("/auth/login");
//     }
//   }, [user]);

//   if (!user) {
//     return <ActivityIndicator size="large" color="#000" />;
//   }

//   return (
//     <View>
//       <Text>Welcome to the app!</Text>
//     </View>
//   );
// };

// export default HomeScreen;

// import React, { useState, useEffect } from 'react';
// import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import Voice from '@react-native-voice/voice';

// const Home = () => {
//   const [text, setText] = useState('');
//   const [isListening, setIsListening] = useState(false);

//   useEffect(() => {
//     Voice.onSpeechStart = () => setIsListening(true);
//     Voice.onSpeechEnd = () => setIsListening(false);
//     Voice.onSpeechResults = (event) => {
//       if (event.value && event.value.length > 0) {
//         setText(event.value[0]);
//       }
//     };

//     return () => {
//       Voice.destroy().then(Voice.removeAllListeners);
//     };
//   }, []);

//   const startRecording = async () => {
//     try {
//       await Voice.start('en-US');
//     } catch (error) {
//       console.error('Voice start error:', error);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       await Voice.stop();
//       setIsListening(false);
//     } catch (error) {
//       console.error('Voice stop error:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Speak or type here..."
//           value={text}
//           onChangeText={setText}
//         />
//         <TouchableOpacity
//           style={[styles.micButton, isListening ? styles.micActive : null]}
//           onPressIn={startRecording}
//           onPressOut={stopRecording}
//         >
//           <Text style={styles.micText}>🎤</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center', // Centers content vertically
//     alignItems: 'center', // Centers content horizontally
//     backgroundColor: '#f8f9fa',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     backgroundColor: 'white',
//     padding: 10,
//     width: '80%', // Adjust width for responsiveness
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     padding: 10,
//   },
//   micButton: {
//     marginLeft: 10,
//     backgroundColor: '#eee',
//     padding: 10,
//     borderRadius: 25,
//   },
//   micActive: {
//     backgroundColor: 'red',
//   },
//   micText: {
//     fontSize: 20,
//   },
// });

// export default Home;


