import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import web3Service from '../services/web3Service';
import './FundManagement.css';

const FundManagement = () => {
  const [poolBalance, setPoolBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [sroi, setSroi] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFundData();
    calculateSROI();
  }, []);

  const loadFundData = async () => {
    try {
      const balance = await web3Service.getPoolBalance();
      setPoolBalance(balance);
      
      const allocs = await web3Service.getAllocations();
      setAllocations(allocs);
    } catch (error) {
      console.error('Load fund data error:', error);
    }
  };

  const calculateSROI = async () => {
    try {
      const data = await web3Service.getSROIData();
      setSroi(data);
    } catch (error) {
      console.error('Calculate SROI error:', error);
    }
  };

  const depositFunds = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const result = await web3Service.depositToPool(depositAmount);
      if (result.success) {
        alert(`Successfully deposited ${depositAmount} USDC!\n\nTransaction: ${result.txHash}`);
        setDepositAmount('');
        loadFundData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to deposit funds');
    } finally {
      setLoading(false);
    }
  };

  const allocateToRegion = async (region, amount) => {
    setLoading(true);
    try {
      const result = await web3Service.allocateFunds(region, amount);
      if (result.success) {
        alert(`Allocated ${amount} USDC to ${region}`);
        loadFundData();
      }
    } catch (error) {
      console.error('Allocation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fund-management-container">
      <div className="fund-header">
        <h1>💰 Fund Management</h1>
        <p>Stunting-Free Bounty Pool</p>
      </div>

      <div className="pool-overview">
        <div className="pool-card">
          <div className="pool-icon">🏦</div>
          <div className="pool-info">
            <div className="pool-label">Total Pool Balance</div>
            <div className="pool-value">${poolBalance.toLocaleString()} USDC</div>
          </div>
        </div>

        <div className="deposit-section">
          <h3>Deposit to Pool</h3>
          <div className="deposit-form">
            <input
              type="number"
              placeholder="Amount in USDC"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="deposit-input"
            />
            <button
              onClick={depositFunds}
              disabled={loading}
              className="deposit-button"
            >
              {loading ? 'Processing...' : 'Deposit USDC'}
            </button>
          </div>
        </div>
      </div>

      <div className="sroi-section">
        <h2>📈 Social Return on Investment (SROI)</h2>
        {sroi && (
          <div className="sroi-grid">
            <div className="sroi-card">
              <div className="sroi-label">Total Investment</div>
              <div className="sroi-value">${sroi.totalInvestment.toLocaleString()}</div>
            </div>
            <div className="sroi-card">
              <div className="sroi-label">Kits Delivered</div>
              <div className="sroi-value">{sroi.kitsDelivered.toLocaleString()}</div>
            </div>
            <div className="sroi-card">
              <div className="sroi-label">Mothers Reached</div>
              <div className="sroi-value">{sroi.mothersReached.toLocaleString()}</div>
            </div>
            <div className="sroi-card">
              <div className="sroi-label">Stunting Reduction</div>
              <div className="sroi-value">{sroi.stuntingReduction}%</div>
            </div>
            <div className="sroi-card highlight">
              <div className="sroi-label">SROI Ratio</div>
              <div className="sroi-value">{sroi.sroiRatio}:1</div>
              <div className="sroi-subtext">
                Every $1 invested generates ${sroi.sroiRatio} in social value
              </div>
            </div>
            <div className="sroi-card">
              <div className="sroi-label">Cost per Beneficiary</div>
              <div className="sroi-value">${sroi.costPerBeneficiary}</div>
            </div>
          </div>
        )}
      </div>

      <div className="allocations-section">
        <h2>🗺️ Regional Allocations</h2>
        <div className="allocations-table">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Allocated</th>
                <th>Disbursed</th>
                <th>Remaining</th>
                <th>Efficiency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((alloc) => (
                <tr key={alloc.region}>
                  <td>{alloc.region}</td>
                  <td>${alloc.allocated.toLocaleString()}</td>
                  <td>${alloc.disbursed.toLocaleString()}</td>
                  <td>${alloc.remaining.toLocaleString()}</td>
                  <td>
                    <div className="efficiency-bar">
                      <div
                        className="efficiency-fill"
                        style={{
                          width: `${(alloc.disbursed / alloc.allocated) * 100}%`,
                          backgroundColor: alloc.efficiency >= 80 ? '#4CAF50' : alloc.efficiency >= 60 ? '#FF9800' : '#F44336',
                        }}
                      />
                      <span>{alloc.efficiency}%</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="allocate-button"
                      onClick={() => {
                        const amount = prompt(`Allocate additional funds to ${alloc.region}:`);
                        if (amount) allocateToRegion(alloc.region, amount);
                      }}
                    >
                      + Allocate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="impact-metrics">
        <h2>🎯 Impact Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">👶</div>
            <div className="metric-content">
              <div className="metric-value">2,847</div>
              <div className="metric-label">Lives Impacted</div>
              <div className="metric-change positive">+12% this month</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📉</div>
            <div className="metric-content">
              <div className="metric-value">-18%</div>
              <div className="metric-label">Stunting Rate Change</div>
              <div className="metric-change positive">Significant improvement</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🏥</div>
            <div className="metric-content">
              <div className="metric-value">87%</div>
              <div className="metric-label">BPJS Enrollment</div>
              <div className="metric-change positive">+23% from baseline</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-content">
              <div className="metric-value">2.3 days</div>
              <div className="metric-label">Avg. Kit Delivery Time</div>
              <div className="metric-change positive">-40% faster</div>
            </div>
          </div>
        </div>
      </div>

      <div className="blockchain-verification">
        <h2>⛓️ Blockchain Verification</h2>
        <div className="verification-info">
          <p>All fund movements are recorded on Polygon blockchain for complete transparency.</p>
          <div className="verification-links">
            <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer">
              View Contract on PolygonScan
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Generating audit report...'); }}>
              Download Audit Report
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundManagement;
