import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  user: {
    did: null,
    name: null,
    phase: 'pregnancy',
    daysInJourney: 0,
  },
  health: {
    records: [],
    milestones: [],
  },
  nutrition: {
    logs: [],
    recipes: [],
  },
  network: {
    isOffline: false,
    pendingSync: [],
  },
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'ADD_HEALTH_RECORD':
      return {
        ...state,
        health: {
          ...state.health,
          records: [...state.health.records, action.payload],
        },
      };
    case 'ADD_NUTRITION_LOG':
      return {
        ...state,
        nutrition: {
          ...state.nutrition,
          logs: [...state.nutrition.logs, action.payload],
        },
      };
    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        network: { ...state.network, isOffline: action.payload },
      };
    default:
      return state;
  }
};

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'health', 'nutrition'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
