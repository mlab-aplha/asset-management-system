// src/features/facilitator_features/AssetStatsGrid.tsx
import React from 'react';
import { Card } from '../../components/ui/Card';
import { useFacilitatorAssets } from '../../hooks/useFacilitatorAssets';
import './facilitator-styles.css';

export const AssetStatsGrid: React.FC = () => {
    const { stats } = useFacilitatorAssets();

    const statCards = [
        { label: 'Total Assigned', value: stats.assignedToMe, icon: 'assignment_ind', color: '#3b82f6' },
        { label: 'In Use', value: stats.assignedToMe, icon: 'check_circle', color: '#10b981' },
        { label: 'Available', value: stats.availableAssets, icon: 'inventory', color: '#f59e0b' },
        { label: 'Maintenance', value: stats.maintenanceAssets, icon: 'build', color: '#ef4444' }
    ];

    return (
        <div className="stats-grid">
            {statCards.map((stat, index) => (
                <Card key={index} glass className="stat-card">
                    <div className="stat-icon" style={{ color: stat.color }}>
                        <span className="material-icons">{stat.icon}</span>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                </Card>
            ))}
        </div>
    );
};