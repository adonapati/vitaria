import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ActivityIndicator, 
    ScrollView, 
    Alert, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import API_URL from './config';
import NavbarFooter from './Navbar';
const { width } = Dimensions.get('window');

const UserProfile = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userString = await AsyncStorage.getItem('user');
            const user = JSON.parse(userString);
            const userId = user._id;

            const response = await axios.get(`${API_URL}/user/${userId}`);
            setUserData(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error.message);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove(['user', 'token']);
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteProfile = () => {
        Alert.alert(
            "Delete Profile",
            "Are you sure you want to delete your profile? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: deleteUserProfile,
                    style: "destructive"
                }
            ]
        );
    };

    const deleteUserProfile = async () => {
        try {
            const userString = await AsyncStorage.getItem('user');
            const user = JSON.parse(userString);
            const userId = user._id;

            await axios.delete(`${API_URL}/user/${userId}`);
            await AsyncStorage.removeItem('user');
            Alert.alert('Success', 'Profile deleted successfully');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Error deleting profile:', error);
            Alert.alert('Error', 'Failed to delete profile');
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const renderCard = (title, icon, content) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name={icon} size={30} color="#FFD700" />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={styles.cardContent}>
                {content}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    return (
      <View style={styles.container}>
          <View style={styles.header}>
              <Text style={styles.title}>Your Profile</Text>
              <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => navigation.navigate('ProfileSetup', { userData })}
              >
                  <MaterialIcons name="edit" size={24} color="#666" />
                  <Text style={styles.headerButtonText}>Edit</Text>
              </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
              {error ? (
                  <Text style={styles.errorText}>{error}</Text>
              ) : userData ? (
                  <>
                    {renderCard("Basic Information", "person-outline", (
                            <View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Age:</Text>
                                    <Text style={styles.value}>{userData.age} years</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Gender:</Text>
                                    <Text style={styles.value}>{userData.gender}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Email:</Text>
                                    <Text style={styles.value}>{userData.email}</Text>
                                </View>
                            </View>
                        ))}

                        {renderCard("Body Metrics", "fitness-center", (
                            <View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Height:</Text>
                                    <Text style={styles.value}>{userData.height} cm</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Weight:</Text>
                                    <Text style={styles.value}>{userData.weight} kg</Text>
                                </View>
                            </View>
                        ))}

                        {renderCard("Dietary Preferences", "restaurant", (
                            <View>
                                <View style={styles.preferencesContainer}>
                                    <Text style={styles.subheading}>Allergies:</Text>
                                    <View style={styles.tagsContainer}>
                                        {userData.allergies.map((allergy, index) => (
                                            <View key={index} style={styles.tag}>
                                                <Text style={styles.tagText}>{allergy}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.preferencesContainer}>
                                    <Text style={styles.subheading}>Diet Preferences:</Text>
                                    <View style={styles.tagsContainer}>
                                        {userData.dietPreferences.map((pref, index) => (
                                            <View key={index} style={styles.tag}>
                                                <Text style={styles.tagText}>{pref}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ))}

                        {renderCard("Lifestyle & Health", "schedule", (
                            <View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Activity Level:</Text>
                                    <Text style={styles.value}>{userData.activityLevel}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Prep Time:</Text>
                                    <Text style={styles.value}>{userData.prepTime}</Text>
                                </View>
                                <View style={styles.preferencesContainer}>
                                    <Text style={styles.subheading}>Cuisine Preferences:</Text>
                                    <View style={styles.tagsContainer}>
                                        {userData.cuisinePreferences.map((cuisine, index) => (
                                            <View key={index} style={styles.tag}>
                                                <Text style={styles.tagText}>{cuisine}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.preferencesContainer}>
                                    <Text style={styles.subheading}>Health Conditions:</Text>
                                    <View style={styles.tagsContainer}>
                                        {userData.healthConditions.map((condition, index) => (
                                            <View key={index} style={styles.tag}>
                                                <Text style={styles.tagText}>{condition}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ))}

{renderCard("Account Actions", "settings", (
                            <View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Logout Account</Text>
                                    <TouchableOpacity 
                                        style={styles.actionButton}
                                        onPress={handleLogout}
                                    >
                                        <Text style={styles.value}>Logout</Text>
                                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Delete Account</Text>
                                    <TouchableOpacity 
                                        style={styles.actionButton}
                                        onPress={handleDeleteProfile}
                                    >
                                        <Text style={styles.value}>Delete</Text>
                                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </>
                ) : (
                    <Text style={styles.errorText}>User data could not be loaded.</Text>
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
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
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
        textAlign: 'center',
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
        marginBottom: 20,
    },
    spacer: {
        height: 100, // Additional space to push content above the footer
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
        backgroundColor: '#FFD70033',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
  },
  label: {
      fontSize: 16,
      color: '#666',
  },
  value: {
      fontSize: 16,
      color: '#333',
      fontWeight: '500',
      marginRight: 8,
  },
  actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  preferencesContainer: {
        marginVertical: 10,
    },
    subheading: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#FFD70033',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        margin: 4,
    },
    tagText: {
        color: '#333',
        fontSize: 14,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF6347',
        padding: 15,
        borderRadius: 15,
        marginTop: 10,
    },
    deleteButtonText: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#FF6347',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});

export default UserProfile;