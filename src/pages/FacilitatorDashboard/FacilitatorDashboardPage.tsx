// src/pages/FacilitatorDashboard/FacilitatorDashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FacilitatorHeader } from '../../features/facilitator_features/FacilitatorHeader';
import { AssetStatsGrid } from '../../features/facilitator_features/AssetStatsGrid';
import { MyAssetsTable } from '../../features/facilitator_features/MyAssetsTable';
import { LocationAssetsTable } from '../../features/facilitator_features/LocationAssetsTable';
import { useAuth } from '../../hooks/useAuth';
import { useFacilitatorAssets } from '../../hooks/useFacilitatorAssets';
import { userService } from '../../../backend-firebase/src/services/UserService';
import { User } from '../../core/entities/User';
import './Facilitatordashboardpage .css';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssetAssignment {
    assetId: string;
    assetName: string;
    student: User;
    assignedAt: Date;
}

// ── Assign-Student Modal ──────────────────────────────────────────────────────

interface AssignModalProps {
    asset: { id: string; name: string } | null;
    students: User[];
    onAssign: (assetId: string, student: User) => void;
    onClose: () => void;
}

const AssignStudentModal: React.FC<AssignModalProps> = ({
    asset, students, onAssign, onClose,
}) => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<User | null>(null);

    if (!asset) return null;

    const filtered = students.filter(s =>
        !search ||
        (s.displayName ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (s.email ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="assign-overlay" onClick={onClose}>
            <div className="assign-modal" onClick={e => e.stopPropagation()}>

                <div className="assign-modal-header">
                    <div>
                        <h3 className="assign-modal-title">Assign Student</h3>
                        <p className="assign-modal-sub">
                            Assigning: <strong>{asset.name}</strong>
                        </p>
                    </div>
                    <button className="assign-close" onClick={onClose} type="button">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="assign-modal-body">
                    {/* Search */}
                    <div className="assign-search-wrap">
                        <span className="material-icons assign-search-icon">search</span>
                        <input
                            type="text"
                            className="assign-search"
                            placeholder="Search students…"
                            value={search}
                            autoFocus
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Student list */}
                    <div className="assign-student-list">
                        {filtered.length === 0 ? (
                            <p className="assign-empty">No students found.</p>
                        ) : filtered.map(s => (
                            <button
                                key={s.id}
                                className={`assign-student-row ${selected?.id === s.id ? 'selected' : ''}`}
                                onClick={() => setSelected(s)}
                                type="button"
                            >
                                <div className="assign-avatar">
                                    {(s.displayName ?? s.email ?? 'S').charAt(0).toUpperCase()}
                                </div>
                                <div className="assign-student-info">
                                    <span className="assign-student-name">{s.displayName || '—'}</span>
                                    <span className="assign-student-email">{s.email}</span>
                                </div>
                                {selected?.id === s.id && (
                                    <span className="material-icons assign-check">check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="assign-modal-footer">
                    <button className="assign-cancel-btn" onClick={onClose} type="button">Cancel</button>
                    <button
                        className="assign-confirm-btn"
                        onClick={() => { if (selected) { onAssign(asset.id, selected); onClose(); } }}
                        disabled={!selected}
                        type="button"
                    >
                        <span className="material-icons">assignment_ind</span>
                        Assign Student
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Students-Assigned-to-Assets table ────────────────────────────────────────

interface AssignedStudentsTableProps {
    assignments: AssetAssignment[];
    onAssign: (asset: { id: string; name: string }) => void;
    onUnassign: (assetId: string) => void;
}

const AssignedStudentsTable: React.FC<AssignedStudentsTableProps> = ({
    assignments, onAssign, onUnassign,
}) => {
    if (assignments.length === 0) {
        return (
            <div className="fac-empty">
                <span className="material-icons">person_off</span>
                <p>No students assigned to assets yet.</p>
            </div>
        );
    }

    return (
        <div className="fac-table-wrap">
            <table className="fac-table">
                <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Assigned Student</th>
                        <th>Email</th>
                        <th>Assigned</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.map(a => (
                        <tr key={a.assetId}>
                            <td>
                                <div className="fac-asset-cell">
                                    <span className="material-icons fac-asset-icon">devices</span>
                                    <span className="fac-asset-name">{a.assetName}</span>
                                </div>
                            </td>
                            <td>
                                <div className="fac-student-cell">
                                    <div className="fac-avatar">
                                        {(a.student.displayName ?? 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <span>{a.student.displayName || '—'}</span>
                                </div>
                            </td>
                            <td className="fac-email">{a.student.email}</td>
                            <td className="fac-date">
                                {a.assignedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td>
                                <div className="fac-row-actions">
                                    <button
                                        className="fac-reassign-btn"
                                        onClick={() => onAssign({ id: a.assetId, name: a.assetName })}
                                        type="button"
                                        title="Reassign"
                                    >
                                        <span className="material-icons">swap_horiz</span>
                                        Reassign
                                    </button>
                                    <button
                                        className="fac-unassign-btn"
                                        onClick={() => onUnassign(a.assetId)}
                                        type="button"
                                        title="Unassign"
                                    >
                                        <span className="material-icons">person_remove</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export const FacilitatorDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { locationAssets } = useFacilitatorAssets();

    const [students, setStudents] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
    const [assignTarget, setAssignTarget] = useState<{ id: string; name: string } | null>(null);

    // Load students once
    useEffect(() => {
        userService.getUsers({ role: 'student' } as never)
            .then(all => setStudents(all.filter(u => u.role === 'student')))
            .catch(console.error);
    }, []);

    const handleLogout = async () => {
        try { await AuthService.logout(); navigate('/login'); }
        catch (err) { console.error('Logout failed:', err); }
    };

    const handleReportIssue = (assetId: string) => navigate(`/report-issue/${assetId}`);

    const handleAssign = useCallback((assetId: string, student: User) => {
        const asset = locationAssets.find(a => a.id === assetId);
        setAssignments(prev => {
            const filtered = prev.filter(a => a.assetId !== assetId);
            return [...filtered, {
                assetId,
                assetName: asset?.name ?? assetId,
                student,
                assignedAt: new Date(),
            }];
        });
    }, [locationAssets]);

    const handleUnassign = useCallback((assetId: string) => {
        setAssignments(prev => prev.filter(a => a.assetId !== assetId));
    }, []);

    return (
        <DashboardLayout activePage="facilitator-dashboard" showBackground={false}>
            <FacilitatorHeader
                title="Facilitator Dashboard"
                subtitle="Monitor your assigned inventory and manage student asset allocation."
                userName={user?.displayName}
                userEmail={user?.email}
                onLogout={handleLogout}
            />

            <AssetStatsGrid />

            <div className="facilitator-dashboard-content">

                {/* ── Students Assigned to Assets ── */}
                <div className="facilitator-section">
                    <div className="section-header">
                        <div>
                            <h3>Students Assigned to Assets</h3>
                            <p className="section-sub">Manage which student has each asset checked out.</p>
                        </div>
                        <button
                            className="fac-assign-new-btn"
                            onClick={() => {
                                // pick the first unassigned asset as default
                                const unassigned = locationAssets.find(
                                    a => !assignments.some(x => x.assetId === a.id),
                                );
                                if (unassigned) setAssignTarget({ id: unassigned.id, name: unassigned.name });
                                else if (locationAssets[0]) setAssignTarget({ id: locationAssets[0].id, name: locationAssets[0].name });
                            }}
                            type="button"
                        >
                            <span className="material-icons">person_add</span>
                            Assign Student
                        </button>
                    </div>

                    <AssignedStudentsTable
                        assignments={assignments}
                        onAssign={setAssignTarget}
                        onUnassign={handleUnassign}
                    />
                </div>

                {/* ── My Assigned Assets ── */}
                <div className="facilitator-section">
                    <div className="section-header">
                        <h3>My Assigned Assets</h3>
                        <div className="search-container">
                            <input
                                type="text"
                                id="search-my-assets"
                                name="searchMyAssets"
                                placeholder="Search my assets…"
                                className="search-input"
                            />
                        </div>
                    </div>
                    <MyAssetsTable onReportIssue={handleReportIssue} />
                </div>

                {/* ── Location / Office Assets ── */}
                <div className="facilitator-section">
                    <div className="section-header">
                        <h3>Location / Office Assets</h3>
                        <div className="search-container">
                            <input
                                type="text"
                                id="search-office-assets"
                                name="searchOfficeAssets"
                                placeholder="Search office equipment…"
                                className="search-input"
                            />
                        </div>
                    </div>
                    <LocationAssetsTable onReportIssue={handleReportIssue} />
                </div>
            </div>

            {/* ── Assign Student Modal ── */}
            <AssignStudentModal
                asset={assignTarget}
                students={students}
                onAssign={handleAssign}
                onClose={() => setAssignTarget(null)}
            />
        </DashboardLayout>
    );
};