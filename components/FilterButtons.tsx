import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterButtonsProps {
  onTimePress: () => void;
  onMusclesPress: () => void;
  onEquipmentPress: () => void;
  onLevelPress: () => void;
  onClearAllPress: () => void;
  timeLabel: string;
  muscleLabel: string;
  equipmentLabel: string;
  levelLabel: string;
  isFilterActive: boolean;
  enabledFilters: Array<'time' | 'muscles' | 'equipment' | 'level'>;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  onTimePress,
  onMusclesPress,
  onEquipmentPress,
  onLevelPress,
  onClearAllPress,
  timeLabel,
  muscleLabel,
  equipmentLabel,
  levelLabel,
  isFilterActive,
  enabledFilters,
}) => {
  const isTimeActive = timeLabel !== 'Time';
  const isMuscleActive = muscleLabel !== 'Muscles';
  const isEquipmentActive = equipmentLabel !== 'Equipment';
  const isLevelActive = levelLabel !== 'Level';

  const renderFilterButton = (
    label: string,
    onPress: () => void,
    isActive: boolean,
    icon: "time-outline" | "body-outline" | "barbell-outline" | "stats-chart-outline",
    enabled: boolean
  ) => {
    if (!enabled) return null;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.activeFilterButton
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={16}
          color={isActive ? '#ffffff' : '#4b5563'}
          style={styles.filterIcon}
        />
        <Text
          style={[
            styles.filterText,
            isActive && styles.activeFilterText
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={isActive ? '#ffffff' : '#4b5563'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isFilterActive && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClearAllPress}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="#ef4444" />
        </TouchableOpacity>
      )}
      {renderFilterButton(timeLabel, onTimePress, isTimeActive, "time-outline", enabledFilters.includes('time'))}
      {renderFilterButton(muscleLabel, onMusclesPress, isMuscleActive, "body-outline", enabledFilters.includes('muscles'))}
      {renderFilterButton(equipmentLabel, onEquipmentPress, isEquipmentActive, "barbell-outline", enabledFilters.includes('equipment'))}
      {renderFilterButton(levelLabel, onLevelPress, isLevelActive, "stats-chart-outline", enabledFilters.includes('level'))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    height: 40,
  },
  activeFilterButton: {
    backgroundColor: '#4361ee',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#4b5563',
    marginRight: 4,
    maxWidth: 100,
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 20,
    width: 36,
    height: 36,
    marginHorizontal: 4,
  },
});

export default FilterButtons;


// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// interface FilterButtonsProps {
//   onTimePress: () => void;
//   onMusclesPress: () => void;
//   onEquipmentPress: () => void;
//   onLevelPress: () => void;
//   onClearAllPress: () => void;
//   timeLabel: string;
//   muscleLabel: string;
//   equipmentLabel: string;
//   levelLabel: string;
//   isFilterActive: boolean;
//   enabledFilters: Array<'time' | 'muscles' | 'equipment' | 'level'>;
// }

// const FilterButtons: React.FC<FilterButtonsProps> = ({
//   onTimePress,
//   onMusclesPress,
//   onEquipmentPress,
//   onLevelPress,
//   onClearAllPress,
//   timeLabel,
//   muscleLabel,
//   equipmentLabel,
//   levelLabel,
//   isFilterActive,
//   enabledFilters,
// }) => {
//   const isTimeActive = timeLabel !== 'Time';
//   const isMuscleActive = muscleLabel !== 'Muscles';
//   const isEquipmentActive = equipmentLabel !== 'Equipment';
//   const isLevelActive = levelLabel !== 'Level';

//   const renderFilterButton = (
//     label: string, 
//     onPress: () => void, 
//     isActive: boolean,
//     icon: "time-outline" | "body-outline" | "barbell-outline" | "stats-chart-outline",
//     enabled: boolean
//   ) => {
//     if (!enabled) return null;
    
//     return (
//       <TouchableOpacity
//         style={[
//           styles.filterButton,
//           isActive && styles.activeFilterButton
//         ]}
//         onPress={onPress}
//         activeOpacity={0.7}
//       >
//         <Ionicons 
//           name={icon} 
//           size={16} 
//           color={isActive ? '#ffffff' : '#4b5563'} 
//           style={styles.filterIcon}
//         />
//         <Text
//           style={[
//             styles.filterText,
//             isActive && styles.activeFilterText
//           ]}
//           numberOfLines={1}
//         >
//           {label}
//         </Text>
//         <Ionicons 
//           name="chevron-down" 
//           size={16} 
//           color={isActive ? '#ffffff' : '#4b5563'} 
//         />
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {renderFilterButton(timeLabel, onTimePress, isTimeActive, "time-outline", enabledFilters.includes('time'))}
//       {renderFilterButton(muscleLabel, onMusclesPress, isMuscleActive, "body-outline", enabledFilters.includes('muscles'))}
//       {renderFilterButton(equipmentLabel, onEquipmentPress, isEquipmentActive, "barbell-outline", enabledFilters.includes('equipment'))}
//       {renderFilterButton(levelLabel, onLevelPress, isLevelActive, "stats-chart-outline", enabledFilters.includes('level'))}
      
//       {isFilterActive && (
//         <TouchableOpacity
//           style={styles.clearButton}
//           onPress={onClearAllPress}
//           activeOpacity={0.7}
//         >
//           <Ionicons name="close-circle" size={16} color="#ef4444" />
//           <Text style={styles.clearText}>Clear</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 4,
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f3f4f6',
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     marginHorizontal: 4,
//     height: 40,
//   },
//   activeFilterButton: {
//     backgroundColor: '#4361ee',
//   },
//   filterIcon: {
//     marginRight: 4,
//   },
//   filterText: {
//     fontSize: 14,
//     color: '#4b5563',
//     marginRight: 4,
//     maxWidth: 100,
//   },
//   activeFilterText: {
//     color: '#ffffff',
//     fontWeight: '500',
//   },
//   clearButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fee2e2',
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     marginHorizontal: 4,
//     height: 40,
//   },
//   clearText: {
//     fontSize: 14,
//     color: '#ef4444',
//     fontWeight: '500',
//     marginLeft: 4,
//   },
// });

// export default FilterButtons;


// import React from 'react';
// import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

// interface FilterButtonsProps {
//   onTimePress?: () => void;
//   onMusclesPress?: () => void;
//   onEquipmentPress?: () => void;
//   onLevelPress?: () => void;
//   timeLabel: string;
//   muscleLabel: string;
//   equipmentLabel: string;
//   levelLabel: string;
//   isFilterActive: boolean;
//   onClearAllPress: () => void;
//   enabledFilters?: string[]; // New prop to control visible filters
// }

// const FilterButtons: React.FC<FilterButtonsProps> = ({
//   onTimePress,
//   onMusclesPress,
//   onEquipmentPress,
//   onLevelPress,
//   timeLabel,
//   muscleLabel,
//   equipmentLabel,
//   levelLabel,
//   isFilterActive,
//   onClearAllPress,
//   enabledFilters = ['time', 'muscles', 'equipment', 'level'], // Default to all filters enabled
// }) => {
//   return (
//     <View style={styles.container}>
//       {/* Clear All Button */}
//       {isFilterActive && (
//         <TouchableOpacity style={styles.clearAllButton} onPress={onClearAllPress}>
//           <Text style={styles.clearAllText}>X</Text>
//         </TouchableOpacity>
//       )}

//       {/* Conditionally Render Buttons */}
//       {enabledFilters.includes('time') && (
//         <TouchableOpacity style={styles.time_button} onPress={onTimePress}>
//           <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
//             {timeLabel}
//           </Text>
//         </TouchableOpacity>
//       )}
//       {enabledFilters.includes('muscles') && (
//         <TouchableOpacity style={styles.button} onPress={onMusclesPress}>
//           <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
//             {muscleLabel}
//           </Text>
//         </TouchableOpacity>
//       )}
//       {enabledFilters.includes('equipment') && (
//         <TouchableOpacity style={styles.button} onPress={onEquipmentPress}>
//           <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
//             {equipmentLabel}
//           </Text>
//         </TouchableOpacity>
//       )}
//       {enabledFilters.includes('level') && (
//         <TouchableOpacity style={styles.button} onPress={onLevelPress}>
//           <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
//             {levelLabel}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start', // Align buttons to the start
//     gap: 4,
//   },
//   button: {
//     width: 100, // Fixed width for consistency
//     height: 40, // Fixed height for consistency
//     backgroundColor: 'white',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   time_button: {
//     width: 77, // Fixed width for consistency
//     height: 40, // Fixed height for consistency
//     backgroundColor: 'white',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   buttonText: {
//     color: '#2563eb',
//     fontWeight: '500',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   clearAllButton: {
//     width: 40, // Smaller size for clear button
//     height: 40,
//     backgroundColor: '#f00',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   clearAllText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
// });

// export default FilterButtons;





// import React from 'react';
// import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

// interface FilterButtonsProps {
//   onTimePress: () => void;
//   onMusclesPress: () => void;
//   onEquipmentPress: () => void;
//   onLevelPress: () => void;
//   timeLabel: string;
//   muscleLabel: string;
//   equipmentLabel: string;
//   levelLabel: string;
//   isFilterActive: boolean;
//   onClearAllPress: () => void;
// }

// const FilterButtons: React.FC<FilterButtonsProps> = ({
//   onTimePress,
//   onMusclesPress,
//   onEquipmentPress,
//   onLevelPress,
//   timeLabel,
//   muscleLabel,
//   equipmentLabel,
//   levelLabel,
//   isFilterActive,
//   onClearAllPress,
// }) => {
//   return (
//     <View style={styles.container}>
//       {/* Clear All Button */}
//       {isFilterActive && (
//         <TouchableOpacity style={styles.clearAllButton} onPress={onClearAllPress}>
//           <Text style={styles.clearAllText}>X</Text>
//         </TouchableOpacity>
        
//       )}
      

//       {/* Filter Buttons */}

//       <TouchableOpacity style={styles.time_button} onPress={onTimePress}>
//         <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
//           {timeLabel}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.button} onPress={onMusclesPress}>
//         <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
//           {muscleLabel}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.button} onPress={onEquipmentPress}>
//         <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
//           {equipmentLabel}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.button} onPress={onLevelPress}>
//         <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
//           {levelLabel}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start', // Align buttons to the start
//     gap: 4,
//   },
//   button: {
//     width: 100, // Fixed width for consistency
//     height: 40, // Fixed height for consistency
//     backgroundColor: 'white',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   time_button: {
//     width: 77, // Fixed width for consistency
//     height: 40, // Fixed height for consistency
//     backgroundColor: 'white',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   buttonText: {
//     color: '#2563eb',
//     fontWeight: '500',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   clearAllButton: {
//     width: 40, // Smaller size for clear button
//     height: 40,
//     backgroundColor: '#f00',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   clearAllText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
// });

// export default FilterButtons;



// import React from 'react';
// import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

// interface FilterButtonsProps {
//   onBodyPartPress: () => void;
//   onCategoryPress: () => void;
//   selectedMuscle: string;
//   selectedCategory: string;
// }

// const FilterButtons: React.FC<FilterButtonsProps> = ({ onBodyPartPress, onCategoryPress, selectedMuscle, selectedCategory }) => {
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity 
//         style={[styles.button, selectedMuscle ? styles.buttonSelected : null]} 
//         onPress={onBodyPartPress}
//       >
//         <Text style={[styles.buttonText, selectedMuscle ? styles.textSelected : null]}>
//           {selectedMuscle || 'Target Muscle'}
//         </Text>
//       </TouchableOpacity>
//       <TouchableOpacity 
//         style={[styles.button, selectedCategory ? styles.buttonSelected : null]} 
//         onPress={onCategoryPress}
//       >
//         <Text style={[styles.buttonText, selectedCategory ? styles.textSelected : null]}>
//           {selectedCategory || 'Category'}
//         </Text>
//       </TouchableOpacity>
//     </View>
    
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     padding: 16,
//     gap: 8,
//   },
//   button: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   buttonSelected: {
//     backgroundColor: '#2563eb', // Blue color when selected
//   },
//   buttonText: {
//     color: '#2563eb',
//     fontWeight: '500',
//   },
//   textSelected: {
//     color: '#fff',
//   },
// });

// export default FilterButtons;














// import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import React from 'react';

// interface FilterButtonsProps {
//   onBodyPartPress: () => void;
//   onCategoryPress: () => void;
// }

// const FilterButtons: React.FC<FilterButtonsProps> = ({ onBodyPartPress, onCategoryPress }) => {
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.button} onPress={onBodyPartPress}>
//         <Text style={styles.buttonText}>Target Muscle</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.button} onPress={onCategoryPress}>
//         <Text style={styles.buttonText}>Category</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     padding: 16,
//     gap: 8,
//   },
//   button: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   buttonText: {
//     color: '#2563eb',
//     fontWeight: '500',
//   }
// });

// export default FilterButtons;