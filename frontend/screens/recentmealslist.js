import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const RecentMealsList = ({ recentMeals, onAddMeal }) => {
  // State for controlling the modal visibility and new meal details
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    time: '',
    calories: '',
  });

  const renderMealItem = (item) => (
    <View style={styles.mealItem} key={item.id || item.name}>
      <View>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealTime}>{item.time}</Text>
      </View>
      <Text style={styles.mealCalories}>{item.calories} kcal</Text>
    </View>
  );

  const handleAddMeal = () => {
    if (newMeal.name && newMeal.time && newMeal.calories) {
      const meal = {
        id: new Date().getTime(), // Generate a unique ID
        name: newMeal.name,
        time: newMeal.time,
        calories: parseInt(newMeal.calories),
      };
      onAddMeal(meal); // Add the new meal to the list
      setShowAddMealModal(false); // Close the modal
      setNewMeal({ name: '', time: '', calories: '' }); // Clear input fields
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Meals</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {recentMeals.length > 0 ? (
          recentMeals.map((item) => renderMealItem(item)) // Map over the meals
        ) : (
          <Text style={styles.emptyMessage}>No recent meals</Text>
        )}
      </ScrollView>

      {/* Add Button to open modal */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMealModal(true)}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

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
            <Button title="Add Meal" onPress={handleAddMeal} style={styles.modalButtonAdd} />
            <Button title="Cancel" onPress={() => setShowAddMealModal(false)} style={styles.modalButtonCancel}/>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  card: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    position: 'relative', // Enable positioning of the add button
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  mealName: {
    fontSize: 16,
  },
  mealTime: {
    fontSize: 12,
    color: '#888',
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50', // Green button background
    borderRadius: 50, // Make it circular
    padding: 10,
    elevation: 3, // Shadow for better visibility
  },
  
  scrollView: {
    paddingBottom: 70, // Make space for the add button at the bottom
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
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
};

export default RecentMealsList;
