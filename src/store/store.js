import { createStore, applyMiddleware, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';

// Reducers
import nutritionReducer from './reducers/nutritionReducer';
import userReducer from './reducers/userReducer';
import networkReducer from './reducers/networkReducer';
import healthReducer from './reducers/healthReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['nutrition', 'user', 'health'], // Only persist these reducers
};

const rootReducer = combineReducers({
  nutrition: nutritionReducer,
  user: userReducer,
  network: networkReducer,
  health: healthReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(
  persistedReducer,
  applyMiddleware(thunk)
);

export const persistor = persistStore(store);
