import { StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList, Image, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../Firebase/FirebaseConfig'; // Đảm bảo đã import auth từ Firebase
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import Headerbar from '../Components/Headerbar';
import Ionicons from '@expo/vector-icons/Ionicons';
import Categories from '../Components/Categories';
import OfferSlider from '../Components/OfferSlider';
import CardSlider from '../Components/CardSlider';
import { collection, onSnapshot, query, where, getDocs, getFirestore, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

const HomeScreen = ({ navigation }) => {
  const [userloggeduid, setUserloggeduid] = useState(null); // Thêm state cho userloggeduid
  const [foodData, setFoodData] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [locationName, setLocationName] = useState('Đang tải vị trí...');
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [loadingCategory, setLoadingCategory] = useState(false);

  // Theo dõi thay đổi trạng thái đăng nhập của người dùng
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserloggeduid(user.uid); // Cập nhật userloggeduid khi có người dùng đăng nhập
      } else {
        setUserloggeduid(null); // Nếu không có người dùng đăng nhập, đặt lại userloggeduid
      }
    });

    return () => unsubscribe(); // Đảm bảo hủy đăng ký khi component bị unmount
  }, []);

  // Lấy dữ liệu đồ ăn
  useEffect(() => {
    const foodCollectionRef = collection(db, 'FoodData');
    const unsubscribe = onSnapshot(foodCollectionRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setFoodData(data);
    });
    return () => unsubscribe();
  }, []);
  // Xử lý vị trí
  useEffect(() => {
    const handleLocation = async () => {
      try {
        setLocationLoading(true)
        
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setLocationError('Quyền truy cập vị trí bị từ chối')
          setLocationLoading(false)
          return
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 15000
        })

        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        })

        if (address.length > 0) {
          const { city, district, street, name } = address[0]
          const displayName = `${street || name || ''}${street && district ? ', ' : ''}${district || ''}${(street || district) && city ? ', ' : ''}${city || ''}`
          setLocationName(displayName || 'Không xác định được địa chỉ')
          setLocationError(null)
        }
      } catch (error) {
        console.error('Lỗi vị trí:', error)
        setLocationError('Không thể lấy vị trí hiện tại')
        setLocationName('Vị trí không khả dụng')
      } finally {
        setLocationLoading(false)
      }
    }

    handleLocation()
  }, [])

  // Hàm xử lý khi chọn danh mục
  const handleCategoryPress = async (categoryName) => {
    try {
      setLoadingCategory(true)
      setIsFiltering(true)
      setCurrentCategory(categoryName)
      setIsSearching(false)
      setSearchQuery('')
      
      const q = query(
        collection(db, 'FoodData'),
        where('FoodCategory', '==', categoryName)
      )
      
      const querySnapshot = await getDocs(q)
      const filteredData = []
      
      querySnapshot.forEach((doc) => {
        filteredData.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      setFilteredFoods(filteredData)
    } catch (error) {
      console.error('Lỗi khi lọc món ăn:', error)
      Alert.alert('Lỗi', 'Không thể lọc món ăn theo danh mục')
      setFilteredFoods([])
    } finally {
      setLoadingCategory(false)
    }
  }

  // Hàm quay lại danh sách đầy đủ
  const handleBackToAll = () => {
    setIsFiltering(false)
    setCurrentCategory(null)
    setFilteredFoods([])
  }

  // Filter món ăn theo search query
  const searchedFoodData = useMemo(() => {
    if (!searchQuery.trim()) return foodData
    
    const query = searchQuery.toLowerCase()
    return foodData.filter(item => 
      item.FoodName?.toLowerCase().includes(query) ||
      (item.FoodCategory && item.FoodCategory.toLowerCase().includes(query))
    )
  }, [foodData, searchQuery])

  // Nhóm món ăn theo category
  const groupFoodByCategory = (data) => {
    const grouped = {}
    data.forEach(item => {
      const category = item.FoodCategory || 'Khác'
      if (!grouped[category]) {
        grouped[category] = {
          items: [],
          count: 0
        }
      }
      grouped[category].items.push(item)
      grouped[category].count = grouped[category].items.length
    })
      return grouped
  }

  // Render từng món ăn
  const renderFoodItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.foodItem}
      onPress={() => navigation.navigate('ProductScreen', { 
        ...item,
        Id: item.id,
        FoodDescrip: item.FoodDescrip
      })}
    >
      <Image source={{ uri: item.FoodImageURL }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.FoodName}</Text>
        <Text style={styles.foodDescription} numberOfLines={2}>
          {item.FoodDescrip || 'Thơm ngon, hấp dẫn'}
        </Text>
        <View style={styles.priceAddContainer}>
          <Text style={styles.foodPrice}>{parseInt(item.FoodPrize || '0').toLocaleString()} đ</Text>
          {item.Instock && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation()
                addToCartHandler(item)
              }}
            >
              <Ionicons name="add" size={24} color="#FF3F00" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  // Render từng category section
  const renderCategorySection = ({ item }) => (
    <View key={`category-${item.category}`} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{item.category}</Text>
        <Text style={styles.categoryCount}>({item.count})</Text>
      </View>
      <FlatList
        data={item.items}
        renderItem={renderFoodItem}
        keyExtractor={(foodItem) => foodItem.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )

  // Render danh sách món ăn đã lọc
  const renderFilteredFoods = () => (
    <FlatList
      data={filteredFoods}
      renderItem={renderFoodItem}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={styles.filteredList}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={48} color="#888" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>Cửa hàng đang cập nhật {currentCategory}</Text>
        </View>
      }
    />
  )

  // Hàm thêm vào giỏ hàng
  const addToCartHandler = async (item) => {
    if (!userloggeduid) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm vào giỏ hàng')
      return
    }

    try {
      const db = getFirestore(app)
      const cartRef = doc(db, 'UserCart', userloggeduid)
      
      const newItem = {
        item_id: item.id,
        FoodQuantity: 1,
        userid: userloggeduid,
        cartItemId: `${Date.now()}_${userloggeduid}`,
        FoodName: item.FoodName,
        FoodImageURL: item.FoodImageURL || '',
        FoodPrize: typeof item.FoodPrize === 'string' ? parseInt(item.FoodPrize) : item.FoodPrize,
        createdAt: new Date().toISOString()
      }

      const cartDoc = await getDoc(cartRef)

      if (cartDoc.exists()) {
        const cartItems = cartDoc.data().cartItems || []
        const existingItemIndex = cartItems.findIndex(cartItem => cartItem.item_id === item.id)

        if (existingItemIndex !== -1) {
          const updatedItems = [...cartItems]
          updatedItems[existingItemIndex].FoodQuantity += 1
          await updateDoc(cartRef, { cartItems: updatedItems })
        } else {
          await updateDoc(cartRef, {
            cartItems: arrayUnion(newItem)
          })
        }
      } else {
        await setDoc(cartRef, {
          cartItems: [newItem],
          userId: userloggeduid,
          createdAt: new Date().toISOString()
        })
      }

      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng')
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error)
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng')
    }
  }

  // Chuyển đổi dữ liệu cho FlatList
  const categoryListData = useMemo(() => {
    const dataToGroup = searchQuery.trim() ? searchedFoodData : foodData
    return Object.entries(groupFoodByCategory(dataToGroup)).map(([category, groupData]) => ({
      category,
      items: groupData.items,
      count: groupData.count,
      key: `category-${category}`
    }))
  }, [foodData, searchedFoodData, searchQuery])

  // Hàm xử lý cập nhật địa chỉ thủ công
  const handleUpdateAddress = () => {
    if (manualAddress.trim()) {
      setLocationName(manualAddress)
      setShowAddressModal(false)
      setManualAddress('')
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng')
    }
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={'#FF3F00'}/>
      
      <Headerbar 
        locationName={locationName}
        loading={locationLoading}
        error={locationError}
        onLocationPress={() => setShowAddressModal(true)}
      />

      {/* Modal nhập địa chỉ thủ công */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddressModal}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập địa chỉ giao hàng</Text>
            
            <TextInput
              style={styles.addressInput}
              placeholder="Vui lòng nhập lại địa chỉ"
              value={manualAddress}
              onChangeText={setManualAddress}
              autoFocus={true}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateAddress}
              >
                <Text style={styles.buttonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="black" style={styles.searchicon}/>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn..."
            placeholderTextColor="#c4c4c4"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text)
              setIsSearching(text.length > 0)
              if (text.length > 0) {
                setIsFiltering(false)
                setCurrentCategory(null)
              }
            }}
          />
          {(searchQuery.length > 0 || isFiltering) && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('')
              setIsSearching(false)
              if (isFiltering) {
                handleBackToAll()
              }
            }}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          )}
        </View>
        
        {!isSearching && !isFiltering && (
          <>
            <Categories onCategoryPress={handleCategoryPress}/>
            <OfferSlider/>
            <CardSlider navigation={navigation} data={foodData}/>
          </>
        )}

        {isFiltering && (
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>{currentCategory}</Text>
            <TouchableOpacity onPress={handleBackToAll}>
              <Text style={styles.backButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
        )}

        {loadingCategory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3F00" />
          </View>
        ) : isFiltering ? (
          renderFilteredFoods()
        ) : (
          <FlatList
            data={categoryListData}
            renderItem={renderCategorySection}
            scrollEnabled={false}
            keyExtractor={(item) => item.key}
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  flatListContent: {
    paddingBottom: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '92%',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    elevation: 2
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  searchicon: {
    marginLeft: 5
  },
  categorySection: {
    marginTop: 20,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    elevation: 2,
    marginBottom: 20,
  },
  foodItem: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15
  },
  foodInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333'
  },
  foodDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    marginTop: 5
  },
  priceAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  foodPrice: {
    fontSize: 16,
    color: '#FF3F00',
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#FFEEE6',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 5
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#FF3F00',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    color: '#FF3F00',
    fontWeight: '600',
  },
  filteredList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  categoryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 0,
  },
})

export default HomeScreen