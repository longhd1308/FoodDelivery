import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import React, { useContext, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth, db } from '../Firebase/FirebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../Context/AuthContext'

const SignupScreen = ({navigation}) => {
const { userloggeduidHandler } = useContext(AuthContext);

const [formData, setFormData] = useState({
  email: '',
  name: '',
  age: '',
  address: '',
  gender: 'Nam',
  password: '',
  cpassword: ''
});

const [errors, setErrors] = useState({
  email: '',
  name: '',
  age: '',
  address: '',
  password: '',
  cpassword: ''
});

const [isLoading, setIsLoading] = useState(false);
const [hidePassword, setHidePassword] = useState(true);
const [hideCPassword, setHideCPassword] = useState(true);

const handleChange = (name, value) => {
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  // Clear error when user types
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateForm = () => {
  const { email, name, age, address, password, cpassword } = formData;
  let isValid = true;
  const newErrors = {
    email: '',
    name: '',
    age: '',
    address: '',
    password: '',
    cpassword: ''
  };

  // Email validation
  if (!email) {
    newErrors.email = 'Vui lòng nhập email';
    isValid = false;
  } else if (!validateEmail(email)) {
    newErrors.email = 'Email không hợp lệ';
    isValid = false;
  }

  // Name validation
  if (!name) {
    newErrors.name = 'Vui lòng nhập họ tên';
    isValid = false;
  } else if (name.length < 2) {
    newErrors.name = 'Họ tên quá ngắn';
    isValid = false;
  }

  // Age validation
  const ageNumber = parseInt(age);
  if (!age) {
    newErrors.age = 'Vui lòng nhập tuổi';
    isValid = false;
  } else if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 120) {
    newErrors.age = 'Tuổi phải từ 1 đến 120';
    isValid = false;
  }

  // Address validation
  if (!address) {
    newErrors.address = 'Vui lòng nhập địa chỉ';
    isValid = false;
  }

  // Password validation
  if (!password) {
    newErrors.password = 'Vui lòng nhập mật khẩu';
    isValid = false;
  } else if (password.length < 6) {
    newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    isValid = false;
  }

  // Confirm password validation
  if (!cpassword) {
    newErrors.cpassword = 'Vui lòng nhập lại mật khẩu';
    isValid = false;
  } else if (password !== cpassword) {
    newErrors.cpassword = 'Mật khẩu không trùng khớp';
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};

const checkEmailExists = async (email) => {
  try {
    // Trong thực tế, bạn cần kiểm tra email trong Firestore hoặc Auth
    // Đây chỉ là ví dụ đơn giản
    return false;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

const createAccountHandler = async () => {
  if (!validateForm()) return;

  setIsLoading(true);

  try {
    // Kiểm tra email tồn tại (trong thực tế cần triển khai)
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      setErrors(prev => ({...prev, email: 'Email này đã được sử dụng'}));
      setIsLoading(false);
      return;
    }

    // Tạo tài khoản Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.email, 
      formData.password
    );
    
    const uid = userCredential.user.uid;
    userloggeduidHandler(uid);
    
    // Lưu thông tin vào Firestore
    await setDoc(doc(db, "UserProfiles", uid), {
      email: formData.email,
      name: formData.name,
      age: parseInt(formData.age),
      address: formData.address,
      gender: formData.gender,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role: 'user',
      status: 'active'
    });

    navigation.replace('Login', { 
      successMessage: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập' 
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    let errorMessage = "Đã xảy ra lỗi khi đăng ký";
    
    switch(error.code) {
      case 'auth/email-already-in-use':
        setErrors(prev => ({...prev, email: 'Email này đã được sử dụng'}));
        break;
      case 'auth/invalid-email':
        setErrors(prev => ({...prev, email: 'Email không hợp lệ'}));
        break;
      case 'auth/weak-password':
        setErrors(prev => ({...prev, password: 'Mật khẩu quá yếu'}));
        break;
      default:
        errorMessage = error.message;
        Alert.alert('Lỗi', errorMessage);
    }
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
      style={{ flex: 1}}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar backgroundColor={'#FF3F00'}/>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>Đăng Ký</Text>
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            placeholder='Email'
            placeholderTextColor="grey"
            keyboardType='email-address'
            style={[styles.input, errors.email && styles.errorInput]}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            placeholder='Họ và tên'
            style={[styles.input, errors.name && styles.errorInput]}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            autoCapitalize="words"
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            placeholder='Tuổi'
            style={[styles.input, errors.age && styles.errorInput]}
            value={formData.age}
            onChangeText={(text) => handleChange('age', text)}
            keyboardType='numeric'
            maxLength={3}
          />
          {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            placeholder='Địa chỉ'
            style={[styles.input, errors.address && styles.errorInput]}
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
          />
          {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Giới tính:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => handleChange('gender', value)}
              style={styles.picker}
            >
              <Picker.Item label="Nam" value="Nam" />
              <Picker.Item label="Nữ" value="Nữ" />
              <Picker.Item label="Khác" value="Khác" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={[styles.passwordInput, errors.password && styles.errorInput]}>
            <TextInput
              placeholder='Mật khẩu (ít nhất 6 ký tự)'
              placeholderTextColor="grey"
              style={styles.passwordTextInput}
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry={hidePassword}
            />
            <TouchableOpacity 
              onPress={() => setHidePassword(!hidePassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={hidePassword ? 'eye' : 'eye-off'} 
                size={20} 
                color="grey" 
              />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <View style={[styles.passwordInput, errors.cpassword && styles.errorInput]}>
            <TextInput
              placeholder='Nhập lại mật khẩu'
              placeholderTextColor="grey"
              style={styles.passwordTextInput}
              value={formData.cpassword}
              onChangeText={(text) => handleChange('cpassword', text)}
              secureTextEntry={hideCPassword}
            />
            <TouchableOpacity 
              onPress={() => setHideCPassword(!hideCPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={hideCPassword ? 'eye' : 'eye-off'} 
                size={20} 
                color="grey" 
              />
            </TouchableOpacity>
          </View>
          {errors.cpassword ? <Text style={styles.errorText}>{errors.cpassword}</Text> : null}
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={createAccountHandler}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>Đã có tài khoản? Đăng nhập ngay</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  </ImageBackground>
)
}

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
  flexGrow: 1,
  justifyContent: 'center',
  paddingHorizontal: 10,
},
header: {
  marginBottom: 30,
  alignItems: 'center'
},
headerText: {
  fontSize: 28,
  fontWeight: '700', 
  color: 'white',
  textShadowColor: 'rgba(0, 0, 0, 0.5)',
  textShadowOffset: {width: 1, height: 1},
  textShadowRadius: 3
},
inputGroup: {
  marginBottom: 10,
},
input: {
  backgroundColor: 'rgba(255,255,255,0.9)',
  padding: 15,
  borderRadius: 10,
  fontSize: 16,
  color: 'black'
},
passwordInput: {
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  paddingRight: 10,
},
passwordTextInput: {
  flex: 1,
  padding: 15,
  fontSize: 16,
  color: 'black'
},
eyeIcon: {
  padding: 5,
},
pickerContainer: {
  marginBottom: 15
},
label: {
  color: 'white',
  marginBottom: 8,
  fontSize: 16
},
pickerWrapper: {
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: 10,
  overflow: 'hidden'
},
picker: {
  height: 50,
},
button: {
  backgroundColor: '#FF3F00',
  borderRadius: 10,
  padding: 15,
  marginTop: 10,
  alignItems: 'center'
},
disabledButton: {
  backgroundColor: '#CCCCCC',
},
buttonText: {
  fontSize: 18,
  fontWeight: '600',
  color: 'white'
},
loginLink: {
  marginTop: 20,
  alignItems: 'center'
},
loginLinkText: {
  color: '#006400', 
  fontSize: 16,
  textDecorationLine: 'none'
},
errorInput: {
  borderWidth: 1,
  borderColor: 'red'
},
errorText: {
  color: 'red',
  fontSize: 12,
  marginTop: 5,
  marginLeft: 10
}
})

export default SignupScreen