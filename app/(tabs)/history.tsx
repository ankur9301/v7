import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../../utils/supabaseClient';

const WorkoutHistory: React.FC = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('logged_at', { ascending: false });

      if (error) console.error('Error fetching workouts:', error.message);
      else setWorkouts(data);
    };

    fetchWorkouts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout History</Text>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.workoutItem}>
            <Text style={styles.workoutName}>{item.workout_name}</Text>
            <Text>Duration: {item.duration}s</Text>
            <Text>{new Date(item.logged_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workoutItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkoutHistory;