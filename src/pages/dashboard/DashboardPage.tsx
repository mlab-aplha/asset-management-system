import React from 'react';
import { AuthService } from '../../core/services/AuthService';

export const DashboardPage: React.FC = () => {
    const user = AuthService.getCurrentUser();

    const handleLogout = () => {
        AuthService.logout();
        window.location.href = '/login';
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="dashboard-logo">
                    <div className="dashboard-logo-icon">
                        <span className="material-icons">account_tree</span>
                    </div>
                    <h2 className="dashboard-logo-text">
                        mLab <span className="dashboard-logo-subtext">AMS Dashboard</span>
                    </h2>
                </div>

                <div className="dashboard-user-info">
                    <span className="dashboard-user-name">Welcome, {user?.name}</span>
                    <span className="dashboard-user-role">{user?.role}</span>
                    <button className="dashboard-logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-welcome">
                    <h1 className="dashboard-title">Asset Management Dashboard</h1>
                    <p className="dashboard-subtitle">
                        Manage your assets, track assignments, and generate reports.
                    </p>
                </div>

                <div className="dashboard-stats">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon">
                            <span className="material-icons">inventory</span>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">0</h3>
                            <p className="stat-label">Total Assets</p>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-icon">
                            <span className="material-icons">assignment</span>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">0</h3>
                            <p className="stat-label">Active Assignments</p>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-icon">
                            <span className="material-icons">location_on</span>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">5</h3>
                            <p className="stat-label">Network Hubs</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-actions">
                    <button className="dashboard-action-button">
                        <span className="material-icons">add_circle</span>
                        Add New Asset
                    </button>
                    <button className="dashboard-action-button">
                        <span className="material-icons">assignment_ind</span>
                        Manage Assignments
                    </button>
                    <button className="dashboard-action-button">
                        <span className="material-icons">assessment</span>
                        Generate Reports
                    </button>
                </div>
            </main>

            <footer className="dashboard-footer">
                <div className="security-notice">
                    <span className="material-icons">shield</span>
                    <span>Secured by Neptune Tech Encryption</span>
                </div>
            </footer>
        </div>
    );
};