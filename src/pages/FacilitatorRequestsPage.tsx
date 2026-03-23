import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAssets } from '../hooks/useAssets';
 

export const FacilitatorRequestsPage: React.FC = () => {
    const { assets, loading: assetsLoading, fetchAssets } = useAssets();
    const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const availableAssets = assets.filter(asset => asset.status === 'available');

    const handleRequestAsset = (asset: any) => {
        setSelectedAsset(asset);
        setShowRequestForm(true);
    };

    const handleSubmitRequest = () => {
        alert(`Request for ${selectedAsset?.name} submitted!`);
        setShowRequestForm(false);
        setSelectedAsset(null);
    };

    return (
        <DashboardLayout activePage="facilitator-requests">
            <div className="facilitator-requests-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            {activeTab === 'all' ? 'Available Assets' : 'My Requests'}
                        </h1>
                        <p className="page-subtitle">
                            {activeTab === 'all' ? 'Browse and request available assets' : 'View your submitted requests'}
                        </p>
                    </div>
                </div>

                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Available Assets ({availableAssets.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mine')}
                    >
                        My Requests (0)
                    </button>
                </div>

                {assetsLoading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Asset Name</th>
                                    <th>Asset ID</th>
                                    <th>Type</th>
                                    <th>Location</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableAssets.map(asset => (
                                    <tr key={asset.id}>
                                        <td>{asset.name} </td>
                                        <td className="student-id">{asset.assetId || asset.id.substring(0, 8)} </td>
                                        <td>{asset.type || '—'} </td>
                                        <td>{asset.currentLocationId || 'Not specified'} </td>
                                        <td>
                                            <button
                                                className="request-btn"
                                                onClick={() => handleRequestAsset(asset)}
                                            >
                                                Request
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {availableAssets.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="empty-state">No available assets found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showRequestForm && selectedAsset && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Request Asset</h2>
                                <button className="modal-close" onClick={() => setShowRequestForm(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Asset:</strong> {selectedAsset.name}</p>
                                <p><strong>Asset ID:</strong> {selectedAsset.assetId || selectedAsset.id.substring(0, 8)}</p>
                                <p>Are you sure you want to request this asset?</p>
                            </div>
                            <div className="modal-actions">
                                <button className="cancel-btn" onClick={() => setShowRequestForm(false)}>Cancel</button>
                                <button className="submit-btn" onClick={handleSubmitRequest}>Submit Request</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .facilitator-requests-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    background: #00182d;
                    min-height: 100vh;
                }
                .page-header {
                    margin-bottom: 2rem;
                }
                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                }
                .page-subtitle {
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0.5rem 0 0 0;
                    font-size: 0.875rem;
                }
                .tabs-container {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .tab {
                    padding: 0.75rem 1.5rem;
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    font-size: 1rem;
                }
                .tab.active {
                    color: #94c73d;
                    border-bottom: 2px solid #94c73d;
                }
                .table-container {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    overflow-x: auto;
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th {
                    text-align: left;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    color: rgba(255, 255, 255, 0.7);
                    font-weight: 600;
                }
                .data-table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .student-id {
                    font-family: monospace;
                    color: #94c73d;
                }
                .request-btn {
                    padding: 0.25rem 0.75rem;
                    background: rgba(148, 199, 61, 0.2);
                    border: 1px solid rgba(148, 199, 61, 0.3);
                    border-radius: 0.25rem;
                    color: #94c73d;
                    cursor: pointer;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: #00182d;
                    border-radius: 1rem;
                    width: 90%;
                    max-width: 500px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .modal-header h2 {
                    color: white;
                    margin: 0;
                }
                .modal-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .modal-body {
                    padding: 1.5rem;
                    color: white;
                }
                .modal-actions {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                .cancel-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.375rem;
                    color: white;
                    cursor: pointer;
                }
                .submit-btn {
                    padding: 0.5rem 1rem;
                    background: #94c73d;
                    border: none;
                    border-radius: 0.375rem;
                    color: white;
                    cursor: pointer;
                }
                .loading-state, .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: rgba(255, 255, 255, 0.6);
                }
            `}</style>
        </DashboardLayout>
    );
};
