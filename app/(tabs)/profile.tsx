// app/(tabs)/profile.tsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Switch,
  Alert,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a theme context
export const ThemeContext = createContext({
  darkMode: true,
  toggleTheme: () => {},
});

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const systemColorScheme = useColorScheme();
  
  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('darkModeEnabled');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'true');
        } else {
          // Default to system preference if no saved preference
          setDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, [systemColorScheme]);
  
  // Save theme preference when it changes
  const toggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem('darkModeEnabled', value.toString());
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => router.replace('/') 
        }
      ]
    );
  };

  // Create theme-based styles
  const theme = {
    backgroundColor: darkMode ? '#000000' : '#f8f9fa',
    cardBackground: darkMode ? '#1A1A1A' : '#FFFFFF',
    textColor: darkMode ? '#FFFFFF' : '#333333',
    secondaryTextColor: darkMode ? '#999999' : '#94a3b8',
    accentColor: darkMode ? '#FF9500' : '#4361ee',
    borderColor: darkMode ? '#333333' : '#e0e0e0',
    iconBackground: darkMode ? 'rgba(255, 149, 0, 0.1)' : 'rgba(67, 97, 238, 0.1)',
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme: () => toggleDarkMode(!darkMode) }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <StatusBar style={darkMode ? "light" : "dark"} />
        
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>Profile</Text>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <Image 
              source={require('../../assets/images/profile.jpg')} 
              style={[styles.profileImage, { borderColor: theme.accentColor }]}
            />
            <Text style={[styles.profileName, { color: theme.textColor }]}>John Doe</Text>
            <Text style={[styles.profileEmail, { color: theme.secondaryTextColor }]}>john.doe@example.com</Text>
            
            <TouchableOpacity 
              style={[styles.editProfileButton, { 
                backgroundColor: darkMode ? 'rgba(255, 149, 0, 0.1)' : '#f0f0f0' 
              }]}
            >
              <Text style={[styles.editProfileText, { color: theme.accentColor }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.statsSection, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textColor }]}>24</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Workouts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderColor }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textColor }]}>12,500</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Calories</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderColor }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textColor }]}>30</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Days Streak</Text>
            </View>
          </View>
          
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Account</Text>
            
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="person" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Personal Information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryTextColor} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryTextColor} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="card" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Payment Methods</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryTextColor} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Preferences</Text>
            
            <View style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="notifications" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ 
                  false: darkMode ? "#333333" : "#e0e0e0", 
                  true: darkMode ? "rgba(255, 149, 0, 0.3)" : "rgba(67, 97, 238, 0.3)" 
                }}
                thumbColor={notificationsEnabled ? theme.accentColor : "#999999"}
                ios_backgroundColor={darkMode ? "#333333" : "#e0e0e0"}
              />
            </View>
            
            <View style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="moon" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ 
                  false: darkMode ? "#333333" : "#e0e0e0", 
                  true: darkMode ? "rgba(255, 149, 0, 0.3)" : "rgba(67, 97, 238, 0.3)" 
                }}
                thumbColor={darkMode ? theme.accentColor : "#999999"}
                ios_backgroundColor={darkMode ? "#333333" : "#e0e0e0"}
              />
            </View>
            
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="language" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Language</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemRightText, { color: theme.secondaryTextColor }]}>English</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.secondaryTextColor} />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Support</Text>
            
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="help-circle" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryTextColor} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="chatbubble-ellipses" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Contact Us</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryTextColor} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderColor }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.iconBackground }]}>
                  <Ionicons name="star" size={20} color={theme.accentColor} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.textColor }]}>Rate the App</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryTextColor} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            {darkMode ? (
              <LinearGradient
                colors={['#FF9500', '#FF5A00']}
                style={styles.logoutGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="log-out" size={20} color="#000000" />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.logoutGradient, { backgroundColor: 'rgba(245, 83, 83, 0.1)' }]}>
                <Ionicons name="log-out" size={20} color="#F55353" />
                <Text style={[styles.logoutText, { color: '#F55353' }]}>Logout</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.versionText, { color: theme.secondaryTextColor }]}>Version 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: '80%',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRightText: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   TouchableOpacity, 
//   Image,
//   Switch,
//   Alert
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';

// export default function ProfileScreen() {
//   const router = useRouter();
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
//   const handleLogout = () => {
//     Alert.alert(
//       "Logout",
//       "Are you sure you want to logout?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         { 
//           text: "Logout", 
//           onPress: () => router.replace('/') 
//         }
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="dark" />
      
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Profile</Text>
//       </View>
      
//       <ScrollView 
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.profileSection}>
//           <Image 
//             source={require('../../assets/images/profile.jpg')} 
//             style={styles.profileImage}
//           />
//           <Text style={styles.profileName}>John Doe</Text>
//           <Text style={styles.profileEmail}>john.doe@example.com</Text>
          
//           <TouchableOpacity style={styles.editProfileButton}>
//             <Text style={styles.editProfileText}>Edit Profile</Text>
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.statsSection}>
//           <View style={styles.statItem}>
//             <Text style={styles.statValue}>24</Text>
//             <Text style={styles.statLabel}>Workouts</Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.statItem}>
//             <Text style={styles.statValue}>12,500</Text>
//             <Text style={styles.statLabel}>Calories</Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.statItem}>
//             <Text style={styles.statValue}>30</Text>
//             <Text style={styles.statLabel}>Days Streak</Text>
//           </View>
//         </View>
        
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Account</Text>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="person" size={20} color="#4361ee" />
//               </View>
//               <Text style={styles.menuItemText}>Personal Information</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="shield-checkmark" size={20} color="#3CCF4E" />
//               </View>
//               <Text style={styles.menuItemText}>Privacy & Security</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="card" size={20} color="#F55353" />
//               </View>
//               <Text style={styles.menuItemText}>Payment Methods</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Preferences</Text>
          
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="notifications" size={20} color="#4361ee" />
//               </View>
//               <Text style={styles.menuItemText}>Notifications</Text>
//             </View>
//             <Switch
//               value={notificationsEnabled}
//               onValueChange={setNotificationsEnabled}
//               trackColor={{ false: "#e0e0e0", true: "#4361ee" }}
//               thumbColor="#ffffff"
//             />
//           </View>
          
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="moon" size={20} color="#3CCF4E" />
//               </View>
//               <Text style={styles.menuItemText}>Dark Mode</Text>
//             </View>
//             <Switch
//               value={darkModeEnabled}
//               onValueChange={setDarkModeEnabled}
//               trackColor={{ false: "#e0e0e0", true: "#4361ee" }}
//               thumbColor="#ffffff"
//             />
//           </View>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="language" size={20} color="#F55353" />
//               </View>
//               <Text style={styles.menuItemText}>Language</Text>
//             </View>
//             <View style={styles.menuItemRight}>
//               <Text style={styles.menuItemRightText}>English</Text>
//               <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//             </View>
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Support</Text>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="help-circle" size={20} color="#4361ee" />
//               </View>
//               <Text style={styles.menuItemText}>Help Center</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="chatbubble-ellipses" size={20} color="#3CCF4E" />
//               </View>
//               <Text style={styles.menuItemText}>Contact Us</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="star" size={20} color="#F55353" />
//               </View>
//               <Text style={styles.menuItemText}>Rate the App</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
//         </View>
        
//         <TouchableOpacity 
//           style={styles.logoutButton}
//           onPress={handleLogout}
//         >
//           <Ionicons name="log-out" size={20} color="#F55353" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
        
//         <Text style={styles.versionText}>Version 1.0.0</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   headerTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 24,
//     color: '#333',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   profileSection: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   profileName: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 20,
//     color: '#333',
//     marginBottom: 4,
//   },
//   profileEmail: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     color: '#94a3b8',
//     marginBottom: 16,
//   },
//   editProfileButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 20,
//   },
//   editProfileText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 14,
//     color: '#333',
//   },
//   statsSection: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statValue: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#333',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     color: '#94a3b8',
//   },
//   statDivider: {
//     width: 1,
//     height: '80%',
//     backgroundColor: '#e0e0e0',
//   },
//   section: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#333',
//     marginBottom: 16,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuItemIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   menuItemText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#333',
//   },
//   menuItemRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuItemRightText: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     color: '#94a3b8',
//     marginRight: 8,
//   },
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(245, 83, 83, 0.1)',
//     borderRadius: 12,
//     paddingVertical: 16,
//     marginBottom: 16,
//   },
//   logoutText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#F55353',
//     marginLeft: 8,
//   },
//   versionText: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     color: '#94a3b8',
//     textAlign: 'center',
//   },
// });

// import React, { useContext, useState } from 'react';
// import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
// import EquipmentsModal from '../../components/EquipmentsModal';
// import { supabase } from '../../utils/supabaseClient';
// import { useRouter } from "expo-router"; //  Import router for navigation

// const Profile = () => {
//   const router = useRouter(); //  Initialize router
//   const [EquipmentsModalVisible, setEquipmentsModalVisible] = useState(false);
//   const handleLogout = async () => {
//     console.log("📢 Logging out user...");

//     try {
//       const { error } = await supabase.auth.signOut();
      
//       if (error) {
//         console.error("❌ Logout Error:", error.message);
//         Alert.alert("⚠️ Logout failed", error.message);
//       } else {
//         console.log("✅ Logout Successful");
//         Alert.alert("✅ Logged out successfully!");
        
//         // ✅ Redirect user to login page
//         router.replace("/auth/login");
//       }
//     } catch (err) {
//       console.error("🚨 Unexpected Error:", err);
//       Alert.alert("⚠️ An unexpected error occurred.");
//     }
//   };
//   const accountItems = [
//     { id: '1', title: 'Email Address', value: 'ankurgyawali@gmail.com' },
//     { id: '13', title: 'Available Equipment', value: 'No Equipment' },
//     { id: '2', title: 'Subscribe to log unlimited workouts' },
//     { id: '3', title: 'View Workout Report' },
//     { id: '4', title: 'Log Out' },
//     { id: '5', title: 'Fitness question? Ask our trainer' },
//     { id: '6', title: 'Learn How Fitbod Works' },
//     { id: '7', title: 'View Your 2024 Workout Report' },
//     { id: '8', title: 'Health Profile' },
//     { id: '9', title: 'Unit of Measurement', value: 'Lb (pounds)' },
//     { id: '10', title: 'Export Workout Data' },
//     { id: '11', title: 'Apple Health', status: 'Connected' },
//     { id: '12', title: 'Strava', status: 'Not Connected' },
//   ];



//   const renderItem = ({ item }: { item: { id: string; title: string; value?: string; status?: string } }) => (
//     <TouchableOpacity 
//       style={styles.item} 
//       onPress={() => {
//         if (item.title === "Log Out") {
//           handleLogout(); // 🚀 Call handleLogout when "Log Out" is pressed
//         }
//       }}
//     >
//       <Text style={styles.itemTitle}>{item.title}</Text>
//       {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
//       {item.status && (
//         <Text style={[styles.itemStatus, item.status === 'Connected' ? styles.connected : styles.notConnected]}>
//           {item.status}
//         </Text>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.sectionHeader}>Account</Text>
//       <FlatList
//         data={accountItems}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         style={styles.section}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor: '#121212',
//     padding: 20,
//     marginBottom: 0,
//   },
//   sectionHeader: {
//     color: '#000000',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginVertical: 40,
//     marginBottom: 15,
//   },
//   section: {
//     marginBottom: 0,
//   },
//   item: {
//     backgroundColor: '#ffffff',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   itemTitle: {
//     color: '#000000',
//     fontSize: 14,
//   },
//   itemValue: {
//     color: '#000000',
//     fontSize: 12,
//     marginTop: 5,
//   },
//   itemStatus: {
//     fontSize: 12,
//     marginTop: 5,
//   },
//   connected: {
//     color: '#00FF00',
//   },
//   notConnected: {
//     color: '#FF0000',
//   },
// });

// export default Profile;
