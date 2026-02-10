import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Asset } from '../../core/entities/Asset';
import './registry.css';

// Mock data for development - TODO: Replace with real API calls when backend is ready
const mockAssets: Asset[] = [
    {
        id: 'ASSET-001',
        name: 'MacBook Pro 16"',
        category: 'Laptop',
        status: 'assigned',
        location: 'Pretoria Central',
        serialNumber: 'FVFD1234H1',
        purchaseDate: new Date('2023-05-15'),
        value: 2124.15,
        assignedTo: 'USER-001',
        notes: 'Primary development machine',
        manufacturer: 'Apple Inc.',
        assignedDate: new Date('2023-06-01'),
        updatedAt: new Date('2024-01-15'),
        createdAt: new Date('2023-05-15'),
    },
    {
        id: 'ASSET-002',
        name: 'Dell Precision 7760',
        category: 'Workstation',
        status: 'available',
        location: 'Cape Town Waterfront',
        serialNumber: 'DLX9876K2',
        purchaseDate: new Date('2023-08-20'),
        value: 3245.99,
        assignedTo: undefined,
        notes: 'High-performance CAD workstation',
        manufacturer: 'Dell Technologies',
        updatedAt: new Date('2024-01-10'),
        createdAt: new Date('2023-08-20'),
    },
    {
        id: 'ASSET-003',
        name: 'iPad Pro 12.9"',
        category: 'Tablet',
        status: 'maintenance',
        location: 'Johannesburg CBD',
        serialNumber: 'IPD3456M3',
        purchaseDate: new Date('2023-11-05'),
        value: 1450.00,
        assignedTo: 'USER-003',
        notes: 'Field survey device - screen replacement needed',
        manufacturer: 'Apple Inc.',
        assignedDate: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-18'),
        createdAt: new Date('2023-11-05'),
    },
    {
        id: 'ASSET-004',
        name: 'HP ZBook Fury',
        category: 'Laptop',
        status: 'assigned',
        location: 'Polokwane Hub',
        serialNumber: 'HPZ4321N4',
        purchaseDate: new Date('2023-07-12'),
        value: 2899.99,
        assignedTo: 'USER-004',
        notes: 'Engineering department - Revit modeling',
        manufacturer: 'HP Inc.',
        assignedDate: new Date('2023-08-01'),
        updatedAt: new Date('2024-01-05'),
        createdAt: new Date('2023-07-12'),
    },
    {
        id: 'ASSET-005',
        name: 'Canon EOS R5',
        category: 'Camera',
        status: 'available',
        location: 'Durban Innovation Hub',
        serialNumber: 'CAN5678O5',
        purchaseDate: new Date('2023-09-30'),
        value: 4250.50,
        assignedTo: undefined,
        notes: 'Marketing department equipment',
        manufacturer: 'Canon',
        updatedAt: new Date('2023-12-15'),
        createdAt: new Date('2023-09-30'),
    },
    {
        id: 'ASSET-006',
        name: 'ThinkPad X1 Carbon',
        category: 'Laptop',
        status: 'retired',
        location: 'Pretoria Central',
        serialNumber: 'LNV8765P6',
        purchaseDate: new Date('2020-03-15'),
        value: 1850.00,
        assignedTo: undefined,
        notes: 'Retired after 4 years of service',
        manufacturer: 'Lenovo',
        updatedAt: new Date('2024-01-20'),
        createdAt: new Date('2020-03-15'),
    },
    {
        id: 'ASSET-007',
        name: 'Samsung Galaxy Tab S9',
        category: 'Tablet',
        status: 'assigned',
        location: 'Cape Town Waterfront',
        serialNumber: 'SGT1234Q7',
        purchaseDate: new Date('2023-10-25'),
        value: 1100.00,
        assignedTo: 'USER-005',
        notes: 'Field data collection device',
        manufacturer: 'Samsung',
        assignedDate: new Date('2023-11-15'),
        updatedAt: new Date('2024-01-12'),
        createdAt: new Date('2023-10-25'),
    },
    {
        id: 'ASSET-008',
        name: 'Microsoft Surface Laptop 5',
        category: 'Laptop',
        status: 'available',
        location: 'Johannesburg CBD',
        serialNumber: 'MSF5678R8',
        purchaseDate: new Date('2023-12-01'),
        value: 1950.00,
        assignedTo: undefined,
        notes: 'Executive team backup device',
        manufacturer: 'Microsoft',
        updatedAt: new Date('2024-01-08'),
        createdAt: new Date('2023-12-01'),
    },
];

export const AssetRegistryPage: React.FC = () => {
    const navigate = useNavigate();

    // TODO: Replace with real data fetching when backend is ready
    // const { assets, loading, error, fetchAssets, deleteAsset } = useAssets();

    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');

    // TODO: Replace with real data fetching when backend is ready
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setLoading(true);
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // TODO: Replace with actual API call
                // const assetsData = await fetchAssetsFromAPI();
                // setAssets(assetsData);

                // Using mock data for now
                setAssets(mockAssets);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load assets');
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    // TODO: Replace with real delete function when backend is ready
    const deleteAsset = async (assetId: string) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                // TODO: Replace with actual API call
                // await deleteAssetFromAPI(assetId);

                // Mock deletion for now
                setAssets(prev => prev.filter(asset => asset.id !== assetId));
                console.log(`Mock delete: Asset ${assetId} deleted`);
            } catch (err) {
                console.error('Failed to delete asset:', err);
                alert('Failed to delete asset. Please try again.');
            }
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = searchTerm === '' ||
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filter === 'all' || asset.status === filter;
        const matchesLocation = locationFilter === 'all' || asset.location === locationFilter;

        return matchesSearch && matchesStatus && matchesLocation;
    });

    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
        'available': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: '#10b981' },
        'assigned': { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: '#3b82f6' },
        'maintenance': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: '#f59e0b' },
        'retired': { bg: 'bg-red-500/10', text: 'text-red-400', dot: '#ef4444' }
    };

    const locationColors: Record<string, string> = {
        'Pretoria Central': 'bg-blue-500',
        'Cape Town Waterfront': 'bg-orange-500',
        'Johannesburg CBD': 'bg-purple-500',
        'Polokwane Hub': 'bg-green-500',
        'Durban Innovation Hub': 'bg-pink-500'
    };

    // TODO: Remove when real API is implemented
    const handleMockActions = (action: string) => {
        console.log(`Mock ${action} action triggered`);
        alert(`In a real application, this would ${action.toLowerCase()} the assets. This is a mock action for development.`);
    };

    const formatDate = (date?: Date | string): string => {
        if (!date) return 'Never updated';

        let dateObj: Date;
        if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            dateObj = date;
        }

        if (isNaN(dateObj.getTime())) return 'Invalid date';

        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const availableAssets = assets.filter(a => a.status === 'available').length;

    return (
        <DashboardLayout activePage="assets">
            <div className="registry-page">
                <header className="registry-header">
                    <div className="registry-header-left">
                        <h2 className="registry-title">Asset Registry</h2>
                        <p className="registry-subtitle">
                            Track and manage all organizational assets
                        </p>
                    </div>
                    <div className="registry-header-right">
                        <div className="registry-stats">
                            <Card glass className="stat-box">
                                <span className="stat-label">Total Assets</span>
                                <span className="stat-value">{assets.length}</span>
                            </Card>
                            <Card glass className="stat-box">
                                <span className="stat-label">Available</span>
                                <span className="stat-value primary">{availableAssets}</span>
                            </Card>
                        </div>
                    </div>
                </header>

                <section className="registry-action-bar">
                    <div className="action-bar-left">
                        <div className="search-container">
                            <span className="material-icons search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-chips">
                            <button
                                className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                <span className="material-icons">filter_list</span>
                                Status: All
                            </button>
                            <button
                                className={`filter-chip ${filter === 'available' ? 'active' : ''}`}
                                onClick={() => setFilter('available')}
                            >
                                <span className="material-icons">emergency</span>
                                Available
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
                        <Button
                            icon="file_download"
                            variant="secondary"
                            onClick={() => handleMockActions('Export')}
                        >
                            Export
                        </Button>
                        <Button
                            icon="add"
                            variant="primary"
                            onClick={() => navigate('/assets/new')}
                        >
                            Add Asset
                        </Button>
                    </div>
                </section>

                <section className="registry-data-grid">
                    {loading ? (
                        <Card glass className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading assets...</p>
                        </Card>
                    ) : error ? (
                        <Card glass className="error-container">
                            <span className="material-icons">error</span>
                            <p>{error}</p>
                            <Button
                                variant="primary"
                                onClick={() => window.location.reload()}
                                style={{ marginTop: '1rem' }}
                            >
                                Retry
                            </Button>
                        </Card>
                    ) : filteredAssets.length === 0 ? (
                        <Card glass className="empty-container">
                            <span className="material-icons">inventory</span>
                            <p>No assets found</p>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/assets/new')}
                                style={{ marginTop: '1rem' }}
                            >
                                Add Your First Asset
                            </Button>
                        </Card>
                    ) : (
                        <Card glass className="table-container">
                            <table className="asset-table">
                                <thead>
                                    <tr>
                                        <th>Asset ID</th>
                                        <th>Asset Name</th>
                                        <th>Category</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Last Updated</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((asset) => {
                                        const statusColor = statusColors[asset.status] || statusColors.available;
                                        return (
                                            <tr key={asset.id} className="asset-row">
                                                <td className="asset-id">
                                                    {asset.id?.substring(0, 8) || 'N/A'}
                                                </td>
                                                <td className="asset-info">
                                                    <div className="asset-name">{asset.name}</div>
                                                    <div className="asset-specs">{asset.notes}</div>
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
                                                    <div className={`status-badge ${statusColor.bg} ${statusColor.text}`}>
                                                        <span className="status-dot" style={{ backgroundColor: statusColor.dot }}></span>
                                                        <span className="status-text">
                                                            {asset.status?.charAt(0).toUpperCase() + asset.status?.slice(1) || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="last-audit">
                                                    {formatDate(asset.updatedAt || asset.createdAt)}
                                                </td>
                                                <td className="action-cell">
                                                    <div className="action-buttons">
                                                        <button
                                                            className="icon-btn"
                                                            onClick={() => navigate(`/assets/${asset.id}`)}
                                                            title="View Details"
                                                        >
                                                            <span className="material-icons">visibility</span>
                                                        </button>
                                                        <button
                                                            className="icon-btn"
                                                            onClick={() => navigate(`/assets/${asset.id}/edit`)}
                                                            title="Edit Asset"
                                                        >
                                                            <span className="material-icons">edit</span>
                                                        </button>
                                                        <button
                                                            className="icon-btn delete"
                                                            onClick={() => deleteAsset(asset.id!)}
                                                            title="Delete Asset"
                                                        >
                                                            <span className="material-icons">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Card>
                    )}
                </section>

                <Card glass className="system-status-card">
                    <div className="status-header">
                        <span className="status-title">Asset Registry System</span>
                        <span className="status-indicator active"></span>
                    </div>
                    <p className="status-message">
                        {loading ? 'Loading assets...' :
                            error ? `Error: ${error}` :
                                `Showing ${filteredAssets.length} of ${assets.length} assets`}
                    </p>
                </Card>
            </div>
        </DashboardLayout>
    );
};