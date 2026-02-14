import React from 'react';
import { useDashboardStats } from '../../hooks/useAnalytics';

export const AssetCategoryChart: React.FC = () => {
    const { stats, loading } = useDashboardStats();

    if (loading || !stats) return <div>Loading...</div>;

    return (
        <div className="chart-container">
            <h4>Assets by Category</h4>
            <div className="pie-chart">
                {stats.byCategory.map((item, index) => (
                    <div key={item.name} className="chart-row">
                        <span className="label">{item.name}</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(item.value / stats.totalAssets) * 100}%`,
                                    backgroundColor: `hsl(${index * 45}, 70%, 50%)`
                                }}
                            >
                                {item.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};