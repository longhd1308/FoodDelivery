import React, { useState, createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../Firebase/FirebaseConfig";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userloggeduid, setUserloggeduid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const userloggeduidHandler = (userid) => {
    setUserloggeduid(userid);
    AsyncStorage.setItem('userloggeduid', userid);
  };

  const checkIsLogged = async () => {
    try {
      setIsLoading(true);
      const value = await AsyncStorage.getItem('userloggeduid');
      if (value !== null) {
        setUserloggeduid(value);
      }
    } catch (error) {
      console.error('Lỗi nhận diện:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await auth.signOut();
      await AsyncStorage.removeItem('userloggeduid');
      setUserloggeduid(null);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userloggeduid, userloggeduidHandler, checkIsLogged, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
