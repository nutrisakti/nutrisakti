# NutriSakti Deployment Guide

## Prerequisites

### Required Software
- Node.js 18+ and npm
- React Native CLI
- Android Studio (for Android) or Xcode (for iOS)
- Hardhat for smart contract deployment
- Git

### Required Accounts
- Polygon wallet with MATIC for gas fees
- OpenAI API key (for recipe generation)
- Twilio account (for WhatsApp integration)
- Chainlink node access (for oracles)
- IPFS/Pinata account (for decentralized storage)

---

## Step 1: Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/nutrisakti.git
cd nutrisakti
```

2. Install dependencies:
```bash
npm install
cd blockchain && npm install && cd ..
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_wallet_private_key
OPENAI_API_KEY=your_openai_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

---

## Step 2: Smart Contract Deployment

### Deploy to Polygon Mumbai (Testnet)

1. Get test MATIC from faucet:
   - Visit: https://faucet.polygon.technology/
   - Enter your wallet address

2. Compile contracts:
```bash
cd blockchain
npx hardhat compile
```

3. Deploy to testnet:
```bash
npx hardhat run scripts/deploy.js --network polygonMumbai
```

4. Save contract addresses from output:
```
ImpactBounty: 0x...
BPJSVerificationBridge: 0x...
EmergencySignalGateway: 0x...
BGNQualityAuditor: 0x...
```

5. Update `.env` with deployed addresses:
```
IMPACT_BOUNTY_ADDRESS=0x...
BPJS_VERIFICATION_BRIDGE_ADDRESS=0x...
EMERGENCY_SIGNAL_GATEWAY_ADDRESS=0x...
BGN_QUALITY_AUDITOR_ADDRESS=0x...
```

### Deploy to Polygon Mainnet (Production)

1. Ensure wallet has sufficient MATIC (≈5 MATIC for deployment)

2. Deploy:
```bash
npx hardhat run scripts/deploy.js --network polygon
```

3. Verify contracts on PolygonScan:
```bash
npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS
```

---

## Step 3: Fund Smart Contracts

### Fund ImpactBounty with USDC

1. Get USDC on Polygon:
   - Bridge from Ethereum: https://wallet.polygon.technology/
   - Or buy directly on Polygon DEX

2. Transfer USDC to ImpactBounty contract:
```javascript
// Using ethers.js
const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
await usdcContract.transfer(IMPACT_BOUNTY_ADDRESS, ethers.parseUnits("10000", 6)); // 10,000 USDC
```

### Fund BPJSVerificationBridge with LINK

1. Get LINK tokens on Polygon

2. Transfer to verification bridge contract:
```javascript
const linkContract = new ethers.Contract(LINK_ADDRESS, LINK_ABI, wallet);
await linkContract.transfer(BPJS_VERIFICATION_BRIDGE_ADDRESS, ethers.parseUnits("100", 18)); // 100 LINK
```

3. Register health posts:
```javascript
const bridge = new ethers.Contract(BPJS_VERIFICATION_BRIDGE_ADDRESS, BRIDGE_ABI, wallet);
await bridge.registerHealthPost(HEALTH_POST_ADDRESS);
```

### Fund EmergencySignalGateway with LINK

1. Transfer LINK tokens:
```javascript
await linkContract.transfer(EMERGENCY_SIGNAL_GATEWAY_ADDRESS, ethers.parseUnits("50", 18)); // 50 LINK
```

2. Link to ImpactBounty contract (done automatically in deployment script)

### Register Food Providers in BGNQualityAuditor

```javascript
const auditor = new ethers.Contract(BGN_QUALITY_AUDITOR_ADDRESS, AUDITOR_ABI, wallet);
await auditor.registerProvider(PROVIDER_ADDRESS, "Provider Name");
```

---

## Step 4: Mobile App Deployment

### Android

1. Generate release keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore nutrisakti-release.keystore -alias nutrisakti -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure `android/gradle.properties`:
```
NUTRISAKTI_RELEASE_STORE_FILE=nutrisakti-release.keystore
NUTRISAKTI_RELEASE_KEY_ALIAS=nutrisakti
NUTRISAKTI_RELEASE_STORE_PASSWORD=your_password
NUTRISAKTI_RELEASE_KEY_PASSWORD=your_password
```

3. Build release APK:
```bash
cd android
./gradlew assembleRelease
```

4. APK location: `android/app/build/outputs/apk/release/app-release.apk`

5. Upload to Google Play Console

### iOS

1. Open Xcode:
```bash
cd ios
pod install
open NutriSakti.xcworkspace
```

2. Configure signing in Xcode:
   - Select project → Signing & Capabilities
   - Choose your team and provisioning profile

3. Archive for distribution:
   - Product → Archive
   - Distribute App → App Store Connect

4. Upload to App Store Connect

---

## Step 5: Backend Services Setup

### IPFS Configuration

1. Create Pinata account: https://pinata.cloud/

2. Get API keys and update `.env`:
```
IPFS_API_KEY=your_pinata_key
IPFS_SECRET_KEY=your_pinata_secret
```

3. Upload AI video templates:
```bash
node scripts/uploadVideos.js
```

### Chainlink Oracle Setup

1. Fund oracle contract with LINK (done in Step 3)

2. Configure job specifications in Chainlink node

3. Test oracle connection:
```bash
npx hardhat run scripts/testOracle.js --network polygon
```

---

## Step 6: Testing

### Smart Contract Tests

```bash
cd blockchain
npx hardhat test
```

Expected output: All tests passing

### Mobile App Tests

```bash
npm test
```

### End-to-End Testing

1. Install app on test device
2. Register new user
3. Complete food scan
4. Request maternal kit
5. Verify BPJS status
6. Check blockchain transactions on PolygonScan

---

## Step 7: Monitoring & Maintenance

### Blockchain Monitoring

- Monitor contract on PolygonScan: https://polygonscan.com/address/YOUR_CONTRACT
- Set up alerts for low USDC/LINK balances
- Track gas usage and optimize if needed

### App Analytics

- Integrate Firebase Analytics
- Monitor crash reports
- Track user engagement metrics

### Oracle Health

- Monitor Chainlink node uptime
- Check oracle response times
- Ensure LINK balance sufficient

---

## Troubleshooting

### Contract Deployment Fails

**Issue:** "Insufficient funds for gas"
**Solution:** Ensure wallet has ≥5 MATIC

**Issue:** "Contract size exceeds limit"
**Solution:** Enable optimizer in `hardhat.config.js`:
```javascript
optimizer: {
  enabled: true,
  runs: 200
}
```

### Mobile App Build Fails

**Issue:** "Unable to resolve module"
**Solution:** Clear cache and reinstall:
```bash
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

**Issue:** Android build fails
**Solution:** Clean gradle cache:
```bash
cd android
./gradlew clean
cd ..
```

### Oracle Not Responding

**Issue:** BPJS verification stuck
**Solution:** 
1. Check LINK balance in oracle contract
2. Verify Chainlink node is running
3. Check job ID configuration

---

## Security Checklist

- [ ] Private keys stored securely (never in code)
- [ ] Smart contracts audited by third party
- [ ] Rate limiting on API endpoints
- [ ] HTTPS enforced for all connections
- [ ] User data encrypted at rest
- [ ] Regular security updates applied
- [ ] Backup wallet for contract ownership
- [ ] Multi-sig for large fund movements

---

## Cost Estimates

### One-Time Costs
- Smart contract deployment: ~$50 (gas fees)
- Initial USDC funding: $10,000+ (for bounties)
- Initial LINK funding: $500 (for oracle calls)
- App store fees: $25 (Google) + $99/year (Apple)

### Monthly Costs
- Cloud hosting: $100
- IPFS storage: $20
- Chainlink oracle calls: $50
- API costs (OpenAI): $100
- Total: ~$270/month

---

## Support

- Documentation: https://docs.nutrisakti.org
- GitHub Issues: https://github.com/your-org/nutrisakti/issues
- Discord Community: https://discord.gg/nutrisakti
- Email: support@nutrisakti.org

---

## License

MIT License - See LICENSE file for details
