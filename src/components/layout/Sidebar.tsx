import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import './layout.css';

interface SidebarProps {
    activePage?: string;
    userRole?: 'admin' | 'facilitator';
}

export const Sidebar: React.FC<SidebarProps> = ({
    activePage = 'dashboard',
    userRole = 'admin'
}) => {
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

    const facilitatorNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/facilitator-dashboard' },
        { id: 'my-assets', label: 'My Assets', icon: 'inventory_2', path: '/facilitator/assets' },
        { id: 'asset-requests', label: 'Asset Requests', icon: 'request_quote', path: '/facilitator/requests' },
        { id: 'issues', label: 'Issue Reports', icon: 'report_problem', path: '/facilitator/issues' },
    ];

    const adminNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        { id: 'assets', label: 'Assets', icon: 'inventory_2', path: '/assets' },
        { id: 'users', label: 'Users', icon: 'people', path: '/users' },
        { id: 'locations', label: 'Locations', icon: 'location_on', path: '/locations' },
        { id: 'requests', label: 'Requests', icon: 'request_quote', path: '/admin/requests' },
    ];

    const navItems = userRole === 'facilitator' ? facilitatorNavItems : adminNavItems;

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <span className="material-icons">query_stats</span>
                </div>
                <h1 className="sidebar-logo-text">
                    mLab <span className="sidebar-logo-accent">AMS</span>
                </h1>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-nav-link ${isActive(item.id) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="material-icons">{item.icon}</span>
                        <span className="sidebar-nav-text">{item.label}</span>
                        {item.id === 'asset-requests' && (
                            <span className="notification-badge">3</span>
                        )}
                    </button>
                ))}

                <div className="nav-divider"></div>

                <button
                    className="sidebar-nav-link logout"
                    onClick={handleLogout}
                >
                    <span className="material-icons">logout</span>
                    <span className="sidebar-nav-text">Logout</span>
                </button>
            </nav>

            <div className="sidebar-user-profile">
                <div className="sidebar-user-avatar">
                    <div className="sidebar-avatar-image">
                        {user?.displayName?.charAt(0) || 'F'}
                    </div>
                </div>
                <div className="sidebar-user-info">
                    <p className="sidebar-user-name">
                        {user?.displayName || 'Facilitator User'}
                    </p>
                    <p className="sidebar-user-email">
                        {user?.email || 'facilitator@mlab.co.za'}
                    </p>
                </div>
            </div>
        </aside>
    );
};