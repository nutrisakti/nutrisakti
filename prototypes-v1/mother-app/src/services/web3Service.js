import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_MOTHERS, INDONESIAN_FOODS, HEALTH_MILESTONES } from '../data/mockData';

class Web3Service {
  constructor() {
    this.mockMode = true; // Set to false when connecting to real blockchain
  }

  async initialize() {
    try {
      console.log('Web3 Service initialized (Mock Mode)');
      
      // Create mock wallet if doesn't exist
      const address = await AsyncStorage.getItem('wallet_address');
      if (!address) {
        const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
        await AsyncStorage.setItem('wallet_address', mockAddress);
      }
    } catch (error) {
      console.error('Web3 init error:', error);
    }
  }

  async getDecentralizedID() {
    const address = await AsyncStorage.getItem('wallet_address');
    return `did:nutrisakti:${address}`;
  }

  async checkKitEligibility(did) {
    // Mock eligibility based on user phase
    return {
      prenatal: true,
      delivery: false,
      newborn: false,
      nutrition: true,
    };
  }

  async requestMaternalKit(kitType) {
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        requestId: Math.floor(Math.random() * 10000),
        txHash: '0x' + Math.random().toString(16).slice(2),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getHealthRecords() {
    // Return mock health records
    return [
      {
        type: 'vaccination',
        title: 'Imunisasi Tetanus',
        timestamp: Date.now() - 86400000 * 30,
        details: 'Dosis pertama diberikan',
        provider: 'Posyandu Kupang',
        verified: true,
        measurements: null,
      },
      {
        type: 'checkup',
        title: 'Pemeriksaan Prenatal',
        timestamp: Date.now() - 86400000 * 15,
        details: 'Pemeriksaan rutin trimester kedua',
        provider: 'Puskesmas Kupang',
        verified: true,
        measurements: {
          weight: 58,
          height: 158,
          temperature: 36.5,
        },
      },
    ];
  }

  async verifyHealthcareSignature(data) {
    // Mock signature verification
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  async updateHealthRecord(data) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).slice(2),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAssignedMothers(region) {
    // Return mock mothers for the region
    return MOCK_MOTHERS.filter(m => m.region === region.toLowerCase());
  }

  async checkBPJSStatus(did) {
    // Mock BPJS status check
    await new Promise(resolve => setTimeout(resolve, 1500));
    const random = Math.random();
    return {
      isVerified: true,
      hasActiveCoverage: random > 0.3, // 70% have coverage
      lastChecked: Math.floor(Date.now() / 1000),
    };
  }

  async recordMilestone(data) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).slice(2),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async submitBGNAudit(data) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const bountyAmount = 5 + (data.qualityPoints < 60 ? 3 : 0);
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).slice(2),
        bountyAmount,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getBountyBalance() {
    // Mock bounty balance
    return 47.50;
  }

  async getEarningsHistory() {
    const { MOCK_EARNINGS } = require('../data/mockData');
    return MOCK_EARNINGS;
  }

  async withdrawBounty(amount) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).slice(2),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPriorityMothers() {
    // Return mothers with priority > 0
    return MOCK_MOTHERS.filter(m => m.priorityLevel > 0);
  }

  async getEmergencyStatus() {
    // Mock emergency status
    return {
      isActive: false,
      disasterType: 0,
      region: null,
    };
  }

  async markMotherAsAssisted(motherId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).slice(2),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new Web3Service();
