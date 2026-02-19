import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAssets } from '../../hooks/useAssets';
import { Asset } from '../../core/entities/Asset';
import './asset-detail.css';

// Generate mock asset requests (1-419)
const generateMockRequests = () => {
    const requests = [];
    for (let i = 1; i <= 419; i++) {
        requests.push(`Asset Request ${i}`);
    }
    return requests;
};

export const AssetDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { fetchAsset, loading, error } = useAssets();
    
    const [asset, setAsset] = useState<Asset | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'requests'>('details');
    const [assetRequests] = useState(generateMockRequests());

    // Load asset
    const loadAsset = useCallback(async (assetId: string) => {
        const result = await fetchAsset(assetId);
        if (result.success && result.data) {
            setAsset(result.data);
        }
    }, [fetchAsset]);

    useEffect(() => {
        if (id) {
            loadAsset(id);
        }
    }, [id, loadAsset]);

    // Mock data if no asset is loaded (for testing)
    const displayAsset = asset || {
        id: id || '12345678901234567890123456789012',
        name: 'Test Asset',
        type: 'Test Asset',
        status: 'Active',
        owner: 'User1',
        description: 'Test Asset Description',
        priority: 'High',
        dueDate: '2023-01-01',
        budget: '$100,000.00',
        notes: 'This asset is for testing purposes only.'
    } as any;

    const handleBack = () => {
        navigate('/assets');
    };

    const handleViewAsset = () => {
        alert('View Asset - Coming soon');
    };

    const handleEditAsset = () => {
        alert('Edit Asset - Coming soon');
    };

    const handleDeleteAsset = () => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            alert('Delete Asset - Coming soon');
        }
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

    return (
        <DashboardLayout activePage="assets">
            <div className="asset-detail-page">
                {/* Header with back button */}
                <div className="asset-detail-header">
                    <button className="back-button" onClick={handleBack}>
                        <span className="material-icons">arrow_back</span>
                        Back to Assets
                    </button>
                    <h1 className="page-title">Asset Details</h1>
                </div>

                {/* Main Asset Information Card */}
                <div className="asset-main-card">
                    <div className="asset-header">
                        <h2 className="asset-name">{displayAsset.name}</h2>
                        <div className="asset-actions">
                            <button className="action-btn view" onClick={handleViewAsset}>
                                <span className="material-icons">visibility</span>
                                View Asset
                            </button>
                            <button className="action-btn edit" onClick={handleEditAsset}>
                                <span className="material-icons">edit</span>
                                Edit Asset
                            </button>
                            <button className="action-btn delete" onClick={handleDeleteAsset}>
                                <span className="material-icons">delete</span>
                                Delete Asset
                            </button>
                        </div>
                    </div>

                    <div className="asset-details-grid">
                        <div className="detail-item">
                            <span className="detail-label">Asset ID:</span>
                            <span className="detail-value">{displayAsset.id}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Asset Name:</span>
                            <span className="detail-value">{displayAsset.name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Asset Type:</span>
                            <span className="detail-value">{displayAsset.type}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Asset Status:</span>
                            <span className="detail-value status-active">{displayAsset.status}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Asset Owner:</span>
                            <span className="detail-value">{displayAsset.owner || 'User1'}</span>
                        </div>
                        <div className="detail-item full-width">
                            <span className="detail-label">Asset Description:</span>
                            <span className="detail-value">{displayAsset.description}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Asset Priority:</span>
                            <span className="detail-value priority-high">{displayAsset.priority}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Asset Due Date:</span>
                            <span className="detail-value">{displayAsset.dueDate}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Asset Budget:</span>
                            <span className="detail-value budget">{displayAsset.budget}</span>
                        </div>
                        <div className="detail-item full-width">
                            <span className="detail-label">Asset Notes:</span>
                            <span className="detail-value notes">{displayAsset.notes}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="asset-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Asset Details
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Asset Requests ({assetRequests.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'details' ? (
                        <div className="details-tab">
                            {/* Additional details can go here */}
                            <p className="info-message">Additional asset information will be displayed here.</p>
                        </div>
                    ) : (
                        <div className="requests-tab">
                            <h3 className="requests-title">Asset Requests</h3>
                            <div className="requests-list">
                                {assetRequests.map((request, index) => (
                                    <div key={index} className="request-item">
                                        {request}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
