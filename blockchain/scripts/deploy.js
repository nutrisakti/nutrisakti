const hre = require("hardhat");

async function main() {
  console.log("Deploying NutriSakti Smart Contracts to Polygon...");

  // USDC address on Polygon mainnet
  const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  
  // Chainlink addresses for Polygon
  const LINK_TOKEN = "0xb0897686c545045aFc77CF20eC7A532E3120E0F1";
  const ORACLE_ADDRESS = "0x0a31078cd57d23bf9e8e8f1ba78356ca2090569e";
  const JOB_ID = "0x3666376662616538343734663461383661393739643866613438643839643839";

  // Deploy ImpactBounty
  const ImpactBounty = await hre.ethers.getContractFactory("ImpactBounty");
  const impactBounty = await ImpactBounty.deploy(USDC_ADDRESS);
  await impactBounty.waitForDeployment();
  console.log("ImpactBounty deployed to:", await impactBounty.getAddress());

  // Deploy BPJSVerificationBridge
  const BPJSVerificationBridge = await hre.ethers.getContractFactory("BPJSVerificationBridge");
  const bpjsVerificationBridge = await BPJSVerificationBridge.deploy(LINK_TOKEN, ORACLE_ADDRESS, JOB_ID);
  await bpjsVerificationBridge.waitForDeployment();
  console.log("BPJSVerificationBridge deployed to:", await bpjsVerificationBridge.getAddress());

  // Deploy EmergencySignalGateway
  const EmergencySignalGateway = await hre.ethers.getContractFactory("EmergencySignalGateway");
  const emergencySignalGateway = await EmergencySignalGateway.deploy(LINK_TOKEN, ORACLE_ADDRESS, JOB_ID);
  await emergencySignalGateway.waitForDeployment();
  console.log("EmergencySignalGateway deployed to:", await emergencySignalGateway.getAddress());

  // Deploy BGNQualityAuditor
  const BGNQualityAuditor = await hre.ethers.getContractFactory("BGNQualityAuditor");
  const bgnQualityAuditor = await BGNQualityAuditor.deploy();
  await bgnQualityAuditor.waitForDeployment();
  console.log("BGNQualityAuditor deployed to:", await bgnQualityAuditor.getAddress());

  // Link contracts
  await emergencySignalGateway.setImpactBountyContract(await impactBounty.getAddress());
  console.log("Contracts linked successfully");

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Network: Polygon");
  console.log("ImpactBounty:", await impactBounty.getAddress());
  console.log("BPJSVerificationBridge:", await bpjsVerificationBridge.getAddress());
  console.log("EmergencySignalGateway:", await emergencySignalGateway.getAddress());
  console.log("BGNQualityAuditor:", await bgnQualityAuditor.getAddress());
  console.log("\nNext steps:");
  console.log("1. Fund ImpactBounty contract with USDC");
  console.log("2. Fund External Data Verifiers with LINK tokens");
  console.log("3. Register health posts in BPJSVerificationBridge");
  console.log("4. Register food providers in BGNQualityAuditor");
  console.log("5. Update frontend config with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
