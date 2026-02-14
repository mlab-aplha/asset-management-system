// src/pages/FacilitatorRequestsPage/FacilitatorRequestsPage.tsx
import React, { useState, useEffect } from 'react';
// Remove useNavigate since it's not used
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useFacilitatorRequests } from '../../hooks/useFacilitatorRequests';
import { CreateRequestForm } from '../../features/facilitator_features/CreateRequestForm';
import { RequestTable } from '../../features/shared/RequestTable';
import { RequestService, CreateRequestInput } from '../../../backend-firebase/src/services/RequestService';
import { userService } from '../../../backend-firebase/src/services/UserService';
import { auth } from '../../../backend-firebase/src/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
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

export const FacilitatorRequestsPage: React.FC = () => {
    // Remove navigate - it's not used
    const [user, setUser] = useState<UserData | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Fetch user's assigned locations from Firestore
    const fetchUserData = async (uid: string): Promise<{ locationIds: string[]; locationNames: string[] }> => {
        try {
            const users = await userService.getUsers();
            const currentUser = users.find(u => u.uid === uid);

            if (currentUser) {
                // Using assignedHubIds from your UserService
                const locationIds = currentUser.assignedHubIds || [];
                // You might want to fetch location names from a LocationService
                const locationNames = locationIds.map(id => {
                    // This matches your locationId format "loc-pta-hq"
                    const parts = id.replace('loc-', '').split('-');
                    return parts.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                });

                return {
                    locationIds,
                    locationNames
                };
            }

            return {
                locationIds: [],
                locationNames: []
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return {
                locationIds: [],
                locationNames: []
            };
        }
    };

    // Get current user from Firebase Auth
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await fetchUserData(firebaseUser.uid);
                    setUser({
                        uid: firebaseUser.uid,
                        displayName: firebaseUser.displayName || 'Unknown',
                        email: firebaseUser.email || '',
                        locationIds: userData.locationIds,
                        locationNames: userData.locationNames
                    });
                } catch (error) {
                    console.error('Error setting user data:', error);
                    setUser({
                        uid: firebaseUser.uid,
                        displayName: firebaseUser.displayName || 'Unknown',
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

    // Fetch requests using the user's location IDs
    const { requests, loading, error } = useFacilitatorRequests(
        user?.locationIds || []
    );

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');

    // Filter requests for current user using requesterId
    const myRequests = user ? requests.filter(req => req.requesterId === user.uid) : [];
    const myPendingCount = myRequests.filter(req => req.status === 'pending').length;

    // Show loading state
    if (authLoading || loading) {
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
                    <span className="material-icons">error</span>
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
                    <span className="material-icons">error</span>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </DashboardLayout>
        );
    }

    const handleCreateRequest = async (data: CreateRequestFormData) => {
        try {
            // Match the structure from your Firestore
            const requestData: CreateRequestInput = {
                department: data.department,
                priority: data.priority,
                requesterId: user.uid,
                requesterName: user.displayName,
                requesterEmail: user.email,
                locationId: user.locationIds[0] || 'loc-pta-hq',
                locationName: user.locationNames[0] || 'Pretoria Headquarters',
                items: data.items.map(item => ({
                    assetType: item.assetType,
                    category: item.category || 'hardware',
                    quantity: item.quantity,
                    itemStatus: 'pending',
                    purpose: item.purpose,
                    specifications: item.specifications || {},
                    urgency: item.urgency || 'normal',
                    fulfillmentDetails: []
                })),
                notes: data.notes,
                neededBy: data.neededBy ? new Date(data.neededBy) : undefined,
                expectedDuration: data.expectedDuration || 30
            };

            const result = await RequestService.createRequest(requestData);

            if (result.success) {
                setShowCreateForm(false);
                alert('Request created successfully!');
                window.location.reload();
            } else {
                alert('Failed to create request: ' + result.error);
            }
        } catch (err) {
            alert('Failed to create request');
            console.error(err);
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

    return (
        <DashboardLayout activePage="requests" showBackground={false}>
            <div className="facilitator-requests-container">
                {/* Header with title and create button */}
                <div className="page-header">
                    <div className="header-left">
                        <h1 className="page-title">Asset Requests</h1>
                        <p className="page-subtitle">
                            Managing requests for: {user.locationNames.join(', ') || 'No locations assigned'}
                        </p>
                    </div>
                    <div className="header-right">
                        <button
                            className="create-request-btn"
                            onClick={() => setShowCreateForm(true)}
                            disabled={!user.locationIds.length}
                            title={!user.locationIds.length ? "You don't have any assigned locations" : ""}
                        >
                            <span className="material-icons">add</span>
                            New Request
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon">📋</span>
                        <div className="stat-info">
                            <h3>Total Requests</h3>
                            <p>{requests.length}</p>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <span className="stat-icon">⏳</span>
                        <div className="stat-info">
                            <h3>Pending</h3>
                            <p>{requests.filter(r => r.status === 'pending').length}</p>
                        </div>
                    </div>
                    <div className="stat-card approved">
                        <span className="stat-icon">✅</span>
                        <div className="stat-info">
                            <h3>Approved</h3>
                            <p>{requests.filter(r => r.status === 'approved').length}</p>
                        </div>
                    </div>
                    <div className="stat-card my-pending">
                        <span className="stat-icon">👤</span>
                        <div className="stat-info">
                            <h3>My Pending</h3>
                            <p>{myPendingCount}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Requests ({requests.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mine')}
                    >
                        My Requests ({myRequests.length})
                    </button>
                </div>

                {/* Requests Table */}
                <div className="table-container">
                    <RequestTable
                        requests={activeTab === 'all' ? requests : myRequests}
                        onEdit={handleEditRequest}
                        onCancel={handleCancelRequest}
                        showActions={activeTab === 'mine'}
                        userRole="facilitator"
                    />
                </div>

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
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                            <CreateRequestForm
                                onSubmit={handleCreateRequest}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};