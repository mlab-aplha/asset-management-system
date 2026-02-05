import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../../hooks/useAssets';
import { AuthService } from '../../core/services/AuthService';
import { Asset } from '../../core/services/AssetService';
import './registry.css';

export const AssetRegistryPage: React.FC = () => {
    const navigate = useNavigate();
    const { assets, loading, error, fetchAssets, deleteAsset } = useAssets();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');

    // Fetch assets on component mount
    React.useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/login');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const user = AuthService.getCurrentUser();

    // Filter assets based on search and filters
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = searchTerm === '' || 
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filter === 'all' || asset.status === filter;
        const matchesLocation = locationFilter === 'all' || asset.location === locationFilter;

        return matchesSearch && matchesStatus && matchesLocation;
    });

    const statusColors: Record<string, string> = {
        'available': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'assigned': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'maintenance': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'retired': 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    const locationColors: Record<string, string> = {
        'Pretoria Central': 'bg-blue-500',
        'Cape Town Waterfront': 'bg-orange-500',
        'Johannesburg CBD': 'bg-purple-500',
        'Polokwane Hub': 'bg-green-500',
        'Durban Innovation Hub': 'bg-pink-500'
    };

    return (
        <div className="dashboard-page registry-page">
            {/* Background SVG */}
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
                        <span className="material-icons">inventory_2</span>
                    </div>
                    <h1 className="dashboard-logo-text">
                        mLab <span className="dashboard-logo-accent">AMS</span>
                    </h1>
                </div>

                <nav className="dashboard-nav">
                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('/dashboard')}
                    >
                        <span className="material-icons">dashboard</span>
                        <span className="dashboard-nav-text">Executive Overview</span>
                    </button>

                    <button
                        className="dashboard-nav-link active"
                        onClick={() => handleNavigation('/registry')}
                    >
                        <span className="material-icons">package_2</span>
                        <span className="dashboard-nav-text">Asset Inventory</span>
                    </button>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('/maintenance')}
                    >
                        <span className="material-icons">build</span>
                        <span className="dashboard-nav-text">Maintenance</span>
                    </button>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('/hubs')}
                    >
                        <span className="material-icons">hub</span>
                        <span className="dashboard-nav-text">Regional Hubs</span>
                    </button>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('/reports')}
                    >
                        <span className="material-icons">fact_check</span>
                        <span className="dashboard-nav-text">Audits & Reports</span>
                    </button>

                    <div className="my-4 border-t border-white/10 mx-4"></div>

                    <button
                        className="dashboard-nav-link"
                        onClick={() => handleNavigation('/settings')}
                    >
                        <span className="material-icons">settings</span>
                        <span className="dashboard-nav-text">Settings</span>
                    </button>

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
                        <p className="dashboard-user-name">
                            {user?.displayName || 'Inventory Manager'}
                        </p>
                        <p className="dashboard-user-email">
                            {user?.email || 'manager@mlab.co.za'}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="registry-header">
                    <div className="registry-header-left">
                        <h2 className="registry-title">Asset Inventory Registry</h2>
                        <p className="registry-subtitle">
                            Centralized tracking of B2B enterprise hardware and infrastructure assets across all South African mLab innovation hubs.
                        </p>
                    </div>
                    <div className="registry-header-right">
                        <div className="registry-stats">
                            <div className="stat-box">
                                <span className="stat-label">Total Assets</span>
                                <span className="stat-value">{assets.length}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Available</span>
                                <span className="stat-value primary">
                                    {assets.filter(a => a.status === 'available').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Action Bar */}
                <section className="registry-action-bar">
                    <div className="action-bar-left">
                        {/* Search */}
                        <div className="search-container">
                            <span className="material-icons search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search by asset ID, serial, or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Filter Chips */}
                        <div className="filter-chips">
                            <button 
                                className={`filter-chip ${locationFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setLocationFilter('all')}
                            >
                                <span className="material-icons">location_on</span>
                                Location: All Hubs
                            </button>
                            <button 
                                className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                <span className="material-icons">category</span>
                                Category: All
                            </button>
                            <button 
                                className={`filter-chip ${filter === 'available' ? 'active' : ''}`}
                                onClick={() => setFilter('available')}
                            >
                                <span className="material-icons">emergency</span>
                                Status: Available
                            </button>
                            <button 
                                className="filter-chip clear"
                                onClick={() => {
                                    setFilter('all');
                                    setLocationFilter('all');
                                    setSearchTerm('');
                                }}
                            >
                                <span className="material-icons">filter_alt_off</span>
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div className="action-bar-right">
                        <button className="action-btn secondary">
                            <span className="material-icons">file_download</span>
                            Export
                        </button>
                        <button 
                            className="action-btn primary"
                            onClick={() => navigate('/assets/new')}
                        >
                            <span className="material-icons">add</span>
                            Add Asset
                        </button>
                        <button
                            className="action-btn logout-btn"
                            onClick={handleLogout}
                        >
                            <span className="material-icons">logout</span>
                            Logout
                        </button>
                    </div>
                </section>

                {/* Data Grid */}
                <section className="registry-data-grid">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading assets...</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <span className="material-icons">error</span>
                            <p>{error}</p>
                            <button onClick={fetchAssets} className="retry-btn">
                                Retry
                            </button>
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="empty-container">
                            <span className="material-icons">inventory</span>
                            <p>No assets found</p>
                            <button onClick={() => navigate('/assets/new')} className="add-asset-btn">
                                Add Your First Asset
                            </button>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="asset-table">
                                <thead>
                                    <tr>
                                        <th>Asset ID</th>
                                        <th>Asset Name & Specifications</th>
                                        <th>Category</th>
                                        <th>Hub Location</th>
                                        <th>Status</th>
                                        <th>Last Audit</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((asset) => (
                                        <tr key={asset.id} className="asset-row">
                                            <td className="asset-id">
                                                {asset.id || 'N/A'}
                                            </td>
                                            <td className="asset-info">
                                                <div className="asset-name">{asset.name}</div>
                                                <div className="asset-specs">{asset.description}</div>
                                                {asset.serialNumber && (
                                                    <div className="asset-serial">S/N: {asset.serialNumber}</div>
                                                )}
                                            </td>
                                            <td>
                                                <span className="category-badge">
                                                    {asset.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="location-cell">
                                                    <span 
                                                        className="location-dot" 
                                                        style={{ 
                                                            backgroundColor: locationColors[asset.location || ''] || '#94a3b8' 
                                                        }}
                                                    ></span>
                                                    <span className="location-text">
                                                        {asset.location || 'Not specified'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={`status-badge ${statusColors[asset.status] || ''}`}>
                                                    <span className="status-dot"></span>
                                                    <span className="status-text">
                                                        {asset.status?.charAt(0).toUpperCase() + asset.status?.slice(1) || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="last-audit">
                                                {asset.updatedAt ? 
                                                    new Date(asset.updatedAt).toLocaleDateString() : 
                                                    'Never audited'
                                                }
                                            </td>
                                            <td className="action-cell">
                                                <div className="action-buttons">
                                                    <button 
                                                        className="icon-btn"
                                                        onClick={() => navigate(`/assets/${asset.id}`)}
                                                    >
                                                        <span className="material-icons">visibility</span>
                                                    </button>
                                                    <button 
                                                        className="icon-btn"
                                                        onClick={() => navigate(`/assets/${asset.id}/edit`)}
                                                    >
                                                        <span className="material-icons">edit</span>
                                                    </button>
                                                    <button 
                                                        className="icon-btn delete"
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this asset?')) {
                                                                if (asset.id) {
                                                                    deleteAsset(asset.id);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <span className="material-icons">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Pagination */}
                {filteredAssets.length > 0 && (
                    <div className="registry-pagination">
                        <div className="pagination-left">
                            <span className="pagination-text">
                                Showing 1 to {filteredAssets.length} of {assets.length} entries
                            </span>
                            <div className="per-page-selector">
                                <span>Per page:</span>
                                <select className="per-page-select">
                                    <option>10</option>
                                    <option>25</option>
                                    <option>50</option>
                                </select>
                            </div>
                        </div>
                        <div className="pagination-controls">
                            <button className="pagination-btn">
                                <span className="material-icons">first_page</span>
                            </button>
                            <button className="pagination-btn">
                                <span className="material-icons">chevron_left</span>
                            </button>
                            <div className="page-numbers">
                                <span className="page-number active">1</span>
                                <span className="page-number">2</span>
                                <span className="page-number">3</span>
                                <span className="page-dots">...</span>
                                <span className="page-number">10</span>
                            </div>
                            <button className="pagination-btn">
                                <span className="material-icons">chevron_right</span>
                            </button>
                            <button className="pagination-btn">
                                <span className="material-icons">last_page</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* System Status */}
                <div className="system-status-card">
                    <div className="status-header">
                        <span className="status-title">System Status</span>
                        <span className="status-indicator active"></span>
                    </div>
                    <p className="status-message">
                        All regional nodes are operational and synced.
                    </p>
                </div>
            </main>
        </div>
    );
};