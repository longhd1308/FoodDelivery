import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, deleteField, collection, onSnapshot, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Component hiển thị giỏ hàng trống
const EmptyCartView = () => (
  <View style={styles.emptyCartContainer}>
    <Ionicons name="alert" size={48} color="grey" style={styles.emptyIcon} />
    <Text style={styles.emptyCartText}>Chưa có đơn hàng nào</Text>
  </View>
);

// Component điều chỉnh số lượng
const QuantityControl = ({ quantity, onIncrease, onDecrease }) => (
  <View style={styles.quantityContainer}>
    <TouchableOpacity 
      style={styles.quantityButton} 
      onPress={onDecrease}
      disabled={quantity <= 1}
    >
      <Ionicons name="remove" size={20} color={quantity <= 1 ? '#ccc' : '#FF3F00'} />
    </TouchableOpacity>
    
    <Text style={styles.quantityText}>{quantity}</Text>
    
    <TouchableOpacity 
      style={styles.quantityButton} 
      onPress={onIncrease}
    >
      <Ionicons name="add" size={20} color="#FF3F00" />
    </TouchableOpacity>
  </View>
);

// Component hiển thị danh sách món ăn
const CartItemsList = ({ cartAlldata, foodDataAll, deleteButtonHandler, updateQuantityHandler }) => {
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {cartAlldata.map((item) => {
        const nData = foodDataAll.find((food) => food.id === item.item_id);
        if (!nData) return null;
        
        return (
          <View key={item.cartItemId} style={styles.containerCard}>
            <Image source={{uri: nData.FoodImageURL}} style={styles.cardimage}/>
            
            <View style={styles.containerCard_in}>
              <View style={styles.containerCard_in1}>
                <Text style={{color: '#888', fontSize: 12}}>FastFood Delivery</Text>
              </View>
              
              <View style={styles.containerCard_in2}>
                <Text style={styles.containerCard_in2_itemName}>{nData.FoodName}</Text>
                <Text style={styles.containerCard_in2_itemPrice}>{parseInt(nData.FoodPrize).toLocaleString()}Đ</Text>
                
                <View style={styles.quantityRow}>
                  <Text style={styles.quantityLabel}>Số lượng:</Text>
                  <QuantityControl 
                    quantity={item.FoodQuantity || 1}
                    onIncrease={() => updateQuantityHandler(item, (item.FoodQuantity || 1) + 1)}
                    onDecrease={() => updateQuantityHandler(item, (item.FoodQuantity || 1) - 1)}
                  />
                </View>
              </View>
        
              <View style={styles.containerCard_in3}>
                <TouchableOpacity 
                  style={styles.containerCard_in3_btn} 
                  onPress={() => deleteButtonHandler(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                  <Text style={styles.containerCard_in3_btn_txt}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

// Component hiển thị tổng tiền và nút thanh toán
const CheckoutFooter = ({ totalAmount, onPress }) => (
  <View style={styles.footerContainer}>
    <View style={styles.totalTextWrapper}>
      <Text style={styles.totalLabel}>Tổng tiền:</Text>
      <Text style={styles.totalAmount}>{totalAmount.toLocaleString()}Đ</Text>
    </View>
    <TouchableOpacity 
      style={styles.checkoutButton}
      onPress={onPress}
    >
      <Text style={styles.checkoutButtonText}>Thanh toán</Text>
    </TouchableOpacity>
  </View>
);

const qrCodeImage = require('./../Images/Mã QR chuyển khoản.jpg');

const PaymentSection = ({ 
  cartItems, 
  foodDataAll, 
  totalAmount, 
  onBack, 
  onCheckout 
}) => {
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('cash');
  const [showQR, setShowQR] = React.useState(false);

  // Thông tin ngân hàng
  const bankInfo = {
    name: "HAN DUC LONG",
    account: "109913082003",
    bank: "Ngân hàng VpBank",
    amount: totalAmount.toLocaleString() + "Đ"
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setShowQR(method === 'bank');
  };

  const handleSubmit = () => {
    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    onCheckout({
      deliveryAddress,
      phoneNumber,
      paymentMethod
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
        
        {cartItems.map((item, index) => {
          const foodItem = foodDataAll.find(food => food.id === item.item_id);
          if (!foodItem) return null;
          
          return (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemName}>{foodItem.FoodName}</Text>
              <Text style={styles.itemPrice}>{item.FoodQuantity} x {foodItem.FoodPrize}Đ</Text>
            </View>
          );
        })}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng:</Text>
          <Text style={styles.totalAmount}>{totalAmount.toLocaleString()}Đ</Text>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ giao hàng"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Phương thức thanh toán */}
        <Text style={styles.paymentTitle}>Phương thức thanh toán</Text>
        
        <View style={styles.paymentMethods}>
          <TouchableOpacity 
            style={[ 
              styles.paymentMethod, 
              paymentMethod === 'cash' && styles.selectedMethod
            ]}
            onPress={() => handlePaymentMethodChange('cash')}
          >
            <Ionicons 
              name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={paymentMethod === 'cash' ? '#FF3F00' : '#ccc'} 
            />
            <Text style={styles.methodText}>Tiền mặt khi nhận hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[ 
              styles.paymentMethod, 
              paymentMethod === 'bank' && styles.selectedMethod
            ]}
            onPress={() => handlePaymentMethodChange('bank')}
          >
            <Ionicons 
              name={paymentMethod === 'bank' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={paymentMethod === 'bank' ? '#FF3F00' : '#ccc'} 
            />
            <Text style={styles.methodText}>Chuyển khoản QR</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code và thông tin ngân hàng */}
        {showQR && (
          <View style={styles.qrSection}>
            <Image 
              source={qrCodeImage} 
              style={styles.qrImage}
              resizeMode="contain"
            />
            
            <View style={styles.bankInfo}>
              <Text style={styles.bankText}>{bankInfo.bank}</Text>
              <Text style={styles.bankText}>Số TK: {bankInfo.account}</Text>
              <Text style={styles.bankText}>Chủ TK: {bankInfo.name}</Text>
              <Text style={styles.bankText}>Số tiền: {bankInfo.amount}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>XÁC NHẬN ĐƠN HÀNG</Text>
      </TouchableOpacity>
    </View>
  );
};

// Component chính
const UserCartScreen = ({ navigation, route }) => {
  const [userloggeduid, setUserloggeduid] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserloggeduid(user.uid);
      } else {
        setUserloggeduid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userloggeduid) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3F00" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const cartRef = doc(db, 'users', userloggeduid);
  const [cartAlldata, setCartAlldata] = useState([]);
  const [foodDataAll, setFoodDataAll] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Foods'), (snapshot) => {
      const foodList = snapshot.docs.map(doc => doc.data());
      setFoodDataAll(foodList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const cartData = snapshot.data()?.cart || [];
      setCartAlldata(cartData);
    });

    return () => unsubscribe();
  }, [userloggeduid]);

  const deleteButtonHandler = async (item) => {
    const cartRef = doc(db, 'users', userloggeduid);
    await updateDoc(cartRef, {
      cart: arrayRemove(item)
    });
  };

  const updateQuantityHandler = async (item, quantity) => {
    if (quantity < 1) return;
    const cartRef = doc(db, 'users', userloggeduid);
    await updateDoc(cartRef, {
      cart: arrayRemove(item)
    });
    await updateDoc(cartRef, {
      cart: arrayUnion({ ...item, FoodQuantity: quantity })
    });
  };

  const totalAmount = cartAlldata.reduce((acc, item) => {
    const food = foodDataAll.find((food) => food.id === item.item_id);
    if (food) {
      acc += food.FoodPrize * (item.FoodQuantity || 1);
    }
    return acc;
  }, 0);

  return (
    <View style={styles.container}>
      {cartAlldata.length === 0 ? (
        <EmptyCartView />
      ) : (
        <>
          <CartItemsList 
            cartAlldata={cartAlldata} 
            foodDataAll={foodDataAll}
            deleteButtonHandler={deleteButtonHandler}
            updateQuantityHandler={updateQuantityHandler}
          />
          <CheckoutFooter 
            totalAmount={totalAmount} 
            onPress={() => navigation.navigate('Checkout', { cartItems: cartAlldata })}
          />
        </>
      )}
    </View>
  );
};

export default UserCartScreen;

const styles = StyleSheet.create({
    mainContainer:{
        flex: 1,
        width: '100%'
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
      paddingHorizontal: 10,
    },
  
    scrollView: {
      flex: 1,
      width: '100%',
    },
  
    scrollContent: {
      paddingBottom: 100, // Đảm bảo có đủ khoảng trống phía dưới
    },

    containerCardList: {
      marginBottom: 10, // Khoảng cách giữa các item
    },
  
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginVertical: 20,
      color: '#2c3e50',
      textAlign: 'center',
    },
  
    itemContainer: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 6, 
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  
    itemName: {
      fontSize: 16,
      color: '#34495e',
      marginBottom: 4,
      fontWeight: '500',
    },
  
    itemPrice: {
      fontSize: 15,
      color: '#7f8c8d',
      fontWeight: '600',
    },
  
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 6, 
      marginVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  
    totalLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2c3e50',
    },
  
    totalAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: '#e74c3c',
    },
  
    input: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 6,
      marginVertical: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#ecf0f1',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  
    inputLabel: {
      fontSize: 14,
      color: '#7f8c8d',
      marginBottom: 8,
      marginLeft: 4,
    },
  
    paymentTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginVertical: 12,
      color: '#2c3e50',
      marginHorizontal: 6
    },
  
    paymentMethods: {
      marginBottom: 20,
    },
  
    paymentMethod: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#fff',
      borderRadius: 12,
      marginHorizontal: 6, 
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#ecf0f1',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  
    selectedMethod: {
      borderColor: '#FF3F00',
      backgroundColor: '#FFF5F2',
      shadowColor: '#FF3F00',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
  
    methodText: {
      fontSize: 16,
      marginLeft: 12,
      color: '#2c3e50',
      fontWeight: '500',
    },
  
    qrSection: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      marginHorizontal: 6,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  
    qrImage: {
      width: 220,
      height: 220,
      marginBottom: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ecf0f1',
    },
  
    bankInfo: {
      width: '100%',
      marginBottom: 16,
      padding: 12,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
    },
  
    bankText: {
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 6,
      color: '#34495e',
    },
  
    submitButton: {
      backgroundColor: '#FF3F00',
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 6,
      marginVertical: 16,
      shadowColor: '#FF3F00',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
  
    submitButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 0.5,
    },  

    container: {
        flex: 1,
        backgroundColor: '#edeef0',
        width: '100%'
    },

    containerHead: {
        fontSize: 25,
        fontWeight: '600',
        marginVertical: 5,
        marginLeft: 5,
        paddingHorizontal: 10
    },

    containerCard: {
      flexDirection: 'row',
      backgroundColor: 'white',
      marginVertical: 8,
      borderRadius: 15,
      width: '95%',
      alignSelf: 'center',
      elevation: 2,
      padding: 8,
      minHeight: 120, // Đảm bảo chiều cao tối thiểu
    },

    cardimage: {
      width: 100,
      height: 100,
      borderRadius: 12,
      alignSelf: 'center',
    },

    containerCard_in: {
      flex: 1,
      flexDirection: 'column',
      marginLeft: 10,
      justifyContent: 'space-between',
    },

    containerCard_in1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    containerCard_in2: {
      flex: 1,
      justifyContent: 'center',
    },

    containerCard_in3: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 8,
    },

    containerCard_in2_itemName: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#333',
    },

    containerCard_in2_itemPrice: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FF3F00',
      marginBottom: 8,
    },

    containerCard_in3_btn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
    },

    containerCard_in3_btn_txt: {
      fontSize: 14,
      fontWeight: '500',
      color: '#e74c3c',
      marginLeft: 5,
    },

    cartout: {
      flex: 1,
      width: '100%',
    },
    
    emptyCartContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },

    emptyIcon: {
        marginBottom: 10,
    },

    emptyCartText: {
        fontSize: 24,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
    },

    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#eee',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    
    totalTextWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginRight: 5,
    },
    
    totalAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FF3F00',
    },
    
    checkoutButton: {
      backgroundColor: '#FF3F00',
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 25,
      elevation: 3,
    },
    
    checkoutButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },

    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
  
    quantityButton: {
      padding: 4,
    },
  
    quantityText: {
      fontSize: 14,
      fontWeight: 'bold',
      marginHorizontal: 8,
      color: '#333',
    },
  
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
  
    quantityLabel: {
      fontSize: 14,
      color: '#666',
    },

    footerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
});