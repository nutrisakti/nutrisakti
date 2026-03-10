import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import web3Service from '../services/web3Service';
import './AuditTrailMap.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AuditTrailMap = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [stuntingData, setStuntingData] = useState(null);
  const [kitDistribution, setKitDistribution] = useState(null);
  const [bpjsCoverage, setBpjsCoverage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await web3Service.getDashboardData();
      setRegions(data.regions);
      setStuntingData(data.stuntingData);
      setKitDistribution(data.kitDistribution);
      setBpjsCoverage(data.bpjsCoverage);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStuntingColor = (riskLevel) => {
    if (riskLevel >= 40) return '#F44336'; // High risk - Red
    if (riskLevel >= 20) return '#FF9800'; // Medium risk - Orange
    return '#4CAF50'; // Low risk - Green
  };

  const stuntingChartData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      data: stuntingData ? [
        stuntingData.highRisk,
        stuntingData.mediumRisk,
        stuntingData.lowRisk
      ] : [0, 0, 0],
      backgroundColor: ['#F44336', '#FF9800', '#4CAF50'],
    }],
  };

  const kitDistributionData = {
    labels: kitDistribution ? kitDistribution.map(k => k.region) : [],
    datasets: [
      {
        label: 'Kits Requested',
        data: kitDistribution ? kitDistribution.map(k => k.requested) : [],
        backgroundColor: '#2196F3',
      },
      {
        label: 'Kits Delivered',
        data: kitDistribution ? kitDistribution.map(k => k.delivered) : [],
        backgroundColor: '#4CAF50',
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🗺️ NutriSakti Impact Dashboard</h1>
        <p>Real-time On-Chain Audit Trail - Eastern Indonesia</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👶</div>
          <div className="stat-content">
            <div className="stat-value">{regions.reduce((sum, r) => sum + r.totalMothers, 0)}</div>
            <div className="stat-label">Total Mothers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">
              {kitDistribution ? kitDistribution.reduce((sum, k) => sum + k.delivered, 0) : 0}
            </div>
            <div className="stat-label">Kits Delivered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              ${regions.reduce((sum, r) => sum + r.totalDisbursed, 0).toLocaleString()}
            </div>
            <div className="stat-label">USDC Disbursed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <div className="stat-value">
              {bpjsCoverage ? `${bpjsCoverage.coverageRate}%` : '0%'}
            </div>
            <div className="stat-label">BPJS Coverage</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="map-section">
          <h2>Regional Distribution Map</h2>
          <MapContainer
            center={[-8.5, 120.0]}
            zoom={6}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {regions.map((region) => (
              <React.Fragment key={region.id}>
                <Circle
                  center={[region.lat, region.lng]}
                  radius={region.stuntingRisk * 1000}
                  pathOptions={{
                    color: getStuntingColor(region.stuntingRisk),
                    fillColor: getStuntingColor(region.stuntingRisk),
                    fillOpacity: 0.3,
                  }}
                />
                <Marker position={[region.lat, region.lng]}>
                  <Popup>
                    <div className="popup-content">
                      <h3>{region.name}</h3>
                      <p><strong>Mothers:</strong> {region.totalMothers}</p>
                      <p><strong>Stunting Risk:</strong> {region.stuntingRisk}%</p>
                      <p><strong>BPJS Coverage:</strong> {region.bpjsCoverage}%</p>
                      <p><strong>Kits Delivered:</strong> {region.kitsDelivered}</p>
                      <button onClick={() => setSelectedRegion(region)}>
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        <div className="charts-section">
          <div className="chart-card">
            <h3>Stunting Risk Distribution</h3>
            <Pie data={stuntingChartData} />
          </div>
          <div className="chart-card">
            <h3>Kit Distribution Efficiency</h3>
            <Bar data={kitDistributionData} />
          </div>
        </div>
      </div>

      {selectedRegion && (
        <div className="region-detail-modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setSelectedRegion(null)}>×</button>
            <h2>{selectedRegion.name} - Detailed Analytics</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Total Mothers:</span>
                <span className="detail-value">{selectedRegion.totalMothers}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Stunting Risk:</span>
                <span className="detail-value" style={{ color: getStuntingColor(selectedRegion.stuntingRisk) }}>
                  {selectedRegion.stuntingRisk}%
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">BPJS Coverage:</span>
                <span className="detail-value">{selectedRegion.bpjsCoverage}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Kits Requested:</span>
                <span className="detail-value">{selectedRegion.kitsRequested}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Kits Delivered:</span>
                <span className="detail-value">{selectedRegion.kitsDelivered}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Delivery Efficiency:</span>
                <span className="detail-value">
                  {((selectedRegion.kitsDelivered / selectedRegion.kitsRequested) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Disbursed:</span>
                <span className="detail-value">${selectedRegion.totalDisbursed.toLocaleString()} USDC</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Priority Mothers:</span>
                <span className="detail-value">{selectedRegion.priorityMothers}</span>
              </div>
            </div>
            <div className="blockchain-link">
              <a href={`https://polygonscan.com/address/${selectedRegion.contractAddress}`} target="_blank" rel="noopener noreferrer">
                🔗 View on Blockchain
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="transparency-section">
        <h2>🔍 100% Transparency Guarantee</h2>
        <div className="transparency-cards">
          <div className="transparency-card">
            <h3>⛓️ On-Chain Audit Trail</h3>
            <p>Every transaction recorded on Polygon blockchain</p>
            <p className="transparency-stat">100% Immutable</p>
          </div>
          <div className="transparency-card">
            <h3>💸 Zero Aid Diversion</h3>
            <p>USDC payments only released on proof of delivery</p>
            <p className="transparency-stat">0% Corruption</p>
          </div>
          <div className="transparency-card">
            <h3>📊 Real-Time Reconciliation</h3>
            <p>Funds tracked from deposit to beneficiary</p>
            <p className="transparency-stat">Live Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailMap;
