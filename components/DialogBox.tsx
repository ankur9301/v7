import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DialogBoxProps {
  visible: boolean;
  options: string[];
  onClose: () => void;
  onSelect: (option: string) => void;
  selectedOptions: string[];
  multiple: boolean;
  title: string;
  isDarkMode?: boolean;
}

const DialogBox: React.FC<DialogBoxProps> = ({
  visible,
  options,
  onClose,
  onSelect,
  selectedOptions,
  multiple,
  title,
  isDarkMode = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.dialogContainer,
              { backgroundColor: isDarkMode ? '#111' : '#fff' }
            ]}>
              <View style={styles.header}>
                <Text style={[
                  styles.title,
                  { color: isDarkMode ? '#fff' : '#1f2937' }
                ]}>
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#999' : '#6b7280'} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = selectedOptions.includes(item);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        isSelected && { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.1)' : 'rgba(99, 102, 241, 0.05)' }
                      ]}
                      onPress={() => onSelect(item)}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: isDarkMode ? '#fff' : '#1f2937' },
                        isSelected && { color: isDarkMode ? '#FF9500' : '#6366F1', fontWeight: '600' }
                      ]}>
                        {item}
                      </Text>
                      {isSelected && (
                        <Ionicons 
                          name={multiple ? "checkmark-circle" : "checkmark-circle"} 
                          size={20} 
                          color={isDarkMode ? '#FF9500' : '#6366F1'} 
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.optionsList}
                showsVerticalScrollIndicator={false}
              />
              
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={[
                    styles.doneButton,
                    { backgroundColor: isDarkMode ? '#FF9500' : '#6366F1' }
                  ]} 
                  onPress={onClose}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.3)',
  },
  doneButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DialogBox;

// import React from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// interface DialogBoxProps {
//   visible: boolean;
//   options: string[];
//   onClose: () => void;
//   onSelect: (option: string) => void;
//   selectedOptions: string[];
//   multiple: boolean;
//   title?: string;
// }

// const DialogBox: React.FC<DialogBoxProps> = ({
//   visible,
//   options,
//   onClose,
//   onSelect,
//   selectedOptions,
//   multiple,
//   title = 'Select Options',
// }) => {
//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
//         <View style={styles.content}>
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>{title}</Text>
//             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//               <Ionicons name="close" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>
          
//           <FlatList
//             data={options}
//             keyExtractor={(item) => item}
//             renderItem={({ item }) => {
//               const isSelected = selectedOptions.includes(item);
//               return (
//                 <TouchableOpacity
//                   style={[styles.option, isSelected && styles.selectedOption]}
//                   onPress={() => onSelect(item)}
//                 >
//                   <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
//                     {item}
//                   </Text>
//                   {isSelected && (
//                     <Ionicons name="checkmark" size={20} color="#4361ee" />
//                   )}
//                 </TouchableOpacity>
//               );
//             }}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContent}
//           />
          
//           <View style={styles.footer}>
//             <TouchableOpacity 
//               style={styles.doneButton}
//               onPress={onClose}
//             >
//               <Text style={styles.doneButtonText}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// const { width, height } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     width: width * 0.85,
//     maxHeight: height * 0.7,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   closeButton: {
//     padding: 4,
//   },
//   listContent: {
//     paddingHorizontal: 8,
//   },
//   option: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   selectedOption: {
//     backgroundColor: 'rgba(67, 97, 238, 0.08)',
//   },
//   optionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   selectedOptionText: {
//     color: '#4361ee',
//     fontWeight: '600',
//   },
//   footer: {
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     alignItems: 'center',
//   },
//   doneButton: {
//     backgroundColor: '#4361ee',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     width: '100%',
//     alignItems: 'center',
//   },
//   doneButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default DialogBox;

// import React from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// interface DialogBoxProps {
//   visible: boolean;
//   options: string[];
//   onClose: () => void;
//   onSelect: (option: string) => void;
//   selectedOptions: string[];
//   multiple: boolean;
// }

// const DialogBox: React.FC<DialogBoxProps> = ({
//   visible,
//   options,
//   onClose,
//   onSelect,
//   selectedOptions,
//   multiple,
// }) => {
//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
//         <View style={styles.content}>
//           {options.map((option) => {
//             const isSelected = selectedOptions.includes(option);
//             return (
//               <TouchableOpacity
//                 key={option}
//                 style={[styles.option, isSelected && styles.selectedOption]}
//                 onPress={() => onSelect(option)}
//               >
//                 <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
//                   {option}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     width: '80%',
//   },
//   option: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   selectedOption: {
//     backgroundColor: '#2563eb20',
//   },
//   optionText: {
//     color: '#000',
//   },
//   selectedOptionText: {
//     color: '#2563eb',
//     fontWeight: '500',
//   },
// });

// export default DialogBox;




// import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import React from 'react';

// interface DialogBoxProps {
//   visible: boolean;
//   options: string[];
//   onClose: () => void;
//   onSelect: (option: string) => void;
//   selectedOption: string;
// }

// const DialogBox = ({ visible, options, onClose, onSelect, selectedOption }: DialogBoxProps) => {
//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
//         <View style={styles.content}>
//           {options.map((option) => (
//             <TouchableOpacity
//               key={option}
//               style={[
//                 styles.option,
//                 selectedOption === option && styles.selectedOption
//               ]}
//               onPress={() => onSelect(option)}
//             >
//               <Text style={[
//                 styles.optionText,
//                 selectedOption === option && styles.selectedOptionText
//               ]}>
//                 {option}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     width: '80%',
//   },
//   option: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   selectedOption: {
//     backgroundColor: '#2563eb20',
//   },
//   optionText: {
//     color: '#000',
//   },
//   selectedOptionText: {
//     color: '#2563eb',
//     fontWeight: '500',
//   }
// });

// export default DialogBox;







// import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import React from 'react';

// interface DialogBoxProps {
//   visible: boolean;
//   options: string[];
//   onClose: () => void;
//   onSelect: (option: string) => void;
// }

// const DialogBox = ({ visible, options, onClose, onSelect }: DialogBoxProps) => {
//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <TouchableOpacity style={styles.overlay} onPress={onClose}>
//         <View style={styles.content}>
//           {options.map((option) => (
//             <TouchableOpacity
//               key={option}
//               style={styles.option}
//               onPress={() => onSelect(option)}
//             >
//               <Text>{option}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     width: '80%',
//   },
//   option: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   }
// });

// export default DialogBox;