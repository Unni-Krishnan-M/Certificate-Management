import React, { useState } from 'react';
import AuthenticatedPreview from './AuthenticatedPreview';
import SimplePreview from './SimplePreview';
import api from '../../utils/axiosConfig';

const CertificateCard = ({
  certificate,
  onDownload,
  onDelete,
  onReview,
  onView,
  userRole = 'STUDENT'
}) => {
  const [previewError, setPreviewError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const handlePreviewError = (error) => {
    console.log('CertificateCard: Preview error for certificate', certificate.certificateId, error);
    
    // Only fall back to SimplePreview after multiple failures or specific error types
    if (retryCount >= 2 || error?.response?.status === 403 || error?.response?.status === 404) {
      setPreviewError(true);
    } else {
      // Retry after a short delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 1000);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        color: 'orange',
        icon: '⏳',
        label: 'Under Review',
        bgColor: 'rgba(245, 158, 11, 0.08)',
        textColor: '#f59e0b',
        borderColor: '#f59e0b',
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
      },
      VERIFIED: {
        color: 'green',
        icon: '✓',
        label: 'Verified',
        bgColor: 'rgba(16, 185, 129, 0.08)',
        textColor: '#10b981',
        borderColor: '#10b981',
        gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
      },
      REJECTED: {
        color: 'red',
        icon: '✕',
        label: 'Rejected',
        bgColor: 'rgba(239, 68, 68, 0.08)',
        textColor: '#ef4444',
        borderColor: '#ef4444',
        gradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
      }
    };
    return configs[status] || configs.PENDING;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewFull = async () => {
    let newWindow = null;
    
    try {
      console.log('Opening certificate in full view:', certificate.certificateId);
      
      const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
      
      // Open window immediately to avoid popup blockers
      newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Loading Certificate...</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 0; 
                  background: #f0f2f5; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  height: 100vh; 
                  font-family: sans-serif; 
                }
                .loading { text-align: center; }
                .spinner { 
                  border: 4px solid #f3f3f3; 
                  border-top: 4px solid #3498db; 
                  border-radius: 50%; 
                  width: 40px; 
                  height: 40px; 
                  animation: spin 2s linear infinite; 
                  margin: 0 auto 20px; 
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="loading">
                <div class="spinner"></div>
                <h3>Loading Certificate...</h3>
                <p>Please wait while we prepare your certificate for viewing.</p>
              </div>
            </body>
          </html>
        `);
      }
      
      // Use the configured axios instance
      const response = await api.get(`${baseUrl}/certificates/${certificate.certificateId}/view`, {
        responseType: 'blob',
        timeout: 30000
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = response.data;
      const blobUrl = URL.createObjectURL(blob);
      
      // Create additional info for staff view
      const additionalInfo = userRole === 'STAFF' ? `
        <div class="certificate-info">
          <div class="info-item">
            <span class="info-label">👤 Student:</span>
            <span class="info-value">${certificate.studentName || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">📅 Uploaded:</span>
            <span class="info-value">${formatDate(certificate.uploadDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">🏷️ Status:</span>
            <span class="info-value status-${certificate.status.toLowerCase()}">${certificate.status}</span>
          </div>
        </div>
      ` : '';
      
      // Update the window content
      if (newWindow && !newWindow.closed) {
        newWindow.document.open();
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${certificate.certificateName} - ${userRole === 'STAFF' ? 'Staff View' : 'Student View'}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #000;
                display: flex;
                flex-direction: column;
                height: 100vh;
                font-family: Arial, sans-serif;
              }
              .header {
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 16px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #333;
                flex-wrap: wrap;
                gap: 16px;
              }
              .title h1 {
                margin: 0;
                font-size: 1.5rem;
              }
              .title p {
                margin: 4px 0 0 0;
                font-size: 0.9rem;
                color: #ccc;
              }
              .certificate-info {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
                align-items: center;
              }
              .info-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.85rem;
              }
              .info-label {
                color: #ccc;
              }
              .info-value {
                color: white;
                font-weight: 500;
              }
              .status-pending { color: #f59e0b; }
              .status-verified { color: #10b981; }
              .status-rejected { color: #ef4444; }
              .actions {
                display: flex;
                gap: 12px;
              }
              .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
              }
              .download {
                background: #3b82f6;
                color: white;
              }
              .download:hover {
                background: #2563eb;
              }
              .close {
                background: #ef4444;
                color: white;
              }
              .close:hover {
                background: #dc2626;
              }
              .content {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
              }
              .preview {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              }
              iframe.preview {
                width: 100%;
                height: 100%;
                border: none;
              }
              @media (max-width: 768px) {
                .header {
                  flex-direction: column;
                  align-items: flex-start;
                }
                .certificate-info {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 8px;
                }
                .actions {
                  align-self: flex-end;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">
                <h1>${certificate.certificateName}</h1>
                <p>${certificate.fileName}</p>
              </div>
              ${additionalInfo}
              <div class="actions">
                <button class="btn download" onclick="downloadFile()">📥 Download</button>
                <button class="btn close" onclick="window.close()">✕ Close</button>
              </div>
            </div>
            <div class="content">
              ${blob.type.startsWith('image/') 
                ? `<img src="${blobUrl}" alt="${certificate.certificateName}" class="preview" />`
                : `<iframe src="${blobUrl}" class="preview" title="${certificate.certificateName}"></iframe>`
              }
            </div>
            <script>
              function downloadFile() {
                const link = document.createElement('a');
                link.href = '${blobUrl}';
                link.download = '${certificate.fileName}';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
              
              // Cleanup blob URL when window closes
              window.addEventListener('beforeunload', function() {
                URL.revokeObjectURL('${blobUrl}');
              });
              
              // Keyboard shortcuts
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                  window.close();
                } else if (e.key === 'd' || e.key === 'D') {
                  if (!e.ctrlKey && !e.metaKey) {
                    downloadFile();
                  }
                }
              });
            </script>
          </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Fallback if popup was blocked
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.download = certificate.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Error opening certificate:', error);
      
      // Close the loading window if it exists
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
      
      // Show user-friendly error message
      const errorMessage = error.response?.status === 404 
        ? 'Certificate file not found. This might be a sample certificate without an actual file.'
        : error.response?.status === 403
        ? 'You do not have permission to view this certificate.'
        : 'Failed to open certificate. Please try again.';
        
      alert(errorMessage);
    }
  };

  const statusConfig = getStatusConfig(certificate.status);

  return (
    <div className="certificate-card-professional" style={{ borderLeftColor: statusConfig.borderColor }}>
      {/* Certificate Preview Section */}
      <div className="certificate-preview-section">
        <div className="preview-container">
          {/* Always try AuthenticatedPreview first, with better error handling */}
          <AuthenticatedPreview
            key={`${certificate.certificateId}-${retryCount}`}
            certificate={certificate}
            userRole={userRole}
            onError={handlePreviewError}
          />

          {/* Only show SimplePreview overlay if there's a persistent error */}
          {previewError && (
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(255,255,255,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              backdropFilter: 'blur(2px)'
            }}>
              <SimplePreview
                certificate={certificate}
                userRole={userRole}
              />
            </div>
          )}

          {/* Preview actions */}
          <div className="preview-actions">
            <button
              className="preview-action-btn"
              onClick={handleViewFull}
              title="Open in full screen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              View
            </button>
          </div>

          {/* Status Badge Overlay */}
          <div className="status-overlay">
            <div className="status-badge-professional" style={{
              color: statusConfig.textColor,
              borderColor: statusConfig.borderColor
            }}>
              <span className="status-icon">{statusConfig.icon}</span>
              <span className="status-text">{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Information */}
      <div className="certificate-info-section">
        <div className="certificate-header">
          <div className="title-section">
            <h3 className="certificate-title">{certificate.certificateName}</h3>
            <div className="certificate-id">ID: {certificate.certificateId}</div>
          </div>
          <button
            className="expand-arrow-btn"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Show less details' : 'Show more details'}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </button>
        </div>

        {/* Basic Information - Always Visible */}
        <div className="certificate-basic-info">
          {userRole === 'STAFF' && (
            <div className="info-row">
              <div className="info-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Student
              </div>
              <span className="info-value">{certificate.studentName}</span>
            </div>
          )}

          <div className="info-row">
            <div className="info-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              Uploaded
            </div>
            <span className="info-value">{formatDate(certificate.uploadDate)}</span>
          </div>

          <div className="info-row">
            <div className="info-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              File
            </div>
            <span className="info-value">{certificate.fileName}</span>
          </div>
        </div>

        {/* Expanded Information - Only Visible When Expanded */}
        {expanded && (
          <div className="certificate-expanded-info">
            {certificate.metadata?.certificateType && (
              <div className="info-row">
                <div className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.78 12.45,22 13,22C13.55,22 14.05,21.78 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.45 21.78,11.95 21.41,11.58Z"/>
                  </svg>
                  Type
                </div>
                <span className="info-value">{certificate.metadata.certificateType}</span>
              </div>
            )}

            {certificate.metadata?.issuingOrganization && (
              <div className="info-row">
                <div className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H20V19M20,15H12V13H20V15M20,11H12V9H20V11Z"/>
                  </svg>
                  Organization
                </div>
                <span className="info-value">{certificate.metadata.issuingOrganization}</span>
              </div>
            )}

            {certificate.metadata?.issueYear && (
              <div className="info-row">
                <div className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z"/>
                  </svg>
                  Issue Year
                </div>
                <span className="info-value">{certificate.metadata.issueYear}</span>
              </div>
            )}

            {certificate.metadata?.department && (
              <div className="info-row">
                <div className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
                  </svg>
                  Department
                </div>
                <span className="info-value">{certificate.metadata.department}</span>
              </div>
            )}

            {certificate.verifiedBy && (
              <div className="info-row">
                <div className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                  </svg>
                  Verified by
                </div>
                <span className="info-value">{certificate.verifiedBy}</span>
              </div>
            )}

            {certificate.verifiedDate && (
              <div className="info-row">
                <div className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                  </svg>
                  Verified on
                </div>
                <span className="info-value">{formatDate(certificate.verifiedDate)}</span>
              </div>
            )}

            <div className="info-row">
              <div className="info-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z"/>
                </svg>
                File Type
              </div>
              <span className="info-value">{certificate.fileType}</span>
            </div>
          </div>
        )}

        {/* Staff Remarks */}
        {certificate.staffRemarks && (
          <div className="remarks-section-professional">
            <div className="remarks-header">
              <span className="remarks-icon">💬</span>
              <span className="remarks-label">Staff Remarks</span>
            </div>
            <div className="remarks-content">{certificate.staffRemarks}</div>
          </div>
        )}

        {/* Progress Indicator for Pending */}
        {certificate.status === 'PENDING' && (
          <div className="progress-section">
            <div className="progress-bar-professional">
              <div className="progress-fill-professional"></div>
            </div>
            <span className="progress-text-professional">⏳ Awaiting Staff Review</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="certificate-actions-section">
        <div className="action-buttons-grid">
          <button
            className="action-btn-professional download"
            onClick={() => onDownload(certificate.certificateId, certificate.fileName)}
            title="Download Certificate"
          >
            <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
            </svg>
            <span className="btn-text">Download</span>
          </button>

          {userRole === 'STAFF' && (
            <button
              className="action-btn-professional review"
              onClick={() => onReview(certificate)}
              title="Review Certificate"
            >
              <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M9,17H7V15H9V17M9,13H7V11H9V13M9,9H7V7H9V9M17,17H11V15H17V17M17,13H11V11H17V13M17,9H11V7H17V9Z"/>
              </svg>
              <span className="btn-text">Review</span>
            </button>
          )}

          {userRole === 'STUDENT' && (
            <button
              className="action-btn-professional delete"
              onClick={() => onDelete(certificate.certificateId)}
              title="Delete Certificate"
            >
              <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
              </svg>
              <span className="btn-text">Delete</span>
            </button>
          )}

          {userRole === 'STUDENT' && certificate.status === 'VERIFIED' && (
            <button
              className="action-btn-professional share"
              onClick={() => {/* Add share functionality */ }}
              title="Share Certificate"
            >
              <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/>
              </svg>
              <span className="btn-text">Share</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;