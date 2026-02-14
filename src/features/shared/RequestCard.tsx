// src/features/shared/RequestCard.tsx
import React from 'react';
import { IRequest } from '../../core/types/request.types';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestPriorityBadge } from './RequestPriorityBadge';
import './request-card.css';

interface RequestCardProps {
    request: IRequest;
    onClick?: (request: IRequest) => void;
    actions?: React.ReactNode;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onClick, actions }) => {
    // Generate a title from the first item's purpose or asset type
    const getRequestTitle = () => {
        if (request.items && request.items.length > 0) {
            const firstItem = request.items[0];
            if (firstItem.purpose) {
                return firstItem.purpose;
            }
            return `${firstItem.assetType} ${firstItem.quantity > 1 ? `(${firstItem.quantity}x)` : ''}`;
        }
        return 'Asset Request';
    };

    return (
        <div className="request-card" onClick={() => onClick?.(request)}>
            <div className="card-header">
                <div className="header-left">
                    <span className="request-id">{request.requestId}</span>
                    <RequestStatusBadge status={request.status} />
                    <RequestPriorityBadge priority={request.priority} />
                </div>
                <div className="header-right">
                    <span className="date">{request.formattedCreatedAt}</span>
                </div>
            </div>

            <div className="card-body">
                <h3 className="request-title">{getRequestTitle()}</h3>

                <div className="requester-info">
                    <span className="material-icons">person</span>
                    <div>
                        <strong>{request.requesterName}</strong>
                        <small>{request.requesterEmail}</small>
                    </div>
                </div>

                {request.department && (
                    <div className="department-info">
                        <span className="material-icons">business</span>
                        <span>{request.department}</span>
                    </div>
                )}

                {request.locationName && (
                    <div className="location-info">
                        <span className="material-icons">location_on</span>
                        <span>{request.locationName}</span>
                    </div>
                )}

                <div className="items-preview">
                    <span className="material-icons">inventory_2</span>
                    <span>{request.itemCount || 0} items • {request.totalQuantity || 0} total quantity</span>
                </div>

                {request.items && request.items.length > 0 && (
                    <div className="items-list-preview">
                        {request.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="item-chip">
                                {item.assetType} x{item.quantity}
                                {item.itemStatus === 'partial' && ' (Partial)'}
                                {item.itemStatus === 'fulfilled' && ' (✓)'}
                            </span>
                        ))}
                        {request.items.length > 3 && (
                            <span className="more-items">+{request.items.length - 3} more</span>
                        )}
                    </div>
                )}

                {request.neededBy && (
                    <div className="needed-by">
                        <span className="material-icons">event</span>
                        <span>Needed by: {new Date(request.neededBy.toDate()).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {actions && (
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    {actions}
                </div>
            )}
        </div>
    );
};