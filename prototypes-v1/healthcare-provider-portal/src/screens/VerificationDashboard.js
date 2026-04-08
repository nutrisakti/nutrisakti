import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import web3Service from '../services/web3Service';

const VerificationDashboard = ({ navigation }) => {
  const [mothers, setMothers] = useState([]);
  const [filteredMothers, setFilteredMothers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('NTT');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssignedMothers();
  }, [region]);

  const loadAssignedMothers = async () => {
    setLoading(true);
    try {
      const assigned = await web3Service.getAssignedMothers(region);
      setMothers(assigned);
      setFilteredMothers(assigned);
    } catch (error) {
      console.error('Load mothers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMothers = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredMothers(mothers);
    } else {
      const filtered = mothers.filter(mother =>
        mother.name.toLowerCase().includes(query.toLowerCase()) ||
        mother.id.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMothers(filtered);
    }
  };

  const renderMotherCard = ({ item }) => (
    <TouchableOpacity
      style={styles.motherCard}
      onPress={() => navigation.navigate('MotherDetail', { mother: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.motherInfo}>
          <Text style={styles.motherName}>{item.name}</Text>
          <Text style={styles.motherId}>ID: {item.id}</Text>
          <Text style={styles.motherPhase}>
            {item.phase === 'pregnancy' ? '🤰 Pregnant' :
             item.phase === 'infant' ? '👶 Infant Care' :
             '🧒 Toddler Care'}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          {item.bpjsStatus ? (
            <View style={styles.bpjsActive}>
              <Text style={styles.statusText}>✓ BPJS</Text>
            </View>
          ) : (
            <View style={styles.bpjsInactive}>
              <Text style={styles.statusText}>✗ BPJS</Text>
            </View>
          )}
          {item.priorityLevel > 0 && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>⚠️ Priority</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.daysInJourney}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.completedMilestones}</Text>
          <Text style={styles.statLabel}>Milestones</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.lastVisit}</Text>
          <Text style={styles.statLabel}>Last Visit</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verification Dashboard</Text>
        <Text style={styles.subtitle}>Assigned Mothers in {region}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChangeText={searchMothers}
        />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{mothers.length}</Text>
          <Text style={styles.statBoxLabel}>Total Mothers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {mothers.filter(m => !m.bpjsStatus).length}
          </Text>
          <Text style={styles.statBoxLabel}>No BPJS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {mothers.filter(m => m.priorityLevel > 0).length}
          </Text>
          <Text style={styles.statBoxLabel}>High Priority</Text>
        </View>
      </View>

      <FlatList
        data={filteredMothers}
        renderItem={renderMotherCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadAssignedMothers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  statsBar: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  listContainer: {
    padding: 15,
  },
  motherCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  motherInfo: {
    flex: 1,
  },
  motherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  motherId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  motherPhase: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  bpjsActive: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  bpjsInactive: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  priorityBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
});

export default VerificationDashboard;
