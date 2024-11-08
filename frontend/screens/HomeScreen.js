import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ArrowRight, User, Trophy } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [gender] = useState('male');  // Assume this is fetched from user data
  const [recentMeals, setRecentMeals] = useState([
    { id: 1, name: 'Breakfast', time: '8:30 AM', calories: 420 },
    { id: 2, name: 'Lunch', time: '12:45 PM', calories: 630 },
    { id: 3, name: 'Snack', time: '3:30 PM', calories: 100 },
  ]);
  
  // Gender-based recommended calories
  const recommendedCalories = gender === 'male' ? 2500 : 2000;

  // Calculate total calories consumed from recent meals
  const totalCaloriesConsumed = recentMeals.reduce((total, meal) => total + meal.calories, 0);
  const caloriesRemaining = recommendedCalories - totalCaloriesConsumed;

  const [dailyStats, setDailyStats] = useState({
    caloriesRemaining: caloriesRemaining,
    caloriesConsumed: totalCaloriesConsumed,
    dailyStreak: 7,
  });

  const [leaderboard] = useState([
    { rank: 1, name: 'Sarah M.', points: 2800 },
    { rank: 2, name: 'John D.', points: 2650 },
    { rank: 3, name: 'Alex W.', points: 2400 },
    { rank: 4, name: 'Emma R.', points: 2200 },
    { rank: 5, name: 'Mike P.', points: 2100 },
  ]);

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', time: '', calories: '' });

  // Handle adding a new meal
  const handleAddMeal = () => {
    const newMealData = {
      id: recentMeals.length + 1,
      ...newMeal,
      calories: parseInt(newMeal.calories),
    };
    setRecentMeals((prevMeals) => {
      const updatedMeals = [...prevMeals, newMealData];
      const totalCalories = updatedMeals.reduce((total, meal) => total + meal.calories, 0);
      const remainingCalories = recommendedCalories - totalCalories;
      
      setDailyStats({
        caloriesRemaining: remainingCalories,
        caloriesConsumed: totalCalories,
        dailyStreak: 7, // Assuming this stays constant for now
      });

      return updatedMeals;
    });
    setNewMeal({ name: '', time: '', calories: '' });
    setShowAddMealModal(false);
  };

  // Handle logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.navigate('WelcomeScreen');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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

        {/* Water Tracking Card */}
        <View style={[styles.card, styles.waterCard]}>
          <View style={styles.waterContent}>
            <View style={styles.waterCircle}>
              <Text style={styles.waterPercentage}>{65}%</Text>
              <Text style={styles.waterLabel}>Daily Goal</Text>
            </View>
            <View style={styles.waterInfo}>
              <Text style={styles.waterRemaining}>1.4L</Text>
              <Text style={styles.waterSubtext}>remaining</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addWaterButton}>
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
        <View style={[styles.card, styles.mealsCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Meals</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMealModal(true)}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {recentMeals.map((meal) => (
            <View key={meal.id} style={styles.mealItem}>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
            </View>
          ))}
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

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.navbar}>
        {[ 
          { icon: 'home-outline', label: 'Home', active: true },
          { icon: 'pie-chart-outline', label: 'Chart', active: false },
          { icon: 'receipt-outline', label: 'Lock', active: false },
          { icon: 'person-outline', label: 'Profile', active: false },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.navItem}>
            <Ionicons
              name={item.icon}
              size={24}
              color={item.active ? '#00DFA2' : '#CAD5E2'}
              style={item.active ? styles.activeNavIcon : styles.navIcon}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Meal Modal */}
      <Modal visible={showAddMealModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Meal</Text>
            <TextInput
              style={styles.input}
              placeholder="Meal Name"
              value={newMeal.name}
              onChangeText={(text) => setNewMeal({ ...newMeal, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Time (e.g., 8:30 AM)"
              value={newMeal.time}
              onChangeText={(text) => setNewMeal({ ...newMeal, time: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Calories"
              value={newMeal.calories}
              keyboardType="numeric"
              onChangeText={(text) => setNewMeal({ ...newMeal, calories: text })}
            />
            <Button title="Add Meal" onPress={handleAddMeal} />
            <Button title="Cancel" onPress={() => setShowAddMealModal(false)} color="red" />
          </View>
        </View>
      </Modal>
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
    height: 80, // Additional space to push content above the footer
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
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
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
});

export default HomeScreen;
