import React, { useEffect, useState } from 'react';
import AppNavigator from './navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Optionally return a loading screen here
  if (isLoggedIn === null) {
    return null; // or a loading indicator
  }

  return <AppNavigator isLoggedIn={isLoggedIn} />;
}
