// src/pages/Assetportalpage/AssetPortalPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useAssetPortal } from '../../hooks/Useassetportal ';
import { useRequests } from '../../hooks/useRequests';
import { Asset } from '../../core/entities/Asset';
import { RequestService } from '../../../backend-firebase/src/services/RequestService';
import './AssetPortalPage.css';

export const AssetPortalPage: React.FC = () => {
    const { user } = useAuth();
    const { assets, loading, loadAssets } = useAssetPortal();
    const { pendingRequests } = useRequests();

    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState<Asset | null>(null);
    const [qty, setQty] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const role = user?.role ?? 'student';
    const hubIds = user?.assignedHubIds ?? [];

    useEffect(() => {
        if (user) loadAssets(role as never, hubIds);
    }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

    const categories = useMemo(
        () => Array.from(new Set(assets.map(a => a.category).filter(Boolean))),
        [assets],
    );

    const filtered = useMemo(() => assets.filter(a => {
        const matchSearch = !search
            || a.name.toLowerCase().includes(search.toLowerCase())
            || (a.assetId ?? '').toLowerCase().includes(search.toLowerCase());
        const matchCat = catFilter === 'all' || a.category === catFilter;
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchCat && matchStatus;
    }), [assets, search, catFilter, statusFilter]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const handleRequest = async () => {
        if (!selected || !user?.uid) return;          // FIX: guard uid

        setSubmitting(true);
        try {
            // FIX: cast through unknown to avoid direct Record<string,string> cast
            const userRecord = user as unknown as Record<string, string>;

            const res = await RequestService.createRequest({
                requesterId: user.uid,                 // FIX: uid guaranteed string here
                requesterName: user.displayName ?? user.email ?? '',
                requesterEmail: user.email ?? '',
                locationId: selected.currentLocationId ?? hubIds[0] ?? '',
                locationName: (selected as unknown as Record<string, string>).locationName ?? '',
                department: userRecord.department ?? 'General',
                priority: 'medium',
                items: [{
                    assetType: selected.type ?? selected.category ?? 'Asset',
                    category: selected.category ?? 'general',
                    quantity: qty,
                    purpose: `Request for ${selected.name}`,
                    specifications: {
                        assetId: selected.id,
                        assetName: selected.name,
                        serialNumber: selected.serialNumber ?? '',
                    },
                }],
                notes: `Requesting: ${selected.name} (${selected.assetId ?? selected.id})`,
            });

            if (res.success) {
                showToast(`Request submitted for ${selected.name} ✓`);
                setSelected(null);
                setQty(1);
            } else {
                showToast(`Failed: ${res.error ?? 'Unknown error'}`);
            }
        } catch {                                     // FIX: removed unused `err`
            showToast('Request failed — please try again');
        } finally {
            setSubmitting(false);
        }
    };

    const canRequest = ['student', 'facilitator', 'manager'].includes(role);

    const statusBadgeClass = (s: string) => ({
        available: 'portal-badge-available',
        assigned: 'portal-badge-assigned',
        maintenance: 'portal-badge-maintenance',
        retired: 'portal-badge-retired',
    }[s] ?? '');

    return (
        <DashboardLayout activePage="asset-portal">
            <div className="portal-page">

                {/* Toast */}
                {toast && (
                    <div className="portal-toast">
                        <span className="material-icons">check_circle</span>
                        {toast}
                    </div>
                )}

                {/* Header */}
                <header className="portal-header">
                    <div>
                        <h1 className="portal-title">Asset Portal</h1>
                        <p className="portal-subtitle">
                            {role === 'student' ? 'Browse and request assets for your studies.' :
                                role === 'facilitator' ? 'Browse hub inventory and submit requests.' :
                                    'View and manage asset inventory.'}
                        </p>
                    </div>
                    {pendingRequests.length > 0 && (
                        <div className="portal-pending-notice">
                            <span className="material-icons">pending_actions</span>
                            {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </header>

                {/* Filters */}
                <div className="portal-filters">
                    <div className="portal-search-wrap">
                        <span className="material-icons portal-search-icon">search</span>
                        <input
                            type="text"
                            className="portal-search"
                            placeholder="Search by name or asset ID…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="portal-filter-row">
                        <select className="portal-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className="portal-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="assigned">Assigned</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <p className="portal-count">{filtered.length} of {assets.length} assets</p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="portal-loading"><div className="portal-spinner" /><p>Loading assets…</p></div>
                ) : filtered.length === 0 ? (
                    <div className="portal-empty">
                        <span className="material-icons">search_off</span>
                        <p>No assets match your search.</p>
                    </div>
                ) : (
                    <div className="portal-grid">
                        {filtered.map(asset => (
                            <div
                                key={asset.id}
                                className="portal-card"
                                onClick={() => { setSelected(asset); setQty(1); }}
                            >
                                <div className="portal-card-icon">
                                    <span className="material-icons">
                                        {(asset.category ?? '').includes('laptop') ? 'laptop' :
                                            (asset.category ?? '').includes('camera') ? 'videocam' :
                                                (asset.category ?? '').includes('vehicle') ? 'directions_car' : 'devices'}
                                    </span>
                                </div>
                                <div className="portal-card-info">
                                    <p className="portal-card-name">{asset.name}</p>
                                    <p className="portal-card-cat">{asset.category}</p>
                                    {asset.assetId && <p className="portal-card-id">{asset.assetId}</p>}
                                </div>
                                <div className="portal-card-footer">
                                    <span className={`portal-badge ${statusBadgeClass(asset.status)}`}>
                                        {asset.status}
                                    </span>
                                    {canRequest && asset.status === 'available' && (
                                        <span className="portal-request-hint">
                                            <span className="material-icons">add_circle_outline</span>
                                            Request
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Detail / request modal */}
                {selected && (
                    <div className="portal-modal-overlay" onClick={() => setSelected(null)}>
                        <div className="portal-modal" onClick={e => e.stopPropagation()}>
                            <div className="portal-modal-header">
                                <h3 className="portal-modal-title">{selected.name}</h3>
                                <button className="portal-modal-close" onClick={() => setSelected(null)} type="button">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <div className="portal-modal-body">
                                <div className="portal-detail-grid">
                                    {([
                                        ['Asset ID', selected.assetId ?? selected.id],
                                        ['Category', selected.category],
                                        ['Type', selected.type ?? '—'],
                                        ['Status', selected.status],
                                        ['Condition', selected.condition ?? '—'],
                                        ['Manufacturer', selected.manufacturer ?? '—'],
                                        ['Model', selected.model ?? '—'],
                                        ['Serial', selected.serialNumber ?? '—'],
                                    ] as [string, string][]).map(([label, value]) => (
                                        <div key={label} className="portal-detail-row">
                                            <span className="portal-detail-label">{label}</span>
                                            <span className="portal-detail-value">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                {selected.description && (
                                    <p className="portal-detail-desc">{selected.description}</p>
                                )}

                                {canRequest && selected.status === 'available' && (
                                    <div className="portal-request-form">
                                        <label className="portal-qty-label">Quantity</label>
                                        <div className="portal-qty-control">
                                            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                            <input
                                                type="number" min="1" value={qty}
                                                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="portal-qty-input"
                                            />
                                            <button type="button" onClick={() => setQty(q => q + 1)}>+</button>
                                        </div>
                                        <button
                                            className="portal-submit-btn"
                                            onClick={handleRequest}
                                            disabled={submitting || !user?.uid}
                                            type="button"
                                        >
                                            {submitting ? 'Submitting…' : 'Submit Request'}
                                        </button>
                                    </div>
                                )}

                                {!canRequest && (
                                    <p className="portal-no-request">
                                        <span className="material-icons">info</span>
                                        Viewing mode — your role cannot submit requests.
                                    </p>
                                )}

                                {selected.status !== 'available' && canRequest && (
                                    <p className="portal-unavailable">
                                        <span className="material-icons">block</span>
                                        This asset is currently {selected.status} and cannot be requested.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};