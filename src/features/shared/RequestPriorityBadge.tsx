// src/features/shared/RequestPriorityBadge.tsx
import React from 'react';
import './request-priority-badge.css';

interface RequestPriorityBadgeProps {
    priority: string;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
    className?: string;
}

export const RequestPriorityBadge: React.FC<RequestPriorityBadgeProps> = ({
    priority,
    size = 'medium',
    showIcon = true,
    className = ''
}) => {
    const getPriorityConfig = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
                return {
                    class: 'urgent',
                    icon: 'priority_high',
                    label: 'Urgent'
                };
            case 'high':
                return {
                    class: 'high',
                    icon: 'arrow_upward',
                    label: 'High'
                };
            case 'medium':
                return {
                    class: 'medium',
                    icon: 'remove',
                    label: 'Medium'
                };
            case 'low':
                return {
                    class: 'low',
                    icon: 'arrow_downward',
                    label: 'Low'
                };
            default:
                return {
                    class: 'unknown',
                    icon: 'help',
                    label: priority || 'Unknown'
                };
        }
    };

    const config = getPriorityConfig(priority);

    return (
        <span className={`request-priority-badge ${config.class} ${size} ${className}`}>
            {showIcon && <span className="material-icons">{config.icon}</span>}
            <span className="priority-label">{config.label}</span>
        </span>
    );
};