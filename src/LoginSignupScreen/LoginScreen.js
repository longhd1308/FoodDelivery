import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase/FirebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  // Lắng nghe sự thay đổi trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // Nếu người dùng đã đăng nhập, điều hướng tới màn hình chính
        console.log('Người dùng đã đăng nhập:', user);
        navigation.replace('Home'); // Thay 'Home' bằng màn hình bạn muốn điều hướng tới
      }
    });

    return () => unsubscribe(); // Hủy đăng ký khi component unmount
  }, [navigation]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const togglePasswordVisibility = () => {
    setHidePassword(!hidePassword);
  };

  const LoginHandler = async () => {
    setLoginError('');

    if (!email || !password) {
      setLoginError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    if (!validateEmail(email)) {
      setLoginError('Email không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Đăng nhập thành công');
      // ⚠️ Không cần navigate vì onAuthStateChanged sẽ tự động điều hướng
    } catch (error) {
      console.log('Lỗi đăng nhập:', error.message);
      setLoginError('Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../Images/hinh-nen-do-an-anime-cho-dien-thoai-4-inkythuatso-10-11-30-13.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <StatusBar backgroundColor={'#FF3F00'} />

          <View style={styles.header}>
            <Text style={styles.headerText}>Đăng Nhập</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person" size={24} color="grey" style={styles.icon} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="grey"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setLoginError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="grey" style={styles.icon} />
            <TextInput
              placeholder="Mật khẩu"
              placeholderTextColor="grey"
              style={styles.input}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLoginError('');
              }}
              secureTextEntry={hidePassword}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <Ionicons name={hidePassword ? 'eye' : 'eye-off'} size={24} color="grey" />
            </TouchableOpacity>
          </View>

          {loginError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={LoginHandler}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signupLinkText}>Chưa có tài khoản? Đăng ký ngay</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: 'black',
  },
  eyeIcon: {
    padding: 10,
    marginLeft: 5,
  },
  errorContainer: {
    marginTop: -10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF3F00',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupLinkText: {
    color: '#006400',
    fontSize: 16,
    textDecorationLine: 'none',
  },
});
