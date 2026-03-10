import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

const HealthBookScreen = () => {
  const health = useSelector(state => state.health);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Milestones</Text>
        {health.milestones.length === 0 ? (
          <Text style={styles.emptyText}>No milestones recorded yet</Text>
        ) : (
          health.milestones.map((milestone, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{milestone.name}</Text>
              <Text style={styles.cardDate}>{new Date(milestone.date).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💉 Vaccinations</Text>
        {health.vaccinations.length === 0 ? (
          <Text style={styles.emptyText}>No vaccinations recorded yet</Text>
        ) : (
          health.vaccinations.map((vax, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{vax.name}</Text>
              <Text style={styles.cardDate}>{new Date(vax.date).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Growth Records</Text>
        {health.growthRecords.length === 0 ? (
          <Text style={styles.emptyText}>No growth records yet</Text>
        ) : (
          health.growthRecords.map((record, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>Age: {record.ageMonths} months</Text>
              <Text style={styles.cardDetail}>Weight: {record.weight} kg</Text>
              <Text style={styles.cardDetail}>Height: {record.height} cm</Text>
              <Text style={styles.cardDate}>{new Date(record.date).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  cardDetail: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  cardDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HealthBookScreen;
