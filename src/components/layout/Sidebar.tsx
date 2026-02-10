import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import './layout.css';

interface SidebarProps {
    activePage?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage = 'dashboard' }) => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isActive = (page: string) => activePage === page;

    return (
        <aside className="dashboard-sidebar">
            <div className="dashboard-logo">
                <div className="dashboard-logo-icon">
                    <span className="material-icons">query_stats</span>
                </div>
                <h1 className="dashboard-logo-text">
                    mLab <span className="dashboard-logo-accent">AMS</span>
                </h1>
            </div>

            <nav className="dashboard-nav">
                <button
                    className={`dashboard-nav-link ${isActive('dashboard') ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard')}
                >
                    <span className="material-icons">dashboard</span>
                    <span className="dashboard-nav-text">Dashboard</span>
                </button>

                <button
                    className={`dashboard-nav-link ${isActive('assets') ? 'active' : ''}`}
                    onClick={() => navigate('/assets')}
                >
                    <span className="material-icons">inventory_2</span>
                    <span className="dashboard-nav-text">Assets</span>
                </button>

                <button
                    className={`dashboard-nav-link ${isActive('users') ? 'active' : ''}`}
                    onClick={() => navigate('/users')}
                >
                    <span className="material-icons">people</span>
                    <span className="dashboard-nav-text">Users</span>
                </button>

                <button
                    className={`dashboard-nav-link ${isActive('locations') ? 'active' : ''}`}
                    onClick={() => navigate('/locations')}
                >
                    <span className="material-icons">location_on</span>
                    <span className="dashboard-nav-text">Locations</span>
                </button>

                <div className="nav-divider"></div>

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
                    <div className="dashboard-avatar-image">
                        {user?.displayName?.charAt(0) || 'U'}
                    </div>
                </div>
                <div className="dashboard-user-info">
                    <p className="dashboard-user-name">
                        {user?.displayName || 'Executive User'}
                    </p>
                    <p className="dashboard-user-email">
                        {user?.email || 'admin@mlab.co.za'}
                    </p>
                </div>
            </div>
        </aside>
    );
};