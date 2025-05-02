import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../LoginSignupScreen/LoginScreen';
import SignupScreen from '../LoginSignupScreen/SignupScreen';
import HomeScreen from '../MainScreens/HomeScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AuthStack;

const styles = StyleSheet.create({});
