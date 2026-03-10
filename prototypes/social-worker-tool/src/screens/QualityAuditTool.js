import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { Camera, useCameraDevice } from '@react-native-camera/camera';
import web3Service from '../services/web3Service';

const QualityAuditTool = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [foodType, setFoodType] = useState('rice');
  const [qualityPoints, setQualityPoints] = useState('');
  const [provider, setProvider] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deficiencies, setDeficiencies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const camera = React.useRef(null);
  const device = useCameraDevice('back');

  const capturePhoto = async () => {
    if (camera.current) {
      try {
        const photo = await camera.current.takePhoto();
        setCapturedImage(photo.path);
        setShowCamera(false);
      } catch (error) {
        console.error('Capture error:', error);
      }
    }
  };

  const submitAudit = async () => {
    if (!capturedImage || !qualityPoints || !provider) {
      Alert.alert('Missing Information', 'Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const result = await web3Service.submitBGNAudit({
        foodType,
        qualityPoints: parseInt(qualityPoints),
        provider,
        quantity: parseInt(quantity),
        imageHash: await web3Service.uploadToIPFS(capturedImage),
        deficiencies,
      });

      if (result.success) {
        const bountyEarned = result.bountyAmount;
        Alert.alert(
          'Audit Submitted Successfully! ✅',
          `Quality Score: ${qualityPoints}/100\n\nProvider Ranking Updated\n\nYou earned ${bountyEarned} USDC bounty!\n\nTransaction: ${result.txHash.slice(0, 10)}...`,
          [
            {
              text: 'OK',
              onPress: resetForm,
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit audit');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCapturedImage(null);
    setQualityPoints('');
    setProvider('');
    setQuantity('');
    setDeficiencies([]);
  };

  const toggleDeficiency = (def) => {
    if (deficiencies.includes(def)) {
      setDeficiencies(deficiencies.filter((d) => d !== def));
    } else {
      setDeficiencies([...deficiencies, def]);
    }
  };

  if (showCamera && device) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraInstruction}>
            📸 Capture BGN Food Distribution
          </Text>
        </View>
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCamera(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
            <Text style={styles.captureText}>Capture</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BGN Quality Audit Tool</Text>
        <Text style={styles.subtitle}>Independent Food Quality Verification</Text>
      </View>

      <View style={styles.photoSection}>
        {capturedImage ? (
          <View>
            <Image source={{ uri: `file://${capturedImage}` }} style={styles.previewImage} />
            <TouchableOpacity style={styles.retakeButton} onPress={() => setShowCamera(true)}>
              <Text style={styles.retakeText}>📸 Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.captureCard} onPress={() => setShowCamera(true)}>
            <Text style={styles.captureIcon}>📷</Text>
            <Text style={styles.captureLabel}>Take Photo of Food</Text>
            <Text style={styles.captureSubtext}>Required for audit verification</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Food Type:</Text>
        <View style={styles.foodTypeButtons}>
          {['rice', 'egg', 'fish', 'vegetables', 'moringa'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.foodTypeButton, foodType === type && styles.foodTypeSelected]}
              onPress={() => setFoodType(type)}
            >
              <Text style={[styles.foodTypeText, foodType === type && styles.foodTypeTextSelected]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Provider Name/ID:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., BGN Partner NTT-001"
          value={provider}
          onChangeText={setProvider}
        />

        <Text style={styles.label}>Quantity Distributed (kg):</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 50"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Quality Points (0-100):</Text>
        <TextInput
          style={styles.input}
          placeholder="Rate overall quality"
          value={qualityPoints}
          onChangeText={setQualityPoints}
          keyboardType="numeric"
        />

        <View style={styles.qualityIndicator}>
          {qualityPoints && (
            <View style={[
              styles.qualityBar,
              {
                width: `${qualityPoints}%`,
                backgroundColor: qualityPoints >= 80 ? '#4CAF50' : qualityPoints >= 60 ? '#FF9800' : '#F44336',
              },
            ]} />
          )}
        </View>

        <Text style={styles.label}>Identified Deficiencies:</Text>
        <View style={styles.deficiencyButtons}>
          {['Moisture', 'Mold', 'Insects', 'Odor', 'Color', 'Texture'].map((def) => (
            <TouchableOpacity
              key={def}
              style={[styles.deficiencyButton, deficiencies.includes(def) && styles.deficiencySelected]}
              onPress={() => toggleDeficiency(def)}
            >
              <Text style={[styles.deficiencyText, deficiencies.includes(def) && styles.deficiencyTextSelected]}>
                {def}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.disabledButton]}
        onPress={submitAudit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? '⏳ Submitting to Blockchain...' : '✅ Submit Audit & Earn Bounty'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💰 Bounty Rewards:</Text>
        <Text style={styles.infoText}>
          • Remote area audit: 5 USDC{'\n'}
          • Quality score {'<'} 60: +3 USDC bonus{'\n'}
          • Photo verification: +2 USDC{'\n'}
          • First audit of provider: +5 USDC
        </Text>
      </View>

      <View style={styles.impactBox}>
        <Text style={styles.impactTitle}>🎯 Your Impact:</Text>
        <Text style={styles.impactText}>
          Your audits create transparent accountability for government food programs. Low-quality providers are automatically flagged, ensuring mothers receive proper nutrition.
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
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraInstruction: {
    fontSize: 18,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  captureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF9800',
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
  photoSection: {
    padding: 15,
  },
  captureCard: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  captureIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  captureLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  captureSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
  },
  retakeButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  retakeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  foodTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  foodTypeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  foodTypeSelected: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  foodTypeText: {
    color: '#666',
    fontSize: 14,
  },
  foodTypeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  qualityIndicator: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  qualityBar: {
    height: '100%',
    borderRadius: 5,
  },
  deficiencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  deficiencyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deficiencySelected: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  deficiencyText: {
    color: '#666',
    fontSize: 14,
  },
  deficiencyTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
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
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    margin: 15,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  impactBox: {
    margin: 15,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default QualityAuditTool;
