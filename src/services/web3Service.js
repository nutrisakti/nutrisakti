import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImpactBountyABI from '../../blockchain/artifacts/contracts/ImpactBounty.sol/ImpactBounty.json';
import BPJSVerificationBridgeABI from '../../blockchain/artifacts/contracts/BPJSVerificationBridge.sol/BPJSVerificationBridge.json';
import BGNQualityAuditorABI from '../../blockchain/artifacts/contracts/BGNQualityAuditor.sol/BGNQualityAuditor.json';
import EmergencySignalGatewayABI from '../../blockchain/artifacts/contracts/EmergencySignalGateway.sol/EmergencySignalGateway.json';

const POLYGON_RPC = 'https://polygon-rpc.com';
const IMPACT_BOUNTY_ADDRESS = process.env.IMPACT_BOUNTY_ADDRESS;
const BPJS_VERIFICATION_BRIDGE_ADDRESS = process.env.BPJS_VERIFICATION_BRIDGE_ADDRESS;
const BGN_QUALITY_AUDITOR_ADDRESS = process.env.BGN_QUALITY_AUDITOR_ADDRESS;
const EMERGENCY_SIGNAL_GATEWAY_ADDRESS = process.env.EMERGENCY_SIGNAL_GATEWAY_ADDRESS;

class Web3Service {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    this.wallet = null;
    this.impactBountyContract = null;
    this.bpjsVerificationBridgeContract = null;
    this.bgnQualityAuditorContract = null;
    this.emergencySignalGatewayContract = null;
  }

  async initialize() {
    try {
      const privateKey = await AsyncStorage.getItem('wallet_private_key');
      
      if (!privateKey) {
        await this.createWallet();
      } else {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
      }

      this.impactBountyContract = new ethers.Contract(
        IMPACT_BOUNTY_ADDRESS,
        ImpactBountyABI.abi,
        this.wallet
      );

      this.bpjsVerificationBridgeContract = new ethers.Contract(
        BPJS_VERIFICATION_BRIDGE_ADDRESS,
        BPJSVerificationBridgeABI.abi,
        this.wallet
      );

      this.bgnQualityAuditorContract = new ethers.Contract(
        BGN_QUALITY_AUDITOR_ADDRESS,
        BGNQualityAuditorABI.abi,
        this.wallet
      );

      this.emergencySignalGatewayContract = new ethers.Contract(
        EMERGENCY_SIGNAL_GATEWAY_ADDRESS,
        EmergencySignalGatewayABI.abi,
        this.wallet
      );

      console.log('Web3 Service initialized');
    } catch (error) {
      console.error('Web3 initialization error:', error);
    }
  }

  async createWallet() {
    const wallet = ethers.Wallet.createRandom();
    await AsyncStorage.setItem('wallet_private_key', wallet.privateKey);
    await AsyncStorage.setItem('wallet_address', wallet.address);
    this.wallet = wallet.connect(this.provider);
    return wallet.address;
  }

  async getWalletAddress() {
    return await AsyncStorage.getItem('wallet_address');
  }

  async registerMother(didHash) {
    try {
      const tx = await this.impactBountyContract.registerMother(didHash);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  async requestKit(kitType, amount) {
    try {
      const amountInUSDC = ethers.parseUnits(amount.toString(), 6);
      const tx = await this.impactBountyContract.requestKit(kitType, amountInUSDC);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => 
        log.topics[0] === ethers.id('KitRequested(uint256,address,string)')
      );
      
      return { 
        success: true, 
        requestId: event.args[0],
        txHash: tx.hash 
      };
    } catch (error) {
      console.error('Kit request error:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyBPJS(zkProofHash) {
    try {
      const tx = await this.bpjsVerificationBridgeContract.requestBPJSVerification(zkProofHash);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('BPJS verification error:', error);
      return { success: false, error: error.message };
    }
  }

  async getBPJSStatus(address) {
    try {
      const status = await this.bpjsVerificationBridgeContract.getBPJSStatus(address);
      return {
        isVerified: status.isVerified,
        hasActiveCoverage: status.hasActiveCoverage,
        lastChecked: Number(status.lastChecked),
      };
    } catch (error) {
      console.error('Get BPJS status error:', error);
      return null;
    }
  }

  async getMotherInfo(address) {
    try {
      const info = await this.impactBountyContract.getMotherInfo(address);
      return {
        walletAddress: info.walletAddress,
        registrationDate: Number(info.registrationDate),
        totalDisbursed: ethers.formatUnits(info.totalDisbursed, 6),
        isActive: info.isActive,
        priorityLevel: info.priorityLevel,
      };
    } catch (error) {
      console.error('Get mother info error:', error);
      return null;
    }
  }

  async getBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Get balance error:', error);
      return '0';
    }
  }
}

export default new Web3Service();


  async logBGNFood(foodType, quantity, protein, carbs, fat, calories, qualityRating) {
    try {
      const providerAddress = process.env.DEFAULT_BGN_PROVIDER || '0x0000000000000000000000000000000000000001';
      
      const tx = await this.bgnQualityAuditorContract.logFood(
        providerAddress,
        foodType,
        quantity,
        protein,
        carbs,
        fat,
        calories,
        qualityRating
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => 
        log.topics[0] === ethers.id('FoodLogged(uint256,address,address,uint256)')
      );
      
      return {
        success: true,
        logId: event.args[0],
        nutritionalScore: event.args[3],
        txHash: tx.hash
      };
    } catch (error) {
      console.error('BGN food log error:', error);
      return { success: false, error: error.message };
    }
  }

  async getProviderRanking(providerAddress) {
    try {
      const ranking = await this.bgnQualityAuditorContract.getProviderRanking(providerAddress);
      return {
        name: ranking.name,
        totalDeliveries: Number(ranking.totalDeliveries),
        averageRating: Number(ranking.averageRating),
        isActive: ranking.isActive
      };
    } catch (error) {
      console.error('Get provider ranking error:', error);
      return null;
    }
  }

  async checkEmergencyStatus(region) {
    try {
      const status = await this.emergencySignalGatewayContract.getRegionStatus(region);
      return {
        isInEmergency: status.isInEmergency,
        currentDisaster: Number(status.currentDisaster),
        severityLevel: Number(status.severityLevel),
        emergencyStartTime: Number(status.emergencyStartTime)
      };
    } catch (error) {
      console.error('Check emergency status error:', error);
      return null;
    }
  }
