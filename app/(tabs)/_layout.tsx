// // app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { icons } from '../../constants/icons';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF9500', // Orange accent color
        tabBarInactiveTintColor: '#999999', // Gray for inactive
        tabBarStyle: {
          backgroundColor: '#000000', // Black background
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 50,
              height: 30,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.1)' : 'transparent',
              borderRadius: 15
            }}>
              <Ionicons name="home" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 50,
              height: 30,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.1)' : 'transparent',
              borderRadius: 15
            }}>
              <Ionicons name="barbell" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 50,
              height: 30,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.1)' : 'transparent',
              borderRadius: 15
            }}>
              <Ionicons name="time" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 50,
              height: 30,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.1)' : 'transparent',
              borderRadius: 15
            }}>
              <Ionicons name="nutrition" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 50,
              height: 30,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.1)' : 'transparent',
              borderRadius: 15
            }}>
              <Ionicons name="person" size={size} color={color} />
            </View>
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
