import React from 'react';

const SimplePreview = ({ certificate, userRole }) => {
  // More robust file type detection
  const fileType = certificate.fileType?.toLowerCase() || '';
  const fileName = certificate.fileName?.toLowerCase() || '';
  const isPDF = fileType.includes('pdf') || fileName.endsWith('.pdf');
  const isImage = fileType.includes('image') || 
                  fileType.includes('jpeg') || 
                  fileType.includes('jpg') || 
                  fileType.includes('png') ||
                  fileName.endsWith('.jpg') ||
                  fileName.endsWith('.jpeg') ||
                  fileName.endsWith('.png');

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    return '📎';
  };

  const handlePreviewClick = () => {
    const token = localStorage.getItem('token');
    const baseUrl = userRole === 'STUDENT' ? '/api/student' : '/api/staff';
    const url = `${baseUrl}/certificates/${certificate.certificateId}/view`;
    
    // Open in new window with auth header
    const newWindow = window.open('', '_blank');
    
    // Create a simple HTML page with the file embedded
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${certificate.certificateName}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .container { max-width: 100%; text-align: center; }
            .file-info { margin-bottom: 20px; }
            iframe, img { max-width: 100%; height: 80vh; border: 1px solid #ddd; }
            .error { color: red; padding: 20px; }
            .download-btn { 
              background: #007bff; color: white; padding: 10px 20px; 
              border: none; border-radius: 5px; cursor: pointer; margin: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="file-info">
              <h2>${certificate.certificateName}</h2>
              <p>File: ${certificate.fileName}</p>
              <p>Type: ${certificate.fileType}</p>
            </div>
            <div id="content">Loading...</div>
            <button class="download-btn" onclick="downloadFile()">Download</button>
          </div>
          
          <script>
            async function loadFile() {
              try {
                const response = await fetch('${url}', {
                  headers: {
                    'Authorization': 'Bearer ${token}'
                  }
                });
                
                if (!response.ok) {
                  throw new Error('Failed to load file');
                }
                
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const content = document.getElementById('content');
                
                if ('${isPDF}' === 'true') {
                  content.innerHTML = '<iframe src="' + blobUrl + '" width="100%" height="600px"></iframe>';
                } else if ('${isImage}' === 'true') {
                  content.innerHTML = '<img src="' + blobUrl + '" alt="${certificate.certificateName}" />';
                } else {
                  content.innerHTML = '<p>Preview not available for this file type</p>';
                }
              } catch (error) {
                document.getElementById('content').innerHTML = 
                  '<div class="error">Failed to load preview: ' + error.message + '</div>';
              }
            }
            
            function downloadFile() {
              const downloadUrl = '${baseUrl}/certificates/${certificate.certificateId}/download';
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = '${certificate.fileName}';
              link.click();
            }
            
            loadFile();
          </script>
        </body>
      </html>
    `;
    
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div className="simple-preview" onClick={handlePreviewClick} style={{ cursor: 'pointer' }}>
      <div className="file-placeholder">
        <div className="file-icon" style={{ fontSize: '3rem', marginBottom: '10px' }}>
          {getFileTypeIcon(certificate.fileType)}
        </div>
        <div className="file-info">
          <span className="file-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            {certificate.fileName}
          </span>
          <span className="file-type" style={{ fontSize: '0.9em', color: '#666' }}>
            {certificate.fileType}
          </span>
          <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#007bff' }}>
            Click to preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePreview;