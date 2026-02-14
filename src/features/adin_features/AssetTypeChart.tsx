import React from 'react';
import { useDashboardStats } from '../../hooks/useAnalytics';

export const AssetTypeChart: React.FC = () => {
    const { stats, loading } = useDashboardStats();

    if (loading || !stats) return <div>Loading...</div>;

    return (
        <div className="chart-container">
            <h4>Assets by Type</h4>
            <div className="type-bars">
                {stats.byType.map(item => (
                    <div key={item.name} className="type-item">
                        <span className="type-name">{item.name}</span>
                        <span className="type-count">{item.value}</span>
                        <div className="type-bar-bg">
                            <div
                                className="type-bar-fill"
                                style={{ width: `${(item.value / stats.totalAssets) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};