import * as tf from '@tensorflow/tfjs-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local food database for Eastern Indonesia
const LOCAL_FOODS = {
  moringa: { name: 'Moringa (Kelor)', protein: 9.4, carbs: 8.3, vitamins: ['A', 'C', 'E', 'K'] },
  cassava: { name: 'Cassava (Singkong)', protein: 1.4, carbs: 38.1, vitamins: ['C', 'B6'] },
  sweetPotato: { name: 'Sweet Potato (Ubi Jalar)', protein: 1.6, carbs: 20.1, vitamins: ['A', 'C'] },
  papaya: { name: 'Papaya (Pepaya)', protein: 0.5, carbs: 11, vitamins: ['C', 'A', 'E'] },
  taro: { name: 'Taro (Talas)', protein: 1.5, carbs: 26.5, vitamins: ['B6', 'E'] },
};

let model = null;

export const initializeModel = async () => {
  try {
    await tf.ready();
    // Load pre-trained TensorFlow Lite model
    model = await tf.loadLayersModel('file://models/food_recognition.json');
    console.log('AI Model loaded successfully');
  } catch (error) {
    console.error('Model initialization error:', error);
  }
};

export const recognizeFood = async (imagePath) => {
  try {
    if (!model) {
      await initializeModel();
    }

    // Preprocess image
    const imageData = await preprocessImage(imagePath);
    
    // Run inference
    const predictions = await model.predict(imageData);
    const topPrediction = await getTopPrediction(predictions);
    
    // Match with local food database
    const foodInfo = LOCAL_FOODS[topPrediction.class] || {
      name: topPrediction.class,
      protein: 0,
      carbs: 0,
      vitamins: [],
    };

    return {
      name: foodInfo.name,
      confidence: topPrediction.confidence,
      nutrition: {
        protein: foodInfo.protein,
        carbs: foodInfo.carbs,
        vitamins: foodInfo.vitamins,
      },
      rawClass: topPrediction.class,
    };
  } catch (error) {
    console.error('Recognition error:', error);
    throw error;
  }
};

export const generateRecipe = async (foodData) => {
  try {
    const cachedRecipe = await AsyncStorage.getItem(`recipe_${foodData.rawClass}`);
    if (cachedRecipe) {
      return JSON.parse(cachedRecipe);
    }

    const prompt = `Create a nutritious recipe for pregnant mothers using ${foodData.name}. 
    Focus on traditional Indonesian cooking methods suitable for Eastern Indonesia. 
    Include health benefits for maternal and infant health.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a maternal nutrition expert specializing in Indonesian cuisine.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const recipeText = response.data.choices[0].message.content;
    const recipe = parseRecipeResponse(recipeText, foodData);
    
    await AsyncStorage.setItem(`recipe_${foodData.rawClass}`, JSON.stringify(recipe));
    
    return recipe;
  } catch (error) {
    console.error('Recipe generation error:', error);
    return getFallbackRecipe(foodData);
  }
};

const preprocessImage = async (imagePath) => {
  // Placeholder for image preprocessing
  // In production, use react-native-fs to read image and convert to tensor
  const imageTensor = tf.zeros([1, 224, 224, 3]);
  return imageTensor;
};

const getTopPrediction = async (predictions) => {
  const data = await predictions.data();
  const maxIndex = data.indexOf(Math.max(...data));
  
  const classes = ['moringa', 'cassava', 'sweetPotato', 'papaya', 'taro'];
  
  return {
    class: classes[maxIndex] || 'unknown',
    confidence: data[maxIndex],
  };
};

const parseRecipeResponse = (text, foodData) => {
  return {
    title: `Nutritious ${foodData.name} Recipe`,
    ingredients: [
      `500g ${foodData.name}`,
      '2 cloves garlic',
      '1 onion',
      'Salt to taste',
      'Coconut oil',
    ],
    instructions: [
      'Wash and prepare the ingredients',
      'Heat coconut oil in a pan',
      'Sauté garlic and onion until fragrant',
      'Add main ingredient and cook until tender',
      'Season with salt and serve warm',
    ],
    healthBenefits: `Rich in ${foodData.nutrition.vitamins.join(', ')} vitamins. Excellent for maternal health and fetal development.`,
    videoUrl: null,
  };
};

const getFallbackRecipe = (foodData) => {
  return {
    title: `Simple ${foodData.name} Dish`,
    ingredients: [`${foodData.name}`, 'Salt', 'Water'],
    instructions: ['Boil until cooked', 'Season and serve'],
    healthBenefits: 'Nutritious for pregnancy',
    videoUrl: null,
  };
};
