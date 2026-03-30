// src/pages/AdminRequestsPage/AdminRequestsPage.tsx
import React, { useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAdminRequests } from '../../hooks/useAdminRequests';
import { RequestStats } from '../../features/shared/RequestStats';
import { IRequest, RequestItem } from '../../core/types/request.types';
import './AdminRequestsPage.css';

// ── Timestamp helper ──────────────────────────────────────────────────────────

interface FirebaseTimestamp { toDate: () => Date; seconds: number; nanoseconds: number; }
type DateInput = FirebaseTimestamp | Date | string | null | undefined;

const toDate = (val: DateInput): Date | undefined => {
    if (!val) return undefined;
    if (typeof val === 'object' && 'toDate' in val) return val.toDate();
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
};

// ── Status label helper ───────────────────────────────────────────────────────

const statusLabel = (s: string) =>
    s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ── Main page ─────────────────────────────────────────────────────────────────

export const AdminRequestsPage: React.FC = () => {
    const {
        requests, stats, loading, error,
        approveRequest, rejectRequest, fulfillRequest, refresh,
    } = useAdminRequests();

    const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
    const [showFulfillModal, setShowFulfillModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // ── Helpers ─────────────────────────────────────────────────────────────────

    const formatDate = useCallback((ts: DateInput): string => {
        const d = toDate(ts);
        if (!d) return 'N/A';
        return d.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }, []);

    const getItemDisplay = useCallback(
        (item: RequestItem) => `${item.assetType} (${item.category}) × ${item.quantity}`,
        [],
    );

    const getStatusDate = useCallback(
        (req: IRequest): string => {
            if (req.status === 'approved') return formatDate(req.updatedAt);
            if (req.status === 'rejected' && req.approval?.rejectedAt)
                return formatDate(req.approval.rejectedAt);
            if (req.status === 'fulfilled') return formatDate(req.updatedAt);
            return '—';
        },
        [formatDate],
    );

    // ── Handlers ─────────────────────────────────────────────────────────────────

    const handleApprove = async (requestId: string) => {
        if (!window.confirm('Approve this request?')) return;
        await approveRequest(requestId);
        refresh();
    };

    const handleReject = async (requestId: string) => {
        const reason = window.prompt('Reason for rejection:');
        if (!reason) return;
        await rejectRequest(requestId, reason);
        refresh();
    };

    const handleFulfill = async () => {
        if (!selectedRequest?.id) { alert('Error: Request ID not found'); return; }
        const items = (selectedRequest.items ?? []).map((item, i) => ({
            itemId: String(i),
            fulfilledQuantity: item.quantity,
        }));
        const ok = await fulfillRequest(selectedRequest.id, { notes: 'Fulfilled by admin', items });
        if (ok) {
            setShowFulfillModal(false);
            setSelectedRequest(null);
            refresh();
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
    };

    const activeFilterCount = [filterStatus !== 'all', searchTerm !== ''].filter(Boolean).length;

    // ── Filter ────────────────────────────────────────────────────────────────

    const filteredRequests = requests.filter(r => {
        const matchSearch =
            searchTerm === '' ||
            r.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.requesterEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // ── Loading / error ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <DashboardLayout activePage="requests">
                <div className="state-container">
                    <div className="loading-indicator"><div className="spinner" /></div>
                    <p className="state-message">Loading requests…</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout activePage="requests">
                <div className="state-container error">
                    <div className="state-indicator">!</div>
                    <p className="state-message">{error}</p>
                    <button onClick={refresh} className="retry-button" type="button">Try Again</button>
                </div>
            </DashboardLayout>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <DashboardLayout activePage="requests">
            <div className="requests-page">

                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">Request Management</h1>
                        <p className="page-description">
                            Final approval stage — review and action requests from facilitators and managers.
                        </p>
                    </div>
                    {stats && (
                        <div className="header-stats">
                            <div className="stat-item">
                                <span className="stat-label">Total</span>
                                <span className="stat-value">{stats.total ?? 0}</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-label">Awaiting Admin</span>
                                <span className="stat-value highlight">{stats.pendingAdmin ?? 0}</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-label">Approved</span>
                                <span className="stat-value">{stats.approved ?? 0}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="controls-section">
                    <div className="search-section">
                        <div className="search-field">
                            <input
                                type="text"
                                placeholder="Search by request ID, name or email…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-bar">
                            <div className="filter-group">
                                {([
                                    ['all', 'All'],
                                    ['pending', 'Pending'],
                                    ['under_review', 'Under Review'],
                                    ['pending_admin', 'Awaiting Admin'],
                                    ['approved', 'Approved'],
                                    ['rejected', 'Rejected'],
                                    ['fulfilled', 'Fulfilled'],
                                ] as [string, string][]).map(([val, label]) => (
                                    <button
                                        key={val}
                                        className={`filter-button ${filterStatus === val ? 'active' : ''}`}
                                        onClick={() => setFilterStatus(val)}
                                        type="button"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Advanced filters */}
                            <div className="advanced-filters">
                                <button
                                    className={`filters-toggle ${showAdvancedFilters ? 'active' : ''}`}
                                    onClick={() => setShowAdvancedFilters(v => !v)}
                                    type="button"
                                >
                                    <span>Advanced Filters</span>
                                    <span className="toggle-icon">{showAdvancedFilters ? '−' : '+'}</span>
                                </button>

                                {showAdvancedFilters && (
                                    <div className="filters-panel">
                                        <div className="filters-grid">
                                            <div className="filter-section">
                                                <label className="filter-label">Priority</label>
                                                <div className="filter-options">
                                                    {['low', 'medium', 'high', 'urgent'].map(p => (
                                                        <label key={p} className="filter-checkbox">
                                                            <input type="checkbox" />
                                                            <span className="checkbox-text priority">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="filter-section">
                                                <label className="filter-label">Date Range</label>
                                                <div className="date-range">
                                                    <input type="date" className="date-input" />
                                                    <span className="date-separator">to</span>
                                                    <input type="date" className="date-input" />
                                                </div>
                                            </div>

                                            <div className="filter-section">
                                                <label className="filter-label">Department</label>
                                                <input type="text" className="filter-input" placeholder="Filter by department" />
                                            </div>
                                        </div>

                                        <div className="filter-actions">
                                            <button className="apply-filters-btn" type="button">Apply Filters</button>
                                            <button className="clear-filters-btn" onClick={handleClearFilters} type="button">
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {activeFilterCount > 0 && (
                                <button className="clear-filters" onClick={handleClearFilters} type="button">
                                    Clear ({activeFilterCount})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="action-section">
                        <button className="action-button secondary" onClick={refresh} type="button">
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="stats-section">
                        <RequestStats stats={stats} />
                    </div>
                )}

                {/* Table */}
                <div className="table-section">
                    <div className="table-wrapper">
                        <table className="requests-table">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Requester</th>
                                    <th>Department</th>
                                    <th>Items</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Status Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No requests match your filters.
                                        </td>
                                    </tr>
                                ) : filteredRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="request-id">
                                            {req.requestId || req.id?.substring(0, 8)}
                                        </td>
                                        <td className="requester-info">
                                            <div className="requester-name">{req.requesterName}</div>
                                            {req.requesterEmail && (
                                                <div className="requester-email">{req.requesterEmail}</div>
                                            )}
                                        </td>
                                        <td>{req.department || '—'}</td>
                                        <td>
                                            <span className="items-count">{req.items?.length ?? 0} items</span>
                                            {(req.items?.length ?? 0) > 0 && (
                                                <div className="items-preview">
                                                    {req.items.slice(0, 2).map((item, i) => (
                                                        <span key={i} className="item-preview">{getItemDisplay(item)}</span>
                                                    ))}
                                                    {req.items.length > 2 && (
                                                        <span className="more-items">+{req.items.length - 2} more</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`priority-badge priority-${req.priority ?? 'medium'}`}>
                                                {req.priority ?? 'medium'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${req.status}`}>
                                                {statusLabel(req.status)}
                                            </span>
                                        </td>
                                        <td className="date-cell">{formatDate(req.createdAt)}</td>
                                        <td className="date-cell">{getStatusDate(req)}</td>
                                        <td className="actions-cell">
                                            <div className="action-group">
                                                {req.status === 'pending_admin' && (
                                                    <>
                                                        <button
                                                            className="action-button approve"
                                                            onClick={() => handleApprove(req.id)}
                                                            type="button"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="action-button reject"
                                                            onClick={() => handleReject(req.id)}
                                                            type="button"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'approved' && (
                                                    <button
                                                        className="action-button fulfill"
                                                        onClick={() => { setSelectedRequest(req); setShowFulfillModal(true); }}
                                                        type="button"
                                                    >
                                                        Fulfill
                                                    </button>
                                                )}
                                                <button
                                                    className="action-button view"
                                                    onClick={() => setSelectedRequest(req)}
                                                    type="button"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="status-footer">
                    <div className="footer-left">
                        <span className="system-status">System Status</span>
                        <span className="status-dot active" />
                    </div>
                    <div className="footer-right">
                        Showing {filteredRequests.length} of {requests.length} requests
                    </div>
                </div>

                {/* Fulfill modal */}
                {showFulfillModal && selectedRequest && (
                    <>
                        <div className="modal-overlay" onClick={() => setShowFulfillModal(false)} />
                        <div className="fulfill-modal">
                            <div className="modal-header">
                                <h3 className="modal-title">Confirm Fulfillment</h3>
                            </div>
                            <div className="modal-body">
                                <div className="request-details">
                                    {[
                                        ['Request ID', selectedRequest.requestId],
                                        ['Requester', selectedRequest.requesterName],
                                        ['Department', selectedRequest.department],
                                        ['Created', formatDate(selectedRequest.createdAt)],
                                        ['Approved', formatDate(selectedRequest.updatedAt)],
                                        ['Items', String(selectedRequest.items?.length ?? 0)],
                                    ].map(([label, value]) => (
                                        <div key={label} className="detail-row">
                                            <span className="detail-label">{label}</span>
                                            <span className="detail-value">{value}</span>
                                        </div>
                                    ))}
                                    {(selectedRequest.items?.length ?? 0) > 0 && (
                                        <div className="detail-items">
                                            {selectedRequest.items.map((item, i) => (
                                                <div key={i} className="detail-item">{getItemDisplay(item)}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="confirmation-text">
                                    Confirm marking this request as fulfilled? The requester will be notified.
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button onClick={handleFulfill} className="modal-button confirm" type="button">
                                    Confirm Fulfillment
                                </button>
                                <button
                                    onClick={() => { setShowFulfillModal(false); setSelectedRequest(null); }}
                                    className="modal-button cancel"
                                    type="button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </DashboardLayout>
    );
};