import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../core/services/AuthService';
import './dashboard.css';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/login');
    };

    const handleNavigation = (path: string) => {
        // For now, just log the navigation
        console.log(`Navigating to: ${path}`);
    };

    return (
        <div className="dashboard-page">
            {/* Background SVG (Consistent with Landing/Auth) */}
            <div className="dashboard-background">
                <svg className="dashboard-svg" viewBox="0 0 1000 800">
                    <path
                        d="M400,100 L600,100 L800,300 L800,600 L600,750 L200,750 L100,600 L100,300 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                </svg>
            </div>

            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="dashboard-logo">
                    <div className="dashboard-logo-icon">
                        <span className="material-icons">query_stats</span>
                    </div>
                    <h1 className="dashboard-logo-text">
                        mLab <span className="dashboard-logo-accent">Asset</span>
                    </h1>
                </div>

                <nav className="dashboard-nav">
                    <button
                        className="dashboard-nav-link active"
                        onClick={() => handleNavigation('overview')}
                    >
                        <span className="material-icons">dashboard</span>
                        <span className="dashboard-nav-text">Executive Overview</span>
                    </button>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('financials')}
                    >
                        <span className="material-icons">account_balance_wallet</span>
                        <span className="dashboard-nav-text">Financials</span>
                    </button>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('registry')}
                    >
                        <span className="material-icons">inventory</span>
                        <span className="dashboard-nav-text">Asset Registry</span>
                    </button>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('maintenance')}
                    >
                        <span className="material-icons">engineering</span>
                        <span className="dashboard-nav-text">Maintenance</span>
                    </button>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('utilization')}
                    >
                        <span className="material-icons">hub</span>
                        <span className="dashboard-nav-text">Hub Utilization</span>
                    </button>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('compliance')}
                    >
                        <span className="material-icons">gavel</span>
                        <span className="dashboard-nav-text">Compliance</span>
                    </button>

                    {/* Add Logout Button */}
                    <button
                        className="dashboard-nav-link logout"
                        onClick={handleLogout}
                    >
                        <span className="material-icons">logout</span>
                        <span className="dashboard-nav-text">Logout</span>
                    </button>
                </nav>

                <div className="dashboard-user-profile">
                    <div className="dashboard-user-avatar">
                        <div className="dashboard-avatar-image"></div>
                    </div>
                    <div className="dashboard-user-info">
                        {/* Use actual user data if available */}
                        <p className="dashboard-user-name">
                            {user?.name || 'Executive User'}
                        </p>
                        <p className="dashboard-user-email">
                            {user?.email || 'admin@mlab.co.za'}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="dashboard-header-left">
                        <h2 className="dashboard-title">Advanced Executive Analytics</h2>
                        <p className="dashboard-subtitle">South Africa Regional Portfolio Performance</p>
                    </div>
                    <div className="dashboard-header-actions">
                        <button className="dashboard-action-btn">
                            <span className="material-icons">calendar_today</span>
                            Last 30 Days
                        </button>
                        <button className="dashboard-action-btn primary">
                            <span className="material-icons">file_download</span>
                            Export Report
                        </button>
                        {/* Add Logout button in header for mobile */}
                        <button
                            className="dashboard-action-btn logout-btn"
                            onClick={handleLogout}
                        >
                            <span className="material-icons">logout</span>
                            Logout
                        </button>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="dashboard-stats-grid">
                    <div className="dashboard-stat-card">
                        <div className="stat-card-bg-accent lime"></div>
                        <p className="stat-card-label">Total Asset Value (ZAR)</p>
                        <div className="stat-card-value">
                            <h3>R 42.8M</h3>
                            <span className="stat-card-trend positive">+4.2%</span>
                        </div>
                        <div className="stat-card-progress">
                            <div className="stat-card-progress-bar" style={{ width: '75%' }}></div>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-card-bg-accent turquoise"></div>
                        <p className="stat-card-label">Compliance Score</p>
                        <div className="stat-card-value">
                            <h3>98.4%</h3>
                            <span className="stat-card-trend positive">Excellent</span>
                        </div>
                        <div className="stat-card-progress">
                            <div className="stat-card-progress-bar turquoise" style={{ width: '98%' }}></div>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-card-bg-accent navy"></div>
                        <p className="stat-card-label">Active Maintenance</p>
                        <div className="stat-card-value">
                            <h3>24</h3>
                            <span className="stat-card-trend warning">12 Urgent</span>
                        </div>
                        <div className="stat-card-progress multi">
                            <div className="stat-progress-segment urgent"></div>
                            <div className="stat-progress-segment urgent"></div>
                            <div className="stat-progress-segment"></div>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-card-bg-accent lime"></div>
                        <p className="stat-card-label">Hub Utilization</p>
                        <div className="stat-card-value">
                            <h3>82%</h3>
                            <span className="stat-card-trend positive">Peak Time</span>
                        </div>
                        <div className="stat-card-progress">
                            <div className="stat-card-progress-bar" style={{ width: '82%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="dashboard-content-grid">
                    {/* Chart Section */}
                    <div className="dashboard-chart-section">
                        <div className="dashboard-chart-header">
                            <h4>Global Distribution Tracking</h4>
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
                                {[
                                    { region: 'Gauteng', growth: 80, service: 60 },
                                    { region: 'W. Cape', growth: 65, service: 45 },
                                    { region: 'KZN', growth: 50, service: 30 },
                                    { region: 'Free State', growth: 90, service: 70 },
                                    { region: 'Limpopo', growth: 55, service: 40 },
                                    { region: 'E. Cape', growth: 35, service: 20 }
                                ].map((item, index) => (
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

                    {/* Right Sidebar */}
                    <div className="dashboard-right-sidebar">
                        {/* Alerts Section */}
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
                            <button className="alerts-view-all">View All Security Logs</button>
                        </div>

                        {/* Recent Activity */}
                        <div className="dashboard-activity">
                            <div className="activity-header">
                                <h4>
                                    <span className="material-icons">history</span>
                                    Recent Activity
                                </h4>
                            </div>
                            <div className="activity-list">
                                {[
                                    {
                                        icon: 'logout',
                                        color: 'lime',
                                        title: 'Thabo Mokoena checked out Precision M7510',
                                        location: 'Pretoria Hub • 10:45 AM'
                                    },
                                    {
                                        icon: 'login',
                                        color: 'turquoise',
                                        title: 'Lerato Molefe returned MacBook Air M2',
                                        location: 'Cape Town Lab • 09:12 AM'
                                    },
                                    {
                                        icon: 'construction',
                                        color: 'amber',
                                        title: 'Andile Dlamini scheduled maintenance',
                                        location: 'Durban Tech Hub • 08:30 AM'
                                    },
                                    {
                                        icon: 'person_add',
                                        color: 'lime',
                                        title: 'Nomvula Sithole authorized new assets',
                                        location: 'Regional HQ • Yesterday'
                                    }
                                ].map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className={`activity-icon ${activity.color}`}>
                                            <span className="material-icons">{activity.icon}</span>
                                        </div>
                                        <div className="activity-content">
                                            <p className="activity-title">{activity.title}</p>
                                            <p className="activity-location">{activity.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};