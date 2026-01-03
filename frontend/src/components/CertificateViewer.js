import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import '../styles/viewer.css';

const CertificateViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userRole, setUserRole] = useState('STUDENT');

  useEffect(() => {
    // Get user role from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'STUDENT');
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadCertificate = async () => {
      try {
        setLoading(true);
        setError(false);

        // First get certificate details
        const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
        
        // Get certificate list to find the specific certificate
        const certificatesResponse = await api.get(`${baseUrl}/certificates`);
        const cert = certificatesResponse.data.find(c => c.certificateId === id);
        
        if (!cert) {
          throw new Error('Certificate not found');
        }
        
        setCertificate(cert);

        // Then load the file
        const viewResponse = await api.get(`${baseUrl}/certificates/${id}/view`, {
          responseType: 'blob'
        });

        if (!viewResponse.data || viewResponse.data.size === 0) {
          throw new Error('Empty response');
        }

        const blobUrl = URL.createObjectURL(viewResponse.data);
        setPreviewUrl(blobUrl);
      } catch (err) {
        console.error('Certificate load error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [id, userRole]);

  const handleDownload = async () => {
    try {
      const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
      const response = await api.get(`${baseUrl}/certificates/${id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', certificate.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleClose = () => {
    window.close();
  };

  const fileType = certificate?.fileType?.toLowerCase() || '';
  const fileName = certificate?.fileName?.toLowerCase() || '';

  const isImage = fileType.includes('image') ||
    fileType.includes('jpeg') ||
    fileType.includes('jpg') ||
    fileType.includes('png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.gif');

  if (loading) {
    return (
      <div className="viewer-container">
        <div className="viewer-loading">
          <div className="loading-spinner"></div>
          <p>Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="viewer-container">
        <div className="viewer-error">
          <div className="error-icon">❌</div>
          <h2>Certificate Not Found</h2>
          <p>The certificate you're looking for could not be loaded.</p>
          <button onClick={handleClose} className="close-btn">
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      {/* Header */}
      <div className="viewer-header">
        <div className="viewer-title">
          <h1>{certificate.certificateName}</h1>
          <p>{certificate.fileName}</p>
        </div>
        <div className="viewer-actions">
          <button onClick={handleDownload} className="viewer-btn download">
            📥 Download
          </button>
          <button onClick={handleClose} className="viewer-btn close">
            ✕ Close
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="viewer-content">
        {previewUrl && (
          <div className="viewer-preview">
            {isImage ? (
              <img
                src={previewUrl}
                alt={certificate.certificateName}
                className="viewer-image"
              />
            ) : (
              <iframe
                src={previewUrl}
                className="viewer-iframe"
                title={certificate.certificateName}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateViewer;