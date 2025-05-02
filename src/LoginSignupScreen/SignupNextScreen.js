import { 
    StatusBar, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
  } from 'react-native'
  import React, { useState } from 'react'
  import { db } from '../Firebase/FirebaseConfig'
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
  import { Picker } from '@react-native-picker/picker'
  
  const SignupNextScreen = ({ navigation, route }) => {
      const { uid, email } = route.params;
      const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        age: '',
        gender: 'Nam'
      });
      const [isLoading, setIsLoading] = useState(false);
  
      const handleChange = (name, value) => {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };
  
      const completeSignupHandler = async () => {
        const { name, phone, address, age } = formData;
        
        if (!name || !phone || !address || !age) {
          Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
          return;
        }
  
        const ageNumber = parseInt(age);
        if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 120) {
          Alert.alert('Lỗi', 'Vui lòng nhập tuổi hợp lệ (1-120)');
          return;
        }
  
        if (phone.length < 10 || !/^\d+$/.test(phone)) {
          Alert.alert('Lỗi', 'Số điện thoại phải có 10 chữ số');
          return;
        }
  
        setIsLoading(true);
  
        try {
          await setDoc(doc(db, "UserProfiles", uid), {
            ...formData,
            age: ageNumber,
            email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            role: 'user',
            status: 'active'
          });
  
          Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
            { text: 'OK', onPress: () => navigation.replace('Login') }
          ]);
  
        } catch (error) {
          console.error('Lỗi Firestore:', error);
          Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
        } finally {
          setIsLoading(false);
        }
      };
  
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <StatusBar backgroundColor={'#FF3F00'}/>
            
            <View style={styles.header}>
              <Text style={styles.headerText}>Thông tin cá nhân</Text>
              <Text style={styles.subHeader}>Hoàn thiện hồ sơ của bạn</Text>
            </View>
  
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Email: {email}</Text>
            </View>
  
            <TextInput
              placeholder='Họ và tên'
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              autoCapitalize="words"
            />
  
            <TextInput
              placeholder='Số điện thoại'
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              keyboardType='phone-pad'
              maxLength={10}
            />
  
            <TextInput
              placeholder='Địa chỉ'
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => handleChange('address', text)}
            />
  
            <TextInput
              placeholder='Tuổi'
              style={styles.input}
              value={formData.age}
              onChangeText={(text) => handleChange('age', text)}
              keyboardType='numeric'
              maxLength={3}
            />
  
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
  
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.disabledButton]} 
              onPress={completeSignupHandler}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      );
  };
  
  const styles = StyleSheet.create({
      container: {
          flex: 1,
          backgroundColor: '#fff'
      },
      scrollContainer: {
          padding: 20,
          paddingBottom: 40
      },
      header: {
          marginBottom: 20,
          alignItems: 'center'
      },
      headerText: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#FF3F00'
      },
      subHeader: {
          fontSize: 16,
          color: '#666',
          marginTop: 5
      },
      infoBox: {
          backgroundColor: '#f8f8f8',
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#eee'
      },
      infoText: {
          fontSize: 16,
          color: '#333'
      },
      input: {
          height: 50,
          borderColor: '#ddd',
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 15,
          marginBottom: 15,
          fontSize: 16,
          backgroundColor: '#fff'
      },
      pickerContainer: {
          marginBottom: 20
      },
      label: {
          fontSize: 16,
          marginBottom: 8,
          color: '#333'
      },
      pickerWrapper: {
          borderColor: '#ddd',
          borderWidth: 1,
          borderRadius: 10,
          overflow: 'hidden'
      },
      picker: {
          height: 50,
          backgroundColor: '#fff'
      },
      button: {
          backgroundColor: '#FF3F00',
          height: 50,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10
      },
      disabledButton: {
          backgroundColor: '#ccc'
      },
      buttonText: {
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold'
      }
  });
  
  export default SignupNextScreen;