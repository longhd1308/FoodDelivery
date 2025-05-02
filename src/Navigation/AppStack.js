import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from '../MainScreens/HomeScreen';
import ProductScreen from '../MainScreens/ProductScreen';
import UserCartScreen from '../MainScreens/UserCartScreen';
import TrackOrderScreen from '../MainScreens/TrackOrderScreen';
import UserProfile from '../MainScreens/UserProfile';
import AccountAndSettings from '../MainScreens/AccountAndSettings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProductScreen" component={ProductScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Trang chủ') iconName = 'home';
          else if (route.name === 'Giỏ hàng') iconName = 'cart';
          else if (route.name === 'Tôi') iconName = 'person';
          else if (route.name === 'Tra cứu') iconName = 'map';
          else if (route.name === 'Cài đặt') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Giỏ hàng" component={UserCartScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Tôi" component={UserProfile} options={{ headerShown: false }} />
      <Tab.Screen name="Tra cứu" component={TrackOrderScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Cài đặt" component={AccountAndSettings} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default AppStack;

const styles = StyleSheet.create({
  tabBar: {
    height: 50,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: 'grey',
  },
});
