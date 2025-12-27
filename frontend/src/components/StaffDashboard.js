import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import KPICard from './UI/KPICard';
import CertificateGrid from './UI/CertificateGrid';
import Settings from './Settings';
import Reports from './Reports';
import AuthenticatedPreview from './UI/AuthenticatedPreview';

import api from '../utils/axiosConfig';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [certificates, setCertificates] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [certsResponse, analyticsResponse] = await Promise.all([
        api.get('/api/staff/certificates'),
        api.get('/api/analytics/staff/dashboard').catch(() => ({ data: { totalCertificates: 0, pendingReview: 0, verified: 0, rejected: 0, recentActivity: [] } }))
      ]);

      setCertificates(certsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (certificateId) => {
    try {
      await api.put(`/api/staff/certificates/${certificateId}/verify`, {
        remarks: remarks
      });
      setMessage('Certificate verified successfully');
      setSelectedCertificate(null);
      setRemarks('');
      fetchData();
    } catch (error) {
      console.error('Verify error:', error);
      setError('Verification failed');
    }
  };

  const handleReject = async (certificateId) => {
    try {
      await api.put(`/api/staff/certificates/${certificateId}/reject`, {
        remarks: remarks
      });
      setMessage('Certificate rejected successfully');
      setSelectedCertificate(null);
      setRemarks('');
      fetchData();
    } catch (error) {
      console.error('Reject error:', error);
      setError('Rejection failed');
    }
  };

  const handleView = async (certificate) => {
    // Open window immediately to avoid popup blockers
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('<html><head><title>Loading...</title></head><body style="background:#f0f2f5;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h3>Loading Certificate...</h3></body></html>');
    }

    try {
      const response = await api.get(`/api/staff/certificates/${certificate.certificateId}/view`, {
        responseType: 'blob'
      });

      const file = new Blob([response.data], { type: certificate.fileType });
      const fileURL = URL.createObjectURL(file);

      if (newWindow) {
        newWindow.location.href = fileURL;
      } else {
        window.open(fileURL, '_blank');
      }
    } catch (error) {
      console.error('View error:', error);
      if (newWindow) {
        newWindow.document.body.innerHTML = '<h3 style="color:red;text-align:center;">Failed to load certificate.</h3><p style="text-align:center;">Please try downloading instead.</p>';
      } else {
        setError('Failed to view certificate');
      }
    }
  };

  const openModal = (certificate) => {
    setSelectedCertificate(certificate);
    setRemarks(certificate.staffRemarks || '');
  };

  const closeModal = () => {
    setSelectedCertificate(null);
    setRemarks('');
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status.toLowerCase()}`;
    return <span className={statusClass}>{status}</span>;
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="page-header">
        <h2>Staff Dashboard</h2>
        <p>Welcome back, {user?.fullName}! Here's your verification overview.</p>
      </div>

      <div className="kpi-grid">
        <KPICard
          title="Total Certificates"
          value={analytics.totalCertificates || 0}
          icon="📜"
          color="blue"
        />
        <KPICard
          title="Pending Review"
          value={analytics.pendingReview || 0}
          icon="⏳"
          color="orange"
        />
        <KPICard
          title="Verified"
          value={analytics.verified || 0}
          icon="✅"
          color="green"
        />
        <KPICard
          title="Rejected"
          value={analytics.rejected || 0}
          icon="❌"
          color="red"
        />
      </div>

      <div className="dashboard-widgets">
        <div className="widget recent-activity">
          <h3>Recent Activity</h3>
          <div className="timeline">
            {analytics.recentActivity?.slice(0, 8).map(cert => (
              <div key={cert.certificateId} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>{cert.certificateName}</h4>
                  <p><strong>Student:</strong> {cert.studentName}</p>
                  <span className="timeline-date">
                    {new Date(cert.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button
              className="quick-action-btn primary"
              onClick={() => setActiveSection('verification')}
            >
              ✅ Verification Queue
            </button>
            <button
              className="quick-action-btn secondary"
              onClick={() => setActiveSection('certificates')}
            >
              📜 All Certificates
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="certificates-content">
      <div className="page-header">
        <h2>All Certificates</h2>
        <p>View and manage all student certificates</p>
      </div>

      <CertificateGrid
        certificates={certificates}
        onReview={openModal}
        onView={handleView}
        userRole="STAFF"
        showSearch={true}
        showFilters={true}
      />
    </div>
  );

  const renderVerificationQueue = () => {
    const pendingCertificates = certificates.filter(cert => cert.status === 'PENDING');

    return (
      <div className="verification-content">
        <div className="page-header">
          <h2>Verification Queue</h2>
          <p>Review pending certificates ({pendingCertificates.length} pending)</p>
        </div>

        <CertificateGrid
          certificates={pendingCertificates}
          onReview={openModal}
          onView={handleView}
          userRole="STAFF"
          showSearch={true}
          showFilters={false}
        />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'certificates':
        return renderCertificates();
      case 'verification':
        return renderVerificationQueue();
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="main-content">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          {renderContent()}
        </main>
      </div>

      {selectedCertificate && (
        <div className="modal">
          <div className="modal-content">
            <h3>Review Certificate: {selectedCertificate.certificateName}</h3>
            <p><strong>Student:</strong> {selectedCertificate.studentName}</p>
            <p><strong>Current Status:</strong> {getStatusBadge(selectedCertificate.status)}</p>

            <div className="review-preview-section" style={{
              margin: '1rem 0',
              height: '400px',
              border: '1px solid #eee',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#f9fafb'
            }}>
              <AuthenticatedPreview
                certificate={selectedCertificate}
                userRole="STAFF"
              />
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="4"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
                placeholder="Add your remarks here..."
              />
            </div>

            <div className="modal-actions">
              <button onClick={closeModal} className="btn">Cancel</button>
              <button
                onClick={() => handleReject(selectedCertificate.certificateId)}
                className="btn btn-danger"
              >
                Reject
              </button>
              <button
                onClick={() => handleVerify(selectedCertificate.certificateId)}
                className="btn btn-success"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default StaffDashboard;