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
    <Card className="state-container">
        <div className="loading-indicator">
            <div className="spinner"></div>
        </div>
        <p className="state-message">Loading assets...</p>
    </Card>
);

const ErrorState: React.FC<{ error: string | null; onRetry: () => void }> = ({ error, onRetry }) => (
    <Card className="state-container error">
        <div className="state-indicator">!</div>
        <p className="state-message">Error loading assets: {error}</p>
        <Button
            variant="primary"
            onClick={onRetry}
            className="retry-button"
        >
            Try Again
        </Button>
    </Card>
);

const EmptyState: React.FC<{ onAddAsset: () => void }> = ({ onAddAsset }) => (
    <Card className="state-container">
        <div className="state-indicator">📋</div>
        <p className="state-message">No assets found</p>
        <Button
            variant="primary"
            onClick={onAddAsset}
            className="add-first-button"
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

    const { locations, loading: locationsLoading, loadLocations } = useLocations();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const formatDate = useCallback((date?: Date): string => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }, []);

    useEffect(() => {
        fetchAssets();
        loadLocations();
    }, [fetchAssets, loadLocations]);

    const locationMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        locations.forEach(location => {
            map[location.id] = location.name;
        });
        return map;
    }, [locations]);

    const locationOptions = React.useMemo(() => {
        return locations.map(location => ({
            id: location.id,
            name: location.name
        }));
    }, [locations]);

    const categories = React.useMemo(() => {
        return Array.from(new Set(assets.map(asset => asset.category).filter(Boolean))) as string[];
    }, [assets]);

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

    const handleSubmitAsset = async (formData: AssetFormData) => {
        try {
            if (formMode === 'edit' && editingAsset) {
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

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setLocationFilter('all');
        setCurrentPage(1);
    };

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

    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAssets = filteredAssets.slice(startIndex, endIndex);

    const availableAssets = assets.filter(a => a.status === 'available').length;

    const activeFilterCount = [
        statusFilter !== 'all',
        categoryFilter !== 'all',
        locationFilter !== 'all',
        searchTerm !== ''
    ].filter(Boolean).length;

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="pagination" role="navigation" aria-label="Pagination">
                <button
                    className="pagination-button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
                >
                    ← Previous
                </button>
                <div className="pagination-info" aria-current="page">
                    Page {currentPage} of {totalPages}
                </div>
                <button
                    className="pagination-button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Go to next page"
                >
                    Next →
                </button>
            </div>
        );
    };

    const renderContent = () => {
        if (loading || locationsLoading) return <LoadingState />;
        if (error) return <ErrorState error={error} onRetry={() => {
            fetchAssets();
            loadLocations();
        }} />;
        if (filteredAssets.length === 0) return <EmptyState onAddAsset={handleAddAsset} />;

        return (
            <>
                <div className="table-wrapper">
                    <table className="asset-table">
                        <thead>
                            <tr>
                                <th scope="col">Asset ID</th>
                                <th scope="col">Asset Name</th>
                                <th scope="col">Category</th>
                                <th scope="col">Location</th>
                                <th scope="col">Status</th>
                                <th scope="col">Condition</th>
                                <th scope="col">Created</th>
                                <th scope="col" className="actions-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAssets.map((asset) => {
                                const statusClasses = {
                                    'available': 'status-available',
                                    'assigned': 'status-assigned',
                                    'maintenance': 'status-maintenance',
                                    'retired': 'status-retired'
                                };

                                return (
                                    <tr key={asset.id} className="asset-row">
                                        <td className="asset-id">
                                            {asset.assetId || asset.id.substring(0, 8)}
                                        </td>
                                        <td className="asset-info">
                                            <div className="asset-name">{asset.name}</div>
                                            {asset.description && (
                                                <div className="asset-description">{asset.description}</div>
                                            )}
                                            {asset.serialNumber && (
                                                <div className="asset-serial">S/N: {asset.serialNumber}</div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="category-tag">
                                                {asset.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="location-info">
                                                <span className="location-dot" aria-hidden="true"></span>
                                                <span className="location-name">
                                                    {locationMap[asset.currentLocationId] || 'Not specified'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`status-badge ${statusClasses[asset.status] || ''}`}>
                                                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`condition-tag condition-${asset.condition}`}>
                                                {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                                            </span>
                                        </td>
                                        <td className="date-cell">
                                            {formatDate(asset.createdAt)}
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-group" role="group" aria-label={`Actions for ${asset.name}`}>
                                                <button
                                                    className="action-button view"
                                                    onClick={() => handleViewAsset(asset.id)}
                                                    aria-label={`View details for ${asset.name}`}
                                                    type="button"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="action-button edit"
                                                    onClick={() => handleEditAsset(asset)}
                                                    aria-label={`Edit ${asset.name}`}
                                                    type="button"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="action-button delete"
                                                    onClick={() => handleDeleteAsset(asset.id)}
                                                    aria-label={`Delete ${asset.name}`}
                                                    type="button"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <div className="results-info">
                        Showing <span className="highlight">{startIndex + 1}-{Math.min(endIndex, filteredAssets.length)}</span> of <span className="highlight">{filteredAssets.length}</span> assets
                    </div>
                    {renderPagination()}
                </div>
            </>
        );
    };

    return (
        <DashboardLayout activePage="assets">
            <div className="registry-page">
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">Asset Registry</h1>
                        <p className="page-description">
                            Track and manage all organizational assets
                        </p>
                    </div>
                    <div className="header-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total Assets</span>
                            <span className="stat-value">{assets.length}</span>
                        </div>
                        <div className="stat-divider" aria-hidden="true"></div>
                        <div className="stat-item">
                            <span className="stat-label">Available</span>
                            <span className="stat-value highlight">{availableAssets}</span>
                        </div>
                    </div>
                </div>

                <div className="controls-section">
                    <div className="search-section">
                        <div className="search-field">
                            <label htmlFor="asset-search" className="visually-hidden">Search assets</label>
                            <input
                                type="text"
                                id="asset-search"
                                name="asset-search"
                                placeholder="Search by name, ID, or serial number..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="search-input"
                                autoComplete="off"
                                aria-label="Search assets"
                            />
                        </div>

                        <div className="filter-bar">
                            <div className="filter-group" role="group" aria-label="Status filters">
                                <button
                                    className={`filter-button ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setCurrentPage(1);
                                    }}
                                    type="button"
                                    aria-pressed={statusFilter === 'all'}
                                >
                                    All Status
                                </button>
                                <button
                                    className={`filter-button ${statusFilter === 'available' ? 'active' : ''}`}
                                    onClick={() => {
                                        setStatusFilter('available');
                                        setCurrentPage(1);
                                    }}
                                    type="button"
                                    aria-pressed={statusFilter === 'available'}
                                >
                                    Available
                                </button>
                                <button
                                    className={`filter-button ${statusFilter === 'assigned' ? 'active' : ''}`}
                                    onClick={() => {
                                        setStatusFilter('assigned');
                                        setCurrentPage(1);
                                    }}
                                    type="button"
                                    aria-pressed={statusFilter === 'assigned'}
                                >
                                    Assigned
                                </button>
                                <button
                                    className={`filter-button ${statusFilter === 'maintenance' ? 'active' : ''}`}
                                    onClick={() => {
                                        setStatusFilter('maintenance');
                                        setCurrentPage(1);
                                    }}
                                    type="button"
                                    aria-pressed={statusFilter === 'maintenance'}
                                >
                                    Maintenance
                                </button>
                            </div>

                            <div className="filter-group" role="group" aria-label="Category and location filters">
                                <div className="filter-select-wrapper">
                                    <label htmlFor="category-filter" className="visually-hidden">Filter by category</label>
                                    <select
                                        id="category-filter"
                                        name="category-filter"
                                        className="filter-select"
                                        value={categoryFilter}
                                        onChange={(e) => {
                                            setCategoryFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Filter by category"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-select-wrapper">
                                    <label htmlFor="location-filter" className="visually-hidden">Filter by location</label>
                                    <select
                                        id="location-filter"
                                        name="location-filter"
                                        className="filter-select"
                                        value={locationFilter}
                                        onChange={(e) => {
                                            setLocationFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Filter by location"
                                    >
                                        <option value="all">All Locations</option>
                                        {locationOptions.map(location => (
                                            <option key={location.id} value={location.id}>
                                                {location.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    className="clear-filters"
                                    onClick={handleClearFilters}
                                    type="button"
                                    aria-label={`Clear ${activeFilterCount} active filters`}
                                >
                                    Clear Filters ({activeFilterCount})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="action-section">
                        <Button
                            variant="primary"
                            onClick={handleAddAsset}
                            className="add-button"
                            aria-label="Add new asset"
                        >
                            + Add Asset
                        </Button>
                    </div>
                </div>

                <div className="content-section">
                    {renderContent()}
                </div>

                <div className="status-footer">
                    <div className="footer-left">
                        <span className="system-status">System Status</span>
                        <span className="status-dot active" aria-label="System online"></span>
                    </div>
                    <div className="footer-right">
                        {loading ? 'Loading assets...' :
                            error ? `Error: ${error}` :
                                `${filteredAssets.length} total assets`}
                    </div>
                </div>

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