// src/pages/AdminRequestsPage/AdminRequestsPage.tsx
import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout'; // ADD THIS
import { useAdminRequests } from '../../hooks/useAdminRequests';
import { AdminRequestFilters } from '../../features/adin_features/AdminRequestFilters';
import { RequestTable } from '../../features/shared/RequestTable';
import { RequestStats } from '../../features/shared/RequestStats';
import { IRequest } from '../../core/types/request.types';
import './AdminRequestsPage.css'; // Keep only page-specific CSS

export const AdminRequestsPage: React.FC = () => {
    const {
        requests,
        stats,
        loading,
        error,
        approveRequest,
        rejectRequest,
        fulfillRequest,
        refresh
    } = useAdminRequests();

    const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
    const [showFulfillModal, setShowFulfillModal] = useState(false);

    const handleApprove = async (requestId: string) => {
        const confirmed = window.confirm('Approve this request?');
        if (confirmed) {
            await approveRequest(requestId);
            refresh();
        }
    };

    const handleReject = async (requestId: string) => {
        const reason = window.prompt('Reason for rejection:');
        if (reason) {
            await rejectRequest(requestId, reason);
            refresh();
        }
    };

    if (loading) {
        return (
            <DashboardLayout activePage="requests">
                <div className="admin-requests-loading">
                    <div className="spinner"></div>
                    <p>Loading requests...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout activePage="requests">
                <div className="admin-requests-error">
                    <span className="material-icons">error</span>
                    <p>{error}</p>
                    <button onClick={refresh}>Retry</button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activePage="requests">
            <div className="admin-requests-container"> {/* Changed from admin-requests-page */}
                {/* Header Section */}
                <div className="admin-requests-header">
                    <div className="header-left"> {/* Match UserManagementPage pattern */}
                        <h1 className="page-title">Request Management</h1> {/* Match UserManagementPage pattern */}
                        <p className="page-subtitle">Review and manage asset requests from facilitators</p> {/* Match UserManagementPage pattern */}
                    </div>
                    <div className="header-right"> {/* Match UserManagementPage pattern */}
                        <div className="stats-container"> {/* Match UserManagementPage pattern */}
                            {/* Quick stats could go here */}
                        </div>
                    </div>
                </div>

                {/* Action Bar - Match UserManagementPage pattern */}
                <div className="action-bar">
                    <div className="action-bar-left">
                        {/* Filters will be here */}
                        <AdminRequestFilters onFilterChange={() => { }} />
                    </div>
                    <div className="action-bar-right">
                        <button className="export-btn" onClick={() => console.log('Export')}>
                            <span className="material-icons">download</span>
                            Export
                        </button>
                        <button className="refresh-btn" onClick={refresh}>
                            <span className="material-icons">refresh</span>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {stats && <RequestStats stats={stats} />}

                {/* Table Container - Match UserManagementPage pattern */}
                <div className="table-container"> {/* Match UserManagementPage pattern */}
                    <RequestTable
                        requests={requests}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onView={(request) => setSelectedRequest(request)}
                        onFulfill={(request) => {
                            setSelectedRequest(request);
                            setShowFulfillModal(true);
                        }}
                        showActions={true}
                        userRole="admin"
                    />
                </div>

                {/* Fulfill Modal */}
                {showFulfillModal && selectedRequest && (
                    <div className="fulfill-modal">
                        <div className="fulfill-modal-content">
                            <h3>Fulfill Request: {selectedRequest.requestId}</h3>
                            <p>Requester: {selectedRequest.requesterName}</p>
                            <p>Items: {selectedRequest.items?.length || 0}</p>

                            <div className="modal-actions">
                                <button
                                    onClick={async () => {
                                        if (!selectedRequest.id) {
                                            alert('Error: Request ID not found');
                                            return;
                                        }

                                        const items = selectedRequest.items?.map((item, index) => ({
                                            itemId: String(index),
                                            fulfilledQuantity: item.quantity
                                        })) || [];

                                        const success = await fulfillRequest(selectedRequest.id, {
                                            notes: 'Fulfilled by admin',
                                            items: items
                                        });

                                        if (success) {
                                            setShowFulfillModal(false);
                                            setSelectedRequest(null);
                                            refresh();
                                        }
                                    }}
                                    className="confirm-btn"
                                >
                                    Confirm Fulfillment
                                </button>
                                <button
                                    onClick={() => {
                                        setShowFulfillModal(false);
                                        setSelectedRequest(null);
                                    }}
                                    className="cancel-btn"
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