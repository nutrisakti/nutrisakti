# NutriSakti Prototypes - Quick Start Guide

## ✅ Status: All Prototypes Installed & Ready

---

## ⚠️ Important: How to Run Prototypes

### Web Apps - Run Immediately ✅
The Government Dashboard and Hospital System are web apps and run immediately:

```bash
cd prototypes/government-dashboard
npm start
# Opens at http://localhost:3000

cd prototypes/hospital-system
npm start
# Opens at http://localhost:3000
```

### Mobile Apps - Need Setup ⚠️
The mobile prototypes (Mother App, Provider Portal, Social Worker Tool) are **code prototypes** without native Android/iOS project files.

**See `HOW_TO_RUN.md` for detailed instructions on:**
- Running with Expo (recommended for quick demo)
- Initializing full React Native projects
- Viewing code and mock data

**Quick option - Use Expo:**
```bash
cd prototypes/mother-app
npx expo start
# Scan QR code with Expo Go app
```

---

## 🚀 What You Can Do Right Now

### 1. Run Web Apps (Immediate)
```bash
# Government Dashboard
cd prototypes/government-dashboard && npm start

# Hospital System  
cd prototypes/hospital-system && npm start
```

### 2. Review Mobile App Code
```bash
# Open in VS Code
code prototypes/mother-app
code prototypes/healthcare-provider-portal
code prototypes/social-worker-tool
```

### 3. Check Indonesian Mock Data
```bash
# View all Indonesian content
cat prototypes/mother-app/src/data/mockData.js
cat prototypes/INDONESIAN_CONTENT.md
```

---

## 🎯 What Each Prototype Does

### 1. Mother App (Guardian Interface)
**For:** Pregnant women and nursing mothers  
**Features:**
- Timeline Dashboard - Track 1000 days journey
- Food Hack - Recognize Indonesian foods with camera
- Kit Request - Request maternal-baby kits
- Health Book NFC - Digital health records

**Demo Scenario:**
1. Open app → See "Hari ke-120 dari 1000 Hari"
2. Tap "Food Hack" → Recognize "Daun Kelor"
3. View nutrient analysis in Indonesian
4. Request "Kit Perawatan Prenatal"

### 2. Healthcare Provider Portal (Verifiable Care)
**For:** Midwives and doctors  
**Features:**
- Verification Dashboard - List of assigned mothers
- BPJS Scanner - Check insurance status
- Milestone Recording - Record health checkups

**Demo Scenario:**
1. View assigned mothers in region
2. Scan QR code (simulated)
3. Check BPJS status
4. Record vaccination milestone

### 3. Social Worker Tool (Last-Mile Audit)
**For:** Social workers and field auditors  
**Features:**
- Quality Audit Tool - Verify BGN food quality
- Emergency Map - High-priority mothers
- Bounty Wallet - USDC rewards

**Demo Scenario:**
1. Capture food photo (simulated)
2. Log quality score
3. View emergency map
4. Check bounty earnings

### 4. Government Dashboard (Impact Dashboard)
**For:** Government officials and NGOs  
**Features:**
- Audit Trail Map - Visualize Eastern Indonesia
- Fund Management - USDC pool and SROI

**Demo Scenario:**
1. View stunting risk clusters
2. Check fund allocation
3. Calculate social return on investment

### 5. Hospital System (Supply Chain Hub)
**For:** Hospitals and Puskesmas  
**Features:**
- Inventory Management - Track maternal kits
- Medical Record Sync - ZKP privacy

**Demo Scenario:**
1. View kit inventory
2. Scan kit delivery
3. Sync medical records
4. Check replenishment alerts

---

## 🇮🇩 Indonesian Mock Data

All prototypes use realistic Indonesian data:

**Mothers:**
- Ibu Siti Aminah (28 tahun, NTT)
- Ibu Fatimah Zahra (32 tahun, Papua)
- Ibu Dewi Kartika (25 tahun, Maluku)

**Foods:**
- Daun Kelor (Moringa)
- Singkong (Cassava)
- Ubi Jalar Ungu (Purple sweet potato)

**Regions:**
- NTT, Papua, Maluku, NTB

---

## 🔧 Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### Port Already in Use
```bash
PORT=3001 npm start
```

### Module Not Found
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 📚 Full Documentation

- `INSTALLATION_STATUS.md` - Installation details
- `VERIFICATION_REPORT.md` - Installation verification
- `SETUP_GUIDE.md` - Detailed setup
- `INDONESIAN_CONTENT.md` - All mock data
- `PROTOTYPE_OVERVIEW.md` - System overview
- `FINAL_STATUS.md` - Project status

---

## ✅ Installation Summary

| Prototype | Packages | Status |
|-----------|----------|--------|
| Mother App | 570 | ✅ Ready |
| Provider Portal | 583 | ✅ Ready |
| Social Worker | 563 | ✅ Ready |
| Government | 1313 | ✅ Ready |
| Hospital | 1342 | ✅ Ready |

**Total:** 4,371 packages installed

---

## 🎉 You're Ready!

All prototypes are installed with Indonesian mock data and ready to run.

Choose any prototype above and start testing!
