// src/features/facilitator_features/MyAssetsTable.tsx
import React from 'react';
import { Button } from '../../components/ui/Button';
import { useFacilitatorAssets } from '../../hooks/useFacilitatorAssets';
import './facilitator-styles.css';
interface MyAssetsTableProps {
    onReportIssue: (assetId: string) => void;
}

export const MyAssetsTable: React.FC<MyAssetsTableProps> = ({ onReportIssue }) => {
    const { myAssets, loading, error } = useFacilitatorAssets();

    if (loading) {
        return <div className="loading-state">Loading your assets...</div>;
    }

    if (error) {
        return <div className="error-state">Error loading assets: {error}</div>;
    }

    if (myAssets.length === 0) {
        return (
            <div className="empty-state">
                <span className="material-icons">inventory</span>
                <p>No assets assigned to you yet</p>
            </div>
        );
    }

    return (
        <div className="assets-table">
            <div className="table-header">
                <div className="table-row header-row">
                    <div className="table-cell">ASSET</div>
                    <div className="table-cell">ASSET NAME</div>
                    <div className="table-cell">SERIAL</div>
                    <div className="table-cell">NUMBER</div>
                    <div className="table-cell">CURRENT LOCATION</div>
                    <div className="table-cell">DATE</div>
                    <div className="table-cell">ASSIGNED</div>
                    <div className="table-cell">ACTIONS</div>
                </div>
            </div>

            <div className="table-body">
                {myAssets.map((asset) => (
                    <div key={asset.id} className="table-row">
                        <div className="table-cell asset-icon">
                            <span className="material-icons">
                                {asset.name.toLowerCase().includes('laptop') ? 'laptop' :
                                    asset.name.toLowerCase().includes('camera') ? 'videocam' :
                                        asset.name.toLowerCase().includes('printer') ? 'print' :
                                            'devices'}
                            </span>
                        </div>
                        <div className="table-cell asset-info">
                            <div className="asset-name">{asset.name}</div>
                            <div className="asset-details">{asset.brand}</div>
                        </div>
                        <div className="table-cell serial-number">
                            {asset.serialNumber}
                        </div>
                        <div className="table-cell asset-number">
                            {asset.assetNumber}
                        </div>
                        <div className="table-cell location">
                            <div className="location-name">{asset.location}</div>
                            {asset.locationCode && (
                                <div className="location-code">{asset.locationCode}</div>
                            )}
                        </div>
                        <div className="table-cell date">{asset.assignedDate}</div>
                        <div className="table-cell assigned-to">{asset.assignedTo}</div>
                        <div className="table-cell actions">
                            <Button
                                variant="outline"
                                size="sm"
                                icon="report"
                                onClick={() => onReportIssue(asset.id)}
                            >
                                Report Issue
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};