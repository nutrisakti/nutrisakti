# NutriSakti: Technical Architecture Diagram

## System Overview

NutriSakti is built on a multi-layered architecture designed for resilience, privacy, and scalability in low-connectivity environments.

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                         │
│  React Native + Expo (Offline-First Mobile Application)         │
│  • Visual Nutrition Scanner  • Health Book  • Marketplace        │
│  • BGN Quality Auditor  • Profile & BPJS Verification           │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   LOCAL STORAGE LAYER                            │
│  Redux Persist + WatermelonDB (Offline-First Architecture)      │
│  • Nutrition Logs  • Health Records  • Pending Transactions     │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   AI/ML PROCESSING LAYER                         │
│  ┌──────────────────┐  ┌────────────────────────────────────┐  │
│  │ TensorFlow Lite  │  │  Generative AI (OpenAI/Gemini)     │  │
│  │ (On-Device)      │  │  (Cloud-Based, Cached Locally)     │  │
│  │ • Food Recognition│  │  • Recipe Generation               │  │
│  │ • 50+ Ingredients │  │  • Cooking Video Templates         │  │
│  └──────────────────┘  └────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   WEB3 INTEGRATION LAYER                         │
│  Ethers.js + Polygon RPC Provider                               │
│  • Wallet Management  • Transaction Signing  • Event Listening  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER (Polygon PoS)                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SMART CONTRACTS                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  ImpactBounty.sol                                   │  │  │
│  │  │  • Milestone-based USDC disbursement                │  │  │
│  │  │  • Maternal kit marketplace                         │  │  │
│  │  │  • Disaster mode & priority elevation               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  BPJSVerificationBridge.sol                         │  │  │
│  │  │  • Zero-knowledge proof verification                │  │  │
│  │  │  • Health insurance status checking                 │  │  │
│  │  │  • Automated health post alerts                     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  BGNQualityAuditor.sol                              │  │  │
│  │  │  • Government food quality tracking                 │  │  │
│  │  │  • Provider performance ranking                     │  │  │
│  │  │  • Nutritional standard validation                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  EmergencySignalGateway.sol                         │  │  │
│  │  │  • Disaster event monitoring                        │  │  │
│  │  │  • Priority protocol activation                     │  │  │
│  │  │  • Regional emergency status                        │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│              EXTERNAL DATA VERIFIERS (Chainlink)                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ BPJS Verification│  │ BMKG Weather API │  │ Bio-Data     │  │
│  │ Bridge           │  │ (Disaster Data)  │  │ Validator    │  │
│  │ • Gov Database   │  │ • Earthquakes    │  │ • Nutrition  │  │
│  │ • ZKP Validation │  │ • Tsunamis       │  │ • Standards  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   DECENTRALIZED STORAGE                          │
│  IPFS (InterPlanetary File System)                              │
│  • AI-generated cooking videos                                  │
│  • Health record backups (encrypted)                            │
│  • Recipe templates                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   COMMUNICATION LAYER                            │
│  Twilio WhatsApp Business API                                   │
│  • Midwife consultations                                        │
│  • Doctor telemedicine                                          │
│  • Emergency notifications                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Descriptions

### 1. User Interface Layer
**Technology:** React Native + Expo  
**Purpose:** Cross-platform mobile application optimized for offline use

**Key Features:**
- Visual Nutrition Scanner: Camera-based food recognition
- Health Book: Digital health records
- Marketplace: Maternal kit procurement
- BGN Quality Auditor: Government food quality logging
- Profile: BPJS verification and blockchain identity

**Offline Capability:** Full functionality without internet connection

---

### 2. Local Storage Layer
**Technology:** Redux Persist + WatermelonDB  
**Purpose:** Offline-first data persistence

**Stored Data:**
- Nutrition logs and recipes
- Health records (vaccinations, growth charts)
- Pending blockchain transactions
- User preferences and settings

**Sync Strategy:** Automatic synchronization when connectivity is restored

---

### 3. AI/ML Processing Layer

#### On-Device Processing (TensorFlow Lite)
- Food recognition model (MobileNetV3)
- 50+ Indonesian ingredients
- <500ms inference time
- No internet required

#### Cloud-Based Processing (OpenAI/Gemini)
- Recipe generation from recognized ingredients
- Cooking video template creation
- Nutritional advice generation
- Results cached locally for offline access

---

### 4. Web3 Integration Layer
**Technology:** Ethers.js + Polygon RPC  
**Purpose:** Blockchain interaction and wallet management

**Functions:**
- Wallet creation and management
- Transaction signing and submission
- Smart contract interaction
- Event listening and processing
- Gas optimization

---

### 5. Blockchain Layer (Polygon PoS)

#### ImpactBounty Contract
- Milestone-based USDC rewards
- Maternal kit marketplace with escrow
- Disaster mode activation
- Priority elevation for emergencies

#### BPJSVerificationBridge Contract
- Zero-knowledge proof verification
- BPJS insurance status checking
- Automated alerts to health posts
- Privacy-preserving data handling

#### BGNQualityAuditor Contract
- Government food quality tracking
- Provider performance ranking
- Nutritional standard validation
- On-chain audit trail

#### EmergencySignalGateway Contract
- Real-time disaster monitoring
- Priority protocol activation
- Regional emergency status
- Automated aid distribution

---

### 6. External Data Verifiers (Chainlink)

#### BPJS Verification Bridge
- Connects to government BPJS database
- Validates insurance status via ZKP
- No PII exposed on-chain

#### Emergency Signal Gateway (BMKG Integration)
- Indonesian Meteorology Agency data
- Earthquake, tsunami, volcanic alerts
- Automated disaster response

#### Bio-Data Validator
- Nutritional standard verification
- Food quality assessment
- Provider performance validation

---

### 7. Decentralized Storage (IPFS)
**Purpose:** Censorship-resistant, permanent storage

**Stored Content:**
- AI-generated cooking videos (compressed)
- Health record backups (encrypted)
- Recipe templates
- Educational materials

**Benefits:**
- No single point of failure
- Permanent availability
- Reduced bandwidth costs

---

### 8. Communication Layer
**Technology:** Twilio WhatsApp Business API  
**Purpose:** Telemedicine and emergency communication

**Features:**
- 1-on-1 midwife consultations
- Doctor video calls
- Emergency notifications
- Health reminders
- Community support groups

---

## Data Flow Examples

### Example 1: Food Recognition & Recipe Generation

```
1. Mother captures photo of Moringa leaves
   ↓
2. TensorFlow Lite processes image on-device
   ↓
3. Ingredient identified: "Moringa (Kelor)" - 92% confidence
   ↓
4. Check local cache for recipe
   ↓
5. If not cached, call OpenAI API for recipe generation
   ↓
6. Recipe generated and cached locally
   ↓
7. Cooking video template retrieved from IPFS
   ↓
8. Nutrition log saved to WatermelonDB
   ↓
9. When online, sync to blockchain (optional)
```

### Example 2: BPJS Verification with ZKP

```
1. Mother initiates BPJS verification
   ↓
2. Generate zero-knowledge proof locally
   ↓
3. Submit proof hash to BPJSVerificationBridge
   ↓
4. Chainlink oracle queries BPJS database
   ↓
5. Verification result returned (covered/not covered)
   ↓
6. If not covered, automated alert sent to health posts
   ↓
7. Result stored on-chain (no PII exposed)
   ↓
8. Mother notified of status
```

### Example 3: Disaster Response Protocol

```
1. BMKG detects earthquake (magnitude 6.5)
   ↓
2. EmergencySignalGateway receives alert via Chainlink
   ↓
3. Disaster event recorded on-chain
   ↓
4. Regional emergency status activated
   ↓
5. ImpactBounty contract enters disaster mode
   ↓
6. All pregnant mothers in region elevated to Priority Level 2
   ↓
7. Emergency USDC funds unlocked
   ↓
8. Maternal kit requests fast-tracked
   ↓
9. Aid agencies notified with priority list
```

### Example 4: BGN Food Quality Audit

```
1. Mother receives government-provided rice
   ↓
2. Opens BGN Quality Auditor screen
   ↓
3. Logs food type, quantity, and nutritional values
   ↓
4. Rates overall quality (0-100)
   ↓
5. BGNQualityAuditor contract calculates nutritional score
   ↓
6. Compares against standards, identifies deficiencies
   ↓
7. Provider rating updated on-chain
   ↓
8. If provider rating drops below 60%, alert triggered
   ↓
9. Government can audit provider performance
```

---

## Security Architecture

### Privacy Protection
- **Zero-Knowledge Proofs:** Medical data verified without exposure
- **Local Encryption:** AES-256 for sensitive data
- **Decentralized Identity:** W3C DID standards
- **No PII on-chain:** Only hashes and proofs stored

### Smart Contract Security
- **OpenZeppelin Libraries:** Industry-standard security
- **Reentrancy Guards:** Protection against attacks
- **Access Control:** Role-based permissions
- **Audit Trail:** Immutable transaction history

### Network Security
- **HTTPS Only:** All API communications encrypted
- **Rate Limiting:** Protection against abuse
- **Input Validation:** Sanitization of all user inputs
- **Secure Key Storage:** Hardware-backed keystores

---

## Scalability Strategy

### Current Capacity
- 100,000 concurrent users
- 10,000 TPS (Polygon capacity)
- Unlimited storage (IPFS)
- 50 AI inferences/second per device

### Scaling Plan
- **Horizontal Scaling:** Kubernetes orchestration
- **Layer 2 Optimization:** Polygon zkEVM migration
- **CDN Integration:** CloudFlare for static assets
- **Database Sharding:** PostgreSQL partitioning

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile | React Native + Expo | Cross-platform UI |
| State | Redux + Redux Persist | Offline-first state management |
| Database | WatermelonDB | Local offline database |
| Blockchain | Polygon PoS | Low-cost, fast transactions |
| Smart Contracts | Solidity 0.8.20 | Business logic |
| Privacy | Circom/SnarkJS | Zero-knowledge proofs |
| Oracles | Chainlink Any-API | External data verification |
| AI Vision | TensorFlow Lite | On-device food recognition |
| AI Generative | OpenAI GPT-4 | Recipe generation |
| Storage | IPFS | Decentralized file storage |
| Communication | Twilio WhatsApp API | Telemedicine |
| Payments | USDC (Circle) | Stablecoin disbursement |

---

## Deployment Architecture

### Production Environment
- **Mobile App:** Google Play Store + Apple App Store
- **Smart Contracts:** Polygon Mainnet
- **Backend API:** AWS ECS (Fargate)
- **Database:** AWS RDS (PostgreSQL)
- **IPFS:** Pinata Cloud
- **Monitoring:** DataDog + Sentry

### Development Environment
- **Mobile App:** Expo Go
- **Smart Contracts:** Polygon Mumbai Testnet
- **Backend API:** Local Docker
- **Database:** Local PostgreSQL
- **IPFS:** Local IPFS node

---

## License & Open Source

**License:** MIT (Open Source)  
**Repository:** Public GitHub  
**Contributions:** Community-driven  
**Standards:** UNICEF Digital Public Goods

---

This architecture ensures NutriSakti can operate effectively in low-connectivity regions while maintaining security, privacy, and scalability for national deployment.
