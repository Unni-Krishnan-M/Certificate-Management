import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CertificateViewer from './CertificateViewer';
import axios from 'axios';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadData, setUploadData] = useState({
    certificateName: '',
    file: null
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewingCertificate, setViewingCertificate] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/student/certificates');
      setCertificates(response.data);
    } catch (error) {
      setError('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.certificateName) {
      setError('Please provide certificate name and file');
      return;
    }

    const formData = new FormData();
    formData.append('certificateName', uploadData.certificateName);
    formData.append('file', uploadData.file);

    try {
      await axios.post('/api/student/certificates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage('Certificate uploaded successfully!');
      setUploadData({ certificateName: '', file: null });
      fetchCertificates();
      
      // Clear file input
      document.getElementById('fileInput').value = '';
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
    }
  };

  const handleDownload = async (certificateId, fileName) => {
    try {
      const response = await axios.get(`/api/student/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Download failed');
    }
  };

  const handleDelete = async (certificateId) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await axios.delete(`/api/student/certificates/${certificateId}`);
        setMessage('Certificate deleted successfully');
        fetchCertificates();
      } catch (error) {
        setError('Delete failed');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status.toLowerCase()}`;
    return <span className={statusClass}>{status}</span>;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div>
          <span>Welcome, {user.fullName}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="upload-section">
        <h2>Upload Certificate</h2>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>Certificate Name</label>
            <input
              type="text"
              value={uploadData.certificateName}
              onChange={(e) => setUploadData({...uploadData, certificateName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Certificate File (PDF, JPG, PNG)</label>
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Upload Certificate</button>
        </form>
      </div>

      <div>
        <h2>My Certificates</h2>
        <div className="certificates-grid">
          {certificates.map((cert) => (
            <div key={cert.certificateId} className="certificate-card">
              <h3>{cert.certificateName}</h3>
              <p><strong>Status:</strong> {getStatusBadge(cert.status)}</p>
              <p><strong>Uploaded:</strong> {new Date(cert.uploadDate).toLocaleDateString()}</p>
              {cert.staffRemarks && (
                <p><strong>Remarks:</strong> {cert.staffRemarks}</p>
              )}
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={() => setViewingCertificate(cert)}
                  className="btn btn-view"
                  style={{ marginRight: '0.5rem' }}
                >
                  View
                </button>
                <button 
                  onClick={() => handleDownload(cert.certificateId, cert.fileName)}
                  className="btn btn-primary"
                  style={{ marginRight: '0.5rem' }}
                >
                  Download
                </button>
                {cert.status === 'REJECTED' && (
                  <button 
                    onClick={() => handleDelete(cert.certificateId)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewingCertificate && (
        <CertificateViewer
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
          userRole="STUDENT"
        />
      )}
    </div>
  );
};

export default StudentDashboard;