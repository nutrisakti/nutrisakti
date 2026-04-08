import AsyncStorage from '@react-native-async-storage/async-storage';
import { INDONESIAN_FOODS, SAMPLE_RECIPES } from '../data/mockData';

let model = null;

export const initializeModel = async () => {
  try {
    console.log('AI Model initialized (Mock Mode)');
    model = true; // Mock model loaded
  } catch (error) {
    console.error('Model init error:', error);
  }
};

export const recognizeFood = async (imagePath) => {
  try {
    if (!model) await initializeModel();

    // Simulate recognition with Indonesian foods
    const foodTypes = Object.keys(INDONESIAN_FOODS);
    const randomFood = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    const confidence = 0.85 + Math.random() * 0.1;

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

    return {
      ...INDONESIAN_FOODS[randomFood],
      confidence,
      rawClass: randomFood,
    };
  } catch (error) {
    console.error('Recognition error:', error);
    throw error;
  }
};

export const generateAICookingVideo = async (foodData) => {
  try {
    const cachedVideo = await AsyncStorage.getItem(`video_${foodData.rawClass}`);
    if (cachedVideo) {
      return JSON.parse(cachedVideo);
    }

    // Simulate AI video generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    const video = {
      url: `ipfs://QmVideo${foodData.rawClass}`,
      duration: 30,
      size: '2.5MB',
      format: 'h265',
      optimizedFor2G: true,
      recipe: SAMPLE_RECIPES[foodData.rawClass] || {
        title: `Resep ${foodData.name}`,
        titleEn: `${foodData.nameEn} Recipe`,
        ingredients: [`${foodData.name}`, 'Garam', 'Air'],
        ingredientsEn: [`${foodData.nameEn}`, 'Salt', 'Water'],
      },
    };

    await AsyncStorage.setItem(`video_${foodData.rawClass}`, JSON.stringify(video));
    return video;
  } catch (error) {
    console.error('Video generation error:', error);
    throw error;
  }
};
