// src/pages/UserManagement/UserManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { UserTable } from '@/components/user/UserTable';
import { UserForm } from '@/components/user/UserForm';
import { ReauthModal } from '@/components/auth/ReauthModal';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { useAdminReauth } from '../../hooks/useAdminReauth';
import { User, UserFormData, UserRole } from '@/core/entities/User';
import { ROLE_LABELS } from '@/components/constants/roleLabels';
import './user-management.css';

// ── Pending action type ────────────────────────────────────────────────────────
type PendingCreate = { type: 'create'; data: UserFormData };
type PendingDelete = { type: 'delete'; data: User };
type PendingAction = PendingCreate | PendingDelete;

// ─────────────────────────────────────────────────────────────────────────────

export const UserManagementPage: React.FC = () => {
    const { user: currentUser, isAdmin } = useAuth();
    const { reauth, state: reauthState, open: openReauth, close: closeReauth } = useAdminReauth();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string> | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        users, loading, error,
        loadUsers, createUser, updateUser, deleteUser, toggleUserStatus,
        setError: setServiceError,
    } = useUsers();

    const itemsPerPage = 10;

    useEffect(() => {
        if (isAdmin) loadUsers();
    }, [isAdmin, loadUsers]);

    // ── Filtering ────────────────────────────────────────────────────────────────

    const filteredUsers = users.filter((u: User) => {
        const matchSearch =
            searchTerm === '' ||
            (u.displayName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
            (u.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
            (u.department?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchStatus && matchRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const roleCounts = users.reduce<Record<string, number>>(
        (acc: Record<string, number>, u: User) => {
            acc[u.role] = (acc[u.role] ?? 0) + 1;
            return acc;
        },
        {},
    );

    const activeUsers = users.filter((u: User) => u.status === 'active').length;

    const flash = useCallback((msg: string, duration = 3500) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), duration);
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────────────

    const handleAddUserClick = useCallback(() => {
        setEditingUser(null);
        setFormErrors(null);
        setIsModalOpen(true);
    }, []);

    const handleEditUser = useCallback((user: User) => {
        setEditingUser(user);
        setFormErrors(null);
        setIsModalOpen(true);
    }, []);

    const handleDeleteUser = useCallback(
        (user: User) => {
            setPendingAction({ type: 'delete', data: user });
            openReauth();
        },
        [openReauth],
    );

    const handleToggleStatus = useCallback(
        async (user: User) => {
            const res = await toggleUserStatus(user.id);
            if (res.success) {
                flash(`"${user.displayName}" ${user.status === 'active' ? 'deactivated' : 'activated'}.`);
            } else {
                flash(`Failed: ${res.errors?.general ?? 'Unknown error'}`, 5000);
            }
        },
        [toggleUserStatus, flash],
    );

    const handleSubmitUser = useCallback(
        async (formData: UserFormData) => {
            setFormErrors(null);

            if (editingUser) {
                const res = await updateUser(editingUser.id, formData);
                if (res.success) {
                    flash(`"${formData.displayName}" updated.`);
                    setIsModalOpen(false);
                    return { success: true };
                }
                setFormErrors(res.errors ?? null);
                return { success: false, errors: res.errors };
            }

            // CREATE: close form first, open re-auth after React paints
            setIsModalOpen(false);
            setTimeout(() => {
                setPendingAction({ type: 'create', data: formData });
                openReauth();
            }, 120);

            return { success: true };
        },
        [editingUser, updateUser, flash, openReauth],
    );

    const handleReauthSubmit = useCallback(
        async (password: string) => {
            if (!pendingAction) return;

            const verified = await reauth(password);
            if (!verified) return;

            setIsProcessing(true);
            try {
                if (pendingAction.type === 'create') {
                    const res = await createUser(pendingAction.data);
                    if (res.success) {
                        flash(`"${pendingAction.data.displayName}" created successfully.`);
                        setPendingAction(null);
                        closeReauth();
                    } else {
                        setFormErrors(res.errors ?? null);
                        closeReauth();
                        setTimeout(() => setIsModalOpen(true), 80);
                    }
                }

                if (pendingAction.type === 'delete') {
                    const res = await deleteUser(pendingAction.data.id);
                    if (res.success) {
                        flash(`"${pendingAction.data.displayName}" deleted.`);
                        setPendingAction(null);
                        closeReauth();
                    } else {
                        flash(`Failed: ${res.errors?.general ?? 'Unknown error'}`, 5000);
                        closeReauth();
                    }
                }
            } catch (err) {
                flash(err instanceof Error ? err.message : 'Action failed', 5000);
                closeReauth();
            } finally {
                setIsProcessing(false);
            }
        },
        [pendingAction, reauth, createUser, deleteUser, flash, closeReauth],
    );

    const handleCancelReauth = useCallback(() => {
        if (pendingAction?.type === 'create') {
            setTimeout(() => setIsModalOpen(true), 80);
        }
        setPendingAction(null);
        closeReauth();
    }, [pendingAction, closeReauth]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormErrors(null);
    }, []);

    const pendingResourceName = pendingAction
        ? pendingAction.type === 'create'
            ? `${pendingAction.data.displayName} (${pendingAction.data.role})`
            : pendingAction.data.displayName ?? pendingAction.data.email
        : '';

    // ── Render ────────────────────────────────────────────────────────────────────

    return (
        <DashboardLayout activePage="users">
            <div className="user-management-container">

                {/* Re-auth modal */}
                <ReauthModal
                    isOpen={reauthState.isOpen}
                    onClose={handleCancelReauth}
                    onSubmit={handleReauthSubmit}
                    loading={reauthState.loading || isProcessing}
                    error={reauthState.error}
                    actionType={pendingAction?.type ?? 'create'}
                    resourceType="user"
                    resourceName={pendingResourceName}
                    userName={currentUser?.displayName ?? currentUser?.email}
                />

                {/* Add / Edit user modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingUser ? 'Edit User' : 'Add New User'}
                    size="md"
                >
                    <UserForm
                        initialData={editingUser ? {
                            displayName: editingUser.displayName,
                            email: editingUser.email,
                            role: editingUser.role,
                            department: editingUser.department ?? '',
                            status: editingUser.status,
                            assignedHubIds: editingUser.assignedHubIds ?? [],
                        } : undefined}
                        onSubmit={handleSubmitUser}
                        onCancel={handleCloseModal}
                        isSubmitting={loading}
                        title={editingUser ? 'Update User' : 'Add User'}
                        errors={formErrors ?? undefined}
                    />
                </Modal>

                {/* Header */}
                <div className="user-management-header">
                    <div className="header-left">
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">Manage organisation access and permissions</p>
                    </div>
                    <div className="header-right">
                        <div className="stats-container">
                            <Card glass padding="sm">
                                <div className="stat-item">
                                    <span className="stat-label">Total</span>
                                    <span className="stat-value">{users.length}</span>
                                </div>
                            </Card>
                            <Card glass padding="sm">
                                <div className="stat-item">
                                    <span className="stat-label">Active</span>
                                    <span className="stat-value primary">{activeUsers}</span>
                                </div>
                            </Card>
                            {(Object.keys(ROLE_LABELS) as UserRole[]).map(role =>
                                roleCounts[role] ? (
                                    <Card glass padding="sm" key={role}>
                                        <div className="stat-item">
                                            <span className="stat-label">{ROLE_LABELS[role]}</span>
                                            <span className="stat-value">{roleCounts[role]}</span>
                                        </div>
                                    </Card>
                                ) : null,
                            )}
                        </div>
                    </div>
                </div>

                {/* Action bar */}
                <Card glass padding="md" className="action-bar">
                    <div className="action-bar-left">
                        <div className="search-container">
                            <span className="material-icons search-icon" aria-hidden="true">search</span>
                            {/* id + name added to fix accessibility warning */}
                            <input
                                id="user-search"
                                name="userSearch"
                                type="search"
                                placeholder="Search users…"
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="search-input"
                                autoComplete="off"
                            />
                        </div>
                        <div className="filter-chips">
                            {(['all', 'active', 'inactive'] as const).map(s => (
                                <button
                                    key={s}
                                    className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
                                    onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                    type="button"
                                >
                                    {s === 'all'
                                        ? <><span className="material-icons">filter_list</span> All</>
                                        : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}

                            {/* ✅ Role filter — updated to new role names */}
                            <select
                                id="role-filter"
                                name="roleFilter"
                                className="role-filter-select"
                                value={roleFilter}
                                onChange={e => {
                                    setRoleFilter(e.target.value as UserRole | 'all');
                                    setCurrentPage(1);
                                }}
                                aria-label="Filter by role"
                            >
                                <option value="all">All Roles</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="hub_manager">Hub Manager</option>
                                <option value="it">IT</option>
                                <option value="asset_facilitator">Asset Facilitator</option>
                                <option value="student">Student</option>
                            </select>
                        </div>
                    </div>
                    <div className="action-bar-right">
                        <Button variant="outline" icon="refresh" onClick={() => loadUsers()}>Refresh</Button>
                        <Button variant="primary" icon="add" onClick={handleAddUserClick}>Add User</Button>
                    </div>
                </Card>

                {/* Error banner */}
                {error && (
                    <div className="error-message">
                        <span className="material-icons">error</span>
                        <span>{error}</span>
                        <button className="dismiss-btn" onClick={() => setServiceError(null)} type="button">
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                {/* Success banner */}
                {successMessage && !isModalOpen && !reauthState.isOpen && (
                    <div className="success-message">
                        <span className="material-icons">check_circle</span>
                        <span>{successMessage}</span>
                        <button className="dismiss-btn" onClick={() => setSuccessMessage(null)} type="button">
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                {/* Users table */}
                <Card glass padding="none" className="users-table-container">
                    <UserTable
                        users={currentUsers}
                        onToggleStatus={handleToggleStatus}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        loading={loading}
                    />

                    {filteredUsers.length > 0 ? (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                <span className="pagination-text">
                                    {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
                                </span>
                            </div>
                            <div className="pagination-controls">
                                <Button
                                    variant="outline" size="sm" icon="chevron_left"
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                />
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pg: number;
                                    if (totalPages <= 5) pg = i + 1;
                                    else if (currentPage <= 3) pg = i + 1;
                                    else if (currentPage >= totalPages - 2) pg = totalPages - 4 + i;
                                    else pg = currentPage - 2 + i;
                                    return (
                                        <Button
                                            key={pg}
                                            variant={currentPage === pg ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(pg)}
                                        >
                                            {pg}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline" size="sm" icon="chevron_right"
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                />
                            </div>
                        </div>
                    ) : !loading && (
                        <div className="no-users-message">
                            <span className="material-icons">people</span>
                            <p>
                                {searchTerm
                                    ? 'No users match your search.'
                                    : 'No users yet — add your first user.'}
                            </p>
                        </div>
                    )}
                </Card>

                {/* Status footer */}
                <Card glass padding="md">
                    <div className="status-header">
                        <span className="status-title">Access Management System</span>
                        <span className="status-indicator active" />
                    </div>
                    <p className="status-message">
                        All permission systems operational · Last sync: {new Date().toLocaleTimeString()}
                    </p>
                </Card>

            </div>
        </DashboardLayout>
    );
};