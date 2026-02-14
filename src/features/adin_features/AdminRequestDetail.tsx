// src/features/adin_features/AdminRequestDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { useAdminRequests } from '../../hooks/useAdminRequests';
import { IRequest } from '../../core/types/request.types';
import { RequestStatusBadge } from '../shared/RequestStatusBadge';
import { RequestPriorityBadge } from '../shared/RequestPriorityBadge';
import './admin-request-detail.css';

export const AdminRequestDetail: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const {
        requests,
        approveRequest,
        rejectRequest,
        fulfillRequest,
        deleteRequest,
        refresh,
        loading: hookLoading
    } = useAdminRequests();

    const [request, setRequest] = useState<IRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showFulfillModal, setShowFulfillModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [fulfillmentData, setFulfillmentData] = useState({
        notes: '',
        items: [] as { itemId: string; fulfilledQuantity: number; notes?: string }[]
    });
    const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'requester'>('details');

    // Find the request when requests or requestId changes
    useEffect(() => {
        // Use a timeout to debounce the loading state update
        const timeoutId = setTimeout(() => {
            // Don't do anything if we don't have requests or requestId
            if (requests.length === 0 || !requestId) {
                if (requests.length === 0 && !hookLoading) {
                    setLoading(false);
                }
                return;
            }

            const found = requests.find(r => r.id === requestId || r.requestId === requestId);

            // Only update state if the found request is different from current
            if (found) {
                setRequest(prevRequest => {
                    if (prevRequest?.id !== found.id) {
                        return found;
                    }
                    return prevRequest;
                });
            } else {
                setRequest(null);
            }

            setLoading(false);
        }, 100); // Small delay to batch updates

        return () => clearTimeout(timeoutId);
    }, [requests, requestId, hookLoading]);

    const handleApprove = async () => {
        if (!request) return;

        // Comments are now handled by the service/firebase rules
        const success = await approveRequest(request.id!);

        if (success) {
            await refresh();
        }
    };

    const handleReject = async () => {
        if (!request || !rejectReason.trim()) return;

        const success = await rejectRequest(request.id!, rejectReason);

        if (success) {
            setShowRejectModal(false);
            setRejectReason('');
            await refresh();
        }
    };

    const handleFulfill = async () => {
        if (!request) return;

        const success = await fulfillRequest(request.id!, fulfillmentData);

        if (success) {
            setShowFulfillModal(false);
            setFulfillmentData({ notes: '', items: [] });
            await refresh();
        }
    };

    const handleDelete = async () => {
        if (!request) return;

        const confirmed = window.confirm('Are you sure you want to delete this request? This action cannot be undone.');
        if (confirmed) {
            const success = await deleteRequest(request.id!);
            if (success) {
                navigate('/admin/requests');
            }
        }
    };

    const handleGoBack = () => {
        navigate('/admin/requests');
    };

    // Helper function to format dates safely (handles Date, Timestamp, and string)
    const formatDate = (dateValue: Date | Timestamp | string | undefined): string => {
        if (!dateValue) return 'N/A';

        try {
            if (dateValue instanceof Timestamp) {
                return dateValue.toDate().toLocaleString();
            } else if (dateValue instanceof Date) {
                return dateValue.toLocaleString();
            } else {
                return new Date(dateValue).toLocaleString();
            }
        } catch {
            return 'Invalid Date';
        }
    };

    // Get item status display
    const getItemStatusDisplay = (item: IRequest['items'][0]) => {
        const statusMap = {
            'pending': '⏳ Pending',
            'fulfilled': '✅ Fulfilled',
            'cancelled': '❌ Cancelled',
            'partial': '⚠️ Partially Fulfilled'
        };
        return statusMap[item.itemStatus] || '⏳ Pending';
    };

    if (loading || hookLoading) {
        return (
            <div className="admin-request-detail-loading">
                <div className="spinner"></div>
                <p>Loading request details...</p>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="admin-request-detail-error">
                <span className="material-icons">error_outline</span>
                <h2>Request Not Found</h2>
                <p>The request you're looking for doesn't exist.</p>
                <button onClick={handleGoBack} className="back-btn">
                    <span className="material-icons">arrow_back</span>
                    Back to Requests
                </button>
            </div>
        );
    }

    return (
        <div className="admin-request-detail">
            {/* Header */}
            <div className="detail-header">
                <button onClick={handleGoBack} className="back-button">
                    <span className="material-icons">arrow_back</span>
                    Back to Requests
                </button>

                <div className="header-actions">
                    {request.status === 'pending' && (
                        <>
                            <button onClick={handleApprove} className="approve-btn">
                                <span className="material-icons">check_circle</span>
                                Approve
                            </button>
                            <button onClick={() => setShowRejectModal(true)} className="reject-btn">
                                <span className="material-icons">cancel</span>
                                Reject
                            </button>
                        </>
                    )}

                    {request.status === 'approved' && (
                        <button onClick={() => setShowFulfillModal(true)} className="fulfill-btn">
                            <span className="material-icons">assignment_turned_in</span>
                            Fulfill Request
                        </button>
                    )}

                    <button onClick={handleDelete} className="delete-btn">
                        <span className="material-icons">delete</span>
                        Delete
                    </button>
                </div>
            </div>

            {/* Request Title and Status */}
            <div className="request-title-section">
                <div className="title-badge">
                    <h1>Request {request.requestId}</h1>
                    <RequestStatusBadge status={request.status} />
                    <RequestPriorityBadge priority={request.priority} />
                </div>
                <div className="request-meta">
                    <span className="request-id">ID: {request.requestId}</span>
                    <span className="created-date">
                        Created: {formatDate(request.createdAt)}
                    </span>
                </div>
            </div>

            {/* Quick Info Cards */}
            <div className="quick-info-grid">
                <div className="info-card">
                    <span className="material-icons">person</span>
                    <div>
                        <label>Requester</label>
                        <strong>{request.requesterName}</strong>
                        <small>{request.requesterEmail}</small>
                    </div>
                </div>

                <div className="info-card">
                    <span className="material-icons">location_on</span>
                    <div>
                        <label>Location</label>
                        <strong>{request.locationName || request.locationId || 'Not specified'}</strong>
                    </div>
                </div>

                <div className="info-card">
                    <span className="material-icons">business</span>
                    <div>
                        <label>Department</label>
                        <strong>{request.department || 'Not specified'}</strong>
                    </div>
                </div>

                <div className="info-card">
                    <span className="material-icons">inventory</span>
                    <div>
                        <label>Items</label>
                        <strong>{request.itemCount || 0} items</strong>
                        <small>{request.totalQuantity || 0} total quantity</small>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
                <button
                    className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    <span className="material-icons">description</span>
                    Details
                </button>
                <button
                    className={`tab ${activeTab === 'requester' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requester')}
                >
                    <span className="material-icons">info</span>
                    Requester Info
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'details' && (
                    <div className="details-tab">
                        {/* Notes/Description */}
                        <div className="detail-section">
                            <h3>Notes</h3>
                            <p>{request.notes || 'No notes provided.'}</p>
                        </div>

                        {/* Items List */}
                        <div className="detail-section">
                            <h3>Requested Items</h3>
                            <div className="items-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Item</th>
                                            <th>Category</th>
                                            <th>Quantity</th>
                                            <th>Specifications</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {request.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.assetType}</td>
                                                <td>{item.category}</td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                    {item.specifications ? (
                                                        <ul className="specs-list">
                                                            {Object.entries(item.specifications).map(([key, value]) => (
                                                                <li key={key}><strong>{key}:</strong> {value}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`item-status ${item.itemStatus}`}>
                                                        {getItemStatusDisplay(item)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Expected Duration */}
                        {request.expectedDuration && (
                            <div className="detail-section">
                                <h3>Expected Duration</h3>
                                <p>{request.expectedDuration} days</p>
                            </div>
                        )}

                        {/* Needed By Date */}
                        {request.neededBy && (
                            <div className="detail-section">
                                <h3>Needed By</h3>
                                <p>{formatDate(request.neededBy)}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'requester' && (
                    <div className="requester-tab">
                        <div className="requester-info-card">
                            <div className="requester-avatar">
                                {request.requesterName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="requester-details">
                                <h3>{request.requesterName}</h3>
                                <p className="requester-email">
                                    <span className="material-icons">email</span>
                                    {request.requesterEmail}
                                </p>
                                <p className="requester-department">
                                    <span className="material-icons">business</span>
                                    Department: {request.department || 'Not specified'}
                                </p>
                                <p className="requester-location">
                                    <span className="material-icons">location_on</span>
                                    Location: {request.locationName || request.locationId || 'Not specified'}
                                </p>
                            </div>
                        </div>

                        {/* Approval Info */}
                        {request.approval && (
                            <div className="approval-info-section">
                                <h4>Approval Status</h4>
                                <div className="approvers-list">
                                    {request.approval.approvers?.map((approver, index) => (
                                        <div key={index} className="approver-item">
                                            <span className="approver-role">{approver.role}</span>
                                            <span className={`approver-status ${approver.approved ? 'approved' : 'pending'}`}>
                                                {approver.approved ? '✓ Approved' : '○ Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content reject-modal">
                        <h2>Reject Request</h2>
                        <p>Are you sure you want to reject this request?</p>

                        <div className="form-group">
                            <label htmlFor="rejectReason">Reason for rejection *</label>
                            <textarea
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejection"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowRejectModal(false)} className="secondary-btn">
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="danger-btn"
                                disabled={!rejectReason.trim()}
                            >
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fulfill Modal */}
            {showFulfillModal && (
                <div className="modal-overlay">
                    <div className="modal-content fulfill-modal">
                        <h2>Fulfill Request</h2>
                        <p>Record fulfillment details for this request.</p>

                        <div className="fulfill-items">
                            <h4>Items to Fulfill</h4>
                            {request.items?.map((item, index) => (
                                <div key={index} className="fulfill-item">
                                    <span className="item-name">{item.assetType}</span>
                                    <span className="item-quantity">Requested: {item.quantity}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={item.quantity}
                                        placeholder="Fulfilled quantity"
                                        onChange={(e) => {
                                            const items = [...fulfillmentData.items];
                                            const quantity = parseInt(e.target.value) || 0;
                                            items[index] = {
                                                itemId: String(index),
                                                fulfilledQuantity: Math.min(quantity, item.quantity)
                                            };
                                            setFulfillmentData({ ...fulfillmentData, items });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fulfillmentNotes">Fulfillment Notes</label>
                            <textarea
                                id="fulfillmentNotes"
                                value={fulfillmentData.notes}
                                onChange={(e) => setFulfillmentData({ ...fulfillmentData, notes: e.target.value })}
                                placeholder="Add any notes about the fulfillment"
                                rows={3}
                            />
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowFulfillModal(false)} className="secondary-btn">
                                Cancel
                            </button>
                            <button onClick={handleFulfill} className="primary-btn">
                                Mark as Fulfilled
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};