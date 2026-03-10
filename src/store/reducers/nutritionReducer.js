const initialState = {
  logs: [],
  recipes: [],
  loading: false,
};

const nutritionReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SAVE_NUTRITION_LOG':
      return {
        ...state,
        logs: [...state.logs, action.payload],
      };
    case 'SAVE_RECIPE':
      return {
        ...state,
        recipes: [...state.recipes, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export default nutritionReducer;
