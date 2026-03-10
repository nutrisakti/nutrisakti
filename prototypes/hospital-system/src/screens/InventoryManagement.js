import React, { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import web3Service from '../services/web3Service';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    loadInventory();
    checkLowStock();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await web3Service.getHospitalInventory();
      setInventory(data);
    } catch (error) {
      console.error('Load inventory error:', error);
    }
  };

  const checkLowStock = async () => {
    try {
      const alerts = await web3Service.getLowStockAlerts();
      setLowStockAlerts(alerts);
    } catch (error) {
      console.error('Check low stock error:', error);
    }
  };

  const handleScan = async (data) => {
    if (data) {
      setScanning(false);
      try {
        const kitData = JSON.parse(data.text);
        
        if (deliveryMode) {
          await processDelivery(kitData);
        } else {
          setSelectedKit(kitData);
        }
      } catch (error) {
        console.error('Scan error:', error);
        alert('Invalid QR code');
      }
    }
  };

  const processDelivery = async (kitData) => {
    try {
      const result = await web3Service.recordKitDelivery({
        kitId: kitData.kitId,
        motherId: kitData.motherId,
        timestamp: Date.now(),
      });

      if (result.success) {
        alert(`Kit delivered successfully!\n\nKit ID: ${kitData.kitId}\nMother: ${kitData.motherName}\n\nInventory updated automatically.\nNGO notified for replenishment.`);
        loadInventory();
        checkLowStock();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Delivery error:', error);
      alert('Failed to process delivery');
    }
  };

  const requestReplenishment = async (kitType, quantity) => {
    try {
      const result = await web3Service.requestReplenishment({
        kitType,
        quantity,
        urgency: 'normal',
      });

      if (result.success) {
        alert(`Replenishment request sent!\n\nKit Type: ${kitType}\nQuantity: ${quantity}\n\nNGO/Government will be notified.`);
      }
    } catch (error) {
      console.error('Replenishment error:', error);
    }
  };

  const chartData = inventory.map(item => ({
    name: item.kitType,
    current: item.currentStock,
    minimum: item.minimumStock,
    optimal: item.optimalStock,
  }));

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>📦 Inventory Management</h1>
        <p>Maternal-Baby Kit Stock Ledger</p>
      </div>

      {lowStockAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>⚠️ Low Stock Alerts</h3>
          {lowStockAlerts.map((alert, index) => (
            <div key={index} className="alert-card">
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <div className="alert-title">{alert.kitType}</div>
                <div className="alert-message">
                  Only {alert.currentStock} units remaining (Minimum: {alert.minimumStock})
                </div>
              </div>
              <button
                className="alert-action"
                onClick={() => requestReplenishment(alert.kitType, alert.recommendedOrder)}
              >
                Request {alert.recommendedOrder} Units
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="action-buttons">
        <button
          className={`action-button ${deliveryMode ? 'active' : ''}`}
          onClick={() => {
            setDeliveryMode(true);
            setScanning(true);
          }}
        >
          📲 Scan for Delivery
        </button>
        <button
          className="action-button"
          onClick={() => {
            setDeliveryMode(false);
            setScanning(true);
          }}
        >
          🔍 Check Kit Details
        </button>
      </div>

      {scanning && (
        <div className="scanner-modal">
          <div className="scanner-content">
            <button className="close-scanner" onClick={() => setScanning(false)}>×</button>
            <h3>{deliveryMode ? 'Scan Kit for Delivery' : 'Scan Kit Barcode'}</h3>
            <QrScanner
              delay={300}
              onError={(error) => console.error(error)}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      <div className="inventory-chart">
        <h3>Stock Levels Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#2196F3" name="Current Stock" />
            <Bar dataKey="minimum" fill="#FF9800" name="Minimum Required" />
            <Bar dataKey="optimal" fill="#4CAF50" name="Optimal Level" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="inventory-table">
        <h3>Detailed Inventory</h3>
        <table>
          <thead>
            <tr>
              <th>Kit Type</th>
              <th>Current Stock</th>
              <th>Min. Required</th>
              <th>Optimal Level</th>
              <th>Status</th>
              <th>Last Restocked</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.kitType}>
                <td>{item.kitType}</td>
                <td>{item.currentStock}</td>
                <td>{item.minimumStock}</td>
                <td>{item.optimalStock}</td>
                <td>
                  <span className={`status-badge ${
                    item.currentStock < item.minimumStock ? 'critical' :
                    item.currentStock < item.optimalStock ? 'warning' : 'good'
                  }`}>
                    {item.currentStock < item.minimumStock ? 'Critical' :
                     item.currentStock < item.optimalStock ? 'Low' : 'Good'}
                  </span>
                </td>
                <td>{new Date(item.lastRestocked).toLocaleDateString()}</td>
                <td>
                  <button
                    className="table-action-button"
                    onClick={() => requestReplenishment(item.kitType, item.optimalStock - item.currentStock)}
                  >
                    Request Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="delivery-history">
        <h3>Recent Deliveries</h3>
        <div className="history-list">
          {inventory.map((item) =>
            item.recentDeliveries?.map((delivery, index) => (
              <div key={`${item.kitType}-${index}`} className="history-item">
                <div className="history-icon">✅</div>
                <div className="history-content">
                  <div className="history-title">{item.kitType} delivered</div>
                  <div className="history-details">
                    Mother ID: {delivery.motherId} | {new Date(delivery.timestamp).toLocaleString()}
                  </div>
                </div>
                <a
                  href={`https://polygonscan.com/tx/${delivery.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="history-link"
                >
                  View on Blockchain
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="info-section">
        <h3>ℹ️ How Proof of Delivery Works:</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-number">1</div>
            <div className="info-text">Mother arrives to collect kit</div>
          </div>
          <div className="info-card">
            <div className="info-number">2</div>
            <div className="info-text">Staff scans kit barcode/QR code</div>
          </div>
          <div className="info-card">
            <div className="info-number">3</div>
            <div className="info-text">System verifies mother's eligibility</div>
          </div>
          <div className="info-card">
            <div className="info-number">4</div>
            <div className="info-text">Delivery recorded on blockchain</div>
          </div>
          <div className="info-card">
            <div className="info-number">5</div>
            <div className="info-text">Inventory automatically updated</div>
          </div>
          <div className="info-card">
            <div className="info-number">6</div>
            <div className="info-text">NGO/Government notified if low stock</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
