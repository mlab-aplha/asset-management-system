import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import './dashboard.css';

export const StatsGrid: React.FC = () => {
    return (
        <div className="dashboard-stats-grid">
            <StatCard
                label="Total Asset Value (ZAR)"
                value="R 500K"
                trend={{ value: '+4.2%', type: 'positive' }}
                progress={75}
                color="lime"
            />

            <StatCard
                label="Compliance Score"
                value="78.4%"
                trend={{ value: 'Excellent', type: 'positive' }}
                progress={98}
                color="turquoise"
            />

            <StatCard
                label="Active Maintenance"
                value="24"
                trend={{ value: '12 Urgent', type: 'warning' }}
                color="navy"
            >
                <div className="stat-card-progress multi">
                    <div className="stat-progress-segment urgent"></div>
                    <div className="stat-progress-segment urgent"></div>
                    <div className="stat-progress-segment"></div>
                </div>
            </StatCard>

            <StatCard
                label="Hub Utilization"
                value="82%"
                trend={{ value: 'Peak Time', type: 'positive' }}
                progress={82}
                color="lime"
            />
        </div>
    );
};