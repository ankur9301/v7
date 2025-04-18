import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('light');

  // Load saved theme on startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        } else {
          // Use device theme as default if no saved preference
          setTheme(deviceTheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme', error);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  // Save theme changes to storage
  const saveTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const updateTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme === 'dark',
        toggleTheme,
        setTheme: updateTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Theme colors
export const lightTheme = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1F2937',
  secondaryText: '#6B7280',
  accent: '#2563EB',
  border: '#E5E7EB',
  statusBar: 'dark',
  tabBar: '#FFFFFF',
  tabBarActive: '#2563EB',
  tabBarInactive: '#6B7280',
  inputBackground: '#F9FAFB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  gradient: ['#6E45E2', '#88D3CE'],
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  }
};

export const darkTheme = {
  background: '#000000',
  card: '#111111',
  text: '#FFFFFF',
  secondaryText: '#999999',
  accent: '#FF9500',
  border: 'rgba(255, 255, 255, 0.1)',
  statusBar: 'light',
  tabBar: '#111111',
  tabBarActive: '#FF9500',
  tabBarInactive: '#6B7280',
  inputBackground: '#1F1F1F',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  gradient: ['#FF9500', '#FF5500'],
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
};

// import React, { createContext, useState, useEffect, useContext } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useColorScheme } from 'react-native';

// // Define the context type
// type ThemeContextType = {
//   darkMode: boolean;
//   toggleTheme: () => void;
// };

// // Create the context with default values
// export const ThemeContext = createContext<ThemeContextType>({
//   darkMode: true,
//   toggleTheme: () => {},
// });

// // Custom hook to use the theme context
// export const useTheme = () => useContext(ThemeContext);

// // Theme provider component
// export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [darkMode, setDarkMode] = useState(true);
//   const systemColorScheme = useColorScheme();

//   // Load theme preference from storage on mount
//   useEffect(() => {
//     const loadThemePreference = async () => {
//       try {
//         const savedTheme = await AsyncStorage.getItem('darkModeEnabled');
//         if (savedTheme !== null) {
//           setDarkMode(savedTheme === 'true');
//         } else {
//           // Default to system preference if no saved preference
//           setDarkMode(systemColorScheme === 'dark');
//         }
//       } catch (error) {
//         console.error('Error loading theme preference:', error);
//       }
//     };

//     loadThemePreference();
//   }, [systemColorScheme]);

//   // Toggle theme function
//   const toggleTheme = async () => {
//     const newValue = !darkMode;
//     setDarkMode(newValue);
//     try {
//       await AsyncStorage.setItem('darkModeEnabled', newValue.toString());
//     } catch (error) {
//       console.error('Error saving theme preference:', error);
//     }
//   };

//   return (
//     <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// // Theme object generator
// export const createTheme = (darkMode: boolean) => {
//   return {
//     backgroundColor: darkMode ? '#000000' : '#f8f9fa',
//     cardBackground: darkMode ? '#1A1A1A' : '#FFFFFF',
//     textColor: darkMode ? '#FFFFFF' : '#333333',
//     secondaryTextColor: darkMode ? '#999999' : '#94a3b8',
//     accentColor: darkMode ? '#FF9500' : '#4361ee',
//     borderColor: darkMode ? '#333333' : '#e0e0e0',
//     iconBackground: darkMode ? 'rgba(255, 149, 0, 0.1)' : 'rgba(67, 97, 238, 0.1)',
//     tabBarBackground: darkMode ? '#000000' : '#FFFFFF',
//     tabBarActive: darkMode ? '#FF9500' : '#2563eb',
//     tabBarInactive: darkMode ? '#999999' : '#6b7280',
//   };
// };