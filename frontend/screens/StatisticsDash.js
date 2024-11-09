import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

function NutritionDashboard() {
  // Combined data for calories with target line
  const caloriesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2300, 2150, 2400, 2250, 2350, 2100, 2450],
        color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`, // Tomato color for actual calories
        strokeWidth: 2,
      },
      {
        data: [2300, 2300, 2300, 2300, 2300, 2300, 2300],
        color: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`, // Gray color for target
        strokeWidth: 1,
        withDots: false,
      },
    ],
    legend: ['Actual', 'Target']
  };

  const waterData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [3, 2.8, 3.2, 2.9, 3.1, 2.7, 3.3],
        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`, // DodgerBlue
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    }
  };

  const StatCard = ({ title, value, unit, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>
        {value}
        <Text style={styles.statUnit}> {unit}</Text>
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nutritional Insights</Text>

      {/* Quick Stats Row */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Daily Target"
          value="2300"
          unit="kcal"
          icon="target"
          color="#FF6B6B"
        />
        <StatCard
          title="Water Goal"
          value="3.0"
          unit="L"
          icon="water"
          color="#4ECDC4"
        />
      </View>

      {/* Calories Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
          <Text style={styles.cardTitle}>Calorie Tracking</Text>
        </View>
        <Text style={styles.cardSubtitle}>Daily intake vs Target</Text>
        <LineChart
          data={caloriesData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          }}
          bezier
          style={styles.chart}
          renderDotContent={({ x, y, index }) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: x - 20,
                top: y - 24,
              }}>
              <Text style={styles.dotLabel}>
                {caloriesData.datasets[0].data[index]}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Water Intake */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="water" size={24} color="#4ECDC4" />
          <Text style={styles.cardTitle}>Hydration</Text>
        </View>
        <Text style={styles.cardSubtitle}>Daily water intake (L)</Text>
        <LineChart
          data={waterData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
          }}
          bezier
          style={styles.chart}
          renderDotContent={({ x, y, index }) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: x - 16,
                top: y - 24,
              }}>
              <Text style={styles.dotLabel}>
                {waterData.datasets[0].data[index]}L
              </Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4', // Light yellow background
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    marginLeft: 34,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dotLabel: {
    fontSize: 12,
    color: '#666',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 4,
    borderRadius: 4,
  },
});

export default NutritionDashboard;