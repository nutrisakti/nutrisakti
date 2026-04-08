# NutriSakti Prototypes - Setup Guide

## Quick Start (Mock Mode)

All prototypes are configured to run in **Mock Mode** with Indonesian language support and sample data. No blockchain connection required for testing.

## Prerequisites

- Node.js 18+ installed
- For mobile apps: React Native development environment
- For web apps: Modern web browser

---

## Setup Instructions

### Option 1: Individual Prototype Setup

#### Mother App (Mobile)
```bash
cd prototypes/mother-app
npm install --legacy-peer-deps
npm start
# In another terminal:
npm run android  # or npm run ios
```

#### Healthcare Provider Portal (Mobile)
```bash
cd prototypes/healthcare-provider-portal
npm install --legacy-peer-deps
npm start
npm run android
```

#### Social Worker Tool (Mobile)
```bash
cd prototypes/social-worker-tool
npm install --legacy-peer-deps
npm start
npm run android
```

#### Government Dashboard (Web)
```bash
cd prototypes/government-dashboard
npm install
npm start
# Opens at http://localhost:3000
```

#### Hospital System (Web)
```bash
cd prototypes/hospital-system
npm install
npm start
# Opens at http://localhost:3001
```

---

## Mock Data Features

### Indonesian Language Support
- All UI text in Bahasa Indonesia
- Sample names: Ibu Siti Aminah, Ibu Maria Goreti, etc.
- Regional data: NTT, Papua, Maluku, NTB
- Local foods: Daun Kelor, Singkong, Ubi Jalar, Ikan Lokal

### Sample Data Included
- **5 Mock Mothers** with complete profiles
- **6 Indonesian Foods** with nutritional data
- **6 Health Milestones** with USDC rewards
- **4 Kit Types** with Indonesian descriptions
- **5 BGN Providers** with quality ratings
- **5 Posyandu Locations** across Eastern Indonesia

### Mock Services
- Web3Service: Simulates blockchain transactions
- AIService: Simulates food recognition and video generation
- All operations return realistic delays and responses

---

## Testing Scenarios

### Mother App
1. Open app → See Timeline Dashboard in Indonesian
2. Navigate to Food Hack → Simulates camera capture
3. View nutrient analysis for Indonesian foods
4. Request kit → See DID verification
5. Health Book → View mock vaccination records

### Healthcare Provider Portal
1. View assigned mothers list
2. Scan QR code (simulated)
3. Check BPJS status
4. Record milestone with signature

### Social Worker Tool
1. Capture food photo (simulated)
2. Log quality score
3. View emergency map
4. Check bounty wallet balance

### Government Dashboard
1. View regional map
2. See stunting risk clusters
3. Manage USDC funds
4. View SROI calculator

### Hospital System
1. Scan kit barcode (simulated)
2. View inventory levels
3. Access medical records with ZKP
4. Request replenishment

---

## Troubleshooting

### Dependency Conflicts
If you see peer dependency errors:
```bash
npm install --legacy-peer-deps
```

### React Native Issues
Clear cache:
```bash
npm start -- --reset-cache
```

### Port Already in Use
For web apps, change port:
```bash
PORT=3002 npm start
```

---

## Mock Data Customization

Edit `prototypes/mother-app/src/data/mockData.js` to customize:
- Mother profiles
- Food items
- Regional data
- Provider information
- Earnings history

---

## Production Mode

To connect to real blockchain:

1. Update `.env` files with actual contract addresses
2. Set `mockMode = false` in web3Service.js
3. Configure Polygon RPC URL
4. Add private keys (securely)

---

## Indonesian Language Files

All text is in Bahasa Indonesia:
- UI labels and buttons
- Food names and descriptions
- Health milestone names
- Error messages
- Success notifications

---

## Support

For issues or questions:
- Check PROTOTYPE_OVERVIEW.md
- Review COMPLETION_SUMMARY.md
- See main README.md

---

**Status:** Ready for Demo  
**Mode:** Mock Data with Indonesian Language  
**Last Updated:** March 2026
