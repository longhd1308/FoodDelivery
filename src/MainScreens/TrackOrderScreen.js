import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, Platform, StatusBar, SafeAreaView } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from './../Firebase/FirebaseConfig'
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../Context/AuthContext'; // Import AuthContext

const TrackOrderScreen = ({ navigation }) => {
  const { userloggeduid } = useContext(AuthContext); // Lấy UID từ AuthContext
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm rút gọn mã đơn hàng
  const shortenOrderId = (id) => {
    if (!id) return '';
    const parts = id.split('_');
    return parts.length > 1 ? `${parts[1].substring(0, 8)}...` : id.substring(0, 8);
  };

  // Hàm chuyển đổi timestamp thành chuỗi ngày giờ
  const formatDate = (dateString) => {
    if (!dateString) return 'Đang cập nhật';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN') + ' ' + date.toLocaleDateString('vi-VN');
  };

  // Tính tổng tiền của đơn hàng
  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      return total + (item.FoodPrize || 0) * (item.FoodQuantity || 1);
    }, 0);
  };

  // Lấy danh sách đơn hàng của user
  useEffect(() => {
    if (!userloggeduid) return; // Nếu chưa có UID, không gọi Firebase

    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'UserOrder'),
          where('userId', '==', userloggeduid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!isMounted) return;

          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            items: doc.data().items || [],
            createdAt: doc.data().createdAt || new Date().toISOString()
          }));

          setOrders(ordersData);
          setLoading(false);
        }, (error) => {
          if (!isMounted) return;
          console.error("Lỗi Firestore:", error);
          setLoading(false);
        });
      } catch (error) {
        if (!isMounted) return;
        console.error("Lỗi khi lấy đơn hàng:", error);
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [userloggeduid]); // Gọi lại useEffect khi userloggeduid thay đổi

  const deleteOrder = async (orderId) => {
    try {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn xóa đơn hàng này?',
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Xóa',
            onPress: async () => {
              await deleteDoc(doc(db, 'UserOrder', orderId));
              // Cập nhật state sau khi xóa
              setOrders(prev => prev.filter(order => order.id !== orderId));
              Alert.alert('Thành công', 'Đã xóa đơn hàng');
            },
            style: 'destructive'
          }
        ]
      );
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
      Alert.alert('Lỗi', 'Không thể xóa đơn hàng');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3F00" />
        <Text>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{backgroundColor: '#FF3F00', paddingVertical: 15, paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,}}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-outline" size={60} color="grey" style={styles.emptyIcon}/>
            <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderContainer}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Mã đơn hàng: {shortenOrderId(order.id)}</Text>
        
                <TouchableOpacity 
                  onPress={() => deleteOrder(order.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3F00" />
                </TouchableOpacity>
              </View>
              

              <Text style={styles.orderTime}>
                Ngày đặt: {formatDate(order.createdAt)}
              </Text>
              
              {/* Danh sách tất cả sản phẩm trong đơn hàng */}
              <View style={styles.itemsContainer}>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Image 
                      source={{ uri: item.FoodImageURL }} 
                      style={styles.itemImage}
                      defaultSource={require('../Images/placeholder.png')}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.FoodName || 'Sản phẩm'}</Text>
                      <Text style={styles.itemPrice}>
                        {item.FoodPrize?.toLocaleString('vi-VN')}đ x {item.FoodQuantity || 1}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.orderFooter}>
                <Text style={styles.deliveryInfo}>
                  Địa chỉ: {order.deliveryAddress || 'Chưa cập nhật'}
                </Text>
                <Text style={styles.deliveryInfo}>
                  Phương thức thanh toán: {order.paymentMethod || 'Tiền mặt'}
                </Text>
                <Text style={styles.orderTotal}>
                  Tổng cộng: {order.totalAmount 
                    ? order.totalAmount.toLocaleString('vi-VN') 
                    : calculateTotal(order.items).toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF3F00',
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute', 
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 0,
    marginTop: 42
  },
  emptySpace: {
    width: 40,
  },
  scrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: '50%'
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: 'grey',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orderContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center'
  },
  orderId: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  orderStatus: {
    fontSize: 14,
    color: '#FF3F00',
    fontWeight: 'bold',
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  itemsContainer: {
    marginVertical: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  orderFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  deliveryInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3F00',
    textAlign: 'right',
    marginTop: 5,
  },

  backButton: {
    padding: 8,
    marginRight: 10,
    zIndex: 1
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10
  }
});

export default TrackOrderScreen;
