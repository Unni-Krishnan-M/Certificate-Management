import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import KPICard from './UI/KPICard';
import CertificateGrid from './UI/CertificateGrid';
import Settings from './Settings';


import UploadZone from './Upload/UploadZone';
import api from '../utils/axiosConfig';

const EnhancedStudentDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [certificates, setCertificates] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [certsResponse, analyticsResponse] = await Promise.all([
        api.get('/api/student/certificates'),
        api.get('/api/analytics/student/dashboard').catch(() => ({ data: { totalUploaded: 0, verified: 0, pending: 0, rejected: 0, recentUploads: [] } }))
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

  const handleUploadSuccess = () => {
    setMessage('Certificate uploaded successfully!');
    fetchData();
    setActiveSection('certificates');
  };

  const handleDownload = async (certificateId, fileName) => {
    try {
      const response = await api.get(`/api/student/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Download failed');
    }
  };

  const handleView = async (certificate) => {
    // Open window immediately to avoid popup blockers
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('<html><head><title>Loading...</title></head><body style="background:#f0f2f5;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h3>Loading Certificate...</h3></body></html>');
    }

    try {
      const response = await api.get(`/api/student/certificates/${certificate.certificateId}/view`, {
        responseType: 'blob'
      });

      const file = new Blob([response.data], { type: certificate.fileType });
      const fileURL = URL.createObjectURL(file);

      if (newWindow) {
        newWindow.location.href = fileURL;
      } else {
        // Fallback if popup blocked completely (rare if opened on click)
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

  const handleDelete = async (certificateId) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await api.delete(`/api/student/certificates/${certificateId}`);
        setMessage('Certificate deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        setError('Delete failed');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'orange', icon: '⏳' },
      VERIFIED: { color: 'green', icon: '✅' },
      REJECTED: { color: 'red', icon: '❌' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`status-badge status-${config.color}`}>
        {config.icon} {status}
      </span>
    );
  };



  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome back, {user?.fullName}! Here's your certificate summary.</p>
      </div>

      <div className="kpi-grid">
        <KPICard
          title="Total Uploaded"
          value={analytics.totalUploaded || 0}
          icon="📤"
          color="blue"
          trend={5}
        />
        <KPICard
          title="Verified"
          value={analytics.verified || 0}
          icon="✅"
          color="green"
          trend={12}
        />
        <KPICard
          title="Pending"
          value={analytics.pending || 0}
          icon="⏳"
          color="orange"
        />
        <KPICard
          title="Rejected"
          value={analytics.rejected || 0}
          icon="❌"
          color="red"
        />
      </div>

      <div className="dashboard-widgets">
        <div className="widget recent-uploads">
          <h3>Recent Uploads</h3>
          <div className="timeline">
            {analytics.recentUploads?.slice(0, 5).map(cert => (
              <div key={cert.certificateId} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>{cert.certificateName}</h4>
                  <p>{getStatusBadge(cert.status)}</p>
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
              onClick={() => setActiveSection('upload')}
            >
              📤 Upload Certificate
            </button>
            <button
              className="quick-action-btn secondary"
              onClick={() => setActiveSection('certificates')}
            >
              📜 View All Certificates
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="certificates-content">
      <div className="page-header">
        <h2>My Certificates</h2>
        <p>Manage and track your uploaded certificates</p>
      </div>

      <CertificateGrid
        certificates={certificates}
        onDownload={handleDownload}
        onView={handleView}
        onDelete={handleDelete}
        userRole="STUDENT"
        showSearch={true}
        showFilters={true}
      />
    </div>
  );

  const renderUpload = () => (
    <div className="upload-content">
      <div className="page-header">
        <h2>Upload Certificate</h2>
        <p>Upload your certificates for verification</p>
      </div>

      <UploadZone onUploadSuccess={handleUploadSuccess} />
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'certificates':
        return renderCertificates();
      case 'upload':
        return renderUpload();
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


    </div>
  );
};

export default EnhancedStudentDashboard;