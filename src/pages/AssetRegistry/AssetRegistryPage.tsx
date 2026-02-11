import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AssetFormModal } from '../../assets/AssetFormModal';
import { Asset } from '../../core/entities/Asset';
import { AssetFormData } from '../../core/types/AssetFormTypes';
import { useAssets } from '../../hooks/useAssets';
import { useLocations } from '../../hooks/useLocations';
import './registry.css';
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

const EmptyState: React.FC<{ onAddAsset: () => void }> = ({ onAddAsset }) => (
    <Card glass className="empty-container">
        <span className="material-icons">inventory</span>
        <p>No assets found</p>
        <Button
            variant="primary"
            onClick={onAddAsset}
            style={{ marginTop: '1rem' }}
        >
            Add Your First Asset
        </Button>
    </Card>
);

export const AssetRegistryPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        assets,
        loading,
        error,
        fetchAssets,
        createAsset,
        updateAsset,
        deleteAsset
    } = useAssets();

    const { locations } = useLocations();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

    // Format date helper
    const formatDate = useCallback((date?: Date): string => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }, []);

    // Load assets on component mount
    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    // Create location map from locations data
    const locationMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        locations.forEach(location => {
            map[location.id] = location.name;
        });
        return map;
    }, [locations]);

    // Get unique categories for filters
    const categories = React.useMemo(() => {
        return Array.from(new Set(assets.map(asset => asset.category).filter(Boolean))) as string[];
    }, [assets]);

    // CRUD Operations with real Firebase
    const handleDeleteAsset = async (assetId: string) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            const result = await deleteAsset(assetId);
            if (result.success) {
                alert('Asset deleted successfully');
            } else {
                alert(`Failed to delete asset: ${result.error}`);
            }
        }
    };

    const handleViewAsset = (assetId: string) => {
        navigate(`/assets/${assetId}`);
    };

    const handleEditAsset = (asset: Asset) => {
        setFormMode('edit');
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const handleAddAsset = () => {
        setFormMode('add');
        setEditingAsset(null);
        setIsModalOpen(true);
    };

    // Handle form submission - FIXED TYPE CONVERSION
    const handleSubmitAsset = async (formData: AssetFormData) => {
        try {
            if (formMode === 'edit' && editingAsset) {
                // Update existing asset - Convert AssetFormData to UpdateAssetDto
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

                const result = await updateAsset(editingAsset.id, updateData);
                if (result.success) {
                    alert('Asset updated successfully');
                    setIsModalOpen(false);
                } else {
                    throw new Error(result.error || 'Failed to update asset');
                }
            } else {
                // Create new asset - Convert AssetFormData to CreateAssetDto
                const createData = {
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

                const result = await createAsset(createData);
                if (result.success) {
                    alert('Asset created successfully');
                    setIsModalOpen(false);
                } else {
                    throw new Error(result.error || 'Failed to create asset');
                }
            }
        } catch (error) {
            console.error('Failed to save asset:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Asset ID,Name,Category,Status,Location,Condition,Created\n"
            + filteredAssets.map(asset =>
                `${asset.assetId},${asset.name},${asset.category},${asset.status},${locationMap[asset.currentLocationId] || 'N/A'},${asset.condition},${formatDate(asset.createdAt)}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `assets_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setLocationFilter('all');
    };

    // Filter assets
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = searchTerm === '' ||
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.assetId && asset.assetId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
        const matchesLocation = locationFilter === 'all' || asset.currentLocationId === locationFilter;

        return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
    });

    const availableAssets = assets.filter(a => a.status === 'available').length;

    // Determine content to render
    const renderContent = () => {
        if (loading) return <LoadingState />;
        if (error) return <ErrorState error={error} onRetry={() => fetchAssets()} />;
        if (filteredAssets.length === 0) return <EmptyState onAddAsset={handleAddAsset} />;

        return (
            <Card glass className="table-container">
                <table className="asset-table">
                    <thead>
                        <tr>
                            <th>Asset ID</th>
                            <th>Asset Name</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Condition</th>
                            <th>Created</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map((asset) => {
                            const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
                                'available': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: '#10b981' },
                                'assigned': { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: '#3b82f6' },
                                'maintenance': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: '#f59e0b' },
                                'retired': { bg: 'bg-red-500/10', text: 'text-red-400', dot: '#ef4444' }
                            };
                            const statusColor = statusColors[asset.status] || statusColors.available;

                            return (
                                <tr key={asset.id} className="asset-row">
                                    <td className="asset-id">
                                        {asset.assetId || asset.id.substring(0, 8)}
                                    </td>
                                    <td className="asset-info">
                                        <div className="asset-name">{asset.name}</div>
                                        {asset.description && (
                                            <div className="asset-specs">{asset.description}</div>
                                        )}
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
                                            <span className="location-dot"></span>
                                            <span className="location-text">
                                                {locationMap[asset.currentLocationId] || 'Not specified'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-badge ${statusColor.bg} ${statusColor.text}`}>
                                            <span className="status-dot" style={{ backgroundColor: statusColor.dot }}></span>
                                            <span className="status-text">
                                                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`condition-badge ${asset.condition}`}>
                                            {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                                        </span>
                                    </td>
                                    <td className="created-date">
                                        {formatDate(asset.createdAt)}
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
                                                className="icon-btn"
                                                onClick={() => handleEditAsset(asset)}
                                                title="Edit Asset"
                                                type="button"
                                            >
                                                <span className="material-icons">edit</span>
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => handleDeleteAsset(asset.id)}
                                                title="Delete Asset"
                                                type="button"
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
        );
    };

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
                                placeholder="Search assets by name, ID, or serial..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-chips">
                            <button
                                className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                                type="button"
                            >
                                <span className="material-icons">filter_list</span>
                                All Status
                            </button>
                            <button
                                className={`filter-chip ${statusFilter === 'available' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('available')}
                                type="button"
                            >
                                <span className="material-icons">check_circle</span>
                                Available
                            </button>
                            <button
                                className={`filter-chip ${statusFilter === 'assigned' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('assigned')}
                                type="button"
                            >
                                <span className="material-icons">person</span>
                                Assigned
                            </button>
                            <button
                                className={`filter-chip ${statusFilter === 'maintenance' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('maintenance')}
                                type="button"
                            >
                                <span className="material-icons">build</span>
                                Maintenance
                            </button>

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
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>
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
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div className="action-bar-right">
                        <Button
                            icon="file_download"
                            variant="secondary"
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                        <Button
                            icon="add"
                            variant="primary"
                            onClick={handleAddAsset}
                        >
                            Add Asset
                        </Button>
                    </div>
                </section>

                <section className="registry-data-grid">
                    {renderContent()}
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

                /
                // Update the AssetFormModal component call:
                <AssetFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmitAsset}
                    mode={formMode}
                    existingAssets={assets}
                    asset={editingAsset ? {
                        name: editingAsset.name,
                        assetId: editingAsset.assetId,
                        type: editingAsset.type,
                        category: editingAsset.category,
                        status: editingAsset.status,
                        condition: editingAsset.condition,
                        currentLocationId: editingAsset.currentLocationId,
                        description: editingAsset.description,
                        serialNumber: editingAsset.serialNumber,
                        manufacturer: editingAsset.manufacturer,
                        model: editingAsset.model,
                        purchaseDate: editingAsset.purchaseDate,
                        purchasePrice: editingAsset.purchasePrice,
                        value: editingAsset.value,
                        assignedTo: editingAsset.assignedTo,
                        assignmentDate: editingAsset.assignmentDate,
                        notes: editingAsset.notes,
                        tags: editingAsset.tags
                    } : undefined}
                />

            </div>
        </DashboardLayout>
    );
};