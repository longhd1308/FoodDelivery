import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, TextInput, Alert, ScrollView, Platform, StatusBar } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { db } from '../Firebase/FirebaseConfig';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, deleteField, collection, onSnapshot, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

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
    <FlatList 
      data={cartAlldata}
      keyExtractor={(item) => item.cartItemId}
      renderItem={({ item }) => {
        const nData = foodDataAll.find((food) => food.id === item.item_id);
        if (!nData) return null;
        
        return (
          <View style={styles.containerCardList}>
            <View style={styles.containerCard}>
              <Image source={{uri: nData.FoodImageURL}} style={styles.cardimage}/>
              <View style={styles.containerCard_in}>
                <View style={styles.containerCard_in1}>
                  <Text>FastFood Delivery</Text>
                </View>
                
                <View style={styles.containerCard_in2}>
                  <Text style={styles.containerCard_in2_itemName}>{nData.FoodName}</Text>
                  <Text style={styles.containerCard_in2_itemPrice}>{nData.FoodPrize}Đ</Text>
                  
                  <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>Số lượng: </Text>
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
                    <Ionicons name="trash-bin" size={24} color="black" />
                    <Text style={styles.containerCard_in3_btn_txt}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>  
          </View>
        );
      }}
    />
  );
};

// Component hiển thị tổng tiền và nút thanh toán
const CheckoutFooter = ({ totalAmount, onPress }) => (
  <View style={styles.totalContainer}>
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
  const { userloggeduid } = useContext(AuthContext);

  const [cartdata, setCartdata] = useState(null);
  const [cartAlldata, setCartAlldata] = useState(null);
  const [foodDataAll, setFoodDataAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  const cardDataHandler = async () => {
    if (!userloggeduid) return;
    
    try {
      const cartRef = doc(db, 'UserCart', userloggeduid);
      const cartDoc = await getDoc(cartRef);
      
      if (cartDoc.exists()) {
        setCartdata(cartDoc.data());
        setCartAlldata(cartDoc.data().cartItems || []);
      } else {
        console.log("Không có dữ liệu giỏ hàng");
        setCartAlldata([]);
      }
    } catch(error) {
      console.error("Lỗi khi lấy giỏ hàng: ", error);
      setCartAlldata([]);
    } finally {
      setLoading(false);
    }
  };

  const FoodDataHandler = () => {
    const foodRef = collection(db, 'FoodData');
    
    const unsubscribe = onSnapshot(foodRef,
      (snapshot) => {
        const foods = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFoodDataAll(foods);
      },
      (error) => {
        console.error("Lỗi khi lấy FoodData: ", error);
      }
    );
    
    return unsubscribe;
  };
  
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = FoodDataHandler();
  
    const fetchData = async () => {
      try {
        await cardDataHandler();
      } catch (error) {
        if (isMounted) console.error("Error:", error);
      }
    };
  
    fetchData();
  
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userloggeduid]);

  const deleteButtonHandler = async (item) => {
    try {
      if (!userloggeduid || !item) return;
  
      const db = getFirestore();
      const docRef = doc(db, 'UserCart', userloggeduid);
  
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        console.log("Không tìm thấy giỏ hàng");
        return;
      }
  
      const cartData = docSnapshot.data();
      
      if (cartData.cartItems && cartData.cartItems.length === 1) {
        await updateDoc(docRef, {
          cartItems: deleteField()
        });
      } else {
        await updateDoc(docRef, {
          cartItems: arrayRemove(item)
        });
      }
  
      await cardDataHandler();
      
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      Alert.alert("Lỗi", "Không thể xóa sản phẩm. Vui lòng thử lại!");
    }
  };

  const updateQuantityHandler = async (item, newQuantity) => {
    try {
      if (!userloggeduid || !item || newQuantity < 1) return;

      const db = getFirestore();
      const cartRef = doc(db, 'UserCart', userloggeduid);
      
      // Lấy giỏ hàng hiện tại
      const cartDoc = await getDoc(cartRef);
      if (!cartDoc.exists()) return;

      const currentCart = cartDoc.data().cartItems || [];
      
      // Cập nhật số lượng cho item tương ứng
      const updatedCart = currentCart.map(cartItem => {
        if (cartItem.cartItemId === item.cartItemId) {
          return { ...cartItem, FoodQuantity: newQuantity };
        }
        return cartItem;
      });

      // Cập nhật lên Firestore
      await updateDoc(cartRef, {
        cartItems: updatedCart
      });

      // Cập nhật state local để hiển thị ngay lập tức
      setCartAlldata(updatedCart);
      
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    if (!cartAlldata || !foodDataAll.length) {
      setTotalAmount(0);
      return;
    }
    
    const total = cartAlldata.reduce((sum, item) => {
      const foodItem = foodDataAll.find(food => food.id === item.item_id);
      return sum + (foodItem ? parseInt(foodItem.FoodPrize) * (item.FoodQuantity || 1) : 0);
    }, 0);
    
    setTotalAmount(total);
  }, [cartAlldata, foodDataAll]);

  // Lắng nghe khi màn hình được focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cardDataHandler();
    });
    return unsubscribe;
  }, [navigation]);

  // Lắng nghe khi có param refresh
  useEffect(() => {
    if (route.params?.refresh) {
      cardDataHandler();
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  const handleCheckout = async (paymentInfo) => {
    try {
      const db = getFirestore();
      const orderRef = doc(db, 'UserOrder', `${userloggeduid}_${Date.now()}`);
      
      // 1. Lưu đơn hàng
      await setDoc(orderRef, {
        userId: userloggeduid,
        items: cartAlldata,
        totalAmount,
        deliveryAddress: paymentInfo.deliveryAddress,
        phoneNumber: paymentInfo.phoneNumber,
        paymentMethod: paymentInfo.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
  
      // 2. Xóa giỏ hàng
      const cartRef = doc(db, 'UserCart', userloggeduid); 
      await updateDoc(cartRef, {
        cartItems: deleteField()
      });
  
      // 3. Cập nhật state để hiển thị giỏ hàng trống
      setCartAlldata([]);
      setTotalAmount(0);
      setShowPayment(false);
  
      Alert.alert('Thành công', 'Đơn hàng đã được đặt thành công!');
      
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi đặt hàng');
    }
  };

  if (loading || cartAlldata === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3F00" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={{backgroundColor: '#FF3F00', paddingVertical: 15, paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,}}>
        <TouchableOpacity onPress={() => showPayment ? setShowPayment(false) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white"/>
        </TouchableOpacity>
      </View>
  
      <View style={styles.container}>
        {showPayment ? (
          <PaymentSection
            cartItems={cartAlldata}
            foodDataAll={foodDataAll}
            totalAmount={totalAmount}
            onBack={() => setShowPayment(false)}
            onCheckout={handleCheckout}
          />
        ) : (
          <>
            <Text style={styles.containerHead}>Giỏ hàng</Text>
            <View style={styles.cartout}>
              {!cartAlldata || cartAlldata.length === 0 ? (
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
                    onPress={() => setShowPayment(true)}
                  />
                </>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default UserCartScreen;

const styles = StyleSheet.create({
    mainContainer:{
        flex: 1,
        width: '100%',
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
    },
  
    scrollContent: {
      paddingBottom: 100,
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
        marginVertical: 5,
        borderRadius: 25,
        width: '95%',
        alignSelf: 'center',
        elevation: 2,
        alignItems: 'center'
    },

    cardimage: {
        width: 100,
        height: '100%',
        borderBottomLeftRadius: 25,
        borderTopLeftRadius: 25
    },

    containerCard_in: {
        flexDirection: 'column',
        margin: 5,
        width: '69%',
        alignItems: 'flex-end'
    },

    containerCard_in1: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        borderRadius: 10,
        paddingHorizontal: 3,
        paddingVertical: 2,
        borderBottomWidth: 1
    },

    containerCard_in2: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        borderRadius: 10,
        paddingHorizontal: 3,
        paddingVertical: 2
    },

    containerCard_in3: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: 100,
        borderRadius: 20,
        backgroundColor: '#edeef0',
        marginVertical: 5,
        padding: 5,
        elevation: 2,
        marginRight: 10
    },

    containerCard_in2_itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3
    },

    containerCard_in2_itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2
    },

    containerCard_in3_btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    containerCard_in3_btn_txt: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'black',
      marginLeft: 5, 
    },

    cartout: {
        flex: 1,
        width: '100%'
    },
    
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      width: 100,
    },
  
    quantityButton: {
      padding: 5,
    },
  
    quantityText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginHorizontal: 10,
    },
  
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
  
    quantityLabel: {
      fontSize: 14,
      marginRight: 10,
    },
}); 