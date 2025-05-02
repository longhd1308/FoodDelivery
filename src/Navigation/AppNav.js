import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AppStack from './AppStack';
import AuthStack from './AuthStack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Firebase/FirebaseConfig';

const AppNav = () => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });

    return () => unsubscribe(); // dọn dẹp listener khi unmount
  }, []);

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
};

export default AppNav;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
