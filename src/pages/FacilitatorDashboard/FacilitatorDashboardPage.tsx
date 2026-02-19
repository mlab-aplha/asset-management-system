import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FacilitatorHeader } from '../../features/facilitator_features/FacilitatorHeader';
import { MyAssetsTable } from '../../features/facilitator_features/MyAssetsTable';
import { LocationAssetsTable } from '../../features/facilitator_features/LocationAssetsTable';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../backend-firebase/src/firebase/config';
import './facilitator-dashboard.css';

export const FacilitatorDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [stats, setStats] = useState({
        assigned: 0,
        inProgress: 0,
        completed: 0
    });
    
    const [missionItems, setMissionItems] = useState([
        { id: '1', label: 'Assets not yet approved', checked: false },
        { id: '2', label: 'Assets pending review', checked: false },
        { id: '3', label: 'Assets reviewed', checked: false }
    ]);

    // Fetch real stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            
            try {
                const assetsQuery = query(
                    collection(db, 'assets'),
                    where('assignedTo', '==', user.uid)
                );
                const snapshot = await getDocs(assetsQuery);
                const assets = snapshot.docs.map(doc => doc.data());
                
                setStats({
                    assigned: assets.length,
                    inProgress: assets.filter(a => a.status === 'In Use').length,
                    completed: assets.filter(a => a.status === 'Returned').length
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const handleReportIssue = (assetId?: string) => {
        if (assetId) {
            navigate(`/report-issue/${assetId}`);
        } else {
            navigate('/report-issue');
        }
    };

    const handleCheckboxChange = (id: string) => {
        setMissionItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleSubmitReport = () => {
        const checkedCount = missionItems.filter(item => item.checked).length;
        alert(`Weekly report submitted! ${checkedCount} of 3 tasks completed.`);
    };

    const handleViewAssetRequests = () => {
        navigate('/asset-requests');
    };

    const progress = Math.round((missionItems.filter(i => i.checked).length / missionItems.length) * 100);

    return (
        <DashboardLayout activePage="facilitator-dashboard" showBackground={false}>
            <FacilitatorHeader
                title="Facilitator Dashboard"
                subtitle="Monitor your assigned inventory and manage assets"
                onLogout={handleLogout}
            />

            {/* Stats Cards */}
            <div className="facilitator-stats-grid">
                <div className="facilitator-stat-card">
                    <div className="facilitator-stat-value">{stats.assigned}</div>
                    <div className="facilitator-stat-label">My assigned assets</div>
                </div>
                <div className="facilitator-stat-card">
                    <div className="facilitator-stat-value">{stats.inProgress}</div>
                    <div className="facilitator-stat-label">Assets in progress</div>
                </div>
                <div className="facilitator-stat-card">
                    <div className="facilitator-stat-value">{stats.completed}</div>
                    <div className="facilitator-stat-label">Assets completed</div>
                </div>
            </div>

            {/* Report Asset Issue Button */}
            <div className="facilitator-report-section">
                <button className="facilitator-report-button" onClick={() => handleReportIssue()}>
                    Report Asset Issue
                </button>
                <button className="facilitator-view-requests" onClick={handleViewAssetRequests}>
                    View Asset Requests
                </button>
            </div>

            {/* My Assigned Assets Section */}
            <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
                <h3 style={{ marginBottom: '20px' }}>📋 My Assigned Assets</h3>
                <MyAssetsTable onReportIssue={handleReportIssue} />
            </div>

            {/* Location Assets Section */}
            <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
                <h3 style={{ marginBottom: '20px' }}>📍 Location Assets</h3>
                <LocationAssetsTable />
            </div>

            {/* Mission Prompt */}
            <div className="facilitator-mission-section">
                <h3 className="facilitator-mission-title">MISSION PROMPT: {progress}%</h3>
                <div className="facilitator-mission-list">
                    {missionItems.map(item => (
                        <div key={item.id} className="facilitator-mission-item">
                            <input
                                type="checkbox"
                                id={item.id}
                                checked={item.checked}
                                onChange={() => handleCheckboxChange(item.id)}
                                className="facilitator-mission-checkbox"
                            />
                            <label htmlFor={item.id} className="facilitator-mission-label">
                                {item.label}
                            </label>
                        </div>
                    ))}
                </div>
                <button className="facilitator-submit-report" onClick={handleSubmitReport}>
                    Submit Report
                </button>
            </div>
        </DashboardLayout>
    );
};
