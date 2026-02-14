import React from 'react';
import { useDashboardStats } from '../../hooks/useAnalytics';
import './dashboard.css';

export const ChartSection: React.FC = () => {
    const { stats, loading } = useDashboardStats();
    const chartData = stats?.byType?.map(item => ({
        region: item.name,
        growth: Math.round((item.value / (stats?.totalAssets || 1)) * 100),
        service: stats?.availableAssets ? Math.round((stats.availableAssets / stats.totalAssets) * 100) : 60
    })) || [
            { region: 'Gauteng', growth: 80, service: 60 },
            { region: 'W. Cape', growth: 65, service: 45 },
            { region: 'KZN', growth: 50, service: 30 },
            { region: 'Free State', growth: 90, service: 70 },
            { region: 'Limpopo', growth: 55, service: 40 },
            { region: 'E. Cape', growth: 35, service: 20 }
        ];

    if (loading) {
        return (
            <div className="dashboard-chart-section">
                <div className="dashboard-chart-header">
                    <h4>Distribution Tracking</h4>
                </div>
                <div className="chart-loading">Loading chart data...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-chart-section">
            <div className="dashboard-chart-header">
                <h4>Distribution Tracking</h4>
                <div className="chart-legend">
                    <div className="chart-legend-item">
                        <span className="legend-dot lime"></span>
                        <span>Asset Growth</span>
                    </div>
                    <div className="chart-legend-item">
                        <span className="legend-dot turquoise"></span>
                        <span>Service Life</span>
                    </div>
                </div>
            </div>
            <div className="dashboard-chart">
                <div className="chart-grid">
                    <div className="chart-grid-line"></div>
                    <div className="chart-grid-line"></div>
                    <div className="chart-grid-line"></div>
                    <div className="chart-grid-line"></div>
                    <div className="chart-grid-line"></div>
                </div>
                <div className="chart-bars">
                    {chartData.map((item, index) => (
                        <div key={index} className="chart-bar-group">
                            <div
                                className="chart-bar service"
                                style={{ height: `${item.service}%` }}
                            ></div>
                            <div
                                className="chart-bar growth"
                                style={{ height: `${item.growth}%` }}
                            ></div>
                            <p className="chart-bar-label">{item.region}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
