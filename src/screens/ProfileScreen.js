import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import web3Service from '../services/web3Service';
import { ethers } from 'ethers';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(false);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const address = await web3Service.getWalletAddress();
      if (address) {
        dispatch({ type: 'SET_WALLET', payload: address });
        
        const info = await web3Service.getMotherInfo(address);
        if (info && info.isActive) {
          dispatch({ type: 'UPDATE_USER_INFO', payload: info });
        }

        const bpjsStatus = await web3Service.getBPJSStatus(address);
        if (bpjsStatus) {
          dispatch({ type: 'UPDATE_BPJS_STATUS', payload: bpjsStatus });
        }
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const registerOnChain = async () => {
    setLoading(true);
    try {
      const didHash = ethers.id(`did:nutrisakti:${user.walletAddress}`);
      const result = await web3Service.registerMother(didHash);
      
      if (result.success) {
        dispatch({
          type: 'SET_REGISTRATION',
          payload: { isRegistered: true, didHash },
        });
        Alert.alert('Success', 'You are now registered on the blockchain!');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyBPJS = async () => {
    setLoading(true);
    try {
      const zkProofHash = ethers.id(`bpjs:${user.walletAddress}:${Date.now()}`);
      const result = await web3Service.verifyBPJS(zkProofHash);
      
      if (result.success) {
        Alert.alert('Success', 'BPJS verification request submitted');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Wallet Address:</Text>
        <Text style={styles.value}>{user.walletAddress || 'Not available'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Registration Status:</Text>
        <Text style={[styles.value, user.isRegistered ? styles.active : styles.inactive]}>
          {user.isRegistered ? '✓ Registered' : '✗ Not Registered'}
        </Text>
      </View>

      {!user.isRegistered && (
        <TouchableOpacity
          style={styles.button}
          onPress={registerOnChain}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Register on Blockchain'}
          </Text>
        </TouchableOpacity>
      )}

      {user.isRegistered && (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Total Rewards Earned:</Text>
            <Text style={styles.rewardValue}>${user.totalDisbursed} USDC</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Priority Level:</Text>
            <Text style={styles.value}>
              {user.priorityLevel === 0 ? 'Normal' : user.priorityLevel === 1 ? 'High Priority' : 'Emergency Priority'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>BPJS Status:</Text>
            {user.bpjsStatus ? (
              <>
                <Text style={[styles.value, user.bpjsStatus.hasActiveCoverage ? styles.active : styles.inactive]}>
                  {user.bpjsStatus.hasActiveCoverage ? '✓ Active Coverage' : '✗ No Coverage'}
                </Text>
                <Text style={styles.subtext}>
                  Last checked: {new Date(user.bpjsStatus.lastChecked * 1000).toLocaleDateString()}
                </Text>
              </>
            ) : (
              <Text style={styles.value}>Not verified</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={verifyBPJS}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'Verify BPJS Status'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  rewardValue: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  active: {
    color: '#4CAF50',
  },
  inactive: {
    color: '#F44336',
  },
  subtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  button: {
    margin: 15,
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
