// // // app/index.tsx
// import { View, Text, Button } from 'react-native'
// import React from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { create } from 'zustand';

// // Define the type of your store
 

// // Define the type of your store
// type StoreState = {
//   decrement(): void;
//   count: number;
//   increment: () => void;
// };

// // Create the store
// const useStore = create<StoreState>((set) => ({
//   count: 0,
//   increment: () => set((state) => ({ count: state.count + 1 })),
//   decrement: () => set((state) => ({ count: state.count - 1 })),
// }));

// const index = () => {
//   const count = useStore((state) => state.count);
  
//   return (
//     <SafeAreaView>
//       <Text style={{ textAlign: 'center' , marginTop:400}}>Counter: {count}</Text>
//       <Button title="Increment" onPress={() => useStore.getState().increment()} />
//       <Button title="Decrement" onPress={() => useStore.getState().decrement()} />
//     </SafeAreaView>
//   )
// }

// export default index

import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from "../components/buttons";
import { Image } from "expo-image";
import { useAuth } from "@/context/AuthContext";

const { width, height } = Dimensions.get("window");
const PlaceholderImage = require('@/assets/images/LandingPageWalpaper.jpg');

export default function Index() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      // console.log("🟢 Supabase session:", session);
      router.replace("/home");
    }
  }, [session, loading]);

  if (loading || session) return null;

  return (
    <View style={styles.container}>
      <Image source={PlaceholderImage} style={styles.image} />
      <View style={styles.overlay}>
        <CustomButton
          text="Get Started"
          onPress={() => router.push("/auth/login")}
          style={styles.button}
          textStyle={{ color: "#FFF" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 77,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    backgroundColor: "#0078D4",
    width: 150,
    paddingVertical: 12,
    borderRadius: 99,
    elevation: 5,
  },
});



// // app/index.tsx
// import React from "react";
// import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
// import { Link, useRouter } from "expo-router";
// import { SafeAreaView } from 'react-native-safe-area-context';
// import CustomButton from "../components/buttons";
// import { Image } from "expo-image";
// import { Dimensions } from "react-native";
// import { useEffect } from "react";

// import { useAuth } from "@/context/AuthContext";


// const { width, height } = Dimensions.get("window");

// const PlaceholderImage = require('@/assets/images/LandingPageWalpaper.jpg');

// export default function Index() {

//   const { session, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading) {
//       if (session) {
//         router.replace("/home"); // user is logged in
//       }
//     }
//   }, [session, loading]);

//   if (loading) return null; // avoid flicker

//   if (session) return null; // wait for redirect


//   return (
//     <View style={styles.container}>
//       {/* Background Image covering full screen */}
//       <Image source={PlaceholderImage} style={styles.image} />

//       {/* Overlay Container for Centered Button */}
//       <View style={styles.overlay}>
//         <CustomButton
//           text="Get Started"
//           onPress={() => router.push("/auth/login")}
//           style={styles.button}
//           textStyle={{ color: "#FFF" }}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1, 
//   },
//   image: {
//     ...StyleSheet.absoluteFillObject, // Covers the entire screen
//     resizeMode: 'cover',  // Ensures full coverage without stretching
//   },
//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 77,
//     justifyContent: 'flex-end', // Centers button vertically
//     alignItems: 'center',  // Centers button horizontally
//   },
//   button: {
//     backgroundColor: "#0078D4",
//     width: 150,
//     paddingVertical: 12,
//     borderRadius: 99,
//     elevation: 5, // Adds shadow effect on Android
   
//   },
// });







// // // import { Text, View, StyleSheet } from 'react-native';
// // //  import { Link } from 'expo-router'; 

// // // export default function Index() {
// // //   return (
// // //     <View style={styles.container}>
// // //       <Text style={styles.text}>Home screen</Text>
// // //       <Link href="/workingOut" style={styles.button}>
// // //         WOrking Out
// // //       </Link>


// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#25292e',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // //   text: {
// // //     color: '#fff',
// // //   },
// // //   button: {
// // //     fontSize: 20,
// // //     textDecorationLine: 'underline',
// // //     color: '#fff',
// // //   },
// // // });
