import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import web3Service from './src/services/web3Service';
import { initializeModel } from './src/services/aiService';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import VisualNutritionScreen from './src/screens/VisualNutritionScreen';
import HealthBookScreen from './src/screens/HealthBookScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import FoodAuditScreen from './src/screens/FoodAuditScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // Initialize services
    const initServices = async () => {
      try {
        await web3Service.initialize();
        await initializeModel();
        console.log('NutriSakti initialized successfully');
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initServices();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'NutriSakti' }}
            />
            <Stack.Screen 
              name="VisualNutrition" 
              component={VisualNutritionScreen}
              options={{ title: 'Food Scanner' }}
            />
            <Stack.Screen 
              name="HealthBook" 
              component={HealthBookScreen}
              options={{ title: 'Digital Health Book' }}
            />
            <Stack.Screen 
              name="Marketplace" 
              component={MarketplaceScreen}
              options={{ title: 'Maternal Kit Marketplace' }}
            />
            <Stack.Screen 
              name="FoodAudit" 
              component={FoodAuditScreen}
              options={{ title: 'BGN Quality Auditor' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'My Profile' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
