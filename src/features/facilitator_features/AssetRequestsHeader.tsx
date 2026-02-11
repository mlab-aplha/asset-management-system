import React from 'react';
import { Button } from '../../components/ui/Button';
import './asset-requests-styles.css';

interface AssetRequestsHeaderProps {
    title: string;
    subtitle: string;
    onLogout?: () => void;
}

export const AssetRequestsHeader: React.FC<AssetRequestsHeaderProps> = ({
    title,
    subtitle,
    onLogout
}) => {
    return (
        <header className="asset-requests-header">
            <div className="asset-requests-header-left">
                <h2 className="asset-requests-title">{title}</h2>
                <p className="asset-requests-subtitle">{subtitle}</p>
            </div>
            <div className="asset-requests-header-actions">
                <Button
                    icon="logout"
                    variant="danger"
                    onClick={onLogout}
                    className="asset-requests-action-btn logout-btn"
                >
                    Logout
                </Button>
            </div>
        </header>
    );
};