import React from 'react';
import { Button } from '../../components/ui/Button';
import './facilitator-styles.css';

interface FacilitatorHeaderProps {
    title: string;
    subtitle: string;
    onLogout?: () => void;
}

export const FacilitatorHeader: React.FC<FacilitatorHeaderProps> = ({
    title,
    subtitle,
    onLogout
}) => {
    return (
        <header className="facilitator-header">
            <div className="facilitator-header-left">
                <h2 className="facilitator-title">{title}</h2>
                <p className="facilitator-subtitle">{subtitle}</p>
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