import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';

const Headerbar = ({ locationName, loading, error, onLocationPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.locationContainer} 
        activeOpacity={0.7}
        onPress={onLocationPress} // Thêm onPress handler
      >
        <Ionicons name="location-sharp" size={22} color="#FF3F00" />
        <View style={styles.locationTextContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#FF3F00" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <Text style={styles.locationTitle}>Giao hàng tới</Text>
              <Text 
                style={styles.locationAddress} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                {locationName || 'Đang cập nhật...'}
              </Text>
            </>
          )}
        </View>
        <Ionicons name="chevron-down" size={18} color="#FF3F00" />
      </TouchableOpacity>
    </View>
  )
}

export default Headerbar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 5,
  },
  locationTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3F00',
    fontWeight: '500',
  },
})