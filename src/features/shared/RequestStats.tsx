// src/features/requests/components/shared/RequestStats.tsx
import React from 'react';
import { IRequestStats } from '../../core/types/request.types';
import './request-stats.css';

interface RequestStatsProps {
    stats: IRequestStats;
}

export const RequestStats: React.FC<RequestStatsProps> = ({ stats }) => {
    const statCards = [
        {
            title: 'Total Requests',
            value: stats.total,
            icon: '📊',
            color: '#3b82f6'
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: '⏳',
            color: '#f59e0b'
        },
        {
            title: 'Approved',
            value: stats.approved,
            icon: '✅',
            color: '#10b981'
        },
        {
            title: 'Rejected',
            value: stats.rejected,
            icon: '❌',
            color: '#ef4444'
        },
        {
            title: 'Fulfilled',
            value: stats.fulfilled,
            icon: '🎯',
            color: '#8b5cf6'
        },
        {
            title: 'Urgent',
            value: stats.urgent,
            icon: '⚠️',
            color: '#dc2626'
        }
    ];

    return (
        <div className="request-stats-grid">
            {statCards.map((card, index) => (
                <div key={index} className="stat-card" style={{ borderTopColor: card.color }}>
                    <div className="stat-icon">{card.icon}</div>
                    <div className="stat-content">
                        <h3 className="stat-title">{card.title}</h3>
                        <p className="stat-value">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};