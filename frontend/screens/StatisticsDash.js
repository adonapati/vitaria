import React from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    Dimensions,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import NavbarFooter from './Navbar';
const { width } = Dimensions.get('window');

const NutritionDashboard = () => {
    // Static data for charts
    const caloriesData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            data: [2300, 2150, 2400, 2250, 2350, 2100, 2450],
        }]
    };

    const waterData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            data: [3, 2.8, 3.2, 2.9, 3.1, 2.7, 3.3],
        }]
    };

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 1,
        style: {
            borderRadius: 16
        },
    };

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Nutrition Dashboard</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <MaterialIcons name="refresh" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                scrollIndicatorInsets={{ bottom: 60 }} // Accounts for navbar height
            >
                {renderCard("Daily Summary", "pie-chart", (
                    <View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Calories Target:</Text>
                            <Text style={styles.value}>2300 kcal</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Water Goal:</Text>
                            <Text style={styles.value}>3.0 L</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Protein Target:</Text>
                            <Text style={styles.value}>120g</Text>
                        </View>
                    </View>
                ))}

                {renderCard("Calorie Tracking", "local-fire-department", (
                    <View>
                        <Text style={styles.chartLabel}>Weekly Overview</Text>
                        <LineChart
                            data={caloriesData}
                            width={width - 80}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                ))}

                {renderCard("Hydration", "water-drop", (
                    <View>
                        <Text style={styles.chartLabel}>Weekly Water Intake (L)</Text>
                        <LineChart
                            data={waterData}
                            width={width - 80}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                ))}

                {renderCard("Macronutrients", "restaurant", (
                    <View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Carbs:</Text>
                            <Text style={styles.value}>250g / 300g</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Protein:</Text>
                            <Text style={styles.value}>85g / 120g</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Fat:</Text>
                            <Text style={styles.value}>65g / 80g</Text>
                        </View>
                    </View>
                ))}

                {/* Extra space at bottom to account for navbar when scrolled to bottom */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            <View style={styles.fixedNavbar}>
                <NavbarFooter />
            </View>
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
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
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFD70033',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
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
    },
    chartLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
        marginLeft: 10,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    fixedNavbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    bottomSpacing: {
        height: 60, // Same as navbar height
    }
});

export default NutritionDashboard;