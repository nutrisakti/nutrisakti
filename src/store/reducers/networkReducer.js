const initialState = {
  isOffline: false,
  pendingSync: [],
};

const networkReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        isOffline: action.payload,
      };
    case 'ADD_PENDING_SYNC':
      return {
        ...state,
        pendingSync: [...state.pendingSync, action.payload],
      };
    case 'CLEAR_PENDING_SYNC':
      return {
        ...state,
        pendingSync: [],
      };
    default:
      return state;
  }
};

export default networkReducer;
