import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ArrowRight, Trophy } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import useStreakTracking from './streaktrack';
import NavbarFooter from './Navbar';
import { DeviceEventEmitter } from 'react-native';
import RecentMealsList from './recentmealslist';

const { width } = Dimensions.get('window');

const waterGoal = 2700;  // 2.7 liters in milliliters

const STORAGE_KEYS = {
  LAST_CHECK_DATE: 'lastCheckDate',
  CURRENT_STREAK: 'currentStreak',
  DAILY_PROGRESS: 'dailyProgress',
  WATER_CONSUMED: 'waterConsumed',
  RECENT_MEALS: 'recentMeals'
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [gender] = useState('male');
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [newWaterAmount, setNewWaterAmount] = useState('');
  const [recentMeals, setRecentMeals] = useState([]);

  useEffect(() => {
    const loadRecentMeals = async () => {
      try {
        const mealsString = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_MEALS);
        if (mealsString) {
          setRecentMeals(JSON.parse(mealsString));
        }
      } catch (error) {
        console.error('Error loading recent meals:', error);
      }
    };

    loadRecentMeals();

    // Add event listener for mealSaved
    const listener = DeviceEventEmitter.addListener('mealSaved', (updatedMeals) => {
      setRecentMeals(updatedMeals);
    });

    return () => {
      // Cleanup listener on component unmount
      listener.remove();
    };
  }, []);

  // Calculate daily stats based on recent meals
  const recommendedCalories = gender === 'male' ? 2500 : 2000;
  const totalCaloriesConsumed = recentMeals.reduce((total, meal) => total + meal.calories, 0);
  const caloriesRemaining = recommendedCalories - totalCaloriesConsumed;

  const { streak, saveDailyProgress } = useStreakTracking(waterGoal, recommendedCalories);
  const [dailyStats, setDailyStats] = useState({
    caloriesRemaining: caloriesRemaining,
    caloriesConsumed: totalCaloriesConsumed,
    dailyStreak: streak
  });

  const checkAndResetDaily = async () => {
    try {
      const lastCheckDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CHECK_DATE);
      const currentDate = new Date().toLocaleDateString();

      if (lastCheckDate !== currentDate) {
        // Reset water consumed
        await AsyncStorage.setItem(STORAGE_KEYS.WATER_CONSUMED, '0');
        setWaterConsumed(0);

        // Reset meals
        await AsyncStorage.setItem(STORAGE_KEYS.RECENT_MEALS, JSON.stringify([]));
        setRecentMeals([]);

        // Update last check date
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHECK_DATE, currentDate);

        // Reset daily stats
        setDailyStats({
          caloriesRemaining: recommendedCalories,
          caloriesConsumed: 0,
          dailyStreak: streak
        });
      }
    } catch (error) {
      console.error('Error checking/resetting daily values:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await checkAndResetDaily();
      await loadSavedData();
    };

    initializeData();
    // Set up daily check at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;

    const midnightTimer = setTimeout(() => {
      checkAndResetDaily();
      // Set up recurring daily check
      const dailyTimer = setInterval(checkAndResetDaily, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  useEffect(() => {
    setDailyStats(prev => ({
      ...prev,
      caloriesConsumed: totalCaloriesConsumed,
      caloriesRemaining: recommendedCalories - totalCaloriesConsumed
    }));
  }, [recentMeals, totalCaloriesConsumed]);

  const loadSavedData = async () => {
    try {
      const savedWater = await AsyncStorage.getItem(STORAGE_KEYS.WATER_CONSUMED);
      const savedMeals = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_MEALS);

      if (savedWater) setWaterConsumed(parseInt(savedWater));
      if (savedMeals) {
        const meals = JSON.parse(savedMeals);
        setRecentMeals(meals || []);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', time: '', calories: '' });

  const [leaderboard] = useState([
    { rank: 1, name: 'Sarah M.', points: 2800 },
    { rank: 2, name: 'John D.', points: 2650 },
    { rank: 3, name: 'Alex W.', points: 2400 },
    { rank: 4, name: 'Emma R.', points: 2200 },
    { rank: 5, name: 'Mike P.', points: 2100 },
  ]);

  const waterPercentage = Math.round((waterConsumed / waterGoal) * 100);
  const waterRemaining = (waterGoal - waterConsumed) / 1000;

  const handleAddWater = async () => {
    const amount = parseInt(newWaterAmount, 10);
    if (!isNaN(amount)) {
      const newWaterConsumed = Math.min(waterConsumed + amount, waterGoal);
      setWaterConsumed(newWaterConsumed);
      setNewWaterAmount('');
      setShowWaterModal(false);

      // Save water consumption
      await AsyncStorage.setItem(STORAGE_KEYS.WATER_CONSUMED, newWaterConsumed.toString());

      // Update daily progress and check streak
      await saveDailyProgress(newWaterConsumed, totalCaloriesConsumed);
    }
  };

  const addMeal = (meal) => {
    setRecentMeals((prevMeals) => {
      if (prevMeals.some(existingMeal => existingMeal.id === meal.id)) {
        return prevMeals; // Prevent duplicates by checking the id
      }
      return [...prevMeals, meal]; // Add the new meal to the list
    });
  };
 
  const handleAddMeal = async () => {
    const newMealData = {
      id: recentMeals.length + 1,
      ...newMeal,
      calories: parseInt(newMeal.calories),
    };

    const updatedMeals = [...recentMeals, newMealData];
    const totalCalories = updatedMeals.reduce((total, meal) => total + meal.calories, 0);

    setRecentMeals(updatedMeals);
    setDailyStats({
      caloriesRemaining: recommendedCalories - totalCalories,
      caloriesConsumed: totalCalories,
      dailyStreak: streak,
    });

    // Save meals
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_MEALS, JSON.stringify(updatedMeals));

    // Update daily progress and check streak
    await saveDailyProgress(waterConsumed, totalCalories);

    setNewMeal({ name: '', time: '', calories: '' });
    setShowAddMealModal(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.navigate('WelcomeScreen');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  const healthTips = [
    "Stay hydrated by drinking at least 8 cups of water daily.",
    "Aim to include a source of protein in every meal.",
    "Take short breaks throughout the day to stretch and move.",
    "Incorporate more leafy greens into your diet for essential vitamins.",
    "Practice mindful eating by chewing slowly and savoring each bite.",
    "Aim to get at least 7-8 hours of sleep for better health.",
    "Limit sugary drinks and opt for water or herbal teas.",
    "Include fiber-rich foods to support digestion.",
    "Try to eat within a 12-hour window each day for better metabolism.",
    "Add a variety of colors to your meals with fruits and vegetables."
];  
const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];

  return (
    <LinearGradient
      colors={['#E8F5E9', '#E1F5FE']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Progress</Text>
        </View>
        <View style={styles.dailyTipContainer}>
          <Text style={styles.dailyTipText}>Daily Tip: {randomTip}</Text>
        </View>

        {/* Water Tracking Card */}
        <View style={[styles.card, styles.waterCard]}>
          <View style={styles.waterContent}>
            <View style={styles.waterCircle}>
              <Text style={styles.waterPercentage}>{waterPercentage}%</Text>
              <Text style={styles.waterLabel}>Daily Goal</Text>
            </View>
            <View style={styles.waterInfo}>
              <Text style={styles.waterRemaining}>{waterRemaining.toFixed(1)}L</Text>
              <Text style={styles.waterSubtext}>remaining</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addWaterButton} onPress={() => setShowWaterModal(true)}>
            <Plus size={24} color="#4FC3F7" />
          </TouchableOpacity>
        </View>
{/* Daily Stats */}
<View style={styles.statsContainer}>
          {[
            { unit: 'Remaining', value: dailyStats.caloriesRemaining, title: 'kcal' },
            { unit: 'Consumed', value: dailyStats.caloriesConsumed, title: 'kcal' },
            { unit: 'Streak', value: dailyStats.dailyStreak, title: 'days' }
          ].map((stat, index) => (
            <View key={index} style={[styles.statCard, styles.elevation3]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <Text style={styles.statUnit}>{stat.unit}</Text>
            </View>
          ))}
        </View>


        {/* Recent Meals */}
        <View style={styles.recentMeals}>
          <RecentMealsList recentMeals={recentMeals} onAddMeal={addMeal} />
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => setShowAddMealModal(true)}
          >
            
          </TouchableOpacity>
        </View>

       {/* Leaderboard */}
       <View style={[styles.card, styles.leaderboardCard]}>
          <View style={styles.sectionHeader}>
            <View style={styles.leaderboardTitleContainer}>
              <Trophy size={24} color="#FFD700" />
              <Text style={styles.sectionTitle}>Leaderboard</Text>
            </View>
            <TouchableOpacity>
              <ArrowRight size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {leaderboard.map((user) => (
            <View key={user.rank} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>#{user.rank}</Text>
              <Text style={styles.leaderboardName}>{user.name}</Text>
              <Text style={styles.leaderboardPoints}>{user.points} pts</Text>
            </View>
          ))}
        </View>

       
      </ScrollView>

      {/* Add Water Modal */}
      <Modal visible={showWaterModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Water</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount in ml"
              value={newWaterAmount}
              onChangeText={setNewWaterAmount}
              keyboardType="numeric"
            />
            <Button title="Add" onPress={handleAddWater} />
            <Button title="Cancel" onPress={() => setShowWaterModal(false)} />
          </View>
        </View>
      </Modal>

      {/* Add Meal Modal */}
      <Modal visible={showAddMealModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Meal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Meal Name"
              value={newMeal.name}
              onChangeText={(text) => setNewMeal({ ...newMeal, name: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Meal Time"
              value={newMeal.time}
              onChangeText={(text) => setNewMeal({ ...newMeal, time: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Calories"
              value={newMeal.calories}
              onChangeText={(text) => setNewMeal({ ...newMeal, calories: text })}
              keyboardType="numeric"
            />
            <Button title="Add Meal" onPress={handleAddMeal} />
            <Button title="Cancel" onPress={() => setShowAddMealModal(false)} />
          </View>
        </View>
      </Modal>
       {/* Footer */}
       <NavbarFooter />
    </LinearGradient>
  );
};





// Style modifications go here
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  spacer: {
    height: 100, // Additional space to push content above the footer
  },
  logoutButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  waterCard: {
    backgroundColor: '#fff',
  },
  waterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
  },
  waterPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  waterLabel: {
    fontSize: 12,
    color: '#666',
  },
  waterInfo: {
    marginLeft: 20,
  },
  waterRemaining: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4FC3F7',
  },
  waterSubtext: {
    fontSize: 16,
    color: '#666',
  },
  addWaterButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 8,
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    borderRadius: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Darker overlay for emphasis
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,  // Softer rounded corners for modern look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: width * 0.27,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  statUnit: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 6,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  mealTime: {
    fontSize: 12,
    color: '#666',
  },
  mealCalories: {
    fontSize: 16,
    color: '#333',
  },
  leaderboardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  leaderboardName: {
    fontSize: 16,
    color: '#333',
  },
  leaderboardPoints: {
    fontSize: 16,
    color: '#333',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: '#10332C',
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    paddingHorizontal: 15,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 24,
  },
  activeNavIcon: {
    color: '#00DFA2',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonAdd: {
    backgroundColor: '#4CAF50',
  },
  modalButtonCancel: {
    backgroundColor: '#FF6F61',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centeredModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    elevation: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
},
emptyMessage: {
    fontSize: 16,
    color: '#666',
},
mealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
},
mealInfo: {
    flex: 1,
},
mealName: {
    fontSize: 18,
    fontWeight: 'bold',
},
mealPrepTime: {
    fontSize: 14,
    color: '#888',
},
dailyTipContainer: {
  backgroundColor: '#4CAF50', // A pleasant green background
  padding: 15,
  marginVertical: 10,
  borderRadius: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 5,
  alignItems: 'center',
  justifyContent: 'center',
},

dailyTipText: {
  fontSize: 18,
  fontWeight: '600',
  color: '#FFF', // White text for contrast on green
  textAlign: 'center',
  lineHeight: 24,
},






});


export default HomeScreen;