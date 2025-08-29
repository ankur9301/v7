// components/ModernMonthlyGraph.tsx
import React, { useState, useEffect } from 'react'
import { Dimensions, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Svg, Rect, Line, Circle, G, Text as SvgText } from 'react-native-svg'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native'

const screenWidth = Dimensions.get('window').width - 32  // give 16px padding each side

interface ActivityDay { day: string; workouts: number; calories: number }
interface Props { 
    monthlyActivity: ActivityDay[]; 
    isDarkMode: boolean; 
    colors: any;
    selectedMonth: number;
    setSelectedMonth: (callback: (prev: number) => number) => void;
    selectedYear: number;
    setSelectedYear: (callback: (prev: number) => number) => void;
}

export default function ModernMonthlyGraph({ 
    monthlyActivity, 
    isDarkMode, 
    colors, 
    selectedMonth, 
    setSelectedMonth,
    selectedYear,
    setSelectedYear
}: Props) {
    // Animation values
    const [animation] = useState(new Animated.Value(0));
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    
    // Get month name for display
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Calculate monthly stats
    const monthlyStats = {
        totalCalories: monthlyActivity.reduce((sum, day) => sum + (day.calories || 0), 0),
        totalWorkouts: monthlyActivity.reduce((sum, day) => sum + (day.workouts || 0), 0),
        activeDays: monthlyActivity.filter(day => day.calories > 0 || day.workouts > 0).length,
    };
    
    // Ensure we have valid data
    const validData = monthlyActivity.filter(d => 
        d && typeof d.calories === 'number' && !isNaN(d.calories)
    );
    
    // Animate on mount
    useEffect(() => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [selectedMonth, selectedYear]);
    
    // Handle month navigation
    const goToPreviousMonth = () => {
        setSelectedMonth(prev => {
            if (prev === 0) {
                setSelectedYear(y => y - 1);
                return 11;
            }
            return prev - 1;
        });
    };
    
    const goToNextMonth = () => {
        const currentDate = new Date();
        const isCurrentYearAndMonth = 
            selectedYear === currentDate.getFullYear() && 
            selectedMonth === currentDate.getMonth();
            
        if (isCurrentYearAndMonth) return; // Don't allow going to future months
        
        setSelectedMonth(prev => {
            if (prev === 11) {
                setSelectedYear(y => y + 1);
                return 0;
            }
            return prev + 1;
        });
    };
    
    // Check if we can go to next month (not in the future)
    const canGoToNextMonth = () => {
        const currentDate = new Date();
        if (selectedYear < currentDate.getFullYear()) return true;
        if (selectedYear === currentDate.getFullYear() && selectedMonth < currentDate.getMonth()) return true;
        return false;
    };
    
    // Prepare data for visualization
    const prepareCalendarData = () => {
        // Create a map of day -> data for quick lookup
        const dayMap = new Map();
        validData.forEach(day => {
            const parts = day.day.split('-');
            if (parts.length === 3) {
                const dayNum = parseInt(parts[2]);
                dayMap.set(dayNum, day);
            }
        });
        
        // Get days in month and first day of month
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
        
        // Create calendar grid (6 rows max, 7 columns)
        const calendarGrid = [];
        let dayCounter = 1;
        
        for (let row = 0; row < 6; row++) {
            const weekRow = [];
            for (let col = 0; col < 7; col++) {
                if (row === 0 && col < firstDayOfMonth) {
                    // Empty cells before the first day
                    weekRow.push(null);
                } else if (dayCounter > daysInMonth) {
                    // Empty cells after the last day
                    weekRow.push(null);
                } else {
                    // Valid day
                    const dayData = dayMap.get(dayCounter) || { day: `${selectedYear}-${selectedMonth+1}-${dayCounter}`, workouts: 0, calories: 0 };
                    weekRow.push({
                        dayNum: dayCounter,
                        ...dayData
                    });
                    dayCounter++;
                }
            }
            if (weekRow.some(day => day !== null)) {
                calendarGrid.push(weekRow);
            }
        }
        
        return calendarGrid;
    };
    
    // Find max values for scaling
    const maxCalories = Math.max(...validData.map(d => d.calories || 0), 1);
    const maxWorkouts = Math.max(...validData.map(d => d.workouts || 0), 1);
    
    // Calendar grid data
    const calendarGrid = prepareCalendarData();
    
    // Render month picker
    const renderMonthPicker = () => {
        if (!showMonthPicker) return null;
        
        return (
            <View style={[styles.monthPickerContainer, {
                backgroundColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
                borderColor: isDarkMode ? '#333' : '#ddd'
            }]}>
                <View style={styles.monthsGrid}>
                    {monthNames.map((month, index) => {
                        const isCurrentMonth = 
                            selectedYear === new Date().getFullYear() && 
                            index === new Date().getMonth();
                            
                        const isFutureMonth = 
                            selectedYear === new Date().getFullYear() && 
                            index > new Date().getMonth();
                            
                        const isSelected = index === selectedMonth;
                        
                        return (
                            <TouchableOpacity
                                key={`month-picker-${index}`}
                                style={[
                                    styles.monthItem,
                                    isSelected && {
                                        backgroundColor: isDarkMode ? "#FF9500" : "#6366F1",
                                    },
                                    isFutureMonth && { opacity: 0.5 },
                                ]}
                                onPress={() => {
                                    if (!isFutureMonth) {
                                        setSelectedMonth(() => index);
                                        setShowMonthPicker(false);
                                    }
                                }}
                                disabled={isFutureMonth}
                            >
                                <Text
                                    style={[
                                        styles.monthItemText,
                                        {
                                            color: isSelected ? '#fff' : colors.text,
                                        },
                                    ]}
                                >
                                    {month.substring(0, 3)}
                                    {isCurrentMonth && <Text style={styles.currentMonthDot}>•</Text>}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                
                <TouchableOpacity 
                    style={[styles.closeButton, { backgroundColor: isDarkMode ? "#FF9500" : "#6366F1" }]}
                    onPress={() => setShowMonthPicker(false)}
                >
                    <Text style={styles.closeButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        );
    };
    
    // If no data, show empty state
    if (validData.length === 0) {
        return (
            <View style={[styles.container, { 
                opacity: 1, // Always show the container even when no data
                backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
            }]}>
                <View style={styles.emptyContainer}>
                    <Text style={{ color: colors.text }}>No activity data for this month</Text>
                    <Text style={{ color: colors.secondaryText, marginTop: 8, fontSize: 12 }}>
                        Try selecting a different month or add workouts
                    </Text>
                </View>
                
                {renderMonthPicker()}
            </View>
        );
    }
    
    return (
        <Animated.View 
            style={[
                styles.container,
                { 
                    opacity: animation,
                    transform: [{ 
                        translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                        })
                    }]
                }
            ]}
        >
            {/* Stats summary */}
            <View style={styles.statsRow}>
                <View style={[styles.statItem, { 
                    backgroundColor: isDarkMode ? 'rgba(255,149,0,0.1)' : 'rgba(99,102,241,0.05)'
                }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {monthlyStats.totalCalories}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                        Calories
                    </Text>
                </View>
                
                <View style={[styles.statItem, { 
                    backgroundColor: isDarkMode ? 'rgba(52,199,89,0.1)' : 'rgba(34,197,94,0.05)'
                }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {monthlyStats.totalWorkouts}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                        Workouts
                    </Text>
                </View>
                
                <View style={[styles.statItem, { 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {Math.round((monthlyStats.activeDays / validData.length) * 100)}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                        Active
                    </Text>
                </View>
            </View>
            
            {/* Modern calendar visualization */}
            <View style={styles.calendarContainer}>
                {/* Day labels */}
                <View style={styles.dayLabelsRow}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <Text 
                            key={`day-label-${index}`} 
                            style={[styles.dayLabel, { color: colors.secondaryText }]}
                        >
                            {day}
                        </Text>
                    ))}
                </View>
                
                {/* Calendar grid */}
                <View style={styles.calendarGrid}>
                    <Svg width={screenWidth - 16} height={120}>
                        {calendarGrid.map((week, weekIndex) => (
                            <G key={`week-${weekIndex}`}>
                                {week.map((day, dayIndex) => {
                                    if (day === null) return null;
                                    
                                    const cellWidth = (screenWidth - 16) / 7;
                                    const cellHeight = 120 / 6;
                                    const x = dayIndex * cellWidth;
                                    const y = weekIndex * cellHeight;
                                    
                                    // Calculate intensity based on calories
                                    const calorieIntensity = day.calories / maxCalories;
                                    const hasWorkout = day.workouts > 0;
                                    
                                    // Create a unique key for each day element
                                    const dayKey = `day-${weekIndex}-${dayIndex}-${day.dayNum}`;
                                    
                                    return (
                                        <G key={dayKey}>
                                            {/* Background rect for the day */}
                                            <Rect
                                                x={x + 2}
                                                y={y + 2}
                                                width={cellWidth - 4}
                                                height={cellHeight - 4}
                                                rx={4}
                                                fill={
                                                    hasWorkout 
                                                    ? isDarkMode 
                                                        ? `rgba(52,199,89,${Math.max(0.1, calorieIntensity * 0.5)})`
                                                        : `rgba(34,197,94,${Math.max(0.1, calorieIntensity * 0.5)})`
                                                    : isDarkMode 
                                                        ? `rgba(255,149,0,${Math.max(0.05, calorieIntensity * 0.3)})`
                                                        : `rgba(99,102,241,${Math.max(0.05, calorieIntensity * 0.3)})`
                                                }
                                                stroke={
                                                    hasWorkout
                                                    ? isDarkMode ? "#34C759" : "#22C55E"
                                                    : "transparent"
                                                }
                                                strokeWidth={hasWorkout ? 1 : 0}
                                            />
                                            
                                            {/* Day number */}
                                            <SvgText
                                                x={x + cellWidth / 2}
                                                y={y + 12}
                                                fontSize="10"
                                                fontWeight={hasWorkout ? "bold" : "normal"}
                                                textAnchor="middle"
                                                fill={colors.text}
                                            >
                                                {day.dayNum}
                                            </SvgText>
                                            
                                            {/* Calorie indicator - small bar at bottom */}
                                            {day.calories > 0 && (
                                                <Rect
                                                    x={x + cellWidth * 0.25}
                                                    y={y + cellHeight - 6}
                                                    width={cellWidth * 0.5 * (day.calories / maxCalories)}
                                                    height={3}
                                                    rx={1.5}
                                                    fill={
                                                        hasWorkout
                                                        ? isDarkMode ? "#34C759" : "#22C55E"
                                                        : isDarkMode ? "#FF9500" : "#6366F1"
                                                    }
                                                />
                                            )}
                                        </G>
                                    );
                                })}
                            </G>
                        ))}
                    </Svg>
                </View>
            </View>
            
            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { 
                        backgroundColor: isDarkMode ? 'rgba(255,149,0,0.8)' : 'rgba(99,102,241,0.8)'
                    }]} />
                    <Text style={[styles.legendText, { color: colors.secondaryText }]}>
                        Calorie Activity
                    </Text>
                </View>
                
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { 
                        backgroundColor: isDarkMode ? "#34C759" : "#22C55E",
                        borderRadius: 4
                    }]} />
                    <Text style={[styles.legendText, { color: colors.secondaryText }]}>
                        Workout Day
                    </Text>
                </View>
            </View>
            
            {renderMonthPicker()}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 16,
        marginVertical: 8,
        position: 'relative',
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
    calendarContainer: {
        marginBottom: 12,
    },
    dayLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 4,
    },
    dayLabel: {
        fontSize: 10,
        width: (screenWidth - 16) / 7,
        textAlign: 'center',
    },
    calendarGrid: {
        height: 120,
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
    legendText: {
        fontSize: 12,
    },
    monthPickerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        zIndex: 10,
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    monthItem: {
        width: '30%',
        paddingVertical: 8,
        marginBottom: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    monthItemText: {
        fontSize: 14,
    },
    currentMonthDot: {
        marginLeft: 4,
    },
    closeButton: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
});