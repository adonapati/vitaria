import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const NavbarFooter = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Get current route information

  const navItems = [
    { icon: 'home-outline', activeIcon: 'home', label: 'Home', screen: 'Home' },
    { icon: 'pie-chart-outline', activeIcon: 'pie-chart', label: 'Chart', screen: 'Statistics' },
    // { icon: 'receipt-outline', activeIcon: 'receipt', label: 'Lock', screen: 'RecipeSwiper' },
    { icon: 'receipt-outline', activeIcon: 'receipt', label: 'Lock', screen: 'MealTime' },
    { icon: 'person-outline', activeIcon: 'person', label: 'Profile', screen: 'UserProfile' },
  ];

  const handleItemClick = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.navbar}>
      {navItems.map((item, index) => {
        const isActive = route.name === item.screen;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.navItem,
              isActive && styles.activeNavItem
            ]}
            onPress={() => handleItemClick(item.screen)}
          >
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={24}
              color={isActive ? '#00DFA2' : '#CAD5E2'}
              style={[
                styles.navIcon,
                isActive && styles.activeNavIcon
              ]}
            />
            {isActive && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        );
      })}
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
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  activeNavItem: {
    transform: [{scale: 1.1}],
  },
  navIcon: {
    fontSize: 24,
  },
  activeNavIcon: {
    color: '#00DFA2',
    // Add subtle glow effect
    //textShadowColor: '#00DFA2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00DFA2',
  }
};

export default NavbarFooter;