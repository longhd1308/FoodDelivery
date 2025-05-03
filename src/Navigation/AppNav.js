import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import AppStack from './AppStack';
import AuthStack from './AuthStack';
import { AuthContext } from '../Context/AuthContext';

const AppNav = () => {
  const { userloggeduid, checkIsLogged } = useContext(AuthContext);

  useEffect(() => {
    checkIsLogged();
  }, []);

  return (
    <>
      {userloggeduid ? 
        <AppStack /> 
        : 
        <AuthStack />
      }
    </>
  );
};

export default AppNav;