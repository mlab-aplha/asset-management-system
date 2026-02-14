// src/features/requests/components/shared/RequestStatusBadge.tsx
import React from 'react';
import './badges.css';

interface RequestStatusBadgeProps {
    status: string;
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status }) => {
    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'under_review':
                return {
                    class: 'status-pending',
                    icon: 'hourglass_empty', // ⏳ replaced with hourglass_empty
                    label: 'Pending'
                };
            case 'approved':
                return {
                    class: 'status-approved',
                    icon: 'check_circle', // ✅ replaced with check_circle
                    label: 'Approved'
                };
            case 'rejected':
                return {
                    class: 'status-rejected',
                    icon: 'cancel', // ❌ replaced with cancel
                    label: 'Rejected'
                };
            case 'fulfilled':
                return {
                    class: 'status-fulfilled',
                    icon: 'task_alt', // 🎯 replaced with task_alt (or could use 'checklist')
                    label: 'Fulfilled'
                };
            case 'cancelled':
                return {
                    class: 'status-cancelled',
                    icon: 'block', // 🚫 replaced with block
                    label: 'Cancelled'
                };
            case 'draft':
                return {
                    class: 'status-draft',
                    icon: 'drafts', // 📝 replaced with drafts (or 'edit_note')
                    label: 'Draft'
                };
            default:
                return {
                    class: 'status-unknown',
                    icon: 'help', // ❓ replaced with help
                    label: status || 'Unknown'
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span className={`status-badge ${config.class}`}>
            <span className="material-icons status-icon">{config.icon}</span>
            <span className="status-label">{config.label}</span>
        </span>
    );
};