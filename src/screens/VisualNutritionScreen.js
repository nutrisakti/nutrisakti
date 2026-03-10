import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Camera, useCameraDevice } from '@react-native-camera/camera';
import { useDispatch, useSelector } from 'react-redux';
import { recognizeFood, generateRecipe } from '../services/aiService';
import { saveNutritionLog } from '../store/actions/nutritionActions';

const VisualNutritionScreen = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognizedFood, setRecognizedFood] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('capture'); // capture, recognize, recipe
  
  const camera = useRef(null);
  const device = useCameraDevice('back');
  const dispatch = useDispatch();
  const isOffline = useSelector(state => state.network.isOffline);

  const capturePhoto = async () => {
    if (camera.current) {
      setLoading(true);
      try {
        const photo = await camera.current.takePhoto({
          qualityPrioritization: 'speed',
          flash: 'off',
        });
        setCapturedImage(photo.path);
        setStep('recognize');
        await processImage(photo.path);
      } catch (error) {
        console.error('Capture error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const processImage = async (imagePath) => {
    setLoading(true);
    try {
      // Use TensorFlow Lite for on-device recognition
      const foodData = await recognizeFood(imagePath);
      setRecognizedFood(foodData);
      setStep('recipe');
      
      // Generate recipe using AI
      if (!isOffline) {
        const recipeData = await generateRecipe(foodData);
        setRecipe(recipeData);
        
        // Save to local database
        dispatch(saveNutritionLog({
          food: foodData,
          recipe: recipeData,
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setCapturedImage(null);
    setRecognizedFood(null);
    setRecipe(null);
    setStep('capture');
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Camera not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {step === 'capture' && (
        <>
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
          />
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={capturePhoto}
              disabled={loading}
            >
              <Text style={styles.captureText}>
                {loading ? 'Processing...' : 'Capture Food'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 'recognize' && capturedImage && (
        <View style={styles.resultContainer}>
          <Image source={{ uri: `file://${capturedImage}` }} style={styles.previewImage} />
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : recognizedFood ? (
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{recognizedFood.name}</Text>
              <Text style={styles.foodDetails}>
                Confidence: {(recognizedFood.confidence * 100).toFixed(1)}%
              </Text>
              <Text style={styles.nutritionLabel}>Nutritional Value:</Text>
              <Text>Protein: {recognizedFood.nutrition.protein}g</Text>
              <Text>Carbs: {recognizedFood.nutrition.carbs}g</Text>
              <Text>Vitamins: {recognizedFood.nutrition.vitamins.join(', ')}</Text>
            </View>
          ) : null}
        </View>
      )}

      {step === 'recipe' && recipe && (
        <ScrollView style={styles.recipeContainer}>
          <TouchableOpacity style={styles.backButton} onPress={resetFlow}>
            <Text style={styles.backText}>← New Scan</Text>
          </TouchableOpacity>
          
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Image source={{ uri: `file://${capturedImage}` }} style={styles.recipeImage} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            {recipe.ingredients.map((item, index) => (
              <Text key={index} style={styles.listItem}>• {item}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            {recipe.instructions.map((step, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Benefits:</Text>
            <Text style={styles.benefits}>{recipe.healthBenefits}</Text>
          </View>

          {recipe.videoUrl && !isOffline && (
            <TouchableOpacity style={styles.videoButton}>
              <Text style={styles.videoText}>▶ Watch Cooking Video</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  captureText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  foodInfo: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  foodDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  nutritionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  recipeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
    marginBottom: 15,
  },
  backText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  recipeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  benefits: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  videoButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  videoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VisualNutritionScreen;
