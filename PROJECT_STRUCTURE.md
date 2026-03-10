# NutriSakti Project Structure

```
nutrisakti/
├── blockchain/                          # Smart contracts & deployment
│   ├── contracts/
│   │   ├── ImpactBounty.sol            # Main bounty/disbursement contract
│   │   └── BPJSOracle.sol              # BPJS verification oracle
│   ├── scripts/
│   │   └── deploy.js                   # Deployment script for Polygon
│   ├── hardhat.config.js               # Hardhat configuration
│   └── package.json                    # Blockchain dependencies
│
├── src/                                 # React Native application
│   ├── screens/
│   │   ├── HomeScreen.js               # Main dashboard
│   │   ├── VisualNutritionScreen.js    # AI food scanner
│   │   ├── HealthBookScreen.js         # Digital health records
│   │   ├── MarketplaceScreen.js        # Kit request interface
│   │   └── ProfileScreen.js            # User profile & blockchain info
│   │
│   ├── services/
│   │   ├── web3Service.js              # Blockchain interaction layer
│   │   └── aiService.js                # TensorFlow Lite & AI integration
│   │
│   └── store/                          # Redux state management
│       ├── store.js                    # Store configuration
│       ├── actions/
│       │   └── nutritionActions.js
│       └── reducers/
│           ├── nutritionReducer.js
│           ├── userReducer.js
│           ├── networkReducer.js
│           └── healthReducer.js
│
├── App.js                              # Main app entry point
├── package.json                        # React Native dependencies
├── .env.example                        # Environment variables template
├── TECHNICAL_STACK.md                  # Complete technical documentation
├── README.md                           # Project overview
├── CHECKLIST.md                        # Feature checklist
└── PROMPT.md                           # Original requirements
```

## Key Components

### Blockchain Layer
- **ImpactBounty.sol**: Handles milestone-based USDC disbursements, kit requests, and disaster mode
- **BPJSOracle.sol**: Privacy-preserving insurance verification using Chainlink

### Mobile App
- **Offline-First**: Redux Persist + WatermelonDB for full functionality without internet
- **AI Vision**: TensorFlow Lite for on-device food recognition
- **Web3 Integration**: Ethers.js for blockchain interactions

### State Management
- Redux for global state
- Persistent storage for offline capability
- Network status tracking for sync operations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   cd blockchain && npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. Deploy smart contracts:
   ```bash
   cd blockchain
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network polygonMumbai
   ```

4. Run mobile app:
   ```bash
   npm run android  # or npm run ios
   ```

## Technology Stack

- **Frontend**: React Native 0.73
- **Blockchain**: Solidity 0.8.20, Polygon L2
- **AI/ML**: TensorFlow Lite, OpenAI GPT-4
- **State**: Redux + Redux Persist
- **Database**: WatermelonDB (offline), PostgreSQL (backend)
- **Storage**: IPFS for decentralized assets
- **Oracles**: Chainlink Any-API
- **Payments**: USDC (Circle)

## License

MIT License - Open Source Digital Public Good
