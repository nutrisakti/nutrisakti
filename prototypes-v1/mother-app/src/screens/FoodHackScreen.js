import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Camera, useCameraDevice } from '@react-native-camera/camera';
import { recognizeFood, generateAICookingVideo } from '../services/aiService';

const FoodHackScreen = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  
  const camera = useRef(null);
  const device = useCameraDevice('back');

  const capturePhoto = async () => {
    if (camera.current) {
      setLoading(true);
      try {
        const photo = await camera.current.takePhoto({
          qualityPrioritization: 'speed',
          flash: 'off',
        });
        setCapturedImage(photo.path);
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
      const result = await recognizeFood(imagePath);
      setFoodData(result);
    } catch (error) {
      console.error('Recognition error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    setVideoGenerating(true);
    try {
      const video = await generateAICookingVideo(foodData);
      setVideoUrl(video.url);
    } catch (error) {
      console.error('Video generation error:', error);
    } finally {
      setVideoGenerating(false);
    }
  };

  const resetFlow = () => {
    setCapturedImage(null);
    setFoodData(null);
    setVideoUrl(null);
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
      {!capturedImage ? (
        <>
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
          />
          <View style={styles.overlay}>
            <Text style={styles.instructionText}>
              📸 Point camera at local ingredients
            </Text>
            <Text style={styles.subText}>
              Moringa, cassava, local fish, vegetables
            </Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={capturePhoto}
              disabled={loading}
            >
              <Text style={styles.captureText}>
                {loading ? 'Processing...' : 'Capture'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView style={styles.resultContainer}>
          <TouchableOpacity style={styles.backButton} onPress={resetFlow}>
            <Text style={styles.backText}>← New Scan</Text>
          </TouchableOpacity>

          <Image source={{ uri: `file://${capturedImage}` }} style={styles.previewImage} />

          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : foodData ? (
            <>
              <View style={styles.nutrientCard}>
                <Text style={styles.cardTitle}>Nutrient Density Analysis</Text>
                
                <View style={styles.foodHeader}>
                  <Text style={styles.foodName}>{foodData.name}</Text>
                  <View style={[styles.confidenceBadge, { 
                    backgroundColor: foodData.confidence > 0.8 ? '#4CAF50' : '#FF9800' 
                  }]}>
                    <Text style={styles.confidenceText}>
                      {(foodData.confidence * 100).toFixed(0)}% Match
                    </Text>
                  </View>
                </View>

                <View style={styles.nutrientGrid}>
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientValue}>{foodData.nutrition.protein}g</Text>
                    <Text style={styles.nutrientLabel}>Protein</Text>
                    <View style={[styles.nutrientBar, { width: `${foodData.nutrition.protein * 5}%` }]} />
                  </View>
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientValue}>{foodData.nutrition.carbs}g</Text>
                    <Text style={styles.nutrientLabel}>Carbs</Text>
                    <View style={[styles.nutrientBar, { width: `${foodData.nutrition.carbs}%` }]} />
                  </View>
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientValue}>{foodData.nutrition.iron}mg</Text>
                    <Text style={styles.nutrientLabel}>Iron</Text>
                    <View style={[styles.nutrientBar, { width: `${foodData.nutrition.iron * 10}%` }]} />
                  </View>
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientValue}>{foodData.nutrition.calcium}mg</Text>
                    <Text style={styles.nutrientLabel}>Calcium</Text>
                    <View style={[styles.nutrientBar, { width: `${foodData.nutrition.calcium / 10}%` }]} />
                  </View>
                </View>

                <View style={styles.vitaminsSection}>
                  <Text style={styles.vitaminsTitle}>Rich in Vitamins:</Text>
                  <View style={styles.vitaminTags}>
                    {foodData.nutrition.vitamins.map((vitamin, index) => (
                      <View key={index} style={styles.vitaminTag}>
                        <Text style={styles.vitaminText}>{vitamin}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>🤰 Maternal Benefits:</Text>
                  <Text style={styles.benefitsText}>{foodData.maternalBenefits}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.videoButton}
                onPress={generateVideo}
                disabled={videoGenerating}
              >
                <Text style={styles.videoButtonText}>
                  {videoGenerating ? '⏳ Generating AI Cooking Video...' : '🎬 Generate AI Cooking Video'}
                </Text>
              </TouchableOpacity>

              {videoUrl && (
                <View style={styles.videoCard}>
                  <Text style={styles.videoTitle}>✅ Video Ready!</Text>
                  <Text style={styles.videoDesc}>
                    30-second low-bandwidth cooking guide optimized for 2G
                  </Text>
                  <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playText}>▶ Play Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.downloadButton}>
                    <Text style={styles.downloadText}>⬇ Download for Offline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : null}
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
  overlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 10,
  },
  subText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 5,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 5,
  },
  captureText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 15,
  },
  backText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  nutrientCard: {
    margin: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nutrientGrid: {
    marginBottom: 20,
  },
  nutrientItem: {
    marginBottom: 15,
  },
  nutrientValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  nutrientBar: {
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
    marginTop: 5,
  },
  vitaminsSection: {
    marginBottom: 15,
  },
  vitaminsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  vitaminTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vitaminTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  vitaminText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: 'bold',
  },
  benefitsSection: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  benefitsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  videoButton: {
    margin: 15,
    backgroundColor: '#FF5722',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoCard: {
    margin: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  videoDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  playButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  playText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FoodHackScreen;
