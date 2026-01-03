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
        label: 'Pending Review',
        bgColor: 'rgb(245 158 11 / 0.1)',
        textColor: '#f59e0b',
        borderColor: '#f59e0b'
      },
      VERIFIED: {
        color: 'green',
        icon: '✅',
        label: 'Verified',
        bgColor: 'rgb(16 185 129 / 0.1)',
        textColor: '#10b981',
        borderColor: '#10b981'
      },
      REJECTED: {
        color: 'red',
        icon: '❌',
        label: 'Rejected',
        bgColor: 'rgb(239 68 68 / 0.1)',
        textColor: '#ef4444',
        borderColor: '#ef4444'
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
    try {
      const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
      
      // Use the configured axios instance instead of direct fetch
      const response = await api.get(`${baseUrl}/certificates/${certificate.certificateId}/view`, {
        responseType: 'blob'
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
      
      // Open in new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
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
        alert('Please allow popups for this site to view certificates in full screen');
      }
    } catch (error) {
      console.error('Error opening certificate:', error);
      alert('Failed to open certificate. Please try again.');
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
              backgroundColor: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
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
              title="Open in new tab"
            >
              🔍 View Full
            </button>
          </div>

          {/* Status Badge Overlay */}
          <div className="status-overlay">
            <div className="status-badge-professional" style={{
              backgroundColor: statusConfig.bgColor,
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
          <h3 className="certificate-title">{certificate.certificateName}</h3>
          <button
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Show less' : 'Show more'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>

        {/* Basic Information */}
        <div className="certificate-basic-info">
          {userRole === 'STAFF' && (
            <div className="info-row">
              <span className="info-label">👤 Student:</span>
              <span className="info-value">{certificate.studentName}</span>
            </div>
          )}

          <div className="info-row">
            <span className="info-label">📅 Uploaded:</span>
            <span className="info-value">{formatDate(certificate.uploadDate)}</span>
          </div>

          <div className="info-row">
            <span className="info-label">📎 File:</span>
            <span className="info-value">{certificate.fileName}</span>
          </div>
        </div>

        {/* Expanded Information */}
        {expanded && (
          <div className="certificate-expanded-info">
            {certificate.metadata?.certificateType && (
              <div className="info-row">
                <span className="info-label">🏷️ Type:</span>
                <span className="info-value">{certificate.metadata.certificateType}</span>
              </div>
            )}

            {certificate.metadata?.issuingOrganization && (
              <div className="info-row">
                <span className="info-label">🏢 Issued by:</span>
                <span className="info-value">{certificate.metadata.issuingOrganization}</span>
              </div>
            )}

            {certificate.metadata?.issueYear && (
              <div className="info-row">
                <span className="info-label">📆 Year:</span>
                <span className="info-value">{certificate.metadata.issueYear}</span>
              </div>
            )}

            {certificate.metadata?.department && (
              <div className="info-row">
                <span className="info-label">🏫 Department:</span>
                <span className="info-value">{certificate.metadata.department}</span>
              </div>
            )}

            {certificate.verifiedBy && (
              <div className="info-row">
                <span className="info-label">✅ Verified by:</span>
                <span className="info-value">{certificate.verifiedBy}</span>
              </div>
            )}

            {certificate.verifiedDate && (
              <div className="info-row">
                <span className="info-label">📅 Verified on:</span>
                <span className="info-value">{formatDate(certificate.verifiedDate)}</span>
              </div>
            )}

            <div className="info-row">
              <span className="info-label">💾 File Type:</span>
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
            <span className="btn-icon">📥</span>
            <span className="btn-text">Download</span>
          </button>

          {userRole === 'STAFF' && (
            <button
              className="action-btn-professional review"
              onClick={() => onReview(certificate)}
              title="Review Certificate"
            >
              <span className="btn-icon">📋</span>
              <span className="btn-text">Review</span>
            </button>
          )}

          {userRole === 'STUDENT' && certificate.status === 'REJECTED' && (
            <button
              className="action-btn-professional delete"
              onClick={() => onDelete(certificate.certificateId)}
              title="Delete Certificate"
            >
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Delete</span>
            </button>
          )}

          {userRole === 'STUDENT' && certificate.status === 'VERIFIED' && (
            <button
              className="action-btn-professional share"
              onClick={() => {/* Add share functionality */ }}
              title="Share Certificate"
            >
              <span className="btn-icon">🔗</span>
              <span className="btn-text">Share</span>
            </button>
          )}

          <button
            className="action-btn-professional info"
            onClick={() => setExpanded(!expanded)}
            title="Toggle Details"
          >
            <span className="btn-icon">ℹ️</span>
            <span className="btn-text">{expanded ? 'Less' : 'More'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;