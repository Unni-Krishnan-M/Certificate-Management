import React, { useState } from 'react';
import AuthenticatedPreview from './AuthenticatedPreview';
import SimplePreview from './SimplePreview';
import CertificateModal from './CertificateModal';

const CertificateCard = ({
  certificate,
  onDownload,
  onDelete,
  onReview,
  onView,
  userRole = 'STUDENT'
}) => {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  const statusConfig = getStatusConfig(certificate.status);

  return (
    <div className="certificate-card-professional" style={{ borderLeftColor: statusConfig.borderColor }}>
      {/* Certificate Preview Section */}
      <div className="certificate-preview-section">
        <div className="preview-container">
          {/* Try authenticated preview first, fallback to simple preview */}
          {!imageError ? (
            <AuthenticatedPreview
              certificate={certificate}
              userRole={userRole}
              onError={() => setImageError(true)}
            />
          ) : (
            <SimplePreview
              certificate={certificate}
              userRole={userRole}
            />
          )}

          {/* Preview actions */}
          <div className="preview-actions">
            <button
              className="preview-action-btn"
              onClick={() => setModalOpen(true)}
              title="View full size"
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

      {/* Certificate Modal */}
      <CertificateModal
        certificate={certificate}
        userRole={userRole}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default CertificateCard;