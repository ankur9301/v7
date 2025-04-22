import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { workouts as builtIn } from '../constants/data'
import { fetchCustomExercisesFromSupabase } from '../lib/exerciseService'
import type { Workout } from '../types/types'
import { Alert } from 'react-native'

const CACHE_KEY = 'custom_exercises'

export function useExercises() {
  const [allExercises, setAllExercises] = useState<Workout[]>(builtIn)
  const [loading, setLoading] = useState(false)

  // 1) load from cache
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(CACHE_KEY)
      const cache = raw ? JSON.parse(raw) as Workout[] : []
      setAllExercises([...builtIn, ...cache])

      // 2) fetch fresh
      setLoading(true)
      try {
        const fresh = await fetchCustomExercisesFromSupabase()
        setAllExercises([...builtIn, ...fresh])
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
      } catch {
        /* ignore offline errors */
      }
      setLoading(false)
    })()
  }, [])

  // 3) expose manual refresh
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const fresh = await fetchCustomExercisesFromSupabase()
      setAllExercises([...builtIn, ...fresh])
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
    } catch {
      Alert.alert('Sync Error', 'Could not refresh exercises.')
    }
    setLoading(false)
  }, [])

  return { allExercises, loading, refresh }
}
