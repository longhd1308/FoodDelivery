import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/Firebase/FirebaseConfig';
import AppStack from './src/Navigation/AppStack';
import AuthStack from './src/Navigation/AuthStack';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });

    // Clean up listener khi component bị unmount
    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
