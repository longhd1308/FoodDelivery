import { StyleSheet, Text, TouchableOpacity, View, Alert, Platform, StatusBar, SafeAreaView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../Context/AuthContext'

const AccountAndSettings = () => {
  const navigation = useNavigation()
  const { signOut } = React.useContext(AuthContext)

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        { 
          text: "Đăng xuất", 
          onPress: async () => {
            const success = await signOut()
            if (success) {
              navigation.replace('Login')
            }
          },
          style: "destructive"
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={{backgroundColor: '#FF3F00', paddingVertical: 15, paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,}}>
        <Text style={styles.headerText}>Cài đặt</Text>
      </View>

      <View style={styles.content}>
        {/* Có thể thêm các mục cài đặt khác ở đây */}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3F00" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AccountAndSettings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#FF3F00',
    paddingVertical: 15,
    paddingHorizontal: 15
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold', 
    textAlign: 'center'
  },
  content: {
    flex: 1,
    padding: 15
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3F00',
    backgroundColor: '#fff'
  },
  logoutText: {
    marginLeft: 10,
    color: '#FF3F00',
    fontSize: 16,
    fontWeight: '600'
  }
})