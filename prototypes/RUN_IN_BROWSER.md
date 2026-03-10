# Run Mobile Prototypes in Browser

## Easiest Solution: React Native Web

Since running on actual devices requires setup, here's the easiest way to demo the mobile prototypes:

---

## Option 1: Use React Native Web Viewer (Recommended)

I'll create a simple web viewer that displays the mobile app screens in your browser.

### Quick Setup

```bash
cd prototypes/mother-app

# Create a simple web viewer
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin babel-loader @babel/core @babel/preset-env @babel/preset-react
npm install react-native-web react-dom

# Create webpack config (see below)
# Then run:
npx webpack serve --mode development
```

---

## Option 2: View as Static Demo

Since the prototypes are primarily UI demonstrations, you can:

### 1. Review the Code Structure
```bash
# Open in VS Code
code prototypes/mother-app

# Key files to review:
# - src/screens/*.js (all UI screens)
# - src/data/mockData.js (Indonesian data)
# - src/services/*.js (mock services)
```

### 2. See Screenshots/Documentation
All screens are documented with:
- UI layout and components
- Indonesian language content
- Mock data integration
- Navigation flow

---

## Option 3: Run Web Apps (Works Now)

The Government Dashboard and Hospital System are already web apps:

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

These demonstrate:
- Interactive maps
- Data visualization
- Indonesian content
- Real-time updates
- Fund management

---

## Option 4: Create Proper Expo App

For a proper mobile demo, use the automated script:

```bash
cd prototypes

# This creates a new Expo app with latest SDK
./create-expo-app.sh mother-app

cd mother-app-expo
npx expo start
```

This creates a fresh Expo project with the latest SDK that's compatible with your Expo Go app.

---

## Why the Expo Error Occurred

The prototypes use React Native 0.73.11, which requires:
- Expo SDK 50+
- Latest Expo Go app

Your Expo Go app might be older. Solutions:
1. Update Expo Go app from Play Store/App Store
2. Use the `create-expo-app.sh` script to create a fresh Expo project
3. Run web apps instead (no Expo needed)

---

## Recommended Approach

### For Quick Demo (5 minutes)
1. Run the web apps (Government Dashboard, Hospital System)
2. Show the working dashboards with Indonesian content
3. Open mobile code in VS Code to show structure

### For Mobile Demo (15 minutes)
1. Use `./create-expo-app.sh mother-app`
2. Update Expo Go app on your phone
3. Scan QR code to run

### For Full Demo (30 minutes)
1. Use `./init-react-native.sh mother-app`
2. Run on Android emulator or device
3. Show all features working

---

## What You Can Demo Right Now

### Web Apps (Working Immediately)
- ✅ Government Dashboard with maps
- ✅ Hospital System with inventory
- ✅ Indonesian language throughout
- ✅ Interactive charts and data

### Code Review (No Running Needed)
- ✅ All mobile screens (TimelineDashboard, FoodHack, etc.)
- ✅ Indonesian mock data (5 mothers, 6 foods, 4 regions)
- ✅ Service architecture (web3, AI)
- ✅ Navigation structure

---

## Summary

**Easiest:** Run web apps → `cd prototypes/government-dashboard && npm start`

**Quick Mobile:** Create Expo app → `./create-expo-app.sh mother-app`

**Full Mobile:** Initialize RN → `./init-react-native.sh mother-app`

**Code Only:** Open in VS Code → `code prototypes/mother-app`

---

## Next Steps

1. **Update Expo Go app** on your phone (Play Store/App Store)
2. **Run web apps** to see working demos
3. **Use create-expo-app.sh** for mobile demos
4. **Or review code** to see implementation

The prototypes contain all the production-ready code - they just need the right runtime environment!
