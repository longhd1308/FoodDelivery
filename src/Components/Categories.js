import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'

const Categories = ({ onCategoryPress }) => {
  const categories = [
    {
      id: 1,
      name: 'Pizza',
      image: require('../Images/pngtree-delicious-pizza-vector-png-image_12564992-removebg-preview.png'), 
      bgColor: '#ddfbf3'
    },
    {
      id: 2,
      name: 'Burger',
      image: require('../Images/pngtree-burger-flat-style-illustation-design-png-image_12615417-removebg-preview.png'), 
      bgColor: '#f5e5ff'
    },
    {
      id: 3,
      name: 'Drink',
      image: require('../Images/pngtree-a-cup-of-soda-vector-illustration-png-image_2391793-removebg-preview.png'),
      bgColor: '#e5f1ff'
    },
    {
      id: 4,
      name: 'Noodles',
      image: require('../Images/pngtree-delicious-noodles-in-a-blue-bowl-png-image_3928003-removebg-preview.png'),
      bgColor: '#ebfde5'
    }
  ]

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{paddingHorizontal: 5}}
      >
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.id}
            style={[styles.box, {backgroundColor: category.bgColor}]}
            onPress={() => onCategoryPress(category.name)}
          >
            <Image source={category.image} style={styles.image} />
            <Text style={styles.text}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

export default Categories

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
  },
  image: {
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },
  box: {
    flexDirection: 'row',
    marginHorizontal: 3,
    marginBottom: 15,
    padding: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  }
})