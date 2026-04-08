# Running NutriSakti Prototypes - Complete Guide

## Understanding the Prototypes

These prototypes are **code demonstrations** that show:
- ✅ Complete UI screens and navigation
- ✅ Business logic and data flow
- ✅ Indonesian mock data integration
- ✅ Service architecture (web3, AI)
- ✅ Production-ready code structure

They are **NOT** complete mobile apps with native project files (android/, ios/ folders).

---

## Quick Decision Guide

### Want to see it working NOW?
→ **Run the web apps** (Government Dashboard, Hospital System)

### Want to demo mobile apps quickly?
→ **Use Expo** (5 minutes setup)

### Want full native Android/iOS apps?
→ **Use our initialization script** (15 minutes setup)

### Just want to review the code?
→ **Open in VS Code** (0 minutes setup)

---

## Option 1: Run Web Apps (Immediate) ✅

The Government Dashboard and Hospital System work immediately:

```bash
# Government Dashboard
cd prototypes/government-dashboard
npm start
# Opens at http://localhost:3000

# Hospital System
cd prototypes/hospital-system
npm start
# Opens at http://localhost:3000
```

**What you'll see:**
- Interactive maps of Eastern Indonesia
- Stunting risk visualization
- Fund management dashboard
- Inventory tracking
- Medical record sync interface

---

## Option 2: Run Mobile Apps with Expo (Quick) ⚡

Expo lets you run React Native apps without native project files.

### Setup (One Time)

```bash
# Install Expo CLI
npm install -g expo-cli

# Or use npx (no installation needed)
```

### Run Any Mobile Prototype

```bash
# Mother App
cd prototypes/mother-app
npx expo start

# Healthcare Provider Portal
cd prototypes/healthcare-provider-portal
npx expo start

# Social Worker Tool
cd prototypes/social-worker-tool
npx expo start
```

### View on Your Phone

1. Install "Expo Go" app from Play Store or App Store
2. Scan the QR code shown in terminal
3. App loads on your phone

**What you'll see:**
- Timeline Dashboard with Indonesian content
- Food Hack screen (simulated camera)
- Kit Request interface
- Health Book with NFC simulation
- All screens with Indonesian language

---

## Option 3: Initialize Full React Native Project (Complete) 🔧

Use our automated script to create a complete React Native project:

### macOS/Linux

```bash
cd prototypes

# Initialize Mother App
./init-react-native.sh mother-app

# Or Healthcare Provider Portal
./init-react-native.sh healthcare-provider-portal

# Or Social Worker Tool
./init-react-native.sh social-worker-tool
```

### Windows

```cmd
cd prototypes

# Initialize Mother App
init-react-native.bat mother-app

# Or Healthcare Provider Portal
init-react-native.bat healthcare-provider-portal

# Or Social Worker Tool
init-react-native.bat social-worker-tool
```

### What the Script Does

1. Creates new React Native project with android/ and ios/ folders
2. Copies all prototype code (screens, services, data)
3. Installs all dependencies
4. Ready to run on devices

### Run the Initialized Project

```bash
cd NutriSaktiMother  # or NutriSaktiProvider, NutriSaktiSocialWorker

# Start Metro bundler
npm start

# In another terminal:
npm run android  # For Android
npm run ios      # For iOS (macOS only)
```

---

## Option 4: Review Code (No Running) 📖

Just want to see the code and architecture?

### Open in VS Code

```bash
code prototypes/mother-app
code prototypes/healthcare-provider-portal
code prototypes/social-worker-tool
```

### Key Files to Review

**Mother App:**
```
mother-app/
├── App.js                          # Main app entry
├── src/
│   ├── screens/
│   │   ├── TimelineDashboard.js    # 1000 days journey
│   │   ├── FoodHackScreen.js       # Food recognition
│   │   ├── KitRequestScreen.js     # Kit marketplace
│   │   └── HealthBookNFC.js        # Digital health book
│   ├── services/
│   │   ├── web3Service.js          # Blockchain mock
│   │   └── aiService.js            # AI food recognition mock
│   ├── data/
│   │   └── mockData.js             # All Indonesian data
│   └── store/
│       └── store.js                # Redux store
└── package.json
```

**Healthcare Provider Portal:**
```
healthcare-provider-portal/
└── src/
    └── screens/
        ├── VerificationDashboard.js  # Mother list
        ├── BPJSScanner.js            # Insurance scanner
        └── MilestoneRecording.js     # Health checkups
```

**Social Worker Tool:**
```
social-worker-tool/
└── src/
    └── screens/
        ├── QualityAuditTool.js       # Food quality audit
        ├── EmergencyMap.js           # Emergency locations
        └── BountyWallet.js           # Rewards wallet
```

### View Indonesian Mock Data

```bash
# See all Indonesian content
cat prototypes/mother-app/src/data/mockData.js

# Or read the documentation
cat prototypes/INDONESIAN_CONTENT.md
```

---

## Comparison of Options

| Option | Time | Effort | What You Get |
|--------|------|--------|--------------|
| Web Apps | 0 min | None | Working dashboards in browser |
| Expo | 5 min | Low | Mobile apps on your phone |
| Full RN Init | 15 min | Medium | Complete native apps |
| Code Review | 0 min | None | Full code access |

---

## Recommended Workflow

### For Quick Demo (10 minutes)
1. Run web apps → See dashboards working
2. Open mobile code in VS Code → Show structure
3. Review `mockData.js` → Show Indonesian content

### For Stakeholder Presentation (30 minutes)
1. Run web apps → Interactive demo
2. Use Expo for mobile → Show on phone
3. Walk through code → Explain architecture

### For Technical Review (1 hour)
1. Review all code files
2. Initialize one full React Native project
3. Run on actual device
4. Test all features

### For Development (2+ hours)
1. Initialize all React Native projects
2. Set up development environment
3. Configure native modules
4. Start customizing

---

## Troubleshooting

### "Android project not found"
**Cause:** Prototypes don't have android/ folder  
**Solution:** Use Expo or run initialization script

### "Cannot find module"
**Cause:** Dependencies not installed  
**Solution:** Run `npm install --legacy-peer-deps`

### "Port 3000 already in use"
**Cause:** Another app using the port  
**Solution:** `PORT=3001 npm start`

### Expo QR code not working
**Cause:** Phone and computer on different networks  
**Solution:** Use tunnel mode: `npx expo start --tunnel`

---

## What Each Prototype Demonstrates

### Mother App (Guardian Interface)
- **Timeline Dashboard:** 1000 days journey tracker
- **Food Hack:** Camera-based food recognition
- **Kit Request:** Maternal kit marketplace with DID
- **Health Book NFC:** Digital immunization records
- **Indonesian Content:** All text and data in Bahasa Indonesia

### Healthcare Provider Portal (Verifiable Care)
- **Verification Dashboard:** List of assigned mothers
- **BPJS Scanner:** QR code insurance verification
- **Milestone Recording:** Health checkup logging with signatures
- **Tele-Consultation:** WhatsApp integration simulation

### Social Worker Tool (Last-Mile Audit)
- **Quality Audit:** BGN food quality verification
- **Emergency Map:** High-priority mother locations
- **Bounty Wallet:** USDC reward tracking
- **Provider Rankings:** BGN partner quality scores

### Government Dashboard (Impact Dashboard)
- **Audit Trail Map:** Eastern Indonesia visualization
- **Stunting Clusters:** Risk area identification
- **Fund Management:** USDC pool and allocation
- **SROI Calculator:** Social return on investment

### Hospital System (Supply Chain Hub)
- **Inventory Management:** Maternal kit tracking
- **Medical Record Sync:** ZKP privacy-preserving sync
- **Stock Alerts:** Replenishment notifications
- **Proof of Delivery:** Kit distribution verification

---

## Next Steps

### After Running Prototypes

1. **Review Features:** Check all screens and functionality
2. **Test Mock Data:** Verify Indonesian content displays correctly
3. **Evaluate Architecture:** Review code structure and patterns
4. **Plan Production:** Decide on deployment strategy

### For Production Deployment

1. **Complete Native Setup:** Initialize all React Native projects
2. **Add Real Services:** Replace mocks with actual APIs
3. **Deploy Smart Contracts:** Deploy to Polygon network
4. **Configure APIs:** Set up BPJS, WhatsApp, etc.
5. **Test on Devices:** Full QA on Android and iOS
6. **Submit to Stores:** Publish to Play Store and App Store

---

## Summary

✅ **Web Apps:** Run immediately with `npm start`  
⚡ **Mobile Apps (Quick):** Use Expo with `npx expo start`  
🔧 **Mobile Apps (Full):** Use `./init-react-native.sh [prototype-name]`  
📖 **Code Review:** Open in VS Code, no running needed

**All prototypes include:**
- Complete UI screens
- Indonesian mock data
- Business logic
- Service architecture
- Production-ready code

**Choose the option that fits your needs!**

---

## Documentation

- `HOW_TO_RUN.md` - Detailed running instructions
- `QUICK_START.md` - Quick commands
- `SETUP_GUIDE.md` - Full setup guide
- `INDONESIAN_CONTENT.md` - Mock data details
- `PROTOTYPE_OVERVIEW.md` - System architecture

---

**Questions?** Check the documentation or review the code structure.
