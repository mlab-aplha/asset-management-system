import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { UserTable } from '../../components/user/UserTable';
import { UserForm } from '../../components/user/UserForm';
import { useUsers } from '../../hooks/useUsers';
import { User, UserFormData } from '../../core/entities/User';
import './user-management.css';

export const UserManagementPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        users,
        loading,
        error,
        loadUsers,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        setError: setServiceError
    } = useUsers();

    const itemsPerPage = 5;

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === '' ||
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const handleAddUserClick = useCallback(() => {
        setEditingUser(null);
        setIsModalOpen(true);
        setSuccessMessage(null);
    }, []);

    const handleEditUser = useCallback((user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
        setSuccessMessage(null);
    }, []);

    const handleDeleteUser = useCallback(async (user: User) => {
        if (window.confirm(`Are you sure you want to delete ${user.displayName}?`)) {
            const result = await deleteUser(user.id);
            if (result.success) {
                setSuccessMessage(`User "${user.displayName}" deleted successfully!`);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        }
    }, [deleteUser]);

    const handleToggleUserStatus = useCallback(async (user: User) => {
        const result = await toggleUserStatus(user.id);
        if (result.success) {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            setSuccessMessage(`User "${user.displayName}" ${newStatus} successfully!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    }, [toggleUserStatus]);

    const handleSubmitUser = useCallback(async (formData: UserFormData) => {
        if (editingUser) {
            const result = await updateUser(editingUser.id, formData);
            if (result.success) {
                setSuccessMessage(`User "${formData.displayName}" updated successfully!`);
                setIsModalOpen(false);
                setTimeout(() => setSuccessMessage(null), 3000);
                return { success: true };
            }
            return result;
        } else {
            const result = await createUser(formData);
            if (result.success) {
                setSuccessMessage(`User "${formData.displayName}" added successfully!`);
                setIsModalOpen(false);
                setTimeout(() => setSuccessMessage(null), 3000);
                return { success: true };
            }
            return result;
        }
    }, [editingUser, updateUser, createUser]);

    const activeUsers = users.filter(u => u.status === 'active').length;

    return (
        <DashboardLayout activePage="users">
            <div className="user-management-container">
                {/* Add/Edit User Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingUser ? 'Edit User' : 'Add New User'}
                    size="md"
                >
                    {successMessage && (
                        <div className="success-message">
                            <span className="material-icons">check_circle</span>
                            {successMessage}
                        </div>
                    )}

                    <UserForm
                        initialData={editingUser ? {
                            displayName: editingUser.displayName,
                            email: editingUser.email,
                            role: editingUser.role,
                            department: editingUser.department || '',
                            status: editingUser.status
                        } : undefined}
                        onSubmit={handleSubmitUser}
                        onCancel={() => setIsModalOpen(false)}
                        isSubmitting={loading}
                        title={editingUser ? 'Update User' : 'Add User'}
                    />
                </Modal>

                {/* Header Section */}
                <div className="user-management-header">
                    <div className="header-left">
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">Manage organization access and permissions</p>
                    </div>
                    <div className="header-right">
                        <div className="stats-container">
                            <Card glass padding="sm">
                                <div className="stat-item">
                                    <span className="stat-label">Total Users</span>
                                    <span className="stat-value">{users.length}</span>
                                </div>
                            </Card>
                            <Card glass padding="sm">
                                <div className="stat-item">
                                    <span className="stat-label">Active</span>
                                    <span className="stat-value primary">{activeUsers}</span>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <Card glass padding="md" className="action-bar">
                    <div className="action-bar-left">
                        <div className="search-container">
                            <span className="material-icons search-icon">search</span>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-chips">
                            <button
                                className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                            >
                                <span className="material-icons">filter_list</span>
                                Status: All
                            </button>
                            <Button
                                variant={statusFilter === 'active' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('active')}
                            >
                                <span className="material-icons status-dot active"></span>
                                Active
                            </Button>
                            <Button
                                variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('inactive')}
                            >
                                <span className="material-icons status-dot inactive"></span>
                                Inactive
                            </Button>
                        </div>
                    </div>

                    <div className="action-bar-right">
                        <Button variant="outline" icon="file_download">
                            Export
                        </Button>
                        <Button
                            variant="primary"
                            icon="add"
                            onClick={handleAddUserClick}
                        >
                            Add New User
                        </Button>
                    </div>
                </Card>

                {/* Error Display */}
                {error && (
                    <div className="error-message">
                        <span className="material-icons">error</span>
                        <span>{error}</span>
                        <button className="dismiss-btn" onClick={() => setServiceError(null)}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                {/* Success Message Display */}
                {successMessage && !isModalOpen && (
                    <div className="success-message">
                        <span className="material-icons">check_circle</span>
                        <span>{successMessage}</span>
                        <button className="dismiss-btn" onClick={() => setSuccessMessage(null)}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                {/* Users Table Container */}
                <Card glass padding="none" className="users-table-container">
                    <UserTable
                        users={currentUsers}
                        onToggleStatus={handleToggleUserStatus}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        loading={loading}
                    />

                    {filteredUsers.length > 0 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                <span className="pagination-text">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                                </span>
                                <div className="per-page-selector">
                                    <span>Show:</span>
                                    <select
                                        className="per-page-select"
                                        value={itemsPerPage}
                                        onChange={() => setCurrentPage(1)}
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pagination-controls">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon="chevron_left"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                />
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon="chevron_right"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* System Status Card */}
                <Card glass padding="md">
                    <div className="status-header">
                        <span className="status-title">Access Management System</span>
                        <span className="status-indicator active"></span>
                    </div>
                    <p className="status-message">
                        All permission systems are operational. Last sync: Today, 10:45 AM
                    </p>
                </Card>
            </div>
        </DashboardLayout>
    );
};