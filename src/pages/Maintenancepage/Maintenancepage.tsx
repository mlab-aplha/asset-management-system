// src/pages/Maintenancepage/MaintenancePage.tsx
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useMaintenance } from '../../hooks/Usemaintenance';
import { MaintenanceTicket, MaintenanceFilters } from '../../core/entities/Maintenance';
import './MaintenancePage.css';

function timeAgo(date: Date | unknown): string {
    const d = date instanceof Date ? date : new Date(date as string);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const PRIORITY_COLORS: Record<string, string> = {
    critical: '#f87171', high: '#fbbf24', medium: '#60a5fa', low: '#4ade80',
};

const STATUS_OPTIONS = ['pending', 'in-progress', 'completed', 'cancelled'] as const;
const PRIORITY_OPTIONS = ['critical', 'high', 'medium', 'low'] as const;

export const MaintenancePage: React.FC = () => {
    const { user } = useAuth();
    const {
        tickets, loading, loadTickets, updateStatus, assignTicket,
    } = useMaintenance();

    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<string>('all');
    const [priorityF, setPriorityF] = useState<string>('all');
    const [assignId, setAssignId] = useState<string | null>(null);
    const [assignName, setAssignName] = useState('');

    useEffect(() => {
        const filters: MaintenanceFilters = {};
        if (statusF !== 'all') filters.status = statusF as MaintenanceTicket['status'];
        if (priorityF !== 'all') filters.priority = priorityF as MaintenanceTicket['priority'];
        if (search) filters.searchTerm = search;
        loadTickets(filters);
    }, [statusF, priorityF, search]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStatusChange = async (ticketId: string, newStatus: MaintenanceTicket['status']) => {
        await updateStatus(ticketId, newStatus);
    };

    const handleAssign = async () => {
        if (!assignId || !assignName.trim() || !user?.uid) return;
        await assignTicket(assignId, user.uid, assignName.trim());
        setAssignId(null);
        setAssignName('');
    };

    const stats = {
        open: tickets.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
        critical: tickets.filter(t => t.priority === 'critical').length,
        done: tickets.filter(t => t.status === 'completed').length,
        total: tickets.length,
    };

    return (
        <DashboardLayout activePage="maintenance">
            <div className="maintenance-page">

                {/* Header */}
                <header className="maint-header">
                    <div>
                        <h1 className="maint-title">Maintenance Tickets</h1>
                        <p className="maint-subtitle">Track and resolve asset maintenance requests</p>
                    </div>
                </header>

                {/* Stats */}
                <div className="maint-stats">
                    {[
                        { label: 'Open', value: stats.open, icon: 'pending_actions', color: '#fbbf24' },
                        { label: 'Critical', value: stats.critical, icon: 'priority_high', color: '#f87171' },
                        { label: 'Completed', value: stats.done, icon: 'task_alt', color: '#4ade80' },
                        { label: 'Total', value: stats.total, icon: 'receipt', color: '#60a5fa' },
                    ].map(s => (
                        <div key={s.label} className="maint-stat">
                            <span className="material-icons maint-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                            <div>
                                <p className="maint-stat-num">{s.value}</p>
                                <p className="maint-stat-lbl">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="maint-filters">
                    <div className="maint-search-wrap">
                        <span className="material-icons maint-search-icon">search</span>
                        <input
                            type="text"
                            className="maint-search"
                            placeholder="Search by asset, description or assignee…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="maint-filter-row">
                        <select className="maint-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
                            <option value="all">All Status</option>
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>

                        <select className="maint-select" value={priorityF} onChange={e => setPriorityF(e.target.value)}>
                            <option value="all">All Priority</option>
                            {PRIORITY_OPTIONS.map(p => (
                                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                            ))}
                        </select>

                        {(statusF !== 'all' || priorityF !== 'all' || search) && (
                            <button
                                className="maint-clear"
                                onClick={() => { setSearch(''); setStatusF('all'); setPriorityF('all'); }}
                                type="button"
                            >
                                <span className="material-icons">filter_alt_off</span>
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Tickets */}
                {loading ? (
                    <div className="maint-loading"><div className="maint-spinner" /><p>Loading tickets…</p></div>
                ) : tickets.length === 0 ? (
                    <div className="maint-empty">
                        <span className="material-icons">build_circle</span>
                        <p>No tickets match your filters.</p>
                    </div>
                ) : (
                    <div className="maint-list">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="maint-ticket">
                                <div
                                    className="maint-priority-stripe"
                                    style={{ background: PRIORITY_COLORS[ticket.priority] ?? '#60a5fa' }}
                                />

                                <div className="maint-ticket-body">
                                    <div className="maint-ticket-top">
                                        <span className="maint-asset">{ticket.assetName}</span>
                                        {ticket.assetTag && (
                                            <span className="maint-tag">{ticket.assetTag}</span>
                                        )}
                                        <span className="maint-time">{timeAgo(ticket.createdAt)}</span>
                                    </div>

                                    <p className="maint-desc">{ticket.description}</p>

                                    <div className="maint-ticket-meta">
                                        <span className="maint-type-chip">{ticket.type}</span>
                                        <span
                                            className="maint-priority-chip"
                                            style={{ color: PRIORITY_COLORS[ticket.priority], borderColor: PRIORITY_COLORS[ticket.priority] }}
                                        >
                                            {ticket.priority}
                                        </span>
                                        {ticket.locationName && (
                                            <span className="maint-loc">
                                                <span className="material-icons">location_on</span>
                                                {ticket.locationName}
                                            </span>
                                        )}
                                    </div>

                                    {ticket.assignedToName && (
                                        <p className="maint-assigned">
                                            <span className="material-icons">person</span>
                                            Assigned to {ticket.assignedToName}
                                        </p>
                                    )}
                                </div>

                                <div className="maint-ticket-actions">
                                    {/* Status select */}
                                    <select
                                        className="maint-status-select"
                                        value={ticket.status}
                                        onChange={e => handleStatusChange(ticket.id, e.target.value as MaintenanceTicket['status'])}
                                        style={{
                                            borderColor: ticket.status === 'completed' ? '#4ade80' :
                                                ticket.status === 'in-progress' ? '#60a5fa' :
                                                    ticket.status === 'cancelled' ? '#64748b' : '#fbbf24'
                                        }}
                                    >
                                        {STATUS_OPTIONS.map(s => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                        ))}
                                    </select>

                                    {/* Assign to me */}
                                    {!ticket.assignedTo && (
                                        <button
                                            className="maint-assign-btn"
                                            onClick={() => { setAssignId(ticket.id); setAssignName(user?.displayName ?? ''); }}
                                            type="button"
                                        >
                                            <span className="material-icons">person_add</span>
                                            Assign
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Assign modal */}
                {assignId && (
                    <div className="maint-modal-overlay" onClick={() => setAssignId(null)}>
                        <div className="maint-modal" onClick={e => e.stopPropagation()}>
                            <h3 className="maint-modal-title">Assign Technician</h3>
                            <input
                                type="text"
                                className="maint-modal-input"
                                placeholder="Technician name"
                                value={assignName}
                                onChange={e => setAssignName(e.target.value)}
                                autoFocus
                            />
                            <div className="maint-modal-actions">
                                <button className="maint-modal-cancel" onClick={() => setAssignId(null)} type="button">Cancel</button>
                                <button
                                    className="maint-modal-confirm"
                                    onClick={handleAssign}
                                    disabled={!assignName.trim()}
                                    type="button"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};