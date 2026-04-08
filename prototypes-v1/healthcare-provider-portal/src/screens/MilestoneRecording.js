import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { ethers } from 'ethers';
import web3Service from '../services/web3Service';

const MilestoneRecording = ({ route }) => {
  const { mother } = route.params;
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [notes, setNotes] = useState('');
  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    temperature: '',
  });
  const [signing, setSigning] = useState(false);

  const milestones = [
    { id: 'prenatal_visit', name: 'Prenatal Visit', icon: '🤰', reward: 10 },
    { id: 'vaccination', name: 'Vaccination', icon: '💉', reward: 10 },
    { id: 'growth_check', name: 'Growth Check', icon: '📏', reward: 15 },
    { id: 'nutrition_counseling', name: 'Nutrition Counseling', icon: '🥗', reward: 5 },
    { id: 'bpjs_verification', name: 'BPJS Verification', icon: '🏥', reward: 5 },
  ];

  const signAndRecord = async () => {
    if (!selectedMilestone) {
      Alert.alert('Error', 'Please select a milestone');
      return;
    }

    setSigning(true);
    try {
      // Get provider's private key from secure storage
      const privateKey = await web3Service.getProviderPrivateKey();
      const wallet = new ethers.Wallet(privateKey);

      // Create milestone data
      const milestoneData = {
        motherId: mother.id,
        milestoneId: selectedMilestone.id,
        milestoneName: selectedMilestone.name,
        timestamp: Date.now(),
        notes: notes,
        measurements: measurements,
        provider: wallet.address,
      };

      // Sign the data
      const message = JSON.stringify(milestoneData);
      const signature = await wallet.signMessage(message);

      // Record on blockchain
      const result = await web3Service.recordMilestone({
        ...milestoneData,
        signature,
      });

      if (result.success) {
        Alert.alert(
          'Milestone Recorded! ✅',
          `${selectedMilestone.name} has been recorded on-chain.\n\nMother will receive ${selectedMilestone.reward} USDC reward.\n\nTransaction: ${result.txHash.slice(0, 10)}...`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setSelectedMilestone(null);
                setNotes('');
                setMeasurements({ weight: '', height: '', temperature: '' });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to record milestone');
    } finally {
      setSigning(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Record Milestone</Text>
        <View style={styles.motherCard}>
          <Text style={styles.motherName}>{mother.name}</Text>
          <Text style={styles.motherId}>ID: {mother.id}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Milestone:</Text>
        {milestones.map((milestone) => (
          <TouchableOpacity
            key={milestone.id}
            style={[
              styles.milestoneOption,
              selectedMilestone?.id === milestone.id && styles.milestoneSelected,
            ]}
            onPress={() => setSelectedMilestone(milestone)}
          >
            <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneName}>{milestone.name}</Text>
              <Text style={styles.milestoneReward}>Reward: {milestone.reward} USDC</Text>
            </View>
            {selectedMilestone?.id === milestone.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedMilestone && (
        <>
          {(selectedMilestone.id === 'growth_check' || selectedMilestone.id === 'prenatal_visit') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Measurements:</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                value={measurements.weight}
                onChangeText={(text) => setMeasurements({ ...measurements, weight: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Height (cm)"
                value={measurements.height}
                onChangeText={(text) => setMeasurements({ ...measurements, height: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Temperature (°C)"
                value={measurements.temperature}
                onChangeText={(text) => setMeasurements({ ...measurements, temperature: text })}
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add any additional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.signatureTitle}>🔐 Digital Signature</Text>
            <Text style={styles.signatureText}>
              By recording this milestone, you are signing with your private key. This creates a tamper-proof, verifiable record on the blockchain.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.recordButton, signing && styles.disabledButton]}
            onPress={signAndRecord}
            disabled={signing}
          >
            <Text style={styles.recordButtonText}>
              {signing ? '⏳ Signing & Recording...' : '✍️ Sign with Private Key & Record'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ How It Works:</Text>
        <Text style={styles.infoText}>
          1. Select the milestone type{'\n'}
          2. Enter measurements and notes{'\n'}
          3. Sign with your private key{'\n'}
          4. Record is sent to blockchain{'\n'}
          5. Mother receives USDC reward automatically{'\n'}
          6. Record is immutable and verifiable{'\n'}
          7. Your professional reputation is tracked on-chain
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
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  motherCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 10,
  },
  motherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  motherId: {
    fontSize: 14,
    color: '#fff',
    marginTop: 3,
    opacity: 0.9,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  milestoneOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  milestoneSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  milestoneIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  milestoneReward: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 3,
  },
  checkmark: {
    fontSize: 24,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  signatureSection: {
    margin: 15,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  signatureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  signatureText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  recordButton: {
    margin: 15,
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
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

export default MilestoneRecording;
