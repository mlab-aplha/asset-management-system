import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './layout.css';

interface SidebarProps {
    activePage?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activePage = 'dashboard'
}) => {
    const navigate = useNavigate();
    const { user, signOut, isAdmin, isFacilitator, isStudent } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isActive = (page: string) => activePage === page;

    const adminNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        { id: 'assets', label: 'Assets', icon: 'inventory_2', path: '/assets' },
        { id: 'users', label: 'Users', icon: 'people', path: '/users' },
        { id: 'students', label: 'Students', icon: 'school', path: '/students' },
        { id: 'locations', label: 'Locations', icon: 'location_on', path: '/locations' },
        { id: 'requests', label: 'Requests', icon: 'request_quote', path: '/admin/requests' },
    ];

    const facilitatorNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/FacilitatorDashboard' },
        { id: 'my-assets', label: 'My Assets', icon: 'inventory_2', path: '/facilitator/assets' },
        { id: 'students', label: 'Students', icon: 'school', path: '/students' },
        { id: 'asset-requests', label: 'Asset Requests', icon: 'request_quote', path: '/facilitator/requests' },
    ];

    const studentNavItems = [
        { id: 'student-dashboard', label: 'Student Dashboard', icon: 'school', path: '/student/dashboard' },
        { id: 'my-assets', label: 'My Assets', icon: 'inventory_2', path: '/assets' },
        { id: 'my-requests', label: 'My Requests', icon: 'request_quote', path: '/asset-requests' },
    ];

    let navItems = [];
    if (isAdmin) {
        navItems = adminNavItems;
    } else if (isFacilitator) {
        navItems = facilitatorNavItems;
    } else if (isStudent) {
        navItems = studentNavItems;
    }

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
                        className={`sidebar-nav-item ${isActive(item.id) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="material-icons">{item.icon}</span>
                        <span className="sidebar-nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user?.displayName?.charAt(0) || 'U'}
                    </div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{user?.displayName || 'User'}</p>
                        <p className="sidebar-user-role">
                            {isAdmin ? 'Admin' : isFacilitator ? 'Facilitator' : isStudent ? 'Student' : 'User'}
                        </p>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>
                    <span className="material-icons">logout</span>
                    <span className="sidebar-logout-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
