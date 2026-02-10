import React from 'react';
import { Sidebar } from './Sidebar';
import './layout.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activePage?: string;
    showBackground?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    activePage = 'dashboard',
    showBackground = true
}) => {
    return (
        <div className="dashboard-page">
            {showBackground && (
                <div className="dashboard-background">
                    <svg className="dashboard-svg" viewBox="0 0 1000 800">
                        <path
                            d="M400,100 L600,100 L800,300 L800,600 L600,750 L200,750 L100,600 L100,300 Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                        />
                    </svg>
                </div>
            )}

            <Sidebar activePage={activePage} />

            <main className="dashboard-main">
                {children}
            </main>
        </div>
    );
};