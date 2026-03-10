import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import web3Service from '../services/web3Service';

const BPJSScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [motherData, setMotherData] = useState(null);
  const [bpjsStatus, setBpjsStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSuccess = async (e) => {
    setScanning(false);
    setLoading(true);
    
    try {
      const data = JSON.parse(e.data);
      setMotherData(data);
      
      // Check BPJS status via Verification Bridge
      const status = await web3Service.checkBPJSStatus(data.did);
      setBpjsStatus(status);
      
      if (!status.hasActiveCoverage) {
        Alert.alert(
          '🚨 BPJS Coverage Missing',
          `${data.name} does not have active BPJS coverage.\n\nProtection Alarm has been triggered to local health authorities.`,
          [
            { text: 'Help Enroll', onPress: () => initiateEnrollment(data) },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Invalid QR code');
    } finally {
      setLoading(false);
    }
  };

  const initiateEnrollment = (data) => {
    Alert.alert(
      'BPJS Enrollment Workflow',
      'This will guide the mother through BPJS enrollment process.',
      [
        {
          text: 'Start Enrollment',
          onPress: async () => {
            const result = await web3Service.initiateBPJSEnrollment(data.did);
            if (result.success) {
              Alert.alert('Success', 'Enrollment process initiated. Mother will receive instructions via WhatsApp.');
            }
          },
        },
        { text: 'Cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BPJS Verification Bridge</Text>
        <Text style={styles.subtitle}>Instant Insurance Status Check</Text>
      </View>

      {!motherData ? (
        <View style={styles.scanSection}>
          {!scanning ? (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setScanning(true)}
            >
              <Text style={styles.scanIcon}>📱</Text>
              <Text style={styles.scanText}>Scan Mother's QR Code</Text>
            </TouchableOpacity>
          ) : (
            <QRCodeScanner
              onRead={onSuccess}
              topContent={
                <Text style={styles.scanInstruction}>
                  Point camera at mother's Digital Health Book QR code
                </Text>
              }
              bottomContent={
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setScanning(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              }
            />
          )}
        </View>
      ) : (
        <View style={styles.resultSection}>
          <View style={styles.motherCard}>
            <Text style={styles.motherName}>{motherData.name}</Text>
            <Text style={styles.motherDID}>DID: {motherData.did.slice(0, 30)}...</Text>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Checking BPJS status...</Text>
          ) : bpjsStatus ? (
            <View style={[
              styles.statusCard,
              { backgroundColor: bpjsStatus.hasActiveCoverage ? '#E8F5E9' : '#FFEBEE' }
            ]}>
              <Text style={styles.statusIcon}>
                {bpjsStatus.hasActiveCoverage ? '✅' : '🚨'}
              </Text>
              <Text style={[
                styles.statusText,
                { color: bpjsStatus.hasActiveCoverage ? '#2E7D32' : '#C62828' }
              ]}>
                {bpjsStatus.hasActiveCoverage ? 'Active BPJS Coverage' : 'No Active Coverage'}
              </Text>
              {bpjsStatus.lastChecked && (
                <Text style={styles.statusDate}>
                  Last verified: {new Date(bpjsStatus.lastChecked * 1000).toLocaleDateString()}
                </Text>
              )}
            </View>
          ) : null}

          {bpjsStatus && !bpjsStatus.hasActiveCoverage && (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>⚠️ Action Required</Text>
              <Text style={styles.alertText}>
                Protection Alarm has been automatically triggered to local health authorities.
              </Text>
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={() => initiateEnrollment(motherData)}
              >
                <Text style={styles.enrollText}>Help Enroll in BPJS</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.newScanButton}
            onPress={() => {
              setMotherData(null);
              setBpjsStatus(null);
              setScanning(false);
            }}
          >
            <Text style={styles.newScanText}>Scan Another Patient</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔐 How BPJS Bridge Works:</Text>
        <Text style={styles.infoText}>
          1. Scan mother's QR code{'\n'}
          2. System queries BPJS database via Chainlink{'\n'}
          3. Zero-Knowledge Proof verifies status{'\n'}
          4. No PII exposed on blockchain{'\n'}
          5. If uncovered, automatic alert sent{'\n'}
          6. Enrollment workflow initiated
        </Text>
      </View>
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
  scanSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanButton: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
  },
  scanIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  scanText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scanInstruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultSection: {
    padding: 20,
  },
  motherCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  motherName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  motherDID: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  statusCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  alertText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  enrollButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  enrollText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newScanButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  newScanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    margin: 20,
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

export default BPJSScanner;
