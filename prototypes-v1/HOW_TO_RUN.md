# How to Run NutriSakti Prototypes

## Important: Prototype Structure

These prototypes are **UI/Logic demonstrations** without full React Native native project files (android/, ios/ folders). They showcase the screens, services, and mock data.

---

## Option 1: Run with Expo (Recommended for Quick Demo)

Expo allows you to run React Native apps without native project files.

### Setup Expo

1. **Install Expo CLI globally:**
```bash
npm install -g expo-cli
```

2. **Convert prototype to Expo:**
```bash
cd prototypes/mother-app

# Initialize Expo
npx expo init --template blank

# Copy our files
cp -r src/* mother-app-expo/src/
cp App.js mother-app-expo/
cp package.json mother-app-expo/
```

3. **Run with Expo:**
```bash
npx expo start
```

Then scan QR code with Expo Go app on your phone.

---

## Option 2: Initialize Full React Native Project

To run on actual Android/iOS devices, initialize the native projects:

### For Each Mobile Prototype

```bash
cd prototypes/mother-app

# Initialize React Native project
npx react-native init NutriSaktiMother --version 0.73.11

# Copy our files into the new project
cp -r src NutriSaktiMother/
cp App.js NutriSaktiMother/
cp package.json NutriSaktiMother/

cd NutriSaktiMother

# Install dependencies
npm install --legacy-peer-deps

# Run on Android
npm run android

# Or run on iOS (macOS only)
npm run ios
```

---

## Option 3: Run Web Apps (Works Immediately)

The Government Dashboard and Hospital System are web apps and run immediately:

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

---

## Option 4: View Code & Mock Data (No Running Required)

Since these are prototypes, you can review:

### Code Structure
- `src/screens/` - All UI screens
- `src/services/` - Mock services (web3, AI)
- `src/data/mockData.js` - Indonesian mock data
- `App.js` - Main app entry

### Key Files to Review

**Mother App:**
- `src/screens/TimelineDashboard.js` - 1000 days journey
- `src/screens/FoodHackScreen.js` - Food recognition
- `src/screens/KitRequestScreen.js` - Kit marketplace
- `src/screens/HealthBookNFC.js` - Digital health book
- `src/data/mockData.js` - All Indonesian data

**Healthcare Provider Portal:**
- `src/screens/VerificationDashboard.js` - Mother list
- `src/screens/BPJSScanner.js` - Insurance scanner
- `src/screens/MilestoneRecording.js` - Health checkups

**Social Worker Tool:**
- `src/screens/QualityAuditTool.js` - Food quality audit
- `src/screens/EmergencyMap.js` - Emergency locations
- `src/screens/BountyWallet.js` - Rewards wallet

---

## Option 5: Create React Native Web Version

Run mobile prototypes in browser using React Native Web:

```bash
cd prototypes/mother-app

# Install React Native Web
npm install react-native-web react-dom --legacy-peer-deps
npm install --save-dev @babel/preset-react webpack webpack-cli webpack-dev-server html-webpack-plugin babel-loader

# Create webpack config (see below)
# Then run:
npx webpack serve
```

---

## Recommended Approach for Demo

### For Quick Review (5 minutes)
1. Open code files in VS Code
2. Review `src/data/mockData.js` for Indonesian content
3. Review screen files to see UI logic
4. Run web apps (Government Dashboard, Hospital System)

### For Interactive Demo (30 minutes)
1. Run web apps immediately (no setup needed)
2. Use Expo for mobile apps (quick setup)
3. Show code structure and mock data

### For Full Demo (2 hours)
1. Initialize full React Native projects
2. Run on actual Android/iOS devices
3. Show all features working

---

## What Each Prototype Demonstrates

### Mobile Apps (React Native)
These show the UI structure, navigation, and business logic:
- Screen layouts and components
- Navigation flow
- Mock service integration
- Indonesian language support
- Data structures

### Web Apps (React)
These run immediately and show:
- Interactive dashboards
- Maps and charts
- Data visualization
- Fund management
- Inventory tracking

---

## Quick Start Commands

### Web Apps (Run Immediately)
```bash
cd prototypes/government-dashboard && npm start
cd prototypes/hospital-system && npm start
```

### Mobile Apps (View Code)
```bash
# Open in VS Code
code prototypes/mother-app
code prototypes/healthcare-provider-portal
code prototypes/social-worker-tool
```

### Mobile Apps (Run with Expo)
```bash
cd prototypes/mother-app
npx expo start
```

---

## Why Prototypes Don't Have android/ios Folders

These are **code prototypes** designed to:
1. Demonstrate UI/UX design
2. Show business logic
3. Showcase Indonesian mock data
4. Prove technical feasibility
5. Enable code review

They are NOT:
- Full production apps
- Ready for app store deployment
- Complete with native modules

---

## Converting to Production

To convert these prototypes to production apps:

1. **Initialize React Native project:**
```bash
npx react-native init AppName --version 0.73.11
```

2. **Copy prototype code:**
```bash
cp -r prototypes/mother-app/src AppName/
cp prototypes/mother-app/App.js AppName/
```

3. **Install dependencies:**
```bash
cd AppName
npm install --legacy-peer-deps
```

4. **Add native modules:**
- React Native Camera
- NFC Manager
- Maps
- etc.

5. **Configure native projects:**
- Android: `android/app/build.gradle`
- iOS: `ios/Podfile`

6. **Test on devices:**
```bash
npm run android
npm run ios
```

---

## Troubleshooting

### "Android project not found"
- This is expected - prototypes don't have android/ folder
- Use Expo or initialize full React Native project

### "Module not found"
- Run `npm install --legacy-peer-deps`
- Clear cache: `npm start -- --reset-cache`

### "Port already in use"
- Change port: `PORT=3001 npm start`

---

## Summary

| Prototype Type | Can Run Immediately? | How to Run |
|----------------|---------------------|------------|
| Government Dashboard | ✅ Yes | `npm start` |
| Hospital System | ✅ Yes | `npm start` |
| Mother App | ⚠️ Needs setup | Use Expo or init RN |
| Provider Portal | ⚠️ Needs setup | Use Expo or init RN |
| Social Worker Tool | ⚠️ Needs setup | Use Expo or init RN |

**Recommendation:** Run web apps immediately, use Expo for mobile apps, or review code structure.

---

## Documentation

- `QUICK_START.md` - Quick commands
- `SETUP_GUIDE.md` - Detailed setup
- `PROTOTYPE_OVERVIEW.md` - System overview
- `INDONESIAN_CONTENT.md` - Mock data details

---

**Note:** These prototypes demonstrate the complete NutriSakti ecosystem with Indonesian mock data. They are production-ready code that needs native project initialization to run on devices.
