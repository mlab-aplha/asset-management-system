import React from 'react';
import { Button } from '../ui/Button';
import { User } from '../../core/entities/User';
import { UserValidation } from '../../utils/Validation_userManagement';

interface UserTableProps {
    users: User[];
    onToggleStatus: (user: User) => void;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    loading?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
    users,
    onToggleStatus,
    onEdit,
    onDelete,
    loading = false
}) => {
    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
        active: {
            bg: 'rgba(148, 199, 61, 0.1)',
            text: '#94c73d',
            dot: '#94c73d'
        },
        inactive: {
            bg: 'rgba(255, 255, 255, 0.05)',
            text: '#94a3b8',
            dot: '#94a3b8'
        }
    };

    const roleColors: Record<string, { bg: string; text: string }> = {
        admin: {
            bg: 'rgba(59, 130, 246, 0.1)',
            text: '#3b82f6'
        },
        facilitator: {
            bg: 'rgba(168, 85, 247, 0.1)',
            text: '#a855f7'
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
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
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>ROLE</th>
                        <th>DEPARTMENT</th>
                        <th>STATUS</th>
                        <th className="actions-header">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="user-row">
                            <td className="user-info-cell">
                                <div className="user-avatar">
                                    {user.displayName?.charAt(0) || 'U'}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{user.displayName || 'Unnamed User'}</span>
                                    <span className="user-id">ID: {user.id?.substring(0, 8) || 'N/A'}</span>
                                </div>
                            </td>
                            <td className="user-email">{user.email || 'No email'}</td>
                            <td>
                                <span
                                    className="role-badge"
                                    style={{
                                        backgroundColor: roleColors[user.role || 'facilitator']?.bg,
                                        color: roleColors[user.role || 'facilitator']?.text
                                    }}
                                >
                                    {UserValidation.getRoleDisplayName(user.role || 'facilitator')}
                                </span>
                            </td>
                            <td className="user-department">{user.department || 'Not assigned'}</td>
                            <td>
                                <div
                                    className="status-badge"
                                    style={{
                                        backgroundColor: statusColors[user.status || 'inactive']?.bg,
                                        color: statusColors[user.status || 'inactive']?.text
                                    }}
                                >
                                    <span
                                        className="status-dot"
                                        style={{ backgroundColor: statusColors[user.status || 'inactive']?.dot }}
                                    ></span>
                                    {UserValidation.getStatusDisplayName(user.status || 'inactive')}
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
                    ))}
                </tbody>
            </table>
        </div>
    );
};