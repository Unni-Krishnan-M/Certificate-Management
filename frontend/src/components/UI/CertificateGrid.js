import React, { useState, useMemo } from 'react';
import CertificateCard from './CertificateCard';

const CertificateGrid = ({
  certificates,
  onDownload,
  onDelete,
  onReview,
  onView,
  userRole = 'STUDENT',
  showSearch = true,
  showFilters = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const filteredAndSortedCertificates = useMemo(() => {
    let filtered = certificates;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.metadata?.certificateType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.metadata?.issuingOrganization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'uploadDate' || sortBy === 'verifiedDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [certificates, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusCount = (status) => {
    return certificates.filter(cert => cert.status === status).length;
  };

  return (
    <div className="certificate-grid-container">
      {/* Controls Section */}
      {(showSearch || showFilters) && (
        <div className="grid-controls">
          {/* Search and View Toggle */}
          <div className="controls-top">
            {showSearch && (
              <div className="search-section">
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-modern"
                  />
                </div>
              </div>
            )}

            <div className="view-controls">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  ⊞
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  ☰
                </button>
              </div>

              <div className="sort-controls">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="uploadDate">Upload Date</option>
                  <option value="certificateName">Name</option>
                  <option value="status">Status</option>
                  {userRole === 'STAFF' && <option value="studentName">Student</option>}
                </select>
                <button
                  className="sort-order-btn"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="filters-section">
              <div className="status-filters">
                <button
                  className={`filter-chip ${statusFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  All ({certificates.length})
                </button>
                <button
                  className={`filter-chip pending ${statusFilter === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('PENDING')}
                >
                  Pending ({getStatusCount('PENDING')})
                </button>
                <button
                  className={`filter-chip verified ${statusFilter === 'VERIFIED' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('VERIFIED')}
                >
                  Verified ({getStatusCount('VERIFIED')})
                </button>
                <button
                  className={`filter-chip rejected ${statusFilter === 'REJECTED' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('REJECTED')}
                >
                  Rejected ({getStatusCount('REJECTED')})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {filteredAndSortedCertificates.length} certificate{filteredAndSortedCertificates.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
      </div>

      {/* Certificates Grid/List */}
      {filteredAndSortedCertificates.length > 0 ? (
        <div className={`certificates-container ${viewMode}`}>
          {filteredAndSortedCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.certificateId}
              certificate={certificate}
              onDownload={onDownload}
              onDelete={onDelete}
              onReview={onReview}
              onView={onView}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No certificates found</h3>
          <p>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters'
              : userRole === 'STUDENT'
                ? 'Upload your first certificate to get started'
                : 'No certificates have been uploaded yet'
            }
          </p>
          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateGrid;