// components/WeeklyGraph.tsx
import React from 'react'
import { Dimensions, View, Text } from 'react-native'
import { LineChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width - 32  // give 16px padding each side

interface ActivityDay { day: string; workouts: number; calories: number }
interface Props { weeklyActivity: ActivityDay[]; isDarkMode: boolean; colors: any }

export default function WeeklyGraph({ weeklyActivity, isDarkMode, colors }: Props) {
    // Ensure we have valid data
    const validData = weeklyActivity.filter(d => 
        d && typeof d.calories === 'number' && !isNaN(d.calories)
    );
    
    // Make sure we have data before trying to render the chart
    if (validData.length === 0) {
        return (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.text }}>No activity data available</Text>
            </View>
        );
    }
    
    // Format day labels - just use first 3 letters of the day or date
    const labels = validData.map(d => {
        // If day contains a date (like "2023-05-01"), extract the day part
        const parts = d.day.split('-');
        if (parts.length === 3) {
            return parts[2]; // Return just the day number
        }
        return d.day.substring(0, 3); // Otherwise first 3 chars
    });
    
    // Make sure all calorie values are numbers and positive
    const data = validData.map(d => Math.max(0, d.calories || 0));
    
    // Ensure there are no zero values that could cause division by zero
    const hasValidYValues = data.some(val => val > 0);
    
    // If all values are zero, provide a minimal dataset to avoid rendering issues
    if (!hasValidYValues) {
        return (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.text }}>No calories recorded this week</Text>
            </View>
        );
    }

    return (
        <View>
            <LineChart
                data={{ 
                    labels, 
                    datasets: [{ data }] 
                }}
                width={screenWidth}
                height={180}
                yAxisSuffix=" cal"
                chartConfig={{
                    backgroundGradientFrom: isDarkMode ? "#1F1F1F" : "#FFFFFF",
                    backgroundGradientTo: isDarkMode ? "#1F1F1F" : "#FFFFFF",
                    decimalPlaces: 0,
                    color: (opacity = 1) =>
                        isDarkMode
                            ? `rgba(255,149,0,${opacity})`
                            : `rgba(99,102,241,${opacity})`,
                    labelColor: () => colors.secondaryText,
                    propsForDots: {
                        r: "4",
                        strokeWidth: "2",
                        stroke: isDarkMode ? "#FF9500" : "#6366F1",
                    },
                    // Set sensible min/max values to avoid scaling issues
                    // Removed 'min' as it is not a valid property
                    // Calculate a sensible max based on the data
                    // Removed 'max' as it is not a valid property
                }}
                bezier // Smoothed line
                style={{ marginVertical: 8, borderRadius: 12 }}
                withInnerLines={true}
                withOuterLines={false}
            />
        </View>
    )
}

// // components/WeeklyGraph.tsx
// import React from 'react'
// import { Dimensions, View } from 'react-native'
// import { LineChart } from 'react-native-chart-kit'

// const screenWidth = Dimensions.get('window').width - 32  // give 16px padding each side

// interface ActivityDay { day: string; workouts: number; calories: number }
// interface Props { weeklyActivity: ActivityDay[]; isDarkMode: boolean; colors: any }

// export default function WeeklyGraph({ weeklyActivity, isDarkMode, colors }: Props) {
//     const validData = weeklyActivity.filter(d => 
//         d && typeof d.calories === 'number' && !isNaN(d.calories)
//       ) || [];
    
//       const labels = validData.map(d => d.day.substring(0, 3)); 
//       const data = validData.map(d => Math.max(0, d.calories)); 

//   return (
//     <View>
//       <LineChart
//         data={{ labels, datasets: [{ data }] }}
//         width={screenWidth}
//         height={180}
//         yAxisSuffix=" cal"
//         chartConfig={{
//           backgroundGradientFrom: isDarkMode ? "#1F1F1F" : "#FFFFFF",
//           backgroundGradientTo:   isDarkMode ? "#1F1F1F" : "#FFFFFF",
//           decimalPlaces: 0,
//           color: (opacity = 1) =>
//             isDarkMode
//               ? `rgba(255,149,0,${opacity})`
//               : `rgba(99,102,241,${opacity})`,
//           labelColor: () => colors.secondaryText,
//           propsForDots: {
//             r: "4",
//             strokeWidth: "2",
//             stroke: isDarkMode ? "#FF9500" : "#6366F1",
//           },
//         }}
//         style={{ marginVertical: 8, borderRadius: 12 }}
//       />
//     </View>
//   )
// }










// import React from "react";
// import { View, Text, StyleSheet, Dimensions } from "react-native";
// import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

// const { width } = Dimensions.get("window");

// interface WeeklyGraphProps {
//   weeklyActivity: { day: string; workouts: number; calories: number }[];
//   isDarkMode: boolean;
//   colors: { secondaryText: string };
// }

// const WeeklyGraph: React.FC<WeeklyGraphProps> = ({ weeklyActivity, isDarkMode, colors }) => {
//   // Make sure weeklyActivity is valid and has data
//   const validData = weeklyActivity && weeklyActivity.length > 0 
//     ? weeklyActivity.filter(day => 
//         day && typeof day.calories === 'number' && !isNaN(day.calories)
//       )
//     : [];

//   // Function to generate path safely with fallbacks for invalid data
//   const generateAreaPath = (data: { day: string; workouts: number; calories: number }[]) => {
//     const w = width - 60;
//     const h = 120;
    
//     // Handle empty data
//     if (!data || data.length === 0) {
//       return `M 0 ${h} L ${w} ${h} Z`;
//     }
    
//     // Calculate max safely with a minimum value to prevent division by zero
//     const caloriesValues = data.map(d => (d && d.calories) || 0);
//     const maxCal = Math.max(100, ...caloriesValues);
    
//     let path = `M 0 ${h}`;
    
//     data.forEach((d, i) => {
//       const x = (w / Math.max(1, data.length - 1)) * i;
//       const calories = (d && typeof d.calories === 'number') ? d.calories : 0;
//       const rawY = h - (calories / maxCal) * h;
//       const y = Math.max(0, Math.min(h, rawY)); // Clamp between 0 and h
//       path += ` L ${x} ${y}`;
//     });
    
//     // Close the path
//     path += ` L ${w} ${h} Z`;
//     return path;
//   };

//   // Generate data points for chart
//   const generateDataPoints = (data: { day: string; workouts: number; calories: number }[]) => {
//     if (!data || data.length === 0) return [];

//     const maxCalories = Math.max(
//       ...data.map((day) => (day && day.calories) || 0),
//       100
//     );
//     const chartWidth = width - 60;
//     const chartHeight = 120;
//     const pointWidth = chartWidth / Math.max(1, data.length - 1);

//     return data.map((day, index) => {
//       const x = index * pointWidth;
//       const calories = (day && typeof day.calories === 'number') ? day.calories : 0;
//       const y = chartHeight - (calories / maxCalories) * chartHeight;
//       return { 
//         x, 
//         y: Math.max(0, Math.min(chartHeight, y)), // Ensure valid y values
//         value: calories,
//         workouts: (day && day.workouts) || 0
//       };
//     });
//   };

//   // Day labels
//   const dayLabels = validData.map(day => {
//     if (!day || !day.day) return "";
//     const dateParts = day.day.split("-");
//     if (dateParts.length !== 3) return "";
    
//     // Use the day part of the date
//     return dateParts[2].replace(/^0+/, ''); // Remove leading zeros
//   });

//   const dataPoints = generateDataPoints(validData);
//   const areaPath = generateAreaPath(validData);

//   return (
//     <View style={styles.container}>
//       <Svg width={width - 60} height={120} style={styles.chart}>
//         <Defs>
//           <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
//             <Stop
//               offset="0"
//               stopColor={isDarkMode ? "#FF9500" : "#6366F1"}
//               stopOpacity="0.4"
//             />
//             <Stop
//               offset="1"
//               stopColor={isDarkMode ? "#FF9500" : "#6366F1"}
//               stopOpacity="0.1"
//             />
//           </LinearGradient>
//         </Defs>

//         {/* Area Chart */}
//         <Path
//           d={areaPath}
//           fill="url(#areaGradient)"
//           stroke="transparent"
//         />

//         {/* Line */}
//         <Path
//           d={areaPath.replace(/Z$/, '')} // Remove the closing Z command
//           fill="none"
//           stroke={isDarkMode ? "#FF9500" : "#6366F1"}
//           strokeWidth="2"
//         />

//         {/* Data Points */}
//         {dataPoints.map((point, index) => (
//           <Circle
//             key={index}
//             cx={point.x}
//             cy={point.y}
//             r={point.workouts > 0 ? 4 : 3}
//             fill={
//               point.workouts > 0
//                 ? isDarkMode
//                   ? "#FF9500"
//                   : "#6366F1"
//                 : isDarkMode
//                 ? "#1C1C1E"
//                 : "#FFFFFF"
//             }
//             stroke={isDarkMode ? "#FF9500" : "#6366F1"}
//             strokeWidth="1.5"
//           />
//         ))}
//       </Svg>

//       {/* Day Labels */}
//       <View style={styles.dayLabelsContainer}>
//         {dayLabels.map((dayLabel, index) => (
//           <View key={index} style={styles.dayLabelWrapper}>
//             <Text
//               style={[
//                 styles.dayText,
//                 { color: colors.secondaryText }
//               ]}
//             >
//               {dayLabel}
//             </Text>
//             {validData[index] && validData[index].workouts > 0 && (
//               <View
//                 style={[
//                   styles.workoutDot,
//                   { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }
//                 ]}
//               />
//             )}
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 8
//   },
//   chart: {
//     marginBottom: 8
//   },
//   dayLabelsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 5
//   },
//   dayLabelWrapper: {
//     alignItems: "center",
//     position: "relative"
//   },
//   dayText: {
//     fontSize: 11
//   },
//   workoutDot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     marginTop: 2
//   }
// });

// export default WeeklyGraph;
