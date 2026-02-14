// src/features/shared/RequestTable.tsx
import React from 'react';
import { IRequest } from '../../core/types/request.types';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestPriorityBadge } from './RequestPriorityBadge';
import './request-table.css';

// Define a type for edit data
interface EditRequestData {
    [key: string]: unknown;
}

interface RequestTableProps {
    requests: IRequest[];
    onApprove?: (requestId: string) => void;
    onReject?: (requestId: string) => void;
    onFulfill?: (request: IRequest) => void; // Changed from requestId to request
    onEdit?: (requestId: string, data: EditRequestData) => void;
    onCancel?: (requestId: string, reason: string) => void;
    onView?: (request: IRequest) => void;
    showActions?: boolean;
    userRole: 'admin' | 'facilitator';
}

export const RequestTable: React.FC<RequestTableProps> = ({
    requests,
    onApprove,
    onReject,
    onFulfill,
    onEdit,
    onCancel,
    onView,
    showActions = true,
    userRole
}) => {
    if (requests.length === 0) {
        return (
            <div className="request-table-empty">
                <span className="material-icons">inbox</span>
                <p>No requests found</p>
            </div>
        );
    }

    return (
        <div className="request-table-container">
            <table className="request-table">
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Requester</th>
                        <th>Department</th>
                        <th>Items</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                        {showActions && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => (
                        <tr
                            key={request.id}
                            className="request-row"
                            onClick={() => onView?.(request)}
                        >
                            <td className="request-id">
                                <span className="id-badge">{request.requestId}</span>
                            </td>
                            <td>
                                <div className="requester-info">
                                    <strong>{request.requesterName}</strong>
                                    <small>{request.requesterEmail}</small>
                                </div>
                            </td>
                            <td>{request.department || '—'}</td>
                            <td>
                                <div className="items-summary">
                                    <span className="item-count">
                                        {request.totalQuantity} items
                                    </span>
                                    <span className="item-types">
                                        {request.items?.map(i => i.assetType).join(', ')}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <RequestPriorityBadge priority={request.priority} />
                            </td>
                            <td>
                                <RequestStatusBadge status={request.status} />
                            </td>
                            <td>
                                <span className="date-cell">
                                    {request.formattedCreatedAt}
                                </span>
                            </td>
                            {showActions && (
                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        {userRole === 'admin' && request.status === 'pending' && (
                                            <>
                                                <button
                                                    className="action-btn approve"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onApprove?.(request.id!);
                                                    }}
                                                    title="Approve"
                                                >
                                                    <span className="material-icons">check_circle</span>
                                                </button>
                                                <button
                                                    className="action-btn reject"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onReject?.(request.id!);
                                                    }}
                                                    title="Reject"
                                                >
                                                    <span className="material-icons">cancel</span>
                                                </button>
                                                <button
                                                    className="action-btn fulfill"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Pass the entire request object, not just the ID
                                                        onFulfill?.(request);
                                                    }}
                                                    title="Fulfill"
                                                >
                                                    <span className="material-icons">assignment_turned_in</span>
                                                </button>
                                            </>
                                        )}

                                        {userRole === 'facilitator' && request.status === 'pending' && (
                                            <>
                                                <button
                                                    className="action-btn edit"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit?.(request.id!, {});
                                                    }}
                                                    title="Edit"
                                                >
                                                    <span className="material-icons">edit</span>
                                                </button>
                                                <button
                                                    className="action-btn cancel"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const reason = prompt('Reason for cancellation:');
                                                        if (reason) onCancel?.(request.id!, reason);
                                                    }}
                                                    title="Cancel"
                                                >
                                                    <span className="material-icons">cancel</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};