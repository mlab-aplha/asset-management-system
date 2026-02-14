import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FacilitatorHeader } from '../../features/facilitator_features/FacilitatorHeader';
import { AssetStatsGrid } from '../../features/facilitator_features/AssetStatsGrid';
import { MyAssetsTable } from '../../features/facilitator_features/MyAssetsTable';
import { LocationAssetsTable } from '../../features/facilitator_features/LocationAssetsTable';

export const FacilitatorDashboardPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleReportIssue = (assetId: string) => {
        navigate(`/report-issue/${assetId}`);
    };

    return (
        <DashboardLayout activePage="facilitator-dashboard" showBackground={false}>
            <FacilitatorHeader
                title="Facilitator Asset & Location Lists"
                subtitle="Monitor your assigned inventory and manage assets at your primary site."
                onLogout={handleLogout}
            />

            <AssetStatsGrid />

            <div className="facilitator-dashboard-content">
                <div className="facilitator-section">
                    <div className="section-header">
                        <h3>My Assigned Assets</h3>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search my assets..."
                                className="search-input"
                            />
                        </div>
                    </div>
                    <MyAssetsTable onReportIssue={handleReportIssue} />
                </div>


                <div className="facilitator-section">
                    <div className="section-header">
                        <h3>Location/Office Assets</h3>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search office equipment..."
                                className="search-input"
                            />
                        </div>
                    </div>
                    <LocationAssetsTable onReportIssue={handleReportIssue} />
                </div>
            </div>
        </DashboardLayout>
    );
};