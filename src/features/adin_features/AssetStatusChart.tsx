import React from 'react';
import { useDashboardStats } from '../../hooks/useAnalytics';

export const AssetStatusChart: React.FC = () => {
    const { stats, loading } = useDashboardStats();

    if (loading || !stats) return <div>Loading...</div>;

    const statusData = [
        { name: 'Available', value: stats.availableAssets, color: '#00bfa6' },
        { name: 'Assigned', value: stats.assignedAssets, color: '#ff9800' },
        { name: 'Maintenance', value: stats.maintenanceAssets, color: '#f44336' }
    ];

    return (
        <div className="chart-container">
            <h4>Asset Status Distribution</h4>
            <div className="status-grid">
                {statusData.map(item => (
                    <div key={item.name} className="status-card">
                        <div className="status-value">{item.value}</div>
                        <div className="status-label" style={{ color: item.color }}>
                            {item.name}
                        </div>
                        <div className="status-percentage">
                            {((item.value / stats.totalAssets) * 100).toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};