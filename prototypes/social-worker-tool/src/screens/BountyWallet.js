import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import web3Service from '../services/web3Service';

const BountyWallet = () => {
  const [balance, setBalance] = useState(0);
  const [earnings, setEarnings] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const walletBalance = await web3Service.getBountyBalance();
      setBalance(walletBalance);

      const earningsHistory = await web3Service.getEarningsHistory();
      setEarnings(earningsHistory);
    } catch (error) {
      console.error('Load wallet error:', error);
    }
  };

  const withdrawFunds = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const result = await web3Service.withdrawBounty(withdrawAmount);
      if (result.success) {
        Alert.alert(
          'Withdrawal Successful! ✅',
          `${withdrawAmount} USDC has been sent to your wallet.\n\nTransaction: ${result.txHash.slice(0, 10)}...`,
          [{ text: 'OK', onPress: () => {
            setWithdrawAmount('');
            loadWalletData();
          }}]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Error', 'Failed to withdraw funds');
    } finally {
      setLoading(false);
    }
  };

  const getTotalEarnings = () => {
    return earnings.reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Bounty Wallet</Text>
        <Text style={styles.subtitle}>USDC Rewards for Verified Deliveries</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>${balance.toFixed(2)} USDC</Text>
        <Text style={styles.balanceSubtext}>
          Total Earned: ${getTotalEarnings().toFixed(2)}
        </Text>
      </View>

      <View style={styles.withdrawSection}>
        <Text style={styles.sectionTitle}>Withdraw Funds</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount in USDC"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.withdrawButton, loading && styles.disabledButton]}
          onPress={withdrawFunds}
          disabled={loading}
        >
          <Text style={styles.withdrawText}>
            {loading ? 'Processing...' : 'Withdraw to Wallet'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.earningsSection}>
        <Text style={styles.sectionTitle}>Earnings History</Text>
        {earnings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyText}>No earnings yet</Text>
            <Text style={styles.emptySubtext}>
              Complete audits and deliveries to earn bounties
            </Text>
          </View>
        ) : (
          earnings.map((earning, index) => (
            <View key={index} style={styles.earningCard}>
              <View style={styles.earningIcon}>
                <Text style={styles.earningIconText}>
                  {earning.type === 'audit' ? '🔍' :
                   earning.type === 'delivery' ? '📦' :
                   earning.type === 'emergency' ? '🚨' : '💰'}
                </Text>
              </View>
              <View style={styles.earningContent}>
                <Text style={styles.earningTitle}>{earning.description}</Text>
                <Text style={styles.earningDate}>
                  {new Date(earning.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.earningAmount}>
                <Text style={styles.earningValue}>+${earning.amount}</Text>
                <Text style={styles.earningCurrency}>USDC</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.bountyRates}>
        <Text style={styles.sectionTitle}>💵 Bounty Rates</Text>
        <View style={styles.rateCard}>
          <Text style={styles.rateIcon}>🔍</Text>
          <View style={styles.rateInfo}>
            <Text style={styles.rateTitle}>BGN Quality Audit</Text>
            <Text style={styles.rateAmount}>5 USDC</Text>
          </View>
        </View>
        <View style={styles.rateCard}>
          <Text style={styles.rateIcon}>📦</Text>
          <View style={styles.rateInfo}>
            <Text style={styles.rateTitle}>Remote Area Delivery</Text>
            <Text style={styles.rateAmount}>5 USDC</Text>
          </View>
        </View>
        <View style={styles.rateCard}>
          <Text style={styles.rateIcon}>⚠️</Text>
          <View style={styles.rateInfo}>
            <Text style={styles.rateTitle}>Low Quality Alert</Text>
            <Text style={styles.rateAmount}>+3 USDC Bonus</Text>
          </View>
        </View>
        <View style={styles.rateCard}>
          <Text style={styles.rateIcon}>🚨</Text>
          <View style={styles.rateInfo}>
            <Text style={styles.rateTitle}>Emergency Assistance</Text>
            <Text style={styles.rateAmount}>10 USDC</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ How Bounties Work:</Text>
        <Text style={styles.infoText}>
          1. Complete verified audits or deliveries{'\n'}
          2. GPS and NFC verification required{'\n'}
          3. Bounty automatically credited to wallet{'\n'}
          4. Withdraw anytime to your crypto wallet{'\n'}
          5. All transactions recorded on blockchain{'\n'}
          6. Remote areas earn higher bounties
        </Text>
      </View>
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
    backgroundColor: '#FF9800',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },
  balanceCard: {
    margin: 15,
    padding: 25,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  withdrawSection: {
    margin: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  withdrawButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  withdrawText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  earningsSection: {
    margin: 15,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  earningCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  earningIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  earningIconText: {
    fontSize: 24,
  },
  earningContent: {
    flex: 1,
  },
  earningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  earningDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  earningAmount: {
    alignItems: 'flex-end',
  },
  earningValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  earningCurrency: {
    fontSize: 12,
    color: '#666',
  },
  bountyRates: {
    margin: 15,
  },
  rateCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  rateIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  rateInfo: {
    flex: 1,
  },
  rateTitle: {
    fontSize: 16,
    color: '#333',
  },
  rateAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 3,
  },
  infoBox: {
    margin: 15,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});

export default BountyWallet;
