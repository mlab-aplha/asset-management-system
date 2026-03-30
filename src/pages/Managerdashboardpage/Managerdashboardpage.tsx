// src/pages/Managerdashboardpage/ManagerDashboardPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useManagerRequests } from '../../hooks/Usemanagerrequests ';
import { IRequest, RequestItem } from '../../core/types/request.types';
import './Managerdashboardpage .css';

function timeAgo(date: Date | unknown): string {
    const d = date instanceof Date ? date : new Date(date as string);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function priorityColor(p: string): string {
    return ({ low: '#4ade80', medium: '#fbbf24', high: '#f87171', urgent: '#c494ff' } as Record<string, string>)[p] ?? '#fff';
}

export const ManagerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const locationIds = user?.assignedHubIds ?? [];

    const { requests, stats, loading, approveRequest, rejectRequest, pendingReview } =
        useManagerRequests(locationIds);

    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

    const showToast = (msg: string, type: 'ok' | 'err') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleApprove = async (req: IRequest) => {
        setActionLoading(true);
        const res = await approveRequest(req.id, 'Approved — forwarded to admin');
        setActionLoading(false);
        if (res.success) showToast('Request forwarded to Super Admin ✓', 'ok');
        else showToast(res.error ?? 'Failed to approve', 'err');
    };

    const handleReject = async () => {
        if (!rejectId || !rejectReason.trim()) return;
        setActionLoading(true);
        const res = await rejectRequest(rejectId, rejectReason);
        setActionLoading(false);
        if (res.success) {
            showToast('Request rejected', 'ok');
            setRejectId(null);
            setRejectReason('');
        } else {
            showToast(res.error ?? 'Failed to reject', 'err');
        }
    };

    const displayed = activeTab === 'pending' ? pendingReview : requests;

    return (
        <DashboardLayout activePage="dashboard">
            <div className="manager-dashboard">

                {/* Toast */}
                {toast && (
                    <div className={`mgr-toast ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
                        <span className="material-icons">{toast.type === 'ok' ? 'check_circle' : 'error'}</span>
                        {toast.msg}
                    </div>
                )}

                {/* Header */}
                <header className="mgr-header">
                    <div>
                        <h1 className="mgr-title">Hub Manager</h1>
                        <p className="mgr-subtitle">
                            {user?.displayName} · Review and forward asset requests to administration.
                        </p>
                    </div>
                    <button className="mgr-portal-btn" onClick={() => navigate('/admin/requests')} type="button">
                        <span className="material-icons">open_in_full</span>
                        Full Request View
                    </button>
                </header>

                {/* Stats */}
                <div className="mgr-stats">
                    {([
                        { label: 'Awaiting Review', value: stats?.underReview ?? 0, icon: 'pending_actions', accent: '#fbbf24', urgent: true },
                        { label: 'Total This Hub', value: stats?.total ?? 0, icon: 'receipt_long', accent: '#60a5fa' },
                        { label: 'Approved', value: stats?.approved ?? 0, icon: 'check_circle', accent: '#4ade80' },
                        { label: 'Rejected', value: stats?.rejected ?? 0, icon: 'cancel', accent: '#f87171' },
                    ] as { label: string; value: number; icon: string; accent: string; urgent?: boolean }[]).map(s => (
                        <div key={s.label} className={`mgr-stat ${s.urgent ? 'stat-urgent' : ''}`}>
                            <span className="material-icons mgr-stat-icon" style={{ color: s.accent }}>{s.icon}</span>
                            <div>
                                <p className="mgr-stat-number" style={{ color: s.urgent ? s.accent : undefined }}>{s.value}</p>
                                <p className="mgr-stat-label">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Workflow banner */}
                <div className="mgr-workflow-banner">
                    <div className="wf-step wf-done"><span className="material-icons">check</span> Facilitator</div>
                    <div className="wf-arrow"><span className="material-icons">arrow_forward</span></div>
                    <div className="wf-step wf-active"><span className="material-icons">manage_accounts</span> <strong>You</strong> (Manager)</div>
                    <div className="wf-arrow"><span className="material-icons">arrow_forward</span></div>
                    <div className="wf-step wf-next"><span className="material-icons">admin_panel_settings</span> Super Admin</div>
                </div>

                {/* Tabs */}
                <div className="mgr-tabs">
                    <button
                        className={`mgr-tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                        type="button"
                    >
                        Needs Review
                        {pendingReview.length > 0 && <span className="mgr-tab-badge">{pendingReview.length}</span>}
                    </button>
                    <button
                        className={`mgr-tab ${activeTab === 'all' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('all')}
                        type="button"
                    >
                        All Requests ({requests.length})
                    </button>
                </div>

                {/* Request list */}
                <div className="mgr-requests">
                    {loading ? (
                        <div className="mgr-loading"><div className="mgr-spinner" /><p>Loading requests…</p></div>
                    ) : displayed.length === 0 ? (
                        <div className="mgr-empty">
                            <span className="material-icons">inbox</span>
                            <p>{activeTab === 'pending' ? 'No requests awaiting your review.' : 'No requests found.'}</p>
                        </div>
                    ) : (
                        displayed.map((req: IRequest) => (
                            <div key={req.id} className="mgr-request-card">
                                <div className="mgr-card-left">
                                    <div className="mgr-req-top">
                                        <span className="mgr-req-id">{req.requestId}</span>
                                        <span
                                            className="mgr-priority"
                                            style={{ color: priorityColor(req.priority), borderColor: priorityColor(req.priority) }}
                                        >
                                            {req.priority}
                                        </span>
                                        <span className="mgr-time">{timeAgo(req.createdAt)}</span>
                                    </div>

                                    <div className="mgr-req-who">
                                        <span className="material-icons">person</span>
                                        <span className="mgr-requester">{req.requesterName}</span>
                                        <span className="mgr-dept">· {req.department}</span>
                                    </div>

                                    <div className="mgr-items">
                                        {req.items.slice(0, 2).map((item: RequestItem, i: number) => (
                                            <span key={i} className="mgr-item-chip">
                                                {item.quantity}× {item.assetType}
                                            </span>
                                        ))}
                                        {req.items.length > 2 && (
                                            <span className="mgr-item-chip mgr-item-more">
                                                +{req.items.length - 2} more
                                            </span>
                                        )}
                                    </div>

                                    {req.notes && (
                                        <p className="mgr-notes">
                                            <span className="material-icons">notes</span> {req.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="mgr-card-right">
                                    {req.status === 'under_review' ? (
                                        <>
                                            <button
                                                className="mgr-approve-btn"
                                                onClick={() => handleApprove(req)}
                                                disabled={actionLoading}
                                                type="button"
                                            >
                                                <span className="material-icons">thumb_up</span>
                                                Forward to Admin
                                            </button>
                                            <button
                                                className="mgr-reject-btn"
                                                onClick={() => { setRejectId(req.id); setRejectReason(''); }}
                                                disabled={actionLoading}
                                                type="button"
                                            >
                                                <span className="material-icons">thumb_down</span>
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`mgr-status-chip status-${req.status}`}>
                                            {req.status.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Reject modal */}
                {rejectId && (
                    <div className="mgr-modal-overlay" onClick={() => setRejectId(null)}>
                        <div className="mgr-modal" onClick={e => e.stopPropagation()}>
                            <h3 className="mgr-modal-title">Reject Request</h3>
                            <p className="mgr-modal-sub">Provide a reason — the requester will be notified.</p>
                            <textarea
                                className="mgr-reject-textarea"
                                placeholder="Enter rejection reason…"
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                rows={4}
                                autoFocus
                            />
                            <div className="mgr-modal-actions">
                                <button className="mgr-modal-cancel" onClick={() => setRejectId(null)} type="button">Cancel</button>
                                <button
                                    className="mgr-modal-confirm"
                                    onClick={handleReject}
                                    disabled={!rejectReason.trim() || actionLoading}
                                    type="button"
                                >
                                    {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};