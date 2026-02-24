// src/features/facilitator_features/FacilitatorHeader.tsx
import React from 'react';
import { Button } from '../../components/ui/Button';
import './facilitator-styles.css';

interface FacilitatorHeaderProps {
    title: string;
    subtitle: string;
    userName?: string;  // Add this
    userEmail?: string; // Add this
    onLogout?: () => void;
}

export const FacilitatorHeader: React.FC<FacilitatorHeaderProps> = ({
    title,
    subtitle,
    userName,
    userEmail,
    onLogout
}) => {
    return (
        <header className="facilitator-header">
            <div className="facilitator-header-left">
                <h2 className="facilitator-title">{title}</h2>
                <p className="facilitator-subtitle">{subtitle}</p>
                {/* Optional: Show user info */}
                {(userName || userEmail) && (
                    <div className="facilitator-user-info">
                        {userName && <span className="user-name">{userName}</span>}
                        {userEmail && <span className="user-email">{userEmail}</span>}
                    </div>
                )}
            </div>
            <div className="facilitator-header-actions">
                <Button
                    icon="logout"
                    variant="danger"
                    onClick={onLogout}
                    className="facilitator-action-btn logout-btn"
                >
                    Logout
                </Button>
            </div>
        </header>
    );
};