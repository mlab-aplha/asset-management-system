import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AssetFormModal } from '../../assets/AssetFormModal'; // Import the modal
import { useAssets } from '../../hooks/useAssets';
import { Asset } from '../../core/entities/Asset';
import { AssetFormData } from '../../core/types/AssetFormTypes';
import { LocationService } from '../../../backend-firebase/src/services/LocationService';
import './asset-detail.css';

const LoadingState: React.FC = () => (
    <DashboardLayout activePage="assets">
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading asset details...</p>
        </div>
    </DashboardLayout>
);

const ErrorState: React.FC<{ error: string | null; onRetry: () => void }> = ({ error, onRetry }) => (
    <DashboardLayout activePage="assets">
        <div className="error-container">
            <span className="material-icons">error</span>
            <p>{error || 'Asset not found'}</p>
            <Button
                variant="primary"
                onClick={onRetry}
                style={{ marginTop: '1rem' }}
            >
                Back to Registry
            </Button>
        </div>
    </DashboardLayout>
);

const AssetHeader: React.FC<{
    asset: Asset;
    locationName: string;
}> = ({ asset, locationName }) => {
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'assigned': return '#85CC14';
            case 'available': return '#3b82f6';
            case 'maintenance': return '#f59e0b';
            case 'retired': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    const getStatusBgColor = (status: string): string => {
        switch (status) {
            case 'assigned': return 'rgba(133, 204, 20, 0.1)';
            case 'available': return 'rgba(59, 130, 246, 0.1)';
            case 'maintenance': return 'rgba(245, 158, 11, 0.1)';
            case 'retired': return 'rgba(239, 68, 68, 0.1)';
            default: return 'rgba(148, 163, 184, 0.1)';
        }
    };

    return (
        <header className="asset-detail-header">
            <div className="asset-header-left">
                <div className="asset-icon-large">
                    <div className="asset-icon-inner">
                        {asset.name?.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().substring(0, 2) || 'A'}
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
                        <span className="asset-id-value">{asset.assetId || asset.id}</span>
                        <span className="asset-location">
                            <span className="material-icons location-icon">location_on</span>
                            {locationName || asset.currentLocationId || 'Unspecified Location'}
                        </span>
                    </div>
                </div>
            </div>
            {/* REMOVED: Edit Asset Button */}
        </header>
    );
};

const AssetTabs: React.FC<{
    activeTab: 'overview' | 'history' | 'maintenance';
    onTabChange: (tab: 'overview' | 'history' | 'maintenance') => void;
}> = ({ activeTab, onTabChange }) => (
    <div className="asset-detail-tabs">
        <div className="tabs-container">
            <button
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => onTabChange('overview')}
            >
                <span className="tab-label">Overview</span>
                {activeTab === 'overview' && <div className="tab-indicator"></div>}
            </button>
            <button
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => onTabChange('history')}
            >
                <span className="tab-label">History</span>
                {activeTab === 'history' && <div className="tab-indicator"></div>}
            </button>
            <button
                className={`tab ${activeTab === 'maintenance' ? 'active' : ''}`}
                onClick={() => onTabChange('maintenance')}
            >
                <span className="tab-label">Maintenance</span>
                {activeTab === 'maintenance' && <div className="tab-indicator"></div>}
            </button>
        </div>
    </div>
);

const AssetInfoCard: React.FC<{
    asset: Asset;
    onEdit: () => void;
}> = ({ asset, onEdit }) => {
    const formatCurrency = (amount?: number): string => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (date?: Date | string): string => {
        if (!date) return 'N/A';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'N/A';
        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <Card glass padding="md" className="asset-info-card">
            <div className="card-header">
                <h3 className="card-title">Asset Information</h3>
                {/* ADDED: Edit button inside the card */}
                <Button
                    icon="edit"
                    variant="secondary"
                    size="sm"
                    onClick={onEdit}
                    className="edit-asset-btn"
                >
                    Edit Asset
                </Button>
            </div>
            <div className="card-body">
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Category</span>
                        <span className="info-value">{asset.category || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Type</span>
                        <span className="info-value">{asset.type || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Condition</span>
                        <span className="info-value condition-tag">{asset.condition || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Serial Number</span>
                        <span className="info-value serial-number">{asset.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Manufacturer</span>
                        <span className="info-value">{asset.manufacturer || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Model</span>
                        <span className="info-value">{asset.model || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Value</span>
                        <span className="info-value value">{formatCurrency(asset.value)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Purchase Date</span>
                        <span className="info-value">{formatDate(asset.purchaseDate)}</span>
                    </div>
                </div>

                <div className="notes-section">
                    <h4 className="notes-title">Description</h4>
                    <p className="notes-content">
                        {asset.description || 'No description available for this asset.'}
                    </p>
                </div>

                {asset.notes && (
                    <div className="notes-section">
                        <h4 className="notes-title">Notes</h4>
                        <p className="notes-content">{asset.notes}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

const AdditionalInfoCards: React.FC<{ asset: Asset }> = ({ asset }) => {
    const formatDate = (date?: Date | string): string => {
        if (!date) return 'N/A';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'N/A';
        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="additional-info-grid">
            <Card glass className="info-card">
                <div className="info-card-header">
                    <span className="material-icons">assignment</span>
                    <h4>Assignment</h4>
                </div>
                <div className="info-card-content">
                    <p>Assigned to: {asset.assignedTo || 'Not assigned'}</p>
                    {asset.assignmentDate && (
                        <p>Assigned on: {formatDate(asset.assignmentDate)}</p>
                    )}
                </div>
            </Card>

            <Card glass className="info-card">
                <div className="info-card-header">
                    <span className="material-icons">description</span>
                    <h4>Documentation</h4>
                </div>
                <div className="info-card-content">
                    <p>Asset ID: {asset.assetId}</p>
                    <p>Created: {formatDate(asset.createdAt)}</p>
                    {asset.updatedAt && <p>Last updated: {formatDate(asset.updatedAt)}</p>}
                </div>
            </Card>
        </div>
    );
};

const ActionButtons: React.FC<{
    asset: Asset;
    onDownload: () => void;
    onPrint: () => void;
    onMaintenance: () => void;
    onDecommission: () => void;
}> = ({ asset, onDownload, onPrint, onMaintenance, onDecommission }) => (
    <div className="action-buttons-row">
        <Button
            icon="file_download"
            variant="secondary"
            onClick={onDownload}
        >
            Download Report
        </Button>
        <Button
            icon="print"
            variant="secondary"
            onClick={onPrint}
        >
            Print Details
        </Button>
        {asset.status !== 'maintenance' && (
            <Button
                icon="build"
                variant="secondary"
                className="warning-btn"
                onClick={onMaintenance}
            >
                Request Maintenance
            </Button>
        )}
        {asset.status !== 'retired' && (
            <Button
                icon="delete"
                variant="danger"
                onClick={onDecommission}
            >
                Decommission
            </Button>
        )}
    </div>
);

const SystemStatusCard: React.FC<{ lastUpdated?: Date }> = ({ lastUpdated }) => {
    const formatDate = (date?: Date): string => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card glass className="system-status-card">
            <div className="status-header">
                <span className="status-title">Asset Tracking System</span>
                <span className="status-indicator active"></span>
            </div>
            <p className="status-message">
                Asset information last updated: {formatDate(lastUpdated)}
            </p>
        </Card>
    );
};

// Main Component
export const AssetDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { fetchAsset, loading, error, updateAsset, assets } = useAssets();

    const [asset, setAsset] = useState<Asset | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'maintenance'>('overview');
    const [locationName, setLocationName] = useState<string>('');

    // State for the edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load location name
    const loadLocationName = useCallback(async (locationId: string) => {
        try {
            const result = await LocationService.getLocation(locationId);
            if (result.success && result.data) {
                setLocationName(result.data.name);
            } else {
                setLocationName(locationId);
            }
        } catch (err) {
            console.error('Failed to load location:', err);
            setLocationName(locationId);
        }
    }, []);

    // Load asset
    const loadAsset = useCallback(async (assetId: string) => {
        const result = await fetchAsset(assetId);
        if (result.success && result.data) {
            setAsset(result.data);

            // Load location name
            if (result.data.currentLocationId) {
                await loadLocationName(result.data.currentLocationId);
            }
        }
    }, [fetchAsset, loadLocationName]);

    // Handle form submission for editing asset
    const handleSubmitAsset = async (formData: AssetFormData) => {
        if (!asset?.id) return;

        setSuccessMessage(null);

        try {
            const updateData = {
                name: formData.name,
                assetId: formData.assetId,
                type: formData.type,
                category: formData.category,
                status: formData.status,
                condition: formData.condition,
                currentLocationId: formData.currentLocationId,
                description: formData.description,
                serialNumber: formData.serialNumber,
                manufacturer: formData.manufacturer,
                model: formData.model,
                purchaseDate: formData.purchaseDate,
                purchasePrice: formData.purchasePrice,
                value: formData.value,
                assignedTo: formData.assignedTo,
                assignmentDate: formData.assignmentDate,
                notes: formData.notes,
                tags: formData.tags
            };

            const result = await updateAsset(asset.id, updateData);
            if (result.success) {
                setSuccessMessage('Asset updated successfully!');

                // Reload the asset to show updated data
                await loadAsset(asset.id);

                // Close modal after a delay
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    setSuccessMessage(null);
                }, 1500);
            } else {
                throw new Error(result.error || 'Failed to update asset');
            }
        } catch (error) {
            console.error('Failed to update asset:', error);
            setSuccessMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Handle CRUD operations
    const handleEditAsset = () => {
        setIsEditModalOpen(true);
    };

    const handleDownloadReport = () => {
        console.log('Download report for asset:', asset?.id);
        alert('Download functionality coming soon!');
    };

    const handlePrintDetails = () => {
        console.log('Print details for asset:', asset?.id);
        window.print();
    };

    const handleRequestMaintenance = async () => {
        if (asset?.id && window.confirm('Mark this asset as needing maintenance?')) {
            const result = await updateAsset(asset.id, { status: 'maintenance' });
            if (result.success) {
                alert('Asset marked for maintenance');
                loadAsset(asset.id); // Reload asset data
            } else {
                alert(`Failed to update asset: ${result.error}`);
            }
        }
    };

    const handleDecommission = async () => {
        if (asset?.id && window.confirm('Are you sure you want to decommission this asset?')) {
            const result = await updateAsset(asset.id, { status: 'retired' });
            if (result.success) {
                alert('Asset decommissioned');
                loadAsset(asset.id); // Reload asset data
            } else {
                alert(`Failed to decommission asset: ${result.error}`);
            }
        }
    };

    const handleBackToRegistry = () => {
        navigate('/assets');
    };

    // Success message auto-dismiss
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Load asset on component mount
    useEffect(() => {
        if (id) {
            // Use setTimeout to avoid the React warning
            const timer = setTimeout(() => {
                loadAsset(id);
            }, 0);

            // Cleanup function
            return () => clearTimeout(timer);
        }
    }, [id, loadAsset]);

    // Show loading state
    if (loading) {
        return <LoadingState />;
    }

    // Show error state
    if (error || !asset) {
        return <ErrorState error={error} onRetry={handleBackToRegistry} />;
    }

    return (
        <DashboardLayout activePage="assets">
            <div className="asset-detail-page">
                {/* Edit Asset Modal */}
                <AssetFormModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleSubmitAsset}
                    mode="edit"
                    existingAssets={assets}
                    asset={{
                        name: asset.name,
                        assetId: asset.assetId,
                        type: asset.type,
                        category: asset.category,
                        status: asset.status,
                        condition: asset.condition,
                        currentLocationId: asset.currentLocationId,
                        description: asset.description,
                        serialNumber: asset.serialNumber,
                        manufacturer: asset.manufacturer,
                        model: asset.model,
                        purchaseDate: asset.purchaseDate,
                        purchasePrice: asset.purchasePrice,
                        value: asset.value,
                        assignedTo: asset.assignedTo,
                        assignmentDate: asset.assignmentDate,
                        notes: asset.notes,
                        tags: asset.tags
                    }}
                />

                {/* Success Message Banner */}
                {successMessage && (
                    <div className="success-banner">
                        <span className="material-icons">check_circle</span>
                        <span>{successMessage}</span>
                        <button
                            className="dismiss-btn"
                            onClick={() => setSuccessMessage(null)}
                        >
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                <AssetHeader
                    asset={asset}
                    locationName={locationName}
                />

                <AssetTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <div className="asset-detail-content">
                    {activeTab === 'overview' && (
                        <>
                            <AssetInfoCard
                                asset={asset}
                                onEdit={handleEditAsset}
                            />
                            <AdditionalInfoCards asset={asset} />
                        </>
                    )}

                    {activeTab === 'history' && (
                        <Card glass padding="md">
                            <div className="card-header">
                                <h3 className="card-title">Asset History</h3>
                            </div>
                            <div className="card-body">
                                <div className="history-timeline">
                                    <div className="history-item">
                                        <div className="history-date">{new Date(asset.createdAt).toLocaleDateString()}</div>
                                        <div className="history-content">
                                            <h4>Asset Created</h4>
                                            <p>Asset was added to the registry</p>
                                        </div>
                                    </div>
                                    {asset.updatedAt && asset.updatedAt !== asset.createdAt && (
                                        <div className="history-item">
                                            <div className="history-date">{new Date(asset.updatedAt).toLocaleDateString()}</div>
                                            <div className="history-content">
                                                <h4>Asset Updated</h4>
                                                <p>Asset information was last modified</p>
                                            </div>
                                        </div>
                                    )}
                                    {asset.assignmentDate && (
                                        <div className="history-item">
                                            <div className="history-date">{new Date(asset.assignmentDate).toLocaleDateString()}</div>
                                            <div className="history-content">
                                                <h4>Assignment</h4>
                                                <p>Asset was assigned to {asset.assignedTo || 'user'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'maintenance' && (
                        <Card glass padding="md">
                            <div className="card-header">
                                <h3 className="card-title">Maintenance Records</h3>
                            </div>
                            <div className="card-body">
                                {asset.status === 'maintenance' ? (
                                    <div className="maintenance-alert">
                                        <span className="material-icons">warning</span>
                                        <div>
                                            <h4>Asset requires maintenance</h4>
                                            <p>This asset is currently marked as needing maintenance.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="maintenance-status">
                                        <span className="material-icons">check_circle</span>
                                        <div>
                                            <h4>No active maintenance requests</h4>
                                            <p>This asset is in good condition and doesn't require maintenance.</p>
                                        </div>
                                    </div>
                                )}
                                <div className="maintenance-actions">
                                    <Button
                                        variant="primary"
                                        onClick={handleRequestMaintenance}
                                    >
                                        <span className="material-icons">build</span>
                                        Request Maintenance
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <ActionButtons
                    asset={asset}
                    onDownload={handleDownloadReport}
                    onPrint={handlePrintDetails}
                    onMaintenance={handleRequestMaintenance}
                    onDecommission={handleDecommission}
                />

                <SystemStatusCard lastUpdated={asset.updatedAt || asset.createdAt} />
            </div>
        </DashboardLayout>
    );
};