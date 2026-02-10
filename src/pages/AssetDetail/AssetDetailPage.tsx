import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Asset } from '../../core/entities/Asset';
import './asset-detail.css';

// Mock data for development - TODO: Replace with real API calls when backend is ready
const mockAsset: Asset = {
    id: 'ASSET-001',
    name: 'MacBook Pro 16"',
    category: 'Laptop',
    status: 'assigned',
    location: 'HQ - Floor 3',
    serialNumber: 'FVFD1234H1',
    purchaseDate: new Date('2023-05-15'),
    value: 2124.15,
    assignedTo: 'USER-001',
    notes: 'Primary development machine for senior engineering staff, Assigned with standard peripheral kit.',
    manufacturer: 'Apple Inc.',
    assignedDate: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-15'),
    createdAt: new Date('2023-05-15'),
};

// Mock user data - TODO: Replace with real user service when backend is ready
const mockUsers = {
    'USER-001': {
        id: 'USER-001',
        name: 'Alex Johnson',
        initials: 'AJ',
        location: 'HQ - Floor 3',
        email: 'alex.johnson@mlab.co.za'
    },
    'USER-002': {
        id: 'USER-002',
        name: 'Sam Wilson',
        initials: 'SW',
        location: 'Lab 2',
        email: 'sam.wilson@mlab.co.za'
    }
};

export const AssetDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'maintenance'>('overview');

    // TODO: Replace with real data fetching when backend is ready
    // Currently using mock data for development
    const loadAsset = useCallback(async (assetId: string) => {
        try {
            setLoading(true);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // TODO: Replace with actual API call
            // const assetData = await fetchAsset(assetId);
            // if (assetData) {
            //     setAsset(assetData);
            // } else {
            //     setError('Asset not found');
            // }

            // Using mock data for now
            if (assetId === 'ASSET-001' || assetId === '1') {
                setAsset(mockAsset);
            } else {
                setError('Asset not found');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load asset details');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            loadAsset(id);
        }
    }, [id, loadAsset]);

    const handleEditAsset = () => {
        if (asset?.id) {
            navigate(`/assets/${asset.id}/edit`);
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'assigned':
                return '#85CC14';
            case 'available':
                return '#3b82f6';
            case 'maintenance':
                return '#f59e0b';
            case 'retired':
                return '#ef4444';
            default:
                return '#94a3b8';
        }
    };

    const getStatusBgColor = (status: string): string => {
        switch (status) {
            case 'assigned':
                return 'rgba(133, 204, 20, 0.1)';
            case 'available':
                return 'rgba(59, 130, 246, 0.1)';
            case 'maintenance':
                return 'rgba(245, 158, 11, 0.1)';
            case 'retired':
                return 'rgba(239, 68, 68, 0.1)';
            default:
                return 'rgba(148, 163, 184, 0.1)';
        }
    };

    const formatDate = (date?: Date | string): string => {
        if (!date) return 'N/A';

        let dateObj: Date;
        if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            dateObj = date;
        }

        if (isNaN(dateObj.getTime())) return 'N/A';

        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount?: number): string => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // TODO: Replace with real user service when backend is ready
    const getUserInitials = (userId?: string): string => {
        if (!userId) return 'NA';
        const user = mockUsers[userId as keyof typeof mockUsers];
        return user?.initials || 'NA';
    };

    const getUserName = (userId?: string): string => {
        if (!userId) return 'Not Assigned';
        const user = mockUsers[userId as keyof typeof mockUsers];
        return user?.name || 'Unknown User';
    };

    const getUserLocation = (userId?: string): string => {
        if (!userId) return 'Unknown Location';
        const user = mockUsers[userId as keyof typeof mockUsers];
        return user?.location || 'Unknown Location';
    };

    // TODO: Remove when real API is implemented
    const handleMockActions = (action: string) => {
        console.log(`Mock ${action} action triggered for asset: ${asset?.id}`);
        alert(`In a real application, this would ${action.toLowerCase()} the asset. This is a mock action for development.`);
    };

    if (loading) {
        return (
            <DashboardLayout activePage="assets">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading asset details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !asset) {
        return (
            <DashboardLayout activePage="assets">
                <div className="error-container">
                    <span className="material-icons">error</span>
                    <p>{error || 'Asset not found'}</p>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/assets')}
                        style={{ marginTop: '1rem' }}
                    >
                        Back to Registry
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activePage="assets">
            <div className="asset-detail-page">
                <header className="asset-detail-header">
                    <div className="asset-header-left">
                        <div className="asset-icon-large">
                            <div className="asset-icon-inner">
                                {asset.name?.split(' ').map(word => word.charAt(0)).join('').toUpperCase() || 'A'}
                            </div>
                        </div>
                        <div className="asset-title-section">
                            <div className="asset-title-row">
                                <h2 className="asset-name">{asset.name}</h2>
                                <div
                                    className="asset-status-badge"
                                    style={{
                                        backgroundColor: getStatusBgColor(asset.status || ''),
                                        color: getStatusColor(asset.status || '')
                                    }}
                                >
                                    {asset.status?.toUpperCase()}
                                </div>
                            </div>
                            <div className="asset-id-row">
                                <span className="asset-id-label">Asset ID:</span>
                                <span className="asset-id-value">{asset.id || 'N/A'}</span>
                                <span className="asset-location">
                                    <span className="material-icons location-icon">location_on</span>
                                    {asset.location || 'Unspecified Location'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="asset-header-right">
                        <Button
                            icon="edit"
                            variant="primary"
                            onClick={handleEditAsset}
                        >
                            Edit Asset
                        </Button>
                    </div>
                </header>

                <div className="asset-detail-tabs">
                    <div className="tabs-container">
                        <button
                            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <span className="tab-label">Overview</span>
                            {activeTab === 'overview' && <div className="tab-indicator"></div>}
                        </button>
                        <button
                            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <span className="tab-label">History</span>
                            {activeTab === 'history' && <div className="tab-indicator"></div>}
                        </button>
                        <button
                            className={`tab ${activeTab === 'maintenance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('maintenance')}
                        >
                            <span className="tab-label">Maintenance</span>
                            {activeTab === 'maintenance' && <div className="tab-indicator"></div>}
                        </button>
                    </div>
                </div>

                <div className="asset-detail-content">
                    <Card glass padding="md" className="asset-info-card">
                        <div className="card-header">
                            <h3 className="card-title">Asset Information</h3>
                        </div>
                        <div className="card-body">
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Manufacturer</span>
                                    <span className="info-value">{asset.manufacturer || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Serial Number</span>
                                    <span className="info-value serial-number">{asset.serialNumber || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Category</span>
                                    <span className="info-value">{asset.category || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Purchase Date</span>
                                    <span className="info-value">{formatDate(asset.purchaseDate)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Value</span>
                                    <span className="info-value value">{formatCurrency(asset.value)}</span>
                                </div>
                            </div>

                            <div className="notes-section">
                                <h4 className="notes-title">Notes</h4>
                                <p className="notes-content">
                                    {asset.notes || 'No notes available for this asset.'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card glass padding="md" className="assignment-card">
                        <div className="card-header">
                            <h3 className="card-title">Current Assignment</h3>
                        </div>
                        <div className="card-body">
                            {asset.assignedTo ? (
                                <div className="assignment-info">
                                    <div className="user-avatar">
                                        <div className="avatar-initials">
                                            {getUserInitials(asset.assignedTo)}
                                        </div>
                                    </div>
                                    <div className="user-details">
                                        <h4 className="user-name">{getUserName(asset.assignedTo)}</h4>
                                        <p className="assignment-duration">
                                            Since {formatDate(asset.assignedDate)}
                                        </p>
                                    </div>
                                    <div className="location-info">
                                        <span className="location-label">Location</span>
                                        <span className="location-value">
                                            {getUserLocation(asset.assignedTo)}
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-assignment">
                                    <span className="material-icons">person_off</span>
                                    <p>Not currently assigned</p>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleMockActions('Assign Asset')}
                                    >
                                        Assign Asset
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="additional-info-grid">
                    <Card glass className="info-card">
                        <div className="info-card-header">
                            <span className="material-icons">build</span>
                            <h4>Maintenance History</h4>
                        </div>
                        <div className="info-card-content">
                            <p>Last serviced: 2 months ago</p>
                            <span className="status-tag good">Good Condition</span>
                        </div>
                    </Card>

                    <Card glass className="info-card">
                        <div className="info-card-header">
                            <span className="material-icons">security</span>
                            <h4>Warranty</h4>
                        </div>
                        <div className="info-card-content">
                            <p>Expires: 15/05/2025</p>
                            <span className="status-tag active">Active</span>
                        </div>
                    </Card>

                    <Card glass className="info-card">
                        <div className="info-card-header">
                            <span className="material-icons">description</span>
                            <h4>Documents</h4>
                        </div>
                        <div className="info-card-content">
                            <p>3 attached files</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMockActions('View Documents')}
                            >
                                View All
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="action-buttons-row">
                    <Button
                        icon="file_download"
                        variant="secondary"
                        onClick={() => handleMockActions('Download Report')}
                    >
                        Download Report
                    </Button>
                    <Button
                        icon="print"
                        variant="secondary"
                        onClick={() => handleMockActions('Print Details')}
                    >
                        Print Details
                    </Button>
                    <Button
                        icon="build"
                        variant="secondary"
                        className="warning-btn"
                        onClick={() => handleMockActions('Request Maintenance')}
                    >
                        Request Maintenance
                    </Button>
                    <Button
                        icon="delete"
                        variant="danger"
                        onClick={() => handleMockActions('Decommission')}
                    >
                        Decommission
                    </Button>
                </div>

                <Card glass className="system-status-card">
                    <div className="status-header">
                        <span className="status-title">Asset Tracking System</span>
                        <span className="status-indicator active"></span>
                    </div>
                    <p className="status-message">
                        Asset information last updated: {formatDate(asset.updatedAt || asset.createdAt)}
                    </p>
                </Card>
            </div>
        </DashboardLayout>
    );
};