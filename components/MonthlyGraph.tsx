// // components/MonthlyGraph.tsx
// import React, { useMemo } from 'react'
// import { Dimensions, View, Text, StyleSheet } from 'react-native'
// import { LineChart } from 'react-native-chart-kit'

// const screenWidth = Dimensions.get('window').width - 32  // give 16px padding each side

// interface ActivityDay { day: string; workouts: number; calories: number }
// interface Props { 
//     monthlyActivity: ActivityDay[]; 
//     isDarkMode: boolean; 
//     colors: any;
//     selectedMonth: number;
//     selectedYear: number;
//     setSelectedMonth?: (callback: (prev: number) => number) => void;
//     setSelectedYear?: (callback: (prev: number) => number) => void;
// }

// export default function MonthlyGraph({ monthlyActivity, isDarkMode, colors, selectedMonth, selectedYear }: Props) {
//     // Get month name for display
//     const monthName = useMemo(() => {
//         const months = [
//             'January', 'February', 'March', 'April', 'May', 'June',
//             'July', 'August', 'September', 'October', 'November', 'December'
//         ];
//         return months[selectedMonth];
//     }, [selectedMonth]);

//     // Calculate monthly stats
//     const monthlyStats = useMemo(() => {
//         if (!monthlyActivity || monthlyActivity.length === 0) return { totalCalories: 0, totalWorkouts: 0, avgCaloriesPerWorkout: 0 };
        
//         const totalCalories = monthlyActivity.reduce((sum, day) => sum + (day.calories || 0), 0);
//         const totalWorkouts = monthlyActivity.reduce((sum, day) => sum + (day.workouts || 0), 0);
//         const avgCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;
        
//         return { totalCalories, totalWorkouts, avgCaloriesPerWorkout };
//     }, [monthlyActivity]);
    
//     // Ensure we have valid data
//     const validData = useMemo(() => 
//         monthlyActivity.filter(d => d && typeof d.calories === 'number' && !isNaN(d.calories)),
//         [monthlyActivity]
//     );
    
//     // Make sure we have data before trying to render the chart
//     if (validData.length === 0) {
//         return (
//             <View style={styles.emptyContainer}>
//                 <Text style={[styles.title, { color: colors.text }]}>
//                     {monthName} {selectedYear}
//                 </Text>
//                 <View style={styles.noDataContainer}>
//                     <Text style={{ color: colors.text }}>No activity data available</Text>
//                 </View>
//             </View>
//         );
//     }
    
//     // Format day labels - for monthly data, we'll use the day number
//     const labels = useMemo(() => validData.map((d, index) => {
//         // If day contains a date (like "2023-05-01"), extract the day part
//         const parts = d.day.split('-');
//         if (parts.length === 3) {
//             return parts[2]; // Return just the day number
//         }
//         return d.day.substring(0, 2); // Otherwise first 2 chars
//     }), [validData]);
    
//     // Make sure all calorie values are numbers and positive
//     const data = useMemo(() => 
//         validData.map(d => Math.max(0, d.calories || 0)),
//         [validData]
//     );
    
//     // Get workout data for second dataset
//     const workoutData = useMemo(() => 
//         validData.map(d => Math.max(0, d.workouts || 0) * 100), // Scale up workouts for visibility
//         [validData]
//     );
    
//     // Ensure there are no zero values that could cause division by zero
//     const hasValidYValues = data.some(val => val > 0);
    
//     // If all values are zero, provide a minimal dataset to avoid rendering issues
//     if (!hasValidYValues) {
//         return (
//             <View style={styles.emptyContainer}>
//                 <Text style={[styles.title, { color: colors.text }]}>
//                     {monthName} {selectedYear}
//                 </Text>
//                 <View style={styles.noDataContainer}>
//                     <Text style={{ color: colors.text }}>No calories recorded this month</Text>
//                 </View>
//             </View>
//         );
//     }

//     // Calculate max value for better Y-axis scaling
//     const maxValue = Math.max(...data) * 1.1; // Add 10% headroom

//     return (
//         <View style={styles.container}>
//             <Text style={[styles.title, { color: colors.text }]}>
//                 {monthName} {selectedYear}
//             </Text>
            
//             <View style={styles.statsContainer}>
//                 <View style={styles.statItem}>
//                     <Text style={[styles.statValue, { color: colors.text }]}>{monthlyStats.totalCalories}</Text>
//                     <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Calories</Text>
//                 </View>
//                 <View style={styles.statItem}>
//                     <Text style={[styles.statValue, { color: colors.text }]}>{monthlyStats.totalWorkouts}</Text>
//                     <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
//                 </View>
//                 <View style={styles.statItem}>
//                     <Text style={[styles.statValue, { color: colors.text }]}>{monthlyStats.avgCaloriesPerWorkout}</Text>
//                     <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Avg Cal/Workout</Text>
//                 </View>
//             </View>
            
//             <LineChart
//                 data={{ 
//                     labels, 
//                     datasets: [
//                         { 
//                             data,
//                             color: (opacity = 1) => isDarkMode
//                                 ? `rgba(255,149,0,${opacity})`
//                                 : `rgba(99,102,241,${opacity})`,
//                             strokeWidth: 2
//                         },
//                         { 
//                             data: workoutData,
//                             color: (opacity = 1) => isDarkMode
//                                 ? `rgba(52,199,89,${opacity})`
//                                 : `rgba(34,197,94,${opacity})`,
//                             strokeWidth: 2
//                         }
//                     ],
//                     legend: ['Calories', 'Workouts']
//                 }}
//                 width={screenWidth}
//                 height={220}
//                 yAxisSuffix=" cal"
//                 yAxisInterval={1}
//                 fromZero
//                 segments={5}
//                 formatYLabel={(value) => {
//                     // If this is a workout data point (scaled), don't show the value
//                     if (Number(value) > maxValue) return '';
//                     return value;
//                 }}
//                 chartConfig={{
//                     backgroundGradientFrom: isDarkMode ? "#1F1F1F" : "#FFFFFF",
//                     backgroundGradientTo: isDarkMode ? "#1F1F1F" : "#FFFFFF",
//                     decimalPlaces: 0,
//                     color: (opacity = 1) => isDarkMode
//                         ? `rgba(255,255,255,${opacity})`
//                         : `rgba(0,0,0,${opacity})`,
//                     labelColor: () => colors.secondaryText,
//                     propsForDots: {
//                         r: "4",
//                         strokeWidth: "2",
//                     },
//                     propsForBackgroundLines: {
//                         strokeDasharray: '5, 5',
//                         strokeWidth: 1,
//                         stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
//                     },
//                     propsForLabels: {
//                         fontSize: 10,
//                     }
//                 }}
//                 bezier // Smoothed line
//                 style={styles.chart}
//                 withInnerLines={true}
//                 withOuterLines={false}
//                 withShadow={false}
//                 withHorizontalLabels={true}
//                 withVerticalLabels={true}
//                 withDots={true}
//                 renderDotContent={({x, y, index}) => (
//                     <View key={`dot-${index}`} style={{
//                         position: 'absolute',
//                         top: y - 20,
//                         left: x - 15,
//                     }}>
//                         {data[index] > 0 && (
//                             <Text style={{
//                                 fontSize: 8,
//                                 color: colors.secondaryText,
//                             }}>
//                                 {data[index]}
//                             </Text>
//                         )}
//                     </View>
//                 )}
//             />
            
//             <View style={styles.legendContainer}>
//                 <View style={styles.legendItem}>
//                     <View style={[styles.legendColor, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]} />
//                     <Text style={[styles.legendText, { color: colors.secondaryText }]}>Calories</Text>
//                 </View>
//                 <View style={styles.legendItem}>
//                     <View style={[styles.legendColor, { backgroundColor: isDarkMode ? "#34C759" : "#22C55E" }]} />
//                     <Text style={[styles.legendText, { color: colors.secondaryText }]}>Workouts (×100)</Text>
//                 </View>
//             </View>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         padding: 8,
//         borderRadius: 16,
//         marginVertical: 8,
//     },
//     emptyContainer: {
//         height: 300,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     noDataContainer: {
//         height: 180,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     title: {
//         fontSize: 18,
//         fontWeight: '600',
//         textAlign: 'center',
//         marginBottom: 8,
//     },
//     statsContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         marginBottom: 16,
//     },
//     statItem: {
//         alignItems: 'center',
//     },
//     statValue: {
//         fontSize: 20,
//         fontWeight: '600',
//     },
//     statLabel: {
//         fontSize: 12,
//     },
//     chart: {
//         marginVertical: 8,
//         borderRadius: 12,
//     },
//     legendContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginTop: 8,
//     },
//     legendItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginHorizontal: 10,
//     },
//     legendColor: {
//         width: 12,
//         height: 12,
//         borderRadius: 6,
//         marginRight: 4,
//     },
//     legendText: {
//         fontSize: 12,
//     },
// });
