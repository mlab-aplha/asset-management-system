// src/pages/Studentdashboardpage/StudentDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useRequests } from '../../hooks/useRequests';
import { IRequest } from '../../core/types/request.types';
import './StudentDashboardPage.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusLabel(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusClass(s: string): string {
    const map: Record<string, string> = {
        pending: 'badge-pending',
        under_review: 'badge-review',
        pending_admin: 'badge-admin',
        approved: 'badge-approved',
        rejected: 'badge-rejected',
        fulfilled: 'badge-fulfilled',
        cancelled: 'badge-cancelled',
    };
    return map[s] ?? 'badge-pending';
}

function priorityClass(p: string): string {
    return `priority-${p}`;
}

function timeAgo(date: Date | unknown): string {
    const d = date instanceof Date ? date : new Date(date as string);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ── Approval progress bar ─────────────────────────────────────────────────────

const ApprovalProgress: React.FC<{ status: string }> = ({ status }) => {
    const steps = ['Submitted', 'Facilitator', 'Manager', 'Admin', 'Approved'];
    const stepIndex: Record<string, number> = {
        pending: 1,
        under_review: 2,
        pending_admin: 3,
        approved: 4,
        fulfilled: 4,
        rejected: -1,
        cancelled: -1,
    };
    const current = stepIndex[status] ?? 0;
    const isRejected = status === 'rejected' || status === 'cancelled';

    return (
        <div className="approval-progress">
            {steps.map((step, i) => (
                <React.Fragment key={step}>
                    <div className={`progress-step ${isRejected && i === current ? 'step-rejected' :
                        i < current ? 'step-done' :
                            i === current ? 'step-active' : 'step-pending'
                        }`}>
                        <div className="step-dot">
                            {i < current && !isRejected && <span className="material-icons">check</span>}
                            {isRejected && i === current && <span className="material-icons">close</span>}
                        </div>
                        <span className="step-label">{step}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`progress-line ${i < current && !isRejected ? 'line-done' : ''}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────

export const StudentDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { requests, loading, fetchMyRequests } = useRequests();
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (user?.uid) fetchMyRequests(user.uid);
    }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

    const active = requests.filter(r => !['fulfilled', 'rejected', 'cancelled'].includes(r.status));
    const history = requests.filter(r => ['fulfilled', 'rejected', 'cancelled'].includes(r.status));
    const displayed = activeTab === 'active' ? active : history;

    const stats = {
        total: requests.length,
        active: active.length,
        approved: requests.filter(r => r.status === 'approved').length,
        fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    };

    return (
        <DashboardLayout activePage="dashboard">
            <div className="student-dashboard">

                {/* ── Header ── */}
                <header className="student-header">
                    <div className="student-header-left">
                        <div className="student-greeting">

                            <div>
                                <h1 className="student-title">
                                    Hello, {user?.displayName?.split(' ')[0] ?? 'Student'}
                                </h1>
                                <p className="student-subtitle">
                                    Track your asset requests and browse available equipment.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="student-header-right">
                        <button
                            className="new-request-btn"
                            onClick={() => navigate('/asset-portal')}
                            type="button"
                        >
                            <span className="material-icons">add</span>
                            New Request
                        </button>
                    </div>
                </header>

                {/* ── Stats ── */}
                <div className="student-stats">
                    {[
                        { label: 'Total Requests', value: stats.total, icon: 'receipt_long', color: 'blue' },
                        { label: 'In Progress', value: stats.active, icon: 'pending_actions', color: 'amber' },
                        { label: 'Approved', value: stats.approved, icon: 'check_circle', color: 'green' },
                        { label: 'Fulfilled', value: stats.fulfilled, icon: 'inventory', color: 'lime' },
                    ].map(s => (
                        <div key={s.label} className={`student-stat-card stat-${s.color}`}>
                            <span className="material-icons stat-icon">{s.icon}</span>
                            <div>
                                <p className="stat-number">{s.value}</p>
                                <p className="stat-label">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ── */}
                <div className="student-tabs">
                    <button
                        className={`student-tab ${activeTab === 'active' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('active')}
                        type="button"
                    >
                        Active Requests
                        {active.length > 0 && <span className="tab-count">{active.length}</span>}
                    </button>
                    <button
                        className={`student-tab ${activeTab === 'history' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('history')}
                        type="button"
                    >
                        History
                        {history.length > 0 && <span className="tab-count">{history.length}</span>}
                    </button>
                </div>

                {/* ── Request List ── */}
                <div className="student-requests">
                    {loading ? (
                        <div className="student-loading">
                            <div className="student-spinner" />
                            <p>Loading your requests…</p>
                        </div>
                    ) : displayed.length === 0 ? (
                        <div className="student-empty">
                            <span className="material-icons empty-icon">inbox</span>
                            <p className="empty-title">
                                {activeTab === 'active' ? 'No active requests' : 'No request history yet'}
                            </p>
                            <p className="empty-sub">
                                {activeTab === 'active' && 'Browse the asset portal to request equipment.'}
                            </p>
                            {activeTab === 'active' && (
                                <button
                                    className="browse-btn"
                                    onClick={() => navigate('/asset-portal')}
                                    type="button"
                                >
                                    Browse Assets
                                </button>
                            )}
                        </div>
                    ) : (
                        displayed.map((req: IRequest) => (
                            <div
                                key={req.id}
                                className={`request-card ${expanded === req.id ? 'card-expanded' : ''}`}
                            >
                                {/* Card header */}
                                <button
                                    className="request-card-header"
                                    onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                                    type="button"
                                >
                                    <div className="request-id-block">
                                        <span className="req-id">{req.requestId}</span>
                                        <span className={`req-priority ${priorityClass(req.priority)}`}>
                                            {req.priority}
                                        </span>
                                    </div>

                                    <div className="request-summary">
                                        <span className="req-items">
                                            {req.items.length} item{req.items.length !== 1 ? 's' : ''}
                                            {req.items[0] && ` — ${req.items[0].assetType}`}
                                            {req.items.length > 1 && ` +${req.items.length - 1} more`}
                                        </span>
                                        <span className="req-time">{timeAgo(req.createdAt)}</span>
                                    </div>

                                    <div className="request-status-block">
                                        <span className={`status-badge ${statusClass(req.status)}`}>
                                            {statusLabel(req.status)}
                                        </span>
                                        <span className="material-icons expand-icon">
                                            {expanded === req.id ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </div>
                                </button>

                                {/* Expanded detail */}
                                {expanded === req.id && (
                                    <div className="request-card-body">
                                        {/* Approval progress */}
                                        <ApprovalProgress status={req.status} />

                                        {/* Items */}
                                        <div className="req-detail-section">
                                            <h4 className="detail-section-title">Requested Items</h4>
                                            <div className="req-items-list">
                                                {req.items.map((item, i) => (
                                                    <div key={i} className="req-item-row">
                                                        <span className="material-icons item-icon">devices</span>
                                                        <div className="item-info">
                                                            <span className="item-type">{item.assetType}</span>
                                                            <span className="item-cat">{item.category}</span>
                                                        </div>
                                                        <span className="item-qty">×{item.quantity}</span>
                                                        <span className={`item-status ${item.itemStatus}`}>
                                                            {item.itemStatus}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="req-meta-grid">
                                            <div className="req-meta-item">
                                                <span className="meta-label">Location</span>
                                                <span className="meta-value">{req.locationName || req.locationId}</span>
                                            </div>
                                            <div className="req-meta-item">
                                                <span className="meta-label">Department</span>
                                                <span className="meta-value">{req.department}</span>
                                            </div>
                                            {req.notes && (
                                                <div className="req-meta-item" style={{ gridColumn: '1 / -1' }}>
                                                    <span className="meta-label">Notes</span>
                                                    <span className="meta-value">{req.notes}</span>
                                                </div>
                                            )}
                                            {req.rejectionReason && (
                                                <div className="req-meta-item rejection-reason" style={{ gridColumn: '1 / -1' }}>
                                                    <span className="meta-label">Rejection reason</span>
                                                    <span className="meta-value">{req.rejectionReason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* ── Quick Actions ── */}
                <div className="student-quick-actions">
                    <h3 className="qa-title">Quick Actions</h3>
                    <div className="qa-grid">
                        {[
                            { label: 'Browse Assets', icon: 'store', path: '/asset-portal', desc: 'Find and request equipment' },
                            { label: 'View My Requests', icon: 'receipt_long', path: null, desc: 'Track request status' },
                        ].map(a => (
                            <button
                                key={a.label}
                                className="qa-card"
                                onClick={() => a.path ? navigate(a.path) : setActiveTab('active')}
                                type="button"
                            >
                                <span className="material-icons qa-icon">{a.icon}</span>
                                <div>
                                    <p className="qa-label">{a.label}</p>
                                    <p className="qa-desc">{a.desc}</p>
                                </div>
                                <span className="material-icons qa-arrow">arrow_forward</span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};