// components/EnhancedWeeklyGraph.tsx
import React, { useMemo } from 'react'
import { Dimensions, View, Text, StyleSheet } from 'react-native'
import { Svg, Rect, Line, Circle, G, Text as SvgText, Path } from 'react-native-svg'

const screenWidth = Dimensions.get('window').width - 32  // give 16px padding each side

interface ActivityDay { day: string; workouts: number; calories: number }
interface Props { 
    weeklyActivity: ActivityDay[]; 
    isDarkMode: boolean; 
    colors: any;
}

export default function EnhancedWeeklyGraph({ weeklyActivity, isDarkMode, colors }: Props) {
    // Ensure we have valid data
    const validData = useMemo(() => 
        weeklyActivity.filter(d => d && typeof d.calories === 'number' && !isNaN(d.calories)),
        [weeklyActivity]
    );
    
    // Make sure we have data before trying to render the chart
    if (validData.length === 0) {
        return (
            <View style={[styles.container, {
                opacity: 1, // Always show the container even when no data
                backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
            }]}>
                <View style={styles.emptyContainer}>
                    <Text style={{ color: colors.text }}>No activity data for this week</Text>
                    <Text style={{ color: colors.secondaryText, marginTop: 8, fontSize: 12 }}>
                        Try selecting a different week or add workouts
                    </Text>
                </View>
            </View>
        );
    }
    
    // Calculate max values for scaling
    const maxCalories = Math.max(...validData.map(d => d.calories || 0), 1);
    const maxWorkouts = Math.max(...validData.map(d => d.workouts || 0), 1);
    
    // Generate path for the line chart
    const generateLinePath = () => {
        const chartWidth = screenWidth - 16;
        const chartHeight = 120;
        const pointWidth = chartWidth / Math.max(1, validData.length - 1);
        
        let path = "";
        
        validData.forEach((day, i) => {
            const x = i * pointWidth;
            const y = chartHeight - (day.calories / maxCalories) * (chartHeight - 20) - 10;
            
            if (i === 0) {
                path = `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
            }
        });
        
        return path;
    };
    
    // Generate path for the area under the line
    const generateAreaPath = () => {
        const chartWidth = screenWidth - 16;
        const chartHeight = 120;
        const pointWidth = chartWidth / Math.max(1, validData.length - 1);
        
        let path = `M 0 ${chartHeight}`;
        
        validData.forEach((day, i) => {
            const x = i * pointWidth;
            const y = chartHeight - (day.calories / maxCalories) * (chartHeight - 20) - 10;
            path += ` L ${x} ${y}`;
        });
        
        path += ` L ${chartWidth} ${chartHeight} Z`;
        return path;
    };
    
    // Stats summary
    const weeklyStats = {
        totalCalories: validData.reduce((sum, day) => sum + (day.calories || 0), 0),
        totalWorkouts: validData.reduce((sum, day) => sum + (day.workouts || 0), 0),
        activeDays: validData.filter(day => day.calories > 0 || day.workouts > 0).length,
    };
    
    return (
        <View style={styles.container}>
            {/* Stats summary */}
            <View style={styles.statsRow}>
                <View style={[styles.statItem, { 
                    backgroundColor: isDarkMode ? 'rgba(255,149,0,0.1)' : 'rgba(99,102,241,0.05)'
                }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {weeklyStats.totalCalories}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                        Calories
                    </Text>
                </View>
                
                <View style={[styles.statItem, { 
                    backgroundColor: isDarkMode ? 'rgba(52,199,89,0.1)' : 'rgba(34,197,94,0.05)'
                }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {weeklyStats.totalWorkouts}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                        Workouts
                    </Text>
                </View>
                
                <View style={[styles.statItem, { 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {Math.round((weeklyStats.activeDays / validData.length) * 100)}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                        Active
                    </Text>
                </View>
            </View>
            
            {/* Chart */}
            <View style={styles.chartContainer}>
                <Svg width={screenWidth - 16} height={120}>
                    {/* Background grid lines */}
                    {[0, 1, 2, 3].map((line) => (
                        <Line
                            key={`grid-line-${line}`}
                            x1={0}
                            y1={30 + line * 30}
                            x2={screenWidth - 16}
                            y2={30 + line * 30}
                            stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                            strokeWidth={1}
                            strokeDasharray="5,5"
                        />
                    ))}
                    
                    {/* Area under the line */}
                    <Path
                        d={generateAreaPath()}
                        fill={isDarkMode ? 'rgba(255,149,0,0.1)' : 'rgba(99,102,241,0.1)'}
                    />
                    
                    {/* Line chart */}
                    <Path
                        d={generateLinePath()}
                        stroke={isDarkMode ? '#FF9500' : '#6366F1'}
                        strokeWidth={2}
                        fill="none"
                    />
                    
                    {/* Data points */}
                    {validData.map((day, index) => {
                        const chartWidth = screenWidth - 16;
                        const chartHeight = 120;
                        const pointWidth = chartWidth / Math.max(1, validData.length - 1);
                        const x = index * pointWidth;
                        const y = chartHeight - (day.calories / maxCalories) * (chartHeight - 20) - 10;
                        
                        return (
                            <G key={`data-point-${index}`}>
                                <Circle
                                    cx={x}
                                    cy={y}
                                    r={4}
                                    fill={isDarkMode ? '#FF9500' : '#6366F1'}
                                />
                                
                                {/* Workout indicator */}
                                {day.workouts > 0 && (
                                    <Circle
                                        cx={x}
                                        cy={chartHeight - 10}
                                        r={3}
                                        fill={isDarkMode ? '#34C759' : '#22C55E'}
                                    />
                                )}
                                
                                {/* Day label */}
                                <SvgText
                                    x={x}
                                    y={chartHeight}
                                    fontSize="10"
                                    textAnchor="middle"
                                    fill={colors.secondaryText}
                                >
                                    {day.day.substring(0, 3)}
                                </SvgText>
                                
                                {/* Value label */}
                                {day.calories > 0 && (
                                    <SvgText
                                        x={x}
                                        y={y - 10}
                                        fontSize="9"
                                        textAnchor="middle"
                                        fill={colors.secondaryText}
                                    >
                                        {day.calories}
                                    </SvgText>
                                )}
                            </G>
                        );
                    })}
                </Svg>
            </View>
            
            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { 
                        backgroundColor: isDarkMode ? '#FF9500' : '#6366F1'
                    }]} />
                    <Text style={[styles.legendText, { color: colors.secondaryText }]}>
                        Calories
                    </Text>
                </View>
                
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { 
                        backgroundColor: isDarkMode ? '#34C759' : '#22C55E'
                    }]} />
                    <Text style={[styles.legendText, { color: colors.secondaryText }]}>
                        Workout
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 16,
        marginVertical: 8,
    },
    emptyContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    statLabel: {
        fontSize: 12,
    },
    chartContainer: {
        marginBottom: 12,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 2,
        marginRight: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    legendText: {
        fontSize: 12,
    },
});
