import React from 'react';
import './facilitator-styles.css';

export const AssetStatsGrid: React.FC = () => {
    return (
        <div className="asset-stats-grid">
            <div className="stat-card">
                <div className="stat-card-content">
                    <h3 className="stat-card-title">MY TOTAL ASSETS</h3>
                    <div className="stat-card-value">12</div>
                    <div className="stat-card-trend">
                        <span className="trend-up">+1</span>
                        from last month
                    </div>
                </div>
                <div className="stat-card-icon">
                    <span className="material-icons">inventory_2</span>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-content">
                    <h3 className="stat-card-title">ASSIGNED LOCATIONS</h3>
                    <div className="stat-card-value">1</div>
                    <div className="stat-card-subtitle">Kimberly</div>
                </div>
                <div className="stat-card-icon">
                    <span className="material-icons">location_on</span>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-content">
                    <h3 className="stat-card-title">OPEN SITE ISSUES</h3>
                    <div className="stat-card-value">4</div>
                    <div className="stat-card-warning">Requires Action</div>
                </div>
                <div className="stat-card-icon">
                    <span className="material-icons">warning</span>
                </div>
            </div>
        </div>
    );
};