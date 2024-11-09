import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  LAST_CHECK_DATE: 'lastCheckDate',
  CURRENT_STREAK: 'currentStreak',
  DAILY_PROGRESS: 'dailyProgress',
  WATER_CONSUMED: 'waterConsumed',
  RECENT_MEALS: 'recentMeals'
};

const useStreakTracking = (waterGoal, recommendedCalories) => {
  const [streak, setStreak] = useState(0);
  const [lastCheckDate, setLastCheckDate] = useState(null);

  useEffect(() => {
    loadStreakData();
  }, []);

  useEffect(() => {
    const midnightCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        handleDayChange();
      }
    }, 60000);

    return () => clearInterval(midnightCheck);
  }, []);

  const loadStreakData = async () => {
    try {
      const [savedStreak, savedDate] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STREAK),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_CHECK_DATE)
      ]);
      
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedDate) setLastCheckDate(new Date(savedDate));
      
      // Check if it's a new day
      const today = new Date();
      if (savedDate && !isSameDay(new Date(savedDate), today)) {
        handleDayChange();
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const handleDayChange = async () => {
    try {
      const today = new Date();
      
      // Reset daily progress
      await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_PROGRESS);
      
      // Reset water consumed
      await AsyncStorage.setItem(STORAGE_KEYS.WATER_CONSUMED, '0');
      
      // Reset meals
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_MEALS, JSON.stringify([]));
      
      // Update last check date
      setLastCheckDate(today);
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHECK_DATE, today.toISOString());
      
      // If goals weren't met yesterday, reset streak
      const yesterdayProgress = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
      if (!yesterdayProgress || !checkGoalsMet(JSON.parse(yesterdayProgress))) {
        setStreak(0);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, '0');
      }
    } catch (error) {
      console.error('Error handling day change:', error);
    }
  };

  const checkGoalsMet = (progress) => {
    return progress.water >= waterGoal && progress.calories >= recommendedCalories;
  };

  const saveDailyProgress = async (waterConsumed, caloriesConsumed) => {
    try {
      const progressData = {
        water: waterConsumed,
        calories: caloriesConsumed,
        date: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(progressData));
      
      // Check if goals are met and update streak immediately
      if (waterConsumed >= waterGoal && caloriesConsumed >= recommendedCalories) {
        // Get current streak and increment
        const currentStreak = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STREAK);
        const newStreak = (parseInt(currentStreak) || 0) + 1;
        
        // Update streak in state and storage
        setStreak(newStreak);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, newStreak.toString());
      }
    } catch (error) {
      console.error('Error saving daily progress:', error);
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return {
    streak,
    saveDailyProgress
  };
};

export default useStreakTracking;