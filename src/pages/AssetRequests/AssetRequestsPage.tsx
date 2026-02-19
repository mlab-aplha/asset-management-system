import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AssetRequestsTable } from '../../features/facilitator_features/AssetRequestsTable';

export const AssetRequestsPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <DashboardLayout activePage="asset-requests">
            <div style={{ padding: '20px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    marginBottom: '10px' 
                }}>
                    <button 
                        onClick={handleLogout}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            fontSize: '14px',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            fontFamily: 'Arial, sans-serif'
                        }}
                    >
                        Logout
                    </button>
                </div>
                <AssetRequestsTable />
            </div>
        </DashboardLayout>
    );
};
