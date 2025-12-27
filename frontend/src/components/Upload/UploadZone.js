import React, { useState, useRef } from 'react';
import api from '../../utils/axiosConfig';

const UploadZone = ({ onUploadSuccess }) => {
  const [uploadData, setUploadData] = useState({
    certificateName: '',
    certificateType: '',
    issuingOrganization: '',
    issueYear: '',
    department: '',
    files: []
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const certificateTypes = [
    'Academic Degree',
    'Professional Certification',
    'Training Certificate',
    'Achievement Award',
    'Completion Certificate',
    'Other'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    setUploadData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
  };

  const removeFile = (index) => {
    setUploadData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadData.certificateName || uploadData.files.length === 0) {
      alert('Please provide certificate name and at least one file');
      return;
    }

    setUploading(true);

    try {
      // Upload files one by one
      for (let i = 0; i < uploadData.files.length; i++) {
        const file = uploadData.files[i];
        const formData = new FormData();
        
        formData.append('certificateName', `${uploadData.certificateName} ${uploadData.files.length > 1 ? `(${i + 1})` : ''}`);
        formData.append('file', file);
        
        // Add metadata
        if (uploadData.certificateType) formData.append('certificateType', uploadData.certificateType);
        if (uploadData.issuingOrganization) formData.append('issuingOrganization', uploadData.issuingOrganization);
        if (uploadData.issueYear) formData.append('issueYear', uploadData.issueYear);
        if (uploadData.department) formData.append('department', uploadData.department);

        setUploadProgress(prev => ({ ...prev, [i]: 0 }));

        await api.post('/api/student/certificates/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [i]: progress }));
          }
        });
      }

      // Reset form
      setUploadData({
        certificateName: '',
        certificateType: '',
        issuingOrganization: '',
        issueYear: '',
        department: '',
        files: []
      });
      setUploadProgress({});
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadSuccess?.();
    } catch (error) {
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-zone-container">
      <form onSubmit={handleSubmit} className="upload-form">
        {/* Metadata Fields */}
        <div className="metadata-section">
          <h3>Certificate Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Certificate Name *</label>
              <input
                type="text"
                value={uploadData.certificateName}
                onChange={(e) => setUploadData(prev => ({ ...prev, certificateName: e.target.value }))}
                placeholder="Enter certificate name"
                required
              />
            </div>

            <div className="form-group">
              <label>Certificate Type</label>
              <select
                value={uploadData.certificateType}
                onChange={(e) => setUploadData(prev => ({ ...prev, certificateType: e.target.value }))}
              >
                <option value="">Select type</option>
                {certificateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Issuing Organization</label>
              <input
                type="text"
                value={uploadData.issuingOrganization}
                onChange={(e) => setUploadData(prev => ({ ...prev, issuingOrganization: e.target.value }))}
                placeholder="e.g., University of XYZ"
              />
            </div>

            <div className="form-group">
              <label>Issue Year</label>
              <select
                value={uploadData.issueYear}
                onChange={(e) => setUploadData(prev => ({ ...prev, issueYear: e.target.value }))}
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* File Upload Zone */}
        <div className="file-upload-section">
          <h3>Upload Files</h3>
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <div className="upload-icon">📁</div>
              <p className="drop-text">
                Drag and drop files here, or <span className="browse-link">browse</span>
              </p>
              <p className="file-info">
                Supports PDF, JPG, PNG files up to 10MB each
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* File List */}
          {uploadData.files.length > 0 && (
            <div className="file-list">
              <h4>Selected Files ({uploadData.files.length})</h4>
              {uploadData.files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  
                  {uploading && uploadProgress[index] !== undefined && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${uploadProgress[index]}%` }}
                      ></div>
                      <span className="progress-text">{uploadProgress[index]}%</span>
                    </div>
                  )}
                  
                  {!uploading && (
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={uploading || !uploadData.certificateName || uploadData.files.length === 0}
          >
            {uploading ? 'Uploading...' : `Upload ${uploadData.files.length} Certificate${uploadData.files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadZone;