import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import Swiper from 'react-native-swiper'

const { width: screenWidth } = Dimensions.get('window')

const CardSlider = ({ navigation, data }) => {
  const limitedData = data.slice(0, 3)

  const openProductHandler = (item) => {
    navigation.navigate('ProductScreen', item)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.cardouthead}>
        Ưu đãi đặc biệt
      </Text>

      <View style={styles.swiperContainer}>
        <Swiper
          autoplay={true}
          autoplayTimeout={3}
          showsButtons={false}
          showsPagination={false}   
          removeClippedSubviews={false}
          loop={false}
          style={styles.swiper}
        >
          {limitedData.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.slideContainer}
              onPress={() => openProductHandler(item)}
              activeOpacity={0.9}
            >
              <View style={styles.card}>
                <Image source={{ uri: item.FoodImageURL }} style={styles.cardimage} />
                <View style={styles.infoContainer}>
                  <Text style={styles.foodName} numberOfLines={1}>{item.FoodName}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>
                      Giá: 
                      <Text style={styles.originalPrice}>70.000Đ</Text>
                      <Text style={styles.discountedPrice}> {parseInt(item.FoodPrize || '0').toLocaleString()}Đ</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Swiper>
      </View>
    </View>
  )
}

export default CardSlider

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    height: 250,
  },
  swiperContainer: {
    flex: 1,
    marginTop: 10,
  },
  swiper: {
    height: '100%',
  },
  cardouthead: {
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 10,
    paddingLeft: 5,
    color: '#424242'
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  card: {
    width: screenWidth * 0.85,
    height: 200,
    borderRadius: 17,
    backgroundColor: '#dedede',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardimage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  infoContainer: {
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginLeft: 5,
  },
  discountedPrice: {
    color: '#FF3F00',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 15,
  },
})