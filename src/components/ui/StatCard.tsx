import React from 'react';
import { Card } from './Card';
import './ui.css';

interface StatCardProps {
    label: string;
    value: string;
    trend?: {
        value: string;
        type: 'positive' | 'negative' | 'neutral' | 'warning';
    };
    progress?: number;
    color?: 'lime' | 'turquoise' | 'navy' | 'amber';
    children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    trend,
    progress,
    color = 'lime',
    children
}) => {
    return (
        <Card className="stat-card">
            <div className={`stat-card-bg-accent ${color}`}></div>
            <p className="stat-card-label">{label}</p>
            <div className="stat-card-value">
                <h3>{value}</h3>
                {trend && (
                    <span className={`stat-card-trend ${trend.type}`}>
                        {trend.value}
                    </span>
                )}
            </div>
            {progress !== undefined && (
                <div className="stat-card-progress">
                    <div
                        className={`stat-card-progress-bar ${color}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}
            {children}
        </Card>
    );
};