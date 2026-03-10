import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import web3Service from '../services/web3Service';

const KitRequestScreen = () => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [didVerified, setDidVerified] = useState(false);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    setLoading(true);
    try {
      const did = await web3Service.getDecentralizedID();
      const eligible = await web3Service.checkKitEligibility(did);
      setEligibility(eligible);
      setDidVerified(true);
    } catch (error) {
      console.error('Eligibility check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestKit = async (kitType) => {
    if (!didVerified) {
      Alert.alert('Verification Required', 'Please verify your identity first');
      return;
    }

    setLoading(true);
    try {
      const result = await web3Service.requestMaternalKit(kitType);
      if (result.success) {
        Alert.alert(
          'Kit Requested Successfully! 🎉',
          `Request ID: ${result.requestId}\n\nYour kit will be delivered within 3-5 days. You'll receive a notification when it's ready for pickup.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request kit');
    } finally {
      setLoading(false);
    }
  };

  const kits = [
    {
      id: 'prenatal',
      name: 'Prenatal Care Kit',
      icon: '🤰',
      items: ['Folic acid', 'Iron supplements', 'Prenatal vitamins', 'Blood pressure monitor'],
      eligible: eligibility?.prenatal || false,
    },
    {
      id: 'delivery',
      name: 'Safe Delivery Kit',
      icon: '🏥',
      items: ['Sterile gloves', 'Umbilical cord clamp', 'Clean delivery mat', 'Emergency supplies'],
      eligible: eligibility?.delivery || false,
    },
    {
      id: 'newborn',
      name: 'Newborn Essentials',
      icon: '👶',
      items: ['Baby thermometer', 'Diapers', 'Baby soap', 'Blankets'],
      eligible: eligibility?.newborn || false,
    },
    {
      id: 'nutrition',
      name: 'Nutrition Support Kit',
      icon: '🥗',
      items: ['Moringa powder', 'Protein supplements', 'Vitamin sachets', 'Nutrition guide'],
      eligible: eligibility?.nutrition || false,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Request Maternal-Baby Kit</Text>
        <Text style={styles.subtitle}>1-Click Request with DID Verification</Text>
      </View>

      {loading && !didVerified ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔐 Verifying your Decentralized ID...</Text>
        </View>
      ) : (
        <>
          <View style={styles.didCard}>
            <Text style={styles.didIcon}>✅</Text>
            <View style={styles.didInfo}>
              <Text style={styles.didTitle}>DID Verified</Text>
              <Text style={styles.didSubtext}>Your identity is secured on-chain</Text>
            </View>
          </View>

          {kits.map((kit) => (
            <View key={kit.id} style={styles.kitCard}>
              <View style={styles.kitHeader}>
                <Text style={styles.kitIcon}>{kit.icon}</Text>
                <View style={styles.kitTitleContainer}>
                  <Text style={styles.kitName}>{kit.name}</Text>
                  {kit.eligible ? (
                    <View style={styles.eligibleBadge}>
                      <Text style={styles.eligibleText}>✓ Eligible</Text>
                    </View>
                  ) : (
                    <View style={styles.ineligibleBadge}>
                      <Text style={styles.ineligibleText}>Not Eligible Yet</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.itemsList}>
                <Text style={styles.itemsTitle}>Includes:</Text>
                {kit.items.map((item, index) => (
                  <Text key={index} style={styles.item}>• {item}</Text>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.requestButton,
                  !kit.eligible && styles.disabledButton,
                  loading && styles.disabledButton,
                ]}
                onPress={() => requestKit(kit.id)}
                disabled={!kit.eligible || loading}
              >
                <Text style={styles.requestButtonText}>
                  {loading ? 'Processing...' : kit.eligible ? '🛒 Request Kit' : '🔒 Not Available'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📦 How It Works:</Text>
            <Text style={styles.infoText}>
              1. Your DID is automatically verified{'\n'}
              2. Eligibility checked based on your health timeline{'\n'}
              3. Request sent to blockchain marketplace{'\n'}
              4. USDC payment escrowed until delivery{'\n'}
              5. Local vendor fulfills order{'\n'}
              6. You confirm delivery via NFC tap{'\n'}
              7. Payment released automatically
            </Text>
          </View>
        </>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  didCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  didIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  didInfo: {
    flex: 1,
  },
  didTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  didSubtext: {
    fontSize: 14,
    color: '#555',
    marginTop: 3,
  },
  kitCard: {
    margin: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
  },
  kitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  kitIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  kitTitleContainer: {
    flex: 1,
  },
  kitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eligibleBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  eligibleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ineligibleBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ineligibleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsList: {
    marginBottom: 15,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  item: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  requestButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default KitRequestScreen;
