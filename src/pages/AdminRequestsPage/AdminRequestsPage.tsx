// src/pages/AdminRequestsPage/AdminRequestsPage.tsx
import React, { useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAdminRequests } from '../../hooks/useAdminRequests';
import { RequestStats } from '../../features/shared/RequestStats';
import { IRequest, RequestItem } from '../../core/types/request.types';
import './AdminRequestsPage.css';

// Define proper types for Firebase Timestamp
interface FirebaseTimestamp {
    toDate: () => Date;
    seconds: number;
    nanoseconds: number;
}

type DateInput = FirebaseTimestamp | Date | string | null | undefined;

// Helper function to convert Firebase Timestamp to Date
const timestampToDate = (timestamp: DateInput): Date | undefined => {
    if (!timestamp) return undefined;

    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
        return (timestamp as FirebaseTimestamp).toDate();
    }

    if (timestamp instanceof Date) {
        return timestamp;
    }

    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
};

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
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Format date helper
    const formatDate = useCallback((timestamp: DateInput): string => {
        const date = timestampToDate(timestamp);
        if (!date) return 'N/A';

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Get item display string from RequestItem
    const getItemDisplay = useCallback((item: RequestItem): string => {
        return `${item.assetType} (${item.category}) - Qty: ${item.quantity}`;
    }, []);

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

    const handleFulfill = async () => {
        if (!selectedRequest || !selectedRequest.id) {
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
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
    };

    const activeFilterCount = [
        filterStatus !== 'all',
        searchTerm !== ''
    ].filter(Boolean).length;

    // Get status date based on actual Firestore structure
    const getStatusDate = useCallback((request: IRequest): string => {
        if (request.status === 'approved' && request.approval?.status === 'approved') {
            return formatDate(request.updatedAt); // Use updatedAt as approval timestamp
        }
        if (request.status === 'rejected' && request.approval?.rejectedAt) {
            return formatDate(request.approval.rejectedAt);
        }
        if (request.status === 'fulfilled') {
            return formatDate(request.updatedAt); // Use updatedAt for fulfillment
        }
        return '—';
    }, [formatDate]);

    // Filter requests based on search and status
    const filteredRequests = requests.filter(request => {
        const matchesSearch = searchTerm === '' ||
            request.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requesterEmail?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <DashboardLayout activePage="requests">
                <div className="state-container">
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                    </div>
                    <p className="state-message">Loading requests...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout activePage="requests">
                <div className="state-container error">
                    <div className="state-indicator">!</div>
                    <p className="state-message">{error}</p>
                    <button
                        onClick={refresh}
                        className="retry-button"
                    >
                        Try Again
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activePage="requests">
            <div className="requests-page">
                {/* Header Section */}
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">Request Management</h1>
                        <p className="page-description">
                            Review and manage asset requests from facilitators
                        </p>
                    </div>
                    {stats && (
                        <div className="header-stats">
                            <div className="stat-item">
                                <span className="stat-label">Total Requests</span>
                                <span className="stat-value">{stats.total || 0}</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-label">Pending</span>
                                <span className="stat-value highlight">{stats.pending || 0}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Section */}
                <div className="controls-section">
                    <div className="search-section">
                        <div className="search-field">
                            <input
                                type="text"
                                placeholder="Search by request ID or requester name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-bar">
                            <div className="filter-group">
                                <button
                                    className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('all')}
                                    type="button"
                                >
                                    All Requests
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === 'pending' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('pending')}
                                    type="button"
                                >
                                    Pending
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === 'approved' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('approved')}
                                    type="button"
                                >
                                    Approved
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === 'rejected' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('rejected')}
                                    type="button"
                                >
                                    Rejected
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === 'fulfilled' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('fulfilled')}
                                    type="button"
                                >
                                    Fulfilled
                                </button>
                            </div>

                            {/* Advanced Filters Toggle */}
                            <div className="advanced-filters">
                                <button
                                    className={`filters-toggle ${showAdvancedFilters ? 'active' : ''}`}
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    type="button"
                                >
                                    <span>Advanced Filters</span>
                                    <span className="toggle-icon">{showAdvancedFilters ? '−' : '+'}</span>
                                </button>

                                {showAdvancedFilters && (
                                    <div className="filters-panel">
                                        <div className="filters-grid">
                                            {/* Priority Filters */}
                                            <div className="filter-section">
                                                <label className="filter-label">Priority</label>
                                                <div className="filter-options">
                                                    {['low', 'medium', 'high', 'urgent'].map(priority => (
                                                        <label key={priority} className="filter-checkbox">
                                                            <input type="checkbox" />
                                                            <span className="checkbox-text priority">
                                                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Date Range */}
                                            <div className="filter-section">
                                                <label className="filter-label">Date Range</label>
                                                <div className="date-range">
                                                    <input
                                                        type="date"
                                                        className="date-input"
                                                    />
                                                    <span className="date-separator">to</span>
                                                    <input
                                                        type="date"
                                                        className="date-input"
                                                    />
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div className="filter-section">
                                                <label className="filter-label">Department</label>
                                                <input
                                                    type="text"
                                                    className="filter-input"
                                                    placeholder="Filter by department"
                                                />
                                            </div>
                                        </div>

                                        {/* Filter Actions */}
                                        <div className="filter-actions">
                                            <button className="apply-filters-btn">Apply Filters</button>
                                            <button className="clear-filters-btn">Clear All</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    className="clear-filters"
                                    onClick={handleClearFilters}
                                    type="button"
                                >
                                    Clear Filters ({activeFilterCount})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="action-section">
                        <button
                            className="action-button secondary"
                            onClick={refresh}
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Section */}
                {stats && (
                    <div className="stats-section">
                        <RequestStats stats={stats} />
                    </div>
                )}

                {/* Table Section */}
                <div className="table-section">
                    <div className="table-wrapper">
                        <table className="requests-table">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Requester</th>
                                    <th>Department</th>
                                    <th>Items</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Status Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="request-row">
                                        <td className="request-id">
                                            {request.requestId || request.id?.substring(0, 8)}
                                        </td>
                                        <td className="requester-info">
                                            <div className="requester-name">{request.requesterName}</div>
                                            {request.requesterEmail && (
                                                <div className="requester-email">{request.requesterEmail}</div>
                                            )}
                                        </td>
                                        <td>{request.department || '—'}</td>
                                        <td>
                                            <span className="items-count">
                                                {request.items?.length || 0} items
                                            </span>
                                            {request.items && request.items.length > 0 && (
                                                <div className="items-preview">
                                                    {request.items.slice(0, 2).map((item, idx) => (
                                                        <span key={idx} className="item-preview">
                                                            {getItemDisplay(item)}
                                                        </span>
                                                    ))}
                                                    {request.items.length > 2 && (
                                                        <span className="more-items">
                                                            +{request.items.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`priority-badge priority-${request.priority || 'medium'}`}>
                                                {request.priority || 'Medium'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${request.status}`}>
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="date-cell">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="date-cell">
                                            {getStatusDate(request)}
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-group">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="action-button approve"
                                                            onClick={() => handleApprove(request.id)}
                                                            title="Approve request"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="action-button reject"
                                                            onClick={() => handleReject(request.id)}
                                                            title="Reject request"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {request.status === 'approved' && (
                                                    <button
                                                        className="action-button fulfill"
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowFulfillModal(true);
                                                        }}
                                                        title="Fulfill request"
                                                    >
                                                        Fulfill
                                                    </button>
                                                )}
                                                <button
                                                    className="action-button view"
                                                    onClick={() => setSelectedRequest(request)}
                                                    title="View details"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status Footer */}
                <div className="status-footer">
                    <div className="footer-left">
                        <span className="system-status">System Status</span>
                        <span className="status-dot active"></span>
                    </div>
                    <div className="footer-right">
                        Showing {filteredRequests.length} of {requests.length} requests
                    </div>
                </div>

                {/* Fulfill Modal */}
                {showFulfillModal && selectedRequest && (
                    <>
                        <div className="modal-overlay" onClick={() => setShowFulfillModal(false)}></div>
                        <div className="fulfill-modal">
                            <div className="modal-header">
                                <h3 className="modal-title">Confirm Fulfillment</h3>
                            </div>
                            <div className="modal-body">
                                <div className="request-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Request ID:</span>
                                        <span className="detail-value">{selectedRequest.requestId}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Requester:</span>
                                        <span className="detail-value">{selectedRequest.requesterName}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Created:</span>
                                        <span className="detail-value">{formatDate(selectedRequest.createdAt)}</span>
                                    </div>
                                    {selectedRequest.status === 'approved' && (
                                        <div className="detail-row">
                                            <span className="detail-label">Approved:</span>
                                            <span className="detail-value">{formatDate(selectedRequest.updatedAt)}</span>
                                        </div>
                                    )}
                                    {selectedRequest.status === 'rejected' && selectedRequest.approval?.rejectedAt && (
                                        <div className="detail-row">
                                            <span className="detail-label">Rejected:</span>
                                            <span className="detail-value">{formatDate(selectedRequest.approval.rejectedAt)}</span>
                                        </div>
                                    )}
                                    <div className="detail-row">
                                        <span className="detail-label">Items:</span>
                                        <span className="detail-value">{selectedRequest.items?.length || 0}</span>
                                    </div>
                                    {selectedRequest.items && selectedRequest.items.length > 0 && (
                                        <div className="detail-items">
                                            {selectedRequest.items.map((item, idx) => (
                                                <div key={idx} className="detail-item">
                                                    {getItemDisplay(item)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="confirmation-text">
                                    Are you sure you want to mark this request as fulfilled?
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button
                                    onClick={handleFulfill}
                                    className="modal-button confirm"
                                >
                                    Confirm Fulfillment
                                </button>
                                <button
                                    onClick={() => {
                                        setShowFulfillModal(false);
                                        setSelectedRequest(null);
                                    }}
                                    className="modal-button cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};