import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const MealSelectorScreen = () => {
  const navigation = useNavigation();
  const [selectedMeal, setSelectedMeal] = useState(null);

  const handleMealSelection = (meal) => {
    setSelectedMeal(meal);
    navigation.navigate('RecipeSwiper', { selectedMeal: meal });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Your Meal</Text>
      
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={[styles.button, styles.breakfastButton]}
          onPress={() => handleMealSelection('Breakfast')}
        >
          <Ionicons name="sunny-outline" size={32} color="#34495E" />
          <Text style={styles.buttonText}>Breakfast</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.lunchButton]}
          onPress={() => handleMealSelection('Lunch')}
        >
          <Ionicons name="restaurant-outline" size={32} color="#34495E" />
          <Text style={styles.buttonText}>Lunch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dinnerButton]}
          onPress={() => handleMealSelection('Dinner')}
        >
          <Ionicons name="moon-outline" size={32} color="#34495E" />
          <Text style={styles.buttonText}>Dinner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 40,
    textAlign: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
    width: 100,
    backgroundColor: '#FFF',
  },
  buttonText: {
    marginTop: 8,
    fontSize: 16,
    color: '#34495E',
    fontWeight: '600',
  },
  breakfastButton: {
    backgroundColor: '#FFDEE9',
  },
  lunchButton: {
    backgroundColor: '#B5FFFC',
  },
  dinnerButton: {
    backgroundColor: '#D4A5FF',
  },
});

export default MealSelectorScreen;