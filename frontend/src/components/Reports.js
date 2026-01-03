import React, { useState, useEffect } from 'react';
import KPICard from './UI/KPICard';
import api from '../utils/axiosConfig';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalCertificates: 0,
        verified: 0,
        rejected: 0,
        pendingReview: 0,
        recentActivity: []
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/analytics/staff/dashboard');
            setAnalytics(response.data);
            setError('');
        } catch (error) {
            console.error('Analytics fetch error:', error);
            setError('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate derived statistics
    const totalProcessed = analytics.verified + analytics.rejected;
    const verificationRate = totalProcessed > 0 ? Math.round((analytics.verified / totalProcessed) * 100) : 0;
    
    // Mock processing time for now (could be calculated from actual data later)
    const avgProcessingTime = '2.4 days';

    if (loading) {
        return (
            <div className="reports-container">
                <div className="page-header">
                    <h2>Reports & Analytics</h2>
                    <p>Loading analytics data...</p>
                </div>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reports-container">
                <div className="page-header">
                    <h2>Reports & Analytics</h2>
                    <p className="error-message">{error}</p>
                </div>
                <button onClick={fetchAnalytics} className="btn btn-primary">Retry</button>
            </div>
        );
    }

    return (
        <div className="reports-container">
            <div className="page-header">
                <h2>Reports & Analytics</h2>
                <p>Real-time insights into certificate verification process</p>
            </div>

            <div className="reports-overview-grid">
                <KPICard
                    title="Verification Rate"
                    value={`${verificationRate}%`}
                    icon="📈"
                    color="blue"
                    width="100%"
                />
                <KPICard
                    title="Avg Processing Time"
                    value={avgProcessingTime}
                    icon="⏱️"
                    color="green"
                    width="100%"
                />
            </div>

            <div className="reports-charts-section">
                <div className="chart-card">
                    <h3>Certificate Status Distribution</h3>
                    <div className="mock-chart-container">
                        <div 
                            className="mock-bar" 
                            style={{ 
                                height: analytics.totalCertificates > 0 ? `${(analytics.verified / analytics.totalCertificates) * 100}%` : '0%', 
                                background: '#4CAF50' 
                            }} 
                            title="Verified"
                        ></div>
                        <div 
                            className="mock-bar" 
                            style={{ 
                                height: analytics.totalCertificates > 0 ? `${(analytics.pendingReview / analytics.totalCertificates) * 100}%` : '0%', 
                                background: '#FFC107' 
                            }} 
                            title="Pending"
                        ></div>
                        <div 
                            className="mock-bar" 
                            style={{ 
                                height: analytics.totalCertificates > 0 ? `${(analytics.rejected / analytics.totalCertificates) * 100}%` : '0%', 
                                background: '#F44336' 
                            }} 
                            title="Rejected"
                        ></div>
                    </div>
                    <div className="chart-legend">
                        <span><span className="dot green"></span> Verified ({analytics.verified})</span>
                        <span><span className="dot orange"></span> Pending ({analytics.pendingReview})</span>
                        <span><span className="dot red"></span> Rejected ({analytics.rejected})</span>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Recent Activity</h3>
                    <div className="recent-activity-list">
                        {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
                            analytics.recentActivity.slice(0, 5).map((cert, index) => (
                                <div key={cert.certificateId || index} className="activity-item">
                                    <div className="activity-info">
                                        <strong>{cert.certificateName}</strong>
                                        <span className="activity-student">by {cert.studentName}</span>
                                    </div>
                                    <div className="activity-meta">
                                        <span className={`status-badge ${cert.status.toLowerCase()}`}>
                                            {cert.status}
                                        </span>
                                        <span className="activity-date">
                                            {new Date(cert.uploadDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="reports-summary-section">
                <h3>Summary Statistics</h3>
                <div className="summary-grid">
                    <div className="summary-card">
                        <h4>Total Certificates</h4>
                        <div className="summary-value">{analytics.totalCertificates}</div>
                    </div>
                    <div className="summary-card">
                        <h4>Verified</h4>
                        <div className="summary-value verified">{analytics.verified}</div>
                    </div>
                    <div className="summary-card">
                        <h4>Pending Review</h4>
                        <div className="summary-value pending">{analytics.pendingReview}</div>
                    </div>
                    <div className="summary-card">
                        <h4>Rejected</h4>
                        <div className="summary-value rejected">{analytics.rejected}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
