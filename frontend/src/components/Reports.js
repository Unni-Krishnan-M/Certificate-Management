import React, { useState, useEffect } from 'react';
import KPICard from './UI/KPICard';
import api from '../utils/axiosConfig';

const Reports = () => {
    const [loading, setLoading] = useState(false); // Set to true if fetching real data

    // Mock data for now, or fetch from API if available
    const stats = {
        totalCertificates: 156,
        verifiedCount: 89,
        rejectedCount: 12,
        pendingCount: 55,
        verificationRate: '88%',
        avgProcessingTime: '2.4 days'
    };

    return (
        <div className="reports-container">
            <div className="page-header">
                <h2>Reports & Analytics</h2>
                <p>Detailed insights into certificate verification process</p>
            </div>

            <div className="reports-overview-grid">
                <KPICard
                    title="Verification Rate"
                    value={stats.verificationRate}
                    icon="📈"
                    color="blue"
                    width="100%"
                />
                <KPICard
                    title="Avg Processing Time"
                    value={stats.avgProcessingTime}
                    icon="⏱️"
                    color="green"
                    width="100%"
                />
            </div>

            <div className="reports-charts-section">
                <div className="chart-card">
                    <h3>Certificate Status Distribution</h3>
                    <div className="mock-chart-container">
                        <div className="mock-bar" style={{ height: '60%', background: '#4CAF50' }} title="Verified"></div>
                        <div className="mock-bar" style={{ height: '30%', background: '#FFC107' }} title="Pending"></div>
                        <div className="mock-bar" style={{ height: '10%', background: '#F44336' }} title="Rejected"></div>
                    </div>
                    <div className="chart-legend">
                        <span><span className="dot green"></span> Verified ({stats.verifiedCount})</span>
                        <span><span className="dot orange"></span> Pending ({stats.pendingCount})</span>
                        <span><span className="dot red"></span> Rejected ({stats.rejectedCount})</span>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Monthly Upload Activity</h3>
                    <div className="mock-line-chart">
                        {/* CSS-only simple line chart representation */}
                        <div className="chart-line-path"></div>
                    </div>
                    <p className="chart-placeholder-text">Activity trends visualization coming soon</p>
                </div>
            </div>

            <div className="reports-table-section">
                <h3>Department Performance</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Total Uploads</th>
                            <th>Verified</th>
                            <th>Pending</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Computer Science</td>
                            <td>45</td>
                            <td>30</td>
                            <td>15</td>
                        </tr>
                        <tr>
                            <td>Engineering</td>
                            <td>32</td>
                            <td>28</td>
                            <td>4</td>
                        </tr>
                        <tr>
                            <td>Business</td>
                            <td>28</td>
                            <td>15</td>
                            <td>13</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
