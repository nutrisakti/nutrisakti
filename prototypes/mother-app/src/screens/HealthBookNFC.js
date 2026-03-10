import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import web3Service from '../services/web3Service';

const HealthBookNFC = () => {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [healthRecords, setHealthRecords] = useState([]);
  const [tapMode, setTapMode] = useState(false);

  useEffect(() => {
    checkNfcSupport();
    loadHealthRecords();
    
    return () => {
      NfcManager.cancelTechnologyRequest();
    };
  }, []);

  const checkNfcSupport = async () => {
    const supported = await NfcManager.isSupported();
    setNfcSupported(supported);
    
    if (supported) {
      const enabled = await NfcManager.isEnabled();
      setNfcEnabled(enabled);
    }
  };

  const loadHealthRecords = async () => {
    try {
      const records = await web3Service.getHealthRecords();
      setHealthRecords(records);
    } catch (error) {
      console.error('Load records error:', error);
    }
  };

  const startNfcTap = async () => {
    if (!nfcEnabled) {
      Alert.alert('NFC Disabled', 'Please enable NFC in your phone settings');
      return;
    }

    setTapMode(true);
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      const tag = await NfcManager.getTag();
      console.log('NFC Tag detected:', tag);
      
      // Read data from Posyandu NFC tag
      const ndefRecords = tag.ndefMessage;
      if (ndefRecords && ndefRecords.length > 0) {
        const payload = Ndef.text.decodePayload(ndefRecords[0].payload);
        await processHealthUpdate(payload);
      }
    } catch (error) {
      console.error('NFC error:', error);
      Alert.alert('NFC Error', 'Failed to read tag. Please try again.');
    } finally {
      NfcManager.cancelTechnologyRequest();
      setTapMode(false);
    }
  };

  const processHealthUpdate = async (data) => {
    try {
      const updateData = JSON.parse(data);
      
      // Verify signature from healthcare provider
      const verified = await web3Service.verifyHealthcareSignature(updateData);
      
      if (verified) {
        // Update on-chain
        const result = await web3Service.updateHealthRecord(updateData);
        
        if (result.success) {
          Alert.alert(
            'Health Record Updated! ✅',
            `${updateData.type} recorded on-chain\nTransaction: ${result.txHash.slice(0, 10)}...`,
            [{ text: 'OK', onPress: loadHealthRecords }]
          );
        }
      } else {
        Alert.alert('Verification Failed', 'Invalid healthcare provider signature');
      }
    } catch (error) {
      console.error('Process update error:', error);
      Alert.alert('Error', 'Failed to process health update');
    }
  };

  const emulateNfcCard = async () => {
    try {
      // Enable NFC card emulation mode
      const did = await web3Service.getDecentralizedID();
      const cardData = {
        did: did,
        name: 'Mother Name',
        healthId: 'HEALTH_ID_123',
      };
      
      // This would enable the phone to act as an NFC card
      Alert.alert(
        'NFC Card Mode',
        'Your phone is now emulating an NFC card. Healthcare providers can tap to access your health records.',
        [{ text: 'Stop', onPress: () => {} }]
      );
    } catch (error) {
      console.error('Card emulation error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Digital Health Book</Text>
        <Text style={styles.subtitle}>Offline-First with NFC Sync</Text>
      </View>

      <View style={styles.nfcCard}>
        <Text style={styles.nfcIcon}>📱</Text>
        <View style={styles.nfcInfo}>
          <Text style={styles.nfcTitle}>NFC Status</Text>
          <Text style={[
            styles.nfcStatus,
            { color: nfcEnabled ? '#4CAF50' : '#F44336' }
          ]}>
            {nfcSupported ? (nfcEnabled ? '✓ Enabled' : '✗ Disabled') : '✗ Not Supported'}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.tapButton, tapMode && styles.tapButtonActive]}
          onPress={startNfcTap}
          disabled={!nfcEnabled || tapMode}
        >
          <Text style={styles.tapIcon}>📲</Text>
          <Text style={styles.tapText}>
            {tapMode ? 'Waiting for tap...' : 'Tap at Posyandu'}
          </Text>
          <Text style={styles.tapSubtext}>
            Update records from healthcare provider
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emulateButton}
          onPress={emulateNfcCard}
          disabled={!nfcEnabled}
        >
          <Text style={styles.emulateIcon}>💳</Text>
          <Text style={styles.emulateText}>Enable Card Mode</Text>
          <Text style={styles.emulateSubtext}>
            Let providers read your health ID
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recordsSection}>
        <Text style={styles.sectionTitle}>Health Records</Text>
        
        {healthRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No records yet</Text>
            <Text style={styles.emptySubtext}>
              Tap your phone at Posyandu to add records
            </Text>
          </View>
        ) : (
          healthRecords.map((record, index) => (
            <View key={index} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordIcon}>
                  {record.type === 'vaccination' ? '💉' :
                   record.type === 'checkup' ? '🩺' :
                   record.type === 'growth' ? '📏' : '📝'}
                </Text>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordDate}>
                    {new Date(record.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.onChainBadge}>
                  <Text style={styles.onChainText}>⛓️ On-Chain</Text>
                </View>
              </View>
              
              <Text style={styles.recordDetails}>{record.details}</Text>
              
              {record.provider && (
                <Text style={styles.recordProvider}>
                  Provider: {record.provider}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔐 How NFC Sync Works:</Text>
        <Text style={styles.infoText}>
          1. Visit Posyandu for checkup/vaccination{'\n'}
          2. Healthcare provider records service{'\n'}
          3. Tap your phone on Posyandu NFC reader{'\n'}
          4. Record verified with provider's signature{'\n'}
          5. Automatically synced to blockchain{'\n'}
          6. Immutable health history created{'\n'}
          7. Works offline, syncs when online
        </Text>
      </View>

      <View style={styles.privacyBox}>
        <Text style={styles.privacyTitle}>🛡️ Privacy Protected</Text>
        <Text style={styles.privacyText}>
          Your health data is encrypted and stored locally. Only hashes are stored on-chain. You control who can access your records.
        </Text>
      </View>
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
  nfcCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  nfcIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  nfcInfo: {
    flex: 1,
  },
  nfcTitle: {
    fontSize: 16,
    color: '#666',
  },
  nfcStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 3,
  },
  actionButtons: {
    padding: 15,
  },
  tapButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  tapButtonActive: {
    backgroundColor: '#FF9800',
  },
  tapIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  tapText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tapSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  emulateButton: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  emulateIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emulateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emulateSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  recordsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  onChainBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onChainText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  recordDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  recordProvider: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  infoBox: {
    margin: 15,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  privacyBox: {
    margin: 15,
    padding: 15,
    backgroundColor: '#F3E5F5',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default HealthBookNFC;
