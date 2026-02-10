import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardHeader } from '../../features/adin_features/Dashboard';
import { StatsGrid } from '../../features/adin_features/StatsGrid';
import { ChartSection } from '../../features/adin_features/ChartSection';
import { AlertsSection } from '../../features/adin_features/AlertsSection';
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

    const handleNavigation = (path: string) => {
        navigate(path);
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
                    <AlertsSection onViewAll={() => handleNavigation('/alerts')} />
                    <ActivitySection />
                </div>
            </div>
        </DashboardLayout>
    );
};