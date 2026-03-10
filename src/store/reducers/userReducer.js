const initialState = {
  walletAddress: null,
  didHash: null,
  isRegistered: false,
  priorityLevel: 0,
  totalDisbursed: 0,
  bpjsStatus: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_WALLET':
      return {
        ...state,
        walletAddress: action.payload,
      };
    case 'SET_REGISTRATION':
      return {
        ...state,
        isRegistered: action.payload.isRegistered,
        didHash: action.payload.didHash,
      };
    case 'UPDATE_BPJS_STATUS':
      return {
        ...state,
        bpjsStatus: action.payload,
      };
    case 'UPDATE_USER_INFO':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
