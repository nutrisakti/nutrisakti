import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import web3Service from '../services/web3Service';
import './MedicalRecordSync.css';

const MedicalRecordSync = () => {
  const [scanning, setScanning] = useState(false);
  const [motherData, setMotherData] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScan = async (data) => {
    if (data) {
      setScanning(false);
      setLoading(true);
      try {
        const qrData = JSON.parse(data.text);
        
        // Request access using Zero-Knowledge Proof
        const accessRequest = await web3Service.requestMedicalRecordAccess({
          motherDID: qrData.did,
          hospitalId: await web3Service.getHospitalId(),
          purpose: 'medical_consultation',
        });

        if (accessRequest.granted) {
          setAccessGranted(true);
          
          // Fetch health records with ZKP verification
          const records = await web3Service.getHealthRecordsWithZKP(qrData.did);
          setMotherData(qrData);
          setHealthRecords(records);
        } else {
          alert('Access denied. Patient consent required.');
        }
      } catch (error) {
        console.error('Scan error:', error);
        alert('Failed to access medical records');
      } finally {
        setLoading(false);
      }
    }
  };

  const syncToHospitalSystem = async () => {
    setLoading(true);
    try {
      const result = await web3Service.syncToHospitalDatabase({
        motherDID: motherData.did,
        records: healthRecords,
        zkProof: true,
      });

      if (result.success) {
        alert('Medical records synced successfully!\n\nPatient confidentiality maintained via Zero-Knowledge Proofs.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync records');
    } finally {
      setLoading(false);
    }
  };

  const addNewRecord = async (recordData) => {
    setLoading(true);
    try {
      const result = await web3Service.addMedicalRecord({
        motherDID: motherData.did,
        ...recordData,
        providerId: await web3Service.getProviderId(),
      });

      if (result.success) {
        alert('Record added successfully!');
        // Reload records
        const records = await web3Service.getHealthRecordsWithZKP(motherData.did);
        setHealthRecords(records);
      }
    } catch (error) {
      console.error('Add record error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-sync-container">
      <div className="sync-header">
        <h1>🏥 Medical Record Sync</h1>
        <p>Secure Bridge with Zero-Knowledge Proofs</p>
      </div>

      {!motherData ? (
        <div className="scan-section">
          <div className="scan-card">
            <div className="scan-icon">📱</div>
            <h3>Scan Patient's Digital Health Book</h3>
            <p>Patient must provide consent by showing QR code</p>
            <button
              className="scan-button"
              onClick={() => setScanning(true)}
            >
              📲 Start Scanner
            </button>
          </div>

          {scanning && (
            <div className="scanner-modal">
              <div className="scanner-content">
                <button className="close-scanner" onClick={() => setScanning(false)}>×</button>
                <h3>Scan Patient QR Code</h3>
                <QrScanner
                  delay={300}
                  onError={(error) => console.error(error)}
                  onScan={handleScan}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          <div className="privacy-notice">
            <h4>🔐 Privacy Protection</h4>
            <p>
              This system uses Zero-Knowledge Proofs to verify patient data without exposing sensitive information. 
              All access is logged on-chain and requires patient consent.
            </p>
          </div>
        </div>
      ) : (
        <div className="records-section">
          <div className="patient-header">
            <div className="patient-info">
              <h2>{motherData.name}</h2>
              <p>DID: {motherData.did.slice(0, 20)}...</p>
              <p>Age: {motherData.age} | Phase: {motherData.phase}</p>
            </div>
            <div className="access-badge">
              <span className="badge-icon">✅</span>
              <span className="badge-text">Access Granted via ZKP</span>
            </div>
          </div>

          <div className="records-tabs">
            <button className="tab active">Health History</button>
            <button className="tab">Vaccinations</button>
            <button className="tab">Growth Charts</button>
            <button className="tab">Medications</button>
          </div>

          <div className="records-list">
            {healthRecords.map((record, index) => (
              <div key={index} className="record-card">
                <div className="record-header">
                  <div className="record-icon">
                    {record.type === 'vaccination' ? '💉' :
                     record.type === 'checkup' ? '🩺' :
                     record.type === 'growth' ? '📏' :
                     record.type === 'medication' ? '💊' : '📝'}
                  </div>
                  <div className="record-info">
                    <h4>{record.title}</h4>
                    <p className="record-date">{new Date(record.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="record-verified">
                    <span className="verified-icon">⛓️</span>
                    <span className="verified-text">On-Chain</span>
                  </div>
                </div>
                <div className="record-details">
                  <p>{record.details}</p>
                  {record.measurements && (
                    <div className="measurements">
                      {record.measurements.weight && <span>Weight: {record.measurements.weight}kg</span>}
                      {record.measurements.height && <span>Height: {record.measurements.height}cm</span>}
                      {record.measurements.temperature && <span>Temp: {record.measurements.temperature}°C</span>}
                    </div>
                  )}
                </div>
                {record.provider && (
                  <div className="record-provider">
                    Provider: {record.provider} | Verified: {record.verified ? '✓' : '✗'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button
              className="sync-button"
              onClick={syncToHospitalSystem}
              disabled={loading}
            >
              {loading ? 'Syncing...' : '🔄 Sync to Hospital Database'}
            </button>
            <button
              className="add-button"
              onClick={() => {
                const type = prompt('Record type (vaccination/checkup/growth/medication):');
                const title = prompt('Title:');
                const details = prompt('Details:');
                if (type && title && details) {
                  addNewRecord({ type, title, details });
                }
              }}
            >
              ➕ Add New Record
            </button>
            <button
              className="close-button"
              onClick={() => {
                setMotherData(null);
                setHealthRecords([]);
                setAccessGranted(false);
              }}
            >
              Close Session
            </button>
          </div>

          <div className="zkp-explanation">
            <h3>🔐 How Zero-Knowledge Proofs Work:</h3>
            <div className="zkp-steps">
              <div className="zkp-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Patient Consent</h4>
                  <p>Mother shows QR code granting temporary access</p>
                </div>
              </div>
              <div className="zkp-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>ZKP Verification</h4>
                  <p>System verifies identity without exposing private data</p>
                </div>
              </div>
              <div className="zkp-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Secure Access</h4>
                  <p>Doctor sees complete history while privacy is maintained</p>
                </div>
              </div>
              <div className="zkp-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Audit Trail</h4>
                  <p>All access logged on blockchain for accountability</p>
                </div>
              </div>
            </div>
          </div>

          <div className="compliance-section">
            <h3>✅ Compliance & Standards</h3>
            <div className="compliance-badges">
              <div className="compliance-badge">
                <span className="badge-icon">🇮🇩</span>
                <span className="badge-text">Indonesian Data Protection (UU ITE)</span>
              </div>
              <div className="compliance-badge">
                <span className="badge-icon">🏥</span>
                <span className="badge-text">WHO Health Data Standards</span>
              </div>
              <div className="compliance-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">HIPAA-Equivalent Privacy</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordSync;
