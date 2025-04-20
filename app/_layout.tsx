// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import "./globals.css";
import { WorkoutProvider } from "../context/WorkoutContext"; // Adjust the path if necessary
// import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { supabase } from "@/src/supabaseClient";
import { useUserStore } from "@/store/useUserStore";


export default function RootLayout() {
  useEffect(() => {
    const loadUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
  
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
  
        if (profile) {
          useUserStore.getState().setUser(profile);
        }
      }
    };
  
    loadUser();
  }, []);
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <AuthProvider> 
          <WorkoutProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </WorkoutProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


// import React from "react";
// import { Stack } from "expo-router";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { StyleSheet } from "react-native";
// import "./globals.css";
// import { WorkoutProvider } from "../context/WorkoutContext"; // Adjust the path if necessary
// import { AuthProvider } from "../context/AuthContext";

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView style={styles.container}>
//       <AuthProvider> 
//         <WorkoutProvider>
//           <Stack screenOptions={{ headerShown: false }} />
//         </WorkoutProvider>
//       </AuthProvider>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });




// import { Stack } from 'expo-router';
// export default function RootLayout() {
//   return (
//     <Stack>
//       {/* Main Tabs Layout */}
//       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
//       {/* Auth Screens */}
//       <Stack.Screen name="auth/forgotPass" options={{ headerShown:false  }} />
//       <Stack.Screen name="auth/login" options={{ headerShown:false }} />
//       <Stack.Screen name="auth/signup" options={{ headerShown:false  }} />

//       {/* Sub Screens */}
//       <Stack.Screen name="subScreen/WorkingOut" options={{ headerShown:false  }} />
//       <Stack.Screen name="subScreen/workoutEntry" options={{ headerShown:false  }} />

//       {/* Default Screen */}
//       <Stack.Screen name="index" options={{ headerShown: false }} />

//       {/* Fallback Route */}
//       <Stack.Screen name="+not-found" options={{ headerShown:false  }} />
//     </Stack>
//   );
// }




// import { Stack } from 'expo-router';

// export default function RootLayout() {
//   return (
//     <Stack>
//       <Stack.Screen name="index" options={{ headerShown: false }} />
//       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       <Stack.Screen name="auth" options={{ headerShown: false }} />
//       <Stack.Screen name="subScreen" options={{ headerShown: false }} />
//       {/* <Stack.Screen name="workingOut" options={{ headerShown: false }} /> */}
//       <Stack.Screen name="+not-found" />
//     </Stack>
//   );
// }
