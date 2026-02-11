import React from 'react';
import { Button } from '../../components/ui/Button';
import './dashboard.css';

interface DashboardHeaderProps {
    title: string;
    subtitle: string;
    onLogout?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    title,
    subtitle,
    onLogout
}) => {
    return (
        <header className="dashboard-header">
            <div className="dashboard-header-left">
                <h2 className="dashboard-title">{title}</h2>
                <p className="dashboard-subtitle">{subtitle}</p>
            </div>
            <div className="dashboard-header-actions">
                <Button icon="calendar_today" variant="secondary">
                    Last 30 Days
                </Button>
                <Button icon="file_download" variant="primary">
                    Export Report
                </Button>
                <Button
                    icon="logout"
                    variant="danger"
                    onClick={onLogout}
                    className="dashboard-action-btn logout-btn"
                >
                    Logout
                </Button>
            </div>
        </header>
    );
};