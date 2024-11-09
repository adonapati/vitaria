import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Import the useNavigation hook

const NavbarFooter = () => {
  const navigation = useNavigation(); // Initialize the navigation hook
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = [
    { icon: 'home-outline', label: 'Home', screen: 'Home' },
    { icon: 'pie-chart-outline', label: 'Chart', screen: 'Statistics' },
    { icon: 'receipt-outline', label: 'Lock', screen: 'RecipeSwiper' },
    { icon: 'person-outline', label: 'Profile', screen: 'UserProfile' },
  ];

  // Function to handle item click and navigate to the corresponding screen
  const handleItemClick = (index, screen) => {
    setActiveIndex(index); // Update active index
    navigation.navigate(screen); // Navigate to the screen
  };

  return (
    <View style={styles.navbar}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => handleItemClick(index, item.screen)} // Pass screen name to navigate
        >
          <Ionicons
            name={item.icon}
            size={24}
            color={activeIndex === index ? '#00DFA2' : '#CAD5E2'}
            style={activeIndex === index ? styles.activeNavIcon : styles.navIcon}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = {
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
    color: '#00DFA2', // Active item color
  },
};

export default NavbarFooter;
