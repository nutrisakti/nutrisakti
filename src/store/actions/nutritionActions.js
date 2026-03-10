export const saveNutritionLog = (logData) => ({
  type: 'SAVE_NUTRITION_LOG',
  payload: logData,
});

export const saveRecipe = (recipeData) => ({
  type: 'SAVE_RECIPE',
  payload: recipeData,
});

export const setLoading = (isLoading) => ({
  type: 'SET_LOADING',
  payload: isLoading,
});
