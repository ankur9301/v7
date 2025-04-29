import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { BlurView } from 'expo-blur';
import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
import { supabase } from '@/src/supabaseClient';
import { useUserStore } from '@/store/useUserStore';
import { format, subDays, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ChartViewType = 'daily' | 'weekly';
type ChartDisplayType = 'bar' | 'line';

interface HydrationLog {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  goal_ml: number;
  unit: string;
  added_at: string;
}

interface HydrationChartModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialView?: ChartViewType;
}

const HydrationChartModal: React.FC<HydrationChartModalProps> = ({ 
  isVisible, 
  onClose, 
  initialView = 'daily' 
}) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  const { user } = useUserStore();
  
  const [viewType, setViewType] = useState<ChartViewType>(initialView);
  const [displayType, setDisplayType] = useState<ChartDisplayType>('bar');
  const [isLoading, setIsLoading] = useState(false);
  const [hydrationData, setHydrationData] = useState<HydrationLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedDate(new Date());
      setViewType(initialView);
      fetchHydrationData();
    }
  }, [isVisible, initialView]);
  
  // Fetch hydration data based on view type and selected date
  useEffect(() => {
    if (isVisible) {
      fetchHydrationData();
    }
  }, [viewType, selectedDate, user, isVisible]);

  const fetchHydrationData = async () => {
    if (!user || !user.id) return;
    
    setIsLoading(true);
    
    try {
      let startDate, endDate;
      
      if (viewType === 'daily') {
        startDate = startOfDay(selectedDate);
        endDate = endOfDay(selectedDate);
      } else {
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday
      }
      
      const { data, error } = await supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('added_at', startDate.toISOString())
        .lte('added_at', endDate.toISOString())
        .order('added_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching hydration logs:', error);
      } else {
        setHydrationData(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching hydration data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Process data for daily view (hourly breakdown)
  const getDailyChartData = () => {
    const hourlyData = Array(24).fill(0);
    const labels = [];
    
    // Create labels for every 3 hours
    for (let i = 0; i < 24; i += 3) {
      labels.push(`${i}:00`);
    }
    
    // Aggregate data by hour
    hydrationData.forEach(log => {
      const date = parseISO(log.added_at);
      const hour = date.getHours();
      hourlyData[hour] += log.amount_ml;
    });
    
    // Compress data to match labels (every 3 hours)
    const compressedData = [];
    for (let i = 0; i < 24; i += 3) {
      compressedData.push(
        hourlyData[i] + 
        (hourlyData[i+1] || 0) + 
        (hourlyData[i+2] || 0)
      );
    }
    
    return {
      labels,
      datasets: [
        {
          data: compressedData,
          color: () => isDarkMode ? '#FF9500' : '#6366F1',
        }
      ],
    };
  };
  
  // Process data for weekly view
  const getWeeklyChartData = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const dailyData = Array(7).fill(0);
    const labels = [];
    
    // Create labels for each day of the week
    for (let i = 0; i < 7; i++) {
      const day = format(subDays(endOfWeek(selectedDate, { weekStartsOn: 1 }), 6-i), 'EEE');
      labels.push(day);
    }
    
    // Aggregate data by day
    hydrationData.forEach(log => {
      const date = parseISO(log.added_at);
      const dayOfWeek = (date.getDay() || 7) - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
      dailyData[dayOfWeek] += log.amount_ml;
    });
    
    return {
      labels,
      datasets: [
        {
          data: dailyData,
          color: () => isDarkMode ? '#FF9500' : '#6366F1',
        }
      ],
    };
  };
  
  // Get hourly breakdown for daily view
  const getHourlyBreakdown = () => {
    const hourlyLogs: { hour: string; amount: number }[] = [];
    
    if (viewType === 'daily') {
      // Group logs by hour
      const hourMap = new Map<number, number>();
      
      hydrationData.forEach(log => {
        const date = parseISO(log.added_at);
        const hour = date.getHours();
        const existingAmount = hourMap.get(hour) || 0;
        hourMap.set(hour, existingAmount + log.amount_ml);
      });
      
      // Convert map to sorted array
      for (const [hour, amount] of hourMap.entries()) {
        const formattedHour = `${hour.toString().padStart(2, '0')}:00`;
        hourlyLogs.push({ hour: formattedHour, amount });
      }
      
      // Sort by hour
      hourlyLogs.sort((a, b) => {
        return parseInt(a.hour) - parseInt(b.hour);
      });
    }
    
    return hourlyLogs;
  };
  
  // Navigate to previous/next day or week
  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewType === 'daily' ? 1 : 7;
    const newDate = new Date(selectedDate);
    
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - days);
    } else {
      newDate.setDate(newDate.getDate() + days);
    }
    
    setSelectedDate(newDate);
  };
  
  // Format the date range for display
  const getDateRangeText = () => {
    if (viewType === 'daily') {
      return format(selectedDate, 'MMMM d, yyyy');
    } else {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
  };
  
  // Calculate total intake for the current view
  const getTotalIntake = () => {
    return hydrationData.reduce((sum, log) => sum + log.amount_ml, 0);
  };
  
  // Get the average daily intake for weekly view
  const getAverageIntake = () => {
    if (viewType === 'weekly') {
      const total = getTotalIntake();
      // Count days that have data
      const daysWithData = new Set(
        hydrationData.map(log => format(parseISO(log.added_at), 'yyyy-MM-dd'))
      ).size;
      
      return daysWithData > 0 ? Math.round(total / daysWithData) : 0;
    }
    return 0;
  };
  
  // Get the goal amount (use the most recent log's goal)
  const getGoalAmount = () => {
    if (hydrationData.length === 0) return 2000; // Default
    
    // Sort by date and get the most recent
    const sortedLogs = [...hydrationData].sort((a, b) => 
      new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
    );
    
    return sortedLogs[0].goal_ml;
  };
  
  // Calculate the percentage of goal achieved
  const getGoalPercentage = () => {
    const total = getTotalIntake();
    const goal = getGoalAmount();
    return Math.min(Math.round((total / goal) * 100), 100);
  };
  
  // Get chart configuration
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#1E293B' : '#FFFFFF',
    backgroundGradientTo: isDarkMode ? '#1E293B' : '#FFFFFF',
    decimalPlaces: 0,
    color: () => isDarkMode ? 'rgba(255, 149, 0, 0.8)' : 'rgba(99, 102, 241, 0.8)',
    labelColor: () => isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: isDarkMode ? '#FF9500' : '#6366F1',
    },
    barPercentage: 0.7,
  };
  
  const renderChart = () => {
    const chartData = viewType === 'daily' ? getDailyChartData() : getWeeklyChartData();
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#FF9500' : '#6366F1'} />
        </View>
      );
    }
    
    if (hydrationData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="water-outline" 
            size={48} 
            color={isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'} 
          />
          <Text style={[styles.emptyText, { color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)' }]}>
            No hydration data for this {viewType === 'daily' ? 'day' : 'week'}
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ paddingRight: 20 }}>
          {displayType === 'bar' ? (
            <BarChart
              data={chartData}
              width={Math.max(SCREEN_WIDTH - 40, chartData.labels.length * 60)}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel=""
              yAxisSuffix="ml"
            />
          ) : (
            <LineChart
              data={chartData}
              width={Math.max(SCREEN_WIDTH - 40, chartData.labels.length * 60)}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
              fromZero
            />
          )}
        </View>
      </ScrollView>
    );
  };
  
  // Render hourly breakdown for daily view
  const renderHourlyBreakdown = () => {
    if (viewType !== 'daily' || hydrationData.length === 0) return null;
    
    const hourlyLogs = getHourlyBreakdown();
    
    if (hourlyLogs.length === 0) return null;
    
    return (
      <View style={styles.hourlyBreakdownContainer}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
          Hourly Breakdown
        </Text>
        
        <View style={styles.hourlyList}>
          {hourlyLogs.map((log, index) => (
            <View 
              key={index} 
              style={[
                styles.hourlyItem,
                { 
                  backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }
              ]}
            >
              <View style={styles.hourlyTimeContainer}>
                <Ionicons name="time-outline" size={16} color={isDarkMode ? '#FF9500' : '#6366F1'} />
                <Text style={[styles.hourlyTime, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
                  {log.hour}
                </Text>
              </View>
              <View style={styles.hourlyAmountContainer}>
                <Text style={[styles.hourlyAmount, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
                  {log.amount} ml
                </Text>
                <View 
                  style={[
                    styles.hourlyBar, 
                    { 
                      backgroundColor: isDarkMode ? '#FF9500' : '#6366F1',
                      width: `${Math.min((log.amount / getGoalAmount()) * 100, 100)}%`,
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)' },
              ]}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={isDarkMode ? '#FF9500' : '#6366F1'} />
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
              Hydration History
            </Text>
            
            <View style={styles.chartTypeToggle}>
              <TouchableOpacity
                style={[
                  styles.chartTypeButton,
                  displayType === 'bar' && {
                    backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                  },
                ]}
                onPress={() => setDisplayType('bar')}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={20}
                  color={isDarkMode ? '#FF9500' : '#6366F1'}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.chartTypeButton,
                  displayType === 'line' && {
                    backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                  },
                ]}
                onPress={() => setDisplayType('line')}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color={isDarkMode ? '#FF9500' : '#6366F1'}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewToggleButton,
                  viewType === 'daily' && {
                    backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                    borderColor: isDarkMode ? '#FF9500' : '#6366F1',
                  },
                ]}
                onPress={() => setViewType('daily')}
              >
                <Text
                  style={[
                    styles.viewToggleText,
                    { color: isDarkMode ? (viewType === 'daily' ? '#FF9500' : '#E5E7EB') : (viewType === 'daily' ? '#6366F1' : '#374151') },
                  ]}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.viewToggleButton,
                  viewType === 'weekly' && {
                    backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                    borderColor: isDarkMode ? '#FF9500' : '#6366F1',
                  },
                ]}
                onPress={() => setViewType('weekly')}
              >
                <Text
                  style={[
                    styles.viewToggleText,
                    { color: isDarkMode ? (viewType === 'weekly' ? '#FF9500' : '#E5E7EB') : (viewType === 'weekly' ? '#6366F1' : '#374151') },
                  ]}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateNavigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
                ]}
                onPress={() => navigateDate('prev')}
              >
                <Ionicons name="chevron-back" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
              </TouchableOpacity>
              
              <Text style={[styles.dateText, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
                {getDateRangeText()}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
                ]}
                onPress={() => navigateDate('next')}
              >
                <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chartContainer}>
              {renderChart()}
            </View>
            
            <View style={styles.statsContainer}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
                ]}
              >
                <Ionicons name="water-outline" size={24} color={isDarkMode ? '#FF9500' : '#6366F1'} />
                <Text style={[styles.statValue, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
                  {getTotalIntake()} ml
                </Text>
                <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  {viewType === 'daily' ? 'Total Intake' : 'Weekly Total'}
                </Text>
              </View>
              
              {viewType === 'weekly' && (
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
                  ]}
                >
                  <Ionicons name="calendar-outline" size={24} color={isDarkMode ? '#FF9500' : '#6366F1'} />
                  <Text style={[styles.statValue, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
                    {getAverageIntake()} ml
                  </Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                    Daily Average
                  </Text>
                </View>
              )}
              
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
                ]}
              >
                <Ionicons name="trophy-outline" size={24} color={isDarkMode ? '#FF9500' : '#6366F1'} />
                <Text style={[styles.statValue, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
                  {getGoalPercentage()}%
                </Text>
                <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  Goal Progress
                </Text>
              </View>
            </View>
            
            {renderHourlyBreakdown()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  chartTypeToggle: {
    flexDirection: 'row',
  },
  chartTypeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  viewToggle: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  viewToggleText: {
    fontWeight: '600',
    fontSize: 16,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    marginVertical: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  hourlyBreakdownContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  hourlyList: {
    marginTop: 8,
  },
  hourlyItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  hourlyTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  hourlyTime: {
    marginLeft: 4,
    fontWeight: '500',
  },
  hourlyAmountContainer: {
    flex: 1,
  },
  hourlyAmount: {
    fontWeight: '600',
    marginBottom: 6,
  },
  hourlyBar: {
    height: 6,
    borderRadius: 3,
  },
});

export default HydrationChartModal;

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LineChart, BarChart } from 'react-native-chart-kit';
// import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// import { supabase } from '@/src/supabaseClient';
// import { useUserStore } from '@/store/useUserStore';
// import { format, subDays, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// type ChartViewType = 'daily' | 'weekly';
// type ChartDisplayType = 'bar' | 'line';

// interface HydrationLog {
//   id: string;
//   user_id: string;
//   date: string;
//   amount_ml: number;
//   goal_ml: number;
//   unit: string;
//   added_at: string;
// }

// interface HydrationChartProps {
//   initialView?: ChartViewType;
// }

// const HydrationChart: React.FC<HydrationChartProps> = ({ initialView = 'daily' }) => {
//   const { isDarkMode } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;
//   const { user } = useUserStore();
  
//   const [viewType, setViewType] = useState<ChartViewType>(initialView);
//   const [displayType, setDisplayType] = useState<ChartDisplayType>('bar');
//   const [isLoading, setIsLoading] = useState(false);
//   const [hydrationData, setHydrationData] = useState<HydrationLog[]>([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
  
//   // Fetch hydration data based on view type and selected date
//   useEffect(() => {
//     fetchHydrationData();
//   }, [viewType, selectedDate, user]);

//   const fetchHydrationData = async () => {
//     if (!user || !user.id) return;
    
//     setIsLoading(true);
    
//     try {
//       let startDate, endDate;
      
//       if (viewType === 'daily') {
//         startDate = startOfDay(selectedDate);
//         endDate = endOfDay(selectedDate);
//       } else {
//         startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
//         endDate = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday
//       }
      
//       const { data, error } = await supabase
//         .from('hydration_logs')
//         .select('*')
//         .eq('user_id', user.id)
//         .gte('added_at', startDate.toISOString())
//         .lte('added_at', endDate.toISOString())
//         .order('added_at', { ascending: true });
      
//       if (error) {
//         console.error('Error fetching hydration logs:', error);
//       } else {
//         setHydrationData(data || []);
//       }
//     } catch (err) {
//       console.error('Unexpected error fetching hydration data:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Process data for daily view (hourly breakdown)
//   const getDailyChartData = () => {
//     const hourlyData = Array(24).fill(0);
//     const labels = [];
    
//     // Create labels for every 3 hours
//     for (let i = 0; i < 24; i += 3) {
//       labels.push(`${i}:00`);
//     }
    
//     // Aggregate data by hour
//     hydrationData.forEach(log => {
//       const date = parseISO(log.added_at);
//       const hour = date.getHours();
//       hourlyData[hour] += log.amount_ml;
//     });
    
//     // Compress data to match labels (every 3 hours)
//     const compressedData = [];
//     for (let i = 0; i < 24; i += 3) {
//       compressedData.push(
//         hourlyData[i] + 
//         (hourlyData[i+1] || 0) + 
//         (hourlyData[i+2] || 0)
//       );
//     }
    
//     return {
//       labels,
//       datasets: [
//         {
//           data: compressedData,
//           color: () => isDarkMode ? '#FF9500' : '#6366F1',
//         }
//       ],
//     };
//   };
  
//   // Process data for weekly view
//   const getWeeklyChartData = () => {
//     const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
//     const dailyData = Array(7).fill(0);
//     const labels = [];
    
//     // Create labels for each day of the week
//     for (let i = 0; i < 7; i++) {
//       const day = format(subDays(endOfWeek(selectedDate, { weekStartsOn: 1 }), 6-i), 'EEE');
//       labels.push(day);
//     }
    
//     // Aggregate data by day
//     hydrationData.forEach(log => {
//       const date = parseISO(log.added_at);
//       const dayOfWeek = (date.getDay() || 7) - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
//       dailyData[dayOfWeek] += log.amount_ml;
//     });
    
//     return {
//       labels,
//       datasets: [
//         {
//           data: dailyData,
//           color: () => isDarkMode ? '#FF9500' : '#6366F1',
//         }
//       ],
//     };
//   };
  
//   // Navigate to previous/next day or week
//   const navigateDate = (direction: 'prev' | 'next') => {
//     const days = viewType === 'daily' ? 1 : 7;
//     const newDate = new Date(selectedDate);
    
//     if (direction === 'prev') {
//       newDate.setDate(newDate.getDate() - days);
//     } else {
//       newDate.setDate(newDate.getDate() + days);
//     }
    
//     setSelectedDate(newDate);
//   };
  
//   // Format the date range for display
//   const getDateRangeText = () => {
//     if (viewType === 'daily') {
//       return format(selectedDate, 'MMMM d, yyyy');
//     } else {
//       const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
//       const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
//       return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
//     }
//   };
  
//   // Calculate total intake for the current view
//   const getTotalIntake = () => {
//     return hydrationData.reduce((sum, log) => sum + log.amount_ml, 0);
//   };
  
//   // Get the average daily intake for weekly view
//   const getAverageIntake = () => {
//     if (viewType === 'weekly') {
//       const total = getTotalIntake();
//       // Count days that have data
//       const daysWithData = new Set(
//         hydrationData.map(log => format(parseISO(log.added_at), 'yyyy-MM-dd'))
//       ).size;
      
//       return daysWithData > 0 ? Math.round(total / daysWithData) : 0;
//     }
//     return 0;
//   };
  
//   // Get the goal amount (use the most recent log's goal)
//   const getGoalAmount = () => {
//     if (hydrationData.length === 0) return 2000; // Default
    
//     // Sort by date and get the most recent
//     const sortedLogs = [...hydrationData].sort((a, b) => 
//       new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
//     );
    
//     return sortedLogs[0].goal_ml;
//   };
  
//   // Calculate the percentage of goal achieved
//   const getGoalPercentage = () => {
//     const total = getTotalIntake();
//     const goal = getGoalAmount();
//     return Math.min(Math.round((total / goal) * 100), 100);
//   };
  
//   // Get chart configuration
//   const chartConfig = {
//     backgroundGradientFrom: isDarkMode ? '#1E293B' : '#FFFFFF',
//     backgroundGradientTo: isDarkMode ? '#1E293B' : '#FFFFFF',
//     decimalPlaces: 0,
//     color: () => isDarkMode ? 'rgba(255, 149, 0, 0.8)' : 'rgba(99, 102, 241, 0.8)',
//     labelColor: () => isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
//     style: {
//       borderRadius: 16,
//     },
//     propsForDots: {
//       r: '6',
//       strokeWidth: '2',
//       stroke: isDarkMode ? '#FF9500' : '#6366F1',
//     },
//     barPercentage: 0.7,
//   };
  
//   const renderChart = () => {
//     const chartData = viewType === 'daily' ? getDailyChartData() : getWeeklyChartData();
    
//     if (isLoading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={isDarkMode ? '#FF9500' : '#6366F1'} />
//         </View>
//       );
//     }
    
//     if (hydrationData.length === 0) {
//       return (
//         <View style={styles.emptyContainer}>
//           <Ionicons 
//             name="water-outline" 
//             size={48} 
//             color={isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'} 
//           />
//           <Text style={[styles.emptyText, { color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)' }]}>
//             No hydration data for this {viewType === 'daily' ? 'day' : 'week'}
//           </Text>
//         </View>
//       );
//     }
    
//     return (
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         <View style={{ paddingRight: 20 }}>
//           {displayType === 'bar' ? (
//             <BarChart
//               data={chartData}
//               width={Math.max(SCREEN_WIDTH - 40, chartData.labels.length * 60)}
//               height={220}
//               chartConfig={chartConfig}
//               style={styles.chart}
//               showValuesOnTopOfBars
//               fromZero
//               yAxisLabel=""
//               yAxisSuffix="ml"
//             />
//           ) : (
//             <LineChart
//               data={chartData}
//               width={Math.max(SCREEN_WIDTH - 40, chartData.labels.length * 60)}
//               height={220}
//               chartConfig={chartConfig}
//               style={styles.chart}
//               bezier
//               fromZero
//             />
//           )}
//         </View>
//       </ScrollView>
//     );
//   };
  
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <Text style={[styles.title, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
//           Hydration History
//         </Text>
        
//         <View style={styles.chartTypeToggle}>
//           <TouchableOpacity
//             style={[
//               styles.chartTypeButton,
//               displayType === 'bar' && {
//                 backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)',
//               },
//             ]}
//             onPress={() => setDisplayType('bar')}
//           >
//             <Ionicons
//               name="bar-chart-outline"
//               size={20}
//               color={isDarkMode ? '#FF9500' : '#6366F1'}
//             />
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={[
//               styles.chartTypeButton,
//               displayType === 'line' && {
//                 backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)',
//               },
//             ]}
//             onPress={() => setDisplayType('line')}
//           >
//             <Ionicons
//               name="trending-up-outline"
//               size={20}
//               color={isDarkMode ? '#FF9500' : '#6366F1'}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
      
//       <View style={styles.viewToggle}>
//         <TouchableOpacity
//           style={[
//             styles.viewToggleButton,
//             viewType === 'daily' && {
//               backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)',
//               borderColor: isDarkMode ? '#FF9500' : '#6366F1',
//             },
//           ]}
//           onPress={() => setViewType('daily')}
//         >
//           <Text
//             style={[
//               styles.viewToggleText,
//               { color: isDarkMode ? (viewType === 'daily' ? '#FF9500' : '#E5E7EB') : (viewType === 'daily' ? '#6366F1' : '#374151') },
//             ]}
//           >
//             Daily
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={[
//             styles.viewToggleButton,
//             viewType === 'weekly' && {
//               backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(99, 102, 241, 0.1)',
//               borderColor: isDarkMode ? '#FF9500' : '#6366F1',
//             },
//           ]}
//           onPress={() => setViewType('weekly')}
//         >
//           <Text
//             style={[
//               styles.viewToggleText,
//               { color: isDarkMode ? (viewType === 'weekly' ? '#FF9500' : '#E5E7EB') : (viewType === 'weekly' ? '#6366F1' : '#374151') },
//             ]}
//           >
//             Weekly
//           </Text>
//         </TouchableOpacity>
//       </View>
      
//       <View style={styles.dateNavigation}>
//         <TouchableOpacity
//           style={[
//             styles.navButton,
//             { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
//           ]}
//           onPress={() => navigateDate('prev')}
//         >
//           <Ionicons name="chevron-back" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
//         </TouchableOpacity>
        
//         <Text style={[styles.dateText, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
//           {getDateRangeText()}
//         </Text>
        
//         <TouchableOpacity
//           style={[
//             styles.navButton,
//             { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
//           ]}
//           onPress={() => navigateDate('next')}
//         >
//           <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#FF9500' : '#6366F1'} />
//         </TouchableOpacity>
//       </View>
      
//       {renderChart()}
      
//       <View style={styles.statsContainer}>
//         <View
//           style={[
//             styles.statCard,
//             { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
//           ]}
//         >
//           <Ionicons name="water-outline" size={24} color={isDarkMode ? '#FF9500' : '#6366F1'} />
//           <Text style={[styles.statValue, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
//             {getTotalIntake()} ml
//           </Text>
//           <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
//             {viewType === 'daily' ? 'Total Intake' : 'Weekly Total'}
//           </Text>
//         </View>
        
//         {viewType === 'weekly' && (
//           <View
//             style={[
//               styles.statCard,
//               { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
//             ]}
//           >
//             <Ionicons name="calendar-outline" size={24} color={isDarkMode ? '#FF9500' : '#6366F1'} />
//             <Text style={[styles.statValue, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
//               {getAverageIntake()} ml
//             </Text>
//             <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
//               Daily Average
//             </Text>
//           </View>
//         )}
        
//         <View
//           style={[
//             styles.statCard,
//             { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)' },
//           ]}
//         >
//           <Ionicons name="trophy-outline" size={24} color={isDarkMode ? '#FF9500' : '#6366F1'} />
//           <Text style={[styles.statValue, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>
//             {getGoalPercentage()}%
//           </Text>
//           <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
//             Goal Progress
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     borderRadius: 24,
//     padding: 16,
//     marginVertical: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   chartTypeToggle: {
//     flexDirection: 'row',
//   },
//   chartTypeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   viewToggle: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   viewToggleButton: {
//     flex: 1,
//     paddingVertical: 8,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(0, 0, 0, 0.05)',
//     alignItems: 'center',
//     marginHorizontal: 4,
//   },
//   viewToggleText: {
//     fontWeight: '600',
//   },
//   dateNavigation: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   navButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(0, 0, 0, 0.05)',
//   },
//   dateText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   chart: {
//     borderRadius: 16,
//     marginVertical: 8,
//   },
//   loadingContainer: {
//     height: 220,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     height: 220,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 16,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   statCard: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginHorizontal: 4,
//     borderWidth: 1,
//     borderColor: 'rgba(0, 0, 0, 0.05)',
//   },
//   statValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginTop: 8,
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//   },
// });

// export default HydrationChart;