# NutriSakti v3.0 - Multi-User Ecosystem Prototypes

## Overview

Based on PROMPT.v3.md, this folder contains 5 separate prototypes for different user personas in the NutriSakti ecosystem.

## Prototype Structure

```
prototypes/
├── mother-app/                    # Guardian Interface for Mothers
├── healthcare-provider-portal/    # Verifiable Care Portal
├── social-worker-tool/            # Last-Mile Audit Tool
├── government-dashboard/          # Impact Dashboard
└── hospital-system/               # Supply Chain & Data Hub
```

---

## 1. Mother App (Guardian Interface)

**Target Users:** Pregnant mothers and mothers with infants/toddlers

### Key Features

#### Timeline Dashboard
- First 1,000 Days journey visualization
- Current phase indicator (Pregnancy/Infant/Toddler)
- Days counter and progress tracking
- Upcoming milestones display
- Quick action buttons

**File:** `mother-app/src/screens/TimelineDashboard.js`

#### Food Hack (AI Vision)
- Camera interface for raw material recognition
- TensorFlow Lite on-device processing
- Nutrient Density Card with detailed analysis
- AI Cooking Video generation button
- 30-second low-bandwidth videos optimized for 2G
- Offline-first with local caching

**File:** `mother-app/src/screens/FoodHackScreen.js`

#### 1-Click Kit Request
- DID (Decentralized ID) automatic verification
- Eligibility checking based on health timeline
- Four kit types: Prenatal, Delivery, Newborn, Nutrition
- Blockchain marketplace integration
- USDC escrow payment system

**File:** `mother-app/src/screens/KitRequestScreen.js`

#### Health Book with NFC
- Offline-first immunization and checkup log
- NFC Card Emulation mode
- Tap phone at Posyandu to update records
- Healthcare provider signature verification
- Automatic on-chain sync
- Privacy-protected with local encryption

**File:** `mother-app/src/screens/HealthBookNFC.js`

### Technology Stack
- React Native 0.73
- NFC Manager for card emulation
- TensorFlow Lite for food recognition
- WatermelonDB for offline storage
- Ethers.js for blockchain interaction

---

## 2. Healthcare Provider Portal (Verifiable Care)

**Target Users:** Midwives, doctors, nurses, Posyandu staff

### Key Features

#### Verification Dashboard
- List of assigned mothers by region
- Search and filter functionality
- BPJS status indicators
- Priority level badges
- Quick stats overview

**File:** `healthcare-provider-portal/src/screens/VerificationDashboard.js`

#### Milestone Recording
- Sign with Private Key function
- Record vaccinations, checkups, growth measurements
- Blockchain verification
- Tamper-proof record creation
- Automatic mother notification

**File:** `healthcare-provider-portal/src/screens/MilestoneRecording.js`

#### BPJS Bridge Scanner
- QR code scanning for mother's DID
- Instant BPJS Verification Bridge status check
- Red alert for uncovered mothers
- "Help Enroll" workflow integration
- Direct link to BPJS enrollment system

**File:** `healthcare-provider-portal/src/screens/BPJSScanner.js`

#### Tele-Consultation Integration
- WhatsApp Business API Bridge
- Automated alerts for high-risk mothers
- Food Hack log analysis
- Anemia and malnutrition detection
- Direct messaging with mothers

**File:** `healthcare-provider-portal/src/screens/TeleConsultation.js`

### Technology Stack
- React Native (mobile) or React (web)
- QR Code Scanner
- Crypto wallet integration for signing
- WhatsApp Business API
- Push notifications

---

## 3. Social Worker Tool (Last-Mile Audit)

**Target Users:** Social workers, community health workers, field auditors

### Key Features

#### BGN Quality Audit Tool
- Photo capture of distributed food
- Quality Points logging system
- Nutritional assessment
- BGN Quality Auditor Smart Contract integration
- Provider ranking system

**File:** `social-worker-tool/src/screens/QualityAuditTool.js`

#### Emergency Signal Gateway Map
- Disaster Mode activation display
- Map of High-Priority Mothers
- ZKP-flagged mothers for privacy
- Evacuation priority list
- Emergency kit distribution tracking

**File:** `social-worker-tool/src/screens/EmergencyMap.js`

#### Bounty Wallet
- USDC rewards for verified deliveries
- Remote area delivery confirmation
- GPS verification
- NFC proof of delivery
- Earnings history and withdrawal

**File:** `social-worker-tool/src/screens/BountyWallet.js`

### Technology Stack
- React Native
- GPS/Location services
- Camera for food quality photos
- NFC for delivery verification
- Crypto wallet for USDC rewards
- Mapping library (React Native Maps)

---

## 4. Government/NGO Dashboard (Impact Dashboard)

**Target Users:** Government officials, NGO program managers, donors

### Key Features

#### On-Chain Audit Trail
- Real-time visualization map of Eastern Indonesia
- Stunting risk clusters (anonymized data)
- Maternal Kit distribution efficiency
- BPJS coverage rates by village
- Fund flow transparency

**File:** `government-dashboard/src/screens/AuditTrailMap.js`

#### Fund Management Interface
- USDC deposit to Stunting-Free Bounty pool
- Social Return on Investment (SROI) calculator
- Kits delivered vs. stunting markers reduced
- Budget allocation by region
- Impact metrics dashboard

**File:** `government-dashboard/src/screens/FundManagement.js`

#### Analytics & Reporting
- Customizable date ranges
- Export to PDF/Excel
- Comparative analysis by region
- Trend visualization
- Predictive analytics

**File:** `government-dashboard/src/screens/Analytics.js`

### Technology Stack
- React (web application)
- D3.js or Chart.js for visualizations
- Leaflet or Mapbox for mapping
- Ethers.js for blockchain data
- Export libraries for reports

---

## 5. Hospital/Puskesmas System (Clinical Facility)

**Target Users:** Hospital administrators, Puskesmas staff, inventory managers

### Key Features

#### Inventory Management
- Maternal-Baby Kit stock ledger
- Real-time inventory tracking
- Proof of Delivery scan integration
- Automatic stock updates
- NGO/Government replenishment notifications
- Low stock alerts

**File:** `hospital-system/src/screens/InventoryManagement.js`

#### Medical Record Sync
- Secure bridge to sync Digital Health Book
- Zero-Knowledge Proofs for patient confidentiality
- Doctor access with patient consent
- Complete health history view
- Offline sync capability
- HIPAA/Indonesian data protection compliance

**File:** `hospital-system/src/screens/MedicalRecordSync.js`

#### Supply Chain Tracking
- Kit delivery tracking
- Vendor performance monitoring
- Quality assurance checks
- Expiration date management
- Distribution analytics

**File:** `hospital-system/src/screens/SupplyChain.js`

### Technology Stack
- React (web) or React Native (tablet)
- QR/Barcode scanner
- ZKP libraries for privacy
- Database sync (PostgreSQL)
- Blockchain integration

---

## Closed-Loop Accountability System

### Data Flow

```
Mother → Healthcare Provider → Hospital → Government → NGO → Social Worker → Mother
   ↓           ↓                  ↓           ↓          ↓          ↓          ↓
   └───────────┴──────────────────┴───────────┴──────────┴──────────┴──────────┘
                            Blockchain (Immutable Audit Trail)
```

### Accountability Points

1. **Mother** gets food and protection
   - Food Hack for nutrition
   - Kit requests fulfilled
   - Health records secured

2. **Healthcare Provider** gets tamper-proof work record
   - Milestone verification on-chain
   - Professional reputation building
   - Performance tracking

3. **Social Worker** ensures food quality
   - BGN audit creates transparency
   - Provider rankings prevent corruption
   - Bounty rewards incentivize remote work

4. **Government** gets 100% transparency
   - Real-time fund tracking
   - Impact metrics
   - Zero aid diversion

5. **Hospital** ensures supply chain integrity
   - Inventory never breaks
   - Automatic replenishment
   - Quality assurance

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- React Native CLI (for mobile apps)
- Android Studio / Xcode
- Polygon wallet with MATIC

### Setup Each Prototype

```bash
# Mother App
cd prototypes/mother-app
npm install
npm run android  # or npm run ios

# Healthcare Provider Portal
cd prototypes/healthcare-provider-portal
npm install
npm start

# Social Worker Tool
cd prototypes/social-worker-tool
npm install
npm run android

# Government Dashboard
cd prototypes/government-dashboard
npm install
npm start

# Hospital System
cd prototypes/hospital-system
npm install
npm start
```

### Environment Variables

Each prototype needs a `.env` file:

```bash
# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key

# Contracts
IMPACT_BOUNTY_ADDRESS=0x...
BPJS_VERIFICATION_BRIDGE_ADDRESS=0x...
BGN_QUALITY_AUDITOR_ADDRESS=0x...
EMERGENCY_SIGNAL_GATEWAY_ADDRESS=0x...

# APIs
OPENAI_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

---

## Testing Scenarios

### Scenario 1: Complete Mother Journey
1. Mother opens app, sees Timeline Dashboard
2. Takes photo of Moringa leaves (Food Hack)
3. Receives nutrient analysis and AI cooking video
4. Requests Prenatal Care Kit (1-click)
5. Visits Posyandu, taps phone for vaccination record
6. Record synced to blockchain automatically

### Scenario 2: Healthcare Provider Workflow
1. Provider logs in, sees assigned mothers
2. Scans mother's QR code, checks BPJS status
3. Mother is uncovered - red alert shown
4. Provider initiates "Help Enroll" workflow
5. Performs vaccination, signs with private key
6. Milestone recorded on-chain

### Scenario 3: Social Worker Audit
1. Social worker visits BGN food distribution
2. Takes photo of rice quality
3. Logs quality points (65/100)
4. Data sent to BGN Quality Auditor contract
5. Provider ranking drops, alert triggered
6. Social worker receives USDC bounty for audit

### Scenario 4: Government Monitoring
1. Official opens Impact Dashboard
2. Views map of Eastern Indonesia
3. Sees stunting risk cluster in NTT
4. Allocates additional USDC to region
5. Tracks kit distribution efficiency
6. Exports report for stakeholders

### Scenario 5: Hospital Supply Chain
1. Mother arrives at hospital
2. Staff scans kit barcode
3. Inventory automatically updated
4. Low stock alert triggered
5. Replenishment request sent to NGO
6. Medical records synced via ZKP

---

## Security & Privacy

### Data Protection
- **Zero-Knowledge Proofs** for sensitive medical data
- **Local encryption** (AES-256) for offline storage
- **Decentralized Identity** (W3C DID) for mothers
- **Private key signing** for healthcare providers
- **Role-based access control** for all users

### Blockchain Security
- **Smart contract audits** before deployment
- **Multi-sig wallets** for fund management
- **Reentrancy guards** on all contracts
- **Access control** for admin functions

---

## Deployment

### Mobile Apps (Mother, Healthcare Provider, Social Worker)
- Build release APK/IPA
- Submit to Google Play / App Store
- Enable auto-updates

### Web Apps (Government, Hospital)
- Deploy to AWS/Vercel/Netlify
- Configure CDN
- Enable HTTPS
- Set up monitoring

### Smart Contracts
- Deploy to Polygon mainnet
- Verify on PolygonScan
- Fund with USDC and LINK
- Configure oracles

---

## License

MIT License - Open Source Digital Public Good

---

## Support

- Documentation: https://docs.nutrisakti.org
- GitHub: https://github.com/nutrisakti
- Discord: https://discord.gg/nutrisakti
- Email: support@nutrisakti.org

---

**Status:** Prototype Ready for UNICEF Venture Fund Submission  
**Version:** 3.0.0  
**Last Updated:** March 2026
