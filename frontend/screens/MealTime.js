import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView,
    Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NavbarFooter from './Navbar';

const { width } = Dimensions.get('window');

const MealTime = ({ navigation }) => {
    const [selectedMeal, setSelectedMeal] = useState(null);

    const handleMealSelection = (meal) => {
        setSelectedMeal(meal);
        navigation.navigate('RecipeSwiper', { selectedMeal: meal });
    };

    const renderMealCard = (title, icon, description, color) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => handleMealSelection(title)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}33` }]}>
                    <MaterialIcons name={icon} size={30} color={color} />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.description}>{description}</Text>
                <View style={styles.timeContainer}>
                    <MaterialIcons name="schedule" size={20} color="#666" />
                    <Text style={styles.timeText}>Recommended Time: {getRecommendedTime(title)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const getRecommendedTime = (meal) => {
        switch (meal) {
            case 'Breakfast':
                return '7:00 AM - 9:00 AM';
            case 'Lunch':
                return '12:00 PM - 2:00 PM';
            case 'Dinner':
                return '6:00 PM - 8:00 PM';
            default:
                return '';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Choose Your Meal</Text>
                <TouchableOpacity 
                    style={styles.headerButton}
                >
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {renderMealCard(
                    "Breakfast", 
                    "wb-sunny", 
                    "Start your day with a nutritious breakfast tailored to your preferences.",
                    "#FFD700"
                )}
                
                {renderMealCard(
                    "Lunch", 
                    "restaurant", 
                    "Discover perfectly balanced lunch options for your busy day.",
                    "#4CAF50"
                )}
                
                {renderMealCard(
                    "Dinner", 
                    "nights-stay", 
                    "End your day with a satisfying dinner that matches your dietary needs.",
                    "#7B68EE"
                )}

                <View style={styles.spacer} />
            </ScrollView>
            
            <NavbarFooter />
        </View>
    );
};

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    headerButtonText: {
        marginLeft: 5,
        fontSize: 16,
        color: '#666',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        paddingHorizontal: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
        lineHeight: 22,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 10,
        borderRadius: 10,
    },
    timeText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    spacer: {
        height: 100,
    }
});

export default MealTime;