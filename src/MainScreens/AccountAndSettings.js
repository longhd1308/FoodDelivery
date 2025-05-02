import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { getAuth, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'

const AccountAndSettings = () => {
  const navigation = useNavigation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    // Clean up the subscription when the component is unmounted
    return () => unsubscribe()
  }, [])

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
            try {
              await firebaseSignOut(getAuth())
              navigation.replace('Login') // Điều hướng về màn hình login sau khi đăng xuất
            } catch (error) {
              console.error("Đăng xuất thất bại:", error)
            }
          },
          style: "destructive"
        }
      ]
    )
  }

  if (!user) {
    // Nếu không có user đăng nhập, bạn có thể điều hướng về trang login ngay lập tức
    navigation.replace('Login')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
    fontWeight: 'bold'
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