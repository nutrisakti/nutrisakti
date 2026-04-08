import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import web3Service from './src/services/web3Service';
import { initializeModel } from './src/services/aiService';

// Screens
import TimelineDashboard from './src/screens/TimelineDashboard';
import FoodHackScreen from './src/screens/FoodHackScreen';
import KitRequestScreen from './src/screens/KitRequestScreen';
import HealthBookNFC from './src/screens/HealthBookNFC';

const Tab = createBottomTabNavigator();

const App = () => {
  useEffect(() => {
    const initServices = async () => {
      try {
        await web3Service.initialize();
        await initializeModel();
        console.log('NutriSakti Mother App initialized');
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
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: '#4CAF50',
              tabBarInactiveTintColor: '#999',
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
            }}
          >
            <Tab.Screen
              name="Timeline"
              component={TimelineDashboard}
              options={{
                title: 'My Journey',
                tabBarIcon: () => '🗓️',
              }}
            />
            <Tab.Screen
              name="FoodHack"
              component={FoodHackScreen}
              options={{
                title: 'Food Hack',
                tabBarIcon: () => '📸',
              }}
            />
            <Tab.Screen
              name="KitRequest"
              component={KitRequestScreen}
              options={{
                title: 'Request Kit',
                tabBarIcon: () => '🛒',
              }}
            />
            <Tab.Screen
              name="HealthBook"
              component={HealthBookNFC}
              options={{
                title: 'Health Book',
                tabBarIcon: () => '📖',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
