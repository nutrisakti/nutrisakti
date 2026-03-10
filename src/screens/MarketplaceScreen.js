import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import web3Service from '../services/web3Service';

const MarketplaceScreen = () => {
  const [loading, setLoading] = useState(false);
  const user = useSelector(state => state.user);

  const kits = [
    { id: 1, name: 'Basic Maternal Kit', price: 25, items: ['Thermometer', 'Vitamins', 'Hygiene supplies'] },
    { id: 2, name: 'Advanced Baby Kit', price: 45, items: ['Baby thermometer', 'First aid', 'Nutrition supplements'] },
    { id: 3, name: 'Emergency Kit', price: 60, items: ['Medical supplies', 'Emergency medications', 'Sterilization tools'] },
  ];

  const requestKit = async (kit) => {
    if (!user.isRegistered) {
      Alert.alert('Registration Required', 'Please register first to request kits');
      return;
    }

    setLoading(true);
    try {
      const result = await web3Service.requestKit(kit.name, kit.price);
      if (result.success) {
        Alert.alert(
          'Request Submitted',
          `Your ${kit.name} request has been submitted. Request ID: ${result.requestId}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Maternal-Baby Kit Marketplace</Text>
        <Text style={styles.subtitle}>Request essential medical supplies</Text>
      </View>

      {kits.map((kit) => (
        <View key={kit.id} style={styles.kitCard}>
          <Text style={styles.kitName}>{kit.name}</Text>
          <Text style={styles.kitPrice}>${kit.price} USDC</Text>
          <View style={styles.itemsList}>
            {kit.items.map((item, index) => (
              <Text key={index} style={styles.item}>• {item}</Text>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.requestButton, loading && styles.disabledButton]}
            onPress={() => requestKit(kit)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'Request Kit'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  kitCard: {
    margin: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  kitName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  kitPrice: {
    fontSize: 18,
    color: '#FF9800',
    marginTop: 5,
    fontWeight: 'bold',
  },
  itemsList: {
    marginTop: 15,
    marginBottom: 15,
  },
  item: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  requestButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MarketplaceScreen;
