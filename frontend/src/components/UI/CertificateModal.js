import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

const CertificateModal = ({ certificate, userRole, isOpen, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen
  const [showHint, setShowHint] = useState(true);

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

  // Hide hint after 3 seconds
  useEffect(() => {
    if (isOpen && isFullscreen) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            setIsFullscreen(!isFullscreen);
          }
          break;
        case 'd':
        case 'D':
          if (!e.ctrlKey && !e.metaKey) {
            handleDownload();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isFullscreen, onClose]);

  useEffect(() => {
    if (!isOpen || !certificate?.certificateId) {
      setPreviewUrl(null);
      setLoading(false);
      setError(false);
      return;
    }

    let active = true;
    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(false);

        console.log('CertificateModal: Loading preview for certificate:', certificate.certificateId);

        const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
        const url = `${baseUrl}/certificates/${certificate.certificateId}/view`;

        const response = await api.get(url, {
          responseType: 'blob'
        });

        console.log('CertificateModal: Response received:', response.status, response.data?.size);

        if (!response.data || response.data.size === 0) {
          throw new Error('Empty response');
        }

        if (active) {
          const blobUrl = URL.createObjectURL(response.data);
          console.log('CertificateModal: Created blob URL:', blobUrl);
          setPreviewUrl(blobUrl);
        }
      } catch (err) {
        console.error('CertificateModal: Preview load error:', err);
        if (active) {
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    // Add a small delay to ensure the modal is fully rendered
    const timeoutId = setTimeout(loadPreview, 100);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [isOpen, certificate?.certificateId, userRole]);

  const handleDownload = async () => {
    try {
      const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
      const response = await api.get(`${baseUrl}/certificates/${certificate.certificateId}/download`, {
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`certificate-modal-overlay ${isFullscreen ? '' : 'windowed'}`} 
      onClick={onClose}
    >
      <div 
        className={`certificate-modal-content ${isFullscreen ? '' : 'windowed'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>{certificate.certificateName}</h3>
            <p>{certificate.fileName}</p>
          </div>
          <div className="modal-actions">
            <button 
              className="modal-btn download" 
              onClick={handleDownload} 
              title="Download (Press D)"
            >
              📥 Download
            </button>
            <button 
              className="modal-btn fullscreen" 
              onClick={toggleFullscreen} 
              title={`${isFullscreen ? 'Windowed' : 'Fullscreen'} View (Press F)`}
            >
              {isFullscreen ? '🗗' : '⛶'} {isFullscreen ? 'Window' : 'Fullscreen'}
            </button>
            <button 
              className="modal-btn close" 
              onClick={onClose} 
              title="Close (Press Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading certificate...</p>
            </div>
          )}

          {error && (
            <div className="modal-error">
              <div className="error-icon">❌</div>
              <p>Failed to load certificate</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => {
                  setError(false);
                  setLoading(true);
                  // Trigger reload by changing a dependency
                  const event = new CustomEvent('reload-preview');
                  window.dispatchEvent(event);
                }}>Retry</button>
                <button onClick={async () => {
                  // Test direct API call
                  try {
                    const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
                    const response = await fetch(`${baseUrl}/certificates/${certificate.certificateId}/view`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      }
                    });
                    console.log('Direct API test:', response.status, response.headers);
                    if (response.ok) {
                      const blob = await response.blob();
                      console.log('Blob received:', blob.size, blob.type);
                      alert(`API works! Blob size: ${blob.size} bytes, type: ${blob.type}`);
                    } else {
                      alert(`API Error: ${response.status} ${response.statusText}`);
                    }
                  } catch (e) {
                    alert(`Network Error: ${e.message}`);
                  }
                }}>Test API</button>
              </div>
            </div>
          )}

          {previewUrl && !loading && !error && (
            <div className="modal-preview">
              {isImage ? (
                <img
                  src={previewUrl}
                  alt={certificate.certificateName}
                  className="modal-image"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  className="modal-iframe"
                  title={certificate.certificateName}
                />
              )}
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          {isFullscreen && showHint && (
            <div className="keyboard-hint">
              Press F for windowed view • D to download • Esc to close
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;