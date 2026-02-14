// src/features/adin_features/RequestsSection.tsx
import React from 'react';
import { useRequests } from '../../hooks/useRequests';
import { useAuth } from '../../hooks/useAuth';
import { AssetRequest, RequestItem } from '../../../backend-firebase/src/services/RequestService';
import { Timestamp, FieldValue } from 'firebase/firestore';
import './dashboard.css';

interface RequestsSectionProps {
    onViewAll?: () => void;
    onApprove?: (requestId: string) => void;
    onReject?: (requestId: string) => void;
}

export const RequestsSection: React.FC<RequestsSectionProps> = ({
    onViewAll,
    onApprove,
    onReject
}) => {
    const { pendingRequests, loading, count } = useRequests();
    const { isAdmin } = useAuth();

    // Format timestamp to relative time - handles Firebase Timestamp, Date, and FieldValue
    const getRelativeTime = (timestamp: Timestamp | Date | FieldValue | null | undefined): string => {
        if (!timestamp) return 'Unknown';

        // If it's a FieldValue (serverTimestamp), it's still being processed
        if (timestamp instanceof FieldValue) {
            return 'Just now';
        }

        let date: Date;
        if (timestamp instanceof Timestamp) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            return 'Recently';
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

        return date.toLocaleDateString();
    };

    // Get urgency color
    const getUrgencyClass = (priority: string = 'medium'): string => {
        switch (priority) {
            case 'urgent': return 'alert-indicator urgent';
            case 'high': return 'alert-indicator high';
            case 'medium': return 'alert-indicator medium';
            default: return 'alert-indicator low';
        }
    };

    // Format item summary with proper typing
    const getItemSummary = (items: RequestItem[] = []): string => {
        if (!items || items.length === 0) return 'No items';

        const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const itemTypes = items.map(item => item.assetType).join(', ');

        if (items.length === 1) {
            return `${totalQty}x ${items[0].assetType}`;
        }
        return `${totalQty} items (${itemTypes})`;
    };

    if (loading) {
        return (
            <div className="dashboard-alerts">
                <div className="alerts-header">
                    <h4>
                        <span className="material-icons">assignment</span>
                        Pending Requests
                    </h4>
                    <span className="alerts-badge loading">...</span>
                </div>
                <div className="alerts-list">
                    <div className="alert-item loading">
                        <div className="alert-content">
                            <p className="alert-title">Loading requests...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-alerts">
            <div className="alerts-header">
                <h4>
                    <span className="material-icons">assignment</span>
                    Pending Requests
                </h4>
                <span className="alerts-badge">
                    {count} NEW
                </span>
            </div>

            <div className="alerts-list">
                {pendingRequests.length === 0 ? (
                    <div className="alert-item empty">
                        <div className="alert-content">
                            <p className="alert-title">No pending requests</p>
                            <p className="alert-location">All requests have been processed</p>
                        </div>
                    </div>
                ) : (
                    pendingRequests.slice(0, 3).map((request: AssetRequest) => (
                        <div key={request.id} className="alert-item">
                            <div className={getUrgencyClass(request.priority)}></div>
                            <div className="alert-content">
                                <div className="alert-header-row">
                                    <p className="alert-title">
                                        {request.requesterName}
                                    </p>
                                    {isAdmin && (
                                        <div className="alert-actions">
                                            <button
                                                className="alert-action approve"
                                                onClick={() => onApprove?.(request.id!)}
                                                title="Approve"
                                            >
                                                <span className="material-icons">check_circle</span>
                                            </button>
                                            <button
                                                className="alert-action reject"
                                                onClick={() => onReject?.(request.id!)}
                                                title="Reject"
                                            >
                                                <span className="material-icons">cancel</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="alert-location">
                                    {getItemSummary(request.items)} • {request.department || 'No department'}
                                </p>
                                <div className="alert-meta">
                                    <span className="alert-time">
                                        <span className="material-icons">schedule</span>
                                        {getRelativeTime(request.createdAt)}
                                    </span>
                                    {request.priority === 'urgent' && (
                                        <span className="alert-badge urgent">Urgent</span>
                                    )}
                                </div>
                                {request.notes && (
                                    <p className="alert-note">
                                        <span className="material-icons">note</span>
                                        {request.notes.substring(0, 50)}
                                        {request.notes.length > 50 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {pendingRequests.length > 0 && (
                <button className="alerts-view-all" onClick={onViewAll}>
                    View All Requests ({count})
                </button>
            )}
        </div>
    );
};