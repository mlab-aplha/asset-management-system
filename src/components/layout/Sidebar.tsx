// src/components/layout/Sidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './layout.css';

interface SidebarProps {
    activePage?: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage = 'dashboard' }) => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const isActive = (page: string) => activePage === page;

    // ── Nav items per role ────────────────────────────────────────────────────
    const navByRole: Record<string, NavItem[]> = {
        super_admin: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
            { id: 'assets', label: 'Assets', icon: 'inventory_2', path: '/assets' },
            { id: 'users', label: 'Users', icon: 'people', path: '/users' },
            { id: 'locations', label: 'Locations', icon: 'location_on', path: '/locations' },
            { id: 'requests', label: 'Requests', icon: 'request_quote', path: '/admin/requests' },

        ],
        hub_manager: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/manager/dashboard' },
            { id: 'requests', label: 'Requests', icon: 'request_quote', path: '/admin/requests' },
            { id: 'assets', label: 'Assets', icon: 'inventory_2', path: '/assets' },
            { id: 'asset-portal', label: 'Asset Portal', icon: 'store', path: '/asset-portal' },
        ],
        it: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/it/dashboard' },
            { id: 'maintenance', label: 'Maintenance', icon: 'build', path: '/it/maintenance' },
            { id: 'assets', label: 'Assets', icon: 'inventory_2', path: '/assets' },
            { id: 'asset-portal', label: 'Asset Portal', icon: 'store', path: '/asset-portal' },
        ],
        asset_facilitator: [
            { id: 'facilitator-dashboard', label: 'Dashboard', icon: 'dashboard', path: '/facilitator/dashboard' },
            { id: 'facilitator-assets', label: 'My Assets', icon: 'inventory_2', path: '/facilitator/assets' },
            { id: 'facilitator-requests', label: 'Requests', icon: 'request_quote', path: '/facilitator/requests' },
            { id: 'asset-portal', label: 'Asset Portal', icon: 'store', path: '/asset-portal' },
        ],
        student: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/student/dashboard' },
            { id: 'asset-portal', label: 'Browse Assets', icon: 'store', path: '/asset-portal' },
        ],
    };

    const role = user?.role ?? 'student';
    const navItems: NavItem[] = navByRole[role] ?? navByRole.student;

    const ROLE_DISPLAY: Record<string, string> = {
        super_admin: 'Super Admin',
        hub_manager: 'Hub Manager',
        it: 'IT Technician',
        asset_facilitator: 'Asset Facilitator',
        student: 'Student',
    };

    return (
        <aside className="dashboard-sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <span className="material-icons">query_stats</span>
                </div>
                <h1 className="sidebar-logo-text">
                    mLab <span className="sidebar-logo-accent">AMS</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-nav-link ${isActive(item.id) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        type="button"
                    >
                        <span className="material-icons">{item.icon}</span>
                        <span className="sidebar-nav-text">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="notification-badge">{item.badge}</span>
                        )}
                    </button>
                ))}

                <div className="nav-divider" />

                <button className="sidebar-nav-link logout" onClick={handleLogout} type="button">
                    <span className="material-icons">logout</span>
                    <span className="sidebar-nav-text">Logout</span>
                </button>
            </nav>

            {/* User profile */}
            <div className="sidebar-user-profile">
                <div className="sidebar-user-avatar">
                    <div className="sidebar-avatar-image">
                        {user?.displayName?.charAt(0) ?? user?.email?.charAt(0) ?? 'U'}
                    </div>
                </div>
                <div className="sidebar-user-info">
                    <p className="sidebar-user-name">{user?.displayName ?? 'User'}</p>
                    <p className="sidebar-user-email">{user?.email ?? ''}</p>
                    <p className="sidebar-user-role">{ROLE_DISPLAY[role] ?? role}</p>
                </div>
            </div>
        </aside>
    );
};