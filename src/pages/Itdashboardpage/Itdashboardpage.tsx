// src/pages/Itdashboardpage/ITDashboardPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useMaintenance } from '../../hooks/Usemaintenance';
import { useDashboardStats } from '../../hooks/useAnalytics';
import './ITDashboardPage.css';

function timeAgo(date: Date | unknown): string {
    const d = date instanceof Date ? date : new Date(date as string);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function extractCount(val: unknown): number {
    if (typeof val === 'number') return val;
    if (val && typeof val === 'object' && 'value' in val) {
        return (val as { value: number }).value;
    }
    return 0;
}

export const ITDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { tickets, loading: ticketsLoading, loadTickets } = useMaintenance();
    const { stats, loading: statsLoading } = useDashboardStats();

    useEffect(() => { loadTickets(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const openTickets = tickets.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'completed');
    const recentTickets = [...tickets]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    const priorityColor: Record<string, string> = {
        critical: '#f87171', high: '#fbbf24', medium: '#60a5fa', low: '#4ade80',
    };

    const statusColor: Record<string, string> = {
        pending: '#fbbf24', 'in-progress': '#60a5fa', completed: '#4ade80', cancelled: '#64748b',
    };

    return (
        <DashboardLayout activePage="dashboard">
            <div className="it-dashboard">

                {/* Header */}
                <header className="it-header">
                    <div>
                        <h1 className="it-title">IT Dashboard</h1>
                        <p className="it-subtitle">{user?.displayName} · Asset infrastructure & maintenance oversight</p>
                    </div>
                    <div className="it-header-actions">
                        <button className="it-action-btn" onClick={() => navigate('/it/maintenance')} type="button">
                            <span className="material-icons">build</span>
                            Maintenance
                        </button>
                        <button className="it-action-btn it-action-primary" onClick={() => navigate('/assets')} type="button">
                            <span className="material-icons">inventory_2</span>
                            Asset Registry
                        </button>
                    </div>
                </header>

                {/* Asset Stats */}
                <div className="it-stats-section">
                    <h3 className="it-section-label">Asset Overview</h3>
                    <div className="it-stats">
                        {([
                            { label: 'Total Assets', value: statsLoading ? '—' : stats?.totalAssets ?? 0, icon: 'devices', color: '#60a5fa' },
                            { label: 'Available', value: statsLoading ? '—' : stats?.availableAssets ?? 0, icon: 'check_circle', color: '#4ade80' },
                            { label: 'Assigned', value: statsLoading ? '—' : stats?.assignedAssets ?? 0, icon: 'person_pin', color: '#fbbf24' },
                            { label: 'In Maintenance', value: statsLoading ? '—' : stats?.maintenanceAssets ?? 0, icon: 'build', color: '#f87171' },
                        ] as { label: string; value: string | number; icon: string; color: string }[]).map(s => (
                            <div key={s.label} className="it-stat-card">
                                <span className="material-icons it-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                                <div>
                                    <p className="it-stat-number">{String(s.value)}</p>
                                    <p className="it-stat-label">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Maintenance Stats */}
                <div className="it-stats-section">
                    <h3 className="it-section-label">Maintenance Tickets</h3>
                    <div className="it-stats">
                        {([
                            { label: 'Open Tickets', value: openTickets.length, icon: 'confirmation_number', color: '#fbbf24' },
                            { label: 'Critical', value: criticalTickets.length, icon: 'priority_high', color: '#f87171' },
                            { label: 'Total Tickets', value: tickets.length, icon: 'receipt', color: '#60a5fa' },
                            { label: 'Completed Today', value: tickets.filter(t => t.status === 'completed' && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length, icon: 'task_alt', color: '#4ade80' },
                        ] as { label: string; value: number; icon: string; color: string }[]).map(s => (
                            <div key={s.label} className="it-stat-card">
                                <span className="material-icons it-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                                <div>
                                    <p className="it-stat-number">{s.value}</p>
                                    <p className="it-stat-label">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent tickets */}
                <div className="it-tickets-section">
                    <div className="it-tickets-header">
                        <h3 className="it-section-label">Recent Tickets</h3>
                        <button className="it-view-all" onClick={() => navigate('/it/maintenance')} type="button">
                            View All <span className="material-icons">arrow_forward</span>
                        </button>
                    </div>

                    {ticketsLoading ? (
                        <div className="it-loading"><div className="it-spinner" /><p>Loading tickets…</p></div>
                    ) : recentTickets.length === 0 ? (
                        <div className="it-empty">
                            <span className="material-icons">build_circle</span>
                            <p>No maintenance tickets yet.</p>
                            <button className="it-create-btn" onClick={() => navigate('/it/maintenance')} type="button">
                                Go to Maintenance
                            </button>
                        </div>
                    ) : (
                        <div className="it-tickets-list">
                            {recentTickets.map(ticket => (
                                <div key={ticket.id} className="it-ticket-row">
                                    <div
                                        className="it-ticket-priority-bar"
                                        style={{ background: priorityColor[ticket.priority] ?? '#60a5fa' }}
                                    />
                                    <div className="it-ticket-info">
                                        <span className="it-ticket-asset">{ticket.assetName}</span>
                                        <span className="it-ticket-desc">
                                            {(ticket.description ?? '').slice(0, 80)}
                                            {(ticket.description ?? '').length > 80 ? '…' : ''}
                                        </span>
                                    </div>
                                    <div className="it-ticket-meta">
                                        <span
                                            className="it-ticket-status"
                                            style={{
                                                color: statusColor[ticket.status] ?? '#fff',
                                                borderColor: statusColor[ticket.status] ?? '#fff',
                                            }}
                                        >
                                            {ticket.status}
                                        </span>
                                        <span className="it-ticket-time">{timeAgo(ticket.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category breakdown — FIX: use extractCount helper */}
                {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
                    <div className="it-categories">
                        <h3 className="it-section-label">Assets by Category</h3>
                        <div className="it-cat-grid">
                            {Object.entries(stats.byCategory).slice(0, 8).map(([cat, rawCount]) => (
                                <div key={cat} className="it-cat-card">
                                    <span className="material-icons it-cat-icon">category</span>
                                    <div>
                                        <p className="it-cat-name">{cat}</p>
                                        <p className="it-cat-count">{extractCount(rawCount)} assets</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};