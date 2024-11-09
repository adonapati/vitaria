import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

function NutritionDashboard() {
  // Weekly data
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2300, 2150, 2400, 2250, 2350, 2100, 2450],
        color: (opacity = 1) => `rgba(106, 13, 173, ${opacity})`, // Purple color
      },
    ],
  };

  // Macronutrients data for bar chart
  const macroData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [150, 140, 155, 145, 152, 138, 158], // Protein
        color: (opacity = 1) => `rgba(255, 128, 66, ${opacity})`, // Protein color
      },
      {
        data: [280, 260, 290, 270, 285, 255, 295], // Carbs
        color: (opacity = 1) => `rgba(0, 196, 159, ${opacity})`, // Carbs color
      },
      {
        data: [70, 65, 75, 68, 72, 63, 77], // Fats
        color: (opacity = 1) => `rgba(255, 187, 40, ${opacity})`, // Fats color
      },
    ],
  };

  // Pie chart data for macronutrient distribution
  const macroDistribution = [
    {
      name: 'Protein',
      population: 150,
      color: '#FF8042',
      legendFontColor: '#7F7F7F',
    },
    {
      name: 'Carbs',
      population: 280,
      color: '#00C49F',
      legendFontColor: '#7F7F7F',
    },
    {
      name: 'Fats',
      population: 70,
      color: '#FFBB28',
      legendFontColor: '#7F7F7F',
    },
  ];

  // Water intake data
  const waterData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [3, 2.8, 3.2, 2.9, 3.1, 2.7, 3.3],
        color: (opacity = 1) => `rgba(130, 202, 157, ${opacity})`, // Green color
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(106, 13, 173, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nutritional Insights Dashboard</Text>

      {/* Calories Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Calorie Intake</Text>
        <LineChart
          data={weeklyData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Macronutrients Distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Macronutrients Distribution</Text>
        <PieChart
          data={macroDistribution}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      {/* Macronutrients Tracking */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Macronutrients</Text>
        <BarChart
          data={{
            labels: macroData.labels,
            datasets: macroData.datasets.map((item, index) => ({
              ...item,
              color: item.color,
            })),
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>

      {/* Water Intake */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Water Intake (L)</Text>
        <LineChart
          data={waterData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(130, 202, 157, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a0dad',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    color: '#6a0dad',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default NutritionDashboard;
