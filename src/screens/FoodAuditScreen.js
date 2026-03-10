import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import web3Service from '../services/web3Service';

const FoodAuditScreen = () => {
  const [foodType, setFoodType] = useState('rice');
  const [quantity, setQuantity] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [calories, setCalories] = useState('');
  const [qualityRating, setQualityRating] = useState('80');
  const [loading, setLoading] = useState(false);
  
  const user = useSelector(state => state.user);

  const foodTypes = [
    { label: 'Rice (Beras)', value: 'rice' },
    { label: 'Egg (Telur)', value: 'egg' },
    { label: 'Fish (Ikan)', value: 'fish' },
    { label: 'Vegetables (Sayuran)', value: 'vegetables' },
    { label: 'Moringa (Kelor)', value: 'moringa' },
  ];

  const submitAudit = async () => {
    if (!user.isRegistered) {
      Alert.alert('Registration Required', 'Please register first to log food');
      return;
    }

    if (!quantity || !protein || !carbs || !fat || !calories) {
      Alert.alert('Missing Information', 'Please fill in all nutritional values');
      return;
    }

    setLoading(true);
    try {
      const result = await web3Service.logBGNFood(
        foodType,
        parseInt(quantity),
        parseInt(protein),
        parseInt(carbs),
        parseInt(fat),
        parseInt(calories),
        parseInt(qualityRating)
      );

      if (result.success) {
        Alert.alert(
          'Food Logged Successfully',
          `Log ID: ${result.logId}\nNutritional Score: ${result.nutritionalScore}/100`,
          [{ text: 'OK', onPress: () => clearForm() }]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log food');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setQuantity('');
    setProtein('');
    setCarbs('');
    setFat('');
    setCalories('');
    setQualityRating('80');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BGN Food Quality Auditor</Text>
        <Text style={styles.subtitle}>Log government-provided food for quality verification</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Food Type:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={foodType}
            onValueChange={(value) => setFoodType(value)}
            style={styles.picker}
          >
            {foodTypes.map((type) => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Quantity (grams):</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="e.g., 200"
        />

        <Text style={styles.sectionTitle}>Nutritional Values (per 100g):</Text>

        <Text style={styles.label}>Protein (g):</Text>
        <TextInput
          style={styles.input}
          value={protein}
          onChangeText={setProtein}
          keyboardType="numeric"
          placeholder="e.g., 7"
        />

        <Text style={styles.label}>Carbohydrates (g):</Text>
        <TextInput
          style={styles.input}
          value={carbs}
          onChangeText={setCarbs}
          keyboardType="numeric"
          placeholder="e.g., 77"
        />

        <Text style={styles.label}>Fat (g):</Text>
        <TextInput
          style={styles.input}
          value={fat}
          onChangeText={setFat}
          keyboardType="numeric"
          placeholder="e.g., 1"
        />

        <Text style={styles.label}>Calories (kcal):</Text>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="e.g., 365"
        />

        <Text style={styles.label}>Quality Rating (0-100):</Text>
        <TextInput
          style={styles.input}
          value={qualityRating}
          onChangeText={setQualityRating}
          keyboardType="numeric"
          placeholder="Rate the overall quality"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={submitAudit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Submitting...' : 'Submit Audit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📊 How It Works:</Text>
        <Text style={styles.infoText}>
          • Your food log is verified against nutritional standards{'\n'}
          • Provider performance is tracked on-chain{'\n'}
          • Low-quality providers are automatically flagged{'\n'}
          • Helps ensure government food programs deliver proper nutrition
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    margin: 20,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});

export default FoodAuditScreen;
