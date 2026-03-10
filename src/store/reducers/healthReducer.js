const initialState = {
  milestones: [],
  vaccinations: [],
  growthRecords: [],
  kitRequests: [],
};

const healthReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_MILESTONE':
      return {
        ...state,
        milestones: [...state.milestones, action.payload],
      };
    case 'ADD_VACCINATION':
      return {
        ...state,
        vaccinations: [...state.vaccinations, action.payload],
      };
    case 'ADD_GROWTH_RECORD':
      return {
        ...state,
        growthRecords: [...state.growthRecords, action.payload],
      };
    case 'ADD_KIT_REQUEST':
      return {
        ...state,
        kitRequests: [...state.kitRequests, action.payload],
      };
    default:
      return state;
  }
};

export default healthReducer;
