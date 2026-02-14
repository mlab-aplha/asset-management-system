// src/pages/dashboard/DashboardPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardHeader } from '../../features/adin_features/Dashboard';
import { StatsGrid } from '../../features/adin_features/StatsGrid';
import { ChartSection } from '../../features/adin_features/ChartSection';
import { RequestsSection } from '../../features/adin_features/RequestsSection';
import { ActivitySection } from '../../features/adin_features/ActivitySection';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Add these handlers
    const handleViewAllRequests = () => {
        navigate('/admin/requests');
    };

    const handleApproveRequest = (requestId: string) => {
        navigate(`/admin/requests/${requestId}/approve`);
    };

    const handleRejectRequest = (requestId: string) => {
        navigate(`/admin/requests/${requestId}/reject`);
    };

    return (
        <DashboardLayout activePage="dashboard">
            <DashboardHeader
                title="Advanced Analytics"
                subtitle="Mlab Regional Portfolio"
                onLogout={handleLogout}
            />

            <StatsGrid />

            <div className="dashboard-content-grid">
                <ChartSection />

                <div className="dashboard-right-sidebar">
                    <RequestsSection
                        onViewAll={handleViewAllRequests}
                        onApprove={handleApproveRequest}
                        onReject={handleRejectRequest}
                    />
                    <ActivitySection />
                </div>
            </div>
        </DashboardLayout>
    );
};