import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CertificatePreview = ({ certificate, userRole, onError }) => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isPDF = certificate.fileType?.includes('pdf');
  const isImage = certificate.fileType?.includes('image');

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    return '📎';
  };

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(false);

        const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
        const response = await axios.get(`${baseUrl}/certificates/${certificate.certificateId}/view`, {
          responseType: isImage ? 'blob' : 'blob'
        });

        if (isImage) {
          const imageUrl = URL.createObjectURL(response.data);
          setPreviewData(imageUrl);
        } else if (isPDF) {
          const pdfUrl = URL.createObjectURL(response.data);
          setPreviewData(pdfUrl);
        }
      } catch (err) {
        console.error('Preview load error:', err);
        setError(true);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    if (isImage || isPDF) {
      loadPreview();
    } else {
      setLoading(false);
    }

    // Cleanup function to revoke object URLs
    return () => {
      if (previewData && (isImage || isPDF)) {
        URL.revokeObjectURL(previewData);
      }
    };
  }, [certificate.certificateId, userRole, isImage, isPDF, onError]);

  if (loading) {
    return (
      <div className="preview-loading">
        <div className="loading-spinner-small"></div>
        <span>Loading preview...</span>
      </div>
    );
  }

  if (error || (!isImage && !isPDF)) {
    return (
      <div className="file-placeholder">
        <div className="file-icon">{getFileTypeIcon(certificate.fileType)}</div>
        <span className="file-type">{certificate.fileType || 'Unknown'}</span>
        {error && <span className="error-text">Preview unavailable</span>}
      </div>
    );
  }

  if (isImage && previewData) {
    return (
      <img
        src={previewData}
        alt={certificate.certificateName}
        className="certificate-preview-image"
        onError={() => {
          setError(true);
          onError?.();
        }}
      />
    );
  }

  if (isPDF && previewData) {
    return (
      <div className="pdf-preview-container">
        <iframe
          src={previewData}
          className="certificate-preview-pdf"
          title={certificate.certificateName}
          onError={() => {
            setError(true);
            onError?.();
          }}
        />
        <div className="pdf-overlay">
          <div className="pdf-icon">📄</div>
          <span>PDF Document</span>
          <button 
            className="pdf-open-btn"
            onClick={() => window.open(previewData, '_blank')}
          >
            Open Full View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-placeholder">
      <div className="file-icon">{getFileTypeIcon(certificate.fileType)}</div>
      <span className="file-type">No preview available</span>
    </div>
  );
};

export default CertificatePreview;