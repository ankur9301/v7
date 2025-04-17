// import { View, Text, StyleSheet, TouchableOpacity, Image, type ImageSourcePropType, ViewStyle } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { COLORS, FONTS, SHADOWS } from "../constants/theme"

// interface NutritionCardProps {
//   title: string
//   description: string
//   image: ImageSourcePropType
//   onPress: () => void
//   color: string
//   icon: string
// }

// const NutritionCard = ({ title, description, image, onPress, color, icon }: NutritionCardProps) => {
//   return (
//     <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.8}>
//       <View style={styles.iconContainer}>
//         <Ionicons name={icon} size={24} color={color} />
//       </View>
//       <View style={styles.contentContainer}>
//         <Text style={styles.title}>{title}</Text>
//         <Text style={styles.description} numberOfLines={2}>
//           {description}
//         </Text>
//       </View>
//       <View style={styles.imageContainer}>
//         <Image source={image} style={styles.image} />
//       </View>
//       <View style={styles.arrowContainer}>
//         <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
//       </View>
//     </TouchableOpacity>
//   )
// }

// const styles = StyleSheet.create({
//   card: {
//     width: "100%",
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     borderLeftWidth: 4,
//     ...SHADOWS.small,
//   },
//   iconContainer: {
//     marginRight: 12,
//   } as ViewStyle,
//   contentContainer: {
//     flex: 1,
//   },
//   title: {
//     ...FONTS.h4,
//     color: COLORS.darkText,
//     marginBottom: 4,
//   },
//   description: {
//     ...FONTS.body3,
//     color: COLORS.lightText,
//   },
//   imageContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     overflow: "hidden",
//     marginLeft: 12,
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   arrowContainer: {
//     marginLeft: 8,
//   },
// })

// export default NutritionCard

