// src/components/user/UserTable.tsx
import React from 'react';
import { Button } from '../ui/Button';
import { User } from '../../core/entities/User';

interface UserTableProps {
    users: User[];
    onToggleStatus: (user: User) => void;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    loading?: boolean;
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
    super_admin: { bg: 'rgba(103,148,54,0.12)', text: '#94c73d' },
    hub_manager: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24' },
    it: { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa' },
    asset_facilitator: { bg: 'rgba(196,148,255,0.12)', text: '#c494ff' },
    student: { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8' },
};

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    hub_manager: 'Hub Manager',
    it: 'IT Technician',
    asset_facilitator: 'Asset Facilitator',
    student: 'Student',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'rgba(103,148,54,0.1)', text: '#94c73d', dot: '#94c73d' },
    inactive: { bg: 'rgba(255,255,255,0.05)', text: '#94a3b8', dot: '#94a3b8' },
};

export const UserTable: React.FC<UserTableProps> = ({
    users,
    onToggleStatus,
    onEdit,
    onDelete,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>Loading users…</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="empty-container">
                <span className="material-icons">people</span>
                <p>No users found</p>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th className="actions-header">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        const roleColor = ROLE_COLORS[user.role] ?? ROLE_COLORS.student;
                        const statusColor = STATUS_COLORS[user.status] ?? STATUS_COLORS.inactive;
                        const roleLabel = ROLE_LABELS[user.role] ?? user.role;

                        return (
                            <tr key={user.id}>
                                <td className="user-info-cell">
                                    <div className="user-avatar">
                                        {user.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">{user.displayName || 'Unnamed'}</span>
                                        <span className="user-id">ID: {user.id?.substring(0, 8) ?? 'N/A'}</span>
                                    </div>
                                </td>

                                <td className="user-email">{user.email || '—'}</td>

                                <td>
                                    <span
                                        className="role-badge"
                                        style={{ backgroundColor: roleColor.bg, color: roleColor.text }}
                                    >
                                        {roleLabel}
                                    </span>
                                </td>

                                <td>
                                    <div
                                        className="status-badge"
                                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                    >
                                        <span
                                            className="status-dot"
                                            style={{ backgroundColor: statusColor.dot }}
                                        />
                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                    </div>
                                </td>

                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            icon={user.status === 'active' ? 'toggle_on' : 'toggle_off'}
                                            onClick={() => onToggleStatus(user)}
                                            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            icon="edit"
                                            onClick={() => onEdit(user)}
                                            title="Edit"
                                        />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            icon="delete"
                                            onClick={() => onDelete(user)}
                                            title="Delete"
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};