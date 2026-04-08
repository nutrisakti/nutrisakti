import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import web3Service from '../services/web3Service';

const EmergencyMap = () => {
  const [region, setRegion] = useState({
    latitude: -8.5,
    longitude: 120.0,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [disasterMode, setDisasterMode] = useState(false);
  const [priorityMothers, setPriorityMothers] = useState([]);
  const [selectedMother, setSelectedMother] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    checkDisasterMode();
    loadPriorityMothers();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const checkDisasterMode = async () => {
    try {
      const status = await web3Service.getEmergencyStatus();
      setDisasterMode(status.isActive);
    } catch (error) {
      console.error('Check disaster mode error:', error);
    }
  };

  const loadPriorityMothers = async () => {
    setLoading(true);
    try {
      const mothers = await web3Service.getPriorityMothers();
      setPriorityMothers(mothers);
    } catch (error) {
      console.error('Load priority mothers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMother = (mother) => {
    Alert.alert(
      'Navigate to Mother',
      `Navigate to ${mother.name}?\n\nDistance: ${mother.distance}km`,
      [
        {
          text: 'Start Navigation',
          onPress: () => {
            // Open navigation app
            Alert.alert('Navigation', 'Opening maps app...');
          },
        },
        { text: 'Cancel' },
      ]
    );
  };

  const markAsAssisted = async (mother) => {
    try {
      const result = await web3Service.markMotherAsAssisted(mother.id);
      if (result.success) {
        Alert.alert('Success', `${mother.name} marked as assisted.\n\nYou earned 5 USDC bounty!`);
        loadPriorityMothers();
      }
    } catch (error) {
      console.error('Mark assisted error:', error);
    }
  };

  const getPriorityColor = (level) => {
    if (level === 2) return '#F44336'; // Emergency
    if (level === 1) return '#FF9800'; // High
    return '#4CAF50'; // Normal
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Emergency Signal Gateway</Text>
        {disasterMode && (
          <View style={styles.disasterBanner}>
            <Text style={styles.disasterText}>🚨 DISASTER MODE ACTIVE</Text>
          </View>
        )}
      </View>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {priorityMothers.map((mother) => (
          <React.Fragment key={mother.id}>
            <Circle
              center={{ latitude: mother.latitude, longitude: mother.longitude }}
              radius={mother.priorityLevel * 500}
              fillColor={`${getPriorityColor(mother.priorityLevel)}33`}
              strokeColor={getPriorityColor(mother.priorityLevel)}
            />
            <Marker
              coordinate={{ latitude: mother.latitude, longitude: mother.longitude }}
              pinColor={getPriorityColor(mother.priorityLevel)}
              onPress={() => setSelectedMother(mother)}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>
                  {mother.priorityLevel === 2 ? '🚨' : mother.priorityLevel === 1 ? '⚠️' : '👶'}
                </Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}
      </MapView>

      {selectedMother && (
        <View style={styles.detailCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedMother(null)}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <View style={styles.detailHeader}>
            <Text style={styles.detailName}>{selectedMother.name}</Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(selectedMother.priorityLevel) }
            ]}>
              <Text style={styles.priorityText}>
                {selectedMother.priorityLevel === 2 ? 'EMERGENCY' :
                 selectedMother.priorityLevel === 1 ? 'HIGH PRIORITY' : 'NORMAL'}
              </Text>
            </View>
          </View>

          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Phase:</Text>
            <Text style={styles.detailValue}>{selectedMother.phase}</Text>
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Distance:</Text>
            <Text style={styles.detailValue}>{selectedMother.distance}km away</Text>
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Needs:</Text>
            <Text style={styles.detailValue}>{selectedMother.needs.join(', ')}</Text>
          </View>

          <View style={styles.detailActions}>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => navigateToMother(selectedMother)}
            >
              <Text style={styles.navigateText}>🧭 Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.assistButton}
              onPress={() => markAsAssisted(selectedMother)}
            >
              <Text style={styles.assistText}>✅ Mark Assisted</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{priorityMothers.length}</Text>
          <Text style={styles.statLabel}>Priority Mothers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {priorityMothers.filter(m => m.priorityLevel === 2).length}
          </Text>
          <Text style={styles.statLabel}>Emergency</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {priorityMothers.filter(m => m.assisted).length}
          </Text>
          <Text style={styles.statLabel}>Assisted Today</Text>
        </View>
      </View>

      <ScrollView style={styles.listSection}>
        <Text style={styles.listTitle}>Priority List</Text>
        {priorityMothers
          .sort((a, b) => b.priorityLevel - a.priorityLevel)
          .map((mother) => (
            <TouchableOpacity
              key={mother.id}
              style={styles.listItem}
              onPress={() => setSelectedMother(mother)}
            >
              <View style={[
                styles.listPriority,
                { backgroundColor: getPriorityColor(mother.priorityLevel) }
              ]}>
                <Text style={styles.listPriorityText}>
                  {mother.priorityLevel === 2 ? '🚨' : mother.priorityLevel === 1 ? '⚠️' : '👶'}
                </Text>
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listName}>{mother.name}</Text>
                <Text style={styles.listDistance}>{mother.distance}km away</Text>
              </View>
              {mother.assisted && (
                <View style={styles.assistedBadge}>
                  <Text style={styles.assistedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#FF9800',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  disasterBanner: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  disasterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  map: {
    height: 300,
  },
  markerContainer: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
    elevation: 3,
  },
  markerText: {
    fontSize: 20,
  },
  detailCard: {
    position: 'absolute',
    bottom: 200,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  detailActions: {
    flexDirection: 'row',
    marginTop: 15,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  navigateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  assistButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  assistText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  listSection: {
    flex: 1,
    padding: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
  },
  listPriority: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listPriorityText: {
    fontSize: 20,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  assistedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmergencyMap;
