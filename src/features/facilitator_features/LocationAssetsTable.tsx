// src/features/facilitator_features/LocationAssetsTable.tsx
import React from 'react';
import { Button } from '../../components/ui/Button';
import { useFacilitatorAssets } from '../../hooks/useFacilitatorAssets';
import './facilitator-styles.css';

interface LocationAssetsTableProps {
    onReportIssue: (assetId: string) => void;
}

export const LocationAssetsTable: React.FC<LocationAssetsTableProps> = ({ onReportIssue }) => {
    const { locationAssets, loading, error } = useFacilitatorAssets();

    if (loading) {
        return <div className="loading-state">Loading location assets...</div>;
    }

    if (error) {
        return <div className="error-state">Error loading assets: {error}</div>;
    }

    if (locationAssets.length === 0) {
        return (
            <div className="empty-state">
                <span className="material-icons">location_on</span>
                <p>No assets found at your locations</p>
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
                    <div className="table-cell">LOCATION</div>
                    <div className="table-cell">STATUS</div>
                    <div className="table-cell">ACTIONS</div>
                </div>
            </div>

            <div className="table-body">
                {locationAssets.map((asset) => (
                    <div key={asset.id} className="table-row">
                        <div className="table-cell asset-icon">
                            <span className="material-icons">
                                {asset.name.toLowerCase().includes('laptop') ? 'laptop' :
                                    asset.name.toLowerCase().includes('camera') ? 'videocam' :
                                        asset.name.toLowerCase().includes('printer') ? 'print' :
                                            'devices_other'}
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
                            <div className="location-code">{asset.locationCode}</div>
                        </div>
                        <div className="table-cell">
                            <span className={`status-badge ${asset.status}`}>
                                {asset.status}
                            </span>
                        </div>
                        <div className="table-cell actions">
                            <Button
                                variant="outline"
                                size="sm"
                                icon="visibility"
                                onClick={() => onReportIssue(asset.id)}
                            >
                                View
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};