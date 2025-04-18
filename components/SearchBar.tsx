import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  darkMode?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChangeText, 
  placeholder = 'Search...',
  darkMode = false
}) => {
  return (
    <View style={[
      styles.container, 
      darkMode ? styles.containerDark : styles.containerLight
    ]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={darkMode ? '#999999' : '#6B7280'} 
        style={styles.icon} 
      />
      <TextInput
        style={[
          styles.input,
          darkMode ? styles.inputDark : styles.inputLight
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={darkMode ? '#999999' : '#9CA3AF'}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={darkMode ? '#999999' : '#6B7280'} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  containerLight: {
    backgroundColor: '#F3F4F6',
  },
  containerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  inputLight: {
    color: '#1F2937',
  },
  inputDark: {
    color: '#FFFFFF',
  },
});

export default SearchBar;

// import React from 'react';
// import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// interface SearchBarProps {
//   placeholder: string;
//   value: string;
//   onChangeText: (text: string) => void;
//   onClear?: () => void;
// }

// const SearchBar = ({ placeholder, value, onChangeText, onClear }: SearchBarProps) => {
//   const handleClear = () => {
//     onChangeText('');
//     onClear?.();
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.searchContainer}>
//         <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
//         <TextInput
//           style={styles.input}
//           placeholder={placeholder}
//           placeholderTextColor="#9ca3af"
//           value={value}
//           onChangeText={onChangeText}
//           returnKeyType="search"
//         />
//         {value.length > 0 && (
//           <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
//             <Ionicons name="close-circle" size={18} color="#9ca3af" />
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     height: 48,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1f2937',
//     paddingVertical: 8,
//   },
//   clearButton: {
//     padding: 4,
//   }
// });

// export default SearchBar;


// import { View, TextInput, StyleSheet } from 'react-native';
// import React from 'react';

// interface SearchBarProps {
//   placeholder: string;
//   value: string;
//   onChangeText: (text: string) => void;
// }

// const SearchBar = ({ placeholder, value, onChangeText }: SearchBarProps) => {
//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder={placeholder}
//         value={value}
//         onChangeText={onChangeText}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   input: {
//     backgroundColor: 'white',
//     padding: 12,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   }
// });

// export default SearchBar;