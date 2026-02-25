import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useFacilitatorRequests } from '../../hooks/useFacilitatorRequests';
import { useAssets } from '../../hooks/useAssets';
import { CreateRequestForm } from '../../features/facilitator_features/CreateRequestForm';
import { RequestTable } from '../../features/shared/RequestTable';
import { RequestService } from '../../../backend-firebase/src/services/RequestService';
import { userService } from '../../../backend-firebase/src/services/UserService';
import { auth } from '../../../backend-firebase/src/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Asset } from '../../core/entities/Asset';
import './FacilitatorRequestsPage.css';

// Update the form data to match your structure
interface CreateRequestFormData {
    department: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    neededBy: string;
    items: Array<{
        assetType: string;
        category?: string;
        quantity: number;
        purpose?: string;
        specifications?: Record<string, string>;
        urgency?: 'normal' | 'urgent';
    }>;
    notes: string;
    expectedDuration?: number;
}

interface UserData {
    uid: string;
    displayName: string;
    email: string;
    locationIds: string[];
    locationNames: string[];
}

// Interface for active assets display
interface ActiveAsset extends Asset {
    locationName?: string;
}

export const FacilitatorRequestsPage: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Use both hooks - one for requests, one for assets
    const { assets, loading: assetsLoading, fetchAssets } = useAssets();
    const { requests, loading: requestsLoading, error } = useFacilitatorRequests(
        user?.locationIds || []
    );

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
    const [selectedAsset, setSelectedAsset] = useState<ActiveAsset | null>(null);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [assetToRequest, setAssetToRequest] = useState<ActiveAsset | null>(null);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestQuantity, setRequestQuantity] = useState(1);

    // Fetch active assets when component mounts
    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    // Filter assets - based on actual AssetStatus enum values
    const activeAssets = assets.filter(asset => {
        return asset.status !== 'retired';
    });

    // Filter requests for current user
    const myRequests = user ? requests.filter(req => req.requesterId === user.uid) : [];
    const myPendingCount = myRequests.filter(req => req.status === 'pending').length;

    // Format asset for display
    const formatAssetDisplay = (asset: Asset): ActiveAsset => {
        return {
            ...asset,
            locationName: asset.currentLocationId || 'Not specified'
        };
    };

    // Handle asset click to show details
    const handleAssetClick = (asset: Asset) => {
        setSelectedAsset(formatAssetDisplay(asset));
        setShowAssetModal(true);
    };

    // Handle request asset button click
    const handleRequestAsset = (asset: Asset) => {
        setAssetToRequest(formatAssetDisplay(asset));
        setRequestQuantity(1);
        setShowRequestForm(true);
    };

    // Handle submit request for specific asset
    const handleSubmitAssetRequest = async () => {
        if (!assetToRequest || !user) return;

        try {
            // Define valid urgency types
            const urgency: 'normal' | 'urgent' = 'normal';

            // Get the correct user data from Firestore
            console.log('Submitting request with user data:', {
                uid: user.uid,
                name: user.displayName, // This should be "Mbuso" from your user data
                email: user.email
            });

            // Create a request for this specific asset
            const requestData = {
                requesterId: user.uid,
                requesterName: user.displayName, // Use the user's actual name from Firestore
                requesterEmail: user.email,
                locationId: user.locationIds[0] || '65UYS61WR39GmUjvjMLa', // Use actual location ID from your data
                locationName: user.locationNames[0] || 'Training Location',
                department: 'Training',
                items: [{
                    assetType: assetToRequest.type || 'Hardware',
                    category: assetToRequest.category || 'equipment',
                    quantity: requestQuantity,
                    purpose: `Request for asset: ${assetToRequest.name}`,
                    specifications: {
                        assetId: assetToRequest.id,
                        assetName: assetToRequest.name,
                        serialNumber: assetToRequest.serialNumber || 'N/A'
                    },
                    urgency: urgency,
                }],
                priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
                notes: `Requesting specific asset: ${assetToRequest.name} (${assetToRequest.assetId || assetToRequest.id})`,
                neededBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                expectedDuration: 30
            };

            const result = await RequestService.createRequest(requestData);

            if (result.success) {
                alert(`Request for ${assetToRequest.name} created successfully!`);
                setShowRequestForm(false);
                setAssetToRequest(null);
                // Refresh the page to show new request
                window.location.reload();
            } else {
                alert('Failed to create request: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error creating request:', err);
            alert('Failed to create request');
        }
    };

    // Fetch user's assigned locations from Firestore with correct displayName
    const fetchUserData = async (uid: string): Promise<{
        locationIds: string[];
        locationNames: string[];
        displayName: string;
    }> => {
        try {
            const users = await userService.getUsers();
            const currentUser = users.find(u => u.uid === uid);

            if (currentUser) {
                const locationIds = currentUser.assignedHubIds || [];
                const locationNames = locationIds.map(id => {
                    // Your location ID is already a string ID, not a formatted name
                    // Let's fetch actual location names from your locations collection
                    return id; // For now, return the ID
                });

                return {
                    locationIds,
                    locationNames,
                    displayName: currentUser.displayName || 'Facilitator' // Get the actual name from Firestore
                };
            }

            return {
                locationIds: [],
                locationNames: [],
                displayName: 'Facilitator'
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return {
                locationIds: [],
                locationNames: [],
                displayName: 'Facilitator'
            };
        }
    };

    // Get current user from Firebase Auth and fetch Firestore data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await fetchUserData(firebaseUser.uid);
                    setUser({
                        uid: firebaseUser.uid,
                        displayName: userData.displayName, // Use the name from Firestore
                        email: firebaseUser.email || '',
                        locationIds: userData.locationIds,
                        locationNames: userData.locationNames
                    });
                    console.log('User data loaded:', {
                        uid: firebaseUser.uid,
                        displayName: userData.displayName,
                        email: firebaseUser.email
                    });
                } catch (error) {
                    console.error('Error setting user data:', error);
                    setUser({
                        uid: firebaseUser.uid,
                        displayName: firebaseUser.displayName || 'Facilitator',
                        email: firebaseUser.email || '',
                        locationIds: [],
                        locationNames: []
                    });
                }
            } else {
                setUser(null);
                window.location.href = '/login';
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Show loading state
    if (authLoading || requestsLoading || assetsLoading) {
        return (
            <DashboardLayout activePage="requests" showBackground={false}>
                <div className="facilitator-requests-loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    // Redirect if not logged in
    if (!user) {
        return (
            <DashboardLayout activePage="requests" showBackground={false}>
                <div className="facilitator-requests-error">
                    <p>Please log in to view requests</p>
                    <button onClick={() => window.location.href = '/login'}>
                        Go to Login
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    // Show error if any
    if (error) {
        return (
            <DashboardLayout activePage="requests" showBackground={false}>
                <div className="facilitator-requests-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </DashboardLayout>
        );
    }

    const handleCreateRequest = async (data: CreateRequestFormData) => {
        try {
            console.log('Form data received:', JSON.stringify(data, null, 2));

            // Prepare items with default values
            const items = data.items.map(item => ({
                assetType: item.assetType,
                category: item.category || 'hardware',
                quantity: item.quantity || 1,
                purpose: item.purpose || '',
                specifications: item.specifications || {},
                urgency: item.urgency || 'normal',
            }));

            // Prepare the request data matching CreateRequestInput
            const requestData = {
                requesterId: user.uid,
                requesterName: user.displayName, // Use the user's actual name from Firestore
                requesterEmail: user.email,
                locationId: user.locationIds[0] || '65UYS61WR39GmUjvjMLa',
                locationName: user.locationNames[0] || 'Training Location',
                department: data.department || 'Training',
                items: items,
                priority: data.priority || 'medium',
                notes: data.notes || '',
                neededBy: data.neededBy ? new Date(data.neededBy) : undefined,
                expectedDuration: data.expectedDuration || 30
            };

            console.log('Sending to RequestService with name:', user.displayName);

            const result = await RequestService.createRequest(requestData);

            if (result.success) {
                setShowCreateForm(false);
                alert('Request created successfully!');
                // Refresh the page to show new request
                window.location.reload();
            } else {
                alert('Failed to create request: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Failed to create request');
            console.error('Error creating request:', err);
        }
    };

    const handleEditRequest = async (requestId: string, data: Record<string, unknown>) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) {
            alert('Request not found');
            return;
        }

        if (request.requesterId !== user.uid) {
            alert('You can only edit your own requests');
            return;
        }

        if (request.status !== 'pending') {
            alert('Only pending requests can be edited');
            return;
        }

        try {
            await RequestService.updateRequest(requestId, data);
            alert('Request updated successfully');
            window.location.reload();
        } catch (err) {
            alert('Failed to update request');
            console.error(err);
        }
    };

    const handleCancelRequest = async (requestId: string, reason: string) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) {
            alert('Request not found');
            return;
        }

        if (request.requesterId !== user.uid) {
            alert('You can only cancel your own requests');
            return;
        }

        if (request.status !== 'pending') {
            alert('Only pending requests can be cancelled');
            return;
        }

        try {
            await RequestService.updateRequest(requestId, {
                status: 'cancelled',
                notes: request.notes
                    ? `${request.notes}\nCancelled: ${reason}`
                    : `Cancelled: ${reason}`
            });
            alert('Request cancelled successfully');
            window.location.reload();
        } catch (err) {
            alert('Failed to cancel request');
            console.error(err);
        }
    };

    // Render active assets table
    const renderActiveAssetsTable = () => {
        if (activeAssets.length === 0) {
            return (
                <div className="request-table-empty">
                    <p>No active assets found</p>
                </div>
            );
        }

        return (
            <div className="table-container">
                <table className="assets-table">
                    <thead>
                        <tr>
                            <th>Asset ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Condition</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeAssets.map((asset) => (
                            <tr key={asset.id} className="asset-row">
                                <td className="asset-id" onClick={() => handleAssetClick(asset)}>
                                    <span className="id-badge">{asset.assetId || asset.id.substring(0, 8)}</span>
                                </td>
                                <td onClick={() => handleAssetClick(asset)}>
                                    <div className="asset-info">
                                        <strong>{asset.name}</strong>
                                        {asset.description && (
                                            <small>{asset.description.substring(0, 50)}...</small>
                                        )}
                                    </div>
                                </td>
                                <td onClick={() => handleAssetClick(asset)}>{asset.type || '—'}</td>
                                <td onClick={() => handleAssetClick(asset)}>
                                    <span className="category-tag">
                                        {asset.category || 'Uncategorized'}
                                    </span>
                                </td>
                                <td onClick={() => handleAssetClick(asset)}>
                                    <span className="location-name">
                                        <span className="location-dot"></span>
                                        {asset.currentLocationId || 'Not specified'}
                                    </span>
                                </td>
                                <td onClick={() => handleAssetClick(asset)}>
                                    <span className={`condition-tag condition-${asset.condition}`}>
                                        {asset.condition ? asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1) : '—'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn view"
                                            onClick={() => handleAssetClick(asset)}
                                            title="View Details"
                                        >
                                            View
                                        </button>
                                        <button
                                            className="action-btn request"
                                            onClick={() => handleRequestAsset(asset)}
                                            title="Request this asset"
                                        >
                                            Request
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardLayout activePage="requests" showBackground={false}>
            <div className="facilitator-requests-container">
                {/* Header with title and create button */}
                <div className="page-header">
                    <div className="header-left">
                        <h1 className="page-title">
                            {activeTab === 'all' ? 'Available Assets' : 'My Asset Requests'}
                        </h1>
                        <p className="page-subtitle">
                            {activeTab === 'all'
                                ? `Active assets available`
                                : `Managing your requests`
                            }
                        </p>
                    </div>
                    <div className="header-right">
                        {activeTab === 'mine' && (
                            <button
                                className="create-request-btn"
                                onClick={() => setShowCreateForm(true)}
                                disabled={!user.locationIds.length}
                                title={!user.locationIds.length ? "You don't have any assigned locations" : ""}
                            >
                                New Request
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Cards - Different stats based on active tab */}
                <div className="stats-grid">
                    {activeTab === 'all' ? (
                        // Stats for Active Assets
                        <>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>Total Active Assets</h3>
                                    <p>{activeAssets.length}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>Categories</h3>
                                    <p>{new Set(activeAssets.map(a => a.category).filter(Boolean)).size}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>Locations</h3>
                                    <p>{new Set(activeAssets.map(a => a.currentLocationId).filter(Boolean)).size}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>Available</h3>
                                    <p>{activeAssets.length}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Stats for Requests
                        <>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>Total Requests</h3>
                                    <p>{requests.length}</p>
                                </div>
                            </div>
                            <div className="stat-card pending">
                                <div className="stat-info">
                                    <h3>Pending</h3>
                                    <p>{requests.filter(r => r.status === 'pending').length}</p>
                                </div>
                            </div>
                            <div className="stat-card approved">
                                <div className="stat-info">
                                    <h3>Approved</h3>
                                    <p>{requests.filter(r => r.status === 'approved').length}</p>
                                </div>
                            </div>
                            <div className="stat-card my-pending">
                                <div className="stat-info">
                                    <h3>My Pending</h3>
                                    <p>{myPendingCount}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Available Assets ({activeAssets.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mine')}
                    >
                        My Requests ({myRequests.length})
                    </button>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'all' ? (
                    renderActiveAssetsTable()
                ) : (
                    <div className="table-container">
                        <RequestTable
                            requests={myRequests}
                            onEdit={handleEditRequest}
                            onCancel={handleCancelRequest}
                            showActions={true}
                            userRole="facilitator"
                        />
                    </div>
                )}

                {/* Create Request Modal */}
                {showCreateForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Create New Asset Request</h2>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <CreateRequestForm
                                onSubmit={handleCreateRequest}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Asset Detail Modal */}
                {showAssetModal && selectedAsset && (
                    <div className="modal-overlay" onClick={() => setShowAssetModal(false)}>
                        <div className="modal-content asset-detail-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Asset Details</h2>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowAssetModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Asset ID</span>
                                        <span className="detail-value">{selectedAsset.assetId || selectedAsset.id.substring(0, 8)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Name</span>
                                        <span className="detail-value">{selectedAsset.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Type</span>
                                        <span className="detail-value">{selectedAsset.type || '—'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Category</span>
                                        <span className="detail-value">{selectedAsset.category || '—'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status</span>
                                        <span className={`status-badge status-${selectedAsset.status}`}>
                                            {selectedAsset.status}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Condition</span>
                                        <span className={`condition-tag condition-${selectedAsset.condition}`}>
                                            {selectedAsset.condition}
                                        </span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Location</span>
                                        <span className="detail-value">{selectedAsset.locationName}</span>
                                    </div>
                                    {selectedAsset.description && (
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Description</span>
                                            <span className="detail-value">{selectedAsset.description}</span>
                                        </div>
                                    )}
                                    {selectedAsset.serialNumber && (
                                        <div className="detail-item">
                                            <span className="detail-label">Serial Number</span>
                                            <span className="detail-value">{selectedAsset.serialNumber}</span>
                                        </div>
                                    )}
                                    {selectedAsset.manufacturer && (
                                        <div className="detail-item">
                                            <span className="detail-label">Manufacturer</span>
                                            <span className="detail-value">{selectedAsset.manufacturer}</span>
                                        </div>
                                    )}
                                    {selectedAsset.model && (
                                        <div className="detail-item">
                                            <span className="detail-label">Model</span>
                                            <span className="detail-value">{selectedAsset.model}</span>
                                        </div>
                                    )}
                                    {selectedAsset.value && (
                                        <div className="detail-item">
                                            <span className="detail-label">Value</span>
                                            <span className="detail-value">R {selectedAsset.value.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-actions">
                                    <button
                                        className="action-button primary"
                                        onClick={() => {
                                            setShowAssetModal(false);
                                            handleRequestAsset(selectedAsset);
                                        }}
                                    >
                                        Request This Asset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Request Asset Modal */}
                {showRequestForm && assetToRequest && (
                    <div className="modal-overlay" onClick={() => setShowRequestForm(false)}>
                        <div className="modal-content request-asset-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Request Asset</h2>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowRequestForm(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="request-asset-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Asset</span>
                                        <span className="detail-value">{assetToRequest.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Asset ID</span>
                                        <span className="detail-value">{assetToRequest.assetId || assetToRequest.id.substring(0, 8)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Type</span>
                                        <span className="detail-value">{assetToRequest.type || '—'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Location</span>
                                        <span className="detail-value">{assetToRequest.locationName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Quantity</span>
                                        <div className="quantity-control">
                                            <button
                                                className="quantity-btn"
                                                onClick={() => setRequestQuantity(prev => Math.max(1, prev - 1))}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={requestQuantity}
                                                onChange={(e) => setRequestQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="quantity-input"
                                            />
                                            <button
                                                className="quantity-btn"
                                                onClick={() => setRequestQuantity(prev => prev + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="confirmation-text">
                                    Are you sure you want to request this asset?
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button
                                    onClick={handleSubmitAssetRequest}
                                    className="modal-button confirm"
                                >
                                    Submit Request
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRequestForm(false);
                                        setAssetToRequest(null);
                                    }}
                                    className="modal-button cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};