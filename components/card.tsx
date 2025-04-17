// import React from "react";
// import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

// type CardProps = {
//   title?: string; // Optional title
//   description?: string; // Optional description
//   children?: React.ReactNode; // Allows any custom content inside
//   cardStyle?: ViewStyle; // Custom styles for the card
//   titleStyle?: TextStyle; // Custom styles for title
//   descriptionStyle?: TextStyle; // Custom styles for description
// };

// const Card: React.FC<CardProps> = ({ 
//   title, 
//   description, 
//   children, 
//   cardStyle, 
//   titleStyle, 
//   descriptionStyle 
// }) => {
//   return (
//     <View style={[styles.card, cardStyle]}>
//       {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
//       {description && <Text style={[styles.description, descriptionStyle]}>{description}</Text>}
//       {children} {/* Allows inserting custom content */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "white",
//     borderRadius: 10,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 5, 
//     marginVertical: 10,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   description: {
//     fontSize: 14,
//     color: "gray",
//   },
// });

// export default Card;




// import React from "react";

// type CardProps = {
//   title: string;
//   description: string;
//   size?: "sm" | "md" | "lg"; // Optional, defaults to "md"
// };

// const Card: React.FC<CardProps> = ({ title, description, size = "md" }) => {
//   const sizeClasses: Record<"sm" | "md" | "lg", string> = {
//     sm: "w-40 h-40",
//     md: "w-60 h-60",
//     lg: "w-80 h-80",
//   };

//   return (
//     <div className={`bg-white shadow-lg rounded-lg p-4 ${sizeClasses[size]}`}>
//       <h2 className="text-lg font-bold">{title}</h2>
//       <p className="text-gray-600">{description}</p>
//     </div>
//   );
// };

// export default Card;
