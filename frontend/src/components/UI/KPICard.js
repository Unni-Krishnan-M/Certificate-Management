import React from 'react';

const KPICard = ({ title, value, icon, trend, color = 'blue' }) => {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-header">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-trend">
          {trend && (
            <span className={`trend ${trend > 0 ? 'up' : 'down'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      <div className="kpi-content">
        <div className="kpi-value">{value}</div>
        <div className="kpi-title">{title}</div>
      </div>
    </div>
  );
};

export default KPICard;