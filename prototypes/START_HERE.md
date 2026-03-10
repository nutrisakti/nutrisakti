# NutriSakti Prototypes - START HERE

## 🎯 Quick Start Guide

---

## ✅ What Works Right Now (0 minutes)

### Run Web Apps

```bash
# Government Dashboard
cd prototypes/government-dashboard
npm start
```

```bash
# Hospital System
cd prototypes/hospital-system
npm start
```

```bash
# Mother App (NEW! - Web Version)
cd prototypes/mother-app
npm run web
```

**You'll see:**
- Interactive maps of Eastern Indonesia
- Stunting risk visualization
- Fund management dashboard
- Inventory tracking
- Mother App with Timeline, Food Hack, Kit Request, Health Book
- All in Indonesian language

---

## 📱 Running Mobile Apps

### Got "Expo incompatible" error?

**Quick Fix:** Use our automated script

```bash
cd prototypes
./create-expo-app.sh mother-app
cd mother-app-expo
npx expo start
```

This creates a fresh Expo app that works with your Expo Go app.

---

## 📚 All Available Options

| What | Command | Time | Works On |
|------|---------|------|----------|
| **Web Apps** | `cd government-dashboard && npm start` | 0 min | Browser ✅ |
| **Expo App** | `./create-expo-app.sh mother-app` | 15 min | Phone (Expo Go) |
| **Full RN App** | `./init-react-native.sh mother-app` | 30 min | Phone (native) |
| **Code Review** | `code mother-app` | 0 min | VS Code |

---

## 🎓 What's Included

### 5 Complete Prototypes

1. **Mother App** - Guardian interface with timeline, food hack, kit request
2. **Healthcare Provider Portal** - Verification dashboard, BPJS scanner
3. **Social Worker Tool** - Quality audit, emergency map, bounty wallet
4. **Government Dashboard** - Audit trail map, fund management (WEB APP ✅)
5. **Hospital System** - Inventory management, medical records (WEB APP ✅)

### Indonesian Mock Data

- 5 sample mothers (Ibu Siti Aminah, etc.)
- 6 local foods (Daun Kelor, Singkong, etc.)
- 4 regions (NTT, Papua, Maluku, NTB)
- All UI text in Bahasa Indonesia

---

## 🚀 Recommended Path

### For Quick Demo (5 minutes)
1. Run web apps → See working dashboards
2. Open mobile code in VS Code → Show structure

### For Mobile Demo (20 minutes)
1. Run web apps → Show dashboards
2. Create Expo app → `./create-expo-app.sh mother-app`
3. Run on phone → Scan QR code

### For Full Demo (1 hour)
1. Run web apps
2. Initialize full RN projects → `./init-react-native.sh mother-app`
3. Run on Android/iOS devices

---

## 📖 Documentation

- `EXPO_FIX.md` - Fix Expo compatibility error
- `HOW_TO_RUN.md` - Complete running guide
- `RUNNING_PROTOTYPES.md` - Detailed instructions
- `RUN_IN_BROWSER.md` - Browser-based options
- `QUICK_START.md` - Quick commands
- `INDONESIAN_CONTENT.md` - Mock data details

---

## 🔧 Helper Scripts

- `create-expo-app.sh` - Create Expo-compatible app
- `init-react-native.sh` - Create full React Native app
- `install-all.sh` - Install all prototypes

---

## ❓ Common Questions

### "Why can't I run mobile apps directly?"
The prototypes are code demonstrations without Expo/RN project files. Use our scripts to create runnable apps.

### "Which should I run first?"
Start with web apps - they work immediately and show the system working.

### "Do I need Expo Go?"
Only if you want to run mobile apps on your phone. Web apps work in browser.

### "Can I see the code without running?"
Yes! Open any prototype folder in VS Code to review all code.

---

## 🎉 Summary

**Easiest:** Web apps work now → `npm start`  
**Mobile:** Use our scripts → `./create-expo-app.sh`  
**Code:** Open in VS Code → `code mother-app`

All prototypes include production-ready code with Indonesian mock data!

---

**Next Step:** Run the web apps to see the system working!

```bash
cd prototypes/government-dashboard
npm start
```
