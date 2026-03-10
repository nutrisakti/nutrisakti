# NutriSakti Changelog

## Version 2.0.0 - Updated Architecture (Based on PROMPT.v2)

### Major Changes

#### Terminology Updates
- **BPJS Oracle** → **BPJS Verification Bridge**
  - Emphasizes secure connection to government data
  - Better communicates the bridging function between off-chain and on-chain data

- **Nutrition Oracle** → **Bio-Data Validator**
  - Highlights verification of raw food materials
  - More descriptive of the validation process

- **Climate/Disaster Oracle** → **Emergency Signal Gateway**
  - Clearer terminology for disaster mitigation scenarios
  - Better conveys real-time alert functionality

- **Oracle Services** → **External Data Verifiers**
  - More accurate description of bringing off-chain data on-chain
  - Easier to understand for non-technical stakeholders

#### New Smart Contracts

1. **BGNQualityAuditor.sol**
   - Government food quality tracking system
   - Nutritional Balance Validator for BGN/SPPG programs
   - Provider performance ranking on-chain
   - Transparent audit trail for food quality
   - Automated alerts for poor-performing providers

2. **EmergencySignalGateway.sol**
   - Real-time disaster monitoring via BMKG API
   - Automatic priority elevation during emergencies
   - Regional emergency status tracking
   - Circuit breaker for instant aid distribution
   - Supports earthquakes, tsunamis, volcanic eruptions, floods, typhoons

3. **BPJSVerificationBridge.sol** (Renamed from BPJSOracle.sol)
   - Added automated health post alert system
   - Enhanced "Safety Net" functionality
   - Improved privacy protection with ZKP
   - Registered health post management

#### New Features

1. **BGN Food Quality Auditor Screen**
   - Mobile interface for logging government-provided food
   - Nutritional value input and validation
   - Quality rating system (0-100)
   - Real-time nutritional score calculation
   - Provider performance tracking

2. **Enhanced Disaster Response**
   - Automatic detection of disaster events
   - Priority Protocol activation for pregnant mothers
   - Zero-waiting time for emergency aid
   - Regional emergency status monitoring
   - Integration with Indonesian Meteorology Agency (BMKG)

3. **Improved BPJS Verification**
   - Automated alerts to health posts for uncovered mothers
   - Health post registration system
   - Enhanced protection alarm mechanism
   - Better tracking of verification status

#### Technical Improvements

1. **Architecture Documentation**
   - New TECHNICAL_ARCHITECTURE.md with detailed system diagrams
   - Layer-by-layer architecture explanation
   - Data flow examples for key scenarios
   - Security and scalability documentation

2. **Web3 Service Enhancements**
   - Support for all new smart contracts
   - BGN food logging functionality
   - Provider ranking queries
   - Emergency status checking
   - Improved error handling

3. **Mobile App Updates**
   - New FoodAuditScreen component
   - Updated HomeScreen with Food Audit feature
   - Enhanced navigation structure
   - Better offline support

#### Updated Documentation

- **TECHNICAL_STACK.md**: Updated with new terminology and components
- **README.md**: Reflects new External Data Verifiers terminology
- **DEPLOYMENT_GUIDE.md**: Updated deployment steps for new contracts
- **.env.example**: Added new contract address variables
- **PROJECT_STRUCTURE.md**: Updated with new files and components

### Migration Guide

#### For Developers

1. Update contract references:
   ```javascript
   // Old
   import BPJSOracleABI from './BPJSOracle.json';
   
   // New
   import BPJSVerificationBridgeABI from './BPJSVerificationBridge.json';
   ```

2. Update environment variables:
   ```bash
   # Add to .env
   BGN_QUALITY_AUDITOR_ADDRESS=0x...
   EMERGENCY_SIGNAL_GATEWAY_ADDRESS=0x...
   BPJS_VERIFICATION_BRIDGE_ADDRESS=0x...  # Renamed from BPJS_ORACLE_ADDRESS
   ```

3. Deploy new contracts:
   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network polygon
   ```

#### For Users

- No action required - all changes are backend
- New "Food Audit" feature available in app menu
- Enhanced disaster protection automatically active

### Breaking Changes

- `BPJS_ORACLE_ADDRESS` environment variable renamed to `BPJS_VERIFICATION_BRIDGE_ADDRESS`
- Contract ABI imports need to be updated
- Web3Service constructor updated with new contract instances

### Bug Fixes

- Improved error handling in Web3 service
- Better offline sync for nutrition logs
- Enhanced transaction retry logic

### Performance Improvements

- Optimized smart contract gas usage
- Faster food recognition inference
- Reduced app bundle size
- Improved IPFS content delivery

---

## Version 1.0.0 - Initial Release

### Features

- React Native mobile application
- Offline-first architecture
- TensorFlow Lite food recognition
- AI-powered recipe generation
- Blockchain-based milestone rewards
- BPJS insurance verification
- Maternal kit marketplace
- Digital health book
- WhatsApp integration for telemedicine

### Smart Contracts

- ImpactBounty.sol
- BPJSOracle.sol (now BPJSVerificationBridge.sol)

### Documentation

- README.md
- TECHNICAL_STACK.md
- DEPLOYMENT_GUIDE.md
- PROJECT_STRUCTURE.md

---

## Roadmap

### Version 2.1.0 (Planned)
- [ ] Enhanced AI video generation
- [ ] Multi-language support (Papuan languages)
- [ ] Community health worker dashboard
- [ ] Advanced analytics and reporting
- [ ] Integration with national health information system

### Version 3.0.0 (Future)
- [ ] Cross-border expansion (Papua New Guinea, Timor-Leste)
- [ ] Advanced ZKP implementations
- [ ] Decentralized governance (DAO)
- [ ] NFT-based health achievements
- [ ] Integration with other DPG platforms

---

**License:** MIT  
**Maintained by:** NutriSakti Development Team  
**Last Updated:** March 2026
