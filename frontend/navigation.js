import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileSetupScreen from './screens/ProfileSetup';
import RecipeSwiperScreen from './screens/SwiperScreen';


import UserProfile from './screens/UserProfile';
import StatisticsDash from './screens/StatisticsDash';
const Stack = createStackNavigator();

export default function AppNavigator({ isLoggedIn }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Home" : "WelcomeScreen"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="RecipeSwiper" component={RecipeSwiperScreen} />
        <Stack.Screen name="UserProfile" component={UserProfile}/>
        <Stack.Screen name="Statistics" component={StatisticsDash}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
