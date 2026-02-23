import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useFacilitatorAssets } from '../../hooks/useFacilitatorAssets';
import { useLocations } from '../../hooks/useLocations';
import { useAuth } from '../../hooks/useAuth';
import './facilitator-registry.css';

const LoadingState: React.FC = () => (
    <Card glass className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading assets...</p>
    </Card>
);

const ErrorState: React.FC<{ error: string | null; onRetry: () => void }> = ({ error, onRetry }) => (
    <Card glass className="error-container">
        <span className="material-icons">error</span>
        <p>Error loading assets: {error}</p>
        <Button
            variant="primary"
            onClick={onRetry}
            style={{ marginTop: '1rem' }}
        >
            Retry
        </Button>
    </Card>
);

const EmptyState: React.FC = () => (
    <Card glass className="empty-container">
        <span className="material-icons">inventory</span>
        <p>No assets found at your locations</p>
    </Card>
);

export const FacilitatorAssetRegistryPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { locationAssets, myAssets, loading, error, refreshAssets } = useFacilitatorAssets();
    const { locations } = useLocations();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [showMyAssets, setShowMyAssets] = useState(false);

    // Load data on mount
    useEffect(() => {
        refreshAssets();
    }, [refreshAssets]);

    // Combine assets based on toggle
    const displayedAssets = useMemo(() => {
        return showMyAssets ? myAssets : locationAssets;
    }, [showMyAssets, myAssets, locationAssets]);

    // Get unique categories for filters
    const categories = useMemo(() => {
        return Array.from(new Set(displayedAssets.map(asset => asset.category).filter(Boolean)));
    }, [displayedAssets]);

    // Get user's location names for filter - FIXED: moved inside useMemo
    const userLocations = useMemo(() => {
        const userLocationIds = user?.assignedHubIds || [];
        return locations.filter(loc => userLocationIds.includes(loc.id));
    }, [locations, user?.assignedHubIds]);

    // Filter assets
    const filteredAssets = useMemo(() => {
        return displayedAssets.filter(asset => {
            const matchesSearch = searchTerm === '' ||
                asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
            const matchesLocation = locationFilter === 'all' || asset.location === locationFilter;

            return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
        });
    }, [displayedAssets, searchTerm, statusFilter, categoryFilter, locationFilter]);

    const handleViewAsset = (assetId: string) => {
        navigate(`/assets/${assetId}`);
    };

    const handleReportIssue = (assetId: string) => {
        navigate(`/report-issue/${assetId}`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setLocationFilter('all');
    };

    // Stats for the header
    const stats = useMemo(() => ({
        total: displayedAssets.length,
        myAssets: myAssets.length,
        locationAssets: locationAssets.length
    }), [displayedAssets, myAssets, locationAssets]);

    // Determine content to render
    const renderContent = () => {
        if (loading) return <LoadingState />;
        if (error) return <ErrorState error={error} onRetry={refreshAssets} />;
        if (filteredAssets.length === 0) return <EmptyState />;

        return (
            <Card glass className="table-container">
                <table className="asset-table">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Asset Name</th>
                            <th>Serial</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map((asset) => (
                            <tr key={asset.id} className="asset-row">
                                <td className="asset-icon-cell">
                                    <span className="material-icons asset-icon">
                                        {asset.name.toLowerCase().includes('laptop') ? 'laptop' :
                                            asset.name.toLowerCase().includes('camera') ? 'videocam' :
                                                asset.name.toLowerCase().includes('printer') ? 'print' :
                                                    asset.name.toLowerCase().includes('conference') ? 'videocam' :
                                                        'devices'}
                                    </span>
                                </td>
                                <td className="asset-info">
                                    <div className="asset-name">{asset.name}</div>
                                    <div className="asset-details">{asset.brand} {asset.model}</div>
                                </td>
                                <td className="serial-number">
                                    <span className="serial-text">{asset.serialNumber}</span>
                                </td>
                                <td>
                                    <span className="category-badge">
                                        {asset.category}
                                    </span>
                                </td>
                                <td>
                                    <div className="location-cell">
                                        <span className="location-dot"></span>
                                        <div className="location-details">
                                            <span className="location-name">{asset.location}</span>
                                            <span className="location-code">{asset.locationCode}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${asset.status}`}>
                                        {asset.status === 'in-use' ? 'In Use' :
                                            asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                                    </span>
                                </td>
                                <td>
                                    <span className="assigned-to">
                                        {asset.assignedTo === 'Me' ? 'You' : asset.assignedTo}
                                    </span>
                                </td>
                                <td className="action-cell">
                                    <div className="action-buttons">
                                        <button
                                            className="icon-btn"
                                            onClick={() => handleViewAsset(asset.id)}
                                            title="View Details"
                                            type="button"
                                        >
                                            <span className="material-icons">visibility</span>
                                        </button>
                                        <button
                                            className="icon-btn report"
                                            onClick={() => handleReportIssue(asset.id)}
                                            title="Report Issue"
                                            type="button"
                                        >
                                            <span className="material-icons">report</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        );
    };

    return (
        <DashboardLayout activePage="facilitator-assets">
            <div className="facilitator-registry-page">
                <header className="registry-header">
                    <div className="registry-header-left">
                        <h2 className="registry-title">Location Assets</h2>
                        <p className="registry-subtitle">
                            View and manage assets at your assigned locations
                        </p>
                    </div>
                    <div className="registry-header-right">
                        <div className="registry-stats">
                            <Card glass className="stat-box">
                                <span className="stat-label">My Assets</span>
                                <span className="stat-value">{stats.myAssets}</span>
                            </Card>
                            <Card glass className="stat-box">
                                <span className="stat-label">Location Assets</span>
                                <span className="stat-value primary">{stats.locationAssets}</span>
                            </Card>
                        </div>
                    </div>
                </header>

                <section className="registry-action-bar">
                    <div className="action-bar-left">
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${!showMyAssets ? 'active' : ''}`}
                                onClick={() => setShowMyAssets(false)}
                                type="button"
                            >
                                <span className="material-icons">location_on</span>
                                Location Assets
                            </button>
                            <button
                                className={`toggle-btn ${showMyAssets ? 'active' : ''}`}
                                onClick={() => setShowMyAssets(true)}
                                type="button"
                            >
                                <span className="material-icons">person</span>
                                My Assets
                            </button>
                        </div>

                        <div className="search-container">
                            <span className="material-icons search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search assets by name, serial, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-chips">
                            <select
                                className="filter-chip"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="in-use">In Use</option>
                                <option value="available">Available</option>
                                <option value="maintenance">Maintenance</option>
                            </select>

                            <select
                                className="filter-chip"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select
                                className="filter-chip"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            >
                                <option value="all">All Locations</option>
                                {userLocations.map(location => (
                                    <option key={location.id} value={location.name}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                className="filter-chip clear"
                                onClick={handleClearFilters}
                                type="button"
                            >
                                <span className="material-icons">filter_alt_off</span>
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="action-bar-right">
                        <Button
                            icon="refresh"
                            variant="secondary"
                            onClick={refreshAssets}
                        >
                            Refresh
                        </Button>
                    </div>
                </section>

                <section className="registry-data-grid">
                    {renderContent()}
                </section>

                <Card glass className="info-card">
                    <div className="info-header">
                        <span className="info-title">
                            {showMyAssets ? 'My Assigned Assets' : 'Location Assets'}
                        </span>
                        <span className="info-indicator"></span>
                    </div>
                    <p className="info-message">
                        {loading ? 'Loading assets...' :
                            error ? `Error: ${error}` :
                                `Showing ${filteredAssets.length} of ${displayedAssets.length} assets`}
                        {!showMyAssets && userLocations.length > 0 &&
                            ` at ${userLocations.map(l => l.name).join(', ')}`}
                    </p>
                </Card>
            </div>
        </DashboardLayout>
    );
};