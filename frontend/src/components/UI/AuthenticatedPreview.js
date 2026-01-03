import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

const AuthenticatedPreview = ({ certificate, userRole, onError }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Robust file type detection
  const fileType = certificate.fileType?.toLowerCase() || '';
  const fileName = certificate.fileName?.toLowerCase() || '';

  const isImage = fileType.includes('image') ||
    fileType.includes('jpeg') ||
    fileType.includes('jpg') ||
    fileType.includes('png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.gif');

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    return '📎';
  };

  useEffect(() => {
    let active = true;
    const loadPreview = async () => {
      if (!certificate?.certificateId) {
        console.log('AuthenticatedPreview: No certificate ID provided', certificate);
        setLoading(false);
        setError(true);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
        const url = `${baseUrl}/certificates/${certificate.certificateId}/view`;
        
        console.log('AuthenticatedPreview: Loading preview from:', url);
        console.log('AuthenticatedPreview: Certificate data:', certificate);
        console.log('AuthenticatedPreview: User role:', userRole);

        const response = await api.get(url, {
          responseType: 'blob',
          timeout: 30000 // 30 second timeout
        });

        console.log('AuthenticatedPreview: Response received:', {
          status: response.status,
          size: response.data?.size,
          type: response.data?.type,
          headers: response.headers
        });

        if (!response.data || response.data.size === 0) {
          console.error('AuthenticatedPreview: Empty response received');
          throw new Error('Empty response');
        }

        // Verify the blob is valid
        if (!(response.data instanceof Blob)) {
          console.error('AuthenticatedPreview: Response is not a valid blob');
          throw new Error('Invalid response format');
        }

        if (active) {
          const blobUrl = URL.createObjectURL(response.data);
          console.log('AuthenticatedPreview: Created blob URL:', blobUrl);
          setPreviewUrl(blobUrl);
          setError(false);
        }
      } catch (err) {
        console.error('AuthenticatedPreview: Preview load error:', err);
        console.error('AuthenticatedPreview: Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        
        // Log specific error information if available
        if (err.response?.data) {
          try {
            const errorData = typeof err.response.data === 'string' 
              ? JSON.parse(err.response.data) 
              : err.response.data;
            console.error('AuthenticatedPreview: Server error details:', errorData);
          } catch (parseError) {
            console.error('AuthenticatedPreview: Could not parse error data:', err.response.data);
          }
        }
        
        if (active) {
          setError(true);
          onError?.(err);
        }
      } finally {
        if (active) {
          console.log('AuthenticatedPreview: Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Add a small delay to prevent too many simultaneous requests
    const timeoutId = setTimeout(loadPreview, 100);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [certificate?.certificateId, onError, userRole]);

  if (loading) {
    return (
      <div className="preview-loading">
        <div className="loading-spinner-small"></div>
        <span>Loading preview...</span>
      </div>
    );
  }

  // If we have a URL, try to show it
  if (previewUrl && !error && !loading) {
    console.log('AuthenticatedPreview: Rendering preview with URL:', previewUrl);
    // If it's definitely an image, use img tag
    if (isImage) {
      return (
        <div className="image-preview-container">
          <img
            src={previewUrl}
            alt={certificate.certificateName}
            className="certificate-preview-image"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              console.error('AuthenticatedPreview: Image load error:', e);
              // Don't immediately set error - the image might still be loading
              setTimeout(() => setError(true), 2000);
            }}
            onLoad={() => {
              console.log('AuthenticatedPreview: Image loaded successfully');
              setError(false); // Clear any previous errors
            }}
          />
        </div>
      );
    }

    // For PDF or anything else, try iframe (it handles many types)
    return (
      <div className="pdf-preview-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          key={previewUrl}
          src={previewUrl}
          className="certificate-preview-iframe"
          title={certificate.certificateName}
          style={{ width: '100%', height: '100%', border: 'none' }}
          onError={(e) => {
            console.error('AuthenticatedPreview: Iframe load error:', e);
            // Don't immediately set error - the iframe might still be loading
            setTimeout(() => setError(true), 3000);
          }}
          onLoad={() => {
            console.log('AuthenticatedPreview: Iframe loaded successfully');
            setError(false); // Clear any previous errors
          }}
        />
      </div>
    );
  }

  // Fallback / Error State - but still try to be useful
  return (
    <div className="file-placeholder" style={{ cursor: 'pointer' }}>
      <div className="file-icon">{getFileTypeIcon(certificate.fileType)}</div>
      <div className="file-info">
        <span className="file-name">{certificate.fileName}</span>
        <span className="file-type">
          {error ? 'File not available' : 'Click to preview'}
        </span>
        {error && (
          <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
            This is a sample certificate without an actual file.
            <br />
            Upload a real certificate to view it.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthenticatedPreview;