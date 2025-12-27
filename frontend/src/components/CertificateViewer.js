import React from 'react';

const CertificateViewer = ({ certificate, onClose, userRole }) => {
  const getViewUrl = () => {
    const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
    return `${baseUrl}/certificates/${certificate.certificateId}/view`;
  };

  const isPDF = certificate.fileType === 'application/pdf';
  const isImage = certificate.fileType?.startsWith('image/');

  return (
    <div className="modal certificate-viewer-modal">
      <div className="modal-content certificate-viewer-content">
        <div className="certificate-viewer-header">
          <h3>{certificate.certificateName}</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <div className="certificate-info">
          <p><strong>Student:</strong> {certificate.studentName}</p>
          <p><strong>Status:</strong> 
            <span className={`status-badge status-${certificate.status.toLowerCase()}`}>
              {certificate.status}
            </span>
          </p>
          <p><strong>Uploaded:</strong> {new Date(certificate.uploadDate).toLocaleDateString()}</p>
          {certificate.staffRemarks && (
            <p><strong>Remarks:</strong> {certificate.staffRemarks}</p>
          )}
        </div>

        <div className="certificate-preview">
          {isPDF ? (
            <iframe
              src={getViewUrl()}
              title="Certificate Preview"
              width="100%"
              height="600px"
              style={{ border: 'none', borderRadius: '5px' }}
            />
          ) : isImage ? (
            <img
              src={getViewUrl()}
              alt="Certificate"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '600px', 
                objectFit: 'contain',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
          ) : (
            <div className="unsupported-format">
              <p>Preview not available for this file type.</p>
              <p>File type: {certificate.fileType}</p>
              <a 
                href={`/api/${userRole.toLowerCase()}/certificates/${certificate.certificateId}/download`}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download to View
              </a>
            </div>
          )}
        </div>

        <div className="certificate-viewer-actions">
          <a
            href={`/api/${userRole.toLowerCase()}/certificates/${certificate.certificateId}/download`}
            className="btn btn-primary"
            download
          >
            Download
          </a>
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;