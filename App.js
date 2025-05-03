import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AppNav from './src/Navigation/AppNav';
import { AuthProvider } from './src/Context/AuthContext';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <AuthProvider>
        <AppNav/>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});