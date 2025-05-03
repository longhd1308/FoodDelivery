import { 
  ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, 
  View, Image, TextInput, Alert, Keyboard, SafeAreaView , Platform
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { app } from '../Firebase/FirebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthContext } from '../Context/AuthContext';

const ProductScreen = ({ route, navigation }) => {
  const { userloggeduid } = useContext(AuthContext);
  const [quantity, setQuantity] = useState('1');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!route.params) {
      navigation.navigate('HomeScreen');
      return;
    }
    
    // Chuẩn hóa dữ liệu nhận được
    const productData = {
      ...route.params,
      Id: route.params.Id || route.params.id,
      FoodDescript: route.params.FoodDescript || route.params.FoodDescrip
    };
    
    setData(productData);
    setLoading(false);
  }, [route.params]);

  const handleQuantityChange = (text) => {
    if (/^\d*$/.test(text)) {
      setQuantity(text || '1');
    }
  };

  const adjustQuantity = (amount) => {
    const newQty = parseInt(quantity) + amount;
    if (newQty >= 1) {
      setQuantity(newQty.toString());
    }
  };

  const addToCartHandler = async () => {
    if (!userloggeduid) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    if (!data) {
      Alert.alert('Lỗi', 'Không có thông tin sản phẩm');
      return;
    }

    Keyboard.dismiss();

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Lỗi', 'Số lượng không hợp lệ');
      return;
    }

    try {
      const db = getFirestore(app);
      const cartRef = doc(db, 'UserCart', userloggeduid);
      
      // Validate required fields
      if ((!data.Id && !data.id) || !data.FoodName || data.FoodPrize === undefined) {
        console.error('Thiếu trường bắt buộc:', {
          Id: data.Id,
          id: data.id,
          FoodName: data.FoodName,
          FoodPrize: data.FoodPrize
        });
        throw new Error('Thiếu thông tin sản phẩm bắt buộc');
      }
  
      const newItem = {
        item_id: data.Id || data.id, // Sử dụng cả 2 trường
        FoodQuantity: qty,
        userid: userloggeduid,
        cartItemId: `${Date.now()}_${userloggeduid}`,
        FoodName: data.FoodName,
        FoodImageURL: data.FoodImageURL || '',
        FoodPrize: typeof data.FoodPrize === 'string' ? parseInt(data.FoodPrize) : data.FoodPrize,
        createdAt: new Date().toISOString()
      };

      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists()) {
        const cartItems = cartDoc.data().cartItems || [];
        const existingItemIndex = cartItems.findIndex(item => item.item_id === data.id);

        if (existingItemIndex !== -1) {
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].FoodQuantity += qty;
          await updateDoc(cartRef, { cartItems: updatedItems });
        } else {
          await updateDoc(cartRef, {
            cartItems: arrayUnion(newItem)
          });
        }
      } else {
        await setDoc(cartRef, {
          cartItems: [newItem],
          userId: userloggeduid,
          createdAt: new Date().toISOString()
        });
      }

      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
      setQuantity('1');

      navigation.navigate('Giỏ hàng', { refresh: true });

    } catch (error) {
      console.error('Chi tiết lỗi:', {
        error,
        productData: data,
        quantity
      });
      Alert.alert('Lỗi', error.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FF3F00', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar 
        backgroundColor={'#FF3F00'} 
        barStyle="light-content"
        translucent={false}
      />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white"/>
          </TouchableOpacity>
        </View>

        <View style={styles.productContainer}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: data.FoodImageURL }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.productName} numberOfLines={2}>{data.FoodName}</Text>
              <Text style={styles.productPrice}>{data.FoodPrize}Đ</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.description}>{data.FoodDescrip || 'Không có mô tả'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cửa hàng</Text>
              <Text style={styles.storeName}>FastFood Delivery</Text>
            </View>

            <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={[styles.quantityButton, parseInt(quantity) <= 1 && styles.disabledButton]}
                  onPress={() => adjustQuantity(-1)}
                  disabled={parseInt(quantity) <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={handleQuantityChange}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={() => adjustQuantity(1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.addToCartButton} 
            onPress={addToCartHandler}
          >
            <Text style={styles.addToCartButtonText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FF3F00',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  productContainer: {
    flex: 1,
    backgroundColor: '#ebebeb',
  },
  imageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: '#ebebeb',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#ebebeb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productName: {
    fontSize: 22,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FF3F00',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '100%', // Đảm bảo độ rộng đầy đủ
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  storeName: {
    fontSize: 16,
    color: '#666',
  },
  quantityContainer: {
    marginBottom: 15,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    height: 40
  },
  quantityButton: {
    backgroundColor: '#FF3F00',
    width: 35,
    height: 40,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  quantityInput: {
    width: 60,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 15,
    paddingVertical: 8,
    textAlignVertical: 'center',
    includeFontPadding: false
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartButton: {
    backgroundColor: '#FF3F00',
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    alignSelf: 'center', 
    marginTop: -10, 
    paddingHorizontal: 85,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
});

export default ProductScreen;