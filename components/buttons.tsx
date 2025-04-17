import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";

interface CustomButtonProps {
  text: string; // Button text
  icon?: any; // Optional icon
  onPress: () => void; // Callback for button press
  style?: ViewStyle; // Additional styles for the button
  textStyle?: TextStyle; // Additional styles for the text
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  icon,
  onPress,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]} // Combine base and custom styles
      onPress={onPress}
      activeOpacity={0.7} // Match TouchableOpacity opacity behavior
    >
      <View style={styles.content}>
        {icon && <Image source={icon} style={styles.icon} resizeMode="contain" />}
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    paddingVertical: 12,
    alignSelf: "center", // Center align horizontally
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // For Android shadow
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});

export default CustomButton;
