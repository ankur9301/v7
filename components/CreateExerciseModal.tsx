import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme, darkTheme, lightTheme } from '@/context/ThemeContext';

// Constants for dropdown options
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const CATEGORIES = ['Barbell', 'Cable', 'Dumbbell', 'Machine', 'Bodyweight'];
const MUSCLES = ['Abs', 'Back', 'Biceps', 'Chest', 'Glutes', 'Hamstrings', 'Quadriceps', 'Shoulders', 'Triceps', 'Lower Back'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Selection screen that takes over the whole modal
interface SelectionScreenProps {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onCancel: () => void;
  isDarkMode: boolean;
  colors: any;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({
  title,
  options,
  selectedValue,
  onSelect,
  onCancel,
  isDarkMode,
  colors
}) => {
  return (
    <View style={[styles.selectionContainer, { backgroundColor: colors.background }]}>
      <View style={styles.selectionHeader}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.selectionTitle, { color: colors.text }]}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={options}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.selectionList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.selectionItem,
              selectedValue === item && { backgroundColor: colors.accent + '20' },
              { borderBottomColor: colors.border }
            ]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.selectionItemText, { color: colors.text }]}>{item}</Text>
            {selectedValue === item && (
              <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (exercise: {
    name: string;
    muscle: string;
    category: string;
    level: string;
  }) => void;
}

const CreateExerciseModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;

  // Form state
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  
  // Selection screen state
  const [selectionType, setSelectionType] = useState<'muscle' | 'category' | 'level' | null>(null);
  
  const resetForm = () => {
    setName('');
    setMuscle('');
    setCategory('');
    setLevel('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const openSelection = (type: 'muscle' | 'category' | 'level') => {
    setSelectionType(type);
  };

  const closeSelection = () => {
    setSelectionType(null);
  };

  const handleSelect = (value: string) => {
    if (selectionType === 'muscle') {
      setMuscle(value);
    } else if (selectionType === 'category') {
      setCategory(value);
    } else if (selectionType === 'level') {
      setLevel(value);
    }
    closeSelection();
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter an exercise name.');
      return;
    }
    
    if (!muscle) {
      Alert.alert('Missing Muscle Group', 'Please select a muscle group.');
      return;
    }
    
    if (!category) {
      Alert.alert('Missing Equipment', 'Please select equipment category.');
      return;
    }
    
    if (!level) {
      Alert.alert('Missing Level', 'Please select difficulty level.');
      return;
    }
    
    onSubmit({ 
      name: name.trim(), 
      muscle, 
      category, 
      level 
    });
    
    resetForm();
    onClose();
  };

  // Selection screen options and titles
  const getSelectionConfig = () => {
    switch (selectionType) {
      case 'muscle':
        return {
          title: 'Select Muscle Group',
          options: MUSCLES,
          selectedValue: muscle
        };
      case 'category':
        return {
          title: 'Select Equipment',
          options: CATEGORIES,
          selectedValue: category
        };
      case 'level':
        return {
          title: 'Select Difficulty Level',
          options: LEVELS,
          selectedValue: level
        };
      default:
        return {
          title: '',
          options: [],
          selectedValue: ''
        };
    }
  };

  // Selection field component
  const SelectField = ({ label, value, placeholder, onPress }: any) => (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity 
        style={[
          styles.selectField, 
          { 
            backgroundColor: isDarkMode ? colors.card : colors.background,
            borderColor: colors.border 
          }
        ]}
        onPress={onPress}
      >
        <Text style={[
          styles.selectFieldText, 
          { color: value ? colors.text : colors.secondaryText }
        ]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const selectionConfig = getSelectionConfig();

  // Main form or selection screen
  const renderContent = () => {
    if (selectionType) {
      return (
        <SelectionScreen
          title={selectionConfig.title}
          options={selectionConfig.options}
          selectedValue={selectionConfig.selectedValue}
          onSelect={handleSelect}
          onCancel={closeSelection}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      );
    }

    return (
      <>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create New Exercise</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={[styles.label, { color: colors.text }]}>Exercise Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDarkMode ? colors.card : colors.background }]}
            placeholder="Enter exercise name"
            placeholderTextColor={colors.secondaryText}
            value={name}
            onChangeText={setName}
          />

          <SelectField 
            label="Muscle Group" 
            value={muscle} 
            placeholder="Select muscle group"
            onPress={() => openSelection('muscle')}
          />

          <SelectField 
            label="Equipment Category" 
            value={category} 
            placeholder="Select equipment type"
            onPress={() => openSelection('category')}
          />

          <SelectField 
            label="Difficulty Level" 
            value={level} 
            placeholder="Select difficulty level"
            onPress={() => openSelection('level')}
          />
        </ScrollView>

        <View style={[styles.buttonContainer, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.accent }]} 
            onPress={handleSave}
          >
            <Ionicons name="save-outline" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Save Exercise</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  selectFieldText: {
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  button: {
    flexDirection: 'row',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Selection screen styles
  selectionContainer: {
    flex: 1,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  selectionList: {
    paddingHorizontal: 16,
  },
  selectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  selectionItemText: {
    fontSize: 16,
  },
});

export default CreateExerciseModal;

// import React, { useState, useRef } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   Pressable,
//   Animated,
//   Dimensions,
// } from 'react-native';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import { useTheme, darkTheme, lightTheme } from '@/context/ThemeContext';

// // Constants for dropdown options
// const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
// const CATEGORIES = ['Barbell', 'Cable', 'Dumbbell', 'Machine', 'Bodyweight'];
// const MUSCLES = ['Abs', 'Back', 'Biceps', 'Chest', 'Glutes', 'Hamstrings', 'Quadriceps', 'Shoulders', 'Triceps'];

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// interface DropdownProps {
//   options: string[];
//   selectedValue: string;
//   onSelect: (value: string) => void;
//   placeholder: string;
//   isDarkMode: boolean;
//   colors: any;
//   zIndex: number;
// }

// // Dropdown component with proper z-index handling
// const Dropdown: React.FC<DropdownProps> = ({ 
//   options, 
//   selectedValue, 
//   onSelect, 
//   placeholder,
//   isDarkMode,
//   colors,
//   zIndex
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const openDropdown = () => {
//     setIsOpen(true);
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeDropdown = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start(() => setIsOpen(false));
//   };

//   const toggleDropdown = () => {
//     if (isOpen) {
//       closeDropdown();
//     } else {
//       openDropdown();
//     }
//   };

//   const handleSelect = (value: string) => {
//     onSelect(value);
//     closeDropdown();
//   };

//   return (
//     <View style={[styles.dropdownContainer, { zIndex }]}>
//       <Pressable 
//         style={[
//           styles.dropdownButton,
//           { 
//             backgroundColor: isDarkMode ? colors.card : colors.backgroundLight,
//             borderColor: colors.border
//           }
//         ]}
//         onPress={toggleDropdown}
//       >
//         <Text style={[styles.dropdownButtonText, { color: selectedValue ? colors.text : colors.secondaryText }]}>
//           {selectedValue || placeholder}
//         </Text>
//         <Ionicons 
//           name={isOpen ? "chevron-up" : "chevron-down"} 
//           size={20} 
//           color={colors.text} 
//         />
//       </Pressable>
      
//       {isOpen && (
//         <>
//           <TouchableOpacity 
//             style={StyleSheet.absoluteFill} 
//             onPress={closeDropdown} 
//             activeOpacity={1}
//           />
//           <Animated.View 
//             style={[
//               styles.dropdownMenu, 
//               { 
//                 backgroundColor: colors.card, 
//                 borderColor: colors.border,
//                 opacity: fadeAnim,
//                 zIndex: zIndex + 1
//               }
//             ]}
//           >
//             <ScrollView 
//               nestedScrollEnabled={true} 
//               style={{ maxHeight: SCREEN_HEIGHT * 0.3 }}
//               showsVerticalScrollIndicator={true}
//             >
//               {options.map((item) => (
//                 <TouchableOpacity
//                   key={item}
//                   style={[
//                     styles.dropdownItem,
//                     selectedValue === item && { backgroundColor: colors.accent + '20' }
//                   ]}
//                   onPress={() => handleSelect(item)}
//                 >
//                   <Text style={[styles.dropdownItemText, { color: colors.text }]}>{item}</Text>
//                   {selectedValue === item && (
//                     <Ionicons name="checkmark" size={18} color={colors.accent} />
//                   )}
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </Animated.View>
//         </>
//       )}
//     </View>
//   );
// };

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onSubmit: (exercise: {
//     name: string;
//     muscle: string;
//     category: string;
//     level: string;
//   }) => void;
// }

// const CreateExerciseModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
//   const { isDarkMode } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;

//   const [name, setName] = useState('');
//   const [muscle, setMuscle] = useState('');
//   const [category, setCategory] = useState('');
//   const [level, setLevel] = useState('');
  
//   const resetForm = () => {
//     setName('');
//     setMuscle('');
//     setCategory('');
//     setLevel('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const handleSave = () => {
//     if (!name.trim()) {
//       Alert.alert('Missing Name', 'Please enter an exercise name.');
//       return;
//     }
    
//     if (!muscle) {
//       Alert.alert('Missing Muscle Group', 'Please select a muscle group.');
//       return;
//     }
    
//     if (!category) {
//       Alert.alert('Missing Equipment', 'Please select equipment category.');
//       return;
//     }
    
//     if (!level) {
//       Alert.alert('Missing Level', 'Please select difficulty level.');
//       return;
//     }
    
//     onSubmit({ 
//       name: name.trim(), 
//       muscle, 
//       category, 
//       level 
//     });
    
//     resetForm();
//     onClose();
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View style={styles.overlay}>
//         <View style={[styles.container, { backgroundColor: colors.background }]}>
//           <View style={styles.header}>
//             <Text style={[styles.title, { color: colors.text }]}>Create New Exercise</Text>
//             <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
//               <MaterialIcons name="close" size={24} color={colors.text} />
//             </TouchableOpacity>
//           </View>

//           {/* Main form content */}
//           <ScrollView contentContainerStyle={styles.formContent}>
//             <Text style={[styles.label, { color: colors.text }]}>Exercise Name</Text>
//             <TextInput
//               style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDarkMode ? colors.card : colors.background }]}
//               placeholder="Enter exercise name"
//               placeholderTextColor={colors.secondaryText}
//               value={name}
//               onChangeText={setName}
//             />

//             {/* Each dropdown needs its own z-index */}
//             <Text style={[styles.label, { color: colors.text }]}>Muscle Group</Text>
//             <Dropdown
//               options={MUSCLES}
//               selectedValue={muscle}
//               onSelect={setMuscle}
//               placeholder="Select muscle group"
//               isDarkMode={isDarkMode}
//               colors={colors}
//               zIndex={3000}
//             />

//             <Text style={[styles.label, { color: colors.text }]}>Equipment Category</Text>
//             <Dropdown
//               options={CATEGORIES}
//               selectedValue={category}
//               onSelect={setCategory}
//               placeholder="Select equipment type"
//               isDarkMode={isDarkMode}
//               colors={colors}
//               zIndex={2000}
//             />

//             <Text style={[styles.label, { color: colors.text }]}>Difficulty Level</Text>
//             <Dropdown
//               options={LEVELS}
//               selectedValue={level}
//               onSelect={setLevel}
//               placeholder="Select difficulty level"
//               isDarkMode={isDarkMode}
//               colors={colors}
//               zIndex={1000}
//             />
            
//             {/* Extra space to ensure content is scrollable */}
//             <View style={{ height: 60 }} />
//           </ScrollView>

//           <View style={styles.buttonContainer}>
//             <TouchableOpacity 
//               style={[styles.button, { backgroundColor: colors.accent }]} 
//               onPress={handleSave}
//             >
//               <Ionicons name="save-outline" size={20} color="white" style={styles.buttonIcon} />
//               <Text style={styles.buttonText}>Save Exercise</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   container: {
//     height: '80%',
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     overflow: 'hidden',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   closeButton: {
//     padding: 4,
//   },
//   formContent: {
//     padding: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 8,
//     marginTop: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 14,
//     fontSize: 16,
//   },
//   buttonContainer: {
//     padding: 20,
//     paddingBottom: 30,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(0,0,0,0.1)',
//   },
//   button: {
//     flexDirection: 'row',
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//   },
//   buttonIcon: {
//     marginRight: 10,
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   dropdownContainer: {
//     position: 'relative',
//     marginBottom: 16,
//   },
//   dropdownButton: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 14,
//   },
//   dropdownButtonText: {
//     fontSize: 16,
//   },
//   dropdownMenu: {
//     position: 'absolute',
//     top: '100%',
//     left: 0,
//     right: 0,
//     borderWidth: 1,
//     borderRadius: 12,
//     marginTop: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   dropdownItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 14,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: 'rgba(0,0,0,0.1)',
//   },
//   dropdownItemText: {
//     fontSize: 16,
//   }
// });

// export default CreateExerciseModal;


// import React, { useState } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import { useTheme, darkTheme, lightTheme } from '@/context/ThemeContext';

// const levels = ['Beginner', 'Intermediate', 'Advanced'];
// const categories = ['Barbell', 'Cable', 'Dumbbell', 'Machine', 'Bodyweight'];
// const muscles = ['Abs', 'Back', 'Biceps', 'Chest', 'Glutes', 'Hamstrings', 'Quadriceps', 'Shoulders', 'Triceps'];

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onSubmit: (exercise: {
//     name: string;
//     muscle: string;
//     category: string;
//     level: string;
//   }) => void;
// }

// const CreateExerciseModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
//   const { isDarkMode } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;

//   const [name, setName] = useState('');
//   const [muscle, setMuscle] = useState('');
//   const [category, setCategory] = useState('');
//   const [level, setLevel] = useState('');

//   const handleSave = () => {
//     if (!name || !muscle || !category || !level) {
//       Alert.alert('Missing Fields', 'Please fill all fields.');
//       return;
//     }
//     onSubmit({ name, muscle, category, level });
//     setName('');
//     setMuscle('');
//     setCategory('');
//     setLevel('');
//     onClose();
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View style={styles.overlay}>
//         <View style={[styles.container, { backgroundColor: colors.background }]}>
//           <View style={styles.header}>
//             <Text style={[styles.title, { color: colors.text }]}>Create New Exercise</Text>
//             <TouchableOpacity onPress={onClose}>
//               <MaterialIcons name="close" size={24} color={colors.text} />
//             </TouchableOpacity>
//           </View>

//           <ScrollView>
//             <TextInput
//               style={[styles.input, { color: colors.text, borderColor: colors.border }]}
//               placeholder="Exercise Name"
//               placeholderTextColor={colors.secondaryText}
//               value={name}
//               onChangeText={setName}
//             />

//             <TextInput
//               style={[styles.input, { color: colors.text, borderColor: colors.border }]}
//               placeholder="Muscle Group (e.g. Chest)"
//               placeholderTextColor={colors.secondaryText}
//               value={muscle}
//               onChangeText={setMuscle}
//             />

//             <TextInput
//               style={[styles.input, { color: colors.text, borderColor: colors.border }]}
//               placeholder="Equipment Category (e.g. Dumbbell)"
//               placeholderTextColor={colors.secondaryText}
//               value={category}
//               onChangeText={setCategory}
//             />

//             <TextInput
//               style={[styles.input, { color: colors.text, borderColor: colors.border }]}
//               placeholder="Level (Beginner / Intermediate / Advanced)"
//               placeholderTextColor={colors.secondaryText}
//               value={level}
//               onChangeText={setLevel}
//             />
//           </ScrollView>

//           <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={handleSave}>
//             <Text style={styles.buttonText}>Save Exercise</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   container: {
//     height: '80%',
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 16,
//   },
//   button: {
//     padding: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default CreateExerciseModal;