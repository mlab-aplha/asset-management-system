import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AssetRequestsHeader } from './AssetRequestsHeader';
import { AssetSearchFilters } from './AssetSearchFilters';
import { AssetRequestsTable } from './AssetRequestsTable';
import './asset-requests-styles.css';

export const AssetRequestsPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleRequestAsset = (assetId: string) => {
        // Logic to request asset
        console.log(`Requesting asset: ${assetId}`);
        // Could show a modal or navigate to request form
    };

    const handleViewAssetDetails = (assetId: string) => {
        navigate(`/assets/${assetId}`);
    };

    return (
        <DashboardLayout activePage="asset-requests" showBackground={false}>
            <AssetRequestsHeader
                title="Asset Requests"
                subtitle="Browse and request equipment for your projects"
                onLogout={handleLogout}
            />

            <AssetSearchFilters />

            <div className="asset-requests-content">
                <AssetRequestsTable
                    onRequestAsset={handleRequestAsset}
                    onViewDetails={handleViewAssetDetails}
                />
            </div>
        </DashboardLayout>
    );
};