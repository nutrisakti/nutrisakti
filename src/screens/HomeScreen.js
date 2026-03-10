import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

const HomeScreen = ({ navigation }) => {
  const user = useSelector(state => state.user);
  const isOffline = useSelector(state => state.network.isOffline);

  const features = [
    { title: 'Food Scanner', screen: 'VisualNutrition', icon: '📸', color: '#4CAF50' },
    { title: 'Health Book', screen: 'HealthBook', icon: '📖', color: '#2196F3' },
    { title: 'Marketplace', screen: 'Marketplace', icon: '🛒', color: '#FF9800' },
    { title: 'Food Audit', screen: 'FoodAudit', icon: '🔍', color: '#E91E63' },
    { title: 'My Profile', screen: 'Profile', icon: '👤', color: '#9C27B0' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to NutriSakti</Text>
        <Text style={styles.subtitle}>Your Maternal Health Guardian</Text>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>📡 Offline Mode</Text>
          </View>
        )}
      </View>

      <View style={styles.grid}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: feature.color }]}
            onPress={() => navigation.navigate(feature.screen)}
          >
            <Text style={styles.icon}>{feature.icon}</Text>
            <Text style={styles.cardTitle}>{feature.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {user.isRegistered && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Impact</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Rewards:</Text>
            <Text style={styles.statValue}>${user.totalDisbursed} USDC</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Priority Level:</Text>
            <Text style={styles.statValue}>
              {user.priorityLevel === 0 ? 'Normal' : user.priorityLevel === 1 ? 'High' : 'Emergency'}
            </Text>
          </View>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  offlineBanner: {
    backgroundColor: '#FFC107',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  offlineText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    fontSize: 50,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    margin: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default HomeScreen;
