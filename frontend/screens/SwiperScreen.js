import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    PanResponder, 
    Image,
    TouchableOpacity,
    ScrollView,
    Modal,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import API_URL from './config.js';
import NavbarFooter from './Navbar.js';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 250;

const MOCK_RECIPES = [
    {
        _id: '1',
        name: 'Grilled Salmon Bowl',
        imageUrl: 'https://via.placeholder.com/400x300', // Replace with actual image URL
        prepTime: '25 mins',
        calories: 450,
        servings: 2,
        description: 'Fresh grilled salmon served over a bed of quinoa with roasted vegetables and avocado. A healthy and protein-rich meal perfect for lunch or dinner.',
        ingredients: [
            '2 salmon fillets (6 oz each)',
            '1 cup quinoa',
            '2 cups mixed vegetables',
            '1 avocado',
            '2 tbsp olive oil',
            'Salt and pepper to taste',
            'Lemon wedges for serving'
        ],
        instructions: [
            'Cook quinoa according to package instructions.',
            'Season salmon with salt, pepper, and olive oil.',
            'Grill salmon for 4-5 minutes per side.',
            'Roast vegetables in the oven at 400°F for 20 minutes.',
            'Assemble bowls with quinoa, salmon, vegetables, and sliced avocado.',
            'Serve with lemon wedges.'
        ]
    },
    {
        _id: '2',
        name: 'Mediterranean Chickpea Salad',
        imageUrl: 'https://via.placeholder.com/400x300',
        prepTime: '15 mins',
        calories: 380,
        servings: 4,
        description: 'A refreshing vegetarian salad packed with protein-rich chickpeas, fresh vegetables, and Mediterranean flavors. Perfect for meal prep!',
        ingredients: [
            '2 cans chickpeas, drained',
            '1 cucumber, diced',
            '2 cups cherry tomatoes',
            '1 red onion, sliced',
            '1 cup feta cheese',
            '1/4 cup olive oil',
            '2 tbsp lemon juice',
            'Fresh herbs'
        ],
        instructions: [
            'Drain and rinse chickpeas.',
            'Chop all vegetables.',
            'Combine ingredients in a large bowl.',
            'Whisk together olive oil and lemon juice.',
            'Toss with dressing and serve.'
        ]
    },
    {
        _id: '3',
        name: 'Chicken Teriyaki Stir-Fry',
        imageUrl: 'https://via.placeholder.com/400x300',
        prepTime: '30 mins',
        calories: 420,
        servings: 3,
        description: 'Quick and flavorful chicken stir-fry with colorful vegetables in a homemade teriyaki sauce. Served over steamed rice.',
        ingredients: [
            '1 lb chicken breast, cubed',
            '2 cups mixed vegetables',
            '1/2 cup teriyaki sauce',
            '2 cups rice',
            '2 tbsp vegetable oil',
            'Sesame seeds for garnish'
        ],
        instructions: [
            'Cook rice according to package instructions.',
            'Cut chicken into bite-sized pieces.',
            'Stir-fry chicken until golden brown.',
            'Add vegetables and cook until tender.',
            'Pour in teriyaki sauce and simmer.',
            'Serve over rice and garnish with sesame seeds.'
        ]
    },
]

const recipeImages = [
    "https://plus.unsplash.com/premium_vector-1707895669854-949996f03512?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_vector-1711839884124-9ba4289d1bd8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_vector-1707895669941-00eccc17e615?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGZvb2R8ZW58MHx8MHx8fDA%3D",
    "https://plus.unsplash.com/premium_vector-1713201017274-e9e97d783e75?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_vector-1708810688586-fdd917f9814b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2l0Y2hlbnxlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_vector-1707895669908-b188a3a755a9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_vector-1711839884126-3f7699c89266?q=80&w=2728&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://plus.unsplash.com/premium_vector-1711839884129-0e98588a3ebf?q=80&w=2654&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://plus.unsplash.com/premium_vector-1713796100360-4be6d2c22904?q=80&w=2954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * recipeImages.length);
    return recipeImages[randomIndex];
};

const RecipeSwiperScreen = () => {
    const [recipes, setRecipes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecipe, setShowRecipe] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const position = useRef(new Animated.ValueXY()).current;
    const [showResetBar, setShowResetBar] = useState(false);

    const rotation = position.x.interpolate({
        inputRange: [-500, 0, 500],
        outputRange: ['-30deg', '0deg', '30deg']
    });

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const userString = await AsyncStorage.getItem('user');
            if (!userString) {
                throw new Error('No user data found');
            }
    
            const user = JSON.parse(userString);
            const userId = user._id;
    
            const response = await fetch(`${API_URL}/api/recipe/${userId}`);
            const responseData = await response.json();
    
            if (!response.ok) {
                if (responseData.fallback) {
                    console.log('Using fallback recipes due to API error');
                    // Update fallback data with random images
                    const fallbackWithImages = responseData.fallback.map(recipe => ({
                        ...recipe,
                        imageUrl: getRandomImage()
                    }));
                    setRecipes(fallbackWithImages);
                } else {
                    throw new Error(responseData.message || 'Failed to fetch recipes');
                }
                setLoading(false);
                return;
            }
    
            const recipes = Array.isArray(responseData) ? responseData : responseData.fallback;
            
            if (!recipes || !Array.isArray(recipes)) {
                throw new Error('Invalid recipe data format');
            }
    
            // Update validation to use random images
            const validatedRecipes = recipes.map((recipe, index) => ({
                _id: recipe._id || String(index + 1),
                name: recipe.name || 'Unnamed Recipe',
                imageUrl: getRandomImage(), // Use random image if no image provided
                prepTime: recipe.prepTime || '30 mins',
                calories: Number(recipe.calories) || 0,
                servings: Number(recipe.servings) || 2,
                description: recipe.description || 'No description available',
                ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
                instructions: Array.isArray(recipe.instructions) ? recipe.instructions : []
            }));
    
            setRecipes(validatedRecipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setError(error.message);
            // Update mock recipes with random images
            const mockRecipesWithImages = MOCK_RECIPES.map(recipe => ({
                ...recipe,
                imageUrl: getRandomImage()
            }));
            setRecipes(mockRecipesWithImages);
        } finally {
            setLoading(false);
        }
    };
    
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gesture) => {
            position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (event, gesture) => {
            const isLastCard = currentIndex === recipes.length - 1;

            if (gesture.dx > SWIPE_THRESHOLD) {
                forceSwipe('right');
            } else if (gesture.dx < -SWIPE_THRESHOLD) {
                if (isLastCard) {
                    forceSwipeLastCard('left');
                } else {
                    forceSwipe('left');
                }
            } else {
                resetPosition();
            }
        }
    });

    const forceSwipe = (direction) => {
        const x = direction === 'right' ? 500 : -500;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true
        }).start(() => onSwipeComplete(direction));
    };

    const forceSwipeLastCard = (direction) => {
        Animated.timing(position, {
            toValue: { x: -500, y: 0 },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true
        }).start(() => {
            setShowResetBar(true);
            position.setValue({ x: 150, y: 0 });
        });
    };

    const onSwipeComplete = (direction) => {
        if (direction === 'right') {
            saveLikedRecipe(recipes[currentIndex]._id);
            setSelectedRecipe(recipes[currentIndex]);
            setShowRecipe(true);
        }
        position.setValue({ x: 0, y: 0 });
        setCurrentIndex(prevIndex => prevIndex + 1);
    };
    
    const handleReset = () => {
        setShowResetBar(false);
        setCurrentIndex(0);
    };

    const saveLikedRecipe = async (recipeId) => {
        try {
            const likedRecipe = recipes.find(recipe => recipe._id === recipeId);
            if (likedRecipe) {
                // Retrieve existing recent meals
                const existingMeals = await AsyncStorage.getItem('recentMeals');
                const recentMeals = existingMeals ? JSON.parse(existingMeals) : [];
    
                // Add the new recipe at the start of the list
                recentMeals.unshift(likedRecipe);
    
                // Limit the list to the last 5 meals
                if (recentMeals.length > 5) recentMeals.pop();
    
                // Save updated list to AsyncStorage
                await AsyncStorage.setItem('recentMeals', JSON.stringify(recentMeals));
            }
        } catch (error) {
            console.error('Error saving liked recipe:', error);
        }
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true
        }).start();
    };

    const getCardStyle = () => ({
        transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: rotation }
        ]
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Loading recipes...</Text>
                <NavbarFooter />

            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchRecipes}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderCards = () => {
        if (showResetBar) {
            return (
                <View style={styles.noMoreCards}>
                    <TouchableOpacity 
                        style={styles.resetBar}
                        onPress={handleReset}
                    >
                        <View style={styles.resetBarInner}>
                        </View>
                    </TouchableOpacity>

                </View>
            );
        }

        return recipes
            .slice(currentIndex, currentIndex + 3)
            .reverse()
            .map((recipe, index) => {
                const isFirst = index === recipes.slice(currentIndex, currentIndex + 3).length - 1;
                
                return (
                    <Animated.View
                        key={recipe._id}
                        style={[styles.cardContainer, isFirst ? getCardStyle() : { top: 10 * (2 - index) }]}
                        {...(isFirst ? panResponder.panHandlers : {})}
                    >
                        <RecipeCard recipe={recipe} isFirst={isFirst} />
                    </Animated.View>
                );
            });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Discover Recipes</Text>
            </View>

            <View style={styles.cardsArea}>
                {renderCards()}
            </View>

            <RecipeDetail
                recipe={selectedRecipe}
                visible={showRecipe}
                onClose={() => setShowRecipe(false)}
            />
                        <NavbarFooter />

        </View>
    );
};

const RecipeCard = ({ recipe, isFirst }) => {
    if (!recipe) return null;

    return (
        <Animated.View style={[styles.card, !isFirst && styles.cardStacked]}>
            <Image
                source={{ uri: recipe.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{recipe.name}</Text>
                <View style={styles.cardInfo}>
                    <View style={styles.infoItem}>
                        <MaterialIcons name="schedule" size={20} color="#FFD700" />
                        <Text style={styles.infoText}>{recipe.prepTime}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <MaterialIcons name="local-fire-department" size={20} color="#FFD700" />
                        <Text style={styles.infoText}>{recipe.calories} cal</Text>
                    </View>
                </View>
                <Text style={styles.cardDescription} numberOfLines={3}>
                    {recipe.description}
                </Text>
            </View>

        </Animated.View>
        
    );
};

// Recipe Detail Modal
const RecipeDetail = ({ recipe, visible, onClose }) => {
    if (!recipe) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
        >
            <View style={styles.modalContainer}>


                <ScrollView>
                    <Image
                        source={{ uri: recipe.imageUrl }}
                        style={styles.recipeImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <MaterialIcons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>
                    
                    <View style={styles.recipeContent}>
                        <Text style={styles.recipeTitle}>{recipe.name}</Text>
                        
                        <View style={styles.recipeMetrics}>
                            <View style={styles.metricItem}>
                                <MaterialIcons name="schedule" size={24} color="#FFD700" />
                                <Text style={styles.metricText}>{recipe.prepTime}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <MaterialIcons name="local-fire-department" size={20} color="#FFD700" />
                                <Text style={styles.infoText}>{recipe.calories} cal</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <MaterialIcons name="restaurant" size={24} color="#FFD700" />
                                <Text style={styles.metricText}>{recipe.servings} servings</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.sectionText}>{recipe.description}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ingredients</Text>
                            {(recipe.ingredients || []).map((ingredient, index) => (
                                <View key={index} style={styles.ingredientItem}>
                                    <MaterialIcons name="fiber-manual-record" size={12} color="#FFD700" />
                                    <Text style={styles.ingredientText}>{ingredient}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Instructions</Text>
                            {(recipe.instructions || []).map((step, index) => (
                                <View key={index} style={styles.instructionItem}>
                                    <Text style={styles.instructionNumber}>{index + 1}</Text>
                                    <Text style={styles.instructionText}>{step}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={styles.spacer} />
                </ScrollView>
                
            </View>
            

        </Modal>
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
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    cardContainer: {
        flex: 1,
        padding: 20,
        position: 'absolute',
        width: width - 40,
        height: height * 0.2,
        left: 20,
    },
    card: {
        position: 'absolute',
        width: width - 40,
        height: height * 0.7,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardStacked: {
        top: 5,
        transform: [{ scale: 0.95 }],
    },
    cardImage: {
        width: '100%',
        height: '60%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    cardContent: {
        padding: 20,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    cardInfo: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    infoText: {
        marginLeft: 5,
        color: '#666',
    },
    cardDescription: {
        color: '#666',
        fontSize: 16,
        lineHeight: 22,
    },
    // Recipe Detail Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    recipeImage: {
        width: '100%',
        height: height * 0.4,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    recipeContent: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
    },
    recipeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    recipeMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    metricItem: {
        alignItems: 'center',
    },
    metricText: {
        marginTop: 5,
        color: '#666',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    sectionText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ingredientText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#666',
    },
    spacer: {
        height: 10, // Additional space to push content above the footer
      },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    instructionNumber: {
        width: 25,
        height: 25,
        backgroundColor: '#FFD700',
        borderRadius: 12.5,
        textAlign: 'center',
        lineHeight: 25,
        marginRight: 10,
        fontWeight: 'bold',
    },
    instructionText: {
        flex: 1,
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    noMoreCards: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    noMoreCardsText: {
        fontSize: 20,
        color: '#666',
        fontWeight: '500',
        marginBottom: 30,
    },
    resetBar: {
        width: '60%',
        backgroundColor: '#FFD700',
        height: 20,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    resetBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetBarText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 10,
    },
    cardContainer: {
        position: 'absolute',
        width: width - 40,
        height: height * 0.6,
        left: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF6B6B',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    cardsArea: {
        flex: 1,
        marginTop: 20, // Added margin at the top of cards area
    },
    
});

export default RecipeSwiperScreen;