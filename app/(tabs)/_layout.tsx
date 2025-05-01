// // app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { icons } from '../../constants/icons';
import { Image } from 'react-native';
import { useTheme, lightTheme, darkTheme } from '../../context/ThemeContext';

import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";
import { FileClock } from 'lucide-react-native';
import 'react-native-get-random-values'



export default function TabLayout() {
  const { isDarkMode, theme } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  const { session, loading } = useAuth();

  // 👉 While Supabase is still checking for session, show nothing (or loading spinner)
  if (loading) return null;

  // ❌ If session is not found after loading
  if (!session) return <Redirect href="/auth/login" />;


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={icons.home}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={icons.dumbell}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Routines', // or 'Library' / 'Planner' / whatever name you choose
          tabBarIcon: ({ color, size }) => (
            <FileClock color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={icons.nutrition}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={icons.profile}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}



// import React from 'react';
// import { Tabs } from 'expo-router';
// import { FontAwesome } from '@expo/vector-icons';
// import { useColorScheme } from 'react-native';
// import { icons } from '../../constants/icons';
// import { Image } from 'react-native';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: '#2563eb', // Tailwind blue-600
//         tabBarInactiveTintColor: '#6b7280', // Tailwind gray-500
//       }}
//     >
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color, size }) => (
//             <Image 
//               source={icons.home}
//               style={{ width: size, height: size }}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="workout"
//         options={{
//           title: 'Workout',
//           tabBarIcon: ({ color, size }) => (
//             <Image 
//               source={icons.dumbell}
//               style={{ width: size, height: size }}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="history"
//         options={{
//           title: 'History',
//           tabBarIcon: ({ color, size }) => (
//             <Image 
//               source={icons.history}
//               style={{ width: size, height: size }}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="nutrition"
//         options={{
//           title: 'Nutrition',
//           tabBarIcon: ({ color, size }) => (
//             <Image 
//               source={icons.nutrition}
//               style={{ width: size, height: size }}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color, size }) => (
//             <Image 
//               source={icons.profile}
//               style={{ width: size, height: size }}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }




// import { Tabs } from 'expo-router';
// import { icons } from '../../constants/icons';

// export default function TabLayout() {
//   return (
//     <Tabs>
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: 'Home',
//           headerShown: false, // Hide header if not needed
//           tabBarIcon: () => <YourIconComponent name="home-icon" />, // Optional tab icons
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           headerShown: false,
//           tabBarIcon: () => <YourIconComponent name="profile-icon" />,
//         }}
//       />
//       <Tabs.Screen
//         name="workout"
//         options={{
//           title: 'Workout',
//           headerShown: false,
//           tabBarIcon: () => <YourIconComponent name="workout-icon" />,
//         }}
//       />
//     </Tabs>
//   );
// }


// import { Tabs } from 'expo-router';

// export default function TabLayout() {
//   return (
//     <Tabs>
//       <Tabs.Screen name="home" options={{ headerShown: false }} />
//       <Tabs.Screen name="profile" options={{ headerShown: false }} />
//       <Tabs.Screen name="workout" options={{ headerShown: false }} />
//     </Tabs>
//   );
// }
