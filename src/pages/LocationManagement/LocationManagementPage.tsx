import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LocationTable } from '../../components/LocationForm/LocationTable';
import { LocationForm } from '../../components/LocationForm/LocationForm';
import { useLocations } from '../../hooks/useLocations';
import { Location, LocationFormData } from '../../core/entities/Location';
import './location-management.css';

export const LocationManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        locations,
        loading,
        error,
        loadLocations,
        createLocation,
        updateLocation,
        deleteLocation,
        setError: setServiceError
    } = useLocations();

    const itemsPerPage = 4;

    useEffect(() => {
        loadLocations();
    }, [loadLocations]); // Added loadLocations to dependency array

    const filteredLocations = locations.filter(location => {
        const matchesSearch = searchTerm === '' ||
            location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.primaryContact?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || location.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLocations = filteredLocations.slice(startIndex, endIndex);

    const handleAddLocationClick = useCallback(() => {
        setEditingLocation(null);
        setIsModalOpen(true);
        setSuccessMessage(null);
    }, []);

    const handleEditLocation = useCallback((location: Location) => {
        setEditingLocation(location);
        setIsModalOpen(true);
        setSuccessMessage(null);
    }, []);

    const handleDeleteLocation = useCallback(async (location: Location) => {
        if (window.confirm(`Are you sure you want to delete ${location.name}?`)) {
            const result = await deleteLocation(location.id);
            if (result.success) {
                setSuccessMessage(`Location "${location.name}" deleted successfully!`);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        }
    }, [deleteLocation]);

    const handleSubmitLocation = useCallback(async (formData: LocationFormData) => {
        if (editingLocation) {
            const result = await updateLocation(editingLocation.id, formData);
            if (result.success) {
                setSuccessMessage(`Location "${formData.name}" updated successfully!`);
                setIsModalOpen(false);
                setTimeout(() => setSuccessMessage(null), 3000);
                return { success: true };
            }
            return result;
        } else {
            const result = await createLocation(formData);
            if (result.success) {
                setSuccessMessage(`Location "${formData.name}" added successfully!`);
                setIsModalOpen(false);
                setTimeout(() => setSuccessMessage(null), 3000);
                return { success: true };
            }
            return result;
        }
    }, [editingLocation, updateLocation, createLocation]);

    const handleViewAssets = useCallback((locationId: string) => {
        navigate(`/locations/${locationId}/assets`);
    }, [navigate]);

    const totalAssets = locations.reduce((sum, loc) => sum + loc.totalAssets, 0);

    return (
        <DashboardLayout activePage="locations">
            <div className="location-management-container">
                {/* Add/Edit Location Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingLocation ? 'Edit Location' : 'Add New Location'}
                    size="lg"
                >
                    {successMessage && (
                        <div className="success-message">
                            <span className="material-icons">check_circle</span>
                            {successMessage}
                        </div>
                    )}

                    <LocationForm
                        initialData={editingLocation ? {
                            name: editingLocation.name,
                            address: editingLocation.address,
                            type: editingLocation.type,
                            status: editingLocation.status,
                            totalAssets: editingLocation.totalAssets,
                            contactName: editingLocation.primaryContact.name,
                            contactEmail: editingLocation.primaryContact.email,
                            contactPhone: editingLocation.primaryContact.phone || '',
                            description: editingLocation.description || '',
                            region: editingLocation.region || ''
                        } : undefined}
                        onSubmit={handleSubmitLocation}
                        onCancel={() => setIsModalOpen(false)}
                        isSubmitting={loading}
                        title={editingLocation ? 'Update Location' : 'Add Location'}
                    />
                </Modal>

                {/* Header Section */}
                <div className="location-management-header">
                    <div className="header-left">
                        <h1 className="page-title">Location Management Overview</h1>
                        <p className="page-subtitle">Manage geographic assets across your regional hubs in South Africa</p>
                    </div>
                    <div className="header-right">
                        <div className="stats-container">
                            <Card glass padding="sm">
                                <div className="stat-item">
                                    <span className="stat-label">Total Locations</span>
                                    <span className="stat-value">{locations.length}</span>
                                </div>
                            </Card>
                            <Card glass padding="sm">
                                <div className="stat-item">
                                    <span className="stat-label">Total Assets</span>
                                    <span className="stat-value primary">{totalAssets}</span>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <Card glass padding="md" className="action-bar">
                    <div className="action-bar-left">
                        <div className="search-container">
                            <span className="material-icons search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search locations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-chips">
                            <button
                                className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                            >
                                <span className="material-icons">filter_list</span>
                                Status: All
                            </button>
                            <Button
                                variant={statusFilter === 'active' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('active')}
                            >
                                <span className="status-dot active"></span>
                                Active
                            </Button>
                            <Button
                                variant={statusFilter === 'maintenance' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('maintenance')}
                            >
                                <span className="status-dot maintenance"></span>
                                Maintenance
                            </Button>
                            <Button
                                variant={statusFilter === 'offline' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('offline')}
                            >
                                <span className="status-dot offline"></span>
                                Offline
                            </Button>
                        </div>
                    </div>

                    <div className="action-bar-right">
                        <Button variant="outline" icon="file_download">
                            Export
                        </Button>
                        <Button
                            variant="primary"
                            icon="add_location"
                            onClick={handleAddLocationClick}
                        >
                            Add New Location
                        </Button>
                    </div>
                </Card>

                {/* Error Display */}
                {error && (
                    <div className="error-message">
                        <span className="material-icons">error</span>
                        <span>{error}</span>
                        <button className="dismiss-btn" onClick={() => setServiceError(null)}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                {/* Success Message Display */}
                {successMessage && !isModalOpen && (
                    <div className="success-message">
                        <span className="material-icons">check_circle</span>
                        <span>{successMessage}</span>
                        <button className="dismiss-btn" onClick={() => setSuccessMessage(null)}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                {/* Locations Table Container */}
                <Card glass padding="none" className="locations-table-container">
                    <LocationTable
                        locations={currentLocations}
                        onViewAssets={handleViewAssets}
                        onEdit={handleEditLocation}
                        onDelete={handleDeleteLocation}
                        loading={loading}
                    />

                    {filteredLocations.length > 0 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                <span className="pagination-text">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredLocations.length)} of {filteredLocations.length} locations
                                </span>
                                <div className="per-page-selector">
                                    <span>Show:</span>
                                    <select
                                        className="per-page-select"
                                        value={itemsPerPage}
                                        onChange={() => setCurrentPage(1)}
                                    >
                                        <option>4</option>
                                        <option>8</option>
                                        <option>12</option>
                                        <option>20</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pagination-controls">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon="chevron_left"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                />
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon="chevron_right"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Quick Stats Grid */}
                <div className="quick-stats-grid">
                    <Card glass padding="md">
                        <div className="stat-card">
                            <div className="stat-card-icon">
                                <span className="material-icons">location_city</span>
                            </div>
                            <div className="stat-card-content">
                                <h4>Regional Distribution</h4>
                                <p>{locations.filter(l => l.type === 'hub' || l.type === 'hq').length} Active Hubs</p>
                            </div>
                        </div>
                    </Card>
                    <Card glass padding="md">
                        <div className="stat-card">
                            <div className="stat-card-icon">
                                <span className="material-icons">devices</span>
                            </div>
                            <div className="stat-card-content">
                                <h4>Total Assets</h4>
                                <p>{totalAssets} Deployed</p>
                            </div>
                        </div>
                    </Card>
                    <Card glass padding="md">
                        <div className="stat-card">
                            <div className="stat-card-icon">
                                <span className="material-icons">engineering</span>
                            </div>
                            <div className="stat-card-content">
                                <h4>Maintenance</h4>
                                <p>{locations.filter(l => l.status === 'maintenance').length} Locations</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* System Status Card */}
                <Card glass padding="md">
                    <div className="status-header">
                        <span className="status-title">Geographic Asset Management</span>
                        <span className="status-indicator active"></span>
                    </div>
                    <p className="status-message">
                        All location tracking systems are operational. Last updated: Today, 11:30 AM
                    </p>
                </Card>
            </div>
        </DashboardLayout>
    );
};