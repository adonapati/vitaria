import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions, 
    Alert, 
    Modal, 
    ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import API_URL from './config';

const { width } = Dimensions.get('window');

// Predefined options
const DIET_PREFERENCES = [
    'Any',
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo',
    'Low-Carb',
    'Halal',
    'Kosher'
];

const COMMON_ALLERGIES = [
    'None',
    'Peanuts',
    'Tree Nuts',
    'Milk',
    'Egg',
    'Wheat',
    'Soybeans',
    'Fish',
    'Shellfish',
    'Sesame', 
    'Celery',
    'Garlic',
    'Oats',
    'Maize',
    'Mustard',
    'Rice',
    'Kiwi',
    'Banana',
    'Avocado',
    'Berry',
    'Mango'
];

const PREP_TIME_OPTIONS = [
    '15 minutes or less',
    '15-30 minutes',
    '30-60 minutes',
    '60+ minutes'
];

const ACTIVITY_LEVELS = [
    'Sedentary (little or no exercise)',
    'Lightly active (1-3 days/week)',
    'Moderately active (3-5 days/week)',
    'Very active (6-7 days/week)',
    'Extremely active (athlete)'
];

const CUISINE_PREFERENCES = [
    'All',
    'Italian',
    'Indian',
    'Chinese',
    'Japanese',
    'Mexican',
    'Thai',
    'Mediterranean',
    'American',
    'French',
    'Korean',
    'Middle Eastern',
    'Greek'
];

const HEALTH_CONDITIONS = [
    'None',
    'Weight Loss',
    'Weight Gain',
    'Celiac Disease',
    'IBS',
    'Diabetes',
    'Hypertension',
    'High Cholesterol',
    'GERD',
    'Lactose Intolerance',
    'Food Sensitivities', 
    'ARFID',
    'Anorexia',
    'Bulimia'
];

// MultiSelect Modal Component
const MultiSelect = ({ visible, onClose, title, options, selected, onSelect }) => (
    <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScrollView}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.checkboxContainer}
                            onPress={() => onSelect(option)}
                        >
                            <MaterialIcons
                                name={selected.includes(option) ? "check-box" : "check-box-outline-blank"}
                                size={24}
                                color="#FFD700"
                            />
                            <Text style={styles.checkboxLabel}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity style={styles.modalDoneButton} onPress={onClose}>
                    <Text style={styles.modalDoneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

// Main Component
export default function ProfileSetupScreen({ navigation }) {
    // State variables
    const [currentStep, setCurrentStep] = useState(0);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [allergies, setAllergies] = useState([]);
    const [dietPreferences, setDietPreferences] = useState([]);
    const [showAllergiesModal, setShowAllergiesModal] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);

    const [prepTime, setPrepTime] = useState('');
    const [activityLevel, setActivityLevel] = useState('');
    const [cuisinePreferences, setCuisinePreferences] = useState([]);
    const [healthConditions, setHealthConditions] = useState([]);
    const [showCuisineModal, setShowCuisineModal] = useState(false);
    const [showHealthModal, setShowHealthModal] = useState(false);

    // Validation function
    const validateStep = () => {
        switch (currentStep) {
            case 0:
                if (!age || !gender) {
                    Alert.alert('Missing Information', 'Please fill in age and select gender');
                    return false;
                }
                break;
            case 1:
                if (!weight || !height) {
                    Alert.alert('Missing Information', 'Please fill in weight and height');
                    return false;
                }
                if (isNaN(weight) || isNaN(height)) {
                    Alert.alert('Invalid Input', 'Please enter valid numbers for weight and height');
                    return false;
                }
                break;
            case 2:
                return true;
            case 3:
                if (!prepTime || !activityLevel) {
                    Alert.alert('Missing Information', 'Please select prep time and activity level');
                    return false;
                }
                break;
        }
        return true;
    };

    // Navigation handlers
    const handleNext = () => {
        if (!validateStep()) return;

        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSaveProfile();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Save profile function
    const handleSaveProfile = async () => {
        try {
            const user = await AsyncStorage.getItem('user');
            const userData = JSON.parse(user);
            const userId = userData._id;
            
            const response = await fetch(`${API_URL}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    age: parseInt(age),
                    gender,
                    allergies,
                    dietPreferences,
                    prepTime,
                    activityLevel,
                    cuisinePreferences,
                    healthConditions,
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save profile.');
            }
    
            Alert.alert('Success', 'Profile saved successfully!');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', error.message);
        }
    };

    // Step rendering function
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="person-outline" size={40} color="#FFD700" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Age"
                            keyboardType="numeric"
                            value={age}
                            onChangeText={setAge}
                            placeholderTextColor="#888"
                        />
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={gender}
                                style={styles.picker}
                                onValueChange={(itemValue) => setGender(itemValue)}
                            >
                                <Picker.Item label="Select Gender" value="" />
                                <Picker.Item label="Male" value="Male" />
                                <Picker.Item label="Female" value="Female" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </View>
                    </View>
                );

            case 1:
                return (
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="fitness-center" size={40} color="#FFD700" />
                        </View>
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.input}
                                placeholder="Weight (kg)"
                                keyboardType="numeric"
                                value={weight}
                                onChangeText={setWeight}
                                placeholderTextColor="#888"
                            />
                            <View style={styles.spacer} />
                            <TextInput
                                style={styles.input}
                                placeholder="Height (cm)"
                                keyboardType="numeric"
                                value={height}
                                onChangeText={setHeight}
                                placeholderTextColor="#888"
                            />
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="restaurant" size={40} color="#FFD700" />
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.dropdownButton}
                            onPress={() => setShowAllergiesModal(true)}
                        >
                            <Text style={styles.dropdownButtonText}>
                                {allergies.length > 0 
                                    ? `Selected Allergies (${allergies.length})`
                                    : 'Select Allergies'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                        </TouchableOpacity>

                        {allergies.length > 0 && (
                            <View style={styles.selectedItemsContainer}>
                                {allergies.map((item) => (
                                    <View key={item} style={styles.selectedItem}>
                                        <Text style={styles.selectedItemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity 
                            style={styles.dropdownButton}
                            onPress={() => setShowPreferencesModal(true)}
                        >
                            <Text style={styles.dropdownButtonText}>
                                {dietPreferences.length > 0 
                                    ? `Selected Preferences (${dietPreferences.length})`
                                    : 'Select Diet Preferences'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                        </TouchableOpacity>

                        {dietPreferences.length > 0 && (
                            <View style={styles.selectedItemsContainer}>
                                {dietPreferences.map((item) => (
                                    <View key={item} style={styles.selectedItem}>
                                        <Text style={styles.selectedItemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <MultiSelect
                            visible={showAllergiesModal}
                            onClose={() => setShowAllergiesModal(false)}
                            title="Select Allergies"
                            options={COMMON_ALLERGIES}
                            selected={allergies}
                            onSelect={(item) => {
                                setAllergies(current => 
                                    current.includes(item)
                                        ? current.filter(i => i !== item)
                                        : [...current, item]
                                );
                            }}
                        />

                        <MultiSelect
                            visible={showPreferencesModal}
                            onClose={() => setShowPreferencesModal(false)}
                            title="Select Diet Preferences"
                            options={DIET_PREFERENCES}
                            selected={dietPreferences}
                            onSelect={(item) => {
                                setDietPreferences(current => 
                                    current.includes(item)
                                        ? current.filter(i => i !== item)
                                        : [...current, item]
                                );
                            }}
                        />
                    </View>
                );
                
                case 3:
                    return (
                        <View style={styles.card}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name="schedule" size={40} color="#FFD700" />
                            </View>
    
                            {/* Prep Time Picker */}
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={prepTime}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setPrepTime(itemValue)}
                                >
                                    <Picker.Item label="Select Meal Prep Time" value="" />
                                    {PREP_TIME_OPTIONS.map((time) => (
                                        <Picker.Item key={time} label={time} value={time} />
                                    ))}
                                </Picker>
                            </View>
    
                            {/* Activity Level Picker */}
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={activityLevel}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setActivityLevel(itemValue)}
                                >
                                    <Picker.Item label="Select Activity Level" value="" />
                                    {ACTIVITY_LEVELS.map((level) => (
                                        <Picker.Item key={level} label={level} value={level} />
                                    ))}
                                </Picker>
                            </View>
    
                            {/* Cuisine Preferences */}
                            <TouchableOpacity 
                                style={styles.dropdownButton}
                                onPress={() => setShowCuisineModal(true)}
                            >
                                <Text style={styles.dropdownButtonText}>
                                    {cuisinePreferences.length > 0 
                                        ? `Selected Cuisines (${cuisinePreferences.length})`
                                        : 'Select Cuisine Preferences'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                            </TouchableOpacity>
    
                            {cuisinePreferences.length > 0 && (
                                <View style={styles.selectedItemsContainer}>
                                    {cuisinePreferences.map((item) => (
                                        <View key={item} style={styles.selectedItem}>
                                            <Text style={styles.selectedItemText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
    
                            {/* Health Conditions */}
                            <TouchableOpacity 
                                style={styles.dropdownButton}
                                onPress={() => setShowHealthModal(true)}
                            >
                                <Text style={styles.dropdownButtonText}>
                                    {healthConditions.length > 0 
                                        ? `Selected Health Conditions (${healthConditions.length})`
                                        : 'Select Health Conditions'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                            </TouchableOpacity>
    
                            {healthConditions.length > 0 && (
                                <View style={styles.selectedItemsContainer}>
                                    {healthConditions.map((item) => (
                                        <View key={item} style={styles.selectedItem}>
                                            <Text style={styles.selectedItemText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
    
                            {/* MultiSelect Modals */}
                            <MultiSelect
                                visible={showCuisineModal}
                                onClose={() => setShowCuisineModal(false)}
                                title="Select Cuisine Preferences"
                                options={CUISINE_PREFERENCES}
                                selected={cuisinePreferences}
                                onSelect={(item) => {
                                    setCuisinePreferences(current => 
                                        current.includes(item)
                                            ? current.filter(i => i !== item)
                                            : [...current, item]
                                    );
                                }}
                            />
    
                            <MultiSelect
                                visible={showHealthModal}
                                onClose={() => setShowHealthModal(false)}
                                title="Select Health Conditions"
                                options={HEALTH_CONDITIONS}
                                selected={healthConditions}
                                onSelect={(item) => {
                                    setHealthConditions(current => 
                                        current.includes(item)
                                            ? current.filter(i => i !== item)
                                            : [...current, item]
                                    );
                                }}
                            />
                        </View>
                    );
            }
        };

    const stepTitles = [
        "Basic Information", 
        "Body Metrics", 
        "Dietary Preferences",
        "Lifestyle & Health"  // New step
    ];    

    // Main render
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Your Profile</Text>
                <View style={styles.progressBar}>
                    {[0, 1, 2, 3].map((step) => (
                        <View
                            key={step}
                            style={[
                                styles.progressDot,
                                step <= currentStep ? styles.progressDotActive : {}
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.stepTitle}>{stepTitles[currentStep]}</Text>
                {renderCurrentStep()}
            </View>

            <View style={styles.buttonContainer}>
                {currentStep > 0 && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color="#666" />
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    style={styles.nextButton} 
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {currentStep === 3 ? 'Complete' : 'Next'}  {/* Changed from 2 to 3 */}
                    </Text>
                    <MaterialIcons 
                        name={currentStep === 3 ? "check" : "arrow-forward"} 
                        size={24} 
                        color="#000" 
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#DDD',
        marginHorizontal: 5,
    },
    progressDotActive: {
        backgroundColor: '#FFD700',
        width: 12,
        height: 12,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    inputGroup: {
        width: '100%',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#F8F8F8',
        borderRadius: 25,
        paddingHorizontal: 20,
        marginVertical: 10,
        fontSize: 16,
    },
    spacer: {
        height: 10,
    },
    pickerWrapper: {
        width: '100%',
        height: 50,
        backgroundColor: '#F8F8F8',
        borderRadius: 25,
        marginVertical: 10,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    backButtonText: {
        marginLeft: 5,
        fontSize: 16,
        color: '#666',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    nextButtonText: {
        marginRight: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalScrollView: {
        maxHeight: 400,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    modalDoneButton: {
        backgroundColor: '#FFD700',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    modalDoneButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 25,
        padding: 15,
        marginVertical: 10,
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333',
    },
    selectedItemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        marginBottom: 20,
    },
    selectedItem: {
        backgroundColor: '#FFD70033',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        margin: 4,
    },
    selectedItemText: {
        color: '#333',
        fontSize: 14,
    },

});