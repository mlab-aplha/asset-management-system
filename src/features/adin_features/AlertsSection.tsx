import React from 'react';
import './dashboard.css';

interface AlertsSectionProps {
    onViewAll?: () => void;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({ onViewAll }) => {
    return (
        <div className="dashboard-alerts">
            <div className="alerts-header">
                <h4>
                    <span className="material-icons">report</span>
                    Critical Alerts
                </h4>
                <span className="alerts-badge">3 NEW</span>
            </div>
            <div className="alerts-list">
                <div className="alert-item">
                    <div className="alert-indicator"></div>
                    <div className="alert-content">
                        <p className="alert-title">Server Room Temp Critical</p>
                        <p className="alert-location">mLab Precinct - Building A</p>
                        <p className="alert-time">2 mins ago</p>
                    </div>
                </div>
                <div className="alert-item">
                    <div className="alert-indicator"></div>
                    <div className="alert-content">
                        <p className="alert-title">Warranty Expiration Warning</p>
                        <p className="alert-location">85x Dell XPS Latitude Series</p>
                        <p className="alert-time inactive">1 hour ago</p>
                    </div>
                </div>
            </div>
            <button className="alerts-view-all" onClick={onViewAll}>
                View All Security Logs
            </button>
        </div>
    );
};