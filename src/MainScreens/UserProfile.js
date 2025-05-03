import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity,
  View, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar, 
  SafeAreaView
} from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth } from '../Firebase/FirebaseConfig';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../Context/AuthContext';
import { Picker } from '@react-native-picker/picker';

const UserProfile = () => {
  const { data1 } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    age: '',
    gender: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      const db = getFirestore();
      const userDocRef = doc(db, 'UserProfiles', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userDataFromFirestore = docSnap.data();
        setUserData({
          name: userDataFromFirestore.name || '',
          address: userDataFromFirestore.address || '',
          phone: userDataFromFirestore.phone || '',
          email: user.email || '',
          age: userDataFromFirestore.age?.toString() || '',
          gender: userDataFromFirestore.gender || 'Nam'
        });
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy thông tin hồ sơ');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!userData.name || !userData.phone || !userData.address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (userData.phone.length < 10 || !/^\d+$/.test(userData.phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }

    const ageNumber = parseInt(userData.age);
    if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 120) {
      Alert.alert('Lỗi', 'Vui lòng nhập tuổi hợp lệ (1-120)');
      return;
    }

    setIsUpdating(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Lỗi', 'Không tìm thấy người dùng');
        return;
      }

      const db = getFirestore();
      const userDocRef = doc(db, 'UserProfiles', user.uid);

      await updateDoc(userDocRef, {
        name: userData.name,
        address: userData.address,
        phone: userData.phone,
        age: ageNumber,
        gender: userData.gender,
        updatedAt: new Date()
      });

      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3F00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FF3F00', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, }} edges={['top']}>  
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Hồ Sơ Cá Nhân</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={24} color="#FF3F00" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              value={userData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              editable={isEditing}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={24} color="#FF3F00" style={styles.icon} />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Email"
              value={userData.email}
              editable={false}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={24} color="#FF3F00" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={userData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              editable={isEditing}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location" size={24} color="#FF3F00" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ"
              value={userData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              editable={isEditing}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="calendar" size={24} color="#FF3F00" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Tuổi"
              value={userData.age}
              onChangeText={(text) => handleInputChange('age', text)}
              editable={isEditing}
              keyboardType="numeric"
              maxLength={3}
              placeholderTextColor="#888"
            />
          </View>

          {isEditing && (
            <View style={styles.inputContainer}>
              <Ionicons name="transgender" size={24} color="#FF3F00" style={styles.icon} />
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={userData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  style={styles.picker}
                  enabled={isEditing}
                >
                  <Picker.Item label="Nam" value="Nam" />
                  <Picker.Item label="Nữ" value="Nữ" />
                  <Picker.Item label="Khác" value="Khác" />
                </Picker>
              </View>
            </View>
          )}
        </View>

        {isEditing ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleUpdateProfile}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleEditToggle}
              disabled={isUpdating}
            >
              <Text style={[styles.buttonText, {color: '#FF3F00'}]}>Hủy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.editButton]} 
            onPress={handleEditToggle}
          >
            <Text style={styles.buttonText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FF3F00',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  disabledInput: {
    color: '#888',
  },
  pickerContainer: {
    flex: 1,
    marginLeft: 4,
  },
  picker: {
    height: 40,
  },
  buttonGroup: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#FF3F00',
    marginHorizontal: 16,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#FF3F00',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3F00',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfile;